//task2.js
// Canvas size and simulation parameters
const width = 800, height = 600;
let h = 0.01; // Time step
let k = 50;  // Spring stiffness
let b = 1;   // Damping coefficient
let m = 1;   // Mass
let restLength = 100;
let digstiff = 50;
// Define the initial four-mass system
let particles = [
    { id: 1, x: 300, y: 300, vx: 0, vy: 0 }, // Top-left
    { id: 2, x: 400, y: 300, vx: 0, vy: 0 }, // Top-right
    { id: 3, x: 300, y: 400, vx: 0, vy: 0 }, // Bottom-left
    { id: 4, x: 400, y: 400, vx: 0, vy: 0 }  // Bottom-right
];

// Spring connections
const springs = [
    { p1: particles[0], p2: particles[1] }, // Top
    { p1: particles[0], p2: particles[2] }, // Left
    { p1: particles[1], p2: particles[3] }, // Right
    { p1: particles[2], p2: particles[3] }  // Bottom
];

// Create the SVG canvas
const svg = d3.select("#canvas")
    .attr("width", width)
    .attr("height", height);

// Create particles (circles)
let circles = svg.selectAll("circle")
    .data(particles)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .call(d3.drag()
        .on("drag", (event, d) => {
            d.x = event.x;
            d.y = event.y;
            d.vx = d.vy = 0; // Reset velocity during drag
            updateSpring();
            updateParticles();
        })
        .on("end", () => {
            // Stop all motion after drag ends
            particles.forEach(p => {
                p.vx = 0;
                p.vy = 0;
            });
        })
    );

// Create spring lines
let springLines = svg.selectAll("line")
    .data(springs)
    .enter()
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", 2);

// Function to update spring lines
function updateSpring() {
    springLines
        .data(springs)
        .attr("x1", d => d.p1.x)
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to calculate forces (spring + damping)
function calculateForces() {
    // Reset forces
    particles.forEach(p => {
        p.ax = 0;
        p.ay = 0;
    });

    // Apply forces based on springs
    springs.forEach(spring => {
        let { p1, p2 } = spring;
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceMagnitude = k * (distance - restLength);

        let fx = (forceMagnitude * dx) / distance;
        let fy = (forceMagnitude * dy) / distance;

        let dvx = p2.vx - p1.vx;
        let dvy = p2.vy - p1.vy;
        let dampingFx = b * dvx;
        let dampingFy = b * dvy;

        // Apply forces to p1
        p1.ax += (fx + dampingFx) / m;
        p1.ay += (fy + dampingFy) / m;

        // Apply equal and opposite forces to p2
        p2.ax -= (fx + dampingFx) / m;
        p2.ay -= (fy + dampingFy) / m;
    });
}

// Euler integration for position updates
function updateSystem() {
    particles.forEach(p => {
        p.vx += p.ax * h;
        p.vy += p.ay * h;

        p.x += p.vx * h;
        p.y += p.vy * h;
    });

    updateParticles();
}

// Update particles and springs
function updateParticles() {
    circles.attr("cx", d => d.x).attr("cy", d => d.y);
    updateSpring();
}

// Event listeners for sliders to update variables
document.getElementById("k-struc").addEventListener("input", (event) => {
    k = parseFloat(event.target.value);
    document.getElementById("k-struc-value").textContent = k;
});

document.getElementById("damping").addEventListener("input", (event) => {
    b = parseFloat(event.target.value);
    document.getElementById("damping-value").textContent = b;
});

document.getElementById("mass").addEventListener("input", (event) => {
    m = parseFloat(event.target.value);
    document.getElementById("mass-value").textContent = m;
});

document.getElementById("rest-length").addEventListener("input", (event) => {
    restLength = parseFloat(event.target.value);
    document.getElementById("rest-length-value").textContent = restLength;
});

// Simulation loop
function simulation() {
    calculateForces();
    updateSystem();
    requestAnimationFrame(simulation);
}

// Start the simulation
simulation();
