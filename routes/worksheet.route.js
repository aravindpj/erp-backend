const express = require('express');
const router = express.Router();
const worksheetController = require('../controllers/worksheet.controller');
const auth = require('../middleware/auth.middleware');

router.post("/",auth,worksheetController.createWorksheet)
router.get("/list",auth,worksheetController.getAllSheetList)
router.get("/",auth,worksheetController.getAllSheets)
router.get("/:id",auth,worksheetController.getWorksheet)
router.put("/",auth,worksheetController.updateWorkSheet)
router.get("/record/:id",auth,worksheetController.getWorksheetRecord)
router.post("/record",auth,worksheetController.saveWorkSheetRecord)
router.put("/record",auth,worksheetController.updateWorksheetRecord)
router.get("/record-data/:id",auth,worksheetController.getWorksheetRecordData)


module.exports = router;