const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class CategoryValidator extends BaseValidator {
  validateCreateCategory = (category) => {
    const schema = Joi.object().keys({
      name: Joi.string().required().min(2).max(100),
      imageUrl: Joi.string().allow(null, ''),
    });

    return this.validate(schema, category);
  };

  validateUpdateCategory = (category) => {
    const schema = Joi.object().keys({
      name: Joi.string().min(2).max(100),
      imageUrl: Joi.string().allow(null, ''),
    });

    return this.validate(schema, category);
  };
}

module.exports = new CategoryValidator(); 