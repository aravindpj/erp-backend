const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth.middleware")
const clientController = require('../controllers/client.controller');

// @route   POST api/client
// @desc    Register user
// @access  Public
router.post('/',auth,clientController.register);
router.get('/',auth,clientController.getClients);
router.put('/',auth,clientController.updateClient);
router.delete('/:id',auth,clientController.deleteClients);
module.exports = router


