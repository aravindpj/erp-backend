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

Notification.post("save", function (doc) {
  try {
    const socket = getSocket();
    const sockets = getUserSockets(doc.userId);

    sockets.forEach((socketId) => {
      socket.to(socketId).emit("notification:new", doc);
    });
  } catch (error) {
    console.log("Error sending save notification =>", error);
  }
});

Notification.post("findOneAndUpdate", async function (result) {
  try {
    if (!result) return;

    const socket = getSocket();
    const sockets = getUserSockets(result.userId);

    sockets.forEach((socketId) => {
      socket.to(socketId).emit("notification:new", result);
    });
  } catch (error) {
    console.log("Update notification error =>", error);
  }
});

module.exports = mongoose.model("Notification", Notification);
