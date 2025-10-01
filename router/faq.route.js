const express = require("express");
const router = express.Router();
const FaqController = require("../controllers/FaqController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", FaqController.getAllFAQs);
router.get("/:id", FaqController.getFAQById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, FaqController.createFAQ);
router.put("/:id", authenticateToken, isAdmin, FaqController.updateFAQ);
router.delete("/:id", authenticateToken, isAdmin, FaqController.deleteFAQ);

module.exports = router;