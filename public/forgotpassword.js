console.log("forgotpassword.js has loaded!!!");

function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = "form-control error";
    const small = formControl.querySelector('small');
    small.innerText = message
}


// function validateEmail(email) {
//     var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailPattern.test(email);
// }

// function validateUserName(username) {

// }


document.getElementById("password_form").addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("button is pressed");

    const userEmailElement = document.getElementById("user_email");
    const userNameElement = document.getElementById("username");
    const answer1Element = document.getElementById("answer1");
    const answer2Element = document.getElementById("answer2");


    var userEmail = userEmailElement.value;
    var username = userNameElement.value;
    var answer1 = answer1Element.value;
    var answer2 = answer2Element.value;

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


    if (!isValid) {
        return false;
    }

    
});