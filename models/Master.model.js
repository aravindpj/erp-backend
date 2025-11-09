const mongoose = require("mongoose");
const moment = require("moment");
module.exports = {
  DesignationSchema: mongoose.model(
    "Designation",
    new mongoose.Schema({
      label: {
        type: String,
        required: true,
        unique: true,
      },
      createdAt: {
        type: String,
        default: moment().format("DD-MM-YYYY hh:mm A"),
      },
    })
  ),
  DepartmentSchema: mongoose.model(
    "Department",
    new mongoose.Schema({
      label: {
        type: String,
        required: true,
        unique: true,
      },
      createdAt: {
        type: String,
        default: moment().format("DD-MM-YYYY hh:mm A"),
      },
    })
  ),
  UserRolesSchema: mongoose.model(
    "UserRole",
    new mongoose.Schema({
      label: {
        type: String,
        required: true,
        unique: true,
      },
      createdAt: {
        type: String,
        default: moment().format("DD-MM-YYYY hh:mm A"),
      },
    })
  ),
};
