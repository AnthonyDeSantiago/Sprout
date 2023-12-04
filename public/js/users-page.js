import { changeFieldValue, convertBalanceToFloat, formatNumberToCurrency, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("users-page.js has loaded");

const pendingUsers = await getDocReferencesWithValue('users', 'approved', false);
// const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedUsers = await getDocReferencesWithValue('users', 'approved', true);

const rejectButton = document.getElementById('rejectButton');
const approveButton = document.getElementById('approveButton');
// const returnToPendingButton = document.getElementById('returnToPendingButton');
// const commentField = document.getElementById('commentField');
// const commentError = document.getElementById('commentError');

let currentEntry = null;

console.log("Num of Pending Users: ", pendingUsers.size);
// console.log("Num of Rejected Entries: ", rejectedJournalEntries.size);
console.log("Num of Approved users: ", approvedUsers.size);


function loadDataTables() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
}
  
async function initializeTable(users, tableId, callback) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    for (let i = 0; i < users.size; i++) {
        const user = users.docs[i];
        const row = tableBody.insertRow(i);
        row.innerHTML = `
            <td>${user.data().username}
            <td>${user.data().firstName}</td>
            <td>${user.data().lastName}</td>
            <td>${user.data().userEmail}</td>
            <td>${user.data().role}</td>
            <td>${user.data().address}</td>
            <td>${user.data().suspended}</td>
        `;
        row.addEventListener('click', async () => {
            console.log("Row clicked, the entry is: ", user.id);
            currentEntry = user.id;
            callback(user);
        });
    }
}


async function pendingModalCallback(user) {
    $('#approval-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"modal-table"} tbody`);
    const row = modalTableBody.insertRow();
    row.innerHTML = `
        <td>${user.data().username}
        <td>${user.data().firstName}</td>
        <td>${user.data().lastName}</td>
        <td>${user.data().userEmail}</td>
        <td>${user.data().role}</td>
        <td>${user.data().address}</td>
        <td>${user.data().suspended}</td>
    `;
}

async function approvedModalCallback(user) {
    $('#approved-modal').modal('show');
    const modalTableBody = document.querySelector(`#${"approved-modal-table"} tbody`);
    const row = modalTableBody.insertRow();
    row.innerHTML = `
        <td>${user.data().username}
        <td>${user.data().firstName}</td>
        <td>${user.data().lastName}</td>
        <td>${user.data().userEmail}</td>
        <td>${user.data().role}</td>
        <td>${user.data().address}</td>
        <td>${user.data().suspended}</td>
    `;
    console.log("called approved modal");
}


initializeTable(pendingUsers, 'journalEntry_table', pendingModalCallback);
initializeTable(approvedUsers, 'approved_table', approvedModalCallback);

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
    console.log("Reject Button Pressed");
    // await changeFieldValue('users', currentEntry, 'approved', false);
    // // console.log('selectedRow', currentEntry);

    // if (commentField.value.trim() === '') {
    //     commentError.textContent = 'Please enter a comment before rejecting.';
    // } else {
    //     commentError.textContent = '';
    //     await changeFieldValue('journals', currentEntry, 'approval', 'rejected');
    //     location.reload();
    // }
});

approveButton.addEventListener('click', async () => {
    console.log("Approve Button Pressed");
    // const journalRef = await getDocumentReference("journals", currentEntry);
    // const transactions = journalRef.transactions;
    // console.log("transactions: ", transactions);

    // for (let i = 0; i < transactions.length; i++) {
    //     const transaction = await getDocumentReference("transactions", transactions[i]);
    //     const account = transaction.account;
    //     const accountData = await getDocumentReference("accounts", account);
    //     const debit = transaction.debit;
    //     const credit = transaction.credit;
    //     const normalSide = accountData.normalSide;
    //     var balance = await convertBalanceToFloat(accountData.balance);
    //     console.log("Balance: ", balance);
    //     if (normalSide == "Debit") {
    //         balance += debit;
    //         balance -= credit;
    //         balance = await formatNumberToCurrency(balance);
    //         console.log("Converted Balance: ", balance);
    //         await changeFieldValue("accounts", account, 'balance', balance);
    //     } else if (normalSide == "Credit") {
    //         balance -= debit;
    //         balance += credit;
    //         balance = await formatNumberToCurrency(balance);
    //         console.log("Converted Balance: ", balance);
    //         await changeFieldValue("accounts", account, 'balance', balance);
    //     }

    // }
    // await changeFieldValue('journals', currentEntry, 'approval', 'approved');
    // location.reload();
});

returnToPendingButton.addEventListener('click', async () => {
    await changeFieldValue('journals', currentEntry, 'approval', 'pending');
    location.reload();
});

  
  