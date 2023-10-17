import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

const firebaseConfig = initializeApp({
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
});

// code for emailjs and mailjet if you need it
/* const serviceID = "service_9bu3nfr";
const templateID = "template_fskrd9f"; */

//sending verfication
//flow: user make account -> email request is sent to admin to usertable with user -> admin accept or deny

//for new user (dont know if it work due to firebase error)
/* const button = document.querySelector('.new_user_submit_form'); */

//test from contact form
const button = document.querySelector('.email-btn');

button.onclick = () => {
        //change it to based on the new user value from user create
        var templateParams = {
           /*  name: document.getElementById('first_name').value,
            email: document.getElementById('user_email').value, */
        };
    
        emailjs.send('service_9bu3nfr', 'template_fskrd9f', templateParams)
        .then(function(response) {
           console.log('SUCCESS!', response.status, response.text);
        }, function(error) {
           console.log('FAILED...', error);
        });
    
}

//contact admin form
const formbutton = document.querySelector('.form-btn');

formbutton.onclick = ()=> {

        var params = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            message: document.getElementById('mess').value,
        };

    //Make new template for contact form
    emailjs.send('service_9bu3nfr','template_0qdo9gb',params)
    .then(
        res =>{
            document.getElementById("fullName").value = "",
            document.getElementById("email").value = "",
            document.getElementById("mess").value = "",
            console.log.apply(res)
            alert("message sent sucessfully");
        })
        .catch ((err) => console.log(err));
    

}





//keep or nah??

//logging in

/* const auth = getAuth(firebaseConfig);
const emailAndPassword = async () =>{
    const loginEmail = user_email.value;
    const loginPassword = password.value;
    try{
        const logCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log(logCred.user);
    }
    catch(error){
        console.log('there was an error')
    }
}

sign_in.addEventListener("click", emailAndPassword); */

//signing up

/* const createAccount = async () =>{
    const loginEmail = user_email.value;
    const loginPassword = password.value;

    try{
        const userCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);

        await sendSignInLinkToEmail(auth, loginEmail, actionCodeSettings)
    .then(()=>{
        console.log('email has been sent');
        window.localStorage.setItem('emailForSignIn', loginEmail);
})
    .catch((error)=>{
        const errorCode = error.code;
        const errorMessage = error.message;
});
        
    }
    catch(error){
        console.log('there was an error')
    }
}

sign_up.addEventListener("click", createAccount);
 */



