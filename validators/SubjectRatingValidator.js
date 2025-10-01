const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class SubjectRatingValidator extends BaseValidator {
  validateCreateRating = (rating) => {
    const schema = Joi.object().keys({
      subjectId: Joi.number().integer().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().allow(null, '')
    });

    return this.validate(schema, rating);
  };

  validateUpdateRating = (rating) => {
    const schema = Joi.object().keys({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().allow(null, '')
    });

    return this.validate(schema, rating);
  };
}

module.exports = new SubjectRatingValidator(); 