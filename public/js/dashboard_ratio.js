// current ratio = (current assets) / (current liabilities)
// debt ratio = (total debt) / (total assets)
// debt to equity ratio = (total debt) / (total assets)

import { convertBalanceToFloat, formatNumberToCurrency, getAllDocsFromCollection } from "./database_module.mjs";

console.log("dashboard_ratio.js has loaded!!");

const accounts = await getAllDocsFromCollection("accounts");
const currentRatioElement = document.getElementById("current_ratio_value");

console.log("1212121212121] accounts", accounts);
console.log("1212121212121] accounts size", accounts.length);

let currentLiabilityAccounts = [];
let currentAssetAccounts = [];
let currentLiabilities = 0;
let currentAssets = 0;
let currentRatio = 0;


for(let i = 0; i < accounts.length; i++) {
    const subcategory = accounts[i].data.accountSubcategory.toUpperCase();

    if (subcategory == "CURRENT LIABILITIES") {
        currentLiabilityAccounts.push(accounts[i]);
        currentLiabilities += await convertBalanceToFloat(accounts[i].data.balance);
    }

    if (subcategory == "CURRENT ASSETS") {
        currentAssetAccounts.push(accounts[i]);
        currentAssets += await convertBalanceToFloat(accounts[i].data.balance);
    }

}

console.log("1212121212121] current liability accounts", currentLiabilityAccounts);
console.log("1212121212121] current asset accounts", currentAssetAccounts);

currentRatio = currentAssets / currentLiabilities;

if (currentLiabilities == 0) {
    currentRatio = "Undefined";
} else {
    currentRatio = await formatNumberToCurrency(currentRatio);
    console.log("Hello", currentRatio);
}

currentRatioElement.textContent = currentRatio
console.log("1212121212121] current ratio", currentRatio);