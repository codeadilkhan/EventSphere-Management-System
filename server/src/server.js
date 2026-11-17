require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configure Socket.io instance
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize socket manager with JWT authentication and room handlers
const { initializeSocketManager } = require('./sockets/socketManager');
const { setSocketIoInstance: setNotificationSocket } = require('./services/notificationService');
const { setSocketIoInstance: setAnalyticsSocket } = require('./services/analyticsService');
const { startReminderCron } = require('./services/reminderCron');

const socketManager = initializeSocketManager(io);
setNotificationSocket(io);
setAnalyticsSocket(io);

// Attach socket io and socketManager to express app instance for access in controllers
app.set('socketio', io);
app.set('socketManager', socketManager);

// Boot server and connect database
const startServer = async () => {
  await connectDatabase();

  // Start background reminder scheduler
  startReminderCron();

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  EventSphere Backend Server is Running!       `);
    console.log(`  Port: ${PORT}                                `);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('[EventSphere Error] Unhandled Rejection:', err);
});
