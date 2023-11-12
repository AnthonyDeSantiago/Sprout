import { addField, changeFieldValue, convertBalanceToFloat, formatNumberToCurrency, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("entry_approval_page.js has loaded");

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');

const rejectButton = document.getElementById('rejectButton');
const approveButton = document.getElementById('approveButton');
const returnToPendingButton = document.getElementById('returnToPendingButton');
const returnToPendingButton2 = document.getElementById("returnToPendingButton2");
const commentField = document.getElementById('commentField');
const commentError = document.getElementById('commentError');

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
        const row = tableBody.insertRow(i);
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
            console.log("Row clicked, the entry is: ", entry.id);
            currentEntry = entry.id;
            callback(entry);
        });
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


initializeTable(pendingJournalEntries, 'journalEntry_table', pendingModalCallback);
initializeTableWithComments(rejectedJournalEntries, 'rejected_table', rejectedModalCallback);
initializeTableWithComments(approvedJournalEntries, 'approved_table', approvedModalCallback);

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

rejectButton.addEventListener('click', async () => {
    console.log('selectedRow', currentEntry);

    if (commentField.value.trim() === '') {
        commentError.textContent = 'Please enter a comment before rejecting.';
    } else {
        commentError.textContent = '';
        console.log("Comment Field Text: ", commentField.value);
        await changeFieldValue('journals', currentEntry, 'approval', 'rejected');
        await addField('journals', currentEntry, 'comment', commentField.value);
        location.reload();
    }
});

approveButton.addEventListener('click', async () => {
    const journalRef = await getDocumentReference("journals", currentEntry);
    const transactions = journalRef.transactions;
    console.log("transactions: ", transactions);

    for (let i = 0; i < transactions.length; i++) {
        const transaction = await getDocumentReference("transactions", transactions[i]);
        const account = transaction.account;
        const accountData = await getDocumentReference("accounts", account);
        const debit = transaction.debit;
        const credit = transaction.credit;
        const normalSide = accountData.normalSide;
        var balance = await convertBalanceToFloat(accountData.balance);
        console.log("Balance: ", balance);
        if (normalSide == "Debit") {
            balance += debit;
            balance -= credit;
            balance = await formatNumberToCurrency(balance);
            console.log("Converted Balance: ", balance);
            await changeFieldValue("accounts", account, 'balance', balance);
        } else if (normalSide == "Credit") {
            balance -= debit;
            balance += credit;
            balance = await formatNumberToCurrency(balance);
            console.log("Converted Balance: ", balance);
            await changeFieldValue("accounts", account, 'balance', balance);
        }

    }
    await addField('journals', currentEntry, 'comment', commentField.value);
    await changeFieldValue('journals', currentEntry, 'approval', 'approved');
    location.reload();
});

returnToPendingButton.addEventListener('click', async () => {
    await changeFieldValue('journals', currentEntry, 'approval', 'pending');
    location.reload();
});

returnToPendingButton2.addEventListener('click', async () => {
    const journalRef = await getDocumentReference("journals", currentEntry);
    const transactions = journalRef.transactions;
    console.log("transactions: ", transactions);

    for (let i = 0; i < transactions.length; i++) {
        const transaction = await getDocumentReference("transactions", transactions[i]);
        const account = transaction.account;
        const accountData = await getDocumentReference("accounts", account);
        const debit = transaction.debit;
        const credit = transaction.credit;
        const normalSide = accountData.normalSide;
        var balance = await convertBalanceToFloat(accountData.balance);
        console.log("Balance: ", balance);
        if (normalSide == "Credit") {
            balance += debit;
            balance -= credit;
            balance = await formatNumberToCurrency(balance);
            console.log("Converted Balance: ", balance);
            await changeFieldValue("accounts", account, 'balance', balance);
        } else if (normalSide == "Debit") {
            balance -= debit;
            balance += credit;
            balance = await formatNumberToCurrency(balance);
            console.log("Converted Balance: ", balance);
            await changeFieldValue("accounts", account, 'balance', balance);
        }
    }
    await changeFieldValue('journals', currentEntry, 'approval', 'pending');
    location.reload();
});

  
  