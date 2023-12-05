import { addNewUser, changeFieldValue, convertBalanceToFloat, deleteDocument, formatNumberToCurrency, getDocReferencesWithValue, getDocsWithValue, getDocumentReference, getFieldValue } from "./database_module.mjs";

console.log("users_page.js has loaded");

const pendingUsers = await getDocReferencesWithValue('users', 'approved', false);
// const rejectedJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'rejected');
const approvedUsers = await getDocReferencesWithValue('users', 'approved', true);

const rejectButton = document.getElementById('rejectButton');
const approveButton = document.getElementById('approveButton');
const returnToPendingButton = document.getElementById('return-to-pending');
const addUserButton = document.getElementById("addUserBtn");
const createUserButton = document.getElementById("createUserBtn");
const createUserDropDownButton = document.getElementById("createUserDropdownButton");
const createUserDropDown = document.getElementById('create-role-dropdown');
const suspendButon = document.getElementById('suspend-button');
const dropDownButton = document.getElementById('dropdownMenuButton');
const dropDownMenu = document.getElementById('role-dropdown');

const userName = document.getElementById('username');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const address = document.getElementById('address');
const dob = document.getElementById('dob');

approveButton.setAttribute('disabled', 'true');
createUserButton.setAttribute('disabled', 'true');


let currentUser = null;
let selectedRole = null;

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
            console.log("Row clicked, the user is: ", user.id);
            currentUser = user.id;
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
    const userStatus = user.data().suspended;
    if (userStatus) {
        suspendButon.textContent = "Unsuspend";
    } else {
        suspendButon.textContent = "Suspend";
    }
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
    approveButton.setAttribute('disabled', 'true');
    dropDownButton.textContent = "Select a Role";
});

$('#approved-modal').on('hidden.bs.modal', function () {
    $('#approved-modal-table tbody').empty();
    $('#commentField').val('');
    $('#commentError').text('');
});

$('#addUserModal').on('hidden.bs.modal', function () {
    $('#approved-modal-table tbody').empty();
    $('#commentField').val('');
    $('#commentError').text('');
    createUserButton.setAttribute('disabled', 'true');
    createUserDropDownButton.textContent = "Select a Role";
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
    await deleteDocument('users', currentUser);
    location.reload();
});

approveButton.addEventListener('click', async () => {
    console.log("Approve Button Pressed");
    const userData = await getDocumentReference('users', currentUser);
    console.log("userData", userData.role);
    await changeFieldValue('users', currentUser, 'role', selectedRole.toLowerCase());
    await changeFieldValue('users', currentUser, 'approved', true);
    location.reload();
});

dropDownButton.addEventListener('click', async () => {
    console.log('Dropdown pressed');
    dropDownMenu.classList.toggle('show');
});

createUserDropDownButton.addEventListener('click', async () => {
    createUserDropDown.classList.toggle('show');
});

createUserDropDown.addEventListener('click', function (event) {
    if (event.target.classList.contains('dropdown-item')) {
        selectedRole = event.target.textContent;
        createUserDropDownButton.textContent = selectedRole;
        console.log('Selected Role: ', selectedRole);
    }

    if (selectedRole != null) {
        createUserButton.removeAttribute('disabled');
    }
});

dropDownMenu.addEventListener('click', function (event) {
    if (event.target.classList.contains('dropdown-item')) {
        selectedRole = event.target.textContent;
        dropDownButton.textContent = selectedRole;
        console.log('Selected Role: ', selectedRole);
    }

    if (selectedRole != null) {
        approveButton.removeAttribute('disabled');
    }
});

window.addEventListener('click', function (event) {
    if (!event.target.matches('.btn-primary')) {
        if (dropDownMenu.classList.contains('show')) {
            dropDownMenu.classList.remove('show');
        }
        if (createUserDropDown.classList.contains('show')) {
            createUserDropDown.classList.remove('show');
        }
    }
});

returnToPendingButton.addEventListener('click', async () => {
    console.log('Return to Pending is Pressed');
    await changeFieldValue('users', currentUser, 'role', 'blank');
    await changeFieldValue('users', currentUser, 'approved', false);
    location.reload();
})

suspendButon.addEventListener('click', async () => {
    const userData = await getDocumentReference('users', currentUser);
    
    if (userData.suspended) {
        await changeFieldValue('users', currentUser, 'suspended', false);
    } else {
        await changeFieldValue('users', currentUser, 'suspended', true);
    }
    
    location.reload();
});

addUserButton.addEventListener('click', function() {
    console.log("Add user button was pressed");
    $('#addUserModal').modal('show');
});
  
createUserButton.addEventListener('click', async () => {
    const userNameValue = userName.value;
    const firstNameValue = firstName.value;
    const lastNameValue = lastName.value;
    const emailValue = email.value;
    const addressValue = address.value;
    const dobValue = dob.value;

    const data = {
        username: userNameValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        email: emailValue,
        address: addressValue,
        role: selectedRole,
        answer1: "default",
        answer2: "default",
        approved: true,
        avatar: "assets/panda.png",
        password: "Sprout1234!",
        suspended: false
    };
    console.log("UserData: ", data);

    await addNewUser(data);
    setTimeout(function () {
        location.reload();
    }, 500);
});