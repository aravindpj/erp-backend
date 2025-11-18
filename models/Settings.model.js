const mongoose = require("mongoose");

const SettingsTypeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      unique: true,
    },
    primaryColor: {
      type: String,
      required: true,
    },
    fontFamily: {
      type: String,
      required: true,
    },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"], // optional but recommended
      required: true,
    },
    borderRadius: {
      type: String,
      enum: ["small", "medium", "large"], // optional
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SettingsType", SettingsTypeSchema);
