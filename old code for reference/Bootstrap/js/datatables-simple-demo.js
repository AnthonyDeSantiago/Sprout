window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple);
    }
});

window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('eventLog_entries');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple);
    }
});

new DataTable('#example', {
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




