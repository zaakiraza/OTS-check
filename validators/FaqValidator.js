const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class FaqValidator extends BaseValidator {

    validateCreateFaq = (faq) => {
        const schema = Joi.object().keys({
            question: Joi.string().required().min(5).max(255),
            answer: Joi.string().required().min(5),          
        });

        return this.validate(schema, faq);
    };

    // Validate the update of a FAQ
    validateUpdateFaq = (faq) => {
        const schema = Joi.object().keys({
            question: Joi.string().min(5).max(255), // Optional question validation
            answer: Joi.string().min(5),            // Optional answer validation
        });

        return this.validate(schema, faq);
    };
}

module.exports = new FaqValidator();
