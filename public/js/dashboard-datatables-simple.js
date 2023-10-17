window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const asset_accounts = document.getElementById('asset_accounts');
    const liability_accounts = document.getElementById('liability_accounts');

    if (asset_accounts) {
        new simpleDatatables.DataTable(asset_accounts);
    }


    if (liability_accounts) {
        new simpleDatatables.DataTable(liability_accounts);
    }
    


});
