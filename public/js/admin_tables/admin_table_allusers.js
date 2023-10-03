function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.classList.toggle("show");
}

function goBack() {
    window.history.back();
}

function logout() {
    // Implement your logout logic here
}
// Log a message indicating that the script has been loaded
console.log("!!! admin_table_allusers.js loaded !!!");

// Import necessary functions from Firebase Firestore
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    updateDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Get a reference to the Firestore database
const db = getFirestore();

// Get a reference to the 'users' collection in the Firestore database
const users = collection(db, 'users');

// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", async function () {
    // Get references to various HTML elements
    const extendableTable = document.querySelector(".extendable-table");
    const extendedTable = document.querySelector(".extended-table");
    const suspendButton = document.getElementById("suspend-button");
    const suspendPopup = document.getElementById("suspendPopup");
    const suspendConfirmButton = document.getElementById("suspend-confirm-button");
    const suspendCancelButton = document.getElementById("suspend-cancel-button");
    const createUserButton = document.getElementById("createUserButton");
    const searchInput = document.getElementById("search");

    // Event listener for 'Create User' button click
createUserButton.addEventListener("click", () => {
    // Show the create user popup form
    document.getElementById("createUserPopup").classList.remove("hidden");
});



    // Event listener for create user form submission
    createUserForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get the new username from the form input
        const newUsername = document.getElementById("newUsername").value;
        // Implement logic to add the new user to Firebase Firestore here using 'newUsername'

        // Close the create user popup form after submission
        closeCreateUserPopup();
    });

    // Function to filter users by username based on search input
    function filterUsersByUsername(username) {
        // Get the table body element
        const tbody = document.querySelector(".extendable-table tbody");
        // Get all rows in the table body
        const rows = tbody.querySelectorAll("tr");

        // Loop through each row and check if the username matches the search term
        rows.forEach((row) => {
            const usernameCell = row.querySelector("td");
            const usernameText = usernameCell.textContent.toLowerCase();
            if (usernameText.includes(username.toLowerCase())) {
                row.style.display = ""; // Show matching rows
            } else {
                row.style.display = "none"; // Hide non-matching rows
            }
        });
    }

    // Event listener for search input changes
    searchInput.addEventListener("input", function () {
        // Get the trimmed search term from the input
        const searchTerm = searchInput.value.trim();
        // Call the filter function with the search term
        filterUsersByUsername(searchTerm);
    });

    // Function to add a new user to Firebase Firestore
    async function addNewUserToFirestore(username) {
        // Implement logic to add the new user to Firebase Firestore here using 'username'
    }

    // Function to close the create user popup form
    function closeCreateUserPopup() {
        // Hide the create user popup form
        document.getElementById("createUserPopup").style.display = "none";
    }

    // Function to load users from Firebase Firestore and populate the extendable table
    async function loadUsers() {
        // Array to store retrieved users from Firestore
        var usersArray = [];
        // Query to get users where role is not 'deleted'
        const q = query(users, where('role', '!=', "deleted"));
        // Get the documents from the query
        const userDocs = await getDocs(q);
        // Loop through the documents and add user data to the usersArray
        userDocs.forEach((doc) => {
            usersArray.push({ id: doc.id, username: doc.get("username") });
        });

        // Get the table body element
        const tbody = extendableTable.querySelector("tbody");
        // Clear existing rows in the table body
        tbody.innerHTML = "";

        // Loop through the usersArray and create rows for each user in the table
        usersArray.forEach((user) => {
            const row = document.createElement("tr");
            const usernameCell = document.createElement("td");

            // Add the user's username to the username cell
            usernameCell.innerText = user.username;
            // Add a click event listener to the username cell to show extended user data
            usernameCell.addEventListener("click", () => {
                showExtendedTable(user.username);
            });

            // Append the username cell to the row and the row to the table body
            row.appendChild(usernameCell);
            tbody.appendChild(row);
        });
    }

    // Function to display extended user data when a username is clicked
    async function showExtendedTable(username) {
        // Array to store retrieved user data from Firestore
        var readUser = [];
        // Query to get user data where username matches the clicked username
        const q = query(users, where('username', '==', username));
        // Get the documents from the query
        const getUsers = await getDocs(q);
        // Loop through the documents and add user data to the readUser array
        getUsers.forEach((doc) => {
            readUser.push({ id: doc.id, ...doc.data() });
        });

        // Get the user data object from the readUser array
        const userData = readUser[0];
        console.log(userData);

        // HTML content for the extended table displaying user details
        const extendedTableHtml = `
            <!-- Extended table HTML content with user details -->
        `;

        // Set the inner HTML of the extended table with the generated content
        extendedTable.innerHTML = extendedTableHtml;
        // Display the extended table
        document.getElementById("extended-table").style.display = "contents";
    }
// Variable to store the ID of the user to be deleted
let userIdToDelete = null;

// Event listener for the 'Delete' button click
const deleteButtons = document.querySelectorAll(".delete-button");
deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        // Get the user ID from the data attribute of the clicked delete button
        userIdToDelete = event.target.getAttribute("data-user-id");

        // Show the delete confirmation popup
        document.getElementById("deleteUserPopupBackground").style.display = "block";
        document.getElementById("deleteUserPopup").style.display = "block";
    });
});

// Function to delete a user by updating their 'role' field to 'deleted'
async function deleteUser(id) {
    // Reference to the user document in Firestore using the provided ID
    const userRef = doc(db, 'users', String(id));
    // Update the 'role' field to 'deleted'
    await updateDoc(userRef, {
        role: "deleted"
    });

    // Log a message indicating successful user deletion
    console.log("User deleted successfully");

    // Close the delete confirmation popup after deletion
    document.getElementById("deleteUserPopupBackground").style.display = "none";
    document.getElementById("deleteUserPopup").style.display = "none";

    // Show user deleted confirmation popup
    document.getElementById("userDeletedPopupBackground").style.display = "block";
    document.getElementById("userDeletedPopup").style.display = "block";

    // Automatically close the user deleted confirmation popup after 10 seconds
    setTimeout(() => {
        document.getElementById("userDeletedPopupBackground").style.display = "none";
        document.getElementById("userDeletedPopup").style.display = "none";
    }, 10000);

    // Update the username table after deletion (you need to implement this logic)
    // ...
}

// Event listener for 'Yes' button click in the delete confirmation popup
const deleteConfirmButton = document.getElementById("delete-confirm-button");
deleteConfirmButton.addEventListener("click", async () => {
    // Call the deleteUser function with the stored user ID to delete the user
    if (userIdToDelete) {
        await deleteUser(userIdToDelete);
        // Reset the stored user ID after deletion
        userIdToDelete = null;
    }
});

// Event listener for 'No' button click in the delete confirmation popup
const deleteCancelButton = document.getElementById("delete-cancel-button");
deleteCancelButton.addEventListener("click", () => {
    // Close the delete confirmation popup without deleting the user
    document.getElementById("deleteUserPopupBackground").style.display = "none";
    document.getElementById("deleteUserPopup").style.display = "none";

    // Reset the stored user ID when the user cancels the deletion
    userIdToDelete = null;
});

// Function to get the user ID to delete (used when 'Yes' is clicked in the delete confirmation popup)
function getUserIdToDelete() {
    // Return the stored user ID to delete, or null if no user ID is available
    return userIdToDelete;
}

    // Function to suspend a user by updating their 'suspend' field to true
    async function suspendUser(id) {
        // Reference to the user document in Firestore using the provided ID
        const userRef = doc(db, 'users', String(id));
        // Update the 'suspend' field to true
        await updateDoc(userRef, {
            suspend: true
        });
    }

    
    let userIdToSuspend = null;

    // Event listener for the 'Suspend' button click to display the suspend popup
    suspendButton.addEventListener("click", (event) => {
        // Get the user ID from the data attribute of the clicked element
        userIdToSuspend = event.target.getAttribute("data-user-id");
    
        // Show the suspend confirmation popup
        document.getElementById("suspendPopup").style.display = "block";
    
                // Event listener for 'Yes' button click in the suspend confirmation popup
        suspendConfirmButton.addEventListener("click", () => {
            // Show the date/time selection popup
            document.getElementById("datePopup").classList.remove("hidden");
        });

        // Event listener for 'No' button click in the suspend confirmation popup
        suspendCancelButton.addEventListener("click", () => {
            // Hide the date/time selection popup if the user clicks 'No'
            document.getElementById("datePopup").classList.add("hidden");
        });
    // Event listener for the 'Submit' button click in the date/time selection popup
    const dateSubmitButton = document.getElementById("date-submit-button");
    dateSubmitButton.addEventListener("click", async () => {
        // Get selected date and time values from the form inputs
        const selectedDate = document.getElementById("date-input").value;
        const selectedTime = document.getElementById("time-input").value;
    
        if (userIdToSuspend) {
            // Reference to the user document in Firestore using the stored user ID
            const userRef = doc(db, 'users', userIdToSuspend);
    
            try {
                // Update the user's record in the Firestore database with the suspension date and time
                await updateDoc(userRef, {
                    suspend: true, // Set 'suspend' field to true to suspend the user
                    suspensionDate: selectedDate,
                    suspensionTime: selectedTime,
                });
    
                // Display a confirmation message that the user has been suspended
                alert("User has been suspended successfully.");
            } catch (error) {
                console.error("Error suspending user:", error);
                alert("An error occurred while suspending the user. Please try again later.");
            }
    
            // Reset the stored user ID after processing suspension
            userIdToSuspend = null;
        }
    
        // Close the date/time selection popup
        document.getElementById("datePopup").style.display = "none";
    });

    // Event listener for the 'Edit' button click
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const userId = button.dataset.userId;
            editUser(userId);
        });
    });

    // Function to edit a user's information based on the provided user ID
    async function editUser(userid) {
        // Array to store retrieved user data from Firestore
        var readUser = [];
        // Convert the user ID to a string for query
        const id = userid.toString();
        // Query to get user data where 'id' field matches the provided user ID
        const q = query(users, where('id', '==', id));
        // Get the documents from the query
        const getUsers = await getDocs(q);
        // Loop through the documents and add user data to the readUser array
        getUsers.forEach((doc) => {
            readUser.push({ id: doc.id, ...doc.data() });
        });

        // Get the user data object from the readUser array
        const userData = readUser[0];
        
        // Display the edit user popup form
        document.getElementById("editUserPopup").style.display = "block";

        // Event listener for edit user form submission
        document.getElementById("editUserPopup").addEventListener("submit", async function (e) {
            e.preventDefault();

            // Get updated user information from the form inputs
            const newUserName = document.getElementById("newUsername").value;
            const newEmail = document.getElementById("newEmail").value;
            const newFirstNameElement = document.getElementById("newfirst_name").value;
            const newLastNameElement = document.getElementById("newlast_name").value;
            const newAddressElement = document.getElementById("newaddress").value;
            const newDOB = document.getElementById("newdateofbirth").value;

            // Reference to the user document in Firestore using the provided user ID
            const userRef = doc(db, 'users', String(id));

            // Update user information in Firestore
            await updateDoc(userRef, {
                username: newUserName,
                userEmail: newEmail,
                firstName: newFirstNameElement,
                lastName: newLastNameElement,
                address: newAddressElement,
                DOB: newDOB,
            });

            // Log a message indicating successful user update
            console.log("User updated successfully");

            // Close the edit user popup form after submission
            document.getElementById("editUserPopup").style.display = "none";
        });
    }

    const usernameCells = document.querySelectorAll(".extendable-table tbody td");
    usernameCells.forEach((cell) => {
        cell.addEventListener("click", () => {
            showExtendedTable(cell.innerText);
        });
    });

    // Load user data when the page loads
    loadUsers();
});
