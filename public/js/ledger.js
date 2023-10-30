import { getAccountID, getDocsWithValue, getFieldValue } from "./database_module.mjs";

console.log("ledger.js has loaded!!!");

const urlParameters = new URLSearchParams(window.location.search);
const accountNumber = urlParameters.get("accountNumber");
const accountName = urlParameters.get("accountName");
const accountID = await getAccountID(accountNumber);
const journalEntries = await getDocsWithValue('journals', 'account', accountID);
const transactions = await getDocsWithValue('transactions', 'account', accountID);


console.log("accountNumber:", accountNumber);
console.log("accountName:", accountName);
console.log("account ID:", accountID);
console.log("journal entries:", journalEntries);
console.log("transactions:", transactions);


