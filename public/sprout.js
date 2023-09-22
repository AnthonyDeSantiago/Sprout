console.log("Sprout.js has loaded!!");

/*Passwords must be:
--> a minimum of 8 characters,
--> must start with a letter,
--> must have a letter,
--> a number and special character,
--> if this requirement is not satisfied,
--> display an appropriate error message
*/

function validatePassword(password) {

    var passwordPattern = /^(?=[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-+=<>?]).{8,}$/;

    return passwordPattern.test(password);
    
}


function validateFirstName(name) {

    var namePattern = /^[A-Za-z]+$/;

    return namePattern.test(name);

}

function validateLastName(name) {

    var namePattern = /^[A-Za-z ]+$/;

    return namePattern.test(name);

}

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


function testValidationFunctions() {
    console.log("code reached here!!");
    // Get the values 
    var userEmail = document.getElementById("user_email").value;
    var firstName = document.getElementById("first_name").value;
    var lastName = document.getElementById("last_name").value;
    var address = document.getElementById("address").value;
    var dateOfBirth = document.getElementById("dateofbirth").value;
    var password = document.getElementById("password").value;
    var question1 = document.getElementById("question1").value;
    var question2 = document.getElementById("question2").value;

    
    
    // See if its working
    if (validateEmail(userEmail)) {
        console.log("User Email: " + userEmail);
        console.log("email is Valid");
    } else {
        console.log("!!!!!email is NOT Valid!!!!");
    }

    if (validateFirstName(firstName)) {
        console.log("First Name: " + firstName);
        console.log("First Name is Valid");
    } else {
        console.log("!!!!!First Name NOT Valid!!!!");
    }

    if (validateLastName(lastName)) {
        console.log("Last Name: " + lastName);
        console.log("Last Name is Valid");
    } else {
        console.log("!!!!!Last Name NOT Valid!!!!");
    }

    if (validateAddress(address)) {
        console.log("Address: " + address);
        console.log("Address is Valid");
    } else {
        console.log("!!!!!Last Name NOT Valid!!!!");
    }

    if (validateDate(dateOfBirth)) {
        console.log("Date of Birth: " + dateOfBirth);
        console.log("DOB is Valid");
    } else {
        console.log("!!!!!DOB NOT Valid!!!!");
    }

    if (validatePassword(password)) {
        console.log("Password: " + password);
        console.log("password is Valid");
    } else {
        console.log("!!!!!password NOT Valid!!!!");
    }

    console.log("Question 1: " + question1);
    console.log("Question 2: " + question2);

    
    return true;
}

