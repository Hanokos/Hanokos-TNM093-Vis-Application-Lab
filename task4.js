// task4.js // Canvas size and simulation parameters
const width = 800, height = 600;
let h = 0.01; // Time step
let kstructural = 50;  // Spring stiffness for structural springs
let kshear = 7;  // Spring stiffness for shear springs
let bStructural = 0.1; // Structural damping coefficient
let bShear = 0.05;     // Shear damping coefficient
let m = 0.2;   // Mass
let restLength = 100;
let diagonalLength = Math.sqrt(2 * restLength * restLength); // Diagonal length of square

// Define the initial nine-mass system in a 3x3 grid
let particles = [];
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        particles.push({
            id: i * 3 + j + 1,
            x: 300 + j * restLength,  // x position
            y: 300 + i * restLength,  // y position
            vx: 0,
            vy: 0
        });
    }
}

// Spring connections (horizontal, vertical, and diagonal)
const springs = [];

// Horizontal springs
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {  // Connect horizontally within each row
        springs.push({
            p1: particles[i * 3 + j],
            p2: particles[i * 3 + j + 1],
            restLength,
            type: 'structural'  // Structural spring
        });
    }
}

// Vertical springs
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {  // Connect vertically within each column
        springs.push({
            p1: particles[i * 3 + j],
            p2: particles[(i + 1) * 3 + j],
            restLength,
            type: 'structural'  // Structural spring
        });
    }
}

// Diagonal springs
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {  // Connect diagonally (top-left to bottom-right, top-right to bottom-left)
        springs.push({
            p1: particles[i * 3 + j],
            p2: particles[(i + 1) * 3 + (j + 1)],
            restLength: diagonalLength,
            type: 'shear'  // Shear spring
        });
        springs.push({
            p1: particles[i * 3 + (j + 1)],
            p2: particles[(i + 1) * 3 + j],
            restLength: diagonalLength,
            type: 'shear'  // Shear spring
        });
    }
}

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
    .attr("stroke", (d, i) => i >= 12 ? "blue" : "black") // Diagonal springs are blue
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
        let { p1, p2, restLength, type } = spring;
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Apply appropriate spring stiffness based on type
        let forceMagnitude = (type === 'shear' ? kshear : kstructural) * (distance - restLength);

        let fx = (forceMagnitude * dx) / distance;
        let fy = (forceMagnitude * dy) / distance;

        let dvx = p2.vx - p1.vx;
        let dvy = p2.vy - p1.vy;

        // Apply damping based on spring type
        let dampingFx = (type === 'shear' ? bShear : bStructural) * dvx;
        let dampingFy = (type === 'shear' ? bShear : bStructural) * dvy;

        // Apply forces to p1
        p1.ax += (fx + dampingFx) / m;
        p1.ay += (fy + dampingFy) / m;

        // Apply equal and opposite forces to p2
        p2.ax -= (fx + dampingFx) / m;
        p2.ay -= (fy + dampingFy) / m;
    });
}

// Velocity Verlet integration for position updates (more stable)
function updateSystem() {
    // Update positions based on velocities
    particles.forEach(p => {
        p.x += p.vx * h + 0.5 * p.ax * h * h;
        p.y += p.vy * h + 0.5 * p.ay * h * h;
    });

    // Update velocities based on accelerations
    particles.forEach(p => {
        p.vx += 0.5 * p.ax * h;
        p.vy += 0.5 * p.ay * h;
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
    updateSystem();
    requestAnimationFrame(simulation);
}

// Start the simulation
simulation();
