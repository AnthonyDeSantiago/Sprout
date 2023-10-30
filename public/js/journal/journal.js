console.log("!!! journal.js loaded !!!");

import { getFirestore, collection, query, getDocs, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const db = getFirestore();
const journal = collection(db, 'journal');

document.addEventListener("DOMContentLoaded", async function () {

    // Function to populate the journal entries table with data
    async function loadJournalEntries() {
        const q = query(journal);
        const journalDocs = await getDocs(q);
        const journalEntriesArray = [];

        journalDocs.forEach((doc) => {
            journalEntriesArray.push({ id: doc.id, ...doc.data() });
        });

        const table = $('#journalEntriesTable').DataTable({
            data: journalEntriesArray,
            columns: [
                { data: 'date', title: 'Date' },
                { data: 'accountName', title: 'Account Name' },
                { data: 'debitAmount', title: 'Debit Amount' },
                { data: 'creditAmount', title: 'Credit Amount' },
                { data: 'status', title: 'Status' },
                { 
                    data: null, 
                    title: 'Action',
                    render: function(data, type, row) {
                        return '<button class="btn btn-info btn-sm">View/Edit</button>';  // Example action button
                    }
                }
            ],
            pageLength: 10,
        });
    }

    async function getAccountsList() {
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

    // Populate journal entries and accounts dropdown
    loadJournalEntries();
    await populateAccountsDropdown();
});
