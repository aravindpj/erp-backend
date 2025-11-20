let io = null;
const Server = require("socket.io");

const userSockets = {};  // userId → [socketId, socketId...]

function initSocket(server) {
  io = Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      if (!userSockets[userId]) userSockets[userId] = [];
      userSockets[userId].push(socket.id);

      console.log("User Connected:", userId, userSockets[userId]);
    }

    socket.on("disconnect", () => {
      if (userId) {
        userSockets[userId] = userSockets[userId].filter(
          (id) => id !== socket.id
        );

        // remove user entry if no active sockets left
        if (userSockets[userId].length === 0) {
          delete userSockets[userId];
        }
      }

      console.log("User Disconnected:", socket.id);
    });
  });

  return io;
}

function getSocket() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

function getUserSockets(userId) {
  return userSockets[userId] || [];
}

module.exports = { initSocket, getSocket, getUserSockets };
