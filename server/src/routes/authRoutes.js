const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../utils/validators');

const authRouter = express.Router();

// Strict rate limit on sensitive authentication endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Public auth endpoints
authRouter.post('/register', validate(registerValidator), authController.register);
authRouter.post('/login', authRateLimiter, validate(loginValidator), authController.login);
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordValidator), authController.forgotPassword);
authRouter.post('/reset-password/:token', validate(resetPasswordValidator), authController.resetPassword);

// Protected auth endpoints
authRouter.get('/me', protect, authController.getMe);
authRouter.put('/change-password', protect, validate(changePasswordValidator), authController.changePassword);

module.exports = authRouter;
