console.log("!!! sprout.js loaded !!!")

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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


// Initialize Firebase for all pages
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
const storage = getStorage(app);            //Init Cloud storage + get a reference to the service

// Initiate database references
const db = getFirestore(app);               //Connect to Firestore
const users = collection(db, 'users');      //Users collection

// Active user storage, filled in on auth state change
var userPopulated = false;

let activeUserUID = null;   // uid for active user (filled in when auth state changes)
let userRef = null;         // doc ref for user in users
let userData = null;        // actual doc in DB users
let userDisplay = null;     // user display name (full name)
let userPhoto = null;       // user profile photo
let username = null;        // username
let userEmail = null;       // user e-mail address
let userRole = null;        // user role (admin, manager, regular user)

// Applies to anything with the ID "signOutButton" -- ensure HTML is meeting this requirement to retain user sign out ability
const signOutButton = document.querySelector("#signOutButton");

// Given an e-mail address, fetch user information from the database 
// ----- If user found, returns the data from user document as an 
//       array with UID appended at start
// ----- If user not found, returns null
export async function fetchUserFromEmail(email) {
    try {
        const q = query(collection(db, 'users'), where('userEmail', '==', email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.size === 0) { return null; }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };

    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching the user via email reference.");
        return null;
    }
}

// Given a user auth reference, fetch user information from the database 
// ----- If user found, returns the data from user document as an 
//       array with UID appended at start
// ----- If user not found, returns null
export async function getUserDataWithAuth(user) {
    try {
        user.providerData.forEach((profile) => {
            userDisplay = profile.displayName;
            userEmail = profile.email;
        });

        userData = await fetchUserFromEmail(userEmail);
        return userData;

    } catch (error) {
        console.error(error);
        console.log("An error occurred while fetching the user data after auth.");
        return null;
    }
}

// Given a user auth reference, fetch username from the database 
// ----- If user can be found, returns username
// ----- If user cannot be found, returns null
export async function getUsernameWithAuth(user) {
    try {
        user.providerData.forEach((profile) => {
            userDisplay = profile.displayName;
            userEmail = profile.email;
        });

        userData = await fetchUserFromEmail(userEmail);
        return userData.username;
    } catch (error) {
        console.error(error);
        console.log("An error occurred while fetching the username after auth.");
        return null;
    }
}

// User sign out listner and application
const userSignOut = async () => {
    await signOut(auth).then(() => {
        window.location = "index.html"
      }).catch((error) => {
        // An error happened.
      });
}

if (document.getElementById("signOutButton") != null) {
    signOutButton.addEventListener('click', userSignOut);
}

// When the auth state changes, the user infomration will load in and the appropriate roles view will be displayed
// ----- Auth state has to load in every time you go to a new page,
//       this function waits until it changes (loads in) to run
const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userPopulated = true;   // set userPopulated flag to true

            // Print user information to the console;
            // Fill email, display name, and profile photo fields
            user.providerData.forEach((profile) => {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);

                userEmail = profile.email;
                userDisplay = profile.displayName;
                userPhoto = profile.photoURL;
            });

            // Fill in user profile name and profile picture
            if (document.getElementById("userprofile_name") != null && document.getElementById("userprofile_image_src") != null) {
                document.getElementById("userprofile_name").textContent = user.displayName;
                document.getElementById("userprofile_image_src").src = user.photoURL;
                document.getElementById("userprofile_image_src").style.paddingRight = "7px";
                document.getElementById("userprofile_image_blank").style.display = "none";
            }

            userData = await fetchUserFromEmail(userEmail);
            activeUserUID = userData.id;

            // If @userData has been successfully set, set username
            // ----- Set @userRole, display the correct information on all pages
            // ---------- Requires the use of IDs in the HTML to function correctly
            if (userData != null) {
                username = userData.username;
                userRole = "Sprout User";

                let admin_only = document.getElementById("admin-only");
                let admin_only1 = document.getElementById("admin-only1");
                let admin_only2 = document.getElementById("admin-only2");
                let no_regular = document.getElementById("no-regular");
                let no_regular2 = document.getElementById("no-reg");
                let no_admin = document.getElementById("no-admin");

                switch (userData.role) {
                    case "admin":
                        userRole = "Administrator";
                        console.log(">>> Display mode: administrator");
                        if(no_admin != null){       no_admin.style.display = "none";    }
                        if(no_regular != null){     no_regular.style.display = "";    }
                        if(no_regular2 != null){     no_regular2.style.display = "";    }
                        if(admin_only != null){     admin_only.style.display = "";  }
                        if(admin_only1 != null){    admin_only1.style.display = "";    }
                        if(admin_only2 != null){    admin_only2.style.display = "";    }
                        break;

                    case "manager":
                        userRole = "Manager";
                        console.log(">>> Display mode: manager user");

                        if(no_admin != null){       no_admin.style.display = "";    }
                        if(no_regular != null){     no_regular.style.display = "";    }
                        if(no_regular2 != null){     no_regular2.style.display = "";    }
                        if(admin_only != null){     admin_only.style.display = "none";  }
                        if(admin_only1 != null){    admin_only1.style.display = "none";    }
                        if(admin_only2 != null){    admin_only2.style.display = "none";    }
                        break;

                    case "regular":
                        userRole = "Accountant";
                        console.log(">>> Display mode: regular user");

                        if(no_admin != null){       no_admin.style.display = "";    }
                        if(no_regular != null){     no_regular.style.display = "none";    }
                        if(no_regular2 != null){    no_regular2.style.display = "none";    }
                        if(admin_only != null){     admin_only.style.display = "none";  }
                        if(admin_only1 != null){    admin_only1.style.display = "none";    }
                        if(admin_only2 != null){    admin_only2.style.display = "none";    }
                        break;

                    default:
                        console.log(">>> Display mode unable to be resolved, redirecting to login");
                        if(no_admin != null){       no_admin.style.display = "none";    }
                        if(no_regular != null){     no_regular.style.display = "none";    }
                        if(no_regular2 != null){     no_regular2.style.display = "none";    }
                        if(admin_only != null){     admin_only.style.display = "none";  }
                        if(admin_only1 != null){    admin_only1.style.display = "none";    }
                        if(admin_only2 != null){    admin_only2.style.display = "none";    }

                        alert("Unable to resolve the role associated with your account. Please contact the admin.");
                        signOut(auth);
                        window.location = 'index.html';
                }

                document.getElementById("user-role").textContent = userRole;
            }
        }
        else {
            //Any code put here will impact sign in pages, so be careful
            //For example: do not put an alert that there is no user here,
            //it will cause an error with sign in
        }
    })
}

checkAuthState();

// SUNSETTED --- Flag for if the user is fetchable from the DB (requires activeUserUID to exist);
// ----- if yes, populate @userRef with doc Ref, return doc;
// ----- if no, show alert and return to login
/*const fetchUser = async () => {
    try {
        userRef = doc(db, 'users', activeUserUID);
        const getUser = (await getDoc(userRef)).data();

        //var userStr = JSON.stringify(getUser, null, 4);
        //console.log("User data = " + userStr);

        return getUser;     //return user document
    } catch (error) {
        console.log(error);
        alert("Unable to authenticate user. Please contact administrator.");
        signOut(auth);
        
        window.location = 'index.html';
    }
    return false;
}*/
