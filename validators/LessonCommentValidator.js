const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class LessonCommentValidator extends BaseValidator {
  validateCreateComment = (comment) => {
    const schema = Joi.object().keys({
      lessonId: Joi.number().integer().required(),
      userId: Joi.number().integer().required(),
      parentId: Joi.number().integer().allow(null),
      content: Joi.string().required().min(1).max(5000),
    });

    return this.validate(schema, comment);
  };

  validateUpdateComment = (comment) => {
    const schema = Joi.object().keys({
      content: Joi.string().required().min(1).max(5000),
    });

    return this.validate(schema, comment);
  };
}

module.exports = new LessonCommentValidator(); 