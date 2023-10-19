console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp, getAccountData} from "./database_module.mjs";


const accounts = await getCollection('accounts');


printDocumentIds('accounts');

populateTable('accounts', 'asset_accounts');
let newAccount = null;
document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("accountForm");
    const addSaveButton = document.getElementById("addSaveButton");
    const editSaveButton = document.getElementById("editSaveButton");

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

            await addDocument('accounts', newAccount);
    
            accountForm.reset();
            location.reload();
        }

        
    });

    

    console.log("made it to the end");

});

const editButton = document.querySelector('.btn[data-bs-target="#editAccountModal"]');


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

            const data = await getAccountData(accountNum);
            document.getElementById("editAccountName").value = data.accountName;
            document.getElementById("editAccountNumber").value = data.accountNumber;
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

