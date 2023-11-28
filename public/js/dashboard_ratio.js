// current ratio = (current assets) / (current liabilities)
// debt ratio = (total debt) / (total assets)
// debt to equity ratio = (total debt) / (total assets)

import { convertBalanceToFloat, formatNumberToCurrency, getAllDocsFromCollection } from "./database_module.mjs";

console.log("dashboard_ratio.js has loaded!!");

const accounts = await getAllDocsFromCollection("accounts");
const journals = await getAllDocsFromCollection("journals");
const users = await getAllDocsFromCollection("users");
const currentRatioElement = document.getElementById("current_ratio_value");
const debtRatioElement = document.getElementById("debt_ratio_value");
const approvedJournalsElement = document.getElementById("approved_journals_value");
const pendingJournalsElement = document.getElementById("pending_journals_value");
const rejectedJournalsElement = document.getElementById("rejected_journals_value");
const approvedUsersElement = document.getElementById("approved_users_value");
const suspendedUsersElement = document.getElementById("suspended_users_value");
const rejectUsersElement = document.getElementById("rejected_users_value");


console.log("1212121212121] users", users);
console.log("1212121212121] users size", users.length);

let currentLiabilityAccounts = [];
let currentAssetAccounts = [];
let currentLiabilities = 0;
let currentAssets = 0;
let currentRatio = 0;

let totalAssets = 0;
let totalAssetAccounts = [];
let totalLiabilities = 0;
let debtRatio = 0;

let totalJournalsApproved = 0;
let totalJournalsPending = 0;
let totalJournalsRejected = 0;

let totalUsersApproved = 0;
let totalUsersRejected = 0;
let totalUsersSuspended = 0;


for (let i = 0; i < users.length; i++) {
    const approved = users[i].data.approved;
    const suspened = users[i].data.suspended;

    if (approved) {
        totalUsersApproved += 1;
    } else {
        totalUsersRejected += 1;
    }

    if (suspened) {
        totalUsersSuspended += 1;
    }

}


for (let i = 0; i < journals.length; i++) {
    const approval = journals[i].data.approval.toUpperCase();

    if (approval == "APPROVED") {
        totalJournalsApproved += 1;
    }

    if (approval == "PENDING") {
        totalJournalsPending += 1;
    }

    if (approval == "REJECTED") {
        totalJournalsRejected += 1;
    }

}

console.log("ashdkfja;lkdjf;akflajsd;fa;dlkfa", totalJournalsRejected);

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

approvedJournalsElement.textContent = totalJournalsApproved;
pendingJournalsElement.textContent = totalJournalsPending;
rejectedJournalsElement.textContent = totalJournalsRejected;

approvedUsersElement.textContent = totalUsersApproved;
suspendedUsersElement.textContent = totalUsersSuspended;
rejectUsersElement.textContent = totalUsersRejected;

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