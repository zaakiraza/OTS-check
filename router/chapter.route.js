const express = require("express");
const router = express.Router();
const ChapterController = require("../controllers/ChapterController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", ChapterController.getAllChapters);
router.get("/:id", ChapterController.getChapterById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, ChapterController.createChapter);
router.put("/:id", authenticateToken, isAdmin, ChapterController.updateChapter);
router.delete("/:id", authenticateToken, isAdmin, ChapterController.deleteChapter);

module.exports = router; 