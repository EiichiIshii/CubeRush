let scramble = "";
let moves = ["U", "D", "L", "R", "F", "B"];
let modifiers = ["", "'", "2"];
let scrambleMoves = [];
let cubeState;
let shuffleButton;
let timerRunning = false;
let startTime = 0;
let elapsed = 0;
let fontA, fontB;
let timeRecords = [];

function preload() {
  fontA = loadFont("./fonts/Orbitron-Medium.ttf");
  fontB = loadFont("./fonts/VT323-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontA);
  textSize(16);

  generateScramble();
  cubeState = getSolvedCube();
  applyScramble(cubeState, scrambleMoves);

  createShuffleButton();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionShuffleButton();
}

function createShuffleButton() {
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
  generateScramble();
  cubeState = getSolvedCube();
  applyScramble(cubeState, scrambleMoves);

  timerRunning = false;
  elapsed = 0;
}

function draw() {
  for (let i = 0; i < height; i++) {
    stroke(30 + i * 0.08, 40 + i * 0.12, 60 + i * 0.18);
    line(0, i, width, i);
  }
  noStroke();

  // Title
  textFont(fontA);
  textSize(48);
  fill(0, 180, 255);
  textAlign(CENTER, CENTER);
  let titleY = 38;
  text("CubeRush!", width / 2, titleY);

  stroke(0, 180, 255);
  strokeWeight(3);
  let lineY = titleY + 36;
  line(width * 0.25, lineY, width * 0.75, lineY);

  // Scramble text
  textSize(20);
  noStroke();
  fill(255);
  let scrambleY = lineY + 26;
  text(scramble, width / 2, scrambleY);

  // Timer
  textFont(fontB);
  textSize(200);
  textAlign(LEFT, CENTER);
  let timerY = height / 2.3;
  let timerStr = formatTimer(timerRunning ? millis() - startTime + elapsed : elapsed);
  let timerX = width / 2 - textWidth(timerStr) / 2;
  fill(0, 0, 0, 80);
  text(timerStr, timerX + 6, timerY + 6);
  fill(0, 255, 180);
  text(timerStr, timerX, timerY);

  // Timer hint
  textFont(fontA);
  textSize(18);
  textAlign(CENTER, CENTER);
  fill(0, 180, 255);
  text("Press SPACE to start/stop the timer", width / 2, timerY + 120);

  // Ao5 / Ao12
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

  let ao12Str = "--:--.--";
  if (timeRecords.length >= 12) {
    let recent12 = timeRecords.slice(-12);
    ao12Str = formatTimer(recent12.reduce((a, b) => a + b) / 12);
  }
  text("Ao12: " + ao12Str, recordX, recordY);

  drawCubeUnfoldedCool(cubeState, width - width / 3.5, height - height / 2.15);
}

function keyPressed() {
  if (key === ' ') {
    if (!timerRunning && elapsed === 0) {
      timerRunning = true;
      startTime = millis();
    } else if (timerRunning) {
      timerRunning = false;
      elapsed += millis() - startTime;
      timeRecords.push(elapsed);
    } else if (!timerRunning && elapsed > 0) {
      elapsed = 0;
      timerRunning = true;
      startTime = millis();
    }
  }
}

function formatTimer(ms) {
  ms = Math.floor(ms);
  let centi = Math.floor((ms % 1000) / 10);
  let sec = Math.floor(ms / 1000) % 60;
  let min = Math.floor(ms / 60000);
  return nf(min, 2) + ':' + nf(sec, 2) + '.' + nf(centi, 2);
}

function generateScramble() {
  scramble = "";
  scrambleMoves = [];
  let prevMove = "";
  for (let i = 0; i < 20; i++) {
    let move;
    do {
      move = random(moves);
    } while (move === prevMove);
    prevMove = move;

    let modifier = random(modifiers);
    let moveStr = move + modifier;
    scrambleMoves.push(moveStr);
    scramble += moveStr + (i < 19 ? " -> " : "");
  }
}

function getSolvedCube() {
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
  for (let move of moves) rotateFace(state, move);
}

function rotateFace(state, move) {
  let face = move[0];
  let amount = move[1] === "'" ? 3 : move[1] === "2" ? 2 : 1;
  for (let i = 0; i < amount; i++) rotateFaceOnce(state, face);
}

function rotateFaceOnce(state, face) {
  let s = state[face];
  state[face] = [s[6], s[3], s[0], s[7], s[4], s[1], s[8], s[5], s[2]];

  const adjacent = {
    U: [["B", [2,1,0]], ["R", [2,1,0]], ["F", [2,1,0]], ["L", [2,1,0]]],
    D: [["F", [6,7,8]], ["R", [6,7,8]], ["B", [6,7,8]], ["L", [6,7,8]]],
    F: [["U", [6,7,8]], ["R", [0,3,6]], ["D", [2,1,0]], ["L", [8,5,2]]],
    B: [["U", [2,1,0]], ["L", [0,3,6]], ["D", [6,7,8]], ["R", [8,5,2]]],
    L: [["U", [0,3,6]], ["F", [0,3,6]], ["D", [0,3,6]], ["B", [8,5,2]]],
    R: [["U", [8,5,2]], ["B", [0,3,6]], ["D", [8,5,2]], ["F", [8,5,2]]]
  };

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
  let size = 28;
  let gap = 14;
  let baseX = x;
  let baseY = y;

  let faces = ['U', 'L', 'F', 'R', 'B', 'D'];
  let offsets = {
    U: [size * 3 + gap, 0],
    L: [0, size * 3 + gap],
    F: [size * 3 + gap, size * 3 + gap],
    R: [size * 6 + gap * 2, size * 3 + gap],
    B: [size * 9 + gap * 3, size * 3 + gap],
    D: [size * 3 + gap, size * 6 + gap * 2]
  };

  for (let face of faces) {
    let [ox, oy] = offsets[face];
    for (let i = 0; i < 9; i++) {
      let col = i % 3;
      let row = Math.floor(i / 3);
      let c = color(state[face][i]);
      let grad = lerpColor(c, color(0, 0, 0), 0.25);
      fill(grad);
      stroke(0, 180, 255);
      strokeWeight(2);
      rect(baseX + ox + col * size, baseY + oy + row * size, size, size, 4);
    }
  }
}
