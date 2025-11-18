const CompanySchema = require("../models/Company.model");

exports.saveCompany = async (req, res) => {
  try {
    const company = new CompanySchema({
      ...req.body,
    });
    await company.save();
    return res.success({ status: 200 });
  } catch (error) {
    res.error({ status: 500, error });
  }
};
exports.updateCompany = async (req, res) => {
  try {
    const data = req.body;
 await CompanySchema.findByIdAndUpdate(
  data._id,
  { $set: data },
  { new: true }
);
    return res.success({ status: 200 });
  } catch (error) {
    res.error({ status: 500, error });
  }
};
exports.getCompany = async (req, res) => {
  try {
    const data = await CompanySchema.find();
    return res.success({ status: 200,data });
  } catch (error) {
    res.error({ status: 500, error });
  }
};
