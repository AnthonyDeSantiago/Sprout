/*
Please don't change anything here. It's sort of an ad-hoc api I made mostly to streamline
database backend stuff. Alot of these functions get used and reused in multiple locations so 
changing the implementation here will break things.

-Anthony
*/
console.log("!!! database_module.mjs has loaded !!!")

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

import { collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc, Timestamp, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"

const firebaseConfig = {
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    databaseURL: "https://sprout-financials-default-rtdb.firebaseio.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
};

const app = initializeApp(firebaseConfig);  //Initialize Firebase


let db = null

try {
    db = getFirestore();
} catch (error) {
    console.log("Error initializing Firestore: ", error);
}

export async function getCollection(specific_collection) {
    const recordsCollection = collection(db, specific_collection);
    return recordsCollection;
}

export async function printDocumentIds(specific_collection) {
    const recordsCollection = await getCollection(specific_collection);
    
    try {
        const querySnapshot = await getDocs(recordsCollection);
        
        querySnapshot.forEach((doc) => {
            console.log("Document ID:", doc.id);
        });
    } catch (error) {
        console.error("Error getting documents:", error);
    }
}

export async function populateTableFilter(collectionName, filterCategory, tableId) {
    const recordsCollection = collection(db, collectionName);
  
    try {
      const querySnapshot = await getDocs(recordsCollection);
      const tableBody = document.querySelector(`#${tableId} tbody`);
      let rowNumber = 1;
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.accountCategory === filterCategory) {
          tableBody.innerHTML += `
            <tr>
              <td><a href="ledger.html">${data.accountNumber}</a></td>
              <td><a href="ledger.html">${data.accountName}</a></td>
              <td>${data.normalSide}</td>
              <td>${data.accountCategory}</td>
              <td>${data.balance}</td>
              <td>${data.order}</td>
              <td>${data.accountDescription}</td>
            </tr>
          `;
          rowNumber++;
        }
      });
    } catch (error) {
      console.error("Error getting documents:", error);
    }
}

export async function populateTable(collectionName, tableId) {
  const recordsCollection = collection(db, collectionName);

  try {
      const querySnapshot = await getDocs(recordsCollection);
      const tableBody = document.querySelector(`#${tableId} tbody`);
      let rowNumber = 1;
      const rowToHide = tableBody.querySelectorAll("tr")[0];
      rowToHide.style.display = "none";
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.active === true) {
              tableBody.innerHTML += `
                  <tr>
                      <td><input type="checkbox"></td>
                      <td><a href="ledger.html?accountNumber=${data.accountNumber}&accountName=${data.accountName}">${data.accountNumber}</a></td>
                      <td><a href="ledger.html?accountNumber=${data.accountNumber}&accountName=${data.accountName}">${data.accountName}</a></td>
                      <td>${data.normalSide}</td>
                      <td>${data.accountCategory}</td>
                      <td>${data.balance}</td>
                      <td>${data.order}</td>
                      <td>${data.accountDescription}</td>
                  </tr>
              `;
              rowNumber++;
          }
      });
  } catch (error) {
      console.error("Error getting documents:", error);
  }
}

export async function populateDeactivatedTable(collectionName, tableId) {
    const recordsCollection = collection(db, collectionName);
  
    try {
        const querySnapshot = await getDocs(recordsCollection);
        const tableBody = document.querySelector(`#${tableId} tbody`);
        let rowNumber = 1;
        const rowToHide = tableBody.querySelectorAll("tr")[0];
        rowToHide.style.display = "none";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.active === false) {
                tableBody.innerHTML += `
                    <tr>
                        <td><input type="checkbox"></td>
                        <td><a href="ledger.html">${data.accountNumber}</a></td>
                        <td><a href="ledger.html">${data.accountName}</a></td>
                        <td>${data.normalSide}</td>
                        <td>${data.accountCategory}</td>
                        <td>${data.balance}</td>
                        <td>${data.order}</td>
                        <td>${data.accountDescription}</td>
                    </tr>
                `;
                rowNumber++;
            }
        });
    } catch (error) {
        console.error("Error getting documents:", error);
    }
  }


export async function addDocument(specific_collection, data) {
    const recordsCollection = await getCollection(specific_collection);
    
    try {
        const docRef = await addDoc(recordsCollection, data);
        console.log("Successfully added account");
    } catch (error) {
        console.error("Error adding documents:", error);
    }
}

export async function getTimestamp() {
    return await serverTimestamp();
}


export async function getAccountData(accountNumber) {
    const recordsCollection = collection(db, 'accounts');
    
    console.log('Searching for account with accountNumber:', accountNumber);
    const q = query(recordsCollection, where('accountNumber', '==', accountNumber));
    console.log('Query parameters:', q);
  
    try {
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size === 0) {
            console.log('No documents found with the provided account number.');
            return null;
        }
    

        const doc = querySnapshot.docs[0];
        const accountData = doc.data();
        console.log('Found matching document with account data:', accountData);
        return accountData;
    } catch (error) {
        console.error('Error getting documents:', error);
        return null;
    }
}

export async function editAccountData(accountNumber, newData) {
    const recordsCollection = collection(db, 'accounts');
    const q = query(recordsCollection, where('accountNumber', '==', accountNumber));
    try {
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size === 0) {
            console.log('No documents found with the provided account number.');
            return false;
        }
    
        const docRef = querySnapshot.docs[0].ref;

        await setDoc(docRef, newData, { merge: true });
        console.log('Account data updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating account data:', error);
        return false;
    }
}

export async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection);

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

export async function validateNewAccountData(data) {
    // const accountsCollection = collection(db, 'accounts');
    const accountNumber = data.accountNumber;
    const accountName = data.accountName;

    // console.log("accountNumber: ", accountNumber);

    // const name_query = query(accountsCollection, where('accountName', '==', accountName));
    // const number_query = query(accountsCollection, where('accountNumber', '==', accountNumber));

    // try {
    //     const name_query_snapshot = await getDocs(name_query);
    //     const number_query_snapshot = await getDocs(number_query);
    //     var isValid = false;
    //     console.log(name_query_snapshot.docs);
    //     if (name_query_snapshot.size === 0 && number_query_snapshot.size === 0) {
    //         isValid = true;
    //     }

    //     return isValid;
    // } catch (error) {
    //     console.error('Error happened: ', error);
    //     throw error;
    // }

    console.log(accountNumber);
    console.log(accountName);
    const numberOccurances = await countAccountsByAccountNumber(accountNumber);
    const nameOccurances = await countAccountsByAccountName(accountName);

    
    return false;
}
  
  
export async function countAccountsByAccountNumber(targetAccountNumber) {
    const accountsCollection = collection(db, 'accounts');
    const queryByAccountNumber = query(accountsCollection, where('accountNumber', '==', targetAccountNumber));

    try {
        const querySnapshot = await getDocs(queryByAccountNumber);
        const count = querySnapshot.size;
        return count;
    } catch (error) {
        console.error('Error counting accounts by accountNumber:', error);
        throw error;
    }
}

export async function countAccountsByAccountName(targetAccountName) {
    const accountsCollection = collection(db, 'accounts');
    const queryByAccountName = query(accountsCollection, where('accountName', '==', targetAccountName));

    try {
        const querySnapshot = await getDocs(queryByAccountName);
        const count = querySnapshot.size;
        return count;
    } catch (error) {
        console.error('Error counting accounts by accountName:', error);
        throw error;
    }
}
  
class AccountingError extends Error {
    constructor(message) {
        super(message);
        this.name = "Accounting Error";
    }
}

window.AccountingError = AccountingError;


export async function logAccountingError(message, user) {
    const newError = {
        message: message,
        user: user,
        timestamp: await getTimestamp()
    };
    await addDocument('errorLog', newError);
}

export async function getAccountID(accountNumber) {
    const accountsCollection = collection(db, 'accounts');

    try {
        const q = query(accountsCollection, where('accountNumber', '==', accountNumber));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        } else {
            console.log("Dang couldn't find an account with that number");
            return null;
        }
    } catch (error) {
        console.error("Something went wrong getting account id: ", error);
        return null;
    }
}


export async function getFieldValue(collectionName, documentID, fieldName) {
    try {
      const documentRef = doc(db, collectionName, documentID);
      const docSnap = await getDoc(documentRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (fieldName in data) {
          return data[fieldName];
        } else {
          console.error(`Field "${fieldName}" does not exist in the document.`);
          return null;
        }
      } else {
        console.error(`Document with ID "${documentID}" does not exist in the collection "${collectionName}".`);
        return null;
      }
    } catch (error) {
      console.error("Error getting field value:", error);
      return null;
    }
  }

export async function getDocsWithValue(collectionName, fieldName, fieldValue) {
    const recordsCollection = collection(db, collectionName);
  
    try {
      const q = query(recordsCollection, where(fieldName, '==', fieldValue));
      const querySnapshot = await getDocs(q);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push(doc.data());
      });
  
      return documents;
    } catch (error) {
      console.error("Error getting documents with value:", error);
      return null;
    }
}

export function capitalizeString(inputString) {
    const characters = inputString.split('');

    for (let i = 0; i < characters.length; i++) {
      characters[i] = characters[i].toUpperCase();
    }
  
    const capitalizedString = characters.join('');
  
    return capitalizedString;
}


export async function getDocumentReference(collectionName, documentID) {
  const collectionRef = collection(db, collectionName); 
  const documentRef = doc(collectionRef, documentID); 
  const documentSnapshot = await getDoc(documentRef);

  if (documentSnapshot.exists()) {
    return documentSnapshot.data();
  } else {
    return null;
  }
}

export async function getDocReferencesWithValue(collectionName, fieldName, fieldValue) {
    const recordsCollection = collection(db, collectionName);
  
    try {
      const q = query(recordsCollection, where(fieldName, '==', fieldValue));
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (error) {
      console.error("Error getting documents with value:", error);
      return null;
    }
}
  
export async function changeFieldValue(collectionName, docID, fieldName, fieldValue) {
    try {
        const docRef = doc(db, collectionName, docID);
        const fieldUpdate = {};

        fieldUpdate[fieldName] = fieldValue;

        await updateDoc(docRef, fieldUpdate);

    } catch (error) {
        console.error(`Error updating document: ${error}`);
    }
}

export async function convertBalanceToFloat(balance) {
    const numericString = balance.replace(/[^0-9.]/g, '');
    const floatValue = parseFloat(numericString);

    return floatValue;
}

export async function formatNumberToCurrency(number) {
    const options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };

    return number.toLocaleString(undefined, options);
}


export async function addField(collectionName, docID, fieldName, fieldValue) {
    try {
        const docRef = doc(db, collectionName, docID);
        const newFieldData = { [fieldName]: fieldValue };

        await updateDoc(docRef, newFieldData); 

        console.log('Document updated successfully with new field.');
    } catch (error) {
        console.error(`Error updating document: ${error}`);
    }
}


export async function getAllDocsFromCollection(collectionName) {
    try {
        const recordsCollection = collection(db, collectionName);
        const querySnapshot = await getDocs(recordsCollection);
        const documents = [];

        querySnapshot.forEach((doc) => {
            documents.push({
                id: doc.id,
                data: doc.data(),
            });
        });
        return documents;
    } catch (error) {
        console.error("Error getting documents", error);
        return [];
    }
}


export async function deleteAllDocumentsInCollection(collectionName) {
    try {
        const recordsCollection = collection(db, collectionName);
        const querySnapshot = await getDocs(recordsCollection);

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            const docRef = doc.ref;
            deletePromises.push(deleteDoc(docRef));
        });

        await Promise.all(deletePromises);

        console.log(`All documents in the "${collectionName}" collection have been deleted.`);
    } catch (error) {
        console.error("Error deleting documents", error);
    }
}

export async function deleteDocument(collectionName, docID) {
    try {
        const recordsCollection = collection(db, collectionName);
        const documentRef = doc(recordsCollection, docID);
        await deleteDoc(documentRef);
    } catch (error) {
        console.error("Error deleting document", error);
    }
}
