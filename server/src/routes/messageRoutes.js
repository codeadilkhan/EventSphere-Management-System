const express = require('express');
const {
  sendMessage,
  getConversations,
  getMessagesWithUser,
  markMessagesAsRead,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All message routes are protected
router.use(protect);

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:userId', getMessagesWithUser);
router.post('/', sendMessage);
router.patch('/read/:senderId', markMessagesAsRead);

module.exports = router;
