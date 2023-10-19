console.log("event-log.js has loaded!!!");

import { getCollection, printDocumentIds, populateTable, addDocument, getTimestamp, getAccountData} from "./database_module.mjs";

const eventLog = await getCollection('eventLog');


printDocumentIds('eventLog');

populateTable('eventLog', 'eventLog_entries');


document.addEventListener("DOMContentLoaded", function () {
    const eventLogForm = document.getElementById("eventLogForm");


    eventLogForm.addEventListener("submit", async function (e) {
        e.preventDefault(); 
        
        if (e.submitter === addSaveButton) {
            const username = document.getElementById("username").value;
            const eventID = document.getElementById("eventID").value;
            const eventType = document.getElementById("eventType").value;
            const timestamp = document.getElementById("timestamp").value;
            const beforeImage = document.getElementById("beforeImage").value;
            const afterImage = document.getElementById("afterImage").value;
            
            newEvent = {
                beforeImage: beforeImage,
                eventType: eventType,
                username: username,
                eventID: eventID,
                afterImage: afterImage,
                timestamp: timestamp,
            }

            await addDocument('eventLog', newEvent);
    
            eventLogForm.reset();
            location.reload();
        }


        
    });

    

    console.log("made it to the end");

});

const editButton = document.querySelector('.btn[data-bs-target="#eventLogModal"]');

const defaultValues = {
    username: "Username",
    eventID: "12345",
    eventType: "Default Description",
    timestamp: "Time and Date",
    beforeImage: "Image Before Edit",
    afterImage: "Image After Edit",
};

// Function to populate the form with default values
function populateFormWithDefaultValues() {
    document.getElementById("username").value = defaultValues.username;
    document.getElementById("eventID").value = defaultValues.eventID;
    document.getElementById("eventType").value = defaultValues.eventType;
    document.getElementById("timestamp").value = defaultValues.timestamp;
    document.getElementById("beforeImage").value = defaultValues.beforeImage;
    document.getElementById("afterImage").value = defaultValues.afterImage;
}



editButton.addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const editAccountModal = new bootstrap.Modal(document.getElementById("editAccountModal"));
            


    populateFormWithDefaultValues();

    editAccountModal.show();

    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            const row = checkbox.closest('tr');
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            
            console.log('Checked Row Data:', rowData);
            console.log("Account Number: ", rowData[1]);
            const accountNum = rowData[1];

            data = await getAccountData(rowData[1]);
            console.log("Data: ", data);

            break;
        }
    }
});


/* REQ FOR EVENT LOG */
window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('eventLog_entries');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple);
    }
});

new DataTable('#eventLog_entries', {
    footerCallback: function (row, data, start, end, display) {
        let api = this.api();

        // Remove the formatting to get integer data for summation
        let intVal = function (i) {
            return typeof i === 'string'
                ? i.replace(/[\$,]/g, '') * 1
                : typeof i === 'number'
                ? i
                : 0;
        };

        // Total over all pages
        total = api
            .column(4)
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Total over this page
        pageTotal = api
            .column(4, { page: 'current' })
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Update footer
        api.column(4).footer().innerHTML =
            '$' + pageTotal + ' ( $' + total + ' total)';

        
            // Total over all pages
        total = api
            .column(3)
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Total over this page
        pageTotal = api
            .column(3, { page: 'current' })
            .data()
            .reduce((a, b) => intVal(a) + intVal(b), 0);

        // Update footer
        api.column(3).footer().innerHTML =
            '$' + pageTotal + ' ( $' + total + ' total)';

    }
});
