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
        });
    
        // Get the user data object
        const userData = readUser[0];
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
                    <tr>
                        <td>${userData.firstName}</td>
                        <td>${userData.lastName}</td>
                        <td>${userData.username}</td>
                        <td>${userData.approved}</td>
                        <td>${userData.role}</td>
                        <td>${userData.suspended}</td>
                        <td>${userData.userEmail}</td>
                        <td>${userData.address}</td>
                        <td>${userData.DOB}</td>
                        <td>${userData.passwordCreatedAt}</td>
                        <td>${userData.userCreatedAt}</td>
                        <td>${userData.id}</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Buttons for Edit, Delete, Email, and Suspend -->
            <div class="button-container">
                <button class="edit-button" onclick="editUser('${userData.id}')">Edit User</button>
                <button class="delete-button" onclick="confirmDelete('${userData.id}')">Delete</button>
                <button class="email-button" onclick="emailUser('${userData.userEmail}')">Email User</button>
                <button class="suspend-button" onclick="suspendUser('${userData.id}')">Suspend</button>
            </div>
        `;
    
        extendedTable.innerHTML = extendedTableHtml;
        document.getElementById("extended-table").style.display = "contents";
    }
    
    // Load user data when the page loads
    loadUsers();
});

