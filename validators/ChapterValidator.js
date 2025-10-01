const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class ChapterValidator extends BaseValidator {
  validateCreateChapter = (chapter) => {
    const schema = Joi.object().keys({
      title: Joi.string().required().min(2).max(200),
      subjectId: Joi.number().integer().required(),
      description: Joi.string().allow(null, ''),
      duration: Joi.number().integer().min(0).allow(null),
      imageUrl: Joi.string().uri().allow(null, '')
    });

    return this.validate(schema, chapter);
  };

  validateUpdateChapter = (chapter) => {
    const schema = Joi.object().keys({
      title: Joi.string().min(2).max(200),
      subjectId: Joi.number().integer(),
      description: Joi.string().allow(null, ''),
      duration: Joi.number().integer().min(0).allow(null),
      imageUrl: Joi.string().uri().allow(null, '')
    });

    return this.validate(schema, chapter);
  };
}

module.exports = new ChapterValidator(); 