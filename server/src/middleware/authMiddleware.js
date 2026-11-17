const { verifyAuthToken } = require('../utils/tokenManager');
const { ApiServiceException, asyncHandler } = require('../utils/helpers');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let bearerToken = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    bearerToken = req.headers.authorization.split(' ')[1];
  }

  if (!bearerToken) {
    return next(
      new ApiServiceException('Authentication token missing. Please log in.', 401)
    );
  }

  let decodedPayload;
  try {
    decodedPayload = verifyAuthToken(bearerToken);
  } catch (err) {
    return next(new ApiServiceException('Invalid or expired authentication session.', 401));
  }

  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser) {
    return next(
      new ApiServiceException('The account associated with this token no longer exists.', 401)
    );
  }

  req.user = currentUser;
  next();
});

const authorize = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.user || !permittedRoles.includes(req.user.role)) {
      return next(
        new ApiServiceException(
          'Access restricted: You do not possess the required permission level.',
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
