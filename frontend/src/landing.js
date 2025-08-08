import { getSocket } from './socket.js';

document.addEventListener('DOMContentLoaded', () => {
  const socket = getSocket();

  const usernameInput = document.getElementById('usernameInput');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const createRoomBtn = document.getElementById('createRoomBtn');
  const joinRoomBtn = document.getElementById('joinRoomBtn');

  // Create toast container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  `;
  document.body.appendChild(toastContainer);

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
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
      error: '#ef4444',
      success: '#22c55e',
      info: '#3b82f6',
      warning: '#f59e0b'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // Add icon based on type
    const icons = {
      error: '❌',
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️'
    };
    toast.innerHTML = `
      <span style="margin-right: 8px;">${icons[type]}</span>
      <span style="flex-grow: 1;">${message}</span>
    `;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }

  createRoomBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      showToast('Please enter a username', 'error');
      return;
    }

    // Disable button while creating room
    createRoomBtn.disabled = true;
    createRoomBtn.textContent = 'Creating...';

    // Check socket connection
    if (!socket.connected) {
      console.log('Socket not connected, attempting to connect...');
      socket.connect();
      await new Promise(resolve => {
        const checkConnection = () => {
          if (socket.connected) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    socket.emit('create_room', { username }, (response) => {
      try {
        if (response.success) {
          // Store data in sessionStorage
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('roomCode', response.roomCode);
          sessionStorage.setItem('isOwner', 'true');
          // Navigate to game page without reloading
          window.location.replace('./game.html');
        } else {
          showToast(response.error || 'Failed to create room', 'error');
          // Re-enable button on failure
          createRoomBtn.disabled = false;
          createRoomBtn.textContent = 'Create Room';
        }
      } catch (error) {
        console.error('Room creation error:', error);
        showToast('Failed to create room. Please try again.', 'error');
        // Re-enable button on error
        createRoomBtn.disabled = false;
        createRoomBtn.textContent = 'Create Room';
      }
    });
  });

  joinRoomBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const roomCode = roomCodeInput.value.trim();
    
    if (!username) {
      showToast('Please enter a username', 'error');
      return;
    }
    if (!roomCode) {
      showToast('Please enter a room code', 'error');
      return;
    }

    socket.emit('join_room', { username, roomCode }, (response) => {
      try {
        if (response.success) {
          // Store data in sessionStorage
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('roomCode', roomCode);
          sessionStorage.setItem('isOwner', 'false');
          // Navigate to game page without reloading
          window.location.replace('./game.html');
        } else {
          showToast(response.error || 'Failed to join room', 'error');
        }
      } catch (error) {
        console.error('Room join error:', error);
        showToast('Failed to join room. Please try again.', 'error');
      }
    });
  });
});
