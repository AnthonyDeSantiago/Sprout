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

////////////////////////////////////////////////////////////////////////////////////////
// code for emailjs and mailjet if you need it
/* const serviceID = "service_9bu3nfr";
const templateID = "template_fskrd9f"; */

//sending verfication
//flow: user make account -> email request is sent to admin to usertable with user -> admin accept or deny

//for new user (dont know if it work due to firebase error)
/* const button = document.querySelector('.new_user_submit_form'); */
////////////////////////////////////////////////////////////////////////////////////////


//test from contact form !!! CURRENTLY OUTOFCOMMISSION. HAD TO REMOVE TEMPLATE TO MAKE SPACE FOR AN EXTRA CONTACT FORM

/* const button = document.querySelector('.email-btn');

button.onclick = () => {
        //change it to based on the new user value from user create
        var templateParams = {
            //name: document.getElementById('first_name').value,
            //email: document.getElementById('user_email').value,
        };
    
        emailjs.send('service_9bu3nfr', 'template_fskrd9f', templateParams)
        .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        }, function(error) {
        console.log('FAILED...', error);
        });
    
} */

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


//user in dropdown
async function getAccountsList() {
    const accountsCollection = collection(db, 'users');
    const accountsQuery = query(accountsCollection, where('active', '==', true));

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const name = [];
        querySnapshot.forEach((doc) => {
            name = doc.data().firstName + " " + doc.data().lastName;
            usersList.push(name);
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function populateAccountsDropdown() {
    const accounts = await getAccountsList();
    const accountSelect = document.getElementById('roleSelect');
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        accountSelect.appendChild(option);
    });

}




//admin email template
const formbutton = document.querySelector('.add-btn');

formbutton.onclick = ()=> {

        var params = {
            name: document.getElementById('roleSelect').value,
            /* email: document.getElementById('email').value, */
            message: document.getElementById('mess').value,
        };

    //Make new template for contact form
    emailjs.send('service_9bu3nfr','template_0qdo9gb',params)
    .then(
        res =>{
            document.getElementById("roleSelect").value = "",
            /* document.getElementById("email").value = "", */
            document.getElementById("mess").value = "",
            console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch ((err) => console.log(err));
    

}




