const express = require("express");
const router = express.Router();
const SubjectController = require("../controllers/SubjectController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes
router.get("/", SubjectController.getAllSubjects);
router.get("/:id", SubjectController.getSubjectById);

// Protected routes (admin only)
router.post("/", authenticateToken, isAdmin, SubjectController.createSubject);
router.put("/:id", authenticateToken, isAdmin, SubjectController.updateSubject);
router.delete("/:id", authenticateToken, isAdmin, SubjectController.deleteSubject);

module.exports = router; 