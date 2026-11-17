const jwt = require('jsonwebtoken');

const signAuthToken = (userId, userRole) => {
  const secretKey = process.env.JWT_SECRET || 'eventsphere_fallback_secret_key_2026';
  const tokenExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: userId,
      role: userRole,
    },
    secretKey,
    {
      expiresIn: tokenExpiresIn,
    }
  );
};

const verifyAuthToken = (tokenString) => {
  const secretKey = process.env.JWT_SECRET || 'eventsphere_fallback_secret_key_2026';
  return jwt.verify(tokenString, secretKey);
};

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
