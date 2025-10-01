const express = require('express');
const router = express.Router();
const HelpController = require('../controllers/HelpController.js');
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public Routes
router.post('/', HelpController.createHelp);

// Protected Routes
router.get('/', authenticateToken, isAdmin, HelpController.getAllHelps);
router.get('/:id', authenticateToken, isAdmin, HelpController.getHelpById);
router.delete('/:id', authenticateToken, isAdmin, HelpController.deleteHelp);

module.exports = router;