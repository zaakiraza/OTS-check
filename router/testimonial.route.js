const express = require('express');
const router = express.Router();
const TestimonialController = require('../controllers/TestimonialController.js');
const authenticateToken = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/admin.middleware');

// Public Routes
router.get('/', TestimonialController.getAllTestimonials);

// Admin Routes (authentication required)
router.post('/', authenticateToken, isAdmin, TestimonialController.createTestimonial);
router.put('/:id', authenticateToken, isAdmin, TestimonialController.updateTestimonial);
router.delete('/:id', authenticateToken, isAdmin, TestimonialController.deleteTestimonial);

module.exports = router;