const mongoose = require("mongoose");
const Counter = require("./Counter.model");
const Notification = require("./Notification.model");
const moment = require("moment");

const Jobschema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: false },
    testMethod: { type: String, required: true },
    testSpec: { type: String, required: true },
    acceptanceSpec: { type: String, required: true },
    toTable: { type: String, required: true },
    testProcedure: { type: String, required: true },
    tech: { type: String, required: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Completed", "In progress"],
    },
  },
  { timestamps: true }
);

const JobRequestSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: false, unique: true },
    createdAt: { type: Date, default: moment().toDate() },
    startDate: { type: Date, required: true },
    lastDate: { type: Date, required: true },
    clientId: { type: String, required: true },
    clientName: { type: String, required: true },
    clientAddress: { type: String, required: true },
    summary: { type: String, required: true },
    detailsProvided: { type: String, required: true },
    comment: { type: String },
    timeRequired: { type: String, required: true },
    requiredDocument: { type: String, required: true },
    // testRows: { type: [TestRowSchema], default: [] },
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

Jobschema.pre("insertMany", function (next, docs) {
  const createdBy = this.$locals?.createdBy;
  const jobId = this.$locals?.jobId;

  if (createdBy || jobId) {
    docs.forEach((doc) => {
      if (createdBy) doc.createdBy = createdBy;
      if (jobId) doc.jobId = jobId;
    });
  }

  next();
});

Jobschema.post("insertMany", async function (docs) {
  try {
    let notifictionArray = [];
    let userIds = {};
    docs.forEach((d) => {
      let userId = d.tech;
      if (userIds[userId]) {
        userIds[userId].count++;
        notifictionArray[
          userIds[userId].index
        ].message = `You have ${userIds[userId].count} new job assignments.`;
      } else {
        userIds[userId] = {
          index: notifictionArray.length,
          count: 1,
        };
        notifictionArray = [
          ...notifictionArray,
          {
            userId,
            message: `You have a new job assignment.`,
            title: "New Job Schedules",
            type: "default",
            isRead: false,
          },
        ];
      }
    });

    await Notification.insertMany(notifictionArray);
  } catch (err) {
    console.error("Notification insert error:", err);
  }
});

module.exports = {
  JobRequestSchema: mongoose.model("JobRequest", JobRequestSchema),
  Job: mongoose.model("Job", Jobschema),
};
