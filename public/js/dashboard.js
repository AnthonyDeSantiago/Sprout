console.log("dashboard.js has loaded!!!");

import { getCollection, printDocumentIds } from "./database_module.mjs";

const accounts = getCollection('accounts');
printDocumentIds('accounts');