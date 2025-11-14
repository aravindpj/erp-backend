const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const worksheetReport = require('../controllers/worksheetfile.controller');
router.get("/worksheet",auth,worksheetReport.generateWorksheetPdf)

module.exports = router;