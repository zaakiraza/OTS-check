const Joi = require('joi');
const BaseValidator = require('./BaseValidator.js');

class PageValidator extends BaseValidator {
    // Validate for creating or updating the page (title and content)
    validateCreateOrUpdatePage = (data) => {
        const schema = Joi.object().keys({
            title: Joi.string().required().min(2).max(100),
            content: Joi.string().required(),
        });

        return this.validate(schema, data);
    };
}

module.exports = new PageValidator();
