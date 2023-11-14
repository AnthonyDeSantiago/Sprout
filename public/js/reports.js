  // Define columns for each table
  var trialBalanceColumns = [
    { title: 'Accounts', data: 'account' },
    { title: 'Debit Balances', data: 'debit' },
    { title: 'Credit Balances', data: 'credit' }
  ];
  var incomeStatementColumns = [
    { title: 'Revenue Streams', data: 'revenue' },
    { title: 'Expenses', data: 'expense' },
    { title: 'Net Income', data: 'netIncome' }
  ];
  var balanceSheetColumns = [
    { title: 'Assets', data: 'asset' },
    { title: 'Liabilities', data: 'liability' },
    { title: 'Equity', data: 'equity' }
  ];
  var retainedEarningsColumns = [
    { title: 'Beginning Retained Earnings', data: 'beginning' },
    { title: 'Net Income', data: 'netIncome' },
    { title: 'Dividends', data: 'dividend' },
    { title: 'Ending Retained Earnings', data: 'ending' }
  ];
  // Add event listener for Generate Reports button
 document.getElementById('dateRangeForm').addEventListener('submit', function(event) {
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
        fetchDataAndRenderRetainedEarnings(startDate, endDate);
    }


document.addEventListener('DOMContentLoaded', function() {

    // Fetch and render tables when the page is ready
    fetchDataAndRenderTables();

    // Add event listener for Generate Reports button
    document.getElementById('dateRangeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        generateReports();
    });

    // Add event listeners for action buttons
    document.getElementById('saveReport').addEventListener('click', function() {
        performReportAction('save');
    });

    document.getElementById('emailReport').addEventListener('click', function() {
        performReportAction('email');
    });

    document.getElementById('printReport').addEventListener('click', function() {
        performReportAction('print');
    });
    
});





function performReportAction(actionType) {
    const selectedReport = document.getElementById('reportSelector').value;
    const reportData = getReportData(selectedReport);

    switch(actionType) {
        case 'save':
            saveReport(reportData);
            break;
        case 'email':
            emailReport(reportData);
            break;
        case 'print':
            printReport(reportData);
            break;
        default:
            console.error('Invalid action type');
    }
}

// Function to handle the Save Report operation
function saveReport() {
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
function emailReport() {
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
function printReport() {
    // Simple client-side print functionality
    // This could be more complex depending on what exactly needs to be printed
    window.print();
}

// Placeholder function to get report data
function getReportData(selectedReport) {
    // Depending on the report selected, fetch the appropriate data
    if (selectedReport === 'all') {
        return {
            trialBalance: $('#trialBalanceTable').DataTable().data().toArray(),
            incomeStatement: $('#incomeStatementTable').DataTable().data().toArray(),
            balanceSheet: $('#balanceSheetTable').DataTable().data().toArray(),
            retainedEarnings: $('#retainedEarningsTable').DataTable().data().toArray(),
        };
    } else {
        return $(`#${selectedReport}Table`).DataTable().data().toArray();
    }
}

function fetchDataAndRenderTable(tableId, firebaseRef, columns, startDate, endDate) {
    var table = $('#' + tableId).DataTable({
        columns: columns,
        searching: false,
        paging: false
    });

    // Assuming 'date' is the field in your Firebase data that you want to filter by
    var query = database.ref(firebaseRef).orderByChild('date');
    if(startDate) {
        query = query.startAt(startDate);
    }
    if(endDate) {
        query = query.endAt(endDate);
    }

    // Fetch data from Firebase with the new query
    query.on('value', function(snapshot) {
        table.clear();
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var rowData = columns.map(column => childData[column.data] || '');
            table.row.add(rowData);
        });
        table.draw();
    });
}

  
  
  // Call function to render each table
  $(document).ready(function() {
    fetchDataAndRenderTrialBalance(startDate, endDate);
    fetchDataAndRenderIncomeStatement(startDate, endDate);
    fetchDataAndRenderBalanceSheet(startDate, endDate);
    fetchDataAndRenderRetainedEarnings(startDate, endDate);
});

//---------------

// Function to fetch data and render the Trial Balance table
function fetchDataAndRenderTrialBalance(startDate, endDate) {
    var table = $('#trialBalanceTable').DataTable({
        columns: [
            { title: 'Accounts', data: 'name' },
            { title: 'Debit Balances', data: 'debit' },
            { title: 'Credit Balances', data: 'credit' }
        ],
        searching: false,
        paging: false
    });

    // Clear any old data in the table
    table.clear();

    // Fetch accounts from the Firebase collection
    database.collection('accounts').where('date', '>=', startDate).where('date', '<=', endDate).get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            var account = doc.data();
            // Add a new row to the DataTable for each account
            table.row.add({
                name: account.name,
                debit: account.debit || 0, // If no debit, default to 0
                credit: account.credit || 0 // If no credit, default to 0
            });
        });
        // Redraw the DataTable with new data
        table.draw();
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });
}
    // Function to fetch data and render the Trial Balance table
function fetchDataAndRenderIncomeStatement(startDate, endDate) {
    var table = $('#incomeStatementTable').DataTable({
        columns: [
            { title: 'Revenue Streams', data: 'Revenue' },
            { title: 'Expenses', data: 'Expenses' },
            { title: 'Net income', data: 'Netincome' }
        ],
        searching: false,
        paging: false
    
});
 // Clear any old data in the table
 table.clear();

 // Fetch accounts from the Firebase collection
 database.collection('accounts').where('date', '>=', startDate).where('date', '<=', endDate).get()
 .then(querySnapshot => {
     querySnapshot.forEach(doc => {
         var account = doc.data();
         // Add a new row to the DataTable for each account
         table.row.add({
            //replace collection name . value pull
            Revenue: account.name,
            Expenses: account.debit || 0, // If no debit, default to 0
            Netincome: account.credit || 0 // If no credit, default to 0
         });
     });
     // Redraw the DataTable with new data
     table.draw();
 })
 .catch(error => {
     console.error("Error fetching data: ", error);
 });


}
     // Function to fetch data and render the Trial Balance table
function fetchDataAndRenderBalanceSheet(startDate, endDate) {
    var table = $('#balanceSheetTable').DataTable({
        columns: [
            { title: 'Assets', data: 'name' },
            { title: 'Liabilities', data: 'debit' },
            { title: 'Equity', data: 'credit' }
        ],
        searching: false,
        paging: false
    });
//asset name, asset amount ,asset total 

//Liabilities name ,Liabilities amount ,Liabilities total 

//Equity name ,Equity amount ,Equity total 


}

     // Function to fetch data and render the Trial Balance table
function fetchDataAndRenderRetainedEarnings(startDate, endDate) {
    var table = $('#retainedEarningsTable').DataTable({
        columns: [
            { title: 'Beginning Retained Earnings', data: 'BRetainedEarnings' },
            { title: 'Net Income', data: 'NetI' },
            { title: 'Dividends', data: 'Dividends' },
            { title: 'Ending Retained Earnings', data: 'ERetainedEarnings' }
        ],
        searching: false,
        paging: false
    });
   // Retaining earnings needs pulls from all 3 collections


// Clear any old data in the table
table.clear();

// Fetch accounts from the Firebase collection
database.collection('accounts').where('date', '>=', startDate).where('date', '<=', endDate).get()
.then(querySnapshot => {
    querySnapshot.forEach(doc => {
        var account = doc.data();
        // Add a new row to the DataTable for each account
        table.row.add({
           //replace collection name . value pull
            //Beginning retaining earnings from accounts name type 'retained earnings'  return the balance amount
            BRetainedEarnings:

            

          /* Revenue: account.name,
           Expenses: account.debit || 0, // If no debit, default to 0
           Netincome: account.credit || 0 // If no credit, default to 0*/
        });

    });
    =

    // Redraw the DataTable with new data
    table.draw();
})


//Net income - all incomes +all expenses from transactions 
NetI:
//Dividends- from transactions 
Dividends:
//End retaining- beginning retaining + net income)- dividends 
ERetainedEarnings: 

.catch(error => {
    console.error("Error fetching data: ", error);
});
/*for fetchDataAndRenderRetainedEarnings firebase // Placeholder for the calculations
    let beginningRetainedEarnings = 0;
    let netIncome = 0;
    let dividends = 0;

    // Fetch beginning retained earnings from 'accounts' collection
    database.collection('accounts').where('name', '==', 'Retained Earnings')
    .get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            beginningRetainedEarnings = doc.data().balance; // Assuming there's a balance field
        });

        // Now fetch revenues and expenses from 'transactions' collection
        return database.collection('transactions').where('date', '>=', startDate).where('date', '<=', endDate).get();
    })
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            let transaction = doc.data();
            if (transaction.type === 'Revenue') {
                netIncome += transaction.amount;
            } else if (transaction.type === 'Expense') {
                netIncome -= transaction.amount;
            } else if (transaction.type === 'Dividend') {
                dividends += transaction.amount;
            }
        });

        // Assuming we have all the data now, calculate ending retained earnings
        let endingRetainedEarnings = beginningRetainedEarnings + netIncome - dividends;

        // Add the calculated values to the DataTable
        table.clear();
        table.row.add({
            BRetainedEarnings: beginningRetainedEarnings,
            Revenue: netIncome,  // This is total revenue minus expenses
            Dividends: dividends,
            ERetainedEarnings: endingRetainedEarnings
        });
        table.draw();
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });
}*/

}

    





