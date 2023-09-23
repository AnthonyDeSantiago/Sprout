/* changes the placeholder picture to whatever you picked in the Sign up Function */
let profilePicture = document.getElementById("blank_choose_ur_pic");
let inputFile = document.getElementById("input_file");
inputFile.onchange = function(){
    profilePicture.src = URL.createObjectURL(inputFile.files[0]);
}

console.log("sprout.js loaded!!")
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



document.getElementById("login_form").addEventListener("submit", function (e) {
    e.preventDefault();

    var userEmail = document.getElementById("user_email").value;
    var firstName = document.getElementById("first_name").value;
    var lastName = document.getElementById("last_name").value;
    var address = document.getElementById("address").value;
    var dateOfBirth = document.getElementById("dateofbirth").value;
    var password = document.getElementById("password").value;

    var isValid = true;

    if (!validateEmail(userEmail)) {
        alert("Invalid email address");
        isValid = false;
    }

    if (!validateFirstName(firstName)) {
        alert("Invalid first name");
        isValid = false;
    }

    if (!validateLastName(lastName)) {
        alert("Invalid last name");
        isValid = false;
    }

    if (!validateAddress(address)) {
        alert("Invalid address");
        isValid = false;
    }

    if (!validateDate(dateOfBirth)) {
        alert("Invalid date of birth");
        isValid = false;
    }

    if (!validatePassword(password)) {
        alert("Invalid password");
        isValid = false;
    }

    
    if (!isValid) {
        return false;
    }

    // I think we can put the firestore data base stuff here

    return true;
})

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
        console.log("email is Valid");
    } else {
        console.log("User Email: " + userEmail);
        console.log("!!!!!email is NOT Valid!!!!");
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
        console.log("!!!!!password NOT Valid!!!!");
    }

    
    return true;
}

