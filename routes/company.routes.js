const express = require('express');
const router = express.Router();
const companyController = require("../controllers/company.controller")
router.post("/",companyController.saveCompany)
router.put("/",companyController.updateCompany)
router.get("/",companyController.getCompany)

module.exports = router