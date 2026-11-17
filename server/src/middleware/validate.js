const { ApiServiceException } = require('../utils/helpers');

const validate = (joiSchema) => {
  return (req, res, next) => {
    const { error, value } = joiSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const detailedErrors = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiServiceException(detailedErrors, 400));
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
