const express = require("express");
const router = express.Router();
const ProgressController = require("../controllers/ProgressController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes - none

// Protected routes (authenticated users only)
router.get("/", authenticateToken, ProgressController.getAllProgress);
router.get("/:id", authenticateToken, ProgressController.getProgressById);
router.get("/enrollment/:enrollmentId", authenticateToken, ProgressController.getProgressByEnrollment);
router.get("/student/:studentId", authenticateToken, ProgressController.getProgressByStudent);

// Student can update their own progress
router.put("/lesson/:enrollmentId", authenticateToken, ProgressController.updateLessonProgress);

// Admin only routes
// router.put("/:id", authenticateToken, isAdmin, ProgressController.updateProgress);
router.post("/reset/:enrollmentId", authenticateToken, isAdmin, ProgressController.resetProgress);

module.exports = router; 