const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/QuizController.js");
const authenticateToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// Quiz Management Routes (Admin/Teacher)
// 1. Create Quiz
router.post("/", authenticateToken, isAdmin, QuizController.createQuiz);

// 2. Update Quiz
router.put("/:quizId", authenticateToken, isAdmin, QuizController.updateQuiz);

// 3. Delete Quiz
router.delete(
  "/:quizId",
  authenticateToken,
  isAdmin,
  QuizController.deleteQuiz
);

// 4. Add Question (with options & correctOption)
router.post(
  "/:quizId/questions",
  authenticateToken,
  isAdmin,
  QuizController.addQuestion
);

// 10. Publish/Unpublish Quiz
router.put(
  "/:quizId/publish",
  authenticateToken,
  isAdmin,
  QuizController.publishQuiz
);

// 11. List Attempts for a Quiz (teacher view)
router.get(
  "/:quizId/attempts",
  authenticateToken,
  isAdmin,
  QuizController.getQuizAttempts
);

// 12. Quiz Stats (teacher)
router.get(
  "/:quizId/stats",
  authenticateToken,
  isAdmin,
  QuizController.getQuizStats
);

// Question Management Routes (Admin/Teacher)
// 5. Update Question
router.put(
  "/questions/:questionId",
  authenticateToken,
  isAdmin,
  QuizController.updateQuestion
);

// 6. Add Option
router.post(
  "/questions/:questionId/options",
  authenticateToken,
  isAdmin,
  QuizController.addOption
);

// 9. Set Correct Option
router.put(
  "/questions/:questionId/correct",
  authenticateToken,
  isAdmin,
  QuizController.setCorrectOption
);

router.get(
  "/questions",
  authenticateToken,
  isAdmin,
  QuizController.getAllQuestions
);
router.get(
  "/questions/questionswithOpt",
  authenticateToken,
  isAdmin,
  QuizController.getAllQuestionsWithOptions
);

// Option Management Routes (Admin/Teacher)
// 7. Update Option
router.put(
  "/options/:optionId",
  authenticateToken,
  isAdmin,
  QuizController.updateOption
);

// 8. Delete Option
router.delete(
  "/options/:optionId",
  authenticateToken,
  isAdmin,
  QuizController.deleteOption
);

// Student-Facing Routes
// 13. Get Quiz (play) — no correct answers exposed
router.get(
  "/:entityId/play/chap",
  authenticateToken,
  QuizController.getQuizForPlayByEntity
);

// 13. Get Quiz (play) — no correct answers exposed
router.get("/:quizId/play", authenticateToken, QuizController.getQuizForPlay);

// 14. Start Attempt (optional but recommended)
router.post(
  "/:quizId/attempts/start",
  authenticateToken,
  QuizController.startAttempt
);

// 15. Submit Attempt
router.post(
  "/:quizId/attempts/:attemptId/submit",
  authenticateToken,
  QuizController.submitAttempt
);

// Attempt Management Routes
// 16. Get Attempt by ID
router.get(
  "/attempts/:attemptId",
  authenticateToken,
  QuizController.getAttemptById
);

// 17. List Attempts for a Student (self)
router.get(
  "/students/:studentId/attempts",
  authenticateToken,
  QuizController.getStudentAttempts
);

module.exports = router;
