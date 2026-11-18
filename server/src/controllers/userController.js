const User = require('../models/User');
const Registration = require('../models/Registration');
const Session = require('../models/Session');
const Booth = require('../models/Booth');
const ExhibitorApplication = require('../models/ExhibitorApplication');
const ExhibitorProfile = require('../models/ExhibitorProfile');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Get Current User Profile (with GDPR Consent Details)
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    '_id name email role phone consentGiven consentTimestamp createdAt updatedAt'
  );

  if (!user) {
    return next(new ApiServiceException('User account not found.', 404));
  }

  return sendFormattedResponse(res, 200, true, { user }, 'User profile retrieved.');
});

// Update Profile Information
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone } = req.body;
  const updates = {};

  if (name && name.trim()) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone ? phone.trim() : '';

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select('_id name email role phone consentGiven consentTimestamp createdAt updatedAt');

  return sendFormattedResponse(res, 200, true, { user: updatedUser }, 'Profile updated successfully.');
});

// GDPR Data Portability: Download All User Data
const exportUserData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const [
    user,
    registrations,
    exhibitorProfile,
    applications,
    allocatedBooths,
    feedbackTickets,
    notifications,
    messages,
  ] = await Promise.all([
    User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires').lean(),
    Registration.find({ attendeeId: userId })
      .populate('expoId', 'title venue city startDate endDate')
      .populate('sessionId', 'title hall startTime endTime')
      .lean(),
    ExhibitorProfile.findOne({ userId }).lean(),
    ExhibitorApplication.find({ exhibitorId: userId })
      .populate('expoId', 'title venue startDate')
      .lean(),
    Booth.find({ exhibitorId: userId })
      .populate('expoId', 'title venue')
      .lean(),
    Feedback.find({ userId }).lean(),
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    Message.find({ $or: [{ sender: userId }, { recipient: userId }] })
      .populate('sender', 'name role')
      .populate('recipient', 'name role')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
  ]);

  if (!user) {
    return next(new ApiServiceException('User profile not found.', 404));
  }

  const exportPayload = {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      platform: 'EventSphere Management System',
      compliance: 'GDPR Article 20 (Data Portability)',
      userId: user._id,
    },
    userAccount: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || 'Not provided',
      consentGiven: user.consentGiven || false,
      consentTimestamp: user.consentTimestamp || null,
      accountCreatedAt: user.createdAt,
    },
    eventRegistrations: registrations.map((r) => ({
      id: r._id,
      type: r.type,
      bookmarked: r.bookmarked,
      registeredAt: r.registeredAt,
      expo: r.expoId ? { id: r.expoId._id, title: r.expoId.title, venue: r.expoId.venue } : null,
      session: r.sessionId ? { id: r.sessionId._id, title: r.sessionId.title, hall: r.sessionId.hall } : null,
    })),
    commercialActivity: {
      exhibitorProfile: exhibitorProfile || null,
      boothApplications: applications || [],
      allocatedBooths: allocatedBooths || [],
    },
    supportAndFeedback: feedbackTickets || [],
    notificationArchive: notifications || [],
    messagingHistory: messages.map((m) => ({
      id: m._id,
      sender: m.sender?.name || 'Unknown',
      recipient: m.recipient?.name || 'Unknown',
      content: m.content,
      read: m.read,
      sentAt: m.createdAt,
    })),
  };

  // Allow requesting download as attachment JSON or inline JSON
  if (req.query.download === 'true') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="eventsphere-user-data-${user._id}-${Date.now()}.json"`
    );
    return res.status(200).send(JSON.stringify(exportPayload, null, 2));
  }

  return sendFormattedResponse(res, 200, true, { export: exportPayload }, 'User personal data exported successfully.');
});

// GDPR Right to Erasure: Permanently Delete Account
const deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return next(new ApiServiceException('Password confirmation is required to delete your account.', 400));
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return next(new ApiServiceException('User account not found.', 404));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiServiceException('Incorrect password. Account deletion aborted.', 401));
  }

  // 1. Release allocated booths back to available status
  await Booth.updateMany(
    { exhibitorId: userId },
    { status: 'available', exhibitorId: null, allocatedAt: null }
  );

  // 2. Decrement session capacity counters for booked sessions
  const sessionRegistrations = await Registration.find({
    attendeeId: userId,
    type: 'session',
    sessionId: { $ne: null },
  });

  for (const reg of sessionRegistrations) {
    await Session.findByIdAndUpdate(reg.sessionId, { $inc: { registeredCount: -1 } });
  }

  // 3. Delete user registrations
  await Registration.deleteMany({ attendeeId: userId });

  // 4. Anonymize or delete feedback submissions
  await Feedback.deleteMany({ userId });

  // 5. Delete notifications
  await Notification.deleteMany({ userId });

  // 6. Delete exhibitor profile & applications
  await ExhibitorProfile.deleteOne({ userId });
  await ExhibitorApplication.deleteMany({ exhibitorId: userId });

  // 7. Permanently delete user record
  await User.findByIdAndDelete(userId);

  return sendFormattedResponse(
    res,
    200,
    true,
    null,
    'Your account and all associated personal data have been permanently removed in compliance with GDPR guidelines.'
  );
});

module.exports = {
  getProfile,
  updateProfile,
  exportUserData,
  deleteAccount,
};
