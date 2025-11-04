const WorkSheet = require("../models/WorkSheet.model");
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
      return res.error({ status: 400, message: "There no worksheet added" });
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
