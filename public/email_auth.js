import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

/* const firebaseConfig = initializeApp({
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
}); */

const auth = getAuth();

//signing up
const createAccount = async () =>{
    const loginEmail = user_email.value;
    const loginPassword = password.value;

    try{
        const userCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log(userCred.user);
    }
    catch(error){
        console.log('there was an error')
    }
}

sign_up.addEventListener("click", createAccount);




//logging in & prob. switch some value with the user create value
/* const emailAndPassword = async () =>{
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







//auth email link NOT WORKING STUFF
/* const actionCodeSettings ={
    url: 'https://sprout-financials.firebaseapp.com/__/auth/action?mode=action&oobCode=code',

    handleCodeInApp: true,
}; */

/* firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
.then(function(){

})
.catch(function(error){
    const errorCode = error.code;
    const errorMessage = error.message;
});  */

/* await sendSignInLinkToEmail(auth, loginEmail, actionCodeSettings)
.then(()=>{
    console.log('email has been sent');
    window.localStorage.setItem('emailForSignIn', loginEmail);
})
.catch((error)=>{
    const errorCode = error.code;
    const errorMessage = error.message;
});
 */









//not working atm
const showApp = () => {
    login.style.display = 'none'
    app.style.display = 'block'
}
const showLoginForm = () => {
    login.style.display = 'block'
    app.style.display = 'none'  
}
const showLoginState = (user) => {
    lblAuthState.innerHTML = `You're logged in as ${user.displayName} (uid: ${user.uid}, email: ${user.email}) `
}
//after logging in/siging up is successful
const authState = async () =>{
    onAuthStateChanged(auth, user =>{
        if (user){
            console.log(user);
            showApp();
            showLoginState(user);

            hideLoginError();
        }
        else{
            showLoginForm();
            lblAuthState.innerHTML = "Not Logged In"
        }
    });
}

//sign out

