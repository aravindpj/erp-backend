const mongoose = require("mongoose");
const moment = require("moment");
const Counter = require("./Counter.model");
const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false,
    unique:true
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  shortName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: moment().format("DD-MM-YYYY hh:mm A"),
  },
});

UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.id) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(5, "0"); // "00001"
    user.id = `ERP${seqNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", UserSchema);
