import { getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("entry_approval_page.js has loaded");

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');

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
  
async function initializeTable(entries, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const modalTableBody = document.querySelector(`#${"modal-table"} tbody`);
    for (let i = 0; i < entries.size; i++) {
        const entry = entries.docs[i];
        const row = tableBody.insertRow(i);
        console.log("Code reached here");
        row.innerHTML = `
            <td>${entry.data().creationDate.toDate()}</td>
            <td>${entry.id}</td>
            <td>${entry.data().user}</td>
            <td>${entry.data().description}</td>
        `;
        row.addEventListener('click', async () => {
            console.log("Row clicked, the entry is: ", entry.id);
            $('#approval-modal').modal('show');
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
        });
    }
  
    try {
      await loadDataTables();
      $(document).ready(function () {
        $(`#${tableId}`).DataTable();
      });
    } catch (error) {
      console.error('Error loading DataTables:', error);
    }
}

async function initializeModalTable(journal_entry, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const journalEntryData = journal_entry.data();
    const transactions = journalEntryData.transactions;

    for (let i = 0; i < transactions.length; i++) {
        const transaction = await getDocumentReference('transactions', transactions[i]);
        const row = tableBody.insertRow(i);
        row.innerHTML = `
            <td>${await getDocumentReference('accounts', transaction.account).accountName}</td>
            <td>${transaction.description}</td>
            <td>${transaction.debit}</td>
            <td>${transaction.credit}</td>
        `;
    }
}
  
initializeTable(pendingJournalEntries, 'journalEntry_table');
$('#approval-modal').on('hidden.bs.modal', function () {
    $('#modal-table tbody').empty();
    $('#commentField').val('');
    $('#commentError').text('');
});


const rejectButton = document.getElementById('rejectButton');
const approveButton = document.getElementById('approveButton');
const commentField = document.getElementById('commentField');
const commentError = document.getElementById('commentError');

rejectButton.addEventListener('click', () => {
    if (commentField.value.trim() === '') {
        commentError.textContent = 'Please enter a comment before rejecting.';
    } else {
        commentError.textContent = '';
    }
});

approveButton.addEventListener('click', () => {
    commentField.style.display = 'none';
});

  
  