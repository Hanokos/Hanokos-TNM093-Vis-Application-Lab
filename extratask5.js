//extratask5.js

// Canvas size and simulation parameters
const width = 800, height = 600;
let h = 0.01; // Time step
let kstructural = 20;  // Spring stiffness for structural springs
let kshear = 7;  // Spring stiffness for shear springs
let bStructural = 0.1; // Structural damping coefficient
let bShear = 0.05;     // Shear damping coefficient
let m = 0.2;   // Mass
let restLength = 100; // 1m = 100 pixels
let diagonalLength = Math.sqrt(2) * restLength; // Diagonal length of square

let particles = [];
let springs = [];

// Create the SVG canvas 800x600
const svg = d3.select("#canvas")
    .attr("width", width) // 800
    .attr("height", height) // 600
    .style("border", "5px solid black");  // Add solid border to canvas for visual effect

// Create circles and spring lines
let circles = svg.selectAll("circle");
let springLines = svg.selectAll("line");

// Function to create particles and springs based on rows and columns
function createParticlesAndSprings(rows, cols) {
    // Clear the existing particles and springs
    particles = [];
    springs = [];
    circles.remove();
    springLines.remove();

    // Define the grid and particles
    for (let i = 0; i < rows; i++) { 
        for (let j = 0; j < cols; j++) { 
            particles.push({
                id: i * cols + j + 1,
                x: 300 + j * restLength,
                y: 300 + i * restLength,
                vx: 0,
                vy: 0,
                xPrev: 300 + j * restLength,
                yPrev: 300 + i * restLength
            });
        }
    }

    // Horizontal Structural springs
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 1; j++) {
            springs.push({
                p1: particles[i * cols + j],
                p2: particles[i * cols + j + 1],
                restLength,
                type: 'structural'
            });
        }
    }

    // Vertical Structural springs
    for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols; j++) {
            springs.push({
                p1: particles[i * cols + j],
                p2: particles[(i + 1) * cols + j],
                restLength,
                type: 'structural'
            });
        }
    }

    // Diagonal springs
    for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols - 1; j++) {
            springs.push({
                p1: particles[i * cols + j],
                p2: particles[(i + 1) * cols + (j + 1)],
                restLength: diagonalLength,
                type: 'shear'
            });
            springs.push({
                p1: particles[i * cols + (j + 1)],
                p2: particles[(i + 1) * cols + j],
                restLength: diagonalLength,
                type: 'shear'
            });
        }
    }

    // Create the circles for particles
    circles = svg.selectAll("circle")
        .data(particles)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(d3.drag()
            .on("start", (event, d) => {
                // Store the previous position when drag starts
                d.xPrev = d.x;
                d.yPrev = d.y;
            })
            .on("drag", (event, d) => {
                // Update position during dragging
                d.x = event.x;
                d.y = event.y;
                updateSpring();
                updateParticles();
            })
   
        );

    // Create the spring lines
    springLines = svg.selectAll("line")
    .data(springs)
    .enter().append("line")
    .attr("stroke", d => d.type === 'shear' ? "blue" : "black") // Check the spring type to amke correct colour
    .attr("stroke-width", 2);
    updateSpring();
}

// Function to update spring lines
function updateSpring() {
    springLines
        .data(springs)
        .attr("x1", d => d.p1.x)
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to update particles
function updateParticles() {
    circles.attr("cx", d => d.x).attr("cy", d => d.y);
}

// Event listeners for sliders to update rows and columns
document.getElementById("rows-slider").addEventListener("input", (event) => {
    let rows = parseInt(event.target.value);
    let cols = parseInt(document.getElementById("cols-slider").value);
    createParticlesAndSprings(rows, cols);
    document.getElementById("rows-value").textContent = rows;
});

document.getElementById("cols-slider").addEventListener("input", (event) => {
    let cols = parseInt(event.target.value);
    let rows = parseInt(document.getElementById("rows-slider").value);
    createParticlesAndSprings(rows, cols);
    document.getElementById("cols-value").textContent = cols;
});

// Event listeners for sliders to update simulation parameters
document.getElementById("k-struc").addEventListener("input", (event) => {
    kstructural = parseFloat(event.target.value);
    document.getElementById("k-struc-value").textContent = kstructural;
});

document.getElementById("k-shear").addEventListener("input", (event) => {
    kshear = parseFloat(event.target.value);
    document.getElementById("k-shear-value").textContent = kshear;
});

document.getElementById("damping").addEventListener("input", (event) => {
    bStructural = parseFloat(event.target.value);
    bShear = parseFloat(event.target.value) * 0.5; // Adjust shear damping b = 0.05 if target is 0.1
    document.getElementById("damping-value").textContent = bStructural;
});

document.getElementById("mass").addEventListener("input", (event) => {
    m = parseFloat(event.target.value);
    document.getElementById("mass-value").textContent = m;
});

document.getElementById("rest-length").addEventListener("input", (event) => {
    restLength = parseFloat(event.target.value);
    diagonalLength = Math.sqrt(2) * restLength; // Update diagonal length when rest length changes
    document.getElementById("rest-length-value").textContent = restLength;
    createParticlesAndSprings(parseInt(document.getElementById("rows-slider").value), parseInt(document.getElementById("cols-slider").value));
});

// Initialize with only 1x1 grid (1 circle)
createParticlesAndSprings(1, 1);

// Simulation loop
function calculateForces() {
    particles.forEach(p => {
        p.ax = 0;
        p.ay = 0;
    });

    springs.forEach(spring => {
        let { p1, p2, restLength, type } = spring;
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceMagnitude = (type === 'shear' ? kshear : kstructural) * (distance - restLength);
        let fx = (forceMagnitude * dx) / distance;
        let fy = (forceMagnitude * dy) / distance;
        let dvx = p2.vx - p1.vx;
        let dvy = p2.vy - p1.vy;
        let dampingFx = (type === 'shear' ? bShear : bStructural) * dvx;
        let dampingFy = (type === 'shear' ? bShear : bStructural) * dvy;

        // NEwonts 2nd law: (a = F / m)
        p1.ax += (fx + dampingFx) / m;
        p1.ay += (fy + dampingFy) / m;
        p2.ax -= (fx + dampingFx) / m;
        p2.ay -= (fy + dampingFy) / m;
    });
}

function updateSystem() {
    particles.forEach(p => {
        // Verlet method position to update
        let xNew = 2 * p.x - p.xPrev + p.ax * h * h;
        let yNew = 2 * p.y - p.yPrev + p.ay * h * h;
        p.xPrev = p.x;
        p.yPrev = p.y;
        p.x = xNew;
        p.y = yNew;

        // Boundary conditions: Bounce off the edges
        if (p.x < 0) {
            p.x = 0;  // Place it back within bounds
            p.vx = -p.vx;  // Reverse velocity in X direction
        }
        if (p.x > width) {
            p.x = width;  // Place it back within bounds
            p.vx = -p.vx;  // Reverse velocity in X direction
        }
        if (p.y < 0) {
            p.y = 0;  // Place it back within bounds
            p.vy = -p.vy;  // Reverse velocity in Y direction
        }
        if (p.y > height) {
            p.y = height;  // Place it back within bounds
            p.vy = -p.vy;  // Reverse velocity in Y direction
        }
    });

    // Update velocities
    particles.forEach(p => {
        //Verlet method velocity to update
        p.vx = (p.x - p.xPrev) / (2 * h);
        p.vy = (p.y - p.yPrev) / (2 * h);
    });

    updateParticles();
    updateSpring();
}

function simulation() {
    calculateForces();
    updateSystem(); // Compute new forces, velocities, positions
    requestAnimationFrame(simulation); // Repeat simulation in a loop
}

simulation();
