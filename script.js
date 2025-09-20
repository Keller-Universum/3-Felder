// ─────────────────────────────────────────────
// Globale Variablen für Spielzustand und Design
// ─────────────────────────────────────────────

let board = [];                    // Spielfeld als Array
let playerSymbol = "X";            // Symbol des Spielers
let aiSymbol = "O";                // Symbol der KI
let playerColor = "#ffff00";       // Standardfarbe Spieler (Gelb)
let aiColor = "#1802f2";           // Standardfarbe KI (KU-Blau)
let playerScore = 0;               // Punktestand Spieler
let aiScore = 0;                   // Punktestand KI
let playerName = "Spieler";        // Name des Spielers
let aiName = "KI";                 // Name der KI
let gridSize = 5;                  // Standardgröße des Rasters
let lastPlayerIndex = null;        // Index des letzten Spielerzugs
let lastAiIndex = null;            // Index des letzten KI-Zugs

// ─────────────────────────────────────────────
// Startseite initial anzeigen (Fade-Effekt)
// ─────────────────────────────────────────────

window.onload = () => {
  const start = document.getElementById("startPage");
  start.style.display = "block";
  setTimeout(() => start.classList.add("active"), 10);
};

// ─────────────────────────────────────────────
// Seitenwechsel mit Fade-Übergang
// ─────────────────────────────────────────────

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
// Rastergröße auswählen
// ─────────────────────────────────────────────

function selectGrid(size) {
  gridSize = size;
  document.querySelectorAll(".gridOption").forEach(opt => opt.classList.remove("selected"));
  document.querySelectorAll(".gridOption").forEach(opt => {
    if (opt.innerText === `${size}×${size}`) opt.classList.add("selected");
  });
}

// ─────────────────────────────────────────────
// Spiel initial starten
// ─────────────────────────────────────────────

function startGame() {
  playerName = document.getElementById("playerName").value || "Spieler";
  aiName = document.getElementById("aiName").value || "KI";
  playerSymbol = document.getElementById("playerInput").value || "X";
  aiSymbol = document.getElementById("aiInput").value || "O";
  playerColor = document.getElementById("playerColor").value || "#ffff00";
  aiColor = document.getElementById("aiColor").value || "#1802f2";

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
}

// ─────────────────────────────────────────────
// Spielerzug ausführen
// ─────────────────────────────────────────────

function playerMove(index) {
  if (board[index] !== "") return;
  board[index] = playerSymbol;
  lastPlayerIndex = index;
  updateBoard();
  checkScore(playerSymbol);
  if (isGameOver()) showResult();
  else setTimeout(aiMove, 1000); // KI-Zug mit Verzögerung
}

// ─────────────────────────────────────────────
// KI-Zug ausführen
// ─────────────────────────────────────────────

function aiMove() {
  let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  if (empty.length === 0) return;
  let choice = empty[Math.floor(Math.random() * empty.length)];
  board[choice] = aiSymbol;
  lastAiIndex = choice;
  updateBoard();
  checkScore(aiSymbol);
  if (isGameOver()) showResult();
}

// ─────────────────────────────────────────────
// Punkte prüfen (3er-Reihen horizontal/vertikal)
// ─────────────────────────────────────────────

function checkScore(currentSymbol) {
  let found = [];

  // Horizontal prüfen
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c <= gridSize - 3; c++) {
      let i = r * gridSize + c;
      if (board[i] === currentSymbol &&
          board[i+1] === currentSymbol &&
          board[i+2] === currentSymbol) {
        found.push(i, i+1, i+2);
      }
    }
  }

  // Vertikal prüfen
  for (let c = 0; c < gridSize; c++) {
    for (let r = 0; r <= gridSize - 3; r++) {
      let i = r * gridSize + c;
      if (board[i] === currentSymbol &&
          board[i+gridSize] === currentSymbol &&
          board[i+gridSize*2] === currentSymbol) {
        found.push(i, i+gridSize, i+gridSize*2);
      }
    }
  }

  // Punkte vergeben und Felder blockieren
  if (found.length > 0) {
    found.forEach(i => board[i] = "BLOCK");
    if (currentSymbol === playerSymbol) playerScore++;
    if (currentSymbol === aiSymbol) aiScore++;
    updateScore();
  }

  updateBoard();
}

// ─────────────────────────────────────────────
// Spielfeld visuell aktualisieren
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

      // Farben setzen
      if (board[i] === playerSymbol) {
        cell.style.backgroundColor = playerColor;
      } else if (board[i] === aiSymbol) {
        cell.style.backgroundColor = aiColor;
      } else {
        cell.style.backgroundColor = "#eee";
      }
    }

    // Letzten Zug hervorheben
    if (i === lastPlayerIndex || i === lastAiIndex) {
      cell.classList.add("lastMove");
    }
  });
}

// ─────────────────────────────────────────────
// Punktestand aktualisieren
// ─────────────────────────────────────────────

function updateScore() {
  document.getElementById("score").innerText =
    `${playerName}: ${playerScore} | ${aiName}: ${aiScore}`;
}

// ─────────────────────────────────────────────
// Spielende prüfen
// ─────────────────────────────────────────────

function isGameOver() {
  return board.every(cell => cell !== "");
}

// ─────────────────────────────────────────────
// Ergebnis anzeigen
// ─────────────────────────────────────────────

function showResult() {
  let result = "";
  if (playerScore > aiScore) {
    result = `${playerName} gewinnt mit ${playerScore} zu ${aiScore} gegen ${aiName}.`;
  } else if (aiScore > playerScore) {
    result = `${aiName} gewinnt mit ${aiScore} zu ${playerScore} gegen ${playerName}.`;
  } else {
    result = `${playerName} und ${aiName} spielen ${playerScore} zu ${aiScore} unentschieden.`;
  }

  document.getElementById("resultText").innerText = result;
  showPage("resultPage");
}

