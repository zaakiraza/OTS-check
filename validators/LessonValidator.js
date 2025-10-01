const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class LessonValidator extends BaseValidator {
  validateCreateLesson = (lesson) => {
    const schema = Joi.object().keys({
      title: Joi.string().required().min(2).max(200),
      chapterId: Joi.number().integer().required(),
      description: Joi.string().allow(null, ''),
      duration: Joi.number().integer().min(0).allow(null),
      contentUrl: Joi.string().uri().allow(null, ''),
      videoUrls: Joi.array().items(Joi.string().uri()).allow(null)
    });

    return this.validate(schema, lesson);
  };

  validateUpdateLesson = (lesson) => {
    const schema = Joi.object().keys({
      title: Joi.string().min(2).max(200),
      chapterId: Joi.number().integer(),
      description: Joi.string().allow(null, ''),
      duration: Joi.number().integer().min(0).allow(null),
      contentUrl: Joi.string().uri().allow(null, ''),
      videoUrls: Joi.array().items(Joi.string().uri()).allow(null)
    });

    return this.validate(schema, lesson);
  };
}

module.exports = new LessonValidator(); 