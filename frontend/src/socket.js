// Singleton socket instance
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:3000", {
      //socket = io("https://socket.fruitninja.mberrishdev.me", {
      transports: ["websocket"],
      upgrade: false,
      secure: false,
      // Enhanced reconnection options
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 1000,
      reconnectionAttempts: 10,
      timeout: 10000,
      // Keep alive with ping
      pingInterval: 2000,
      pingTimeout: 5000,
      // Prevent auto connect
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("reconnect", (attemptNumber) => {
      const username = sessionStorage.getItem("username");
      const roomCode = sessionStorage.getItem("roomCode");
      if (username && roomCode) {
        socket.emit(
          "join_room",
          { username, roomCode, isRejoin: true },
          (response) => {
            console.log("Rejoin response:", response);
          }
        );
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

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
