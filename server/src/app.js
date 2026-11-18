const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { logger, morganStream } = require('./utils/logger');
const healthRouter = require('./routes/healthRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
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

// Trust reverse proxy (for Nginx/Traefik/Cloudflare load balancers)
app.set('trust proxy', 1);

// Security HTTP headers with cross-origin resource policy for media/uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Gzip response compression for high throughput and reduced latency
app.use(compression());

// Strict Cross-origin resource sharing
const allowedClient = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedClient,
    credentials: true,
  })
);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Basic XSS sanitization middleware
const sanitizeXss = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      // Strip potentially dangerous script tags and javascript: URIs
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:[^"']*/gi, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeXss(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeXss(req.body);
  if (req.query) sanitizeXss(req.query);
  if (req.params) sanitizeXss(req.params);
  next();
});

// Rate limiting (T09.1)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 min
  message: {
    success: false,
    message: 'Too many requests received from this IP address. Please retry after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // 60 authentication attempts per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts. Please retry after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Structured logging via Winston & Morgan
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

// Body parsing with safe payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory with caching headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
  })
);

// Core API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
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
