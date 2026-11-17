const Registration = require('../models/Registration');
const Session = require('../models/Session');
const Expo = require('../models/Expo');
const Notification = require('../models/Notification');
const { logEvent } = require('../services/analyticsService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Register for an Expo (Attendee)
const registerForExpo = asyncHandler(async (req, res, next) => {
  const { expoId } = req.body;

  if (!expoId) {
    return next(new ApiServiceException('Expo ID is required.', 400));
  }

  const expo = await Expo.findById(expoId);
  if (!expo) {
    return next(new ApiServiceException('Exhibition not found.', 404));
  }

  const existingReg = await Registration.findOne({
    attendeeId: req.user.id,
    expoId,
    type: 'expo',
  });

  if (existingReg) {
    return next(new ApiServiceException('You are already registered for this exhibition.', 400));
  }

  const registration = await Registration.create({
    attendeeId: req.user.id,
    expoId,
    sessionId: null,
    type: 'expo',
    registeredAt: new Date(),
  });

  await Notification.create({
    userId: req.user.id,
    type: 'expo_update',
    title: 'Exhibition Registration Confirmed',
    message: `You are officially registered for "${expo.title}". Welcome!`,
    link: `/events/${expo._id}`,
  });

  // Log analytics event
  logEvent({
    type: 'register',
    expoId,
    userId: req.user.id,
    metadata: { registrationType: 'expo' },
  }).catch(() => {});

  return sendFormattedResponse(
    res,
    201,
    true,
    { registration, expo },
    'You are successfully registered for this exhibition!'
  );
});

// Cancel Expo Registration
const cancelExpoRegistration = asyncHandler(async (req, res, next) => {
  const { expoId } = req.params;

  const registration = await Registration.findOne({
    attendeeId: req.user.id,
    expoId,
    type: 'expo',
  });

  if (!registration) {
    return next(new ApiServiceException('Active registration not found for this exhibition.', 404));
  }

  await Registration.findByIdAndDelete(registration._id);

  return sendFormattedResponse(
    res,
    200,
    true,
    null,
    'Your exhibition registration has been cancelled.'
  );
});

// Register for a Session (Attendee)
const registerForSession = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.body;

  const session = await Session.findById(sessionId).populate('expoId', 'title venue city');
  if (!session) {
    return next(new ApiServiceException('Session not found.', 404));
  }

  // 1. Check if already registered
  const existingReg = await Registration.findOne({
    attendeeId: req.user.id,
    sessionId,
    type: 'session',
  });

  if (existingReg) {
    return next(new ApiServiceException('You are already registered for this session.', 400));
  }

  // 2. Capacity Check
  if (session.registeredCount >= session.capacity) {
    return next(
      new ApiServiceException(
        `This session has reached its maximum hall capacity of ${session.capacity} seats.`,
        400
      )
    );
  }

  // 3. Atomically increment registeredCount
  await Session.findByIdAndUpdate(sessionId, { $inc: { registeredCount: 1 } });

  // 4. Create registration record
  const registration = await Registration.create({
    attendeeId: req.user.id,
    expoId: session.expoId._id,
    sessionId: session._id,
    type: 'session',
    registeredAt: new Date(),
  });

  // 5. Create confirmation notification
  await Notification.create({
    userId: req.user.id,
    type: 'schedule_change',
    title: 'Seat Reserved Successfully',
    message: `Your seat has been confirmed for "${session.title}" in ${session.hall}.`,
    link: '/events/my-schedule',
  });

  // Log analytics event
  logEvent({
    type: 'register',
    expoId: session.expoId._id || session.expoId,
    refId: session._id,
    refModel: 'Session',
    userId: req.user.id,
    metadata: { registrationType: 'session', sessionTitle: session.title },
  }).catch(() => {});

  return sendFormattedResponse(
    res,
    201,
    true,
    { registration, session },
    'Seat confirmed! You have successfully registered for this keynote.'
  );
});

// Cancel Session Registration
const cancelRegistration = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const registration = await Registration.findOne({
    attendeeId: req.user.id,
    sessionId,
    type: 'session',
  });

  if (!registration) {
    return next(new ApiServiceException('Active registration not found for this session.', 404));
  }

  // Remove registration and decrement session counter atomically
  await Registration.findByIdAndDelete(registration._id);
  await Session.findByIdAndUpdate(sessionId, { $inc: { registeredCount: -1 } });

  return sendFormattedResponse(
    res,
    200,
    true,
    null,
    'Your registration has been cancelled and seat released.'
  );
});

// Toggle Bookmark for a session
const toggleBookmark = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId);
  if (!session) {
    return next(new ApiServiceException('Session not found.', 404));
  }

  let record = await Registration.findOne({
    attendeeId: req.user.id,
    sessionId,
  });

  if (record) {
    record.bookmarked = !record.bookmarked;
    await record.save();
  } else {
    record = await Registration.create({
      attendeeId: req.user.id,
      expoId: session.expoId,
      sessionId: session._id,
      type: 'session',
      bookmarked: true,
    });
  }

  if (record.bookmarked) {
    logEvent({
      type: 'bookmark',
      expoId: session.expoId,
      refId: session._id,
      refModel: 'Session',
      userId: req.user.id,
      metadata: { sessionTitle: session.title },
    }).catch(() => {});
  }

  return sendFormattedResponse(
    res,
    200,
    true,
    { bookmarked: record.bookmarked },
    record.bookmarked ? 'Session bookmarked to your agenda.' : 'Bookmark removed.'
  );
});

// Get My Registrations & Bookmarks (Attendee)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const records = await Registration.find({ attendeeId: req.user.id })
    .populate({
      path: 'sessionId',
      populate: { path: 'expoId', select: 'title venue city startDate endDate' },
    })
    .populate('expoId', 'title venue city startDate endDate bannerImage')
    .sort({ createdAt: -1 });

  // Separate into registered vs bookmarked
  const registeredExpos = records
    .filter((r) => r.type === 'expo')
    .map((r) => ({
      registrationId: r._id,
      registeredAt: r.registeredAt,
      expo: r.expoId,
    }));

  const registeredSessions = records
    .filter((r) => r.sessionId && r.registeredAt)
    .map((r) => ({
      registrationId: r._id,
      registeredAt: r.registeredAt,
      bookmarked: r.bookmarked,
      session: r.sessionId,
    }));

  const bookmarkedSessions = records
    .filter((r) => r.sessionId && r.bookmarked)
    .map((r) => ({
      registrationId: r._id,
      session: r.sessionId,
    }));

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      totalRegistered: registeredSessions.length,
      totalBookmarked: bookmarkedSessions.length,
      totalExpos: registeredExpos.length,
      registeredExpos,
      registeredSessions,
      bookmarkedSessions,
    },
    'Attendee schedule and bookmarks loaded.'
  );
});

module.exports = {
  registerForExpo,
  cancelExpoRegistration,
  registerForSession,
  cancelRegistration,
  toggleBookmark,
  getMyRegistrations,
};
