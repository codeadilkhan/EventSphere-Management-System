const Notification = require('../models/Notification');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Get current user's notifications (paginated + unreadCount)
const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === 'true';

  const filter = { userId };
  if (unreadOnly) {
    filter.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, read: false }),
  ]);

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'Notifications loaded successfully.'
  );
});

// Mark single notification as read
const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new ApiServiceException('Notification not found.', 404));
  }

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return sendFormattedResponse(
    res,
    200,
    true,
    { notification, unreadCount },
    'Notification marked as read.'
  );
});

// Mark all user notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany({ userId, read: false }, { read: true });

  return sendFormattedResponse(
    res,
    200,
    true,
    { unreadCount: 0 },
    'All notifications marked as read.'
  );
});

// Delete single notification
const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const deleted = await Notification.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    return next(new ApiServiceException('Notification not found.', 404));
  }

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return sendFormattedResponse(
    res,
    200,
    true,
    { unreadCount },
    'Notification removed.'
  );
});

// Clear all notifications
const clearAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.deleteMany({ userId });

  return sendFormattedResponse(
    res,
    200,
    true,
    { unreadCount: 0 },
    'All notifications cleared.'
  );
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
