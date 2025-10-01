const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class EnrollmentValidator extends BaseValidator {
  validateCreateEnrollment = (enrollment) => {
    const schema = Joi.object().keys({
      studentId: Joi.number().integer().required(),
      subcategoryId: Joi.number().integer().required(),
      status: Joi.string().optional(),
      enrollmentDate: Joi.date().optional()
    });

    return this.validate(schema, enrollment);
  };

  validateUpdateEnrollment = (enrollment) => {
    const schema = Joi.object().keys({
      status: Joi.string().optional(),
      enrollmentDate: Joi.date().optional()
    });

    return this.validate(schema, enrollment);
  };
}

module.exports = new EnrollmentValidator(); 