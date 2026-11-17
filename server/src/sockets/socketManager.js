const { verifyAuthToken } = require('../utils/tokenManager');

// In-memory tracking of active user socket connections: userId -> Set of socket IDs
const activeUserSockets = new Map();

const initializeSocketManager = (io) => {
  // Socket.io JWT Authentication Middleware
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token && socket.handshake.query?.token) {
        token = socket.handshake.query.token;
      }

      if (!token) {
        return next(new Error('Authentication failed: No token provided'));
      }

      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      const decoded = verifyAuthToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication failed: Invalid token credentials'));
      }

      socket.user = decoded;
      return next();
    } catch (err) {
      console.warn(`[Socket Auth] Connection rejected: ${err.message}`);
      return next(new Error('Authentication error: Unauthorized connection'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${userId} (Role: ${socket.user.role}, Socket: ${socket.id})`);

    // Add socket to active connections
    if (!activeUserSockets.has(userId)) {
      activeUserSockets.set(userId, new Set());
    }
    activeUserSockets.get(userId).add(socket.id);

    // Auto-join personal room
    socket.join(`user:${userId}`);

    // Broadcast user online status
    io.emit('presence:update', {
      userId,
      status: 'online',
    });

    // Room join/leave for specific exhibition floor plans and schedules
    socket.on('join:expo', (expoId) => {
      if (expoId) {
        socket.join(`expo:${expoId}`);
        console.log(`[Socket] Socket ${socket.id} (User ${userId}) joined room expo:${expoId}`);
      }
    });

    socket.on('leave:expo', (expoId) => {
      if (expoId) {
        socket.leave(`expo:${expoId}`);
        console.log(`[Socket] Socket ${socket.id} (User ${userId}) left room expo:${expoId}`);
      }
    });

    // Real-time typing indicators for direct messages
    socket.on('typing:start', ({ receiverId, expoId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('typing:start', {
          senderId: userId,
          expoId,
        });
      }
    });

    socket.on('typing:stop', ({ receiverId, expoId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('typing:stop', {
          senderId: userId,
          expoId,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userSockets = activeUserSockets.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          activeUserSockets.delete(userId);
          // Broadcast user went offline
          io.emit('presence:update', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }
      console.log(`[Socket] User disconnected: ${userId} (Socket: ${socket.id})`);
    });
  });

  return {
    isUserOnline: (userId) => activeUserSockets.has(userId.toString()),
    getOnlineUserIds: () => Array.from(activeUserSockets.keys()),
  };
};

module.exports = {
  initializeSocketManager,
  activeUserSockets,
};
