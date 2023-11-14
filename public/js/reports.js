import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

console.log("!!! reports.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;

const db = getFirestore();
const journals_db = collection(db, 'journals');
const transactions_db = collection(db, 'transactions');
const accounts_db = collection(db, 'accounts');
let currentUser = "YOUR_USER_NAME"; // You can replace this later
let account_db_snap = [];

// Add event listener for Load Reports button
document.getElementById('dateRangeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    // Get the selected dates
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const currentDate = new Date().toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

    // Validate the date range
    if (new Date(startDate) > new Date(endDate)) {
        alert('The start date must be before the end date.');
        return;
    }

    // Ensure neither date is in the future
    if (startDate > currentDate || endDate > currentDate) {
        alert('You cannot select a future date.');
        return;
    }

    // Generate reports based on the selected date range
    generateReports(startDate, endDate);
});


function generateReports(startDate, endDate) {
    // Now, you need to pass the start and end dates to the fetchDataAndRenderTable function
    fetchDataAndRenderTrialBalance(startDate, endDate);
    fetchDataAndRenderIncomeStatement(startDate, endDate);
    fetchDataAndRenderBalanceSheet(startDate, endDate);
    //fetchDataAndRenderRetainedEarnings(startDate, endDate);
}


const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {

            account_db_snap = await getAccountsList();
            account_db_snap.sort();
            // Fetch and render tables when the page is ready
            // Fetch and render tables when the page is ready
            //fetchDataAndRenderTables();
            // Fetch and render tables when the page is ready
            //fetchDataAndRenderTables();

            // Add event listener for Generate Reports button
            document.getElementById('dateRangeForm').addEventListener('submit', function (event) {
                event.preventDefault();
                generateReports();

            });

            document.getElementById('reportSelector').addEventListener('change', function () {
                const selectedReport = document.getElementById('reportSelector').value;
                getReportData(selectedReport);
                console.log("Report type selected!")
            });

            // Add event listeners for action buttons
            document.getElementById('saveReport').addEventListener('click', function () {
                performReportAction('save');
            });

            document.getElementById('emailReport').addEventListener('click', function () {
                performReportAction('email');
            });

            document.getElementById('printReport').addEventListener('click', function () {
                performReportAction('print');
            });

        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}




function performReportAction(actionType) {
    const selectedReport = document.getElementById('reportSelector').value;
    getReportData(selectedReport);

    switch (actionType) {
        case 'save':
            saveReport(selectedReport);
            break;
        case 'email':
            emailReport(selectedReport);
            break;
        case 'print':
            printReport(selectedReport);
            break;
        default:
            console.error('Invalid action type');
    }
}

// Function to handle the Save Report operation
function saveReport(selectedReport) {
    // Logic to save the report on the server or client-side
    // This might involve converting the report to a downloadable format like PDF
    // Example using a generic API call (this will differ based on your actual implementation)
    const reportData = getReportData();

    fetch('/api/save-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
    })
        .then(response => response.blob())
        .then(blob => {
            // Create a link element, use it to download the file and remove it
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = 'report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert('Your file has downloaded!'); // or your custom code
        })
        .catch(() => alert('Could not save the report.'));
}

// Function to handle the Email Report operation
function emailReport(selectedReport) {
    // This would typically involve sending data to the server
    // which would then email the report to a specified address
    // Here is a generic example of what that request might look like
    const reportData = getReportData();
    const email = "user@example.com"; // The email address to send to, can be dynamic

    fetch('/api/email-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportData, email }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Email sent successfully!');
            } else {
                alert('Failed to send email.');
            }
        })
        .catch(() => alert('Could not send the report via email.'));
}

// Function to handle the Print Report operation
function printReport(selectedReport) {
    // Simple client-side print functionality
    // This could be more complex depending on what exactly needs to be printed
    window.print();
}

// Function to select which report shows based on drop down selection
function getReportData(selectedReport) {
    // Depending on the report selected, fetch the appropriate data
    switch (selectedReport) {
        case 'all':
            document.getElementById("balanceSheet").style.display = "";
            document.getElementById("trialBalance").style.display = "";
            document.getElementById("incomeStatement").style.display = "";
            //TBD RETAINED EARNINGS
            break;
        case 'trialBalance':
            document.getElementById("balanceSheet").style.display = "none";
            document.getElementById("trialBalance").style.display = "";
            document.getElementById("incomeStatement").style.display = "none";
            //TBD RETAINED EARNINGS
            break;
        case 'incomeStatement':
            document.getElementById("balanceSheet").style.display = "none";
            document.getElementById("trialBalance").style.display = "none";
            document.getElementById("incomeStatement").style.display = "";
            //TBD RETAINED EARNINGS
            break;
        case 'balanceSheet':
            document.getElementById("balanceSheet").style.display = "";
            document.getElementById("trialBalance").style.display = "none";
            document.getElementById("incomeStatement").style.display = "none";
            //TBD RETAINED EARNINGS
            break;
        case 'none':
            document.getElementById("balanceSheet").style.display = "none";
            document.getElementById("trialBalance").style.display = "none";
            document.getElementById("incomeStatement").style.display = "none";
            //TBD RETAINED EARNINGS
            break;
        //TBD RETAINED EARNINGS    
        default:
            console.error('Invalid action type');
    }
}



// Function to fetch data and render the Trial Balance table
function fetchDataAndRenderTrialBalance(startDate, endDate) {
    let tableBodyTrial = document.querySelector(`#trialBalanceTable tbody`);
    let tableBodyTotal = document.querySelector(`#trialTotalTable tbody`);
    let debitSum = parseFloat('0.0');
    let creditSum = parseFloat('0.0');
    tableBodyTrial.innerHTML = ``;
    tableBodyTotal.innerHTML = ``;

    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    //TBD DATE SELECTION
    console.log("accounts_db_snap length: " + account_db_snap.length);
    console.log(account_db_snap);

    try {
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];

            if (account.normalSide == "Debit") {
                const row = tableBodyTrial.insertRow();
                debitSum = debitSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                row.innerHTML = `
                    <td>${account.accountName.toString()}</td>
                    <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                    <td></td>
                `;

                //row.addEventListener('click', async () => {
                //console.log("Row clicked, the entry is: ", account.id);
                //currentEntry = account.id;
                //callback(account);
                //});
            }
            else if (account.normalSide == "Credit") {
                const row = tableBodyTrial.insertRow();
                creditSum = creditSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                row.innerHTML = `
                    <td>${account.accountName.toString()}</td>
                    <td></td>
                    <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                `;

            }

        }

        const row = tableBodyTrial.insertRow();

        row.innerHTML = `
            <th class="table-info" width="40%">TOTAL: </th>
            <th class="table-info" width="30%">${USDollar.format(debitSum)}</th>
            <th class="table-info" width="30%">${USDollar.format(creditSum)}</th>
        `;

        document.getElementById("dateTime2").textContent = new Date().toString();

    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

// Function to fetch data and render the Income Statement table
function fetchDataAndRenderIncomeStatement(startDate, endDate) {
    let tableBodyRev = document.querySelector(`#isRevenue tbody`);
    let tableBodyExp = document.querySelector(`#isExpenses tbody`);
    let tableBodyNet = document.querySelector(`#isNet tbody`);
    let revenueSum = parseFloat('0.0');
    let expenseSum = parseFloat('0.0');
    tableBodyRev.innerHTML = ``;
    tableBodyExp.innerHTML = ``;
    tableBodyNet.innerHTML = ``;

    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    //TBD DATE SELECTION
    console.log("accounts_db_snap length: " + account_db_snap.length);
    console.log(account_db_snap);

    try {
        //document.getElementById('dateRange4').textContent = startDate.toString() + " - " + endDate.toString();
        //document.getElementById('dateRange5').textContent = startDate.toString() + " - " + endDate.toString();
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.statement == "Income Statement") {
                if (account.accountCategory == "Revenue") {
                    const row = tableBodyRev.insertRow();
                    revenueSum = revenueSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                    row.innerHTML = `
                    <td>${account.accountName.toString()}</td>
                    <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                `;

                    //row.addEventListener('click', async () => {
                    //console.log("Row clicked, the entry is: ", account.id);
                    //currentEntry = account.id;
                    //callback(account);
                    //});
                }
                else if (account.accountCategory == "Expenses") {
                    const row = tableBodyExp.insertRow();
                    expenseSum = expenseSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                    row.innerHTML = `
                    <td>${account.accountName.toString()}</td>
                    <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                `;

                }

            }


        }

        const rowRev = tableBodyRev.insertRow();
        rowRev.innerHTML = `
            <th class="table-info" scope="row">TOTAL REVENUE</th>
            <td class="table-info" id="revenueSum">${USDollar.format(revenueSum)}</td>
        `;

        const rowExp = tableBodyExp.insertRow();
        rowExp.innerHTML = `
            <th class="table-info" scope="row">TOTAL EXPENSES</th>
            <td class="table-info" id="expenseSum">${USDollar.format(expenseSum)}</td>
        `;

        const rowNet = tableBodyNet.insertRow();
        rowNet.innerHTML = `
            <th class="table-info" scope="col" width="50%">NET INCOME</th>
            <th class="table-info" scope="col" id="netIncome">${USDollar.format(revenueSum - expenseSum)}</td >
        `;

        document.getElementById("dateTime3").textContent = new Date().toString();

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

}

// Function to fetch data and render the Balance Sheet table
function fetchDataAndRenderBalanceSheet(startDate, endDate) {
    let tableBodyAssets = document.querySelector(`#bsAssets tbody`);
    let tableBodyLiab = document.querySelector(`#bsLiabilities tbody`);
    let tableBodyEquit = document.querySelector(`#bsEquity tbody`);

    let assetSum = parseFloat('0.0');
    let liabSum = parseFloat('0.0');
    let equitSum = parseFloat('0.0');
    tableBodyAssets.innerHTML = ``;
    tableBodyEquit.innerHTML = ``;
    tableBodyLiab.innerHTML = ``;


    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    //TBD DATE SELECTION
    console.log("accounts_db_snap length: " + account_db_snap.length);
    console.log(account_db_snap);

    try {
        //document.getElementById('dateRange4').textContent = startDate.toString() + " - " + endDate.toString();
        //document.getElementById('dateRange5').textContent = startDate.toString() + " - " + endDate.toString();
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.statement == "Balance Sheet") {
                if (account.accountCategory == "Assets") {
                    const row = tableBodyAssets.insertRow();
                    assetSum = assetSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                    row.innerHTML = `
                        <td>${account.accountName.toString()}</td>
                        <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                    `;

                }
                else if (account.accountCategory == "Liabilities") {
                    const row = tableBodyLiab.insertRow();
                    liabSum = liabSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                    row.innerHTML = `
                        <td>${account.accountName.toString()}</td>
                        <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                    `;

                }
                else if (account.accountCategory == "Equity") {
                    const row = tableBodyEquit.insertRow();
                    liabSum = equitSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));

                    row.innerHTML = `
                        <td>${account.accountName.toString()}</td>
                        <td>${USDollar.format(account.balance.replace(/,/g, '').replace("$", ''))}</td>
                    `;

                }

            }


        }

        const rowAst = tableBodyAssets.insertRow();
        rowAst.innerHTML = `
                <th class="table-info" scope="row">TOTAL ASSETS</th>
                <td class="table-info" id="assetsSum">${USDollar.format(assetSum)}</td>
            `;

        const rowLiab = tableBodyLiab.insertRow();
        rowLiab.innerHTML = `
                <th class="table-info" scope="row">Total Liabilities</th>
                <td class="table-info" id="liabilitiesSum">${USDollar.format(liabSum)}</td>
            `;

        const rowEquit = tableBodyEquit.insertRow();
        rowEquit.innerHTML = `
                <th class="table-info" scope="row">Total Stakeholder's Equity</th>
                <td class="table-info" id="equitySum">${USDollar.format(equitSum)}</td>
            `;

        const rowLiabEquit = tableBodyEquit.insertRow();
        rowLiabEquit.innerHTML = `
            <th class="table-info" scope="col" width="50%">TOTAL LIABILITIES & EQUITY</th>
            <th class="table-info" scope="col" id="liabilityEquitySum">${USDollar.format(liabSum + equitSum)}</td >
        `;

        document.getElementById("dateTime1").textContent = new Date().toString();

    } catch (error) {
        console.error("Error fetching data: ", error);
    }


}

async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection, where("active","==", true));

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push({ id: doc.id, ...doc.data() });
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}


checkAuthState();

