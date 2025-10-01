const express = require("express");
const router = express.Router();
const EnrollmentController = require("../controllers/EnrollmentController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Public routes - none

// Protected routes (authenticated users only)
router.get("/", authenticateToken, EnrollmentController.getAllEnrollments);
router.get("/:id", authenticateToken, EnrollmentController.getEnrollmentById);
router.get("/student/:studentId", authenticateToken, EnrollmentController.getEnrollmentsByStudent);

// Student can create their own enrollment
router.post("/", authenticateToken, EnrollmentController.createEnrollment);

// Admin only routes
// router.put("/:id", authenticateToken, isAdmin, EnrollmentController.updateEnrollment);
router.delete("/:id", authenticateToken, isAdmin, EnrollmentController.deleteEnrollment);

module.exports = router; 