window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const asset_accounts = document.getElementById('asset_accounts');
    const deactivated_accounts = document.getElementById('deactivated_accounts');

    if (asset_accounts) {
        new simpleDatatables.DataTable(asset_accounts);
    }


    if (deactivated_accounts) {
        new simpleDatatables.DataTable(deactivated_accounts);
    }
    


});
