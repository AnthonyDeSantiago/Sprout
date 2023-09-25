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
//const auth = getAuth(app);

console.log("usertables.js loaded")


//--------------------------------------------------admin
document.addEventListener("DOMContentLoaded", async function () {
    const extendableTable = document.querySelector(".extendable-table");
    const extendedTable = document.querySelector(".extended-table");

    // Example: Function to populate the extendable table with user data
    async function loadUsers() {
        // Replace this with your Firebase data retrieval logic
        // Loop through your users and create rows for each in the table
        var usersArray = [];
        const q = query(users); //HERE IS WHERE WE COULD SET LIMITS IF WE WANTED TO PAGE THROUGH
        const userDocs = await getDocs(q).then((querySnapshot) => {
            var tempDoc = [];
            querySnapshot.forEach((doc) => {
                tempDoc.push({ id: doc.id, username: doc.get("username") })
            });
            usersArray = tempDoc;
        });
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
    async function showExtendedTable(username) {
        // Replace this with your Firebase data retrieval logic
        // You may want to fetch data for the specific user by their username
        // and populate the extended table with the unknown columns
        var readUser = [];
        username = username.toString();
        const q = query(users, where('username', '==', username));
        const getUsers = await getDocs(q).then((querySnapshot) => {
            var tempDoc = [];
            querySnapshot.forEach((doc) => {
                tempDoc.push({ id: doc.id, ...doc.data() });
            });
            readUser = tempDoc;
        })

        //REMOVE CREATED AT VARIABLES IN FUTURE, WILL NEED THEM TO BE IN USERDATA ARRAY
        //Remove password information from user info before writing to the table
        const userData = readUser.map(({ password, question1, question2, answer1, answer2, ...rest }) => rest);
        console.log(userData);

        const extendedTableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Approved</th>
                        <th>Role</th>
                        <th>Suspended</th>
                        <th>E-mail</th>
                        <th>Address</th>
                        <th>DOB</th>
                        <th>Password Last Created</th>
                        <th>User Created</th>
                        <th>User ID</th>
                    </tr>
                </thead>
                <tbody>
                    ${userData
                        .map(
                            (data) => `
                        <tr>
                            <td>${data.firstName}</td>
                            <td>${data.lastName}</td>
                            <td>${data.username}</td>
                            <td>${data.approved}</td>
                            <td>${data.role}</td>
                            <td>${data.suspended}</td>
                            <td>${data.userEmail}</td>
                            <td>${data.address}</td>
                            <td>${data.DOB}</td>
                            <td>${data.passwordCreatedAt}</td>
                            <td>${data.userCreatedAt}</td>
                            <td>${data.id}</td>
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
