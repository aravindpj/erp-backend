const express = require('express');
const router = express.Router();
const notification = require("../controllers/notification.controller")
router.get("/:id",notification.getNotification)
router.put("/:id",notification.updateNotification)
module.exports = router;