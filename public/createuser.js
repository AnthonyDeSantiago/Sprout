import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
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
const newUserRequest = collection(db, 'new_user_requests');
const users = collection(db, 'users');
const auth = getAuth(app);

console.log("createuser.js loaded!!")
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

/*Right now First Name must:
--> contain a letter,
--> contain only capital or lower case letters
*/
function validateFirstName(name) {
    var namePattern = /^[A-Za-z]+$/;
    return namePattern.test(name);
}

/*Right now Last Name must:
--> contain a letter,
--> contain only capital or lower case letters or spaces
*/
function validateLastName(name) {
    var namePattern = /^[A-Za-z ]+$/;
    return namePattern.test(name);
}

/*Right now Dates must:
--> be of this format MM/DD/YYYY
*/

function validateDate(date) {
    var datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    return datePattern.test(date);
}


function validateAddress(address) {
    var addressPattern = /^[A-Za-z0-9\s.,'-]+$/;
    return addressPattern.test(address);
}

function validateEmail(email) {
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = "form-control error";
    const small = formControl.querySelector('small');
    small.innerText = message
}

// document.getElementById("password_form").addEventListener("submit", async function (e) {
//     console.log("button was pressed")
// });

document.getElementById("new_user_form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const userEmailElement = document.getElementById("user_email");
    const firstNameElement = document.getElementById("first_name");
    const lastNameElement = document.getElementById("last_name");
    const dateOfBirthElement = document.getElementById("dateofbirth");
    const addressElement = document.getElementById("address");
    const passwordElement = document.getElementById("password");
    const answer1Element = document.getElementById("answer1");
    const answer2Element = document.getElementById("answer2");
    const question1Element = document.getElementById('question1_selected');
    const question2Element = document.getElementById("question2_selected");

    var userEmail = userEmailElement.value;
    var firstName = firstNameElement.value;
    var lastName = lastNameElement.value;
    var address = addressElement.value;
    var dateOfBirth = dateOfBirthElement.value;
    var password = passwordElement.value;
    var answer1 = answer1Element.value;
    var answer2 = answer2Element.value;
    var question1 = question1Element.value;
    var question2 = question2Element.value;

    console.log("Question 1: " + question1);
    console.log("Question 2: " + question2);
    
    var isValid = true;

    if (!validateEmail(userEmail)) {
        var errorMessage = 'Please enter a valid email address'
        if (userEmail == '') {
            errorMessage = "Please enter an email address."
        }
        showError(userEmailElement, errorMessage)
        isValid = false;
    }
    console.log("hit email");
    if (!validateFirstName(firstName)) {
        var errorMessage = 'First name must be only letters and contain no spaces'
        if (firstName == '') {
            errorMessage = "Please enter a first name."
        }
        showError(firstNameElement, errorMessage);
        isValid = false;
    }
    console.log("hit f name");
    if (!validateLastName(lastName)) {
        var errorMessage = 'Last name must be only letters'
        if (lastName == '') {
            errorMessage = "Please enter a last name."
        }
        showError(lastNameElement, errorMessage);
        isValid = false;
    }
    console.log("hit l name");
    if (!validateAddress(address)) {
        var errorMessage = 'Please enter a valid address'
        if (address == '') {
            errorMessage = 'Please enter an address'
        }
        showError(addressElement, errorMessage)
        isValid = false;
    }
    console.log("hit add");

    if (!validateDate(dateOfBirth)) {
        var errorMessage = 'Date of birth must be in MM/DD/YYYY format'
        if (dateOfBirth == '') {
            errorMessage = "Please enter a date of birth."
        }
        showError(dateOfBirthElement, errorMessage);
        isValid = false;
    }
    console.log("hit dob");

    if (!validatePassword(password)) {
        var errorMessage = 'Passwords must be at least 8 characters, start with a letter, and contain a number and a special character'
        if (password == '') {
            errorMessage = "Please enter a password."
        }
        
        showError(passwordElement, errorMessage);
        isValid = false;
    }
    console.log("hit pass");

    if (answer1 == '') {
        var errorMessage = 'Please enter an answer.';
        showError(answer1Element, errorMessage);
        isValid = false;
    }
    console.log("hit ans1");

    if (answer2 == '') {
        var errorMessage = 'Please enter an answer';
        showError(answer2Element, errorMessage);
        isValid = false;
    }
    console.log("hit ans2");
    
    if (!isValid) {
        return false;
    }
    
    try{
        console.log("hit try create");
        //Ideally this date would be populating from the server timestamp, not the client-side date - TBD IN FUTURE UPDATE
        const date = new Date();
        let month = String(date.getMonth()+1).padStart(2,"0");
        let day = String(date.getDay()).padStart(2,"0");
        let year = String(date.getFullYear()).slice(2);
        //let userNameExists = await testUserName(firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year);
        //console.log("userNameExists = " + userNameExists);
        
        let username = await generateUsername(firstName, lastName, month, day, year);
        console.log("username = " + username);
            
        let emailAlreadyInUse = await testUserEmail(userEmail);
        console.log("emailAlreadyInUse = "+ emailAlreadyInUse);
        
        if(!emailAlreadyInUse){
            /*
            await createUserWithEmailAndPassword(auth, userEmail, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    console.log("user = " + user);
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                });*/
    
            /*const user = auth.currentUser;
            const uid = user.uid;
            console.log("UID = " + uid);
            
            updateProfile(auth.currentUser, {
              displayName: String(firstName + " " + lastName), photoURL: "https://example.com/jane-q-user/profile.jpg"
            }).then(() => {
              console.log("Profile updated");
                // Profile updated!
              // ...
            }).catch((error) => {
              // An error occurred
              // ...
            });*/
            
            const newUser = {
                userEmail: userEmail,
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password,
                passwordCreatedAt: serverTimestamp(),
                question1: question1,
                answer1: answer1,
                question2: question2,
                answer2: answer2,
                address: address,
                DOB: dateOfBirth,
                role: 'blank',
                approved: 'blank',
                userCreatedAt: serverTimestamp()
            }


            await setDoc(doc(db, 'new_user_requests', username.toString()),  newUser);
            console.log('New user request added successfully!');

        } else{ 
            alert("User email already in use. Return to the login screen and choose Forgot Password if you are having trouble accessing your account.")
            console.log('User email already in use.');
        }
    } catch(error) {
        console.log(error)
    }

    
    return true;
});

async function generateUsername(firstName, lastName, month, day, year){
    let username = "TBD";
    let userCheck = await testUserName(firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year);
    let userCount = 0;
    if(!userCheck){
        username = String(firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year);
        return username;
    }
    while(userCheck){
        userCount++;
        username = String(firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + userCount + month + year);
        userCheck = await testUserName(username);
    }
    return username;
}

//BULKY, CAN BE REDUCED IN THE FUTURE - TBD
async function testUserEmail(testEmail){
    testEmail = testEmail.toString();
    const q = query(users, where('userEmail', '==', testEmail));
    const checkEmail = await getDocs(q);
    let count = 0;
    checkEmail.forEach((doc) => {
        count += 1;
    });
    console.log("checkEmail = " + count);
    if (count > 0){
        return true;
    } else{
        return false;
    }
}

//BULKY, CAN BE REDUCED IN THE FUTURE - TBD
async function testUserName(testUsername){
    testUsername = testUsername.toString();
    const docRef = query(users, where('username', '==', testUsername));
    const docCheck = await getDocs(docRef);
    let count = 0;
    docCheck.forEach((doc) => {
        count += 1;
    });
    console.log("checkUsername = " + count);
    if (count > 0){
        return true;
    } else{
        return false;
    }
    /*testUsername = testUsername.toString();
    const docRef = doc(db, 'users', testUsername);
    const docCheck = await getDoc(docRef);
    if (docCheck.exists()){
        return true;
    } else{
        return false;
    }*/
}

function testValidationFunctions() {
    console.log("code reached here!!");
    // Get the values 
    var userEmail = document.getElementById("user_email").value;
    var firstName = document.getElementById("first_name").value;
    var lastName = document.getElementById("last_name").value;
    var address = document.getElementById("address").value;
    var dateOfBirth = document.getElementById("dateofbirth").value;
    var password = document.getElementById("password").value;
    
    // See if its working
    if (validateEmail(userEmail)) {
        console.log("User Email: " + userEmail);
        console.log("Email is Valid");
    } else {
        console.log("User Email: " + userEmail);
        console.log("!!!!!Email is NOT Valid!!!!");
    }

    if (validateFirstName(firstName)) {
        console.log("First Name: " + firstName);
        console.log("First Name is Valid");
    } else {
        console.log("First Name: " + firstName);
        console.log("!!!!!First Name NOT Valid!!!!");
    }

    if (validateLastName(lastName)) {
        console.log("Last Name: " + lastName);
        console.log("Last Name is Valid");
    } else {
        console.log("Last Name: " + lastName);
        console.log("!!!!!Last Name NOT Valid!!!!");
    }

    if (validateAddress(address)) {
        console.log("Address: " + address);
        console.log("Address is Valid");
    } else {
        console.log("Address: " + address);
        console.log("!!!!!Last Name NOT Valid!!!!");
    }

    if (validateDate(dateOfBirth)) {
        console.log("Date of Birth: " + dateOfBirth);
        console.log("DOB is Valid");
    } else {
        console.log("Date of Birth: " + dateOfBirth);
        console.log("!!!!!DOB NOT Valid!!!!");
    }

    if (validatePassword(password)) {
        console.log("Password: " + password);
        console.log("password is Valid");
    } else {
        console.log("Password: " + password);
        console.log("!!!!!Password NOT Valid!!!!");
    }

    
    return true;
}

//shows the picked image in the "Upload Image"
let profilePicture = document.getElementById("blank_choose_ur_pic");
let inputFile = document.getElementById("input_file");
inputFile.onchange = function(){
    profilePicture.src = URL.createObjectURL(inputFile.files[0]);
}