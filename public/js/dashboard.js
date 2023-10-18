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

    // Get all the checkbox elements
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Add an event listener to each checkbox
    checkboxes.forEach(checkbox => {
        console.log("dljslkfj");
        checkbox.addEventListener('change', function () {
            console.log("dljslkfj");
            if (this.checked) {
                // Get the data row identifier
                const rowId = this.getAttribute('data-row');

                // Find the related data element in the same row
                const dataElement = document.querySelector(`td[data-row="${rowId}"]`);

                // Access the data you need from the data element
                const rowData = dataElement.textContent;

                // Do something with the rowData
                console.log('Checked:', rowData);
            }
        });
    });

    console.log("made it to the end");

});

const editButton = document.querySelector('.btn[data-bs-target="#editAccountModal"]');

editButton.addEventListener('click', function() {
  // This code will run when the Edit button is clicked
  console.log('Edit button pressed');
  // You can add your custom logic here
});

