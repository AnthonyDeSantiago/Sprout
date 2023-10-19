console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp, getAccountData, editAccountData} from "./database_module.mjs";
import { initializeEventLogging } from "./eventLog.mjs";
import {fetchUserFromEmail} from "./sprout.js"
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

var username;
const auth = getAuth();                  //Init Firebase Auth + get a reference to the service
const accounts = await getCollection('accounts');
let accountNumber = null;
let userDisplay = null;
let userEmail = null;
let userData = null;

printDocumentIds('accounts');

populateTable('accounts', 'asset_accounts');
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

            var moneyPattern = /^\$[\d,]+(\.\d*)?$/;

            if(moneyPattern.test(accountInitialBalance) == true){
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

                await addDocument('accounts', newAccount);
            }
            else{
                document.getElementById("editAccountInitialBalance").style.color = "red";
                document.getElementById("money-error1").style.color = "red";
                document.getElementById("money-error1").textContent = "\tPlease enter balance in currency format.";
            }
            
            accountForm.reset();
            //I had to add a delay because the event logger would not catch the change using onsnapshot before the page reloaded.
            setTimeout(function () {
                location.reload();
            }, 250);
            
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
        
        var moneyPattern = /^\$[\d,]+(\.\d*)?$/;

        if(moneyPattern.test(accountInitialBalance) == true){
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

            await editAccountData(accountNumber, newAccount);
        }
        else{
            document.getElementById("editAccountInitialBalance").style.color = "red";
            document.getElementById("money-error2").style.color = "red";
            document.getElementById("money-error2").textContent = "\tPlease enter balance in currency format.";
        }
        accountForm.reset();
        //I had to add a delay because the event logger would not catch the change using onsnapshot before the page reloaded.
        setTimeout(function () {
            location.reload();
        }, 250);

    });

    

    console.log("made it to the end");

}

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