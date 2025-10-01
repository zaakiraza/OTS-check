const getValidatorErrorMessage = (error) => {
  return error.details[0].message.replace(/\\/g, "").replace(/"/g, "");
};

const generateResponse = (status, message, data = null) => {
  return {
    status,
    message,
    data,
  };
};

const getIpAddress = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0] : req.connection.remoteAddress;
  return ip;
};

const getUserAgent = (req) => {
  return req.headers["user-agent"];
};

module.exports = {
  getValidatorErrorMessage,
  generateResponse,
  getIpAddress,
  getUserAgent
};
