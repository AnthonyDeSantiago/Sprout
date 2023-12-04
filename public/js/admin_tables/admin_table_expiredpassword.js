import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"
console.log("!!! admin_table_expiredpassword.js loaded !!!");


const auth = getAuth(); //Init Firebase Auth + get a reference to the service

const db = getFirestore();
const users = collection(db, 'users');

async function loadUsers() {
    var oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const q = query(usersRef, where('passwordCreatedAt', '<', oneYearAgo));
    const querySnapshot = await getDocs(q);
    const usersArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = ""; // Clear existing rows

    usersArray.forEach((user) => {
        if (user.role !== "deleted") {
            const row = document.createElement("tr");
            const firstNameCell = document.createElement("td");
            const lastNameCell = document.createElement("td");
            const datePasswordExpiredCell = document.createElement("td");
            const emailCell = document.createElement("td");

            firstNameCell.innerText = user.firstName || 'N/A';
            lastNameCell.innerText = user.lastName || 'N/A';
            datePasswordExpiredCell.innerText = user.passwordCreatedAt ? new Date(user.passwordCreatedAt.seconds * 1000).toLocaleDateString() : 'N/A';
            emailCell.innerText = user.email || 'N/A';

            row.appendChild(firstNameCell);
            row.appendChild(lastNameCell);
            row.appendChild(datePasswordExpiredCell);
            row.appendChild(emailCell);

            tbody.appendChild(row);
        }
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadUsers();
});