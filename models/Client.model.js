const moment = require("moment");
const mongoose = require("mongoose");
const Counter = require("./Counter.model");
const BusinessSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: false,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  abnAcn: {
    type: String,
    trim: true,
    required: true,
  },
  businessAddress: {
    type: String,
    trim: true,
    required: true,
  },
  postalAddress: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  accountDeptContact: {
    type: String,
    trim: true,
    required: true,
  },
  accountPhone: {
    type: String,
    trim: true,
    required: true,
  },
  fax: {
    type: String,
    trim: true,
  },
  accountEmail: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  invoiceEmail: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  createdDate: {
    type: String,
  },
  lastEditedDate: {
    type: String,
  },
});

BusinessSchema.pre("save", async function (next) {
  const client = this;
  if (client.clientId) {
    return next();
  }
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "clientId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(7, "0"); // "00001"
    client.clientId = `CLIENT${seqNumber}`;
    console.log(`C${seqNumber}`)
    client.createdDate = moment().format("DD-MM-YYYY hh:mm A");
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Client", BusinessSchema);
