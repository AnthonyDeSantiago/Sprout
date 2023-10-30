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


//Accountant email template
const formbutton2 = document.querySelector('.acc-btn');

formbutton2.onclick = ()=> {

        var params = {
            name: document.getElementById('roleSelect').value,
            /* email: document.getElementById('email').value, */
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






