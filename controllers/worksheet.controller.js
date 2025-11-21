const WorkSheet = require("../models/WorkSheet.model");
const WorksheetRecord = require("../models/WorksheetRecord.model");
exports.createWorksheet = async (req, res) => {
  try {
    console.log(req.body);
    let worksheet = new WorkSheet({ ...req.body });
    const sheet = await WorkSheet.findOne({ name: req.body.name });
    if (sheet) {
      return res.error({
        status: 500,
        message: `A sheet with the name ${sheet.name} already exists`,
      });
    }
    await worksheet.save();
    res.success({ status: 200, message: "Work sheet created successfully" });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getAllSheets = async (req, res) => {
  try {
    const data = await WorkSheet.find();
    if (!data) {
      return res.error({ status: 400, message: "There no worksheet added 1" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getWorksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await WorkSheet.findOne({ workSheetId: id });
    if (!data) {
      return res.error({ status: 400, message: "There no worksheet added 2" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getAllSheetList = async (req, res) => {
  try {
    const data = await WorkSheet.find().select("name workSheetId description");
    if (!data) {
      return res.error({ status: 400, message: "There no worksheet added 3" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.updateWorkSheet = async (req, res) => {
  try {
    let data = await WorkSheet.findOne({ workSheetId: req.body.workSheetId });
    if (!data) {
      return res.error({
        status: 404,
        message: `There is no worksheet found in the ${req.body.workSheetId}`,
      });
    }
    const updateFields = {};
    for (let key in req.body) {
      if (req.body[key] && key != "workSheetId") {
        updateFields[key] = req.body[key];
      }
    }
    data = await WorkSheet.findOneAndUpdate(
      { workSheetId: req.body.workSheetId },
      { $set: updateFields },
      { new: true }
    );
    return res.success({
      status: 200,
      message: "Worksheet updated successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.saveWorkSheetRecord = async (req, res) => {
  try {
    let record = new WorksheetRecord({ ...req.body });
    const sheetrecord = await WorksheetRecord.findOne({
      recordId: req.body.recordId,
    });
    if (sheetrecord) {
      return res.error({
        status: 500,
        message: `This worksheet already saved`,
      });
    }
    await record.save();
    res.success({ status: 200, message: "Work sheet data saved successfully" });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getWorksheetRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await WorksheetRecord.findOne({ recordId: id });
    if (!data) {
      return res.error({ status: 400, message: "There no worksheet added 4" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getWorksheetRecordData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const data = await WorksheetRecord.aggregate([
      { $match: { recordId: id } },

      // Lookup Job using jobId
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "jobId",
          as: "jobs",
        },
      },
      { $unwind: "$jobs" },

      {
        $lookup:{
          from:"jobrequests",
          localField:"jobId",
          foreignField:"jobId",
          as:"jobrequests"
        }
      },

      {$unwind:"$jobrequests"},

      // Fetch worksheet name using worksheetId stored inside Job
      {
        $lookup: {
          from: "worksheets",
          localField: "worksheetId",
          foreignField: "workSheetId",
          as: "worksheet",
        },
      },
      { $unwind: "$worksheet" },

      // Get client using clientId
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "clientId",
          as: "client",
        },
      },
      { $unwind: "$client" },

      // Fetch tech user details using tech code in Job.testRows array

      {
        $lookup: {
          from: "users",
          localField: "jobs.tech", // field in jobs document
          foreignField: "id", // field in users collection
          as: "technician",
        },
      },
      { $unwind: { path: "$technician", preserveNullAndEmptyArrays: true } },

      // Final clean structured output
      {
        $project: {
          _id: 0,
          recordId: 1,
          record: "$$ROOT",
          client: "$client", // <-- extracted worksheet name
          worksheet: "$worksheet",
          job: "$jobs",
          technician: "$technician",
          jobrequest:"$jobrequests"
        },
      },
    ]);

    if (!data) {
      return res.error({ status: 400, message: "There no worksheet added 4" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.updateWorksheetRecord = async (req, res) => {
  try {
    let data = await WorksheetRecord.findOne({ recordId: req.body.recordId });
    if (!data) {
      return res.error({
        status: 404,
        message: `There is no worksheet record found in the ${req.body.recordId}`,
      });
    }
    const updateFields = {};
    for (let key in req.body) {
      if (req.body[key] && key != "recordId") {
        updateFields[key] = req.body[key];
      }
    }
    data = await WorksheetRecord.findOneAndUpdate(
      { recordId: req.body.recordId },
      { $set: updateFields },
      { new: true }
    );
    return res.success({
      status: 200,
      message: "Worksheet updated successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};
