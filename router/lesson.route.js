const express = require("express");
const router = express.Router();
const LessonController = require("../controllers/LessonController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", LessonController.getAllLessons);
router.get("/:id", LessonController.getLessonById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, LessonController.createLesson);
router.put("/:id", authenticateToken, isAdmin, LessonController.updateLesson);
router.delete("/:id", authenticateToken, isAdmin, LessonController.deleteLesson);

module.exports = router; 