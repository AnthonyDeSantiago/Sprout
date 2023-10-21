# Sprout

mockup 
https://www.figma.com/proto/x1Ued1bC0VZjWvB7kaxMap/Untitled?type=design&node-id=17-44&t=DusLmnrUarAbql2K-0&scaling=scale-down&page-id=0%3A1&starting-point-node-id=1%3A2

Code: 

---admin----
admin_home.html
This is the main admin dashboard page.
Displays the Sprout Financials logo and the user's profile information.
Contains navigation links for Home, User Database, Expired Password Report, and New User Requests.
Includes a logout link.

admin_table_all_users.html
Displays a search bar to search for users by username or account number.
Shows a table of usernames, and when clicked, it displays detailed user information in an extended table.
Provides buttons to edit, delete, email, and suspend users.

admin_table_expired_passwords.html
Similar to admin_table_all_users.html, but specifically displays users with expired passwords.
Provides an "Email User to Change Password" button.

admin_table_new_user_requests.html
Similar to admin_table_all_users.html, but specifically displays new user requests that are not yet approved.
Provides buttons to approve, deny, and set user roles.

JavaScript Files (admin_table_allusers.js, admin_table_expiredpassword.js, admin_table_newusers.js):
These files handle the logic for populating tables and displaying user details.
Utilize Firebase Firestore to fetch and manipulate user data.
Implement functions for suspending, deleting, editing, approving, denying users, setting roles, and emailing users.

extendable_tables.css
This file seems to contain styles related to tables and popups. Here's a breakdown of the key components:

Body: Sets the background color and image for the entire page.
Search Container: Styles for a search input field.
Extendable Table: Styles for a table that can be extended to show additional information.
Extended Table: Styles for the extended information table.
User Popups: Styles for popups related to editing and deleting users.
