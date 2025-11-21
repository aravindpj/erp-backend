const mongoose = require("mongoose");
const { getSocket, getUserSockets } = require("../config/socket.config");
const Notification = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    title: { type: String, require: true },
    message: { type: String, require: true },
    type: { type: String, enum: ["info", "success", "warning", "default"] },
    isRead: { type: Boolean, require: true },
  },
  { timestamps: true }
);

Notification.post("insertMany", function (doc) {
  // Emit real-time event
  try {
    const socket = getSocket();
    let sockets = [];
    doc.forEach((n) => {
      sockets = getUserSockets(n.userId);
      sockets.forEach((socketId) => {
        socket.to(socketId).emit("notification:new", n);
      });
    });
  } catch (error) {
    console.log("error in notification ==> ", error);
  }
});

module.exports = mongoose.model("Notification", Notification);
