
const responseMessage = require("../utils/responseMessage.util")

module.exports = (req, res, next) => {
  res.success = ({message, data = null, status = 200}) => {
    res.status(status).json({
      success: true,
      message:message || responseMessage[status],
      data,
    });
  };

  res.error = ({message, status = 500 , error = null}) => {
    res.status(status).json({
      success: false,
      message: message || responseMessage[status],
      error,
    });
  };

  next();
};