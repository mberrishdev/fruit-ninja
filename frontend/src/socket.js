// Singleton socket instance
let socket = null;

export function getSocket() {
  
  if (!socket) {
    socket = io("http://localhost:3000", {
      // socket = io("https://socket.fruitninja.mberrishdev.me", {
      transports: ["websocket"],
      upgrade: false,
      secure: false,
      // Add reconnection options
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Prevent auto connect
      autoConnect: false
    });

    // Log socket events for debugging
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      
      // After reconnect, try to rejoin room if we have the data
      const username = sessionStorage.getItem('username');
      const roomCode = sessionStorage.getItem('roomCode');
      if (username && roomCode) {
        console.log('Attempting to rejoin room after reconnect:', roomCode);
        socket.emit('join_room', { username, roomCode, isRejoin: true }, (response) => {
          console.log('Rejoin response:', response);
        });
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Connect the socket
    socket.connect();
  }
  return socket;
}

// Force disconnect and cleanup
export function cleanup() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
