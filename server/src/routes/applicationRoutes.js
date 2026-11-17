const express = require('express');
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/upload');

const applicationRouter = express.Router();

// Exhibitor Routes
applicationRouter.post(
  '/',
  protect,
  authorize('exhibitor'),
  uploadDocument.array('documents', 5),
  applicationController.submitApplication
);

applicationRouter.get(
  '/my',
  protect,
  authorize('exhibitor'),
  applicationController.getMyApplications
);

// Admin Routes
applicationRouter.get(
  '/',
  protect,
  authorize('admin'),
  applicationController.getAllApplications
);

applicationRouter.put(
  '/:id/status',
  protect,
  authorize('admin'),
  applicationController.reviewApplication
);

module.exports = applicationRouter;
