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
for (let i = 0; i < entries.size; i++) {
    const entry = entries.docs[i];
    tableBody.innerHTML += `
    <tr>
        <td>${entry.data().creationDate.toDate()}</td>
        <td>${entry.id}</td>
        <td>${entry.data().user}</td>
        <td>${entry.data().description}</td>
    </tr>
    `;
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
  
initializeTable(pendingJournalEntries, 'journalEntry_table');
  
  