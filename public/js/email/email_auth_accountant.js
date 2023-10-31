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

import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "./sprout.js"

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let username = null;
let userDisplay = null;
let userEmail = null;
let userData = null;

const db = getFirestore();
const users_db = collection(db, 'users');
let currentUser = "YOUR_USER_NAME"; // You can replace this later

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;

            await initializePage();

        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}

async function initializePage() {
    await initializeTransactionEntries();
    await populateEmailsDropdown();
}

async function getUserList() {
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('approved', '==', true), where('role', 'in', ['admin', 'manager']));

    try {
        const querySnapshot = await getDocs(usersQuery);
        const usersList = [];
        querySnapshot.forEach((doc) => {
            fullName = doc.data().firstName + " " + doc.data().lastName;
            email = "<" + doc.data().email + ">";
            userEntry = fullName + " " + email; 
            usersList.push(userEntry);
        });
        return usersList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function populateEmailsDropdown() {
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

formbutton2.onclick = ()=> {
        var params = {
            name: document.getElementById('roleSelect').substr(0, document.getElementById('roleSelect').indexOf('<')-1),
            //email: document.getElementById('roleSelect').substr(document.getElementById('roleSelect').indexOf('<')+1, document.getElementById('roleSelect').indexOf('>')-1),
            message: document.getElementById('mess2').value,
        };

    
    emailjs.send('service_9bu3nfr','template_7fwsavt',params)
    .then(
        res =>{
            document.getElementById("roleSelect").value = "",
            /* document.getElementById("email").value = "", */
            document.getElementById("mess2").value = "",
            console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch ((err) => console.log(err));
    

}








