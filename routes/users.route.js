
const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const auth = require('../middleware/auth.middleware');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register',auth,userController.register);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', userController.login);

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', auth,userController.getUsers);

// @route   GET api/users/:id
// @desc    Get user by id
// @access  Private
router.get('/:id', auth, userController.getUserById);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private
router.put('/', auth, userController.updateUser);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
