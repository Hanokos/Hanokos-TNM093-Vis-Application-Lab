//task1.js
// Initial system configuration for the Two Mass System
const width = 800, height = 600; // for SVG canvas
let h = 0.01; // Time step
let k = 50;  // Spring stiffness
let b = 1;   // Damping coefficient
let m = 0.2;   // Mass
let restLength = 100;

// Define the two mass system "particles position"
let Massparticles = [
    { id: 1, x: 300, y: 300, vx: 0, vy: 0 }, // Particle 1
    { id: 2, x: 400, y: 300, vx: 0, vy: 0 }  // Particle 2
];

let particles = Massparticles; // Initial particles setup

// Creates the SVG canvas 800x600
const svg = d3.select("#canvas")
    .attr("width", width) // 800
    .attr("height", height); // 600

// Creates circles
let circles = svg.selectAll("circle")
    .data(particles) // link data to corresponding particle
    .enter().append("circle")  //Creates a new circle
    .attr("r", 10) // radius
    .attr("fill", "blue") // make them blue
    .attr("cx", d => d.x) // placed cordinates based on the particles position
    .attr("cy", d => d.y)
    
    .call(d3.drag() // Enables dragging
        .on("drag", (event, d) => {
            d.x = event.x; // Update the circles position to the mouse position
            d.y = event.y;
            updateSpring(); // Update spring line positions
            updateParticles(); // Update Circles  positions
        })
    );

// Create spring lines 
let springLines = svg.selectAll("line")
    .data([{ p1: particles[0], p2: particles[1] }]) // to draw between two particles
    .enter().append("line") //Creates a new line
    .attr("stroke", "black") // make it black
    .attr("stroke-width", 2); // line width

// Function to update spring lines based on particle positions
function updateSpring() {
    springLines // draw spring lines
        .data([{ p1: particles[0], p2: particles[1] }]) //data from particles

        // Update the lines position to the particles poisiton
        .attr("x1", d => d.p1.x) 
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to calculate forces  for the two-mass system
function calculateForces() {
    let forces = []; // create a array to hold the forces for each particle

    // Calculate the distance (d) between two particles
    let dx = particles[1].x - particles[0].x; // Difference in x positions
    let dy = particles[1].y - particles[0].y; // Difference in y positions
    let distance = Math.sqrt(dx * dx + dy * dy); // Euclidean distance between particles

    // Calculate the Force (Hooke's Law: F = k×(d−L0))
    let forceMagnitude = k * (distance - restLength);

     // Calculate the Force in x and y direction
    let fx = forceMagnitude * dx / distance;
    let fy = forceMagnitude * dy / distance;

    // Calculate the Damping Force (F =b*(dvx-dvy))
    let dvx = particles[1].vx - particles[0].vx; // relative velocity between the two masses in x
    let dvy = particles[1].vy - particles[0].vy; // relative velocity between the two masses in y
    let dampingFx = b * dvx; // Damping force in x
    let dampingFy = b * dvy; // Damping force in y

    //the spring force and damping force components are added together and returned
    forces.push([fx + dampingFx, fy + dampingFy]); 
    return forces;
}

// Euler method to update positions and velocities
function updateSystem() {
    const forces = calculateForces(); // Call on the func to calculate the forces on the particles

    // Update using Euler method (x=x+v*h)
    particles.forEach((particle, i) => { // forEach Loop to  go through all in particles array
        if (i < particles.length - 1) { // Check to se if the particle has a neighbor particle to interact

            // Update velocity for 1st particle using Euler method (v = v+a*h)
            //  Newtons 2nd law: a = F / m
            particles[i].vx += forces[i][0] / m * h;  
            particles[i].vy += forces[i][1] / m * h; 

            // Update velocity for 2nd particle, (v = v+a*h)
            particles[i + 1].vx -= forces[i][0] / m * h;
            particles[i + 1].vy -= forces[i][1] / m * h;
        }
        // Update position (x=x+v*h)
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


// Simulation loop (to keep the system dynamic)
function simulation() {
    updateSystem(); // Compute new forces, velocities, positions
    requestAnimationFrame(simulation); // Repeat
}

// Start the simulation
simulation();
