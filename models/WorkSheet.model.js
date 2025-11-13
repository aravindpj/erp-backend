const mongoose = require("mongoose");
const Counter = require("./Counter.model");

// ===== Option Schema =====
const OptionSchema = new mongoose.Schema(
  {
    optionId: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// ===== Table Column Schema =====
const TableColumnSchema = new mongoose.Schema(
  {
    columnId: { type: String, required: true },
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
    options: { type: [OptionSchema], default: [] }, // only for select/radio
  },
  { _id: false }
);

// ===== Table Actions Schema =====
const TableActionsSchema = new mongoose.Schema(
  {
    edit: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

// ===== Field Schema =====
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
        "table", // ✅ added table type
      ],
    },
    required: { type: Boolean, default: false },
    options: { type: [OptionSchema], default: [] }, // for select/radio/etc.

    // ✅ only for table fields
    tableColumns: { type: [TableColumnSchema], default: [] },
    tableActions: { type: TableActionsSchema, default: null },
  },
  { _id: false }
);

// ===== Section Schema =====
const SectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true },
    name: { type: String, required: true },
    layout: { type: Number, default: 1 }, // ✅ added layout from your object
    fields: { type: [FieldSchema], default: [] },
  },
  { _id: false }
);

// Main worksheet schema
const WorkSheetSchema = new mongoose.Schema(
  {
    workSheetId: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: false, default: "" },
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


