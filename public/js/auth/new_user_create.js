console.log("!!! createuser.js loaded !!!")

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { getStorage, ref, uploadBytesResumable, uploadBytes, getDownloadURL  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"

//Firebase tool variables
const db = getFirestore();      //Cloud Firestore grab
const auth = getAuth();         //Current Firestore Auth grab
const storage = getStorage();   //Cloud Storage grab

const users = collection(db, 'users');
let newUser = null;             //will hold the array of new user information


/******************* HANDLE AVATAR UPLOAD/SELECTION ************************/
let profilePicturePreview = document.getElementById("blank_choose_ur_pic");
let inputFile = document.getElementById("input_file");
var profile_image_url = null;
var avatar_image_path = null;

inputFile.onchange = async function () {
    // Create the file metadata
    /** @type {any} */
    const metadata = {
        contentType: 'image/jpeg'
    };

    let uploadDate = new Date();
    uploadDate = uploadDate.toString();
    // Upload file and metadata to the object 'images/[file name]'
    const storageRef = ref(storage, 'userProfilePictures/' + uploadDate + (inputFile.value).replace('C:\\fakepath\\', ' '));
    console.log((inputFile.value).replace('C:\\fakepath\\', ' '));
    const uploadTask = uploadBytesResumable(storageRef, inputFile.files[0], metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        },
        (error) => {
            showErrorMessage(profileUploadElement, "Profile photo unable to be uploaded. Please ensure you are using a .jpg, or select from one of the above avatars.");
            switch (error.code) {
                case 'storage/unauthorized':        // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':            // User canceled the upload
                    break;
                case 'storage/unknown':             // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((profileImageURL) => {
                console.log('File available at', profileImageURL);
                
                //ideally at some point we will set this image to be cropped as a square 
                //on input, then we can return to using border radius
                profilePicturePreview.src = profileImageURL;
                profilePicturePreview.style.borderRadius = 0;
                profile_image_url = profileImageURL;
            });

        }
    );
}

const radioButtons = document.querySelectorAll('input[name="avatar"]');

radioButtons.forEach((radioButton) => {
    radioButton.addEventListener("click", function () {
        if (this.checked) {
            avatar_image_path = this.value;
            console.log("Selected avatar image path:", avatar_image_path);
        }
    });
});

/******************* USER INPUT VALIDATION + ERROR MESSAGES ************************/

const userEmailElement = document.getElementById("user_email");
const firstNameElement = document.getElementById("first_name");
const lastNameElement = document.getElementById("last_name");
const dateOfBirthElement = document.getElementById("dateofbirth");
const addressElement = document.getElementById("address");
const passwordElement = document.getElementById("password");
const password2Element = document.getElementById("password2");
const profileUploadElement = document.getElementById("self_profile_pic");
const answer1Element = document.getElementById("answer1");
const answer2Element = document.getElementById("answer2");
const question1Element = document.getElementById('question1_selected');
const question2Element = document.getElementById("question2_selected");

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

function hideError(input) {
    const formControl = input.parentElement;
    formControl.className = "form-control";
}

/* form-float for bootstrap swap */
/* function showError(input, message) {
    const formFloat = input.parentElement;
    formFloat.className = "form-floating error";
    const small = formFloat.querySelector('small');
    small.innerText = message
}

function hideError(input) {
    const formFloat = input.parentElement;
    formFloat.className = "form-floating";
} */


/******************* EVENT LISTENERS FOR SUBMIT + ERRORS ************************/
/*document.addEventListener('keydown', function (event) {
    console.log("Code reached the event listener?")
    hideError(userEmailElement);
    hideError(firstNameElement);
    hideError(lastNameElement);
    hideError(dateOfBirthElement);
    hideError(addressElement);
    hideError(passwordElement);
    hideError(password2Element);

    hideError(profileUploadElement);
    hideError(answer1Element);
    hideError(answer2Element);
    hideError(question1Element);
    hideError(question2Element);

});*/

document.getElementById("new_user_form").addEventListener("submit", async function (e) {
    e.preventDefault();

    var userEmail = userEmailElement.value;
    var firstName = firstNameElement.value;
    var lastName = lastNameElement.value;
    var address = addressElement.value;
    var dateOfBirth = dateOfBirthElement.value;
    var password = passwordElement.value;
    var password2 = password2Element.value;
    var answer1 = answer1Element.value;
    var answer2 = answer2Element.value;
    var question1 = question1Element.value;
    var question2 = question2Element.value;

    var isValid = true;

    if (!validateEmail(userEmail)) {
        var errorMessage = 'Please enter a valid email address.'
        if (userEmail == '') {
            errorMessage = "Please enter an email address."
        }
        showError(userEmailElement, errorMessage)
        isValid = false;
    }
    console.log("hit email");
    if (!validateFirstName(firstName)) {
        var errorMessage = 'First name must be only letters and contain no spaces.'
        if (firstName == '') {
            errorMessage = "Please enter a first name."
        }
        showError(firstNameElement, errorMessage);
        isValid = false;
    }
    console.log("hit f name");
    if (!validateLastName(lastName)) {
        var errorMessage = 'Last name must be only letters.'
        if (lastName == '') {
            errorMessage = "Please enter a last name."
        }
        showError(lastNameElement, errorMessage);
        isValid = false;
    }
    console.log("hit l name");
    if (!validateAddress(address)) {
        var errorMessage = 'Please enter a valid address.'
        if (address == '') {
            errorMessage = 'Please enter an address.'
        }
        showError(addressElement, errorMessage)
        isValid = false;
    }
    console.log("hit add");

    if (!validateDate(dateOfBirth)) {
        var errorMessage = 'Date of birth must be in MM/DD/YYYY format.'
        if (dateOfBirth == '') {
            errorMessage = "Please enter a date of birth."
        }
        showError(dateOfBirthElement, errorMessage);
        isValid = false;
    }
    console.log("hit dob");

    if (!validatePassword(password)) {
        var errorMessage = 'Passwords must be at least 8 characters, start with a letter, and contain a number and a special character.'
        if (password == '') {
            errorMessage = "Please enter a password."
        }

        showError(passwordElement, errorMessage);
        isValid = false;
    }
    console.log("hit pass");
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

    if (answer1 == '') {
        var errorMessage = 'Please enter an answer.';
        showError(answer1Element, errorMessage);
        isValid = false;
    }
    console.log("hit ans1");

    if (answer2 == '') {
        var errorMessage = 'Please enter an answer.';
        showError(answer2Element, errorMessage);
        isValid = false;
    }
    console.log("hit ans2");

    if (!isValid) {
        return false;
    }

    try {
        var user = null;
        
        console.log("hit try to create user");
        var date = new Date();
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let day = String(date.getDay()).padStart(2, "0");
        let year = String(date.getFullYear()).slice(2);

        var username = await generateUsername(firstName, lastName, month, day, year);
        console.log("username = " + username);

        var emailAlreadyInUse = await testUserEmail(userEmail);
        console.log("emailAlreadyInUse = " + emailAlreadyInUse);

        console.log("hit try to create user");
        if (!emailAlreadyInUse) {
            await createUserWithEmailAndPassword(auth, userEmail, password)
                .then((userCredential) => {
                    // Signed in 
                    const userCred = userCredential.user;
                    console.log("fetched userCred = " + userCred);
                    //email verification
                    /*sendEmailVerification(user)
                        .then(()=>{
                            console.log('Email Verfication sent');
                    });*/

                    user = userCred;

                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
            console.log("user" + user);
            try {

                const uid = await user.uid;
                console.log(uid);

                const susEnd = new Date(2222, 2, 2);

                let creationDate = serverTimestamp();
                
                if(profile_image_url == null){
                    profile_image_url = avatar_image_path;
                }

                newUser = {
                    id: uid,
                    userEmail: userEmail,
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    password: password,
                    passwordCreatedAt: creationDate,
                    question1: question1,
                    answer1: answer1,
                    question2: question2,
                    answer2: answer2,
                    address: address,
                    DOB: dateOfBirth,
                    suspended: true,
                    suspensionEndDate: susEnd,
                    role: 'blank',
                    approved: false,
                    userCreatedAt: creationDate,
                    avatar: profile_image_url
                }

                await setDoc(doc(db, 'users', uid.toString()), newUser);
                console.log('New user request added successfully!');
                alert("Your user request has been submitted. An admin will contact you shortly. Thank you!");
            }
            catch (error) {
                console.log('There was an error creating the user.');
            }

        } else {
            alert("User email already in use. Return to the login screen and choose Forgot Password if you are having trouble accessing your account.")
            console.log('User email already in use.');
        }
    } catch (error) {
        console.log(error)
    }

    checkAuthState();

    return true;
});

async function generateUsername(firstName, lastName, month, day, year) {
    let username = "TBD";
    let userCheck = await testUserName(firstName.slice(0, 1).toLowerCase() + lastName.toLowerCase() + month + year);
    let userCount = 0;
    if (!userCheck) {
        username = String(firstName.slice(0, 1).toLowerCase() + lastName.toLowerCase() + month + year);
        return username;
    }
    while (userCheck) {
        userCount++;
        username = String(firstName.slice(0, 1).toLowerCase() + lastName.toLowerCase() + userCount + month + year);
        userCheck = await testUserName(username);
    }
    return username;
}

//BULKY, CAN BE REDUCED IN THE FUTURE - TBD
async function testUserEmail(testEmail) {
    testEmail = testEmail.toString();

    const q = query(users, where('userEmail', '==', testEmail));
    const checkEmail = await getDocs(q);

    let count = 0;

    checkEmail.forEach((doc) => {
        count += 1;
    });

    console.log("checkEmail = " + count);

    if (count > 0) {
        return true;
    } else {
        return false;
    }
}

//BULKY, CAN BE REDUCED IN THE FUTURE - TBD
async function testUserName(testUsername) {
    testUsername = testUsername.toString();

    const docRef = query(users, where('username', '==', testUsername));
    const docCheck = await getDocs(docRef);

    let count = 0;

    docCheck.forEach((doc) => {
        count += 1;
    });

    console.log("checkUsername = " + count);

    if (count > 0) {
        return true;
    } else {
        return false;
    }
}

const checkAuthState = async () => {
    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            if(currentUser.uid == newUser.id){
                updateProfile(currentUser, {
                    displayName: newUser.firstName + " " + newUser.lastName,
                    photoURL: newUser.avatar
                }).then(() => {
                    console.log("User profile updated!");
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.log("An error loaded while updating the user's auth tokens.");
                });
            }
        }
        else {
            //Any code put here will impact sign in pages, so be careful
            //For example: do not put an alert that there is no user here,
            //it will cause an error with sign in
        }
    })
}