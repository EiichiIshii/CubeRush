let scramble = ""; // The scramble string to be displayed
let moves = ["U", "D", "L", "R", "F", "B"]; // Possible face moves: Up, Down, Left, Right, Front, Back
let modifiers = ["", "'", "2"]; // Move modifiers: normal, counter-clockwise ('), and double turn (2)
let scrambleMoves = []; // Array to store the sequence of scramble moves
let cubeState; // Represents the current state of the cube
let shuffleButton; // Button to generate a new scramble
let timerRunning = false; // Flag to check if the timer is running
let startTime = 0; // Start time of the timer
let elapsed = 0; // Elapsed time when timer stops
let fontA, fontB; // Custom fonts
let timeRecords = []; // Array of recorded solve times
let fireworks = []; // Array to store fireworks particles
const GRAVITY     = 0.08;  // Gravity effect on particles
const COUNT       = 400;   // Number of particles for fireworks
const SPEED_MIN   = 4;     // Minimum initial speed of particles
const SPEED_MAX   = 14;    // Maximum initial speed of particles
const AIR_DRAG    = 0.985; // Air resistance applied to particles
const LIFE_DECAY  = 2;     // Rate at which particle life decreases

function preload() {
  // Load custom fonts before setup
  fontA = loadFont("./fonts/Orbitron-Medium.ttf");
  fontB = loadFont("./fonts/VT323-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontA);
  textSize(16);

  // Initialize scramble and cube state
  generateScramble();
  cubeState = getSolvedCube();
  applyScramble(cubeState, scrambleMoves);

  // Create the "Generate New Scramble" button
  createShuffleButton();
}

function windowResized() {
  // Adjust canvas and button position when window is resized
  resizeCanvas(windowWidth, windowHeight);
  positionShuffleButton();
}

function createShuffleButton() {
  // Create and style the scramble button
  shuffleButton = createButton("Generate New Scramble");
  shuffleButton.mousePressed(shuffleScramble);

  shuffleButton.style('background', 'linear-gradient(90deg, #00cfff 0%, #00ffa2 100%)');
  shuffleButton.style('color', '#001a2d');
  shuffleButton.style('border', 'none');
  shuffleButton.style('border-radius', '12px');
  shuffleButton.style('box-shadow', '0 2px 12px rgba(0,255,180,0.25)');
  shuffleButton.style('font-weight', 'bold');
  shuffleButton.style('letter-spacing', '1px');
  shuffleButton.style('transition', '0.2s');
  shuffleButton.mouseOver(() => shuffleButton.style('filter', 'brightness(1.15)'));
  shuffleButton.mouseOut(() => shuffleButton.style('filter', 'none'));

  positionShuffleButton();
}

function positionShuffleButton() {
  // Dynamically calculate button size and position
  let btnText = "Generate New Scramble";
  let btnFontSize = 16;
  let btnPaddingX = 24;
  let btnPaddingY = 10;

  textSize(btnFontSize);
  let btnTextWidth = textWidth(btnText);
  let btnWidth = btnTextWidth + btnPaddingX * 2;
  let btnHeight = btnFontSize + btnPaddingY * 2;

  let btnX = width / 2 - btnWidth / 2;
  let scrambleY = 92;
  let btnMarginY = 18;
  let btnY = scrambleY + btnHeight / 2 + btnMarginY;

  shuffleButton.position(btnX, btnY);
  shuffleButton.size(btnWidth, btnHeight);
}

function shuffleScramble() {
  // Generate a new scramble and reset the timer
  generateScramble();
  cubeState = getSolvedCube();
  applyScramble(cubeState, scrambleMoves);

  timerRunning = false;
  elapsed = 0;
}

function draw() {
  // Draw background gradient
  for (let i = 0; i < height; i++) {
    stroke(30 + i * 0.08, 40 + i * 0.12, 60 + i * 0.18);
    line(0, i, width, i);
  }
  noStroke();

  // Draw title
  textFont(fontA);
  textSize(48);
  fill(0, 180, 255);
  textAlign(CENTER, CENTER);
  let titleY = 38;
  text("CubeRush!", width / 2, titleY);

  // Draw line under the title
  stroke(0, 180, 255);
  strokeWeight(3);
  let lineY = titleY + 36;
  line(width * 0.25, lineY, width * 0.75, lineY);

  // Draw scramble text
  textSize(20);
  noStroke();
  fill(255);
  let scrambleY = lineY + 26;
  text(scramble, width / 2, scrambleY);

  // Update and draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
    f.update();
    f.show();
    if (f.isDead()) fireworks.splice(i, 1);
  }

  // Draw timer
  textFont(fontB);
  textSize(200);
  textAlign(LEFT, CENTER);
  let timerY = height / 2.3;
  let timerStr = formatTimer(timerRunning ? millis() - startTime + elapsed : elapsed);
  let timerX = width / 2 - textWidth(timerStr) / 2;
  // Shadow for timer text
  fill(0, 0, 0, 80);
  text(timerStr, timerX + 6, timerY + 6);
  // Main timer color
  fill(0, 255, 180);
  text(timerStr, timerX, timerY);

  // Timer control hint
  textFont(fontA);
  textSize(18);
  textAlign(CENTER, CENTER);
  fill(0, 180, 255);
  text("Press SPACE to start/stop the timer", width / 2, timerY + 120);

  // Display Ao5 (average of last 5 solves)
  textFont(fontA);
  textSize(16);
  textAlign(LEFT, BOTTOM);
  fill(255);
  let recordX = 24;
  let recordY = height - 24;

  let ao5Str = "--:--.--";
  if (timeRecords.length >= 5) {
    let recent5 = timeRecords.slice(-5);
    ao5Str = formatTimer(recent5.reduce((a, b) => a + b) / 5);
  }
  text("Ao5: " + ao5Str, recordX, recordY - 22);

  // Display Ao12 (average of last 12 solves)
  let ao12Str = "--:--.--";
  if (timeRecords.length >= 12) {
    let recent12 = timeRecords.slice(-12);
    ao12Str = formatTimer(recent12.reduce((a, b) => a + b) / 12);
  }
  text("Ao12: " + ao12Str, recordX, recordY);

  // Draw unfolded cube diagram in bottom-right
  drawCubeUnfoldedCool(cubeState, width - width / 3.5, height - height / 2.15);
}

function keyPressed() {
  // Start/stop/reset timer when SPACE is pressed
  if (key === ' ') {
    if (!timerRunning && elapsed === 0) {
      // Start timer
      timerRunning = true;
      startTime = millis();
    } else if (timerRunning) {
      // Stop timer and record solve time
      timerRunning = false;
      elapsed += millis() - startTime;
      timeRecords.push(elapsed);
      spawnFirework(width/2, height/2.3);
    } else if (!timerRunning && elapsed > 0) {
      // Reset timer
      elapsed = 0;
      timerRunning = true;
      startTime = millis();
    }
  }
}

function formatTimer(ms) {
  // Format milliseconds into mm:ss.cc format
  ms = Math.floor(ms);
  let centi = Math.floor((ms % 1000) / 10);
  let sec = Math.floor(ms / 1000) % 60;
  let min = Math.floor(ms / 60000);
  return nf(min, 2) + ':' + nf(sec, 2) + '.' + nf(centi, 2);
}

function generateScramble() {
  // Generate a random scramble of 20 moves
  scramble = "";
  scrambleMoves = [];
  let prevMove = "";
  for (let i = 0; i < 20; i++) {
    let move;
    do {
      move = random(moves);
    } while (move === prevMove); // Avoid repeating the same move consecutively
    prevMove = move;

    let modifier = random(modifiers);
    let moveStr = move + modifier;
    scrambleMoves.push(moveStr);
    scramble += moveStr + (i < 19 ? " -> " : "");
  }
}

function getSolvedCube() {
  // Return a solved cube state with standard colors
  return {
    U: Array(9).fill("white"),
    D: Array(9).fill("yellow"),
    F: Array(9).fill("green"),
    B: Array(9).fill("blue"),
    L: Array(9).fill("orange"),
    R: Array(9).fill("red")
  };
}

function applyScramble(state, moves) {
  // Apply a sequence of moves to the cube state
  for (let move of moves) rotateFace(state, move);
}

function rotateFace(state, move) {
  // Rotate a specific face of the cube according to the move
  let face = move[0];
  let amount = move[1] === "'" ? 3 : move[1] === "2" ? 2 : 1;
  for (let i = 0; i < amount; i++) rotateFaceOnce(state, face);
}

function rotateFaceOnce(state, face) {
  // Perform one clockwise rotation of the specified face
  let s = state[face];
  state[face] = [s[6], s[3], s[0], s[7], s[4], s[1], s[8], s[5], s[2]];

  // Define adjacent faces and affected indices for each face rotation
  const adjacent = {
    U: [["B", [2, 1, 0]], ["R", [2, 1, 0]], ["F", [2, 1, 0]], ["L", [2, 1, 0]]],
    D: [["F", [6, 7, 8]], ["R", [6, 7, 8]], ["B", [6, 7, 8]], ["L", [6, 7, 8]]],
    F: [["U", [6, 7, 8]], ["R", [0, 3, 6]], ["D", [2, 1, 0]], ["L", [8, 5, 2]]],
    B: [["U", [2, 1, 0]], ["L", [0, 3, 6]], ["D", [6, 7, 8]], ["R", [8, 5, 2]]],
    L: [["U", [0, 3, 6]], ["F", [0, 3, 6]], ["D", [0, 3, 6]], ["B", [8, 5, 2]]],
    R: [["U", [8, 5, 2]], ["B", [0, 3, 6]], ["D", [8, 5, 2]], ["F", [8, 5, 2]]]
  };

  // Rotate the side stickers around the face
  let sides = adjacent[face];
  let temp = sides.map(([f, idx]) => idx.map(i => state[f][i]));

  for (let i = 0; i < 4; i++) {
    let [targetFace, targetIndices] = sides[(i + 1) % 4];
    let srcColors = temp[i];
    for (let j = 0; j < 3; j++) {
      state[targetFace][targetIndices[j]] = srcColors[j];
    }
  }
}

function drawCubeUnfoldedCool(state, x, y) {
  // Draw a 2D unfolded representation of the cube
  let size = 28; // Size of each square sticker
  let gap = 14;  // Gap between faces
  let baseX = x;
  let baseY = y;

  // Order and layout of faces in the unfolded diagram
  let faces = ['U', 'L', 'F', 'R', 'B', 'D'];
  let offsets = {
    U: [size * 3 + gap, 0],
    L: [0, size * 3 + gap],
    F: [size * 3 + gap, size * 3 + gap],
    R: [size * 6 + gap * 2, size * 3 + gap],
    B: [size * 9 + gap * 3, size * 3 + gap],
    D: [size * 3 + gap, size * 6 + gap * 2]
  };

  // Draw each face
  for (let face of faces) {
    let [ox, oy] = offsets[face];
    for (let i = 0; i < 9; i++) {
      let col = i % 3;
      let row = Math.floor(i / 3);
      let c = color(state[face][i]);
      let grad = lerpColor(c, color(0, 0, 0), 0.25); // Add shading effect
      fill(grad);
      stroke(0, 180, 255);
      strokeWeight(2);
      rect(baseX + ox + col * size, baseY + oy + row * size, size, size, 4);
    }
  }
}

function spawnFirework(x, y) {
  // Spawn a colorful explosion of particles at a given position
  const palette = getVividPalette(5);
  for (let i = 0; i < COUNT; i++) {
    const c = random(palette);
    fireworks.push(new Particle(x, y, c.r, c.g, c.b));
  }
}

function getVividPalette(n) {
  // Create a palette of vivid random colors
  const base = [
    [255, 60, 60],
    [60, 255, 60],
    [60, 60, 255],
    [255, 255, 60],
    [255, 60, 255],
    [60, 255, 255],
    [255, 150, 0],
    [255, 0, 180],
    [160, 60, 255],
  ];
  const arr = [];
  for (let i = 0; i < n; i++) {
    const p = random(base);
    arr.push({ r: p[0], g: p[1], b: p[2] });
  }
  return arr;
}

class Particle {
  constructor(x, y, r, g, b) {
    // Initialize particle position and velocity
    this.pos = createVector(x, y);
    const angle = random(TWO_PI);
    const speed = random(SPEED_MIN, SPEED_MAX);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.acc = createVector(0, 0);

    // Slightly randomize color
    this.r = r + random(-20, 20);
    this.g = g + random(-20, 20);
    this.b = b + random(-20, 20);

    this.size = random(5, 10); // Size of the particle
    this.life = 255;           // Particle opacity (fades over time)
    this.spark = random(0.8, 1.2); // Variation in gravity effect
  }

  applyForce(force) {
    // Apply a force (e.g., gravity) to the particle
    this.acc.add(force);
  }

  update() {
    // Update particle position and fade out over time
    this.applyForce(createVector(0, GRAVITY * this.spark));
    this.vel.mult(AIR_DRAG);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life -= LIFE_DECAY;
  }

  show() {
    // Draw the particle as a fading circle
    fill(
      constrain(this.r, 0, 255),
      constrain(this.g, 0, 255),
      constrain(this.b, 0, 255),
      this.life
    );
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    // Check if the particle is fully faded
    return this.life <= 0;
  }
}
