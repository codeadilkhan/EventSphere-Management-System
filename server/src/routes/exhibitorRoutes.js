const express = require('express');
const exhibitorController = require('../controllers/exhibitorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadLogo } = require('../middleware/upload');

const exhibitorRouter = express.Router();

// Exhibitor Profile Self-Management
exhibitorRouter.get('/me', protect, authorize('exhibitor'), exhibitorController.getMyProfile);
exhibitorRouter.put('/me', protect, authorize('exhibitor'), exhibitorController.updateMyProfile);
exhibitorRouter.post(
  '/upload-logo',
  protect,
  authorize('exhibitor'),
  uploadLogo.single('logo'),
  exhibitorController.uploadLogoImage
);

// Public Directory Endpoints
exhibitorRouter.get('/', exhibitorController.searchExhibitors);
exhibitorRouter.get('/:id', exhibitorController.getPublicProfile);

module.exports = exhibitorRouter;
