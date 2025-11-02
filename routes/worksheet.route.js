const express = require('express');
const router = express.Router();
const worksheetController = require('../controllers/worksheet.controller');
const auth = require('../middleware/auth.middleware');

router.post("/",auth,worksheetController.createWorksheet)
router.get("/",auth,worksheetController.getAllSheets)
router.put("/",auth,worksheetController.updateWorkSheet)

module.exports = router;