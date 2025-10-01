const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class QuizValidator extends BaseValidator {
  validateCreateQuiz = (quiz) => {
    const schema = Joi.object().keys({
      title: Joi.string().min(1).max(255).optional(),
      entityType: Joi.string().valid("Lesson", "Chapter").optional(),
      entityId: Joi.number().integer().positive().required(),
      timeLimitSec: Joi.number().integer().positive().optional(),
      isActive: Joi.boolean().optional().default(true),
    });

    return this.validate(schema, quiz);
  };

  validateUpdateQuiz = (quiz) => {
    const schema = Joi.object().keys({
      title: Joi.string().min(1).max(255).optional(),
      entityType: Joi.string().valid("Lesson", "Chapter").optional(),
      entityId: Joi.number().integer().positive().optional(),
      timeLimitSec: Joi.number().integer().positive().optional(),
      isActive: Joi.boolean().optional(),
    });

    return this.validate(schema, quiz);
  };

  validatePublishQuiz = (data) => {
    const schema = Joi.object().keys({
      isActive: Joi.boolean().required(),
    });

    return this.validate(schema, data);
  };

  validateAddQuestion = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string().min(1).required(),
      points: Joi.number().positive().optional().default(1),
      options: Joi.array()
        .items(
          Joi.object().keys({
            text: Joi.string().min(1).required(),
          })
        )
        .min(2)
        .required(),
      correctOptionIndex: Joi.number().integer().min(0).required(),
    });

    return this.validate(schema, data);
  };

  validateUpdateQuestion = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string().min(1).optional(),
      points: Joi.number().positive().optional(),
    });

    return this.validate(schema, data);
  };

  validateAddOption = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string().min(1).required(),
    });

    return this.validate(schema, data);
  };

  validateUpdateOption = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string().min(1).required(),
    });

    return this.validate(schema, data);
  };

  validateSetCorrectOption = (data) => {
    const schema = Joi.object().keys({
      correctOptionId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, data);
  };

  validateStartAttempt = (data) => {
    const schema = Joi.object().keys({
      studentId: Joi.number().integer().positive().optional(), // Can be extracted from auth token
    });

    return this.validate(schema, data);
  };

  validateSubmitAttempt = (data) => {
    const schema = Joi.object().keys({
      studentId: Joi.number().integer().positive().required(),
      answers: Joi.array()
        .items(
          Joi.object().keys({
            questionId: Joi.number().integer().positive().required(),
            selectedOptionId: Joi.number().integer().positive().optional(),
          })
        )
        .min(1)
        .required(),
    });

    return this.validate(schema, data);
  };

  validatePagination = (data) => {
    const schema = Joi.object().keys({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(100).optional().default(10),
    });

    return this.validate(schema, data);
  };

  validateQuizId = (params) => {
    const schema = Joi.object().keys({
      quizId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, params);
  };

  validateQuestionId = (params) => {
    const schema = Joi.object().keys({
      questionId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, params);
  };

  validateOptionId = (params) => {
    const schema = Joi.object().keys({
      optionId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, params);
  };

  validateAttemptId = (params) => {
    const schema = Joi.object().keys({
      attemptId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, params);
  };

  validateStudentId = (params) => {
    const schema = Joi.object().keys({
      studentId: Joi.number().integer().positive().required(),
    });

    return this.validate(schema, params);
  };

  validateEntityId = (params) => {
    const schema = Joi.object().keys({
      entityId: Joi.number().integer().positive().required(),
    });
    return this.validate(schema, params);
  };
}

module.exports = new QuizValidator();
