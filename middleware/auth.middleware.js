const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  // Get token from header
  if (process.env.SECURITY == "disabled") {
    next();
  } else {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.error({
        status: 401,
        message: "No token, authorization denied",
      });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (error) {
      res.error({ status: 401, message: "Token is not valid", error });
    }
  }
};
