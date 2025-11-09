const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth.middleware")
const jobController = require("../controllers/job.controller")
// @route   POST api/client
// @desc    Register user
// @access  Public
router.post('/',auth,jobController.saveJobRequest);
router.get('/:id',auth,jobController.getJobRequests);
router.get('/details/:id',jobController.getJobDetails);
router.put('/',auth,jobController.updateJobRequest);

module.exports = router


