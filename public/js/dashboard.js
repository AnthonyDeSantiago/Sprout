console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp} from "./database_module.mjs";

const accounts = await getCollection('accounts');


printDocumentIds('accounts');

populateTable('accounts', 'asset_accounts');
let newAccount = null;
document.addEventListener("DOMContentLoaded", function () {
    const accountForm = document.getElementById("accountForm");

    accountForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent the default form submission behavior
        console.log("Hit Save!")
        // Access form input elements by their IDs
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
    });
});