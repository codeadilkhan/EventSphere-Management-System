const express = require('express');
const {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  replyToFeedback,
} = require('../controllers/feedbackController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// User feedback endpoints
router.post('/', submitFeedback);
router.get('/me', getMyFeedback);

// Admin feedback endpoints
router.get('/', restrictTo('admin'), getAllFeedback);
router.patch('/:id/status', restrictTo('admin'), updateFeedbackStatus);
router.post('/:id/reply', restrictTo('admin'), replyToFeedback);

module.exports = router;
