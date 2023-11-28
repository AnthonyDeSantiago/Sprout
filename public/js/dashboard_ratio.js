// current ratio = (current assets) / (current liabilities)
// debt ratio = (total debt) / (total assets)
// debt to equity ratio = (total debt) / (total assets)

import { getAllDocsFromCollection } from "./database_module.mjs";

console.log("dashboard_ratio.js has loaded!!");

const accounts = await getAllDocsFromCollection("accounts");

console.log("1212121212121] accounts", accounts);
console.log("1212121212121] accounts size", accounts.length);

let currentLiabilityAccounts = [];
let currentAssetAccounts = [];


for(let i = 0; i < accounts.length; i++) {
    const subcategory = accounts[i].data.accountSubcategory.toUpperCase();

    if (subcategory == "CURRENT LIABILITIES") {
        currentLiabilityAccounts.push(accounts[i]);
    }

    if (subcategory == "CURRENT ASSETS") {
        currentAssetAccounts.push(accounts[i]);
    }

}