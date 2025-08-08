import { getSocket } from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
  const socket = getSocket();

  const usernameInput = document.getElementById('usernameInput');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const createRoomBtn = document.getElementById('createRoomBtn');
  const joinRoomBtn = document.getElementById('joinRoomBtn');

  createRoomBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      alert('Please enter a username');
      return;
    }

    socket.emit('create_room', { username }, (response) => {
      if (response.success) {
        // Store data in sessionStorage
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('roomCode', response.roomCode);
        sessionStorage.setItem('isOwner', 'true');
        // Navigate to game page without reloading
        window.location.replace('./game.html');
      } else {
        alert(response.error || 'Failed to create room');
      }
    });
  });

  joinRoomBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const roomCode = roomCodeInput.value.trim();
    
    if (!username) {
      alert('Please enter a username');
      return;
    }
    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }

    socket.emit('join_room', { username, roomCode }, (response) => {
      if (response.success) {
        // Store data in sessionStorage
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('roomCode', roomCode);
        sessionStorage.setItem('isOwner', 'false');
        // Navigate to game page without reloading
        window.location.replace('./game.html');
      } else {
        alert(response.error || 'Failed to join room');
      }
    });
  });
});
