const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: { type: String,required:true, default: "" },
  email: { type: String,required:true, default: "" },
  contactNo: { type: String,required:true, default: "" },
  address: { type: String,required:true, default: "" },
  logo: { type: String,required:false, default: "" },
  description: { type: String,required:false, default: "" },
  lisenceNo: { type: String,required:true, default: "" },
});

module.exports = mongoose.model("Company", CompanySchema);