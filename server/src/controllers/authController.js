const crypto = require('crypto');
const User = require('../models/User');
const { signAuthToken } = require('../utils/tokenManager');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');
const { sendPasswordResetEmail } = require('../services/emailService');

// Register a new Attendee or Exhibitor
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, consentGiven } = req.body;

  // Verify unique email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiServiceException('An account with this email address already exists.', 400));
  }

  // Admin registration through public API is restricted
  const assignedRole = role === 'exhibitor' ? 'exhibitor' : 'attendee';

  const newUser = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    phone: phone || '',
    consentGiven: Boolean(consentGiven),
    consentTimestamp: new Date(),
  });

  const authToken = signAuthToken(newUser._id, newUser.role);

  const safeUserData = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    phone: newUser.phone,
    createdAt: newUser.createdAt,
  };

  return sendFormattedResponse(
    res,
    201,
    true,
    {
      user: safeUserData,
      token: authToken,
    },
    'Registration successful. Welcome to EventSphere!'
  );
});

// Login user
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const foundUser = await User.findOne({ email }).select('+password');

  if (!foundUser || !(await foundUser.comparePassword(password))) {
    return next(new ApiServiceException('Invalid email or password credentials.', 401));
  }

  const authToken = signAuthToken(foundUser._id, foundUser.role);

  const safeUserData = {
    id: foundUser._id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
    phone: foundUser.phone,
    createdAt: foundUser.createdAt,
  };

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      user: safeUserData,
      token: authToken,
    },
    'Authentication verified successfully.'
  );
});

// Get current profile
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const safeUserData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    consentGiven: user.consentGiven,
    consentTimestamp: user.consentTimestamp,
    createdAt: user.createdAt,
  };

  return sendFormattedResponse(res, 200, true, { user: safeUserData }, 'User profile retrieved');
});

// Request password reset link
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // For security reasons, do not leak whether user exists
    return sendFormattedResponse(
      res,
      200,
      true,
      null,
      'If an account with that email exists, reset instructions have been sent.'
    );
  }

  const rawResetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientBase}/reset-password/${rawResetToken}`;

  await sendPasswordResetEmail(user.email, resetLink);

  const responsePayload =
    process.env.NODE_ENV === 'development'
      ? { devResetToken: rawResetToken, resetUrl: resetLink }
      : null;

  return sendFormattedResponse(
    res,
    200,
    true,
    responsePayload,
    'Password reset instructions dispatched.'
  );
});

// Reset password with token
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiServiceException('Reset link is invalid or has expired.', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const newToken = signAuthToken(user._id, user.role);

  const safeUserData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };

  return sendFormattedResponse(
    res,
    200,
    true,
    { user: safeUserData, token: newToken },
    'Password has been reset successfully. You are now logged in.'
  );
});

// Change password (while logged in)
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    return next(new ApiServiceException('Your current password does not match.', 400));
  }

  user.password = newPassword;
  await user.save();

  const freshToken = signAuthToken(user._id, user.role);

  return sendFormattedResponse(
    res,
    200,
    true,
    { token: freshToken },
    'Your password was updated successfully.'
  );
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
