const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class SubCategoryValidator extends BaseValidator {
  validateCreateSubCategory = (subCategory) => {
    const schema = Joi.object().keys({
      name: Joi.string().required().min(2).max(100),
      categoryId: Joi.number().integer().required(),
    });

    return this.validate(schema, subCategory);
  };

  validateUpdateSubCategory = (subCategory) => {
    const schema = Joi.object().keys({
      name: Joi.string().min(2).max(100),
      categoryId: Joi.number().integer(),
    });

    return this.validate(schema, subCategory);
  };
}

module.exports = new SubCategoryValidator(); 