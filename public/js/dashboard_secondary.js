import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { fetchUserFromEmail, getUserDataWithAuth, getUsernameWithAuth } from "/js/sprout.js"

console.log("!!! dashboard-secondary.js loaded !!!");

const auth = getAuth(); //Init Firebase Auth + get a reference to the service
let userData = null;

const db = getFirestore();
let account_db_snap = [];

let currentUser = "YOUR_USER_NAME"; // You can replace this later

const checkAuthState = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {

            account_db_snap = await getAccountsList();
            account_db_snap.sort();

            let CR = await getCashRatio();
            let ROA = await getROA();
            let DER = await getDER();

            document.getElementById('cashRatio').textContent = CR;
            document.getElementById('ROA').textContent = ROA;
            document.getElementById('DER').textContent = DER;


        }
        else {
            //code here will impact page at most basic level, so be careful
            alert("Unable to resolve the role associated with your account. Please contact the admin.");
            signOut(auth);
            window.location = 'index.html';
        }
    })
}


async function getAccountsList() {
    const accountsCollection = collection(db, 'accounts');
    const accountsQuery = query(accountsCollection, where("active","==", true));

    try {
        const querySnapshot = await getDocs(accountsQuery);
        const accountsList = [];
        querySnapshot.forEach((doc) => {
            accountsList.push({ id: doc.id, ...doc.data() });
        });
        return accountsList;
    } catch (error) {
        console.error('Error happened: ', error);
        throw error;
    }
}

async function getROA(){

    let ROA = ""
    let netIncome = 0.0
    let revenueSum = 0.0
    let expenseSum = 0.0
    let assetSum = 0.0

    try {
        //document.getElementById('dateRange4').textContent = startDate.toString() + " - " + endDate.toString();
        //document.getElementById('dateRange5').textContent = startDate.toString() + " - " + endDate.toString();
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.statement == "Income Statement") {
                if (account.accountCategory == "Revenue") {
                    revenueSum = revenueSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
                else if (account.accountCategory == "Expenses") {
                    expenseSum = expenseSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
            }
    
            if (account.statement == "Balance Sheet") {
                if (account.accountCategory == "Assets") {
                    assetSum = assetSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
                }
            }
        }

        netIncome = revenueSum - expenseSum;
        ROA = ((netIncome/assetSum) * 100).toFixed(2) + "%";

        console.log("ROA = " + ROA);

        return ROA;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"
}

async function getCashRatio(){

    let cashRatio = ""
    let cashSum = 0.0
    let currentLiabilitiesSum = 0.0

    try {
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.accountSubcategory == "Current Liabilities") {
                currentLiabilitiesSum = currentLiabilitiesSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }

            if (account.accountSubcategory == "Cash and Marketable Securities") {
                cashSum = cashSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
        }

        cashRatio = ((cashSum/currentLiabilitiesSum) * 100).toFixed(2) + "%";

        console.log("cashRatio = " + cashRatio);

        return cashRatio;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"    
}

/*Debt to Equity Ration */
async function getDER(){

    let DER = ""
    let liabSum = 0.0
    let equitSum = 0.0

    try {
        let i = 0;
        for (i = 0; i < account_db_snap.length; i++) {
            const account = account_db_snap[i];
            if (account.accountCategory == "Liabilities") {
                liabSum = liabSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
            else if (account.accountCategory == "Equity") {
                equitSum = equitSum + parseFloat(account.balance.replace(/,/g, '').replace("$", ''));
            }
        }

        DER = ((liabSum/equitSum) * 100).toFixed(2) + "%";

        console.log("Debt-to-Equity Ratio = " + DER);

        return DER;

    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    return "error"    
}

checkAuthState();
