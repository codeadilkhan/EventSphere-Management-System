const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const ExhibitorProfile = require('../models/ExhibitorProfile');
const { ApiServiceException, asyncHandler, sendFormattedResponse } = require('../utils/helpers');

// Send a direct message
const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, expoId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId) {
    return next(new ApiServiceException('Receiver ID is required.', 400));
  }

  if (senderId.toString() === receiverId.toString()) {
    return next(new ApiServiceException('You cannot send a message to yourself.', 400));
  }

  if (!content || !content.trim()) {
    return next(new ApiServiceException('Message content cannot be empty.', 400));
  }

  const receiver = await User.findById(receiverId).select('name email role');
  if (!receiver) {
    return next(new ApiServiceException('Recipient user not found.', 404));
  }

  const message = await Message.create({
    senderId,
    receiverId,
    expoId: expoId || null,
    content: content.trim(),
    readAt: null,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name email role')
    .populate('receiverId', 'name email role')
    .populate('expoId', 'title');

  // Emit real-time Socket event
  const io = req.app.get('socketio');
  if (io) {
    io.to(`user:${receiverId}`).emit('message:new', { message: populatedMessage });
    io.to(`user:${senderId}`).emit('message:sent', { message: populatedMessage });
  }

  return sendFormattedResponse(
    res,
    201,
    true,
    { message: populatedMessage },
    'Message sent successfully.'
  );
});

// Get conversation threads list for current user
const getConversations = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Aggregate all messages where user is sender or receiver
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$readAt', null] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'partner',
      },
    },
    {
      $unwind: '$partner',
    },
    {
      $project: {
        _id: 1,
        partner: {
          _id: '$partner._id',
          name: '$partner.name',
          email: '$partner.email',
          role: '$partner.role',
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { 'lastMessage.createdAt': -1 },
    },
  ]);

  // Enrich exhibitors with company details if applicable
  const partnerUserIds = conversations
    .filter((c) => c.partner.role === 'exhibitor')
    .map((c) => c.partner._id);

  const exhibitorProfiles = await ExhibitorProfile.find({
    userId: { $in: partnerUserIds },
  }).select('userId companyName logo category');

  const profileMap = new Map();
  exhibitorProfiles.forEach((p) => {
    profileMap.set(p.userId.toString(), p);
  });

  const enrichedConversations = conversations.map((conv) => {
    const prof = profileMap.get(conv.partner._id.toString());
    return {
      ...conv,
      partner: {
        ...conv.partner,
        companyName: prof ? prof.companyName : null,
        companyCategory: prof ? prof.category : null,
        logo: prof ? prof.logo : null,
      },
    };
  });

  return sendFormattedResponse(
    res,
    200,
    true,
    { conversations: enrichedConversations },
    'Conversations retrieved.'
  );
});

// Get direct messages history with a specific user
const getMessagesWithUser = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.userId;
  const { expoId } = req.query;

  const partner = await User.findById(otherUserId).select('name email role');
  if (!partner) {
    return next(new ApiServiceException('Target contact not found.', 404));
  }

  let partnerProfile = null;
  if (partner.role === 'exhibitor') {
    partnerProfile = await ExhibitorProfile.findOne({ userId: otherUserId }).select(
      'companyName category logo'
    );
  }

  const query = {
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  };

  if (expoId) {
    query.expoId = expoId;
  }

  const messages = await Message.find(query)
    .populate('senderId', 'name email role')
    .populate('receiverId', 'name email role')
    .sort({ createdAt: 1 })
    .lean();

  // Mark unread messages sent by otherUser to current user as read
  const unreadIds = messages
    .filter((m) => m.receiverId._id.toString() === currentUserId.toString() && !m.readAt)
    .map((m) => m._id);

  if (unreadIds.length > 0) {
    const now = new Date();
    await Message.updateMany({ _id: { $in: unreadIds } }, { readAt: now });

    // Notify other user via socket of read receipt
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user:${otherUserId}`).emit('messages:read', {
        readerId: currentUserId,
        readAt: now,
      });
    }
  }

  return sendFormattedResponse(
    res,
    200,
    true,
    {
      partner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        role: partner.role,
        companyName: partnerProfile ? partnerProfile.companyName : null,
        category: partnerProfile ? partnerProfile.category : null,
        logo: partnerProfile ? partnerProfile.logo : null,
      },
      messages,
    },
    'Messages history retrieved.'
  );
});

// Mark messages from a specific sender as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { senderId } = req.params;

  const now = new Date();
  const result = await Message.updateMany(
    {
      senderId,
      receiverId: currentUserId,
      readAt: null,
    },
    { readAt: now }
  );

  const io = req.app.get('socketio');
  if (io) {
    io.to(`user:${senderId}`).emit('messages:read', {
      readerId: currentUserId,
      readAt: now,
    });
  }

  return sendFormattedResponse(
    res,
    200,
    true,
    { modifiedCount: result.modifiedCount },
    'Messages marked as read.'
  );
});

// Get total unread count for current user
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiverId: req.user.id,
    readAt: null,
  });

  return sendFormattedResponse(res, 200, true, { unreadCount: count }, 'Unread count retrieved.');
});

module.exports = {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  markMessagesAsRead,
  getUnreadCount,
};
