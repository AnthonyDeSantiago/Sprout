console.log("!!! admin_table_newuserss.js loaded !!!");

//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
//import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"


//const auth = getAuth();

const db = getFirestore();
const users = collection(db, 'users');


//--------------------------------------------------admin
document.addEventListener("DOMContentLoaded", async function () {
    const extendableTable = document.querySelector(".extendable-table");
    const extendedTable = document.querySelector(".extended-table");

    // Example: Function to populate the extendable table with user data
    async function loadUsers() {
        const q = query(users, where('approved', '==', false), where('role', '!=', "deleted"));
        const userDocs = await getDocs(q);
        const usersArray = [];
    
        userDocs.forEach((doc) => {
            usersArray.push({ id: doc.id, ...doc.data() });
        });
    
        const table = $('#userTable').DataTable({
            data: usersArray,
            columns: [
                { data: 'username' },
                { data: 'userEmail' },
                { data: 'firstName' },
                { data: 'lastName' },
                { data: 'address' },
                { data: 'DOB' }
            ],
            pageLength: 10,
            // Add more DataTables options as needed
        });
    
        // Add a click event listener to rows for showing extended table
        $('#userTable tbody').on('click', 'tr', function () {
            const data = table.row(this).data();
            showExtendedTable(data.username);
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
                <!-- To approve user, set suspended to false, suspensionEndDate to null value, approved to true -->
                <button class="approve-button" onclick="approveUser('${userData.id}')">Approve</button>
                <button class="deny-button" onclick="denyUser('${userData.id}')">Deny</button>
                <!-- To set role, change role to "admin", "manager", or "regular" --> 
                <button class="set-role-button" onclick="setRole('${userData.userEmail}')">Set Role</button>
            </div>
        `;
    
        extendedTable.innerHTML = extendedTableHtml;
        document.getElementById("extended-table").style.display = "contents";
    }
    
    // Load user data when the page loads
    loadUsers();
});
