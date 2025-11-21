const express = require('express');
const upload = require("../config/multer.config")
const router = express.Router();
router.use("/users",upload.single("file"),require("./users.route"))
router.use("/client",upload.single("file"),require("./client.route"))
router.use("/job",upload.single("file"),require("./job.routes"))
router.use("/worksheet",upload.single("file"),require("./worksheet.route"))
router.use("/report",require("./reports.route"))
router.use("/masters",require("./masters.route"))
router.use("/settings",require("./settings.routes"))
router.use("/company",require("./company.routes"))
router.post("/dummy",require("../controllers/dummy.controller").dummyController)
router.use("/notification",require("./notification.routes"))
module.exports = router