import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js"

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

const auth = getAuth();

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

/*
  Testing if the user exists first
*/
function checkIfUserExists(username) {
  const docRef = doc(users, username);
  getDoc(docRef)
    .then((docSnapshot) => {
      if (docSnapshot.exists()) {
        console.log('Document exists:', docSnapshot.data());
        return true;
      } else {
        console.log('Document does not exist.');
        return false;
      }
    })
    .catch((error) => {
      console.error('Error checking document existence: ', error);
      return false;
    });
}



document.getElementById("main_form").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    //var username = document.getElementById("username").value;
    var email = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    //const docRef = doc(db, 'users', username.toString());
    //const userPage = await(getDoc(docRef));
    
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
