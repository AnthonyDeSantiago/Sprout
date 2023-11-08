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
        fetchDataAndRenderTable('trialBalanceTable', 'trial_balance', trialBalanceColumns, startDate, endDate);
        fetchDataAndRenderTable('incomeStatementTable', 'income_statement', incomeStatementColumns, startDate, endDate);
        fetchDataAndRenderTable('balanceSheetTable', 'balance_sheet', balanceSheetColumns, startDate, endDate);
        fetchDataAndRenderTable('retainedEarningsTable', 'retained_earnings', retainedEarningsColumns, startDate, endDate);
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
  
  // Call function to render each table
  $(document).ready(function() {
    fetchDataAndRenderTable('trialBalanceTable', 'trial_balance', trialBalanceColumns);
    fetchDataAndRenderTable('incomeStatementTable', 'income_statement', incomeStatementColumns);
    fetchDataAndRenderTable('balanceSheetTable', 'balance_sheet', balanceSheetColumns);
    fetchDataAndRenderTable('retainedEarningsTable', 'retained_earnings', retainedEarningsColumns);
  });
