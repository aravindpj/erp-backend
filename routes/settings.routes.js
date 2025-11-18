const express = require('express');
const router = express.Router();
const SettingsController = require("../controllers/settings.controller")
router.put("/",SettingsController.saveSettings)
router.get("/:id",SettingsController.getSettings)
module.exports = router