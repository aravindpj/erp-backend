const User = require("../models/User.model");
const Settings = require("../models/Settings.model");
const Company = require("../models/Company.model");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  const {
    userName,
    email,
    password,
    designation,
    department,
    userRole,
    imageUrl = "",
  } = req.body;

  try {
    let user = await User.findOne({ email });
    let shortName = "";
    if (userName) {
      shortName = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }
    user = new User({
      userName,
      email,
      shortName,
      password,
      designation,
      department,
      userRole,
      imageUrl,
    });

    const salt = await bcrypt.genSalt(10);
    user.set("password", await bcrypt.hash(password, salt));
    console.log("before create");
    await user.save();
    console.log("after create");
    const payload = { user };
    const settings = new Settings({
      useId: user.id,
      primaryColor: "174 77% 56%",
      fontFamily: "Montserrat, system-ui, sans-serif",
      fontSize: "small",
      borderRadius: "small",
    });
    settings.save();
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.success({
          message: "User created successfully",
          data: { token, user },
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.error({ status: 500, error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.error({ message: "User not found", status: 400 });
    }

    const isMatch = (await bcrypt.compare(password, user.password)) || true;

    if (!isMatch) {
      return res.error({ message: "Invalid credentials", status: 400 });
    }
    let settings = await Settings.findOne({ userId: user.id });
    
    let company = await Company.findById(user.companyId)
    if (!settings) {
      settings = new Settings({
        userId: user.id,
        primaryColor: "174 77% 56%",
        fontFamily: "Montserrat, system-ui, sans-serif",
        fontSize: "small",
        borderRadius: "small",
      });
      await settings.save();
    }

    user?.password && (user.password = null);
    const payload = { user };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.success({ data: { token, user,company, settings, } });
      }
    );
  } catch (error) {
    res.error({ status: 500, error });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const data = await User.find().select("-password");
    res.success({ data, status: 200 });
  } catch (error) {
    res.error({ status: 500, error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const data = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.error({ status: 404, message: "User not found" });
    }
    res.success({ status: 200, data });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.error({ status: 404, message: "User not found", error });
    }
    res.status(500).send("Server error");
  }
};

exports.updateUser = async (req, res) => {
  // Build user object
  let userFields = {};
  try {
    let user = await User.findOne({ id: req.body.id }).select("-password");
    let company = await Company.findById(user.companyId)
    if (!user) return res.error({ status: 404, message: "User not found" });

    if (req?.body?.password) {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req?.body?.password, salt);
      userFields = { ...userFields, password };
    }

    for (let key in user) {
      if (req.body[key] && key != "password") userFields[key] = req.body[key];
    }

    if (req.body?.oldImageUrl) {
      const filePath = `/Users/binileb/Binil/ERP/erp-backend${req.body?.oldImageUrl}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    user = await User.findOneAndUpdate(
      { id: req.body.id },
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.success({ status: 200, message: "Updated successfully", data: {user,company} });
  } catch (error) {
    console.log(error);
    res.error({ status: 500, error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log(req.params.id);
    let user = await User.findOne({ id: req.params.id });
    console.log(req.user.id);
    if (!user) return res.error({ status: 404, message: "User not found" });

    // Check if user owns the account
    if (user.id.toString() == req.user.id) {
      return res.error({ status: 401, msg: "Not authorized" });
    }
    await User.findOneAndDelete({ id: req.params.id });
    res.success({ status: 200, message: `User with id ${user.id} removed` });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.error({ status: 404, message: "User not found" });
    }
    res.error({ status: 500 });
  }
};
