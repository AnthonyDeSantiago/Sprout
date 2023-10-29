window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple);
    }
});

/* Column number adding */

/* new DataTable('#ledger', {
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
}); */


/* journal entry search function */
new DataTable('#journalEntriesTable', {
    initComplete: function () {
        this.api()
            .columns()
            .every(function () {
                let column = this;
                let title = column.footer().textContent;
 
                // Create input element
                let input = document.createElement('input');
                input.placeholder = title;
                column.footer().replaceChildren(input);
 
                // Event listener for user input
                input.addEventListener('keyup', () => {
                    if (column.search() !== this.value) {
                        column.search(input.value).draw();
                    }
                });
            });
    }
});

/* COA search function */
new DataTable('#asset_accounts', {
    initComplete: function () {
        this.api()
            .columns()
            .every(function () {
                let column = this;
                let title = column.footer().textContent;
 
                // Create input element
                let input = document.createElement('input');
                input.placeholder = title;
                column.footer().replaceChildren(input);
 
                // Event listener for user input
                input.addEventListener('keyup', () => {
                    if (column.search() !== this.value) {
                        column.search(input.value).draw();
                    }
                });
            });
    }
});

/* post-ref search function */
new DataTable('#postref', {
    initComplete: function () {
        this.api()
            .columns()
            .every(function () {
                let column = this;
                let title = column.footer().textContent;
 
                // Create input element
                let input = document.createElement('input');
                input.placeholder = title;
                column.footer().replaceChildren(input);
 
                // Event listener for user input
                input.addEventListener('keyup', () => {
                    if (column.search() !== this.value) {
                        column.search(input.value).draw();
                    }
                });
            });
    }
});


/* Ledger Total of debit and credit */

/* doesnt work for some reason in this project but in a test it does work but it only add from the row 
while in datatable live website it does both add and sub in all column*/

/* $(document).ready( function () {
    var table = $('#ledger').DataTable({ 

        drawCallback: function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page: 'applied'} ).nodes();
        var last = null;
        var sum = 0;
        var totals = {};
    
        
        // Loop all cells in account column
        api.cells(null, 0).every( function (rowIdx) {
            var data = this.data();
    
            if ( ! totals.hasOwnProperty( data ) ) {
                totals[data] = 0;
        }
    
            // Get the Debit and Credit 
            var salary = api.cell( rowIdx, 5).data();
            var salary2 = api.cell (rowIdx, 6).data();       
    
            //this adds the debit and credit column and show in balance column
            totals[data] += salary.replace(/[^\d.-]/g, '') * 1;
            totals[data] -= salary2.replace(/[^\d.-]/g, '') * 1;
    

        });
            console.log(totals);

            // Loop the Office cells to update the Sum column
            api.cells(null, 0).every( function (rowIdx) {
            var data = this.data();
            
            // Update the Cum column with the totoall for the group
            api.cell( rowIdx, 7).data( totals[data] );

            
            console.log(typeof totals);

        
        });
        

        },
});
}); */

