import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"
import { addField, changeFieldValue, convertBalanceToFloat, formatNumberToCurrency, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "/js/database_module.mjs";

console.log("!!! user_journals.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let currentUser = "YOUR_USER_NAME"; // You can replace this later
let journals = [];
let journalEntriesTable = null;
let accountsList = [];

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');



let currentEntry = null;

console.log("Num of Pending Entries: ", pendingJournalEntries.size);
console.log("Num of Rejected Entries: ", rejectedJournalEntries.size);
console.log("approvedJournalEntries: ", approvedJournalEntries.size);


function loadDataTables() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
}
  
async function initializeTable(entries, tableId, callback) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < entries.size; i++) {
        const entry = entries.docs[i];
        if(entry.data().user.toString() == currentUser){   
            const row = tableBody.insertRow(i);  
            if(entry.data().type == "adjusting"){   row.style.backgroundColor = "#DFFFFF";  };
            row.innerHTML = `
                <td>${entry.data().creationDate.toDate()}</td>
                <td>${entry.id}</td>
                <td>${entry.data().user}</td>
                <td>${entry.data().description}</td>
            `;
            row.addEventListener('click', async () => {
                console.log("Row clicked, the entry is: ", entry.id);
                currentEntry = entry.id;
                callback(entry);
            });
        };
    }
}

async function initializeTableWithComments(entries, tableId, callback) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < entries.size; i++) {
        const entry = entries.docs[i];
        if(entry.data().user.toString() == currentUser){   
            const row = tableBody.insertRow(i);  
            if(entry.data().type == "adjusting"){   row.style.backgroundColor = "#DFFFFF";  };
            row.innerHTML = `
                <td>${entry.data().creationDate.toDate()}</td>
                <td>${entry.id}</td>
                <td>${entry.data().user}</td>
                <td>${entry.data().description}</td>
                <td>${entry.data().comment}</td>
            `;
            
            row.addEventListener('click', async () => {
                console.log("Row clicked, the entry is: ", entry.id);
                currentEntry = entry.id;
                callback(entry);
            });
        };
    }
}

async function pendingModalCallback(entry) {
    $('#approval-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"modal-table"} tbody`);
    const transactions = entry.data().transactions;
    for (let i = 0; i < transactions.length; i++) {
        console.log('transaction description', transactions[0])
        const transaction = await getDocumentReference('transactions', transactions[i]);
        const accountData = await getDocumentReference('accounts', transaction.account);
        const row = modalTableBody.insertRow(i);
        row.innerHTML = `
            <td>${accountData.accountNumber}</td>
            <td>${accountData.accountName}</td>
            <td>${transaction.description}</td>
            <td>${transaction.debit}</td>
            <td>${transaction.credit}</td>
        `;
    }
}

async function rejectedModalCallback(entry) {
    $('#rejected-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"rejected-modal-table"} tbody`);
    const transactions = entry.data().transactions;
    console.log("transactions in rej: ", transactions);
    for (let i = 0; i < transactions.length; i++) {
        console.log('transaction description', transactions[0])
        const transaction = await getDocumentReference('transactions', transactions[i]);
        const accountData = await getDocumentReference('accounts', transaction.account);
        const row = modalTableBody.insertRow(i);
        row.innerHTML = `
            <td>${accountData.accountName}</td>
            <td>${transaction.description}</td>
            <td>${transaction.debit}</td>
            <td>${transaction.credit}</td>
        `;
    }
    console.log("called rejected modal");
}

async function approvedModalCallback(entry) {
    $('#approved-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"approved-modal-table"} tbody`);
    const transactions = entry.data().transactions;
    console.log("transactions in rej: ", transactions);
    for (let i = 0; i < transactions.length; i++) {
        console.log('transaction description', transactions[0])
        const transaction = await getDocumentReference('transactions', transactions[i]);
        const accountData = await getDocumentReference('accounts', transaction.account);
        const row = modalTableBody.insertRow(i);
        row.innerHTML = `
            <td>${accountData.accountName}</td>
            <td>${transaction.description}</td>
            <td>${transaction.debit}</td>
            <td>${transaction.credit}</td>
        `;
    }
    console.log("called approved modal");
}



$('#approval-modal').on('hidden.bs.modal', function () {
    $('#modal-table tbody').empty();
    $('#commentField').val('');
    $('#commentError').text('');
});

$('#rejected-modal').on('hidden.bs.modal', function () {
    $('#rejected-modal-table tbody').empty();
});

$('#approved-modal').on('hidden.bs.modal', function () {
    $('#approved-modal-table tbody').empty();
});


const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;
            console.log(">>> Username = " + currentUser);
            document.getElementById("journalPageTitle").textContent = userData.firstName + " " + userData.lastName + "'s Journal Entries";

            initializeTable(pendingJournalEntries, 'journalEntry_table', pendingModalCallback);
            initializeTableWithComments(rejectedJournalEntries, 'rejected_table', rejectedModalCallback);
            initializeTableWithComments(approvedJournalEntries, 'approved_table', approvedModalCallback);

            try {
                await loadDataTables();
                $(document).ready(function () {
                $(`#${'journalEntry_table'}`).DataTable();
                $(`#${'rejected_table'}`).DataTable();
                $(`#${'approved_table'}`).DataTable();
                });
            } catch (error) {
                console.error('Error loading DataTables:', error);
            }

        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}



checkAuthState();



