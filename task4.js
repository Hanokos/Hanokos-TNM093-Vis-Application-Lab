// task4.js
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

// Define the initial nine-mass system in a 3x3 grid
/*ID: (1) (2) (3)
      (4) (5) (6)
      (7) (8) (9)*/

let particles = [];
for (let i = 0; i < 3; i++) { // iterates over 3 rows.
    for (let j = 0; j < 3; j++) { // iterates over 3 columns.
        particles.push({ // create the 3x3 grid
            id: i * 3 + j + 1, // Makes id from 1 to 9
            x: 300 + j * restLength,  // x position
            y: 300 + i * restLength,  // y position
            vx: 0, // initial x velocity
            vy: 0, // initial y velocity

             // previous position for Verlet method
            xPrev: 300 + j * restLength,
            yPrev: 300 + i * restLength  
        });
    }
}

// Spring connections (horizontal and diagonal)
const springs = [];

// Horizontal Structural springs
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {  // Connect horizontally within each row
        springs.push({  // create 6 springs
            p1: particles[i * 3 + j], // Particle 1 the spring connects to
            p2: particles[i * 3 + j + 1], // Particle 2 the spring connects to
            restLength,  // Rest length of the spring
            type: 'structural'  // Structural spring
        });
    }
}

// Vertical Structural springs
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {  // Connect vertically within each column
        springs.push({ // create 6 springs
            p1: particles[i * 3 + j], // Particle 1 the spring connects to
            p2: particles[(i + 1) * 3 + j], // Particle 2 the spring connects to
            restLength,
            type: 'structural'  // Structural spring
        });
    }
}

// Diagonal springs
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {  
        /*Example of how this works: i = 0, j = 0 
        Gives p1 = particles[0] = ID(1), p2 = particles[4]= ID(5) */
        springs.push({ // Connect diagonally (top-left to bottom-right)
            p1: particles[i * 3 + j],
            p2: particles[(i + 1) * 3 + (j + 1)], 
            restLength: diagonalLength,
            type: 'shear'  // Shear spring
        });
        springs.push({ // Connect diagonally (top-right to bottom-left)
            p1: particles[i * 3 + (j + 1)],
            p2: particles[(i + 1) * 3 + j],
            restLength: diagonalLength,
            type: 'shear'  // Shear spring
        });
    }
}

// Create the SVG canvas 800x600
const svg = d3.select("#canvas")
    .attr("width", width) // 800
    .attr("height", height); // 600

// Create circles
let circles = svg.selectAll("circle")
    .data(particles) // link data to corresponding particle
    .enter().append("circle") // Creates a new circle
    .attr("r", 10) // radius
    .attr("fill", "blue") // make them blue
    .attr("cx", d => d.x)  // placed coordinates based on the particles position
    .attr("cy", d => d.y)

    // Enables dragging
    .call(d3.drag()
        .on("drag", (event, d) => {
            d.x = event.x; // Update the circle's position to the mouse position
            d.y = event.y;
            d.vx = d.vy = 0; // Reset velocity during drag
            updateSpring(); // Update spring line positions
            updateParticles(); // Update Circle positions
        })
        .on("end", () => {// Stop all motion after drag ends
            particles.forEach(p => { // forEach Loop to go through all in particles array
                p.vx = 0;
                p.vy = 0;
                p.ax = 0;
                p.ay = 0;
                p.xPrev = p.x; // Prevent drift by resetting the previous position
                p.yPrev = p.y;
            });
        })
    );

// Create spring lines
let springLines = svg.selectAll("line")
    .data(springs)
    .enter().append("line") // Creates a new line
    .attr("stroke", (d, i) => i >= 12 ? "blue" : "black") // Shear springs are blue, others are black
    .attr("stroke-width", 2); // line width

// Function to update spring lines
function updateSpring() {
    springLines // draw spring lines
        .data(springs) // data for spring connections

        // Update the line's position to the particle's position
        .attr("x1", d => d.p1.x)
        .attr("y1", d => d.p1.y)
        .attr("x2", d => d.p2.x)
        .attr("y2", d => d.p2.y);
}

// Function to calculate forces (spring + damping)
function calculateForces() {
    // Reset forces
    particles.forEach(p => { // forEach Loop to go through all in particles array
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

        // Calculate the Damping Force (F = b*(dvx - dvy))
        let dvx = p2.vx - p1.vx;
        let dvy = p2.vy - p1.vy;

        // Apply damping based on spring type
        let dampingFx = (type === 'shear' ? bShear : bStructural) * dvx;
        let dampingFy = (type === 'shear' ? bShear : bStructural) * dvy;

        // Apply forces to p1, Newton's 2nd law: a = F / m
        p1.ax += (fx + dampingFx) / m;
        p1.ay += (fy + dampingFy) / m;

        // Apply equal and opposite forces to p2, Newton's 2nd law: a = F / m
        p2.ax -= (fx + dampingFx) / m;
        p2.ay -= (fy + dampingFy) / m;
    });
}
// Verlet method for position and velocity updates
function updateSystem() {
    particles.forEach(p => { // forEach Loop to  go through all in particles array

        // Update position for particles using Verlet method (r_n+1 = 2r_n - r_n-1 + a*h^2)
        let xNew = 2 * p.x - p.xPrev + p.ax * h * h;
        let yNew = 2 * p.y - p.yPrev + p.ay * h * h;

        // Update previous position
        p.xPrev = p.x;
        p.yPrev = p.y;

        // Assign new position
        p.x = xNew; 
        p.y = yNew;    
    });

    // Update velocity for particles using the Verlet method (v = (r_n+1 - r_n-1) / 2*h)
    particles.forEach(p => {
        p.vx = (p.x - p.xPrev) / (2 * h);
        p.vy = (p.y - p.yPrev) / (2 * h);
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
    updateSystem(); // Compute new forces, velocities, positions
    requestAnimationFrame(simulation); // Repeat
}

// Start the simulation
simulation();
