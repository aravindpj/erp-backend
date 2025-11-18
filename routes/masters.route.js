const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth.middleware")
const masterController = require("../controllers/master.controller")
router.get("/:master",auth,masterController.getMasters)
router.delete("/:master",auth,masterController.deleteMasters)
router.post("/designation",auth,masterController.saveDesignation)
router.post("/department",auth,masterController.saveDepartment)
router.post("/userrole",auth,masterController.saveUserRole)

module.exports = router