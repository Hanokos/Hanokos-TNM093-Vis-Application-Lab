// Canvas size and simulation parameters
const width = 800, height = 600;
let h = 0.1; // Time step
let k = 50;  // Spring stiffness
let b = 1;   // Damping coefficient
let m = 1;   // Mass
let restLength = 100;
const diagonalLength = Math.sqrt(2 * restLength * restLength); // Diagonal length of square

// Define the initial 16-mass system in a 4x4 grid
let particles = [];
for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
        particles.push({
            id: i * 4 + j + 1,
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
for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {  // Connect horizontally within each row
        springs.push({
            p1: particles[i * 4 + j],
            p2: particles[i * 4 + j + 1],
            restLength
        });
    }
}

// Vertical springs
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {  // Connect vertically within each column
        springs.push({
            p1: particles[i * 4 + j],
            p2: particles[(i + 1) * 4 + j],
            restLength
        });
    }
}

// Diagonal springs
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {  // Connect diagonally (top-left to bottom-right, top-right to bottom-left)
        springs.push({
            p1: particles[i * 4 + j],
            p2: particles[(i + 1) * 4 + (j + 1)],
            restLength: diagonalLength
        });
        springs.push({
            p1: particles[i * 4 + (j + 1)],
            p2: particles[(i + 1) * 4 + j],
            restLength: diagonalLength
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
    .attr("stroke", (d, i) => i >= 24 ? "blue" : "black") // Diagonal springs are blue
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
        let { p1, p2, restLength } = spring;
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
document.getElementById("k").addEventListener("input", (event) => {
    k = parseFloat(event.target.value);
    document.getElementById("k-value").textContent = k;
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
