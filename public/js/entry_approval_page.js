import { getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("entry_approval_page.js has loaded");

const urlParameters = new URLSearchParams(window.location.search);
const journal = urlParameters.get("journal");
const transactions = await getFieldValue('journals', journal, 'transactions');
const creationDate = await getFieldValue('journals', journal, 'creationDate');
const journalBreadCrumb = document.getElementById("accountBreadcrumb-element");

journalBreadCrumb.textContent = "Creation Date: " + creationDate.toDate();


function loadDataTables() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  
async function initializeTable(transactions, tableId) {
const tableBody = document.querySelector(`#${tableId} tbody`);
for (let i = 0; i < transactions.length; i++) {
    const transaction = await getDocumentReference('transactions', transactions[i]);
    tableBody.innerHTML += `
    <tr>
        <td><input type="checkbox"></td>
        <td>${await getFieldValue('accounts', transaction.account, 'accountName')}</td>
        <td>${transaction.user}</td>
        <td>${transaction.description}</td>
        <td>${transaction.debit}</td>
        <td>${transaction.credit}</td>
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
  
  initializeTable(transactions, 'journalEntry_table');
  
  