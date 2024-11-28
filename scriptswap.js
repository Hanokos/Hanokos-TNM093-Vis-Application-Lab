// Event listener for Task 1 button (reloads page with a query for Task 1)
document.getElementById("task1Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=1";  // Reload the page with task=1 parameter
});

// Event listener for Task 2 button 
document.getElementById("task2Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=2";  // Reload the page with task=2 parameter
});

// Event listener for Task 3 button 
document.getElementById("task3Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=3";  // Reload the page with task=3 parameter
});

// Event listener for Task 4 button 
document.getElementById("task4Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=4";  // Reload the page with task=4 parameter
});

// Event listener for Task 5 button
document.getElementById("task5Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=5";  // Reload the page with task=5 parameter
});

// Event listener for Task 5.2 button 
document.getElementById("task5.2Btn").addEventListener("click", function() {
    window.location.href = window.location.pathname + "?task=6";  // Reload the page with task=6 parameter
});

// On page load, check for the task parameter and load the corresponding script and task text
window.onload = function() {
    const params = new URLSearchParams(window.location.search);  // Get URL parameters
    const task = params.get("task");

    // Get elements for sliders and value spans
    const kShearSlider = document.getElementById("k-shear");
    const kShearValueSpan = document.getElementById("k-shear-value");
    const restLengthSlider = document.getElementById("rest-length");
    const restLengthValueSpan = document.getElementById("rest-length-value");
    const restLengthLabel = document.querySelector('label[for="rest-length"]');  // The label with 'Length:'

    // Logic to load tasks and remove rest length slider and its text for specific tasks
    if (task === "1") {
        loadScript("task1.js");  // Load script1.js for Task 1
        updateTaskText("Task 1: Two Mass System");
        removeElement(restLengthSlider);  // Remove the rest length slider for task 1
        removeElement(restLengthValueSpan);  // Remove the rest length text for task 1
        removeElement(restLengthLabel);  // Remove the label containing 'Length:' for task 1
    } else if (task === "2") {
        loadScript("task2.js");  // Load script2.js for Task 2
        updateTaskText("Task 2: Four Mass System");
        removeElement(restLengthSlider);  // Remove the rest length slider for task 2
        removeElement(restLengthValueSpan);  // Remove the rest length text for task 2
        removeElement(restLengthLabel);  // Remove the label containing 'Length:' for task 2
    } else if (task === "3") {
        loadScript("task3.js");  // Load script3.js for Task 3
        updateTaskText("Task 3: Four Mass (Spring) System");
        removeElement(restLengthSlider);  // Remove the rest length slider for task 3
        removeElement(restLengthValueSpan);  // Remove the rest length text for task 3
        removeElement(restLengthLabel);  // Remove the label containing 'Length:' for task 3
    } else if (task === "4") {
        loadScript("task4.js");  // Load script4.js for Task 4
        updateTaskText("Task 4: Nine Mass (Spring) System");
        removeElement(restLengthSlider);  // Remove the rest length slider for task 4
        removeElement(restLengthValueSpan);  // Remove the rest length text for task 4
        removeElement(restLengthLabel);  // Remove the label containing 'Length:' for task 4
    } else if (task === "5") {
        loadScript("task5.js");  // Load script5.js for Task 5
        updateTaskText("Task 5: 4x4 Mass (Spring) System");
        removeElement(restLengthSlider);  // Remove the rest length slider for task 5
        removeElement(restLengthValueSpan);  // Remove the rest length text for task 5
        removeElement(restLengthLabel);  // Remove the label containing 'Length:' for task 5
    } else if (task === "6") {
        loadScript("extratask5.js");  // Load script6.js for Task 5.2
        updateTaskText("Task 5.2: n x m Live Mass (Spring) System");

        // Show the row and column sliders
        document.getElementById("rows-colums-sliders").style.display = "block";

        // Update the rows and columns values dynamically
        const rowsSlider = document.getElementById("rows-slider");
        const colsSlider = document.getElementById("cols-slider");
        const rowsValueSpan = document.getElementById("rows-value");
        const colsValueSpan = document.getElementById("cols-value");

        rowsSlider.addEventListener("input", function() {
            rowsValueSpan.textContent = rowsSlider.value;
        });

        colsSlider.addEventListener("input", function() {
            colsValueSpan.textContent = colsSlider.value;
        });
    }
};

// Function to load a script
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

// Function to update the task text
function updateTaskText(taskName) {
    const taskTextElement = document.getElementById("task-text");
    taskTextElement.textContent = taskName;
}

// Function to remove an element from the DOM
function removeElement(element) {
    if (element) {
        element.remove();  // Remove the element completely from the DOM
    }
}
