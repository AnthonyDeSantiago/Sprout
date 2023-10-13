console.log("!!! eventLog.js has loaded !!!")

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

import { collection, doc, getDoc, getDocs, addDoc, setDoc, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { query, orderBy, limit, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js"

const firebaseConfig = {
    apiKey: "AIzaSyDA5itOehOkeLc9ob3a8GsTJ9VhbWdee7I",
    authDomain: "sprout-financials.firebaseapp.com",
    databaseURL: "https://sprout-financials-default-rtdb.firebaseio.com",
    projectId: "sprout-financials",
    storageBucket: "sprout-financials.appspot.com",
    messagingSenderId: "864423850272",
    appId: "1:864423850272:web:725227e1ed9a578ef36745",
    measurementId: "G-Z0E9H5Z16M"
};


try {
    const db = getFirestore();
    console.log("Firestore instance successfully initialized hooway man!: ", db);

    // Going start with event logging user's data for now and expand to other data later
    const users = collection(db, 'users');
    const eventLog = collection(db, 'eventLog');

    let initialLoad = true;

    onSnapshot(users, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const doc = change.doc;
            const docID = doc.id;
            const eventType = change.type;
            const timestamp = serverTimestamp();

            let beforeImage = {};
            let afterImage = {};

            if (initialLoad && eventType == 'added') {
                return;
            }

            if (eventType === 'added' || eventType === 'modified') {
                beforeImage = doc.data();
            }

            if (eventType === 'modified' || eventType === 'removed') {
                afterImage = doc.data();
            }

            const logData = {
                afterImage: afterImage,
                eventType: eventType,
                userId: '',
                timestamp: timestamp
            }

            addDoc(eventLog, logData)
                .then((eventLog) => {
                    console.log('Document is added to event log!');
                })
                .catch((error) => {
                    console.log('There was an error add doc to event log!');
                });



            console.log("!!!!!!!!!!A change has been detected in users database!!!!!!!!");
            console.log(afterImage);
            console.log(docID);


            initialLoad = false;
        });
    });

} catch (error) {
    console.log("Error initializing Firestore: ", error);
}


