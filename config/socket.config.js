// socket.js
let io = null;
const Server = require("socket.io");
function initSocket(server) {
  io = Server(server, {
    cors: {
      origin: "*", // or your frontend origin
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
    pingTimeout: 30000,
    maxHttpBufferSize: 1e6,
  });

  io.on("connection", (socket) => {
    console.log("User Connectedq:", socket.id);
    socket.on("send_notification", (data) => {
      console.log("Received:", data);
      io.emit("new_notification", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });

  return io;
}

function getSocket() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getSocket };
