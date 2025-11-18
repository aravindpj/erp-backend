const mongoose = require("mongoose");

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
  console.log("inside the notification schema",doc);
});

module.exports = mongoose.model("Notification", Notification);
