const { sendFormattedResponse } = require('../utils/helpers');

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server encounter';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  return sendFormattedResponse(res, statusCode, false, null, message);
};

module.exports = globalErrorHandler;
