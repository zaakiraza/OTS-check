const express = require("express");
const router = express.Router();
const SubjectRatingController = require("../controllers/SubjectRatingController.js");
const authenticateToken = require("../middlewares/auth.middleware");

// Public routes
router.get("/subject/:subjectId", SubjectRatingController.getSubjectRatings);

// Protected routes (authenticated users only)
router.post("/", authenticateToken, SubjectRatingController.rateSubject);
router.get("/user/:subjectId", authenticateToken, SubjectRatingController.getUserRating);
router.delete("/:subjectId", authenticateToken, SubjectRatingController.deleteRating);

module.exports = router; 