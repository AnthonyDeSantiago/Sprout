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





        //sending email to admin - not working
        const fun = initializeApp();
        const ad = funct();
        const nodemailer = require('nodemailer');
        const cors = require('cors')({origin: true});
        admin.initializeApp();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: 'insert a GMAIL',
                pass: '& the password'
            }
        });

        exports.sendMail = ad.https.onRequest((req,res)=>{
            cors(req,res,()=>{

        const dest = req.query.dest;

        const mailOptions = {
            from: 'Admin <Insert the GMAIL you put above>',
            to: dest,
            subject: 'Hello World',
            html: 'This is HTML'
        };

        return transporter.sendMail(mailOptions, (erro, info)=>{
            if (erro){
                return res.send(erro.toString());
            }
            return res.send('Sended');
        });
    });
});




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

