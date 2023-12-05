import { capitalizeString, getAccountID, getDocsWithValue, getFieldValue, getDocReferencesWithValue, getDocumentReference } from "./database_module.mjs";

console.log("ledger.js has loaded!!!");

const urlParameters = new URLSearchParams(window.location.search);
const accountNumber = urlParameters.get("accountNumber");
const accountName = urlParameters.get("accountName");
const accountID = await getAccountID(accountNumber);
const normalSide = capitalizeString(await getFieldValue('accounts', accountID, 'normalSide'));
const accountBreadCrumb = document.getElementById("accountBreadcrumb-element");
const approvedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'approved');
const specJs = getJournalsSpecificToCurrentAccount(approvedJournalEntries);
const approvedTransactions = getTransactions(specJs);

const transactionsSpecificToCurrentAccount = await getDocReferencesWithValue('transactions', 'account', accountID);
console.log("!!!!!!!!!!!!", transactionsSpecificToCurrentAccount);

populateLedgerTable(transactionsSpecificToCurrentAccount, 'ledger');
printTotal();
accountBreadCrumb.textContent = accountName;


function loadDataTables() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
}

async function populateLedgerTable(transactions, tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < transactions.docs.length; i++) {
      const transaction = transactions.docs[i].data();
      tableBody.innerHTML += `
            <tr>
                <td>${transaction.creationDate.toDate()}</td>
                <td>${transaction.user}</td>
                <td>${transaction.description}</td>
                <td>${transaction.debit}</td>
                <td>${transaction.credit}</td>
                <td><a href="journal_entry.html?journal=${transaction.journal}">${transaction.journal}</a></td>
            </tr>
        `;
    }
    try {
        await loadDataTables();
        $(document).ready(function () {
          $(`#${'ledger'}`).DataTable();
        });
    } catch (error) {
        console.error('Error loading DataTables:', error);
    }
}



async function printTotal() {
    const totalElement = document.getElementById("account-total");
    const debitElement = document.getElementById("debit-total");
    const creditElement = document.getElementById("credit-total");
    

    let debitTotal = 0;
    let creditTotal = 0;

    for (let i = 0; i < transactionsSpecificToCurrentAccount.docs.length; i++) {
        const transaction = transactionsSpecificToCurrentAccount.docs[i].data();
        debitTotal += transaction.debit;
        creditTotal += transaction.credit;
    }
    debitElement.textContent = debitTotal;
    creditElement.textContent = creditTotal;
}

function getJournalsSpecificToCurrentAccount(journals) {
    const specificJournals = [];
    for (let i = 0; i < journals.docs.length; i++) {
        const parentAccounts = journals.docs[i].data().accounts;
        for (let j = 0; j < parentAccounts.length; j++) {
            if (parentAccounts[j] == accountID) {
                specificJournals.push(journals.docs[i]);
                break;
            }
        }
    }
    return specificJournals;
}


function getTransactions(journalEntries) {
    const approvedTransactions = [];
    for (let i = 0; i < journalEntries.length; i++) {
        const currentJournalTransactions = journalEntries[i].data().transactions;
        if (Array.isArray(currentJournalTransactions)) {
            for (const t of currentJournalTransactions) {
                approvedTransactions.push(t);
            }
        }
    }

    return approvedTransactions;
}

