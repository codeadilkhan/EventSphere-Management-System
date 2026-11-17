const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

const registrationRouter = express.Router();

// Protected Attendee Registration Endpoints
registrationRouter.post('/', protect, registrationController.registerForSession);
registrationRouter.post('/expo', protect, registrationController.registerForExpo);
registrationRouter.delete('/expo/:expoId', protect, registrationController.cancelExpoRegistration);
registrationRouter.delete('/session/:sessionId', protect, registrationController.cancelRegistration);
registrationRouter.post('/bookmark/:sessionId', protect, registrationController.toggleBookmark);
registrationRouter.get('/me', protect, registrationController.getMyRegistrations);

module.exports = registrationRouter;
