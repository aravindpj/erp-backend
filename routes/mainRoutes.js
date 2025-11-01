const express = require('express');
const upload = require("../config/multer.config")
const router = express.Router();
router.use("/users",upload.single("file"),require("./users.route"))
router.use("/client",upload.single("file"),require("./client.route"))
router.use("/job",upload.single("file"),require("./job.routes"))

module.exports = router