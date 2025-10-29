
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.error({status:401, message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.user)
    req.user = decoded.user;
    next();
  } catch (error) {
    res.error({status:401, message: 'Token is not valid',error });
  }
};
