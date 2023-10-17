console.log("dashboard.js has loaded!!!");



import { getCollection, printDocumentIds, populateTable} from "./database_module.mjs";

const accounts = getCollection('accounts');
printDocumentIds('accounts');

populateTable('accounts', 'asset', 'asset_accounts');