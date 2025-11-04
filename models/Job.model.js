const mongoose = require("mongoose");
const Counter = require("./Counter.model"); 
const moment  = require("moment")
const TestRowSchema = new mongoose.Schema({
  testMethod: { type: String, required: true },
  testSpec: { type: String, required: true },
  acceptanceSpec: { type: String, required: true },
  toTable: { type: String, required: true },
  testProcedure: { type: String, required: true },
  tech: { type: String, required: true },
});
const JobRequestSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: false, unique: true },
    createdAt: { type: Date, default: moment().toDate()},
    startDate: { type: Date,required: true },
    lastDate: { type: Date, required: true },
    clientId: { type: String, required: true },
    clientName: { type: String, required: true },
    summary: { type: String, required: true },
    detailsProvided: { type: String, required: true },
    comment: { type: String },
    divisionRules: { type: String, required: true },
    testRows: { type: [TestRowSchema], default: [] },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Completed", "Rejected"],
    },
  },
  { timestamps: true }
);

JobRequestSchema.pre("save", async function (next) {
  const job = this;
  if (job.jobId) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "jobReqId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(5, "0"); // "00001"
    job.jobId = `JOB${seqNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model("JobRequest", JobRequestSchema);
