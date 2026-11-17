class ApiServiceException extends Error {
  constructor(detailMessage, httpStatusCode = 500) {
    super(detailMessage);
    this.statusCode = httpStatusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (executionFunction) => (req, res, next) => {
  return Promise.resolve(executionFunction(req, res, next)).catch(next);
};

const sendFormattedResponse = (res, statusCode, successStatus, payloadData = null, statusMessage = '') => {
  return res.status(statusCode).json({
    success: successStatus,
    message: statusMessage,
    data: payloadData,
  });
};

module.exports = {
  ApiServiceException,
  asyncHandler,
  sendFormattedResponse,
};
