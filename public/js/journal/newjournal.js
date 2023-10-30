import { getFirestore, collection, query, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

console.log("!!! newjournal.js loaded !!!");

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
const currentUser = "YOUR_USER_NAME"; // You can replace this later

document.addEventListener("DOMContentLoaded", async function () {
    await initializePage();

    const journalForm = document.getElementById("journalForm");
    journalForm && journalForm.addEventListener("submit", handleJournalFormSubmission);
});

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
    let journal_entry = [];

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
        let transactionsIDs = [];
        let journalID = null;
        let creationDate = serverTimestamp();

        //For each transaction in the array containing the user input
        for (transaction in journal_entry) {

            var readAccount = [];
            const q = query(accounts_db, where('accountName', '==', accountSelect));
            const account_spec = await getDocs(q).then((querySnapshot) => {
                var tempDoc = [];
                querySnapshot.forEach((doc) => {
                    tempDoc.push({ id: doc.id });
                });
                readAccount = tempDoc;
            });
            let accountID = readAccount[0].id;

            // Add a new transaction document with a generated id.
            try {
                const docRef = await addDoc(transactions_db, {
                    creationDate: creationDate,
                    account: accountID,
                    journal: null,
                    debit: debitAmount,
                    credit: creditAmount,
                    user: currentUser
                });
                console.log("Transaction written with ID: ", docRef.id);
                transactionsIDs.push(docRef.id);        //add the transaction id to an array
            } catch (error) {
                console.error("Error adding transaction: ", error);
            };
        }

        //once all the transactions are processed, add their ids to a journal document
        try {
            const docRefJournal = await addDoc(journals_db, {
                creationDate: creationDate,
                transactions: transactionsIDs,
                user: currentUser
            });
            console.log("Journal written with ID: ", docRefJournal.id);
            ledgerID = docRefJournal.id;                //grab journal id
        } catch (error) {
            console.error("Error adding journal: ", error);
        };

        //go back and add journal id to transaction documents
        for (id in transactionsIDs) {
            await updateDoc(doc(db, 'transactions', id.toString()), {
                journal: journalID
            });
        }
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
    const q = query(journals_db);
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
                render: function (data, type, row) {
                    return '<button class="btn btn-info btn-sm">View/Edit</button>';  // Example action button
                }
            }
        ],
        pageLength: 10,
    });
}

async function getAccountsList() {
    const accountsQuery = query(accounts_db);

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push(doc.data().accountName);
        });
        return accountsList;
    } catch (error) {
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