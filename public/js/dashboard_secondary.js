import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"
import { addField, changeFieldValue, convertBalanceToFloat, formatNumberToCurrency, getDocReferencesWithValue, getAllDocsFromCollection, getDocsWithValue, getDocumentReference, getFieldValue } from "/js/database_module.mjs";


console.log("!!! dashboard_secondary.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;
let userRole = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let journals_pending = [];
let journalEntriesTable = null;
let accountsList = [];
let usersList = [];
let userPull = [];
let account_db_snap = [];

let currentUser = "YOUR_USER_NAME"; //Replaced by code

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {

            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;
            console.log(">>> Username = " + currentUser);


            if (userData != null) {
                userRole = "Sprout User";

                let admin_man_only = document.getElementById("admin-man-only");
                let admin_view_only = document.getElementById("admin-view-only");

                switch (userData.role) {
                    case "admin":
                        userRole = "Administrator";
                        console.log(">>> Display mode: administrator");
                        if (admin_man_only != null) { admin_man_only.style.display = ""; }
                        if (admin_view_only != null) { admin_view_only.style.display = ""; }
                        break;

                    case "manager":
                        userRole = "Manager";
                        console.log(">>> Display mode: manager user");

                        if (admin_man_only != null) { admin_man_only.style.display = ""; }
                        if (admin_view_only != null) { admin_view_only.style.display = "none"; }
                        break;

                    case "regular":
                        userRole = "Accountant";
                        console.log(">>> Display mode: regular user");

                        if (admin_man_only != null) { admin_man_only.style.display = "none"; }
                        if (admin_view_only != null) { admin_view_only.style.display = "none"; }
                        break;

                    default:
                        console.log(">>> Display mode unable to be resolved.");
                        if (admin_man_only != null) { admin_man_only.style.display = "none"; }
                        if (admin_view_only != null) { admin_view_only.style.display = "none"; }
                }

                await initializeTable(await pendingJournalEntries, 'pending_table', "current_user");
                await initializeTable(await pendingJournalEntries, 'allUserPending_table', "all_users_pending");
                await initializeTable(await userAccounts, 'users_table', "account_approvals");
                console.log("")

                try {
                    await loadDataTables();
                    $(document).ready(function () {
                        $(`#${'pending_table'}`).DataTable();
                        $(`#${'allUserPending_table'}`).DataTable();
                        $(`#${'users_table'}`).DataTable();
                    });
                } catch (error) {
                    console.error('Error loading DataTables:', error);
                }


                account_db_snap = await getAccountsList();
                account_db_snap.sort();

                let CR = await getCashRatio();
                let ROA = await getROA();
                let DER = await getDER();

                document.getElementById('cashRatio').textContent = CR;
                document.getElementById('ROA').textContent = ROA;
                document.getElementById('DER').textContent = DER;

                if (parseFloat(ROA) > 20.0) { document.getElementById('ROACard').className = "card text-white bg-success mb-4"; }
                else if (parseFloat(ROA) >= 5.0) { document.getElementById('ROACard').className = "card text-white bg-secondary mb-4"; }
                else { document.getElementById('ROACard').className = "card text-white bg-danger mb-4"; }

                if (parseFloat(CR) > 2.0) { document.getElementById('CRCard').className = "card text-white bg-success mb-4"; }
                else if (parseFloat(CR) >= 1.0) { document.getElementById('CRCard').className = "card text-white bg-secondary mb-4"; }
                else { document.getElementById('CRCard').className = "card text-white bg-danger mb-4"; }

                if (parseFloat(DER) < 1.0) { document.getElementById('DERCard').className = "card text-white bg-success mb-4"; }
                else if (parseFloat(DER) <= 2.0) { document.getElementById('DERCard').className = "card text-white bg-secondary mb-4"; }
                else { document.getElementById('DERCard').className = "card text-white bg-danger mb-4"; }


            }
            else {
                //code here will impact page at most basic level, so be careful
                alert("Unable to resolve the role associated with your account. Please contact the admin.");
                signOut(auth);
                window.location = 'index.html';
            }
        }
    })
}

const pendingJournalEntries = await getDocReferencesWithValue('journals', 'approval', 'pending');
const userAccounts = await getAllDocsFromCollection("users");

function loadDataTables() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function initializeTable(entries, tableId, scope) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    let tableSizing = 5;
    if (entries.size < 5) {
        tableSizing = entries.size;
    }
    for (let i = 0; i < tableSizing; i++) {
        if (scope == "all_users_pending") {
            const entry = entries.docs[i];
            const row = tableBody.insertRow(i);
            if (entry.data().type == "adjusting") { row.style.backgroundColor = "#DFFFFF"; };
            row.innerHTML = `
                <td>${entry.data().creationDate.toDate()}</td>
                <td>${entry.id}</td>
                <td>${entry.data().user}</td>
                <td>${entry.data().description}</td>
            `;
            row.addEventListener('click', async () => {
                console.log("Row clicked, the entry is: ", entry.id);
                window.location = "user_journals_status.html"
            });
        }
        else if (scope == "current_user") {
            const entry = entries.docs[i];
            if (entry.data().user.toString() == currentUser) {
                const row = tableBody.insertRow(i);
                if (entry.data().type == "adjusting") { row.style.backgroundColor = "#DFFFFF"; };
                row.innerHTML = `
                <td>${entry.data().creationDate.toDate()}</td>
                <td>${entry.id}</td>
                <td>${entry.data().user}</td>
                <td>${entry.data().description}</td>
            `;
                row.addEventListener('click', async () => {
                    console.log("Row clicked, the entry is: ", entry.id);
                    window.location = "user_journals.html"
                });
            };
        }
        else if (scope == "account_approvals") {
            console.log("user entries >>> " + entries);
            const user = entries.docs[i];
            if (user.data().approved.toString() == "false") {
                console.log("user printing to table >>> " + user);
                const row = tableBody.insertRow(i);
                row.innerHTML = `
                <td>${user.data().username}</td>
                <td>${user.data().firstName}</td>
                <td>${user.data().lastName}</td>
                <td>${user.data().userEmail}</td>
            `;
                row.addEventListener('click', async () => {
                    console.log("Row clicked, the entry is: ", entry.id);
                    window.location = "admin_table_all_users.html"
                });
            };
        }
    }
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection, where("active", "==", true));

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push({ id: doc.id, ...doc.data() });
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function getROA() {

    let ROA = ""
    let netIncome = 0.0
    let revenueSum = 0.0
    let expenseSum = 0.0
    let assetSum = 0.0

    try {
        //document.getElementById('dateRange4').textContent = startDate.toString() + " - " + endDate.toString();
        //document.getElementById('dateRange5').textContent = startDate.toString() + " - " + endDate.toString();
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.statement == "Income Statement") {
                if (account.accountCategory == "Revenue") {
                    revenueSum = revenueSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
                else if (account.accountCategory == "Expenses") {
                    expenseSum = expenseSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
            }

            if (account.statement == "Balance Sheet") {
                if (account.accountCategory == "Assets") {
                    assetSum = assetSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
            }
        }

        netIncome = revenueSum - expenseSum;
        ROA = ((netIncome / assetSum) * 100).toFixed(2) + "%";

        console.log("ROA = " + ROA);

        return ROA;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"
}

async function getCashRatio() {

    let cashRatio = ""
    let cashSum = 0.0
    let currentLiabilitiesSum = 0.0

    try {
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.accountSubcategory == "Current Liabilities") {
                currentLiabilitiesSum = currentLiabilitiesSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }

            if (account.accountSubcategory == "Cash and Marketable Securities") {
                cashSum = cashSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
        }

        cashRatio = ((cashSum / currentLiabilitiesSum)).toFixed(2);

        console.log("cashRatio = " + cashRatio);

        return cashRatio;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"
}

/*Debt to Equity Ration */
async function getDER() {

    let DER = ""
    let liabSum = 0.0
    let equitSum = 0.0

    try {
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.accountCategory == "Liabilities") {
                liabSum = liabSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
            else if (account.accountCategory == "Equity") {
                equitSum = equitSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
        }

        DER = (liabSum / equitSum).toFixed(2);

        console.log("Debt-to-Equity Ratio = " + DER);

        return DER;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"
}

checkAuthState();

