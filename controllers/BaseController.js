const { generateResponse } = require("../utils/utils.js");

class BaseController {
  successResponse(statusCode, res, data, message = null) {
    return res.status(statusCode).json(generateResponse(true, message, data));
  }

  errorResponse(status, res, message, data = null) {
    return res.status(status).json(generateResponse(false, message, data));
  }

  validationErrorResponse(res, message) {
    return res.status(422).json(generateResponse(false, message));
  }

  serverErrorResponse(res, message) {
    return res.status(500).json(generateResponse(false, message));
  }
}

module.exports = BaseController;
