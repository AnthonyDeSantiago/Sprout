console.log("!!! admin_table_newuserss.js loaded !!!");

import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const db = getFirestore();
const users = collection(db, 'users');

document.addEventListener("DOMContentLoaded", async function () {
    // Function to populate the extendable table with user data
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
    
    // Function to populate the extended table when a username is clicked
    async function showExtendedTable(username) {
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
    
        const userData = readUser[0];
        console.log(userData);
    
        const extendedTableHtml = `
            <table class="table table-bordered mt-3">
                <thead class="thead-dark">
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
            <div class="button-container mt-3">
                <button class="btn btn-success" onclick="approveUser('${userData.id}')">Approve</button>
                <button class="btn btn-danger" onclick="denyUser('${userData.id}')">Deny</button>
                <button class="btn btn-primary" onclick="setRole('${userData.userEmail}')">Set Role</button>
            </div>
        `;
    
        document.getElementById("extended-table").innerHTML = extendedTableHtml;
        document.getElementById("extended-table").style.display = "block";
    }
    
    // Load user data when the page loads
    // Load user data when the page loads
    loadUsers().then(() => {
        // Trigger a click event on the first row of the table
        const firstRow = document.querySelector('#userTable tbody tr');
        if (firstRow) {
            firstRow.click();
        }
    });
});
