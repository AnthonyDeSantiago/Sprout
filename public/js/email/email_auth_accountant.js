/* import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

const firebaseConfig = initializeApp({
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
}); */
console.log("!!! email_auth_accountant.js loaded !!!");

import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let username = null;
let userDisplay = null;
let userEmail = null;
let userData = null;
let userRole = null;

const db = getFirestore();
const users_db = collection(db, 'users');
let currentUser = "YOUR_USER_NAME"; // You can replace this later

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = await userData.username;

            console.log("Current user authenticated: " + username);

            await initializePage();
        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
        userRole = userData.username;
        /* console.log("yoyo", userRole); */
    })
}

async function initializePage() {
    console.log("hit initialize page");
    await populateEmailsDropdown();
}

async function getUserList() {
    console.log("hit pop user list");
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('approved', '==', true), where('role', 'in', ['admin', 'manager']));

    try {
        const querySnapshot = await getDocs(usersQuery);
        const usersList = [];
        querySnapshot.forEach((doc) => {
            let fullName = doc.data().firstName + " " + doc.data().lastName;
            let email = "<" + doc.data().userEmail + ">";
            let role = "[" + doc.data().role + "]";
            let userEntry = fullName + " " + email + " " + role;
            usersList.push(userEntry);
        });
        return usersList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function populateEmailsDropdown() {
    console.log("hit pop emails dropdown");
    const users = await getUserList();
    const userSelect = document.getElementById('userSelect');
    users.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        userSelect.appendChild(option);
    });

}


//Accountant email template
const formbutton2 = document.querySelector('.acc-btn');

formbutton2.onclick = () => {
    var params = {
        name: document.getElementById('userSelect').value.substr(0, document.getElementById('userSelect').value.indexOf('<') - 1),
        role: userRole,
        message: document.getElementById('mess2').value,
    };

    console.log("params.name = " + params.name);

    emailjs.send('service_9bu3nfr', 'template_0qdo9gb', params)
        .then(
            res => {
                    document.getElementById("userSelect").value = "",
                    userRole = "",
                    document.getElementById("mess2").value = "",
                    console.log.apply(res)
                alert("message sent sucessfully");
            })
        .catch((err) => console.log(err));


}

checkAuthState();