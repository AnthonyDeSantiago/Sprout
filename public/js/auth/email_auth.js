import exp from 'constants';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { funct } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-functions.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

include('createuser.js')

const auth = getAuth();

//signing up
const createAccount = async () =>{
    const loginEmail = user_email.value;
    const loginPassword = password.value;

    try{
        const userCred = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        console.log(userCred.user);

        //email verification
        /* await sendEmailVerification(auth.currentUser)
        .then(()=>{ */









    }
    catch(error)
    {
        console.log('there was an error')
    }
}
//being handled in createuser.js right now
//sign_up.addEventListener("click", createAccount);


getFirestore.collection

//logging in & prob. switch some value with the user create value
const emailAndPassword = async () =>{
    const username = username.value;
    const loginPassword = password.value;
    try{
        const logCred = await signInWithEmailAndPassword(auth, username, loginPassword);
        console.log(logCred.user);
    }
    catch(error){
        console.log('there was an error')
    }
}

//sign_in.addEventListener("click", emailAndPassword);





















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

