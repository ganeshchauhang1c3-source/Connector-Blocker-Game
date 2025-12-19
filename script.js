const welcome = document.getElementById("welcome");
const setup = document.getElementById("setup");
const game = document.getElementById("game");
const winPopup = document.getElementById("winPopup");

const enterBtn = document.getElementById("enterBtn");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

const info = document.getElementById("info");
const winText = document.getElementById("winText");
const svg = document.getElementById("board");

let connector, blocker;
let turn = "connector";
let round = 1;
let score = { c: 0, b: 0 };

let nodes = [];
let edges = [];

enterBtn.onclick = () => {
  welcome.classList.add("hidden");
  setup.classList.remove("hidden");
};

startBtn.onclick = () => {
  connector = document.getElementById("p1").value || "Player 1";
  blocker = document.getElementById("p2").value || "Player 2";

  setup.classList.add("hidden");
  game.classList.remove("hidden");

  startRound();
};

nextBtn.onclick = () => {
  winPopup.classList.add("hidden");
  if (score.c === 2 || score.b === 2) return;
  turn = "connector";
  round++;
  startRound();
};

function startRound() {
  svg.innerHTML = "";
  nodes = [];
  edges = [];

  generateGraph();
  draw();
  updateInfo();
}

function generateGraph() {
  for (let i = 0; i < 15; i++) {
    nodes.push({
      x: 60 + Math.random() * 480,
      y: 60 + Math.random() * 480
    });
  }

  for (let i = 0; i < 14; i++) {
    edges.push({ a: i, b: i + 1, state: "free" });
  }

  for (let i = 0; i < 15; i++) {
    for (let j = i + 2; j < 15; j++) {
      if (Math.random() < 0.2) {
        edges.push({ a: i, b: j, state: "free" });
      }
    }
  }
}

function draw() {
  edges.forEach(e => {
    const n1 = nodes[e.a];
    const n2 = nodes[e.b];

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", n1.x);
    line.setAttribute("y1", n1.y);
    line.setAttribute("x2", n2.x);
    line.setAttribute("y2", n2.y);
    line.classList.add("edge");

    line.onclick = () => playMove(e, line);
    svg.appendChild(line);
  });

  nodes.forEach((n, i) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", n.x);
    c.setAttribute("cy", n.y);
    c.setAttribute("r", 6);
    c.classList.add("node");
    if (i === 0) c.classList.add("start");
    if (i === 14) c.classList.add("end");
    svg.appendChild(c);
  });
}

function playMove(edge, line) {
  if (edge.state !== "free") return;

  if (turn === "connector") {
    edge.state = "connector";
    line.classList.add("connector");
    turn = "blocker";
  } else {
    edge.state = "blocked";
    line.classList.add("blocked");
    turn = "connector";
  }

  updateInfo();
  checkWin();
}

function checkWin() {
  if (hasPath(true)) {
    score.c++;
    showWin(connector + " WINS THIS ROUND");
  } else if (!hasPath(false)) {
    score.b++;
    showWin(blocker + " WINS THIS ROUND");
  }
}

function hasPath(onlyGreen) {
  let visited = new Set();
  let stack = [0];

  while (stack.length) {
    let v = stack.pop();
    if (v === 14) return true;
    visited.add(v);

    edges.forEach(e => {
      if (onlyGreen && e.state !== "connector") return;
      if (!onlyGreen && e.state === "blocked") return;

      let next = e.a === v ? e.b : e.b === v ? e.a : null;
      if (next !== null && !visited.has(next)) stack.push(next);
    });
  }
  return false;
}

function showWin(text) {
  winText.innerText = text;
  winPopup.classList.remove("hidden");
}

function updateInfo() {
  info.innerText =
    `Round ${round} | ${connector} (Connector): ${score.c} | ${blocker} (Blocker): ${score.b} | Turn: ${turn}`;
}
