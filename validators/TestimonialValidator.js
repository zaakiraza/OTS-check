const Joi = require('joi');
const BaseValidator = require('./BaseValidator.js');

class TestimonialValidator extends BaseValidator {
  // Validate creating a testimonial
  validateCreateTestimonial = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string().required(),
      name: Joi.string().required(),
      img_url: Joi.string().required(),  // img_url is now mandatory
      designation: Joi.string().required(),
      videoUrl: Joi.string().uri().allow(null, ''),  // videoUrl is optional
    });

    return this.validate(schema, data);
  };

  // Validate updating a testimonial
  validateUpdateTestimonial = (data) => {
    const schema = Joi.object().keys({
      text: Joi.string(),
      name: Joi.string(),
      img_url: Joi.string(), // img_url is optional in update
      designation: Joi.string(),
      videoUrl: Joi.string().uri().allow(null, ''),  // videoUrl is optional
    });

    return this.validate(schema, data);
  };
}

module.exports = new TestimonialValidator();
