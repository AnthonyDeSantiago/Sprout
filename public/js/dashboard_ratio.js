// current ratio = (current assets) / (current liabilities)
// debt ratio = (total debt) / (total assets)
// debt to equity ratio = (total debt) / (total assets)

import { convertBalanceToFloat, formatNumberToCurrency, getAllDocsFromCollection } from "./database_module.mjs";

console.log("dashboard_ratio.js has loaded!!");

const accounts = await getAllDocsFromCollection("accounts");
const currentRatioElement = document.getElementById("current_ratio_value");
const debtRatioElement = document.getElementById("debt_ratio_value");


console.log("1212121212121] accounts", accounts);
console.log("1212121212121] accounts size", accounts.length);

let currentLiabilityAccounts = [];
let currentAssetAccounts = [];
let currentLiabilities = 0;
let currentAssets = 0;
let currentRatio = 0;

let totalAssets = 0;
let totalAssetAccounts = [];
let totalLiabilities = 0;
let debtRatio = 0;

for(let i = 0; i < accounts.length; i++) {
    const subcategory = accounts[i].data.accountSubcategory.toUpperCase();
    const category = accounts[i].data.accountCategory.toUpperCase();

    if (category == "LIABILITIES") {
        totalLiabilities += await convertBalanceToFloat(accounts[i].data.balance);
    }

    if (category == "ASSETS") {
        totalAssetAccounts.push(accounts[i]);
        totalAssets += await convertBalanceToFloat(accounts[i].data.balance);
    }

    if (subcategory == "CURRENT LIABILITIES") {
        currentLiabilityAccounts.push(accounts[i]);
        currentLiabilities += await convertBalanceToFloat(accounts[i].data.balance);
    }

    if (subcategory == "CURRENT ASSETS") {
        currentAssetAccounts.push(accounts[i]);
        console.log("!!!!!1212121212121] value", accounts[i].data.balance)
        currentAssets += await convertBalanceToFloat(accounts[i].data.balance);
    }

}


console.log("1212121212121] current liability accounts", currentLiabilityAccounts);
console.log("1212121212121] Total asset accounts", totalAssetAccounts);

currentRatio = currentAssets / currentLiabilities;
debtRatio = totalLiabilities / totalAssets;


console.log("1212121212121] liabilities", currentLiabilities);
console.log("1212121212121] assets", currentAssets);

if (currentLiabilities == 0) {
    currentRatio = "Undefined";
} else {
    currentRatio = formatToPercent(currentRatio);
}

if (totalAssets == 0) {
    debtRatio = "Undefined";
} else {
    debtRatio = formatToPercent(debtRatio);
}

currentRatioElement.textContent = currentRatio;
debtRatioElement.textContent = debtRatio;
console.log("1212121212121] current ratio", currentRatio);






function formatToPercent(number) {
    const percentage = number;

    const options = {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };

    return percentage.toLocaleString(undefined, options);
}