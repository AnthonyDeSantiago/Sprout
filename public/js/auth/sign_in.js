console.log("!!! signin.js has loaded !!!");

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

const auth = getAuth();

const db = getFirestore();
const users = collection(db, 'users');

//initialize user database/auth items
let userDB = null;    // array copy of user
let userRef = null;   // doc ref for user in users
let userData = null;  // actual doc in DB users

function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "form-control error";
  const small = formControl.querySelector('small');
  small.innerText = message
}

function hideError(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control";
}

async function fetchUser(username) {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size === 0) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching the user.");
    return null;
  }
}

document.addEventListener('keydown', function (event) {
  const passwordElement = document.getElementById("password");
  const userNameElement = document.getElementById("username");
  hideError(passwordElement);
  hideError(userNameElement);
});

const userSignIn = async (e) => {
  e.preventDefault();

  const passwordElement = document.getElementById("password");
  const userNameElement = document.getElementById("username");

  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  /**Duct Tape for error handling: Do it better later */
  if (username == '') {
    var errorMessage = "Please enter a username.";
    showError(userNameElement, errorMessage);
    if (password == '') {
      errorMessage = "Please enter a password.";
      showError(passwordElement, errorMessage);
    }
    return false;
  }

  userDB = await fetchUser(username);

  if (userDB == null) {
    var errorMessage = "Username does not exist.";
    showError(userNameElement, errorMessage);
    return false;
  } else if (userDB.suspended) {        //Check if user is suspended
    alert("Acount suspended. Please Contact Admin.");
    console.log("User is suspended!");
    return false;
  }

  userRef = doc(db, 'users', userDB.id);
  userData = (await getDoc(userRef)).data();

  signInWithEmailAndPassword(auth, userDB.userEmail, password)
    .then((userCredential) => {
      const user = userCredential.user;

      //sign in successful - update failed sign in counter to 0
      updateDoc(userRef, { failedPasswordAttempts: 0 })
        .then(() => {
          console.log('failedPasswordAttempts has been reset');
        })

      const uid = user.uid;
      //Test to see if user is actually logged in, re-pulling user from database
      if (uid == userDB.id) {
        alert("You have signed in successfully!");
        console.log("User.id = " + userDB.id);
        console.log("UID = " + uid);
      } else {
        alert("There has been an error with your credentials. Please try again later, or contact the admin if this issue persists.");
        return false;
      }

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("ERROR WITH SIGN IN: " + errorCode + " | " + errorMessage);
      if (String(errorCode) == "auth/missing-password") {      //MISSING_PASSWORD
        showError(passwordElement, "Please enter a password.");
        return false;
      }
      if (errorCode == "auth/wrong-password") {    //INVALID_PASSWORD
        showError(passwordElement, "Password entered is incorrect.");
        incorrectPasswordAttempt(userRef, userData);
        return false;
      }
      if (errorCode == "auth/invalid-email") {         //INVALID_EMAIL
        showError(passwordElement, "Credentials entered are incorrect.");
        return false;
      }
      return false;
    })
  return true;
}

async function incorrectPasswordAttempt(docRef, docData) {
  console.log("Passwords did not match!!");

  var errorMessage = "Password is incorrect!";
  showError(passwordElement, errorMessage);

  if (!docData.hasOwnProperty('failedPasswordAttempts')) {
    // The 'failedPasswordAttempts' field doesn't exist, so initialize it to 0
    await updateDoc(docRef, { failedPasswordAttempts: 0 });
    console.log("Adding the failed attempts field if it's not already there");
  }

  const updatedFailedPasswordAttempts = (docData.failedPasswordAttempts || 0) + 1;
  var updateData = { failedPasswordAttempts: updatedFailedPasswordAttempts };

  if (updateData.failedPasswordAttempts >= 3) {
    //Suspend the user aka turn db.suspended = true
    updateDoc(docRef, { suspended: true })
      .then(() => {
        errorMessage = "3 Failed Attempts: Account Suspended";
        showError(passwordElement, errorMessage);
        console.log('User is now suspended!');
      })
  } else {
    // Update the number of incorrect attempts on the db
    updateDoc(docRef, updateData)
      .then(() => {
        console.log('Updated the attemps successfully.');
      })
      .catch((error) => {
        console.error('There was an error updating the attemps: ', error);
      });
  }
}

const checkAuthState = async () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      const uid = user.uid;

      if (userData != null) {
        // Check if the user is deleted based on custom claims
        user.getIdTokenResult().then((idTokenResult) => {
          if (idTokenResult.claims.deleted) {
            // User is deleted, handle accordingly (e.g., show error message or sign them out)
            console.log("User account has been deleted.");
            // Redirect to a deleted account page or show an error message
            // window.location.href = 'deleted_account.html';
            return;
          }

          // Check user role and redirect accordingly
          if (userData.role == "admin") {
            console.log("User is an admin.");
            window.location.href = 'admin_home.html';
          } else if (userData.role == "manager" || userData.role == "regular") {
            console.log("User is a manager or regular user/accountant.");
            window.location.href = 'user_home.html';
          } else {
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
          }
        });
      }
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}

checkAuthState();

document.getElementById("main_form").addEventListener('submit', userSignIn);