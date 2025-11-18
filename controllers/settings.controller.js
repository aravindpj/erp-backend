const SettingsModel = require("../models/Settings.model");
exports.getSettings = async (req, res) => {
  try {
    const { id } = req.params;
    let data = await SettingsModel.findOne({ userId: id });
    if (!data) {
      data = {
        primaryColor: "174 77% 56%",
        fontFamily: "Montserrat, system-ui, sans-serif",
        fontSize: "small",
        borderRadius: "small",
      };
    }
    res.success({ status: 200, message: "Settings saved successfully", data });
  } catch (error) {
    console.log(error);
    res.error({ status: 500, error });
  }
};
exports.saveSettings = async (req, res) => {
  try {
    const updateFields = {};
    for (let key in req.body) {
      updateFields[key] = req.body[key];
    }
    const data = await SettingsModel.findOneAndUpdate(
      { userId: req.body.userId },
      { $set: updateFields },
      { new: true }
    );
    res.success({ status: 200, message: "Settings saved successfully", data });
  } catch (error) {
    console.log(error);
    res.error({ status: 500, error });
  }
};
