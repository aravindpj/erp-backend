const mongoose = require("mongoose");
const Counter = require("./Counter.model")
// Schema for options inside fields
const OptionSchema = new mongoose.Schema(
  {
    optionId: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// Schema for fields inside sections
const FieldSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "textfield",
        "textarea",
        "checkbox",
        "radio",
        "select",
        "autocomplete",
        "autocomplete-chips",
        "file",
      ],
    },
    required: { type: Boolean, default: false },
    options: { type: [OptionSchema], default: [] }, // optional field
  },
  { _id: false }
);

// Schema for sections inside worksheet
const SectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true },
    name: { type: String, required: true },
    fields: { type: [FieldSchema], default: [] },
  },
  { _id: false }
);

// Main worksheet schema
const WorkSheetSchema = new mongoose.Schema(
  {
    workSheetId: { type: String,},
    name: { type: String, required: true },
    sections: { type: [SectionSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WorkSheetSchema.pre("save", async function (next) {
  const workSheet = this;
  if (workSheet.workSheetId) return next();
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "workSheetId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = counter.seq.toString().padStart(10, "0"); // "00001"
    workSheet.workSheetId = `WRKSHT${seqNumber}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("WorkSheet", WorkSheetSchema);
