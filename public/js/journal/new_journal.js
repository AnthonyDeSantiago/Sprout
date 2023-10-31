import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

console.log("!!! new_journal.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let username = null;
let userDisplay = null;
let userEmail = null;
let userData = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let currentUser = "YOUR_USER_NAME"; // You can replace this later
let journal_entry = [];
let transactionEntriesTable = null;

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userData = await getUserDataWithAuth(user);
            currentUser = userData.username;

            await initializePage();

            //const journalForm = document.getElementById("journalForm");
            //journalForm && journalForm.addEventListener("submit", handleJournalFormSubmission);
        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}

async function initializePage() {
    await initializeTransactionEntries();
    await populateAccountsDropdown();
}

function logAccountingError(error, user) {
    console.log(user.toString() + " logic error, logged as: " + error.toString());
    const errorLog = collection(db, 'accountingErrors');
    let date = serverTimestamp();
    addDoc(errorLog, {
        errorMessage: error,
        date: date,
        user: user
    });
}

document.getElementById("transactionForm").addEventListener("reset", async function (e) {
    e.preventDefault();

    //journal_entry = [];
    document.getElementById("transactionForm").reset();

});

document.getElementById("journalForm").addEventListener("reset", async function (e) {
    e.preventDefault();

    journal_entry = [];
    document.getElementById("journalForm").reset();

});


//async function handleJournalFormSubmission(event) {
document.getElementById("transactionForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const accountSelect = document.getElementById("accountSelect");
    let debitAmount = parseInt(document.getElementById("debitAmount").value);
    let creditAmount = parseInt(document.getElementById("creditAmount").value);
    const description = document.getElementById("transactionDescription");
    let errors = [];

    var isValid = true;

    //GOOD: credit is a number, debit is not a number
    if (creditAmount > 0 && isNaN(debitAmount)) {
        isValid = true;
        debitAmount = 0;
    }
    //GOOD: credit is a number, debit is zero
    if (creditAmount > 0 && debitAmount == 0) {
        isValid = true;
    }
    //GOOD: debit is a number, credit is not a number
    if (debitAmount > 0 && isNaN(creditAmount)) {
        isValid = true;
        creditAmount = 0;
    }
    //GOOD: debit is a number, credit is zero
    if (debitAmount > 0 && creditAmount == 0) {
        isValid = true;
    }

    if (!accountSelect.value) {
        errors.push("Account not selected.");
        logAccountingError("Account not selected.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }
    if (isNaN(debitAmount)) {
        errors.push("Invalid debit value.");
        logAccountingError("Invalid debit value.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }

    if (isNaN(creditAmount)) {
        errors.push("Invalid credit value.");
        logAccountingError("Invalid credit value.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }
    if (creditAmount > 0 && debitAmount > 0) {
        errors.push("Both credit and debit amount listed on same transaction.");
        logAccountingError("Both credit and debit amount listed on same transaction.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }
    if((creditAmount <= 0 || isNaN(creditAmount)) && (debitAmount <= 0 || isNaN(debitAmount))) {
        errors.push("No credit or debit amount listed.");
        logAccountingError("No credit or debit amount listed.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }


    if (errors.length > 0) {
        //showErrorModal(errors);
    } else {
        if (isValid == true) {
            journal_entry.push({
                account: accountSelect.value.toString(),
                debit: debitAmount,
                credit: creditAmount,
                description: description.value.toString()
            });
            addTransactionEntries({
                account: accountSelect.value.toString(),
                debit: debitAmount,
                credit: creditAmount,
                description: description.value.toString()
            });
            console.log(">>> Transaction added successfully!")
        }
    }
});

//async function handleJournalFormSubmission(event) {
document.getElementById("journalForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const sourceDocument = document.getElementById("sourceDocument");
    const journalDescription = document.getElementById("journalDescription");
    let errors = [];

    var isValid = true;

    let debitAmountSum = 0;
    let creditAmountSum = 0;

    for(var i = 0, l = journal_entry.length; i < l; ++i) {
        debitAmountSum += journal_entry[i].debit;
        creditAmountSum += journal_entry[i].credit;
    }

    const file = sourceDocument.files[0];

    if (file) {
        const validFileTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".jpg", ".png"];
        const isValidFileType = validFileTypes.some(type => file.name.endsWith(type));
        if (!isValidFileType) {
            errors.push("Invalid file type.");
            logAccountingError("Invalid file type.", currentUser);
            isValid = false;
        }
    } /*else {
        errors.push("Missing source document.");
        logAccountingError("Missing source document.", currentUser);
        isValid = false;
    }*/

    if ((creditAmountSum - debitAmountSum) != 0) {
        errors.push("Credits and debits do not sum to zero in journal entry.");
        logAccountingError("Credits and debits do not sum to zero in journal entry.", currentUser);

        //SHOW ERROR MESSAGE CODE HERE

        isValid = false;
    }


    if (errors.length > 0) {
        //showErrorModal(errors);
    } else {
        if (isValid == true) {
            let transactionsIDs = [];
            let journalID = null;
            let creationDate = serverTimestamp();
            let accountIDs = [];

            //For each transaction in the array containing the user input
            for(var i = 0, l = journal_entry.length; i < l; ++i) {
                let transaction = journal_entry[i];
                var readAccount = [];
                const q = query(accounts_db, where('accountName', '==', transaction.account));
                const account_spec = await getDocs(q).then((querySnapshot) => {
                    var tempDoc = [];
                    querySnapshot.forEach((doc) => {
                        tempDoc.push({ id: doc.id });
                    });
                    readAccount = tempDoc;
                });
                let accountID = readAccount[0].id;

                accountIDs.push(accountID);

                // Add a new transaction document with a generated id.
                try {
                    const docRef = await addDoc(transactions_db, {
                        creationDate: creationDate,
                        account: accountID,
                        journal: null,
                        debit: transaction.debit,
                        credit: transaction.credit,
                        description: transaction.description,
                        user: currentUser
                    });
                    console.log("Transaction written with ID: ", docRef.id);
                    transactionsIDs.push(docRef.id.toString());        //add the transaction id to an array
                } catch (error) {
                    console.error("Error adding transaction: ", error);
                };
            }

            //once all the transactions are processed, add their ids to a journal document
            try {
                const docRefJournal = await addDoc(journals_db, {
                    creationDate: creationDate,
                    transactions: transactionsIDs,
                    accounts: accountIDs,
                    description: journalDescription.value.toString(),
                    approval: "pending",
                    user: currentUser
                });
                console.log("Journal written with ID: ", docRefJournal.id);
                journalID = docRefJournal.id;                //grab journal id
            } catch (error) {
                console.error("Error adding journal: ", error);
            };

            //go back and add journal id to transaction documents
            for(var i = 0, l = transactionsIDs.length; i < l; ++i) {
                await updateDoc(doc(db, 'transactions', transactionsIDs[i].toString()), {
                    journal: journalID
                });
            }
        }
    }
});

/*function showErrorModal(errors) {
    let errorList = document.createElement("ul");
    errors.forEach(error => {
        let listItem = document.createElement("li");
        listItem.textContent = error;
        errorList.appendChild(listItem);
    });

    let errorModalContent = document.getElementById("errorModalContent");
    errorModalContent.innerHTML = "";
    errorModalContent.appendChild(errorList);

    $('#errorModal').modal('show');  // Assuming you have jQuery and Bootstrap modal
}*/


async function initializeTransactionEntries() {
    transactionEntriesTable = new DataTable('#journalEntriesTable', {
        columns: [
            { data: 'account', title: 'Account Name' },
            { data: 'debit', title: 'Debit Amount' },
            { data: 'credit', title: 'Credit Amount' },
            { data: 'description', title: 'Description' }
        ],
        data: journal_entry,
        pageLength: 10,
    });
    console.log("Data table initiated");
}

async function addTransactionEntries(entry) {
    transactionEntriesTable.rows.add([entry]).draw();
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection, where('active', '==', true));

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push(doc.data().accountName);
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function populateAccountsDropdown() {
    const accounts = await getAccountsList();
    const accountSelect = document.getElementById('accountSelect');
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        accountSelect.appendChild(option);
    });

}


checkAuthState();



