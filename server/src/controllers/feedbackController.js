const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { notify } = require('../services/notificationService');
const { sendFeedbackReplyEmail } = require('../services/emailService');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Submit Feedback or Support Ticket (Any Authenticated Role)
const submitFeedback = asyncHandler(async (req, res, next) => {
  const { type, subject, message } = req.body;
  const userId = req.user.id;

  if (!subject || !subject.trim()) {
    return next(new ApiServiceException('Subject line is required.', 400));
  }

  if (!message || !message.trim()) {
    return next(new ApiServiceException('Detailed message is required.', 400));
  }

  const feedback = await Feedback.create({
    userId,
    type: type || 'inquiry',
    subject: subject.trim(),
    message: message.trim(),
    status: 'open',
  });

  return sendFormattedResponse(
    res,
    201,
    true,
    { feedback },
    'Support request or feedback ticket submitted successfully.'
  );
});

// View My Feedback Submissions (User)
const getMyFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const tickets = await Feedback.find({ userId })
    .populate('repliedBy', 'name email role')
    .sort({ createdAt: -1 });

  return sendFormattedResponse(
    res,
    200,
    true,
    { count: tickets.length, tickets },
    'Your feedback submissions loaded.'
  );
});

// Get All Feedback Submissions (Admin)
const getAllFeedback = asyncHandler(async (req, res) => {
  const { status, type, q } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }
  if (type && type !== 'ALL') {
    filter.type = type;
  }
  if (q) {
    filter.$or = [
      { subject: { $regex: q, $options: 'i' } },
      { message: { $regex: q, $options: 'i' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    Feedback.find(filter)
      .populate('userId', 'name email role phone')
      .populate('repliedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'All feedback tickets retrieved.'
  );
});

// Update Feedback Status (Admin)
const updateFeedbackStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['open', 'in-progress', 'resolved'].includes(status)) {
    return next(new ApiServiceException('Status must be open, in-progress, or resolved.', 400));
  }

  const updateData = { status };
  if (status === 'resolved') {
    updateData.resolvedAt = new Date();
  }

  const feedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true })
    .populate('userId', 'name email role')
    .populate('repliedBy', 'name email');

  if (!feedback) {
    return next(new ApiServiceException('Feedback ticket not found.', 404));
  }

  return sendFormattedResponse(res, 200, true, { feedback }, `Status updated to ${status}.`);
});

// Reply to Feedback Ticket (Admin)
const replyToFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reply, status = 'resolved' } = req.body;
  const adminId = req.user.id;

  if (!reply || !reply.trim()) {
    return next(new ApiServiceException('Reply message cannot be empty.', 400));
  }

  const feedback = await Feedback.findById(id).populate('userId', 'name email');
  if (!feedback) {
    return next(new ApiServiceException('Feedback ticket not found.', 404));
  }

  feedback.adminReply = reply.trim();
  feedback.repliedBy = adminId;
  feedback.repliedAt = new Date();
  feedback.status = status;
  if (status === 'resolved') {
    feedback.resolvedAt = new Date();
  }

  await feedback.save();

  // 1. Send in-app notification to the ticket author
  await notify(feedback.userId._id, {
    type: 'system',
    title: 'Support Response Received',
    message: `An organizer replied to your ticket "${feedback.subject}": "${reply.trim().slice(0, 80)}..."`,
    link: '/feedback',
  });

  // 2. Send email notification to ticket author
  if (feedback.userId?.email) {
    sendFeedbackReplyEmail(
      feedback.userId.email,
      feedback.userId.name,
      feedback.subject,
      reply.trim()
    ).catch(() => {});
  }

  const populated = await Feedback.findById(id)
    .populate('userId', 'name email role')
    .populate('repliedBy', 'name email');

  return sendFormattedResponse(
    res,
    200,
    true,
    { feedback: populated },
    'Reply delivered and ticket updated.'
  );
});

module.exports = {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  replyToFeedback,
};
