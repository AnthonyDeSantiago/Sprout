import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

console.log("!!! user_journals.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let currentUser = "YOUR_USER_NAME"; // You can replace this later
let journals = [];
let journalEntriesTable = null;
let accountsList = [];

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;
            console.log(">>> Username = " + currentUser);
            document.getElementById("journalPageTitle").textContent = userData.firstName + " " + userData.lastName + "'s Journal Entries";

            accountsList = await getAccountsList();

            journals = await getJournals(currentUser);

            await initializeJournalEntries();

        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}

async function getJournals(){
    const journalsQuery = query(journals_db, where('user', '==', currentUser));
    let journalsList = [];
    console.log("Hit getJournals");

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

    for(var i = 0; i < journalsList.length; i++) {
        console.log("journalsList[" + i + "] = " + journalsList[i]);
        journalsList[i].creationDate = journalsList[i].creationDate.toDate();
        let accountTemp = [];
        let accountList = "";
        journalsList[i].transactions = journalsList[i].transactions.length; 

        for(var j = 0; j < journalsList[i].accounts.length; j++) {
            console.log("journalsList[" + i + "].accounts.length = " + journalsList[i].accounts.length);
            for(var k = 0; k < accountsList.length; k++) {
                if(journalsList[i].accounts[j] == accountsList[k].id){
                    journalsList[i].accounts[j] = accountsList[k].name;
                    console.log("journalsList[" + i + "].accounts[" + j + "] = " + journalsList[i].accounts[j]);
                    console.log("accountsList[" + k + "].name = " + accountsList[k].name);
                    accountTemp.push(journalsList[i].accounts[j]);
                }
            }
        }
        accountTemp.filter((value, index) => accountTemp.indexOf(value) === index);
        for(var n = 0, l = accountTemp.length; n < l; ++n) {
            accountList = accountList + accountTemp[n].toString() + ", ";
        }
        accountList = accountList.slice(0, -2);
        journalsList[i].accounts = accountList;
    }

    return journalsList;


}

async function initializeJournalEntries() {
    journalEntriesTable = new DataTable('#journalEntriesTable', {
        columns: [
            { data: 'creationDate', title: 'Creation Date' },
            { data: 'description', title: 'Description' },
            { data: 'transactions', title: 'No. Transactions' },
            { data: 'accounts', title: 'Associated Accounts' },
            { data: 'user', title: 'Author' },
            { data: 'approval', title: 'Approval Status' },
        ],
        data: journals,
        pageLength: 30,
    });
    console.log("Data table initiated");
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection);

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push({id: doc.id, name: doc.data().accountName});
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}


checkAuthState();



