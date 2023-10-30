import { capitalizeString, getAccountID, getDocsWithValue, getFieldValue } from "./database_module.mjs";

console.log("ledger.js has loaded!!!");

const urlParameters = new URLSearchParams(window.location.search);
const accountNumber = urlParameters.get("accountNumber");
const accountName = urlParameters.get("accountName");
const accountID = await getAccountID(accountNumber);
const journalEntries = await getDocsWithValue('journals', 'account', accountID);
const transactions = await getDocsWithValue('transactions', 'account', accountID);
const normalSide = capitalizeString(await getFieldValue('accounts', accountID, 'normalSide'));
const accountBreadCrumb = document.getElementById("accountBreadcrumb-element");



console.log("accountNumber:", accountNumber);
console.log("accountName:", accountName);
console.log("account ID:", accountID);
console.log("journal entries:", journalEntries);
console.log("transactions:", transactions);
console.log("debit: ", transactions[0].debit);
console.log("transactions length", transactions.length);
console.log("Normal side", normalSide);

populateLedgerTable(transactions, 'ledger');
printTotal();
accountBreadCrumb.textContent = accountName;




function populateLedgerTable(transactions, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      tableBody.innerHTML += `
            <tr>
                <td>${transaction.creationDate.toDate()}</td>
                <td>${transaction.user}</td>
                <td><a href="ledger.html">${transaction.journal}</td> 
                <td>${transaction.description}</td>
                <td>${transaction.debit}</td>
                <td>${transaction.credit}</td>
            </tr>
        `;
    }
}

$(document).ready(function() {
    console.log("Is this working now?");
    $('#ledger').DataTable();
});


function printTotal() {
    const totalElement = document.getElementById("account-total");
    const debitElement = document.getElementById("debit-total");
    const creditElement = document.getElementById("credit-total");

    let debitTotal = 0;
    let creditTotal = 0;

    for (let i = 0; i < transactions.length; i++) {
        debitTotal += transactions[i].debit;
        creditTotal += transactions[i].credit;
    }
    debitElement.textContent = debitTotal;
    creditElement.textContent = creditTotal;
    if (normalSide == 'DEBIT') {
        // const total = debitTotal - creditTotal;
        // totalElement.textContent = "Total: " + total;
        
    } else {
        // const total = creditTotal - debitTotal;
        // totalElement.textContent = "Total: " + total;

    }
}


  