import FruitNinjaRenderer from "./renderer.js";

import { getSocket } from "./socket.js";

// Create toast container globally
let toastContainer;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize toast container
  toastContainer = document.createElement("div");
  toastContainer.id = "toastContainer";
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  `;
  document.body.appendChild(toastContainer);
  // Check if we have the required session data
  const username = sessionStorage.getItem("username");
  const roomCode = sessionStorage.getItem("roomCode");
  const isOwner = sessionStorage.getItem("isOwner") === "true";

  if (!username || !roomCode) {
    window.location.replace("./landing.html");
    return;
  }

  // Get the shared socket instance
  const socket = getSocket();

  // Update room code display
  document.getElementById("roomCode").textContent = roomCode;

  // Setup waiting room
  const waitingRoom = document.getElementById("waitingRoom");
  const gameUI = document.getElementById("gameUI");
  const playerList = document.getElementById("playerList");
  const startGameBtn = document.getElementById("startGameBtn");

  // Show/hide start button based on ownership
  startGameBtn.style.display = isOwner ? "block" : "none";

  // Initialize game renderer (hidden initially)
  const renderer = new FruitNinjaRenderer(socket);

  let gameTimer;
  let gameEndTime;

  function updateTimer() {
    if (!gameEndTime) return;

    const now = Date.now();
    const timeLeft = Math.max(0, gameEndTime - now);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    document.getElementById("timeLeft").textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (timeLeft > 0) {
      requestAnimationFrame(updateTimer);
    }
  }

  // Handle leaderboard updates
  socket.on("leaderboard:update", ({ leaderboard }) => {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = leaderboard
      .map((player, index) => {
        const classes = [
          "leaderboard-item",
          player.username === username ? "current-player" : "",
          player.isOwner ? "owner" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <div class="${classes}">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${player.username}</span>
            <span class="leaderboard-score">${player.score}</span>
          </div>
        `;
      })
      .join("");
  });

  // Handle player joins
  socket.on("player_joined", ({ players }) => {
    // Clear existing player list
    playerList.innerHTML = "";
    console.log("player_joined", players);

    // Add each player to the list
    players.forEach((player) => {
      const playerElement = document.createElement("div");
      playerElement.className = "player";
      if (player.isOwner) playerElement.classList.add("owner");
      playerElement.textContent = player.username;
      playerList.appendChild(playerElement);
    });
  });

  // Handle game start
  socket.on("game_started", (data) => {
    waitingRoom.style.display = "none";
    gameUI.style.display = "block";
    renderer.init(); // Initialize the game renderer

    // Start game timer
    gameEndTime = data?.endTime || Date.now() + 2 * 60 * 1000; // Default to 2 minutes if endTime not provided
    updateTimer();
  });

  // Handle game end
  socket.on("game:end", ({ leaderboard, winner }) => {
    // Stop the game
    gameEndTime = null;
    renderer.stop();

    // Show game over modal
    const modal = document.createElement("div");
    modal.className = "game-over-modal";
    modal.innerHTML = `
      <div class="game-over-content">
        <h2>Game Over!</h2>
        <div class="winner">
          🏆 Winner: ${winner.username} (${winner.score} points)
        </div>
        <div class="final-leaderboard">
          ${leaderboard
            .map(
              (player, index) => `
            <div class="leaderboard-item ${
              player.username === username ? "current-player" : ""
            } ${player.isOwner ? "owner" : ""}">
              <span class="leaderboard-rank">#${index + 1}</span>
              <span class="leaderboard-name">${player.username}</span>
              <span class="leaderboard-score">${player.score}</span>
            </div>
          `
            )
            .join("")}
        </div>
        ${
          isOwner
            ? '<button class="btn restart-btn">Start New Game</button>'
            : ""
        }
      </div>
    `;

    document.body.appendChild(modal);

    // Handle restart if owner
    if (isOwner) {
      modal.querySelector(".restart-btn").addEventListener("click", () => {
        socket.emit("start_game", (response) => {
          if (response.success) {
            modal.remove();
          } else {
            showToast(response.error || "Failed to start game", "error");
          }
        });
      });
    }
  });

  // Start game button handler (only for room owner)
  startGameBtn.addEventListener("click", () => {
    socket.emit("start_game", (response) => {
      if (!response.success) {
        showToast(response.error || "Failed to start game", "error");
      }
    });
  });

  // Join/rejoin room on page load
  socket.emit("join_room", { username, roomCode }, (response) => {
    if (!response.success) {
      showToast(response.error || "Failed to join room", "error");
      window.location.href = "./landing.html";
    }
  });

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.style.cssText = `
      padding: 12px 24px;
      margin-bottom: 10px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease-in;
      display: flex;
      align-items: center;
      min-width: 200px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.16);
    `;

    // Set background color based on type
    const colors = {
      error: "#ef4444",
      success: "#22c55e",
      info: "#3b82f6",
      warning: "#f59e0b",
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // Add icon based on type
    const icons = {
      error: "❌",
      success: "✅",
      info: "ℹ️",
      warning: "⚠️",
    };
    toast.innerHTML = `
      <span style="margin-right: 8px;">${icons[type]}</span>
      <span style="flex-grow: 1;">${message}</span>
    `;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }
});
