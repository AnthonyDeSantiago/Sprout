import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

console.log("!!! user_journals_status.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let currentUser = "YOUR_USER_NAME"; // You can replace this later
let journals_pending = [];
let journals_apprived = [];
let journals_rejected = [];
let journalEntriesTable = null;
let accountsList = [];
let usersList = [];
let userPull = [];

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;
            console.log(">>> Username = " + currentUser);
            document.getElementById("journalPageTitle").textContent = userData.firstName + " " + userData.lastName + "'s Pending Journal Entries";

            accountsList = await getAccountsList();

            switch (userData.role) {
                case "admin":
                    await getUserList();
                    userPull = usersList;
                    for (var i = 0; i < usersList.length; i++) {
                        userPull.push(usersList[i].username);
                    }
                    break;

                case "manager":
                    await getUserList();
                    for (var i = 0; i < usersList.length; i++) {
                        if (usersList[i].role == "regular" || usersList[i].role == "manager") {
                            userPull.push(usersList[i].username);
                        }
                    }
                    break;

                case "regular":
                    userPull.push(currentUser);
                    break;

                default:
                    console.log(">>> Display mode unable to be resolved, redirecting to login");
                    admin_only.style.display = "none";
                    admin_only2.style.display = "none";

                    alert("Unable to resolve the role associated with your account. Please contact the admin.");
                    signOut(auth);
                    window.location = 'index.html';
            }


            journals_pending = await getPendingJournals(userPull);
            journals_rejected = await getApprovedJournals(userPull);
            journals_rejected = await getRejectedJournals(userPull);

            await initializePendingJournalEntries();
            await initializeApprovedJournalEntries();
            await initializeRejectedJournalEntries();

        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}

async function getUserList() {
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('approved', '==', true));

    try {
        const querySnapshot = await getDocs(usersQuery);
        const usersTempList = [];
        querySnapshot.forEach((doc) => {
            let user = { username: doc.data().username, role: doc.data().role };
            usersTempList.push(user);
        });
        console.log(usersTempList);
        usersList = usersTempList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function cleanJournals(journals) {
    let journalsList = journals;
    for (var i = 0; i < journalsList.length; i++) {
        journalsList[i].creationDate = journalsList[i].creationDate.toDate();
        let accountTemp = [];
        let accountList = "";
        journalsList[i].transactions = journalsList[i].transactions.length;

        for (var j = 0; j < journalsList[i].accounts.length; j++) {
            for (var k = 0; k < accountsList.length; k++) {
                if (journalsList[i].accounts[j] == accountsList[k].id) {
                    journalsList[i].accounts[j] = accountsList[k].name;
                    accountTemp.push(journalsList[i].accounts[j]);
                }
            }
        }
        accountTemp.filter((value, index) => accountTemp.indexOf(value) === index);
        for (var n = 0, l = accountTemp.length; n < l; ++n) {
            accountList = accountList + accountTemp[n].toString() + ", ";
        }
        accountList = accountList.slice(0, -2);
        journalsList[i].accounts = accountList;
    }

    return journalsList;
}

async function getPendingJournals(users) {
    const journalsQuery = query(journals_db, where('user', 'in', users), where('approval', '==', 'pending'));
    let journalsList = [];
    console.log("Hit getPendingJournals");

    try {
        const querySnapshot = await getDocs(journalsQuery);
        querySnapshot.forEach((doc) => {
            journalsList.push(doc.data());
        });
        console.log(journalsList);
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }

    journalsList = cleanJournals(journalsList);

    return journalsList;

}

async function getApprovedJournals(users) {
    const journalsQuery = query(journals_db, where('user', 'in', users), where('approval', '==', 'approved'));
    let journalsList = [];
    console.log("Hit getApprovedJournals");

    try {
        const querySnapshot = await getDocs(journalsQuery);
        querySnapshot.forEach((doc) => {
            journalsList.push(doc.data());
        });
        console.log(journalsList);
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }

    journalsList = cleanJournals(journalsList);

    return journalsList;

}

async function getRejectedJournals(users) {
    const journalsQuery = query(journals_db, where('user', 'in', users), where('approval', '==', 'rejected'));
    let journalsList = [];
    console.log("Hit getRejectedJournals");

    try {
        const querySnapshot = await getDocs(journalsQuery);
        querySnapshot.forEach((doc) => {
            journalsList.push(doc.data());
        });
        console.log(journalsList);
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }

    journalsList = cleanJournals(journalsList);

    return journalsList;

}

async function initializePendingJournalEntries() {
    journalEntriesTable = new DataTable('#pendingJournalEntriesTable', {
        columns: [
            { data: 'creationDate', title: 'Creation Date' },
            { data: 'description', title: 'Description' },
            { data: 'transactions', title: 'No. Transactions' },
            { data: 'accounts', title: 'Associated Accounts' },
            { data: 'user', title: 'Author' },
            { data: 'approval', title: 'Approval Status' },
        ],
        data: journals_pending,
        pageLength: 10,
    });
    console.log("Pending data table initiated");
}

async function initializeApprovedJournalEntries() {
    journalEntriesTable = new DataTable('#approvedJournalEntriesTable', {
        columns: [
            { data: 'creationDate', title: 'Creation Date' },
            { data: 'description', title: 'Description' },
            { data: 'transactions', title: 'No. Transactions' },
            { data: 'accounts', title: 'Associated Accounts' },
            { data: 'user', title: 'Author' },
            { data: 'approval', title: 'Approval Status' },
        ],
        data: journals_pending,
        pageLength: 10,
    });
    console.log("Approved data table initiated");
}

async function initializeRejectedJournalEntries() {
    journalEntriesTable = new DataTable('#rejectedJournalEntriesTable', {
        columns: [
            { data: 'creationDate', title: 'Creation Date' },
            { data: 'description', title: 'Description' },
            { data: 'transactions', title: 'No. Transactions' },
            { data: 'accounts', title: 'Associated Accounts' },
            { data: 'user', title: 'Author' },
            { data: 'approval', title: 'Approval Status' },
        ],
        data: journals_pending,
        pageLength: 10,
    });
    console.log("Rejected data table initiated");
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection);

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push({ id: doc.id, name: doc.data().accountName });
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}


checkAuthState();



