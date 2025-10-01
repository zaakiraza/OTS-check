const express = require("express");
const router = express.Router();
const LessonCommentController = require("../controllers/LessonCommentController.js");
const authenticateToken = require("../middlewares/auth.middleware");

// Public routes - Get comments
router.get("/lesson/:lessonId", LessonCommentController.getAllCommentsForLesson);
router.get("/:id", LessonCommentController.getCommentById);

// Protected routes - Create, update, delete comments
router.post("/", authenticateToken, LessonCommentController.createComment);
router.put("/:id", authenticateToken, LessonCommentController.updateComment);
router.delete("/:id", authenticateToken, LessonCommentController.deleteComment);

module.exports = router; 