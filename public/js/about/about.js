// about.js


function goBack() {
    if (firebase.auth().currentUser) {
        // User is signed in, redirect to the previous page
        window.history.back();
    } else {
        // User is not signed in, handle accordingly (e.g., show a message)
        alert("You need to sign in first.");
    }
}
