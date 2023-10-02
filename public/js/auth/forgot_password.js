console.log("forgotpassword.js has loaded!!!");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
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

const users = collection(db, 'users');
//let user = [];

function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = "form-control error";
    const small = formControl.querySelector('small');
    small.innerText = message
}


/*Passwords must be:
--> a minimum of 8 characters,
--> must start with a letter,
--> must have a letter,
--> a number and special character
*/
function validatePassword(password) {
    var passwordPattern = /^(?=[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-+=<>?]).{8,}$/;
    return passwordPattern.test(password);
}

async function validateNewPassword(password, user){
    let currentPassword = user.password;
    if(String(password) == String(currentPassword)){
        console.log("current password used");
        return true;
    }
    if(user.hasOwnProperty('oldPasswords')){
        console.log("has old passwords");
        let oldPasswords = user.oldPasswords;
        oldPasswords.forEach((pass) => {
            if(String(pass) == String(password)){
                console.log("old password used");
                return true;
            }
        });
    }
    return false;
}

async function fetchUser(username/*, userEmail*/){
    try{
        var userData = [];
        username = username.toString();
        //userEmail = userEmail.toString();
        const q = query(users, where('username', '==', username), limit(1));
        const getUser = await getDocs(q).then((querySnapshot) => {
            const tempDoc = [];
            querySnapshot.forEach((doc) => {
                tempDoc.push({ id: doc.id, ...doc.data() });
            });
            userData = tempDoc;
        })
        var userStr = JSON.stringify(userData, null, 4);
        console.log("User data = " + userStr);
        //if(userData.userEmail == userEmail){
        var user = userData[0];
        return user;
        //} else {
        //    console.log("userData error, userData = " + userData);
        //    return false;
        //}
    } catch(error) {
        console.log(error);
        alert("Please enter the correct username and e-mail associated with the account before proceeding.");
    }
    return false;
}

document.getElementById("answer1").addEventListener("click", async function (e) {
    e.preventDefault();
    console.log("username is entered");
    const userEmailElement = document.getElementById("user_email");
    const userNameElement = document.getElementById("username");
    var userEmail = userEmailElement.value;
    var username = userNameElement.value;
    const user = await fetchUser(username);
    //var userStr = JSON.stringify(user, null, 4);
    //console.log("User data = " + userStr);

    const question1 = user.question1;
    const question2 = user.question2;
    document.getElementById("question1").textContent = question1;
    console.log(question1);
    document.getElementById("question2").textContent = String(question2);
    console.log(question2);
    console.log("questions are loaded");

    return true;
});

function hideError(input) {
    const formControl = input.parentElement;
    formControl.className = "form-control";
}

document.addEventListener('keydown', function(event) {
    console.log("Code reached the event listener?")
    const userEmailElement = document.getElementById("user_email");
    const passwordElement = document.getElementById("password");
    const password2Element = document.getElementById("password2");
    const answer1Element = document.getElementById("answer1");
    const answer2Element = document.getElementById("answer2");

    hideError(userEmailElement);
    hideError(passwordElement);
    hideError(password2Element);
    hideError(answer1Element);
    hideError(answer2Element);
});

document.getElementById("password_form").addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("button is pressed");

    const userEmailElement = document.getElementById("user_email");
    const userNameElement = document.getElementById("username");
    const answer1Element = document.getElementById("answer1");
    const answer2Element = document.getElementById("answer2");
    const passwordElement = document.getElementById("password");
    const password2Element = document.getElementById("password2");

    var userEmail = userEmailElement.value;
    var username = userNameElement.value;
    var answer1 = answer1Element.value;
    var answer2 = answer2Element.value;
    var password = passwordElement.value;
    var password2 = password2Element.value;
    
    const user = await fetchUser(username);
    var userStr = JSON.stringify(user, null, 4);
    console.log("User data password_form listener = " + userStr);
    
    var isValid = true;

    if (userEmail == '') {
        var errorMessage = "Please enter an email address.";
        showError(userEmailElement, errorMessage);
        isValid = false;
    }

    if (username == '') {
        var errorMessage = "Please enter a username.";
        showError(userNameElement, errorMessage);
        isValid = false;
    }
    
    if (answer1 == '') {
        var errorMessage = "Please enter an answer.";
        showError(answer1Element, errorMessage);
        isValid = false;
    }

    if (answer2 == '') {
        var errorMessage = "Please enter an answer.";
        showError(answer2Element, errorMessage);
        isValid = false;
    }
    if (!validatePassword(password)) {
        var errorMessage = 'Passwords must be at least 8 characters, start with a letter, and contain a number and a special character'
        if (password == '') {
            errorMessage = "Please enter a password."
        }
        
        showError(passwordElement, errorMessage);
        isValid = false;
    }
    if (!validateNewPassword(password, user)) {
        var errorMessage = 'Passwords used in the past cannot be re-used.'
        if (password == '') {
            errorMessage = "Please enter a password."
        }
        
        showError(passwordElement, errorMessage);
        isValid = false;
    }

    if (password != password2) {
        var errorMessage = "Passwords do not match. Please try again.";
        if (password2 == '') {
            errorMessage = "Please retype password here.";
            showError(password2Element, errorMessage);
        } else {
            showError(password2Element, errorMessage);
            showError(passwordElement, errorMessage);
        }
        isValid = false;
    }

    if (!isValid) {
        return false;
    }

    let oldPasswords = []
    
    if(user.hasOwnProperty('oldPasswords')){
        console.log("updating old passwords");
        oldPasswords = user.oldPasswords;
        oldPasswords.push(user.password);
    }else{
        oldPasswords.push(user.password);
    }

    //const q = query(users, where('username', '==', username), limit(1));
    //const userRef = await getDocs(q);
    const userRef = doc(db, 'users', String(user.id));
    
    await updateDoc(userRef, {
        password: password,
        passwordCreatedAt: serverTimestamp(),
        oldPasswords: oldPasswords
    });
            
    console.log('User updated successfully!');
    //TBD
    window.location.href = 'index.html';
    return true;
});
