import FruitNinjaRenderer from './renderer.js';

import { getSocket } from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if we have the required session data
  const username = sessionStorage.getItem('username');
  const roomCode = sessionStorage.getItem('roomCode');
  const isOwner = sessionStorage.getItem('isOwner') === 'true';

  if (!username || !roomCode) {
    window.location.replace('./landing.html');
    return;
  }

  // Get the shared socket instance
  const socket = getSocket();

  // Update room code display
  document.getElementById('roomCode').textContent = roomCode;

  // Setup waiting room
  const waitingRoom = document.getElementById('waitingRoom');
  const gameUI = document.getElementById('gameUI');
  const playerList = document.getElementById('playerList');
  const startGameBtn = document.getElementById('startGameBtn');

  // Show/hide start button based on ownership
  startGameBtn.style.display = isOwner ? 'block' : 'none';

  // Initialize game renderer (hidden initially)
  const renderer = new FruitNinjaRenderer(socket);

  // Socket event handlers
  socket.on('player_joined', ({ players }) => {
    // Clear existing player list
    playerList.innerHTML = '';
    console.log('player_joined', players);
    
    // Add each player to the list
    players.forEach(player => {
      const playerElement = document.createElement('div');
      playerElement.className = 'player';
      if (player.isOwner) playerElement.classList.add('owner');
      playerElement.textContent = player.username;
      playerList.appendChild(playerElement);
    });
  });

  socket.on('game_started', () => {
    waitingRoom.style.display = 'none';
    gameUI.style.display = 'block';
    renderer.init(); // Initialize the game renderer
  });

  // Start game button handler (only for room owner)
  startGameBtn.addEventListener('click', () => {
    socket.emit('start_game', (response) => {
      if (!response.success) {
        alert(response.error || 'Failed to start game');
      }
    });
  });

  // Rejoin room on page load
  socket.emit('join_room', { username, roomCode }, (response) => {
    if (!response.success) {
      alert(response.error || 'Failed to rejoin room');
      window.location.href = './landing.html';
    }
  });
});
