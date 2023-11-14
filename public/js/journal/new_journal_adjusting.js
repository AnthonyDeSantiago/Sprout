import { getFirestore, collection, doc, query, where, orderBy, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"
import { getStorage, ref, uploadBytesResumable, uploadBytes, getDownloadURL  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"

console.log("!!! new_journal_adjusting.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let username = null;
let userDisplay = null;
let userEmail = null;
let userData = null;

const storage = getStorage();   //Cloud Storage grab
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
    console.log("populated account dropdown");
    clearErrorForInput();

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

// Function to validate source document type and display an error if invalid
function validateDocumentType(sourceDocument) {
    const acceptedDocTypes = ['application/pdf', 'image/jpeg', 'image/png']; // Add more as needed

    if (acceptedDocTypes.includes(sourceDocument.files[0].type)) {
        return true;
    } else {
        displayErrors([{
            inputFieldId: 'sourceDocument',
            message: 'Invalid document type. Please upload a PDF, JPEG, or PNG file.'
        }]);
        logAccountingError("Invalid document type uploaded.", currentUser);
        return false;
    }
}

// Function to validate journal description is not null and display an error if null
function validateDescription(journalDescription) {
    const isValid = journalDescription.value.trim() !== "";

    if (!isValid) {
        displayErrors([{
            inputFieldId: 'journalDescription',
            message: 'Description cannot be empty.'
        }]);
        logAccountingError("Journal description is empty.", currentUser);
    }
    return isValid;
}

// Function to upload the document and return the download URL
async function uploadDocument(file, journalID) {
    // Create a storage reference with the journalID and the file name
    const fileRef = ref(storage, 'journals/' + journalID + '/' + file.name);
  
    // Upload the file to Firebase Storage
    const uploadTask = uploadBytesResumable(fileRef, file);
  
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Handle upload progress
            }, 
            (error) => {
                // Handle unsuccessful uploads
                reject(error);
            }, 
            () => {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}

// Function to add a download button to the data table row
function addDocumentDownloadButton(downloadURL, rowIndex) {
    // Get the data table row
    let row = transactionEntriesTable.row(rowIndex).node();
  
    // Create the download button
    let btn = document.createElement("button");
    btn.innerHTML = "Download Document";
    btn.onclick = function () {
        window.open(downloadURL, '_blank');
    };
  
    // Append the download button to the fifth cell (assuming document is in the fifth column)
    row.cells[4].appendChild(btn);
}
async function addTransactionEntries(entry) {
    transactionEntriesTable.rows.add([entry]).draw();
    // Call function to add a download button if the entry has a document
    if (entry.sourceDocumentURL) {
        addDocumentDownloadButton(entry.sourceDocumentURL, transactionEntriesTable.rows().count() - 1);
    }
}

document.getElementById("transactionForm").addEventListener("submit", async function (e) {
    e.preventDefault();
        // Clear existing errors
        displayErrors([]);
    const accountSelect = document.getElementById("accountSelect");
    const description = document.getElementById("transactionDescription");
    let debitAmount = parseInt(document.getElementById("debitAmount").value);
    let creditAmount = parseInt(document.getElementById("creditAmount").value);
    

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
        errors.push({
            inputFieldId: 'accountSelect',
            message: 'Account not selected.'
        });
        logAccountingError("Account not selected.", currentUser);
        isValid = false;
    }
    if (isNaN(debitAmount)) {
        errors.push({
            inputFieldId: 'debitAmount',
            message: 'Invalid debit value.'
        });
        logAccountingError("Invalid debit value.", currentUser);
        isValid = false;
    }

    if (isNaN(creditAmount)) {
        errors.push({
            inputFieldId: 'creditAmount',
            message: 'Invalid credit value.'
        });
        logAccountingError("Invalid credit value.", currentUser);
        isValid = false;
    }
    if (creditAmount > 0 && debitAmount > 0) {
        errors.push({
            inputFieldId: 'creditAmount'&&'debitAmount',
            message: 'Both credit and debit amount listed on the same transaction.'
        });
        logAccountingError("Both credit and debit amount listed on same transaction.", currentUser);
        isValid = false;
    }
    if((creditAmount <= 0 || isNaN(creditAmount)) && (debitAmount <= 0 || isNaN(debitAmount))) {
        errors.push({
            inputFieldId: 'creditAmount'&&'debitAmount', 
            message: 'No credit or debit amount listed.'
        });
        logAccountingError("No credit or debit amount listed.", currentUser);
        isValid = false;
    }


    if (errors.length > 0) {
        displayErrors(errors); 
    } 
    else {
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

document.getElementById("journalForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    // Clear existing errors
    displayErrors([]);

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
            errors.push({
                inputFieldId: 'sourceDocument',
                message: 'Invalid file type.'
            });
            logAccountingError("Invalid file type.", currentUser);
            errors.push("Invalid file type.");

            logAccountingError("Invalid file type.", currentUser);
            isValid = false;
        }
    } /*else {
        errors.push({
            inputFieldId: 'sourceDocument',
            message: 'Missing source document.'
        });
        logAccountingError("Missing source document.", currentUser);
        isValid = false;
    }*/

    if ((creditAmountSum - debitAmountSum) != 0) {
        errors.push({
            inputFieldId: 'creditAmount',
            message: 'Credits and debits do not match. Please ensure they sum to zero.'
        });
        
        errors.push({
            inputFieldId: 'debitAmount',
            message: 'Debits and credits do not match. Please ensure they sum to zero.'
        });
        logAccountingError("Credits and debits do not sum to zero in journal entry.", currentUser);

        isValid = false;
    }


    if (errors.length > 0) {
        displayErrors(errors)    
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
                    user: currentUser,
                    type: "adjusting"
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

            /* for adj journal entry */
            const button2 = document.querySelector('.adjust-btn');

            button2.onclick = () => {
                    
                    var templateParams = {
                        name: document.getElementById('currentUser').value,
                    };
                
                    emailjs.send('service_9bu3nfr', 'template_e9qtgt3', templateParams)
                    .then(
                        res => {
                            document.getElementById("currentUser").value = "",
                            console.log.apply(res)
                        alert("message sent sucessfully");
                    })
                    .catch((err) => console.log(err));
}

            alert("Journal added successfully.");
            window.location = 'user_journal.html';
        }
    }
});

function displayErrors(errors) {
    // First, clear out all previous error messages
    const errorElements = document.querySelectorAll('.error-text');
    errorElements.forEach(el => el.remove());

    errors.forEach(error => {
        const errorElement = document.createElement('span');
        errorElement.className = 'error-text';
        errorElement.textContent = error.message;
        errorElement.style.color = 'red';

        const inputField = document.getElementById(error.inputFieldId);
        if(inputField) {
            inputField.parentElement.insertBefore(errorElement, inputField.nextSibling);
        }
    });
}

//a function to clear the error for a specific input
function clearErrorForInput(inputFieldId) {
    const inputField = document.getElementById(inputFieldId);
    if (inputField) {
        let errorElement = inputField.nextSibling;
        if (errorElement && errorElement.classList.contains('error-text')) {
            errorElement.remove();
        }
    }
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
        clearErrorForInput(e.target.id);
    });
});

async function initializeTransactionEntries() {
    transactionEntriesTable = new DataTable('#journalEntriesTable', {
        columns: [
            { data: 'account', title: 'Account Name' },
            { data: 'debit', title: 'Debit Amount' },
            { data: 'credit', title: 'Credit Amount' },
            { data: 'description', title: 'Description' },
        ],
        data: journal_entry,
        pageLength: 10,
    });
    console.log("Data table initiated");
}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection, where('active', '==', true), orderBy('accountNumber'));

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