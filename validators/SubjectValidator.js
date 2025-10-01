const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class SubjectValidator extends BaseValidator {
  validateCreateSubject = (subject) => {
    const schema = Joi.object().keys({
      name: Joi.string().required().min(2).max(100),
      subcategoryId: Joi.number().integer().required(),
      instructorId: Joi.number().integer().optional(),
      description: Joi.string().allow(null, ''),
      imageUrl: Joi.string().uri().allow(null, ''),
      rating: Joi.number().min(0).max(5).allow(null)
    });

    return this.validate(schema, subject);
  };

  validateUpdateSubject = (subject) => {
    const schema = Joi.object().keys({
      name: Joi.string().min(2).max(100),
      subcategoryId: Joi.number().integer(),
      instructorId: Joi.number().optional(),
      description: Joi.string().allow(null, ''),
      imageUrl: Joi.string().uri().allow(null, ''),
      rating: Joi.number().min(0).max(5).allow(null)
    });

    return this.validate(schema, subject);
  };
}

module.exports = new SubjectValidator(); 