const express = require('express');
const sessionController = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { sessionValidator } = require('../utils/validators');

const sessionRouter = express.Router();

// Public: browse sessions for an exhibition
sessionRouter.get('/expo/:expoId', sessionController.getSessionsByExpo);
sessionRouter.get('/:id', sessionController.getSessionById);

// Admin-managed routes
sessionRouter.post(
  '/',
  protect,
  authorize('admin'),
  validate(sessionValidator),
  sessionController.createSession
);

sessionRouter.put(
  '/:id',
  protect,
  authorize('admin'),
  sessionController.updateSession
);

sessionRouter.delete(
  '/:id',
  protect,
  authorize('admin'),
  sessionController.deleteSession
);

module.exports = sessionRouter;
