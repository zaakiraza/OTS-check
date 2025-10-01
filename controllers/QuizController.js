const BaseController = require("./BaseController.js");
const QuizRepo = require("../repos/QuizRepo.js");
const QuestionRepo = require("../repos/QuestionRepo.js");
const OptionRepo = require("../repos/OptionRepo.js");
const QuizAttemptRepo = require("../repos/QuizAttemptRepo.js");
const AttemptAnswerRepo = require("../repos/AttemptAnswerRepo.js");
const QuizValidator = require("../validators/QuizValidator.js");
const db = require("../models/index.js");

class QuizController extends BaseController {
  constructor() {
    super();
  }

  // 1. Create Quiz
  createQuiz = async (req, res) => {
    try {
      const validationResult = QuizValidator.validateCreateQuiz(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const quiz = await QuizRepo.createQuiz(validationResult.data);

      return this.successResponse(201, res, quiz, "Quiz created successfully");
    } catch (error) {
      console.error("Error creating quiz:", error);
      return this.serverErrorResponse(res, "Failed to create quiz");
    }
  };

  // 2. Update Quiz
  updateQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateUpdateQuiz(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      await QuizRepo.updateQuiz(validationResult.data, {
        where: { id: quizId },
      });

      const updatedQuiz = await QuizRepo.findQuiz({ where: { id: quizId } });

      return this.successResponse(
        200,
        res,
        updatedQuiz,
        "Quiz updated successfully"
      );
    } catch (error) {
      console.error("Error updating quiz:", error);
      return this.serverErrorResponse(res, "Failed to update quiz");
    }
  };

  // 3. Delete Quiz
  deleteQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      await QuizRepo.deleteQuiz({ where: { id: quizId } });

      return this.successResponse(204, res, null, "Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      return this.serverErrorResponse(res, "Failed to delete quiz");
    }
  };

  // 4. Add Question (with options & correctOption)
  addQuestion = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateAddQuestion(req.body);

      if (!validationResult.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, validationResult.message);
      }

      // Check if quiz exists
      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });
      if (!quiz) {
        await transaction.rollback();
        return this.errorResponse(404, res, "Quiz not found");
      }

      const { text, points, options, correctOptionIndex } =
        validationResult.data;

      // Validate correctOptionIndex
      if (correctOptionIndex >= options.length) {
        await transaction.rollback();
        return this.errorResponse(400, res, "Invalid correct_option_index");
      }

      const questionData = {
        quizId: parseInt(quizId),
        text,
        points: points || 1.0,
      };

      const result = await QuestionRepo.createQuestionWithOptions(
        questionData,
        options,
        correctOptionIndex,
        transaction
      );

      await transaction.commit();

      return this.successResponse(
        201,
        res,
        {
          questionId: result.question.id,
          optionIds: result.options.map((opt) => opt.id),
          correctOptionId: result.correctOption
            ? result.correctOption.id
            : null,
        },
        "Question created successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error adding question:", error);
      return this.serverErrorResponse(res, "Failed to add question");
    }
  };

  // Get All Questions
  getAllQuestions = async (req, res) => {
    try {
      const questions = await QuestionRepo.findAllQuestions({});

      return this.successResponse(
        200,
        res,
        questions,
        "Questions retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
      return this.serverErrorResponse(res, "Failed to retrieve questions");
    }
  };

  getAllQuestionsWithOptions = async (req, res) => {
    try {
      const questions = await QuestionRepo.findAllQuestionsWithOptions({});

      return this.successResponse(
        200,
        res,
        questions,
        "Questions retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching questions:", error);
      return this.serverErrorResponse(res, "Failed to retrieve questions");
    }
  };

  // 5. Update Question
  updateQuestion = async (req, res) => {
    try {
      const { questionId } = req.params;
      const paramValidation = QuizValidator.validateQuestionId({ questionId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateUpdateQuestion(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const question = await QuestionRepo.findQuestion({
        where: { id: questionId },
      });

      if (!question) {
        return this.errorResponse(404, res, "Question not found");
      }

      await QuestionRepo.updateQuestion(validationResult.data, {
        where: { id: questionId },
      });

      const updatedQuestion = await QuestionRepo.findQuestion({
        where: { id: questionId },
      });

      return this.successResponse(
        200,
        res,
        {
          id: updatedQuestion.id,
          quizId: updatedQuestion.quizId,
          text: updatedQuestion.text,
          points: updatedQuestion.points,
        },
        "Question updated successfully"
      );
    } catch (error) {
      console.error("Error updating question:", error);
      return this.serverErrorResponse(res, "Failed to update question");
    }
  };

  // 6. Add Option
  addOption = async (req, res) => {
    try {
      const { questionId } = req.params;
      const paramValidation = QuizValidator.validateQuestionId({ questionId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateAddOption(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      // Check if question exists
      const question = await QuestionRepo.findQuestion({
        where: { id: questionId },
      });
      if (!question) {
        return this.errorResponse(404, res, "Question not found");
      }

      const optionData = {
        questionId: parseInt(questionId),
        text: validationResult.data.text,
      };

      const option = await OptionRepo.createOption(optionData);

      return this.successResponse(
        201,
        res,
        {
          id: option.id,
          questionId: option.questionId,
          text: option.text,
        },
        "Option created successfully"
      );
    } catch (error) {
      console.error("Error adding option:", error);
      return this.serverErrorResponse(res, "Failed to add option");
    }
  };

  // 7. Update Option
  updateOption = async (req, res) => {
    try {
      const { optionId } = req.params;
      const paramValidation = QuizValidator.validateOptionId({ optionId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateUpdateOption(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const option = await OptionRepo.findOption({ where: { id: optionId } });

      if (!option) {
        return this.errorResponse(404, res, "Option not found");
      }

      await OptionRepo.updateOption(validationResult.data, {
        where: { id: optionId },
      });

      const updatedOption = await OptionRepo.findOption({
        where: { id: optionId },
      });

      return this.successResponse(
        200,
        res,
        {
          id: updatedOption.id,
          questionId: updatedOption.questionId,
          text: updatedOption.text,
        },
        "Option updated successfully"
      );
    } catch (error) {
      console.error("Error updating option:", error);
      return this.serverErrorResponse(res, "Failed to update option");
    }
  };

  // 8. Delete Option
  deleteOption = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { optionId } = req.params;
      const paramValidation = QuizValidator.validateOptionId({ optionId });

      if (!paramValidation.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const option = await OptionRepo.findOption({ where: { id: optionId } });

      if (!option) {
        await transaction.rollback();
        return this.errorResponse(404, res, "Option not found");
      }

      // Check if option can be safely deleted
      const canDelete = await OptionRepo.canDeleteOption(optionId);
      if (!canDelete) {
        await transaction.rollback();
        return this.errorResponse(
          400,
          res,
          "Cannot delete option that is currently set as correct answer"
        );
      }

      await OptionRepo.deleteOption({ where: { id: optionId } });
      await transaction.commit();

      return this.successResponse(
        204,
        res,
        null,
        "Option deleted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting option:", error);
      return this.serverErrorResponse(res, "Failed to delete option");
    }
  };

  // 9. Set Correct Option
  setCorrectOption = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { questionId } = req.params;
      const paramValidation = QuizValidator.validateQuestionId({ questionId });

      if (!paramValidation.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validateSetCorrectOption(req.body);

      if (!validationResult.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, validationResult.message);
      }

      const question = await QuestionRepo.findQuestion({
        where: { id: questionId },
      });

      if (!question) {
        await transaction.rollback();
        return this.errorResponse(404, res, "Question not found");
      }

      const { correctOptionId } = validationResult.data;

      await QuestionRepo.setCorrectOption(
        questionId,
        correctOptionId,
        transaction
      );
      await transaction.commit();

      return this.successResponse(
        200,
        res,
        {
          questionId: parseInt(questionId),
          correctOptionId: correctOptionId,
        },
        "Correct option set successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error setting correct option:", error);

      if (error.message === "Option does not belong to this question") {
        return this.errorResponse(400, res, error.message);
      }

      return this.serverErrorResponse(res, "Failed to set correct option");
    }
  };

  // 10. Publish/Unpublish Quiz
  publishQuiz = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const validationResult = QuizValidator.validatePublishQuiz(req.body);

      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      await QuizRepo.updateQuiz(
        { isActive: validationResult.data.isActive },
        { where: { id: quizId } }
      );

      return this.successResponse(
        200,
        res,
        {
          id: parseInt(quizId),
          isActive: validationResult.data.isActive,
        },
        "Quiz status updated successfully"
      );
    } catch (error) {
      console.error("Error updating quiz status:", error);
      return this.serverErrorResponse(res, "Failed to update quiz status");
    }
  };

  // 11. List Attempts for a Quiz (teacher view)
  getQuizAttempts = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const paginationValidation = QuizValidator.validatePagination(req.query);
      if (!paginationValidation.status) {
        return this.validationErrorResponse(res, paginationValidation.message);
      }

      const { page, limit } = paginationValidation.data;
      const offset = (page - 1) * limit;

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });
      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      const attempts = await QuizRepo.getQuizAttempts({
        where: { quizId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      const totalAttempts = await QuizAttemptRepo.count({ where: { quizId } });
      const totalPages = Math.ceil(totalAttempts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        attempts,
        pagination: {
          totalAttempts,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };

      return this.successResponse(
        200,
        res,
        response,
        "Quiz attempts retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      return this.serverErrorResponse(res, "Failed to retrieve quiz attempts");
    }
  };

  // 12. Quiz Stats (teacher)
  getQuizStats = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });
      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      const stats = await QuizRepo.getQuizStats(quizId);

      return this.successResponse(
        200,
        res,
        stats,
        "Quiz statistics retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      return this.serverErrorResponse(
        res,
        "Failed to retrieve quiz statistics"
      );
    }
  };

  // 13. Get Quiz (play) — no correct answers exposed
  getQuizForPlay = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const quiz = await QuizRepo.findQuizWithQuestions({
        where: { id: quizId },
      });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      if (!quiz.isActive) {
        return this.errorResponse(400, res, "Quiz is not active");
      }

      const response = {
        id: quiz.id,
        title: quiz.title,
        entityType: quiz.entityType,
        entityId: quiz.entityId,
        timeLimitSec: quiz.timeLimitSec,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          text: question.text,
          points: question.points,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
          })),
        })),
      };

      return this.successResponse(
        200,
        res,
        response,
        "Quiz retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching quiz for play:", error);
      return this.serverErrorResponse(res, "Failed to retrieve quiz");
    }
  };

  getQuizForPlayByEntity = async (req, res) => {
    try {
      const { entityId } = req.params;
      console.log("Fetching quiz for play by entity:", entityId);
      const paramValidation = QuizValidator.validateEntityId({ entityId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const quiz = await QuizRepo.findQuizWithQuestions({
        where: { entityId: entityId },
      });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      if (!quiz.isActive) {
        return this.errorResponse(400, res, "Quiz is not active");
      }

      const response = {
        id: quiz.id,
        title: quiz.title,
        entityType: quiz.entityType,
        entityId: quiz.entityId,
        timeLimitSec: quiz.timeLimitSec,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          text: question.text,
          points: question.points,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
          })),
        })),
      };

      return this.successResponse(
        200,
        res,
        response,
        "Quiz retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching quiz for play by entity:", error);
      return this.serverErrorResponse(res, "Failed to retrieve quiz");
    }
  };

  // 14. Start Attempt (optional but recommended)
  startAttempt = async (req, res) => {
    try {
      const { quizId } = req.params;
      const paramValidation = QuizValidator.validateQuizId({ quizId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const quiz = await QuizRepo.findQuiz({ where: { id: quizId } });

      if (!quiz) {
        return this.errorResponse(404, res, "Quiz not found");
      }

      if (!quiz.isActive) {
        return this.errorResponse(400, res, "Quiz is not active");
      }

      // For now, using a dummy studentId - in real implementation, extract from auth token
      const studentId = req.body.studentId || req.user?.id || 1;

      const attemptData = {
        quizId: parseInt(quizId),
        studentId: studentId,
        startedAt: new Date(),
      };

      const attempt = await QuizAttemptRepo.createAttempt(attemptData);

      return this.successResponse(
        201,
        res,
        {
          attemptId: attempt.id,
          quizId: attempt.quizId,
          studentId: attempt.studentId,
          startedAt: attempt.startedAt,
        },
        "Quiz attempt started successfully"
      );
    } catch (error) {
      console.error("Error starting attempt:", error);
      return this.serverErrorResponse(res, "Failed to start quiz attempt");
    }
  };

  // 15. Submit Attempt
  submitAttempt = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { quizId, attemptId } = req.params;
      const quizValidation = QuizValidator.validateQuizId({ quizId });
      const attemptValidation = QuizValidator.validateAttemptId({ attemptId });

      if (!quizValidation.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, quizValidation.message);
      }

      if (!attemptValidation.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, attemptValidation.message);
      }

      const validationResult = QuizValidator.validateSubmitAttempt(req.body);

      if (!validationResult.status) {
        await transaction.rollback();
        return this.validationErrorResponse(res, validationResult.message);
      }

      const { studentId, answers } = validationResult.data;

      const result = await QuizAttemptRepo.submitAttempt(
        parseInt(attemptId),
        studentId,
        answers,
        transaction
      );

      await transaction.commit();

      return this.successResponse(
        200,
        res,
        result,
        "Quiz attempt submitted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Error submitting attempt:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("inactive quiz") ||
        error.message.includes("already submitted") ||
        error.message.includes("does not belong")
      ) {
        return this.errorResponse(400, res, error.message);
      }

      return this.serverErrorResponse(res, "Failed to submit quiz attempt");
    }
  };

  // 16. Get Attempt by ID
  getAttemptById = async (req, res) => {
    try {
      const { attemptId } = req.params;
      const paramValidation = QuizValidator.validateAttemptId({ attemptId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const attempt = await QuizAttemptRepo.findAttemptWithAnswers({
        where: { id: attemptId },
      });

      if (!attempt) {
        return this.errorResponse(404, res, "Attempt not found");
      }

      const response = {
        id: attempt.id,
        quizId: attempt.quizId,
        studentId: attempt.studentId,
        score: attempt.score,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        durationSec: attempt.durationSec,
        quiz: attempt.quiz,
        student: attempt.student,
        answers: attempt.answers.map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: answer.isCorrect,
          pointsAwarded: answer.pointsAwarded,
          question: answer.question,
          selectedOption: answer.selectedOption,
        })),
      };

      return this.successResponse(
        200,
        res,
        response,
        "Attempt retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching attempt:", error);
      return this.serverErrorResponse(res, "Failed to retrieve attempt");
    }
  };

  // 17. List Attempts for a Student (self)
  getStudentAttempts = async (req, res) => {
    try {
      const { studentId } = req.params;
      const paramValidation = QuizValidator.validateStudentId({ studentId });

      if (!paramValidation.status) {
        return this.validationErrorResponse(res, paramValidation.message);
      }

      const paginationValidation = QuizValidator.validatePagination(req.query);
      if (!paginationValidation.status) {
        return this.validationErrorResponse(res, paginationValidation.message);
      }

      const { page, limit } = paginationValidation.data;
      const offset = (page - 1) * limit;

      const attempts = await QuizAttemptRepo.findStudentAttempts(studentId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalAttempts = await QuizAttemptRepo.count({
        where: { studentId },
      });
      const totalPages = Math.ceil(totalAttempts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response = {
        attempts,
        pagination: {
          totalAttempts,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      };

      return this.successResponse(
        200,
        res,
        response,
        "Student attempts retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching student attempts:", error);
      return this.serverErrorResponse(
        res,
        "Failed to retrieve student attempts"
      );
    }
  };
}

module.exports = new QuizController();
