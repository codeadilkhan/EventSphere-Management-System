const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const healthRouter = require('./routes/healthRoutes');
const authRouter = require('./routes/authRoutes');
const expoRouter = require('./routes/expoRoutes');
const boothRouter = require('./routes/boothRoutes');
const exhibitorRouter = require('./routes/exhibitorRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const registrationRouter = require('./routes/registrationRoutes');
const messageRouter = require('./routes/messageRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');
const globalErrorHandler = require('./middleware/errorHandler');
const { ApiServiceException } = require('./utils/helpers');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-origin resource sharing
const allowedClient = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedClient,
    credentials: true,
  })
);

// Logging middleware in dev mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Core Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/expos', expoRouter);
app.use('/api/booths', boothRouter);
app.use('/api/exhibitors', exhibitorRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/registrations', registrationRouter);
app.use('/api/messages', messageRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/analytics', analyticsRouter);

// Undefined routes catcher
app.all('*', (req, res, next) => {
  next(new ApiServiceException(`Cannot find route ${req.originalUrl} on EventSphere server`, 404));
});

// Centralized error handler
app.use(globalErrorHandler);

module.exports = app;
