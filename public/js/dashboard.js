console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp, getAccountData, editAccountData, getAccountsList, validateNewAccountData, countAccountsByAccountNumber, countAccountsByAccountName, populateDeactivatedTable} from "./database_module.mjs";
import { initializeEventLogging } from "./eventLog.mjs";
import {fetchUserFromEmail} from "./sprout.js"
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

const list = await getAccountsList();
console.log(list);
var username;
const auth = getAuth();                  //Init Firebase Auth + get a reference to the service
const accounts = await getCollection('accounts');
let accountNumber = null;
let userDisplay = null;
let userEmail = null;
let userData = null;

printDocumentIds('accounts');

populateTable('accounts', 'asset_accounts');
populateDeactivatedTable('accounts', 'deactivated_accounts');
let newAccount = null;
async function loadDocuments() {

    //##########################################
    // User ID goes here
    //--------------------------------------------
    console.log("USERNAME >>>>>>>>>>>>>>>>>>>>> " + username);
    initializeEventLogging('accounts', username);
    //---------------------------------------------
    //##############################################
    const accountForm = document.getElementById("accountForm");
    const editAccountForm = document.getElementById("editAccountForm");
    const addSaveButton = document.getElementById("addSaveButton");
    const editSaveButton = document.getElementById("editSaveButton");
    const addAccountNameError = document.getElementById("accountName-error1");
    const addAccountNumberError = document.getElementById("accountNumber-error1");
    const addAccountInitialBalanceError = document.getElementById("money-error1");
    const addAccountName = document.getElementById("accountName");
    const addAccountNumber = document.getElementById("accountNumber");
    const addAccountInitialBalance = document.getElementById("accountInitialBalance");
    const editAccountName = document.getElementById("editAccountName");
    const editAccountNameError = document.getElementById("accountName-error2");
    const editAccountInitialBalanceError = document.getElementById("money-error2");
    const editAccountInitialBalance = document.getElementById("editAccountInitialBalance");

    document.addEventListener('keydown', function (event) {
        console.log("Code reached the event listener?")
        addAccountNameError.textContent = '';
        addAccountNumberError.textContent = '';
        addAccountInitialBalanceError.textContent = '';
        editAccountNameError.textContent = '';
        editAccountInitialBalanceError.textContent = '';

        addAccountName.style.color = "black";
        addAccountNumber.style.color = 'black';
        addAccountInitialBalance.style.color = 'black';
        editAccountName.style.color = 'black';
        editAccountInitialBalance.style.color = 'black';

    });

    accountForm.addEventListener("submit", async function (e) {
        e.preventDefault(); 
        
        if (e.submitter === addSaveButton) {
            const accountName = document.getElementById("accountName").value;
            const accountNumber = document.getElementById("accountNumber").value;
            const accountDescription = document.getElementById("accountDescription").value;
            const normalSide = document.getElementById("normalSide").value;
            const accountCategory = document.getElementById("accountCategory").value;
            const accountSubcategory = document.getElementById("accountSubcategory").value;
            const accountInitialBalance = document.getElementById("accountInitialBalance").value;
            const accountOrder = document.getElementById("accountOrder").value;
            const accountComment = document.getElementById("accountComment").value;
            const timestamp = await getTimestamp();

            newAccount = {
                accountCategory: accountCategory,
                accountDescription: accountDescription,
                accountName: accountName,
                accountNumber: accountNumber,
                accountSubcategory:accountSubcategory,
                balance: accountInitialBalance,
                comment: accountComment,
                initialBalance: accountInitialBalance,
                normalSide: normalSide,
                order: accountOrder,
                active: true,
                timestampAdded: timestamp
            }
            
            const nameCount = await countAccountsByAccountName(accountName);
            const numberCount = await countAccountsByAccountNumber(accountNumber);
            var moneyPattern = /^\$[\d,]+(\.\d*)?$/;
            var accountNumberPattern = /^[0-9]+$/;

            console.log("How many with that nums: ", numberCount);
            console.log("How many with that names: ", nameCount);
            
            var isValid = true;

            if (!accountNumberPattern.test(accountNumber)) {
                console.log("Acount Number must be only numbers!");
                addAccountNumber.style.color = 'red';
                addAccountNumberError.style.color = 'red';
                addAccountNumberError.textContent = "\tAccount number must not include decimals, spaces, or alphanumeric characters.";
                isValid = false;
            }

            if (nameCount > 0) {
                console.log("Account Name Already Exists!");
                document.getElementById("accountName").style.color = "red";
                document.getElementById("accountName-error1").style.color = "red";
                document.getElementById("accountName-error1").textContent = "\tAccount Name Already Exists.";
                isValid = false;
            }

            if (numberCount > 0) {
                console.log("Account Number Already Exists!");
                document.getElementById("accountNumber").style.color = "red";
                document.getElementById("accountNumber-error1").style.color = "red";
                document.getElementById("accountNumber-error1").textContent = "\tAccount Number Already Exists.";
                isValid = false;
            }

            if (moneyPattern.test(accountInitialBalance) == false) {
                console.log("Incorrect currency format!");
                document.getElementById("accountInitialBalance").style.color = "red";
                document.getElementById("money-error1").style.color = "red";
                document.getElementById("money-error1").textContent = "\tPlease enter balance in currency format.";
                isValid = false;
            }

            if (isValid) {
                console.log("code reached here!");
                await addDocument('accounts', newAccount);
                accountForm.reset();
                //I had to add a delay because the event logger would not catch the change using onsnapshot before the page reloaded.
                setTimeout(function () {
                    location.reload();
                }, 250);
            }
        }
    });


    editAccountForm.addEventListener("submit", async function (e) {
        e.preventDefault(); 
        
        const accountName = document.getElementById("editAccountName").value;
        const accountDescription = document.getElementById("editAccountDescription").value;
        const normalSide = document.getElementById("editNormalSide").value;
        const accountCategory = document.getElementById("editAccountCategory").value;
        const accountSubcategory = document.getElementById("editAccountSubcategory").value;
        const accountInitialBalance = document.getElementById("editAccountInitialBalance").value;
        const accountOrder = document.getElementById("editAccountOrder").value;
        const accountComment = document.getElementById("editAccountComment").value;

        newAccount = {
            accountCategory: accountCategory,
            accountDescription: accountDescription,
            accountName: accountName,
            accountSubcategory:accountSubcategory,
            balance: accountInitialBalance,
            comment: accountComment,
            initialBalance: accountInitialBalance,
            normalSide: normalSide,
            order: accountOrder
        }
        
        const nameCount = await countAccountsByAccountName(accountName);
        var moneyPattern = /^\$[\d,]+(\.\d*)?$/;
        var isValid = true;

        if (nameCount > 0) {
            console.log("Account Name Already Exists!");
            document.getElementById("editAccountName").style.color = "red";
            document.getElementById("accountName-error2").style.color = "red";
            document.getElementById("accountName-error2").textContent = "\tAccount Name Already Exists.";
            isValid = false;
        }

        if (moneyPattern.test(accountInitialBalance) == false) {
            console.log("Incorrect currency format!");
            document.getElementById("editAccountInitialBalance").style.color = "red";
            document.getElementById("money-error2").style.color = "red";
            document.getElementById("money-error2").textContent = "\tPlease enter balance in currency format.";
            isValid = false;
        }

        if (isValid) {
            console.log("code reached here!");
            await editAccountData(accountNumber, newAccount);
            accountForm.reset();
            //I had to add a delay because the event logger would not catch the change using onsnapshot before the page reloaded.
            setTimeout(function () {
                location.reload();
            }, 250);
        }

    });

    

    console.log("made it to the end");

}

const editButton = document.querySelector('.btn[data-bs-target="#editAccountModal"]');
const deactivateButton = document.querySelector('.btn[data-bs-target="#deactivateAccountModal"]');
const activateButton = document.getElementById('activate-button');
const accountTable = document.getElementById('asset_accounts');
const deactivatedAccountTable = document.getElementById('deactivated_accounts');

deactivateButton.setAttribute('disabled', 'disabled');
activateButton.setAttribute('disabled', 'disabled');
editButton.setAttribute('disabled', 'disabled');


editButton.addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const editAccountModal = new bootstrap.Modal(document.getElementById("editAccountModal"));


    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            
            console.log('Checked Row Data:', rowData);
            console.log("Account Number: ", rowData[1]);
            const accountNum = rowData[1];
            accountNumber = rowData[1];

            const data = await getAccountData(accountNum);
            document.getElementById("editAccountName").value = data.accountName;
            document.getElementById("editAccountDescription").value = data.accountDescription;
            document.getElementById("editNormalSide").value = data.normalSide;
            document.getElementById("editAccountCategory").value = data.accountCategory;
            document.getElementById("editAccountSubcategory").value = data.accountSubcategory;
            document.getElementById("editAccountInitialBalance").value = data.initialBalance;
            document.getElementById("editAccountOrder").value = data.order;
            document.getElementById("editAccountComment").value = data.comment;
            console.log("Data: ", data);
            console.log("accountName", data.accountName);
            editAccountModal.show();
            break;
        }
    }
});

deactivateButton.addEventListener('click', async function() {
    console.log("Deactivate was pressed!");
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log("There is a checked box");
            const row = checkbox.closest('tr');
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            const accountNum = rowData[1];
            const data = await getAccountData(accountNum);
            const isActive = data.active;
            if (isActive && !(convertCurrencyToNumber(data.balance) > 0)) {
                data.active = false;
                await editAccountData(accountNum, data);
                location.reload();
            }
            console.log("Is it active: ", data.active);
        }
    }
});

activateButton.addEventListener('click', async function() {
    console.log("activate was pressed!");
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            console.log("There is a checked box");
            const row = checkbox.closest('tr');
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            const accountNum = rowData[1];
            const data = await getAccountData(accountNum);
            const isActive = data.active;
            if (!isActive) {
                data.active = true;
                await editAccountData(accountNum, data);
                location.reload();
            }
            console.log("Is it active: ", data.active);
        }
    }
});

accountTable.addEventListener('click', async function(event) {
    if (event.target.type === 'checkbox') {
        editButton.removeAttribute('disabled');
        const clickedCheckbox = event.target;
        const checkboxes = accountTable.querySelectorAll('input[type="checkbox"]');
        const row = clickedCheckbox.closest('tr');
        const rowData = Array.from(row.cells).map(cell => cell.textContent);
        const accountNum = rowData[1];
        const data = await getAccountData(accountNum);
        if (!(convertCurrencyToNumber(data.balance) > 0)) {
            deactivateButton.removeAttribute('disabled');
        } else {
            deactivateButton.setAttribute('disabled', 'disabled');
        }
        checkboxes.forEach(function(checkbox) {
            if (checkbox !== clickedCheckbox) {
                checkbox.checked = false;
            }
        });

        console.log("Specifically a checkbox was checked, do !!!");
    }
});


deactivatedAccountTable.addEventListener('click', async function(event) {
    if (event.target.type === 'checkbox') {
        activateButton.removeAttribute('disabled');
    }
});

function convertCurrencyToNumber(currencyString) {
    const numericString = currencyString.replace(/[^0-9.]/g, '');
    const floatValue = parseFloat(numericString);
    return floatValue;
}



const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            
            user.providerData.forEach((profile) => {
                userDisplay = profile.displayName;
                userEmail = profile.email;
            });

            userData = await fetchUserFromEmail(userEmail)
            username = userData.username;
            
            loadDocuments();
        }
        else {
            //Any code put here will impact sign in pages, so be careful
            //For example: do not put an alert that there is no user here,
            //it will cause an error with sign in
        }
    })
}

checkAuthState();


/* jquery clickable row */
$(document).ready(function () {
    $(document.body).on("click", "tr[data-href]", function () {
        window.location.href = this.dataset.href;
    });
}); 