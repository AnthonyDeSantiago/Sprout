import { addField, changeFieldValue, convertBalanceToFloat, deleteAllDocumentsInCollection, formatNumberToCurrency, getAllDocsFromCollection, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("event-log.js has loaded");

const events = await getAllDocsFromCollection('eventLog');

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');


let currentEntry = null;

console.log("events length: ", events[0].id);

function loadDataTables() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
}
  
async function initializeTable(events, tableId, callback) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log("Code Reached here:", event.data);
        const row = tableBody.insertRow(i);
        row.innerHTML = `
            <td>${event.data.timestamp.toDate()}</td>
            <td>${event.id}</td>
            <td>${event.data.userId}</td>
            <td>${event.data.eventType}</td>
        `;
        row.addEventListener('click', async () => {
            currentEntry = event.id;
            callback(event);
        });
    }
}

async function initializeTableWithComments(entries, tableId, callback) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < entries.size; i++) {
        const entry = entries.docs[i];
        const row = tableBody.insertRow(i);
        row.innerHTML = `
            <td>${entry.data().creationDate.toDate()}</td>
            <td>${entry.id}</td>
            <td>${entry.data().user}</td>
            <td>${entry.data().description}</td>
            <td>${entry.data().comment}</td>
        `;
        row.addEventListener('click', async () => {
            currentEntry = entry.id;
            callback(entry);
        });
    }
}

async function pendingModalCallback(event) {
    $('#approval-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"modal-table"} tbody`);
    const beforeImage = event.data.beforeImage;
    const afterImage = event.data.afterImage;

    var row = modalTableBody.insertRow(0);
    row.innerHTML = `
            <td>${beforeImage.accountCategory}</td>
            <td>${beforeImage.accountDescription}</td>
            <td>${beforeImage.accountName}</td>
            <td>${beforeImage.accountNumber}</td>
            <td>${beforeImage.accountSubcategory}</td>
            <td>${beforeImage.active}</td>
            <td>${beforeImage.balance}</td>
            <td>${beforeImage.comment}</td>
            <td>${beforeImage.normalSide}</td>
            <td>${beforeImage.order}</td>
            <td>${beforeImage.timestampAdded}</td>
        `;

    row = modalTableBody.insertRow(1);
    row.innerHTML = `
            <td>${afterImage.accountCategory}</td>
            <td>${afterImage.accountDescription}</td>
            <td>${afterImage.accountName}</td>
            <td>${afterImage.accountNumber}</td>
            <td>${afterImage.accountSubcategory}</td>
            <td>${afterImage.active}</td>
            <td>${afterImage.balance}</td>
            <td>${afterImage.comment}</td>
            <td>${afterImage.normalSide}</td>
            <td>${afterImage.order}</td>
            <td>${afterImage.timestampAdded}</td>
        `;
}

async function rejectedModalCallback(entry) {
    $('#rejected-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"rejected-modal-table"} tbody`);
    const transactions = entry.data().transactions;
    for (let i = 0; i < transactions.length; i++) {
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
}

async function approvedModalCallback(entry) {
    $('#approved-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"approved-modal-table"} tbody`);
    const transactions = entry.data().transactions;
    for (let i = 0; i < transactions.length; i++) {
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
}


initializeTable(events, 'journalEntry_table', pendingModalCallback);
// initializeTableWithComments(rejectedJournalEntries, 'rejected_table', rejectedModalCallback);
// initializeTableWithComments(approvedJournalEntries, 'approved_table', approvedModalCallback);

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

// rejectButton.addEventListener('click', async () => {
//     console.log('selectedRow', currentEntry);

//     if (commentField.value.trim() === '') {
//         commentError.textContent = 'Please enter a comment before rejecting.';
//     } else {
//         commentError.textContent = '';
//         console.log("Comment Field Text: ", commentField.value);
//         await changeFieldValue('journals', currentEntry, 'approval', 'rejected');
//         await addField('journals', currentEntry, 'comment', commentField.value);
//         location.reload();
//     }
// });

// approveButton.addEventListener('click', async () => {
//     const journalRef = await getDocumentReference("journals", currentEntry);
//     const transactions = journalRef.transactions;
//     console.log("transactions: ", transactions);

//     for (let i = 0; i < transactions.length; i++) {
//         const transaction = await getDocumentReference("transactions", transactions[i]);
//         const account = transaction.account;
//         const accountData = await getDocumentReference("accounts", account);
//         const debit = transaction.debit;
//         const credit = transaction.credit;
//         const normalSide = accountData.normalSide;
//         var balance = await convertBalanceToFloat(accountData.balance);
//         console.log("Balance: ", balance);
//         if (normalSide == "Debit") {
//             balance += debit;
//             balance -= credit;
//             balance = await formatNumberToCurrency(balance);
//             console.log("Converted Balance: ", balance);
//             await changeFieldValue("accounts", account, 'balance', balance);
//         } else if (normalSide == "Credit") {
//             balance -= debit;
//             balance += credit;
//             balance = await formatNumberToCurrency(balance);
//             console.log("Converted Balance: ", balance);
//             await changeFieldValue("accounts", account, 'balance', balance);
//         }

//     }
//     await addField('journals', currentEntry, 'comment', commentField.value);
//     await changeFieldValue('journals', currentEntry, 'approval', 'approved');
//     location.reload();
// });

// returnToPendingButton.addEventListener('click', async () => {
//     await changeFieldValue('journals', currentEntry, 'approval', 'pending');
//     location.reload();
// });

// returnToPendingButton2.addEventListener('click', async () => {
//     const journalRef = await getDocumentReference("journals", currentEntry);
//     const transactions = journalRef.transactions;
//     console.log("transactions: ", transactions);

//     for (let i = 0; i < transactions.length; i++) {
//         const transaction = await getDocumentReference("transactions", transactions[i]);
//         const account = transaction.account;
//         const accountData = await getDocumentReference("accounts", account);
//         const debit = transaction.debit;
//         const credit = transaction.credit;
//         const normalSide = accountData.normalSide;
//         var balance = await convertBalanceToFloat(accountData.balance);
//         console.log("Balance: ", balance);
//         if (normalSide == "Credit") {
//             balance += debit;
//             balance -= credit;
//             balance = await formatNumberToCurrency(balance);
//             console.log("Converted Balance: ", balance);
//             await changeFieldValue("accounts", account, 'balance', balance);
//         } else if (normalSide == "Debit") {
//             balance -= debit;
//             balance += credit;
//             balance = await formatNumberToCurrency(balance);
//             console.log("Converted Balance: ", balance);
//             await changeFieldValue("accounts", account, 'balance', balance);
//         }
//     }
//     await changeFieldValue('journals', currentEntry, 'approval', 'pending');
//     location.reload();
// });

  
  