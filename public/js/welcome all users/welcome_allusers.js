document.addEventListener("DOMContentLoaded", function() {
    // Get the black rectangle element by its ID
    const blackRectangle = document.getElementById("blackRectangle");

    // Add click event listener to the black rectangle
    blackRectangle.addEventListener("click", function() {
        // Navigate to index.html
        window.location.href = "index.html";
    });
});
