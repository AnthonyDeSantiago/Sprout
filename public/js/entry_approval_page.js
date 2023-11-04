import { getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("entry_approval_page.js has loaded");

// const urlParameters = new URLSearchParams(window.location.search);
// const journal = urlParameters.get("journal");
// const transactions = await getFieldValue('journals', journal, 'transactions');
// const creationDate = await getFieldValue('journals', journal, 'creationDate');
// const journalBreadCrumb = document.getElementById("accountBreadcrumb-element");

// journalBreadCrumb.textContent = "Creation Date: " + creationDate.toDate();

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
console.log("References: ", pendingJournalEntries.size);


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

  
  