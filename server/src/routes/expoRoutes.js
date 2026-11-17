const express = require('express');
const expoController = require('../controllers/expoController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { uploadBanner } = require('../middleware/upload');
const { expoValidator } = require('../utils/validators');

const expoRouter = express.Router();

// Public routes (anyone can browse published expos)
expoRouter.get('/', expoController.getAllExpos);
expoRouter.get('/:id', expoController.getExpoById);

// Admin-restricted routes
expoRouter.post(
  '/',
  protect,
  authorize('admin'),
  validate(expoValidator),
  expoController.createExpo
);

expoRouter.put(
  '/:id',
  protect,
  authorize('admin'),
  expoController.updateExpo
);

expoRouter.delete(
  '/:id',
  protect,
  authorize('admin'),
  expoController.deleteExpo
);

expoRouter.post(
  '/upload-banner',
  protect,
  authorize('admin'),
  uploadBanner.single('banner'),
  expoController.uploadBannerImage
);

module.exports = expoRouter;
