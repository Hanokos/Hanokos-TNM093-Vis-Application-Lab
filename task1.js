// Initial system configuration for the Two Mass System
const width = 800, height = 600;
let h = 0.1; // Time step
let k = 50;  // Spring stiffness
let b = 1;   // Damping coefficient
let m = 1;   // Mass
let restLength = 50;

// Define the initial two-mass system
let particlesTask1 = [
    { id: 1, x: 300, y: 300, vx: 0, vy: 0 }, // Particle 1
    { id: 2, x: 400, y: 300, vx: 0, vy: 0 }  // Particle 2
];

let particles = particlesTask1; // Initial particles setup

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
            updateSpring();
            updateParticles();
        })
    );

// Create spring lines (lines between particles)
let springLines = svg.selectAll("line")
    .data([{ p1: particles[0], p2: particles[1] }])
    .enter()
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", 2);

// Function to update spring lines based on particle positions
function updateSpring() {
    springLines
        .data([{ p1: particles[0], p2: particles[1] }])
        .attr("x1", d => d.p1.x)
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to calculate forces (spring + damping) for the two-mass system
function calculateForces() {
    let forces = [];

    // Calculate spring force and damping force between particles 1 and 2
    let dx = particles[1].x - particles[0].x;
    let dy = particles[1].y - particles[0].y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceMagnitude = k * (distance - restLength);

    let fx = forceMagnitude * dx / distance;
    let fy = forceMagnitude * dy / distance;

    let dvx = particles[1].vx - particles[0].vx;
    let dvy = particles[1].vy - particles[0].vy;
    let dampingFx = b * dvx;
    let dampingFy = b * dvy;

    forces.push([fx + dampingFx, fy + dampingFy]);

    return forces;
}

// Euler method to update positions and velocities
function updateSystem() {
    const forces = calculateForces();

    // Update velocities and positions using Euler method
    particles.forEach((particle, i) => {
        if (i < particles.length - 1) {
            particles[i].vx += forces[i][0] / m * h;
            particles[i].vy += forces[i][1] / m * h;

            particles[i + 1].vx -= forces[i][0] / m * h;
            particles[i + 1].vy -= forces[i][1] / m * h;
        }
        particle.x += particle.vx * h;
        particle.y += particle.vy * h;
    });

    // Update the circles' positions
    updateParticles();
}

// Function to update the particle positions on the canvas
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


// Simulation loop (to keep the system dynamic)
function simulation() {
    updateSystem();
    requestAnimationFrame(simulation);
}

// Start the simulation
simulation();
