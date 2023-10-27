console.log("!!! admin_table_allusers.js loaded !!!");
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const db = getFirestore();
const users = collection(db, 'users');


// Function to handle the creation of a new user
async function createUser() {
    // Get values from the input fields
    const userEmail = document.getElementById("userEmail").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const address = document.getElementById("address").value;
    const DOB = document.getElementById("DOB").value;
    const password = document.getElementById("password").value;

    // Check if all fields are filled
    if (!userEmail || !firstName || !lastName || !address || !DOB || !password) {
        alert("Please fill out all fields.");
        return;
    }

    // Create a new user object
    const newUser = {
        userEmail: userEmail,
        firstName: firstName,
        lastName: lastName,
        address: address,
        DOB: DOB,
        password: password,
        approved: false,  // Assuming new users aren't approved automatically
        role: "user"
    };

    try {
        // Add the new user to the Firestore database
        const docRef = await addDoc(users, newUser);  // Assuming 'users' is the reference to your Firestore collection
        alert("User created successfully!");

        // Optionally, you can reload the user table to reflect the new data
        loadUsers();  // Assuming you have a function that loads users into a table
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("There was an error creating the user. Please try again.");
    }
}

// This function is triggered when the "Create User" button in the modal is clicked
function submitCreateUserForm() {
    createUser();
}
// Load user data when the page loads
async function loadUsers() {
    const q = query(users, where('approved', '!=', false));
    const userDocs = await getDocs(q);
    const usersArray = [];

    userDocs.forEach((doc) => {
        usersArray.push({ id: doc.id, ...doc.data() });
    });

    if ($.fn.dataTable.isDataTable('#datatablesSimple')) {
        // If table is initialized, clear and refresh data.
        $('#datatablesSimple').DataTable().clear().destroy();
    }

    const table = $('#datatablesSimple').DataTable({
        data: usersArray,
        columns: [
            { data: 'username', title: 'Username' },
            { data: 'userEmail', title: 'Email' },
            { data: 'firstName', title: 'First Name' },
            { data: 'lastName', title: 'Last Name' },
            { data: 'address', title: 'Address' },
            { data: 'DOB', title: 'DOB' }
        ],
        pageLength: 10,
    });

    // Add a click event listener to rows for showing extended table
    $('#datatablesSimple tbody').on('click', 'tr', function () {
        const data = table.row(this).data();
        showExtendedTable(data.username);
    });
}

loadUsers();
document.addEventListener("DOMContentLoaded", function() {
    const createUserButton = document.getElementById("createUserButton");
    const editUserBtn = document.getElementById("editUserBtn");
    let userIdToDelete = null;
    let userIdToSuspend = null;

    // Create User functionality
    createUserButton.addEventListener("click", function() {
        submitCreateUserForm();
    });



    // Delete User functionality
    $('#datatablesSimple').on('click', '.delete-button', function() {
        userIdToDelete = $(this).data('user-id');
        document.getElementById("deleteUserPopupBackground").style.display = "block";
        document.getElementById("deleteUserPopup").style.display = "block";
    });

    const deleteConfirmButton = document.getElementById("deleteUserBtn");
    deleteConfirmButton.addEventListener("click", async() => {
        if (userIdToDelete) {
            await deleteUser(userIdToDelete);
            userIdToDelete = null;
        }
    });

    const deleteCancelButton = document.getElementById("delete-cancel-button");
    deleteCancelButton.addEventListener("click", () => {
        document.getElementById("deleteUserPopupBackground").style.display = "none";
        document.getElementById("deleteUserPopup").style.display = "none";
        userIdToDelete = null;
    });

    async function deleteUser(id) {
        const userRef = doc(db, 'users', String(id));
        await updateDoc(userRef, { role: "deleted" });
        console.log("User deleted successfully");
        // TODO: Implement logic to update the user table after deletion
    }

    // Suspend User functionality
    const suspendButton = document.getElementById("suspend-button");
    suspendButton.addEventListener("click", function(event) {
        userIdToSuspend = event.target.getAttribute("data-user-id");
        document.getElementById("suspendPopup").style.display = "block";
    });

    const suspendConfirmButton = document.getElementById("suspend-confirm-button");
    suspendConfirmButton.addEventListener("click", () => {
        document.getElementById("datePopup").classList.remove("hidden");
    });

    const suspendCancelButton = document.getElementById("suspend-cancel-button");
    suspendCancelButton.addEventListener("click", () => {
        document.getElementById("datePopup").classList.add("hidden");
    });

    const dateSubmitButton = document.getElementById("date-submit-button");
    dateSubmitButton.addEventListener("click", async() => {
        const selectedDate = document.getElementById("date-input").value;
        const selectedTime = document.getElementById("time-input").value;
        if (userIdToSuspend) {
            await suspendUser(userIdToSuspend, selectedDate, selectedTime);
            userIdToSuspend = null;
        }
        document.getElementById("datePopup").style.display = "none";
    });

    async function suspendUser(id, selectedDate, selectedTime) {
        const userRef = doc(db, 'users', String(id));
        try {
            await updateDoc(userRef, {
                suspend: true,
                suspensionDate: selectedDate,
                suspensionTime: selectedTime,
            });
            alert("User has been suspended successfully.");
        } catch (error) {
            console.error("Error suspending user:", error);
            alert("An error occurred while suspending the user. Please try again later.");
        }
    }

    // Edit User functionality
    editUserBtn.addEventListener("click", function() {
        document.getElementById("editUserPopupBackground").style.display = "block";
        document.getElementById("editUserPopup").style.display = "block";
    });

    const editUserForm = document.getElementById("edit_user_form");
    editUserForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        // TODO: Implement logic to edit the user in Firebase Firestore
        closeEditUserPopup();
    });

    function closeEditUserPopup() {
        document.getElementById("editUserPopupBackground").style.display = "none";
        document.getElementById("editUserPopup").style.display = "none";
    }

    
    
});
