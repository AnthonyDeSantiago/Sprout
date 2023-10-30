import { getAccountID } from "./database_module.mjs";

console.log("ledger.js has loaded!!!");

const urlParameters = new URLSearchParams(window.location.search);
const accountNumber = urlParameters.get("accountNumber");
const accountName = urlParameters.get("accountName");
const accountID = await getAccountID(accountNumber);


console.log("accountNumber:", accountNumber);
console.log("accountName:", accountName);
console.log("account ID:", accountID);


