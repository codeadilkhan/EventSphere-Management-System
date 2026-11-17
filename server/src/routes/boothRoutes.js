const express = require('express');
const boothController = require('../controllers/boothController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { boothValidator, bulkBoothValidator } = require('../utils/validators');

const boothRouter = express.Router();

// Public: view floor plan booths for an expo
boothRouter.get('/expo/:expoId', boothController.getBoothsByExpo);
boothRouter.get('/:id', boothController.getBoothById);

// Admin-managed routes
boothRouter.post(
  '/',
  protect,
  authorize('admin'),
  validate(boothValidator),
  boothController.createBooth
);

boothRouter.post(
  '/bulk-generate',
  protect,
  authorize('admin'),
  validate(bulkBoothValidator),
  boothController.bulkGenerateBooths
);

boothRouter.put(
  '/:id',
  protect,
  authorize('admin'),
  boothController.updateBooth
);

boothRouter.delete(
  '/:id',
  protect,
  authorize('admin'),
  boothController.deleteBooth
);

boothRouter.put(
  '/:id/allocate',
  protect,
  authorize('admin'),
  boothController.allocateBooth
);

boothRouter.put(
  '/:id/release',
  protect,
  authorize('admin'),
  boothController.releaseBooth
);

// Exhibitor atomic self-reservation
boothRouter.put(
  '/:id/reserve',
  protect,
  authorize('exhibitor'),
  boothController.reserveBoothByExhibitor
);

module.exports = boothRouter;
