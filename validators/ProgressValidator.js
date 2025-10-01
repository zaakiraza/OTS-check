const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class ProgressValidator extends BaseValidator {
  validateCreateProgress = (progress) => {
    const schema = Joi.object().keys({
      enrollmentId: Joi.number().integer().required(),
      subcategoryId: Joi.number().integer().required(),
      progress: Joi.object().required(),
      completionPercentage: Joi.number().min(0).max(100).optional(),
      lastAccessedAt: Joi.date().optional()
    });

    return this.validate(schema, progress);
  };

  validateUpdateProgress = (progress) => {
    const schema = Joi.object().keys({
      progress: Joi.object().optional(),
      completionPercentage: Joi.number().min(0).max(100).optional(),
      lastAccessedAt: Joi.date().optional()
    });

    return this.validate(schema, progress);
  };

  validateUpdateLessonProgress = (data) => {
    const schema = Joi.object().keys({
      subjectId: Joi.number().integer().required(),
      chapterId: Joi.number().integer().required(),
      lessonId: Joi.number().integer().required(),
      status: Joi.number().integer().min(0).max(100).required()
    });

    return this.validate(schema, data);
  };
}

module.exports = new ProgressValidator(); 