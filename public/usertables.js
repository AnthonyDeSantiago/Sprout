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
const auth = getAuth();

/* changes the placeholder picture to whatever you picked in the Sign up Function */
let profilePicture = document.getElementById("blank_choose_ur_pic");
let inputFile = document.getElementById("input_file");
inputFile.onchange = function(){
    profilePicture.src = URL.createObjectURL(inputFile.files[0]);
}

console.log("usertables.js loaded")


//--------------------------------------------------admin
document.addEventListener("DOMContentLoaded", async function () {
    const extendableTable = document.querySelector(".extendable-table");
    const extendedTable = document.querySelector(".extended-table");

    // Example: Function to populate the extendable table with user data
    function loadUsers() {
        // Replace this with your Firebase data retrieval logic
        // Loop through your users and create rows for each in the table
        const usersArray = [];
        const userDocs = await users.get().then((querySnapshot) => {
            const tempDoc = [];
            querySnapshot.forEach((doc) => {
                tempDoc.push({ id: doc.id, username: doc.username })
            });
            console.log(tempDoc);
            usersArray = tempDoc;
        })
        //const users = [{ username: "User1" }, { username: "User2" }, /* ... */];

        const tbody = extendableTable.querySelector("tbody");
        tbody.innerHTML = ""; // Clear existing rows

        usersArray.forEach((user) => {
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
        var userData = [];
        username = username.toString();
        const q = query(users, where('username', '==', username));
        const getUsers = await getDocs(q).then((querySnapshot) => {
            const tempDoc = [];
            querySnapshot.forEach((doc) => {
                tempDoc.push({ id: doc.id, ...doc.data() });
            });
            userData = tempDoc;
        })
        console.log(userData);
        // For demonstration purposes, let's assume the data is available in an array
        /*const userData = [
            { column1: "Value1", column2: "Value2", column3: "Value3", column4: "Value4" },
        ];*/

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
