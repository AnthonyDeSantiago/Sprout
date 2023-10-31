import { getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("journal_entry.js has loaded");

const urlParameters = new URLSearchParams(window.location.search);
const journal = urlParameters.get("journal");
const transactions = await getFieldValue('journals', journal, 'transactions');

console.log("journal id: ", journal);
console.log("transactions: ", transactions);
console.log("test transaction: ", await getDocumentReference('transactions', transactions[1]));

populateTable(transactions, 'journalEntry_table');
$(document).ready(function() {
    console.log("Is this working now?");
    $('#journalEntry_table').DataTable();
});

async function populateTable(transactions, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < transactions.length; i++) {
      const transaction = await getDocumentReference('transactions', transactions[i]);
      tableBody.innerHTML += `
            <tr>
                <td>${transaction.account}</td>
                <td>${transaction.user}</td>
                <td>${transaction.description}</td>
                <td>${transaction.debit}</td>
                <td>${transaction.credit}</td>
            </tr>
        `;
    }
}