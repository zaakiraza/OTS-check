const Joi = require("joi");
const BaseValidator = require("./BaseValidator.js");

class SubscribersValidator extends BaseValidator {
    // Validate subscribing a user
    validateSubscribeUser = (data) => {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(), // Email is required and must be a valid email
        });

        return this.validate(schema, data);
    };

    // Validate unsubscribing a user
    validateUnsubscribeUser = (data) => {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(), // Email is required and must be a valid email
        });

        return this.validate(schema, data);
    };

    // Validate the email for getting a subscriber by email
    validateGetSubscriberByEmail = (data) => {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(), // Email is required and must be a valid email
        });

        return this.validate(schema, data);
    };
}

module.exports = new SubscribersValidator();