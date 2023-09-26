import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
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
const newUserRequest = collection(db, 'new_user_requests');
const users = collection(db, 'users');
const auth = getAuth(app);

const user = await auth.currentUser;

if (user !== null) {
  user.providerData.forEach((profile) => {
    console.log("Sign-in provider: " + profile.providerId);
    console.log("  Provider-specific UID: " + profile.uid);
    console.log("  Name: " + profile.displayName);
    console.log("  Email: " + profile.email);
    console.log("  Photo URL: " + profile.photoURL);
  });
}

async function fetchUser(){
    try{
        uid = uid.toString();
        const userRef = doc(db, 'users', uid);
        const getUser = await getDoc(userRef);
        
        var userStr = JSON.stringify(getUser, null, 4);
        console.log("User data = " + userStr);
        
        return getUser;
    } catch(error) {
        console.log(error);
        alert("Unable to authenticate user. Please contact administrator.");
    }
    return false;
}


document.addEventListener("DOMContentLoaded", async function () {
    if (user) {
        console.log("User is signed in"); 
        const userProfile = await fetchUser(user.uid);
        console.log(String(userProfile.firstName + " " + userProfile.lastName));
        document.getElementById("userprofile_name").textContent = String(userProfile.firstName + " " + userProfile.lastName);
        document.getElementById("userprofile_image_src").src = String(userProfile.avatar);
        console.log("User role is " + userProfile.role);
    } else {
        console.log("No user is signed in.");
        
    }
});


