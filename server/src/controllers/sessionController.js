const Session = require('../models/Session');
const Expo = require('../models/Expo');
const Registration = require('../models/Registration');
const { notify } = require('../services/notificationService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Helper to check for overlapping sessions in the same hall
const checkHallConflict = async (expoId, hall, startTime, endTime, excludeSessionId = null) => {
  const query = {
    expoId,
    hall,
    status: { $ne: 'cancelled' },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId };
  }

  return Session.findOne(query);
};

// Create a new session (Admin)
const createSession = asyncHandler(async (req, res, next) => {
  const { expoId, title, description, speaker, topic, hall, startTime, endTime, capacity } = req.body;

  const expo = await Expo.findById(expoId);
  if (!expo) {
    return next(new ApiServiceException('Target exhibition does not exist.', 404));
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return next(new ApiServiceException('Session end time must be after start time.', 400));
  }

  // Validate within expo dates
  const expoStart = new Date(expo.startDate);
  expoStart.setHours(0, 0, 0, 0);
  const expoEnd = new Date(expo.endDate);
  expoEnd.setHours(23, 59, 59, 999);

  if (start < expoStart || end > expoEnd) {
    return next(
      new ApiServiceException('Session timing must fall within the exhibition date range.', 400)
    );
  }

  // Hall conflict check
  const conflict = await checkHallConflict(expoId, hall, start, end);
  if (conflict) {
    const formattedStart = new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEnd = new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return next(
      new ApiServiceException(
        `Schedule Conflict: "${hall}" is already occupied by session "${conflict.title}" from ${formattedStart} to ${formattedEnd}.`,
        400
      )
    );
  }

  const session = await Session.create({
    expoId,
    title,
    description,
    speaker,
    topic,
    hall,
    startTime: start,
    endTime: end,
    capacity: capacity || 100,
  });

  // Broadcast schedule update via socket
  const io = req.app.get('socketio');
  if (io) {
    io.to(`expo:${expoId}`).emit('schedule:updated', { action: 'created', session });
  }

  return sendFormattedResponse(res, 201, true, { session }, 'Session scheduled successfully.');
});

// Get sessions for an Expo
const getSessionsByExpo = asyncHandler(async (req, res, next) => {
  const { expoId } = req.params;
  const { topic, hall, date } = req.query;

  const query = { expoId };

  if (topic && topic !== 'ALL') query.topic = topic;
  if (hall && hall !== 'ALL') query.hall = hall;

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    query.startTime = { $gte: dayStart, $lte: dayEnd };
  }

  const sessions = await Session.find(query).sort({ startTime: 1, hall: 1 });

  return sendFormattedResponse(
    res,
    200,
    true,
    { count: sessions.length, sessions },
    'Sessions retrieved successfully.'
  );
});

// Get single session details
const getSessionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const session = await Session.findById(id).populate('expoId', 'title venue city startDate endDate');
  if (!session) {
    return next(new ApiServiceException('Session not found.', 404));
  }

  return sendFormattedResponse(res, 200, true, { session }, 'Session details retrieved.');
});

// Update session (Admin)
const updateSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingSession = await Session.findById(id);
  if (!existingSession) {
    return next(new ApiServiceException('Session not found.', 404));
  }

  const hall = req.body.hall || existingSession.hall;
  const startTime = req.body.startTime ? new Date(req.body.startTime) : existingSession.startTime;
  const endTime = req.body.endTime ? new Date(req.body.endTime) : existingSession.endTime;

  if (endTime <= startTime) {
    return next(new ApiServiceException('Session end time must be after start time.', 400));
  }

  // Validate within expo dates
  const expo = await Expo.findById(existingSession.expoId);
  if (expo) {
    const expoStart = new Date(expo.startDate);
    expoStart.setHours(0, 0, 0, 0);
    const expoEnd = new Date(expo.endDate);
    expoEnd.setHours(23, 59, 59, 999);

    if (startTime < expoStart || endTime > expoEnd) {
      return next(
        new ApiServiceException('Session timing must fall within the exhibition date range.', 400)
      );
    }
  }

  // Conflict check with other sessions in the same hall
  const conflict = await checkHallConflict(existingSession.expoId, hall, startTime, endTime, id);
  if (conflict) {
    const formattedStart = new Date(conflict.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEnd = new Date(conflict.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return next(
      new ApiServiceException(
        `Schedule Conflict: "${hall}" is already occupied by session "${conflict.title}" from ${formattedStart} to ${formattedEnd}.`,
        400
      )
    );
  }

  const updatedSession = await Session.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  const io = req.app.get('socketio');
  if (io) {
    io.to(`expo:${updatedSession.expoId}`).emit('schedule:updated', { action: 'updated', session: updatedSession });
  }

  // Notify registered attendees about schedule adjustments
  try {
    const registrations = await Registration.find({ sessionId: id }).select('attendeeId');
    for (const reg of registrations) {
      notify(reg.attendeeId, {
        type: 'schedule_change',
        title: 'Schedule Timing Update',
        message: `Timing or auditorium location for "${updatedSession.title}" has been modified. Check your personal agenda.`,
        link: '/events/my-schedule',
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Error notifying attendees on schedule update', err.message);
  }

  return sendFormattedResponse(res, 200, true, { session: updatedSession }, 'Session updated.');
});

// Delete session (Admin)
const deleteSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const session = await Session.findById(id);
  if (!session) {
    return next(new ApiServiceException('Session not found.', 404));
  }

  const expoId = session.expoId;
  await Registration.deleteMany({ sessionId: id });
  await Session.findByIdAndDelete(id);

  const io = req.app.get('socketio');
  if (io) {
    io.to(`expo:${expoId}`).emit('schedule:updated', { action: 'deleted', sessionId: id });
  }

  return sendFormattedResponse(res, 200, true, null, 'Session deleted successfully.');
});

module.exports = {
  createSession,
  getSessionsByExpo,
  getSessionById,
  updateSession,
  deleteSession,
};
