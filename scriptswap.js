//scriptswap.js
// Event listener for Task 1 button (reloads page with a query parameter for Task 1)
document.getElementById("task1Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=1";  // Reload the page with task=1 parameter
});

// Event listener for Task 2 button (reloads page with a query parameter for Task 2)
document.getElementById("task2Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=2";  // Reload the page with task=2 parameter
});

// Event listener for Task 3 button (reloads page with a query parameter for Task 3)
document.getElementById("task3Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=3";  // Reload the page with task=3 parameter
});

// Event listener for Task 3 button (reloads page with a query parameter for Task 3)
document.getElementById("task4Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=4";  // Reload the page with task=3 parameter
});

// Event listener for Task 3 button (reloads page with a query parameter for Task 3)
document.getElementById("task5Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=5";  // Reload the page with task=3 parameter
});

// Event listener for Task 3 button (reloads page with a query parameter for Task 3)
document.getElementById("task5.2Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=6";  // Reload the page with task=3 parameter
});

// On page load, check for the task parameter and load the corresponding script
window.onload = function() {
    const params = new URLSearchParams(window.location.search);  // Get URL parameters
    const task = params.get("task");

    if (task === "1") {
        loadScript("task1.js");  // Load script1.js for Task 1
    } else if (task === "2") {
        loadScript("task2.js");  // Load script2.js for Task 2
    } else if (task === "3") {
        loadScript("task3.js");  // Load script3.js for Task 3
    }else if (task === "4") {
        loadScript("task4.js");  // Load script3.js for Task 3
    }else if (task === "5") {
        loadScript("task5.js");  // Load script3.js for Task 3
    }else if (task === "6") {
        loadScript("extratask5.js");  // Load script3.js for Task 3
    }
};

// Function to dynamically load a script
function loadScript(scriptUrl) {
    // Clear any previous scripts
    removeAllScripts();

    // Create a new script element
    const script = document.createElement("script");
    script.src = scriptUrl;  // Set the script URL
    script.type = "text/javascript";
    document.body.appendChild(script);  // Append the new script to the body
}

// Function to remove all previously loaded scripts
function removeAllScripts() {
    const existingScripts = document.querySelectorAll('script[src^="script"]');
    existingScripts.forEach(script => {
        script.remove();
    });
}
