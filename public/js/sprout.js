console.log("!!! sprout.js loaded !!!")

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"

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

const app = initializeApp(firebaseConfig);  //Initialize Firebase
const auth = getAuth(app);                  //Init Firebase Auth + get a reference to the service
const storage = getStorage(app);

const db = getFirestore(app);
const users = collection(db, 'users');

let activeUserUID = null;    // uid for active user (filled in when auth state changes)
let userRef = null;   // doc ref for user in users
let userData = null;  // actual doc in DB users
let userDisplay = null;
let userPhoto = null;

//Applies to anything with the ID "signOutButton" -- ensure HTML is meeting this requirement to retain user sign out ability
const signOutButton = document.querySelector("#signOutButton");


const fetchUser = async () => {
    try {
        const userRef = doc(db, 'users', activeUserUID);
        const getUser = (await getDoc(userRef)).data();

        var userStr = JSON.stringify(getUser, null, 4);
        //console.log("User data = " + userStr);

        return getUser;
    } catch (error) {
        console.log(error);
        alert("Unable to authenticate user. Please contact administrator.");
    }
    return false;
}

const checkAuthState = async () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            
            user.providerData.forEach((profile) => {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                userDisplay = profile.displayName;
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);
                userPhoto = profile.photoURL;
            });
            
            if(document.getElementById("userprofile_name") != null && document.getElementById("userprofile_image_src") != null){
                document.getElementById("userprofile_name").textContent = user.displayName;
                document.getElementById("userprofile_image_src").src = user.photoURL;
            }
        }
        else {
            //Any code put here will impact sign in pages, so be careful
            //For example: do not put an alert that there is no user here,
            //it will cause an error with sign in
        }
    })
}

const userSignOut = async () => {
    await signOut(auth);
}

checkAuthState();

if(document.getElementById("signOutButton") != null){
    signOutButton.addEventListener('click', userSignOut);
}