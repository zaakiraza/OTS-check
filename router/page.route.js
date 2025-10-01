// page.route.js
const express = require('express');
const router = express.Router();
const PageController = require('../controllers/PageController.js');
const authenticateToken = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/admin.middleware');

// Public Routes
router.get('/:slug', PageController.getPageBySlug);  // Get page by slug (e.g., privacy-policy or terms-conditions)

// Admin Routes (authentication required)
router.get('/titles/all', authenticateToken, isAdmin, PageController.getAllPageTitles);

router.post('/', authenticateToken, isAdmin, PageController.createOrUpdatePage);  // Create or update Privacy Policy or Terms & Conditions
router.delete('/:slug', authenticateToken, isAdmin, PageController.deletePageSlug);  // Delete Privacy Policy or Terms & Conditions

module.exports = router;
