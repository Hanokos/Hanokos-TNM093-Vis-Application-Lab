//task3.js
// Canvas size and simulation parameters
const width = 800, height = 600;
let h = 0.01; // Time step
let kstructural = 20;  // Spring stiffness for structural springs
let kshear = 7;  // Spring stiffness for shear springs
let bStructural = 0.1;  // Structural damping coefficient
let bShear = 0.05;     // Shear damping coefficient
let m = 0.2;   // Mass
let restLength = 100;
let diagonalLength = Math.sqrt(2) * restLength; // Diagonal length of square

// Define the initial four-mass system
/*(1) (2)
  (3) (4)*/

let particles = [
    { id: 1, x: 300, y: 300, vx: 0, vy: 0 }, // Top-left
    { id: 2, x: 400, y: 300, vx: 0, vy: 0 }, // Top-right
    { id: 3, x: 300, y: 400, vx: 0, vy: 0 }, // Bottom-left
    { id: 4, x: 400, y: 400, vx: 0, vy: 0 }  // Bottom-right
];

// Spring connections (horizontal and diagonal)
const springs = [
    { p1: particles[0], p2: particles[1], restLength, type: 'structural' }, // Top (horizontal)
    { p1: particles[0], p2: particles[2], restLength, type: 'structural' }, // Left (horizontal)
    { p1: particles[1], p2: particles[3], restLength, type: 'structural' }, // Right (horizontal)
    { p1: particles[2], p2: particles[3], restLength, type: 'structural' }, // Bottom (horizontal)
    { p1: particles[0], p2: particles[3], restLength: diagonalLength, type: 'shear' }, // Diagonal 
    { p1: particles[1], p2: particles[2], restLength: diagonalLength, type: 'shear' }  
];

// Create the SVG canvas 800x600
const svg = d3.select("#canvas")
    .attr("width", width) // 800
    .attr("height", height); // 600

// Create circles
let circles = svg.selectAll("circle")
    .data(particles) // link data to corresponding particle
    .enter().append("circle") //Creates a new circle
    .attr("r", 10) // radius
    .attr("fill", "blue") // make them blue
    .attr("cx", d => d.x) // placed cordinates based on the particles position
    .attr("cy", d => d.y)

    .call(d3.drag() // Enables dragging
        .on("drag", (event, d) => {
            d.x = event.x; // Update the circles position to the mouse position
            d.y = event.y;
            d.vx = d.vy = 0; // Reset velocity during drag
            updateSpring(); // Update spring line positions
            updateParticles(); // Update Circles  positions
        })
        .on("end", () => {
            // Stop all motion after drag ends
            particles.forEach(p => { // forEach Loop to  go through all in particles array
                p.vx = 0;
                p.vy = 0;
            });
        })
    );

// Create spring lines
let springLines = svg.selectAll("line")
    .data(springs)
    .enter().append("line") //Creates a new line
    .attr("stroke", (d, i) => d.type === 'shear' ? "blue" : "black") // Shear springs are blue, others are black
    .attr("stroke-width", 2); // line width

// Function to update spring lines
function updateSpring() {
    springLines // draw spring lines
        .data(springs) // data for spring connections

        // Update the lines position to the particles poisiton
        .attr("x1", d => d.p1.x)
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to calculate forces (spring + damping)
function calculateForces() {
    // Reset forces
    particles.forEach(p => { // forEach Loop to  go through all in particles array
        p.ax = 0;
        p.ay = 0;
    });

    // Apply forces based on springs
    springs.forEach(spring => { // forEach Loop to  go through all springs
         // Calculate the distance (d) between two particles
        let { p1, p2, restLength, type } = spring;
        let dx = p2.x - p1.x; // Difference in x positions
        let dy = p2.y - p1.y; // Difference in y positions
        let distance = Math.sqrt(dx * dx + dy * dy); // Euclidean distance between particles

        // Calculate the Spring Force (Hooke's Law: F = k×(d−L0))
        let forceMagnitude = (type === 'shear' ? kshear : kstructural) * (distance - restLength); // use kshear if shear type, otherwise use kstructural to calculate
        
        // Calculate the Force in x and y direction
        let fx = (forceMagnitude * dx) / distance;
        let fy = (forceMagnitude * dy) / distance;

        // Calculate the Damping Force (F =b*(dvx-dvy))
        let dvx = p2.vx - p1.vx;
        let dvy = p2.vy - p1.vy;

        // Apply damping based on type of spring
        let dampingFx = (type === 'shear' ? bShear : bStructural) * dvx;
        let dampingFy = (type === 'shear' ? bShear : bStructural) * dvy;

        // Apply forces to p1, Newtons 2nd law: a = F / m
        p1.ax += (fx + dampingFx) / m;
        p1.ay += (fy + dampingFy) / m;

        // Apply equal and opposite forces to p2, Newtons 2nd law: a = F / m
        p2.ax -= (fx + dampingFx) / m;
        p2.ay -= (fy + dampingFy) / m;
    });
}

// Euler integration for position updates
function updateSystem() {
    particles.forEach(p => {// forEach Loop to  go through all in particles array

        // Update velocity for particles using Euler method (v = v+a*h)
        p.vx += p.ax * h;
        p.vy += p.ay * h;

        // Update position for particles using Euler method (x = x+v*h)
        p.x += p.vx * h;
        p.y += p.vy * h;
    });

    updateParticles();
}

// Function to update the particle positions on the canvas
function updateParticles() {
    circles.attr("cx", d => d.x).attr("cy", d => d.y);
    updateSpring();
}

// Event listeners for sliders to update variables
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
    document.getElementById("rest-length-value").textContent = restLength;
});

// Simulation loop
function simulation() {
    calculateForces();
    updateSystem(); // Compute new forces, velocities, positions
    requestAnimationFrame(simulation); // Repeat
}

// Start the simulation
simulation();
