const User = require("../models/User.model");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  const {
    id,
    userName,
    email,
    password,
    designation,
    department,
    userRole,
    imageUrl = "",
  } = req.body;
  console.log(req.body);
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
      id,
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
    await user.save();
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.error({ message: "Invalid credentials", status: 400 });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.error({ message: "Invalid credentials", status: 400 });
    }

    user?.password && (user.password = null);

    const payload = { user };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.success({ data: { token, user } });
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
    if (err.kind === "ObjectId") {
      return res.error({ status: 404, message: "User not found", error });
    }
    res.status(500).send("Server error");
  }
};

exports.updateUser = async (req, res) => {
  // Build user object
  const userFields = {};
  try {
    let user = await User.findOne({ id: req.body.id }).select("-password");
    if (!user) return res.error({ status: 404, message: "User not found" });
    for (let key in user) {
      if (req.body[key]) userFields[key] = req.body[key];
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

    res.success({ status: 200, message: "Updated successfully", data: user });
  } catch (error) {
    console.log(error);
    res.error({ status: 500, error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if user owns the account
    if (user.id.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await User.findByIdAndRemove(req.params.id);

    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server error");
  }
};
