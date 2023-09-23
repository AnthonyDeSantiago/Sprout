import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

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
const newUserRequest = collection(db, 'new_user_requests')

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



document.getElementById("login_form").addEventListener("submit", async function (e) {
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
    
    try{
        //Ideally this date would be populating from the server timestamp, not the client-side date - TBD IN FUTURE UPDATE
        const date = new Date();
        let month = String(date.getMonth()+1).padStart(2,"0");
        let year = String(date.getFullYear()).slice(2);
        let userNameCount = await testUserName(firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year);
        
        if(userNameCount > 0){
            let username = firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year + userNameCount;
        }
        else{
            let username = firstName.slice(0,1).toLowerCase() + lastName.toLowerCase() + month + year;
        }
            
        const newUser = {
            userEmail: userEmail,
            firstName: firstName,
            lastName: lastName,
            address: address,
            DOB : dateOfBirth,
            password: password,
            createdAt: serverTimestamp(),
            username: username
        }
            
        emailAlreadyInUse = await testUserEmail(userEmail);
            
        if(!emailAlreadyInUse){
            addDoc(newUserRequest, newUser, username);
            console.log('New user request added successfully!');
        } else{ 
            alert("User email already in use. Return to the login screen and choose Forgot Password if you are having trouble accessing your account.")
            console.log('User email already in use.');
        }
    } catch(error) {
        console.log(error)
    }

    
    return true;
})

async function testUserEmail(testEmail){
    const query = await getCountFromServer(newUserRequest.where('UserEmail', '==', testEmail));
    
    if (!query.empty) {
        exists = true;
    } else {
        exists = false;
    }

    return exists;
}

async function testUserName(testUsername){
    const docCheck = await newUserRequest.getDoc(testUsername);
    
    if (!query.empty) {
        count = query.data().count;
    } else {
        count = 0;
    }

    return count;
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
//--------------------------------------------------admin
document.addEventListener("DOMContentLoaded", function () {
    const extendableTable = document.querySelector(".extendable-table");
    const extendedTable = document.querySelector(".extended-table");

    // Example: Firebase initialization code
    // Initialize Firebase with your config
    

    // Example: Function to populate the extendable table with user data
    function loadUsers() {
        // Replace this with your Firebase data retrieval logic
        // Loop through your users and create rows for each in the table
        const users = [{ username: "User1" }, { username: "User2" }, /* ... */];

        const tbody = extendableTable.querySelector("tbody");
        tbody.innerHTML = ""; // Clear existing rows

        users.forEach((user) => {
            const row = document.createElement("tr");
            const usernameCell = document.createElement("td");

            // Add a click event to the username cell
            usernameCell.innerText = user.username;
            usernameCell.addEventListener("click", () => {
                showExtendedTable(user.username);
            });

            row.appendChild(usernameCell);
            tbody.appendChild(row);
        });
    }

    // Example: Function to populate the extended table when a username is clicked
    function showExtendedTable(username) {
        // Replace this with your Firebase data retrieval logic
        // You may want to fetch data for the specific user by their username
        // and populate the extended table with the unknown columns

        // For demonstration purposes, let's assume the data is available in an array
        const userData = [
            { column1: "Value1", column2: "Value2", column3: "Value3", column4: "Value4" },
        ];

        const extendedTableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                        <th>Column 3</th>
                        <th>Column 4</th>
                    </tr>
                </thead>
                <tbody>
                    ${userData
                        .map(
                            (data) => `
                        <tr>
                            <td>${data.column1}</td>
                            <td>${data.column2}</td>
                            <td>${data.column3}</td>
                            <td>${data.column4}</td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        `;

        extendedTable.innerHTML = extendedTableHtml;
    }

    // Load user data when the page loads
    loadUsers();
});
