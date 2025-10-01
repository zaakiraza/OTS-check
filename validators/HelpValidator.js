const Joi = require('joi');
const BaseValidator = require('./BaseValidator.js');

class HelpValidator extends BaseValidator {
    // Validate creating a help submission
    validateCreateHelp = (data) => {
        const schema = Joi.object().keys({
            firstName: Joi.string().required(),  // firstName is required
            emailAddress: Joi.string().email().required(),  // emailAddress is required and must be a valid email
            phoneNumber: Joi.string().optional(),  // phoneNumber is optional
            message: Joi.string().required(),  // message is required
            whereDidYouFindUs: Joi.string().optional(),  // whereDidYouFindUs is optional
        });

        return this.validate(schema, data);
    };
}

module.exports = new HelpValidator();