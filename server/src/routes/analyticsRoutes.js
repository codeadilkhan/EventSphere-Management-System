const express = require('express');
const {
  trackEvent,
  getOverview,
  getEngagement,
  getBoothTraffic,
  getSessionPopularity,
  exportReportCsv,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { verifyAuthToken } = require('../utils/tokenManager');
const User = require('../models/User');

const router = express.Router();

// Optional authentication middleware for tracking events from both guests and logged-in users
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyAuthToken(token);
      if (decoded?.id) {
        req.user = await User.findById(decoded.id).select('_id role email name');
      }
    }
  } catch (err) {
    // Silently continue for unauthenticated visitors
  }
  return next();
};

// Public / Guest / User Event Tracking
router.post('/track', optionalAuth, trackEvent);

// Admin-Only Analytics & Aggregation Reports
router.get('/overview', protect, authorize('admin'), getOverview);
router.get('/engagement', protect, authorize('admin'), getEngagement);
router.get('/booth-traffic', protect, authorize('admin'), getBoothTraffic);
router.get('/session-popularity', protect, authorize('admin'), getSessionPopularity);
router.get('/export', protect, authorize('admin'), exportReportCsv);

module.exports = router;
