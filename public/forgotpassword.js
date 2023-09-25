console.log("forgotpassword.js has loaded!!!");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
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

const users = collection(db, 'users');
let user = [];

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
    var passwordUnusued = true;
    let currentPassword = user.password;
    if(String(password) == String(currentPassword)){
        console.log("current password used");
        return false;
    }
    if(user.hasOwnProperty('oldPasswords')){
        console.log("has old passwords");
        let oldPasswords = user.oldPasswords;
        oldPasswords.forEach((pass) => {
            if(String(pass) == String(password)){
                console.log("old password used");
                return false;
            }
        });
    }
    return true;
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
        console.log("User data = " + userData);
        //if(userData.userEmail == userEmail){
        return userData;
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
    user = await fetchUser(username);
    
    const question1 = user.question1;
    const question2 = user.question2;
    document.getElementById("question1").textcontent=String(question1);
    console.log(question1);
    document.getElementById("question2").textcontent=String(question2);
    console.log(question2);
    console.log("questions are loaded");

    return true;
});

document.getElementById("password_form").addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("button is pressed");
    user = await fetchUser(username);

    const userEmailElement = document.getElementById("user_email");
    const userNameElement = document.getElementById("username");
    const answer1Element = document.getElementById("answer1");
    const answer2Element = document.getElementById("answer2");
    const passwordElement = document.getElementById("password");

    var userEmail = userEmailElement.value;
    var username = userNameElement.value;
    var answer1 = answer1Element.value;
    var answer2 = answer2Element.value;
    var password = passwordElement.value;

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
    if (!validateNewPassword(password)) {
        var errorMessage = 'Passwords used in the past cannot be re-used.'
        if (password == '') {
            errorMessage = "Please enter a password."
        }
        
        showError(passwordElement, errorMessage);
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
    const docRef = doc(db, 'users', String(user.id));
    const userRef = await getDoc(docRef);
    
    await updateDoc(userRef, {
        password: password,
        passwordCreatedAt: serverTimestamp(),
        oldPasswords: oldPasswords
    });
            
    console.log('User updated successfully!');

    return true;
});
