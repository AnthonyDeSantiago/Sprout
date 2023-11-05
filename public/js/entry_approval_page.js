import { changeFieldValue, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("entry_approval_page.js has loaded");

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');

const rejectButton = document.getElementById('rejectButton');
const approveButton = document.getElementById('approveButton');
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


async function pendingModalCallback(entry) {
    $('#approval-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"modal-table"} tbody`);
    const transactions = entry.data().transactions;
    console.log("transactions length", transactions.length);
    console.log("transactions' ID's ", transactions);
    for (let i = 0; i < transactions.length; i++) {
        console.log('transaction description', transactions[0])
        const transaction = await getDocumentReference('transactions', transactions[i]);
        const row = modalTableBody.insertRow(i);
        row.innerHTML = `
            <td>Testing</td>
            <td>${transaction.description}</td>
            <td>${transaction.debit}</td>
            <td>${transaction.credit}</td>
        `;
    }
}

async function rejectedModalCallback(entry) {
    $('#rejected-modal').modal('show');
    console.log("called rejected modal");
}

async function approvedModalCallback(entry) {
    console.log("called approved modal");
}


initializeTable(pendingJournalEntries, 'journalEntry_table', pendingModalCallback);
initializeTable(rejectedJournalEntries, 'rejected_table', rejectedModalCallback);
initializeTable(approvedJournalEntries, 'approved_table', approvedModalCallback);

$('#approval-modal').on('hidden.bs.modal', function () {
    $('#modal-table tbody').empty();
    $('#commentField').val('');
    $('#commentError').text('');
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
        await changeFieldValue('journals', currentEntry, 'approval', 'rejected');
        location.reload();
    }
});

approveButton.addEventListener('click', async () => {
    await changeFieldValue('journals', currentEntry, 'approval', 'approved');
    location.reload();
});

  
  