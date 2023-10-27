// Simulated Chart of Accounts data
const chartOfAccounts = ["Account A", "Account B", "Account C"];

// Populate the account dropdown
chartOfAccounts.forEach(account => {
    $('#accountSelect').append(new Option(account, account));
});

// Reset form on "Reset" button click
$('#resetBtn').click(() => {
    $('#journalForm')[0].reset();
});

// Submit form functionality
$('#journalForm').submit(function(e) {
    e.preventDefault();
    // Add the new journal entry to the table for demonstration purposes
    $('#journalEntriesTable').append(`
        <tr>
            <td>${new Date().toLocaleDateString()}</td>
            <td>${$('#accountSelect').val()}</td>
            <td>${$('#debitAmount').val()}</td>
            <td>${$('#creditAmount').val()}</td>
            <td>Pending</td>
            <td><button class="btn btn-info btn-sm">View/Edit</button></td>
        </tr>
    `);
    $(this)[0].reset();
});
