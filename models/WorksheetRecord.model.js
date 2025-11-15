const mongoose = require("mongoose");

const WorksheetRecordSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    recordId: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: String,
      required: true,
      unique: true,
    },
    worksheetId: {
      type: String,
      required: true,
    },
    // 👇 Dynamic data field
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("WorksheetRecord", WorksheetRecordSchema);
