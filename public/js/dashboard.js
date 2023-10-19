console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp} from "./database_module.mjs";

const accounts = await getCollection('accounts');


printDocumentIds('accounts');

populateTable('accounts', 'asset_accounts');
let newAccount = null;
document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("accountForm");

    accountForm.addEventListener("submit", async function (e) {
        e.preventDefault(); 
        console.log("Hit Save!")
        
        const accountName = document.getElementById("accountName").value;
        const accountNumber = document.getElementById("accountNumber").value;
        const accountDescription = document.getElementById("accountDescription").value;
        const normalSide = document.getElementById("normalSide").value;
        const accountCategory = document.getElementById("accountCategory").value;
        const accountSubcategory = document.getElementById("accountSubcategory").value;
        const accountInitialBalance = document.getElementById("accountInitialBalance").value;
        const accountOrder = document.getElementById("accountOrder").value;
        const accountComment = document.getElementById("accountComment").value;
        // const timestampAdded = getTimestamp();

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
            order: accountOrder
        }

        await addDocument('accounts', newAccount);
    
        accountForm.reset();
        location.reload();
    });

    

    console.log("made it to the end");

});

const editButton = document.querySelector('.btn[data-bs-target="#editAccountModal"]');

editButton.addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            

            const row = checkbox.closest('tr');
            
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            
            console.log('Checked Row Data:', rowData);

            const editAccountModal = new bootstrap.Modal(document.getElementById("editAccountModal"));
            

            const accountNameInput = document.getElementById("accountName");
            const accountNumberInput = document.getElementById("accountNumber");
            const accountDescriptionInput = document.getElementById("accountDescription");
            const normalSideInput = document.getElementById("normalSide");
            const accountCategoryInput = document.getElementById("accountCategory");
            const accountSubcategoryInput = document.getElementById("accountSubcategory");
            const accountInitialBalanceInput = document.getElementById("accountInitialBalance");
            const accountOrderInput = document.getElementById("accountOrder");
            const accountCommentInput = document.getElementById("accountComment");

            accountNameInput.value = "Testing";

            editAccountModal.show();

            break;
        }
    }
});



