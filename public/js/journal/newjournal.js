console.log("!!! newjournal.js loaded !!!");

import { getFirestore, collection, query, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const db = getFirestore();
const journal = collection(db, 'journal');
const currentUser = "YOUR_USER_NAME"; // You can replace this later


document.addEventListener("DOMContentLoaded", async function () {
    await initializePage();

    const journalForm = document.getElementById("journalForm");
    journalForm && journalForm.addEventListener("submit", handleJournalFormSubmission);
});
const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            user.providerData.forEach((profile) => {
                userDisplay = profile.displayName;
                userEmail = profile.email;
            });
            userData = await fetchUserFromEmail(userEmail);
            username = userData.username;
            
            await initializePage();

            const journalForm = document.getElementById("journalForm");
            journalForm && journalForm.addEventListener("submit", handleJournalFormSubmission);
        }
    })
}

async function initializePage() {
    await loadJournalEntries();
    await populateAccountsDropdown();
}

function logAccountingError(error, user) {
    const errorLog = collection(db, 'accountingErrors');
    addDoc(errorLog, {
        errorMessage: error,
        date: new Date().toISOString(),
        user: user
    });
}

function handleJournalFormSubmission(event) {
    event.preventDefault();

    const accountSelect = document.getElementById("accountSelect");
    const debitAmount = document.getElementById("debitAmount");
    const creditAmount = document.getElementById("creditAmount");
    const sourceDocument = document.getElementById("sourceDocument");
    let errors = [];

    if (!accountSelect.value) {
        errors.push("Account not selected.");
        logAccountingError("Account not selected.", currentUser);
    }

    if (debitAmount.value <= 0 || isNaN(debitAmount.value)) {
        errors.push("Invalid debit amount.");
        logAccountingError("Invalid debit amount.", currentUser);
    }

    if (creditAmount.value <= 0 || isNaN(creditAmount.value)) {
        errors.push("Invalid credit amount.");
        logAccountingError("Invalid credit amount.", currentUser);
    }

    if (debitAmount.value !== creditAmount.value) {
        errors.push("Debit and credit amounts do not match.");
        logAccountingError("Debit and credit amounts do not match.", currentUser);
    }

    const file = sourceDocument.files[0];
    if (file) {
        const validFileTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".jpg", ".png"];
        const isValidFileType = validFileTypes.some(type => file.name.endsWith(type));
        if (!isValidFileType) {
            errors.push("Invalid file type.");
            logAccountingError("Invalid file type.", currentUser);
        }
    } else {
        errors.push("Missing source document.");
        logAccountingError("Missing source document.", currentUser);
    }

    if (errors.length > 0) {
        showErrorModal(errors);
    } else {
      // The actual process of the form submission starts here.

      let transactionsIDs = [];
      let journalID = null;
      let creationDate = serverTimestamp();

      // For each transaction in the array containing the user input
      for (transaction in journal_entry) {
          // ... (your logic to add the transaction)
      }

      // Once all the transactions are processed, add their ids to a journal document
      // ... (your logic to add the journal)

      // Go back and add journal id to transaction documents
      // ... (your logic to update transactions with the journal id)
  
    }
}

function showErrorModal(errors) {
    let errorList = document.createElement("ul");
    errors.forEach(error => {
        let listItem = document.createElement("li");
        listItem.textContent = error;
        errorList.appendChild(listItem);
    });

    let errorModalContent = document.getElementById("errorModalContent");
    errorModalContent.innerHTML = "";
    errorModalContent.appendChild(errorList);

    $('#errorModal').modal('show');  // Assuming you have jQuery and Bootstrap modal
}

async function loadJournalEntries() {
    const q = query(journal);
    const journalDocs = await getDocs(q);
    const journalEntriesArray = [];

    journalDocs.forEach((doc) => {
        journalEntriesArray.push({ id: doc.id, ...doc.data() });
    });

    const table = $('#journalEntriesTable').DataTable({
        data: journalEntriesArray,
        columns: [
            { data: 'date', title: 'Date' },
            { data: 'accountName', title: 'Account Name' },
            { data: 'debitAmount', title: 'Debit Amount' },
            { data: 'creditAmount', title: 'Credit Amount' },
            { data: 'status', title: 'Status' },
            { 
                data: null, 
                title: 'Action',
                render: function(data, type, row) {
                    return '<button class="btn btn-info btn-sm">View/Edit</button>';  // Example action button
                }
            }
        ],
        pageLength: 10,
    });
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection);

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push(doc.data().accountName);
        });
        return accountsList;
    } catch (error) 
        {
        console.error('Error happened: ', error);
        throw error;
                }
}

async function populateAccountsDropdown() {
    const accounts = await getAccountsList();
    const accountSelect = document.getElementById('accountSelect');
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        accountSelect.appendChild(option);
    });
   
}
checkAuthState();



   