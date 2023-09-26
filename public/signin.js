import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, updateDoc, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    databaseURL: "https://sprout-financials-default-rtdb.firebaseio.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const users = collection(db, 'users')

const auth = getAuth(app);

console.log("signin.js has loaded!!!");


// setPersistence(auth, browserSessionPersistence)
//   .then(() => {
//     // Existing and future Auth states are now persisted in the current
//     // session only. Closing the window would clear any existing state even
//     // if a user forgets to sign out.
//     // ...
//     // New sign-in will be persisted with session persistence.
//     return signInWithEmailAndPassword(auth, email, password);
//   })
//   .catch((error) => {
//     // Handle Errors here.
//     const errorCode = error.code;
//     const errorMessage = error.message;
//   });



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

document.addEventListener('keydown', function(event) {
  const passwordElement = document.getElementById("password");
  const userNameElement = document.getElementById("username");
  hideError(passwordElement);
  hideError(userNameElement);
});

document.getElementById("main_form").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const passwordElement = document.getElementById("password");
    const userNameElement = document.getElementById("username");


    var username = document.getElementById("username").value;
    var email = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    console.log("username: " + username);

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

    // if (password == '') {
    //   var errorMessage = "Please enter a password.";
    //   showError(passwordElement, errorMessage);
    // }

    // const userQuery = query(users, where('username', '==', username));
    // const userSnapShot = await getDocs(userQuery);

    // if (userSnapShot.empty) {
    //   var errorMessage = "Username does not exist.";
    //       showError(userNameElement, errorMessage);
    //       isValid = false;
    //       return false;
    // }

    // const docRef = userSnapShot.docs[0];
    const user = await fetchUser(username);
    if (user == null) {
      var errorMessage = "Username does not exist.";
      showError(userNameElement, errorMessage);
      return false;
    }
    
    const docRef = doc(db, 'users', user.id);

    // console.log("Has the property: " + userData.hasOwnProperty('failedPasswordAttempts'));

    // if (!userData.hasOwnProperty('failedPasswordAttempts')) {
    //   await updateDoc(docRef, {failedPasswordAttempts: 0});
    //   console.log("adding the failed attempts field if it is not already there");
    // }
    
    
    
    

    var isValid = true;

    //Check if user exists - I don't know how to make it break out of event listener
    // getDoc(docRef)
    //   .then((docSnapshot) => {
    //     if (!docSnapshot.exists()) {
    //       var errorMessage = "Username does not exist.";
    //       showError(userNameElement, errorMessage);
    //       isValid = false;
    //       return false;
    //     }
    //   })

    

    //Validate if password is correct
    if (password != user.password) {
      console.log("Passwords did not match!!");
      console.log("password on db: " + user.password + " typed pswd: " + password);
      
      var errorMessage = "Password is incorrect!";
      showError(passwordElement, errorMessage);

      const docData = (await getDoc(docRef)).data();
      if (!docData.hasOwnProperty('failedPasswordAttempts')) {
        // The 'failedPasswordAttempts' field doesn't exist, so initialize it to 0
        await updateDoc(docRef, { failedPasswordAttempts: 0 });
        console.log("Adding the failed attempts field if it's not already there");
      }

      // Now you can safely update the 'failedPasswordAttempts' field
      const updatedFailedPasswordAttempts = (docData.failedPasswordAttempts || 0) + 1;


      var updateData = {failedPasswordAttempts: updatedFailedPasswordAttempts};
      // if (!docRef.hasOwnProperty('failedPasswordAttempts')) {
      //   await updateDoc(docRef, {failedPasswordAttempts: 0});
      //   console.log("adding the failed attempts field if it is not already there");
      // }

      // var updateData = {failedPasswordAttempts: docRef.failedPasswordAttempts + 1};

      if (updateData.failedPasswordAttempts >= 3) {
        //Suspend the user aka turn db.suspended = true
        updateDoc(docRef, {suspended: true})
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
      
      isValid = false;
      
    } else {
      console.log("The passwords matched");
    }



    //Check if user is suspended
    if (user.suspended) {
      isValid = false;
    } 

    
    //If after a bunch of checks the user sign on is valid, update attempts value
    if (isValid) {
      updateDoc(docRef, {failedPasswordAttempts: 0})
        .then(() => {
          console.log('failedPasswordAttemps has been reset');
        })
    }

    
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log("user signed in");
            // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
});
/*
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log(uid);
        // ...
    } else {
        // User is signed out
        // ...
    }
});


const user = auth.currentUser;

if (user) {
  console.log("User is signed in"); //, see docs for a list of available properties
  // https://firebase.google.com/docs/reference/js/auth.user
  // ...
} else {
  console.log("No user is signed in");
}*/
