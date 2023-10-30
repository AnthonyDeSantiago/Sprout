import { getAccountID, getDocsWithValue, getFieldValue } from "./database_module.mjs";

console.log("ledger.js has loaded!!!");

const urlParameters = new URLSearchParams(window.location.search);
const accountNumber = urlParameters.get("accountNumber");
const accountName = urlParameters.get("accountName");
const accountID = await getAccountID(accountNumber);
const journalEntries = await getDocsWithValue('journals', 'account', accountID);
const transactions = await getDocsWithValue('transactions', 'account', accountID);


console.log("accountNumber:", accountNumber);
console.log("accountName:", accountName);
console.log("account ID:", accountID);
console.log("journal entries:", journalEntries);
console.log("transactions:", transactions);
console.log("debit: ", transactions[0].debit);
console.log("transactions length", transactions.length);

populateLedgerTable(transactions, 'ledger');

function populateLedgerTable(transactions, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      tableBody.innerHTML += `
            <tr>
                <td>${transaction.creationDate.toDate()}</td>
                <td>${transaction.account}</td>
                <td>${transaction.user}</td>
                <td>${transaction.journal}</td>
                <td>${transaction.description}</td>
                <td>${transaction.debit}</td>
                <td>${transaction.credit}</td>
            </tr>
        `;
    }
}

$(document).ready(function() {
    console.log("Initializing");
    $('#ledger').DataTable();
});

  
//   document.addEventListener('DOMContentLoaded', function() {
//     const minDateInput = document.getElementById('min');
//     const maxDateInput = document.getElementById('max');
//     const tableBody = document.getElementById('ledger');
  
//     minDateInput.addEventListener('input', filterTable);
//     maxDateInput.addEventListener('input', filterTable);
//     console.log("Hello");
  
//     function filterTable() {
        
//       const minDate = new Date(minDateInput.value);
//       const maxDate = new Date(maxDateInput.value);
  
//       const rows = tableBody.querySelectorAll('tr');
  
//       rows.forEach(row => {
//         const creationDateCell = row.cells[0];
//         if (creationDateCell) {
//           const rowDate = new Date(creationDateCell.textContent);
          
//           if (rowDate >= minDate && rowDate <= maxDate) {
//             row.style.display = 'table-row';
//           } else {
//             row.style.display = 'none';
//           }
//         }
//       });
//     }
//   });
  