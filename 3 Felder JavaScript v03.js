// ─────────────────────────────────────────────
// KAPITEL 1: Globale Variablen & Grundeinstellungen
// ─────────────────────────────────────────────

let board = [];
let playerSymbol = "X";
let aiSymbol = "O";
let playerColor = "#ffff00";
let aiColor = "#1802f2";
let playerScore = 0;
let aiScore = 0;
let playerName = "Spieler";
let aiName = "KI";
let gridSize = 5;
let lastPlayerIndex = null;
let lastAiIndex = null;
let difficulty = "easy";
let firstMove = "player"; // "player", "ai", "random"
let drawRule = "draw";    // "draw", "winner"

// ─────────────────────────────────────────────
// KAPITEL 2: Seitensteuerung & UI-Wechsel
// ─────────────────────────────────────────────

window.onload = () => {
  const start = document.getElementById("startPage");
  start.style.display = "block";
  setTimeout(() => start.classList.add("active"), 10);
};

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
    setTimeout(() => p.style.display = "none", 500);
  });
  const target = document.getElementById(id);
  setTimeout(() => {
    target.style.display = "block";
    setTimeout(() => target.classList.add("active"), 10);
  }, 500);
}

// ─────────────────────────────────────────────
// KAPITEL 3: Spielfeld-Konfiguration & Startlogik
// ─────────────────────────────────────────────

function selectGrid(size) {
  gridSize = size;
  document.querySelectorAll(".gridOption").forEach(opt => opt.classList.remove("selected"));
  document.querySelectorAll(".gridOption").forEach(opt => {
    if (opt.innerText === `${size}×${size}`) opt.classList.add("selected");
  });
}

function setDifficulty(level) {
  difficulty = level;
  document.querySelectorAll(".difficultyOption").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".difficultyOption").forEach(btn => {
    if (btn.innerText.toLowerCase() === level) btn.classList.add("selected");
  });
}

function setFirstMove(who) {
  firstMove = who;
  document.querySelectorAll(".firstMoveOption").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".firstMoveOption").forEach(btn => {
    if (btn.innerText.toLowerCase() === who || (who === "player" && btn.innerText === playerName) || (who === "ai" && btn.innerText === aiName)) {
      btn.classList.add("selected");
    }
  });
}

function setDrawRule(rule) {
  drawRule = rule;
  document.querySelectorAll(".drawRuleOption").forEach(btn => btn.classList.remove("selected"));
  document.querySelectorAll(".drawRuleOption").forEach(btn => {
    if (btn.innerText.toLowerCase().includes(rule)) btn.classList.add("selected");
  });
}

function startGame() {
  playerName = document.getElementById("playerName").value || "Spieler";
  aiName = document.getElementById("aiName").value || "KI";
  playerSymbol = document.getElementById("playerInput").value || "X";
  aiSymbol = document.getElementById("aiInput").value || "O";
  playerColor = document.getElementById("playerColor").value || "#ffff00";
  aiColor = document.getElementById("aiColor").value || "#1802f2";

  // Namen aktualisieren in Erstzug-Auswahl
  document.querySelectorAll(".firstMoveOption")[0].innerText = playerName;
  document.querySelectorAll(".firstMoveOption")[1].innerText = aiName;

  // Namen aktualisieren in Ergebnisregel-Auswahl
  document.querySelectorAll(".drawRuleOption")[0].innerText = "Unentschieden möglich";
  document.querySelectorAll(".drawRuleOption")[1].innerText = "Wer nachzieht, gewinnt bei Gleichstand";

  board = [];
  document.getElementById("gameBoard").innerHTML = "";
  document.getElementById("gameBoard").style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    board.push("");
    let cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.onclick = () => playerMove(i);
    document.getElementById("gameBoard").appendChild(cell);
  }

  playerScore = 0;
  aiScore = 0;
  lastPlayerIndex = null;
  lastAiIndex = null;
  updateScore();
  document.getElementById("gameTitle").innerText = `${playerName} vs ${aiName}`;
  showPage("gamePage");

  // Startspieler bestimmen
  let starter = firstMove;
  if (firstMove === "random") {
    starter = Math.random() < 0.5 ? "player" : "ai";
  }
  if (starter === "ai") {
    setTimeout(aiMove, 1000);
  }
}

// ─────────────────────────────────────────────
// KAPITEL 4: Spielerzug & KI-Zug
// ─────────────────────────────────────────────

function playerMove(index) {
  if (board[index] !== "") return;
  board[index] = playerSymbol;
  lastPlayerIndex = index;
  updateBoard();
  checkScore(playerSymbol);
  if (isGameOver()) showResult();
  else setTimeout(aiMove, 1000);
}

// ─────────────────────────────────────────────
// KAPITEL 5: KI-Strategie (leicht, mittel, schwer vorbereitet)
// ─────────────────────────────────────────────

function aiMove() {
  let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  if (empty.length === 0) return;

  let choice;

  if (difficulty === "easy") {
    choice = empty[Math.floor(Math.random() * empty.length)];
  }

  else if (difficulty === "medium") {
    let think = Math.random() < 0.75;
    if (think) {
      choice = findScoringMove(aiSymbol);
      if (choice === null) choice = findScoringMove(playerSymbol);
    }
    if (choice === null) choice = empty[Math.floor(Math.random() * empty.length)];
  }

  else if (difficulty === "hard") {
    // zukünftige Logik für schwere KI
    choice = empty[Math.floor(Math.random() * empty.length)];
  }

  board[choice] = aiSymbol;
  lastAiIndex = choice;
  updateBoard();
  checkScore(aiSymbol);
  if (isGameOver()) showResult();
}

function findScoringMove(symbol) {
  for (let i of board.keys()) {
    if (board[i] !== "") continue;
    board[i] = symbol;
    let before = playerScore + aiScore;
    checkScore(symbol);
    let after = playerScore + aiScore;
    board[i] = "";
    if (after > before) return i;
  }
  return null;
}

// ─────────────────────────────────────────────
// KAPITEL 6: Punkteprüfung & Blockierung (sequentiell)
// ─────────────────────────────────────────────

function checkScore(currentSymbol) {
  let scored = false;

  // Horizontal prüfen
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c <= gridSize - 3; c++) {
      let i1 = r * gridSize + c;
      let i2 = i1 + 1;
      let i3 = i1 + 2;

      if (
        board[i1] === currentSymbol &&
        board[i2] === currentSymbol &&
        board[i3] === currentSymbol
      ) {
        board[i1] = "BLOCK";
        board[i2] = "BLOCK";
        board[i3] = "BLOCK";
        scored = true;
        break;
      }
    }
    if (scored) break;
  }

  // Vertikal prüfen
  if (!scored) {
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r <= gridSize - 3; r++) {
        let i1 = r * gridSize + c;
        let i2 = i1 + gridSize;
        let i3 = i1 + gridSize * 2;

        if (
          board[i1] === currentSymbol &&
          board[i2] === currentSymbol &&
          board[i3] === currentSymbol
        ) {
          board[i1] = "BLOCK";
          board[i2] = "BLOCK";
          board[i3] = "BLOCK";
          scored = true;
          break;
        }
      }
      if (scored) break;
    }
  }

  if (scored) {
    if (currentSymbol === playerSymbol) playerScore++;
    if (currentSymbol === aiSymbol) aiScore++;
    updateScore();
  }

  updateBoard();
}

// ─────────────────────────────────────────────
// KAPITEL 7: Spielfeld-Visualisierung
// ─────────────────────────────────────────────

function updateBoard() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.classList.remove("lastMove");

    if (board[i] === "BLOCK") {
      cell.innerText = "";
      cell.classList.add("blocked");
      cell.style.backgroundColor = "#999";
    } else {
      cell.innerText = board[i];
      cell.classList.remove("blocked");

      if (board[i] === playerSymbol) {
        cell.style.backgroundColor = playerColor;
      } else if (board[i] === aiSymbol) {
        cell.style.backgroundColor = aiColor;
      } else {
        cell.style.backgroundColor = "#eee";
      }
    }

    if (i === lastPlayerIndex || i === lastAiIndex) {
      cell.classList.add("lastMove");
    }
  });
}

function updateScore() {
  document.getElementById("score").innerText =
    `${playerName}: ${playerScore} | ${aiName}: ${aiScore}`;
}

// ─────────────────────────────────────────────
// KAPITEL 8: Spielende & Ergebnisanzeige
// ─────────────────────────────────────────────

function isGameOver() {
  return board.every(cell => cell !== "");
}

function showResult() {
  let result = "";

  if (playerScore > aiScore) {
    result = `${playerName} gewinnt mit ${playerScore} zu ${aiScore} gegen ${aiName}.`;
  } else if (aiScore > playerScore) {
    result = `${aiName} gewinnt mit ${aiScore} zu ${playerScore} gegen ${playerName}.`;
  } else {
    if (drawRule === "draw") {
      result = `${playerName} und ${aiName} spielen ${playerScore} zu ${aiScore} unentschieden.`;
    } else {
      let starter = firstMove === "random"
        ? (Math.random() < 0.5 ? "player" : "ai")
        : firstMove;
      let winner = starter === "player" ? aiName : playerName;
      result = `${winner} gewinnt bei Gleichstand – weil ${starter === "player" ? aiName : playerName} nachgezogen hat.`;
    }
  }

  document.getElementById("resultText").innerText = result;

  // Sternanzeige generieren
  let playerStarHTML = `${playerName}: `;
  for (let i = 0; i < playerScore; i++) {
    playerStarHTML += `<span style="color:${playerColor}">⭐</span>`;
  }

  let aiStarHTML = `${aiName}: `;
  for (let i = 0; i < aiScore; i++) {
    aiStarHTML += `<span style="color:${aiColor}">⭐</span>`;
  }

  document.getElementById("playerStars").innerHTML = playerStarHTML;
  document.getElementById("aiStars").innerHTML = aiStarHTML;

  showPage("resultPage");
}
