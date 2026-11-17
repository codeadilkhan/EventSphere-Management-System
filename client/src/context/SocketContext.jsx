import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [liveToast, setLiveToast] = useState(null);
  const activeChatPartnerRef = useRef(null);

  // Set active chat partner to prevent unnecessary toasts or unread incrementing
  const setActiveChatPartner = useCallback((partnerId) => {
    activeChatPartnerRef.current = partnerId;
  }, []);

  // Fetch message unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await messageService.getUnreadCount();
      if (res.success && typeof res.data?.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Non-critical, ignore
    }
  }, [isAuthenticated]);

  // Fetch in-app notification unread count
  const refreshNotificationCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications({ limit: 1 });
      if (typeof res.data?.unreadCount === 'number') {
        setNotificationCount(res.data.unreadCount);
      }
    } catch {
      // Non-critical
    }
  }, [isAuthenticated]);

  // Manage Socket Connection Lifecycle
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    const socketInstance = io(SOCKET_SERVER_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[EventSphere Socket] Connected to real-time gateway:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[EventSphere Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[EventSphere Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    // Handle presence updates
    socketInstance.on('presence:update', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId.toString());
        } else {
          next.delete(userId.toString());
        }
        return next;
      });
    });

    // Handle incoming messages
    socketInstance.on('message:new', ({ message }) => {
      const senderId = message?.senderId?._id || message?.senderId;
      const isCurrentActive = activeChatPartnerRef.current && activeChatPartnerRef.current === senderId?.toString();

      if (!isCurrentActive) {
        setUnreadCount((prev) => prev + 1);
        const senderName = message?.senderId?.name || 'Someone';
        setLiveToast({
          id: Date.now(),
          type: 'message',
          title: `New message from ${senderName}`,
          description: message?.content ? (message.content.length > 60 ? `${message.content.slice(0, 60)}...` : message.content) : '',
        });
      }
    });

    // Handle live floor plan / booth updates
    socketInstance.on('booth:updated', ({ action, booth }) => {
      setLiveToast({
        id: Date.now(),
        type: 'booth',
        title: 'Floor Plan Updated',
        description: `Booth ${booth?.boothNumber || ''} status updated to ${booth?.status || ''}.`,
      });
    });

    // Handle live schedule updates
    socketInstance.on('schedule:updated', ({ action, session }) => {
      setLiveToast({
        id: Date.now(),
        type: 'schedule',
        title: 'Event Schedule Updated',
        description: session?.title ? `Session "${session.title}" was ${action}.` : 'The session schedule was updated.',
      });
    });

    // Handle live incoming in-app notifications
    socketInstance.on('notification:new', ({ notification }) => {
      setNotificationCount((prev) => prev + 1);
      setLiveToast({
        id: Date.now(),
        type: notification?.type || 'system',
        title: notification?.title || 'Notification Received',
        description: notification?.message || '',
      });
    });

    setSocket(socketInstance);
    refreshUnreadCount();
    refreshNotificationCount();

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token, refreshUnreadCount, refreshNotificationCount]);

  // Auto-dismiss live toast after 4 seconds
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => {
        setLiveToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  const joinExpo = useCallback(
    (expoId) => {
      if (socket && isConnected && expoId) {
        socket.emit('join:expo', expoId);
      }
    },
    [socket, isConnected]
  );

  const leaveExpo = useCallback(
    (expoId) => {
      if (socket && isConnected && expoId) {
        socket.emit('leave:expo', expoId);
      }
    },
    [socket, isConnected]
  );

  const emitTypingStart = useCallback(
    (receiverId, expoId) => {
      if (socket && isConnected && receiverId) {
        socket.emit('typing:start', { receiverId, expoId });
      }
    },
    [socket, isConnected]
  );

  const emitTypingStop = useCallback(
    (receiverId, expoId) => {
      if (socket && isConnected && receiverId) {
        socket.emit('typing:stop', { receiverId, expoId });
      }
    },
    [socket, isConnected]
  );

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUsers.has(userId.toString());
    },
    [onlineUsers]
  );

  const value = {
    socket,
    isConnected,
    unreadCount,
    setUnreadCount,
    refreshUnreadCount,
    notificationCount,
    setNotificationCount,
    refreshNotificationCount,
    joinExpo,
    leaveExpo,
    emitTypingStart,
    emitTypingStop,
    isUserOnline,
    setActiveChatPartner,
    liveToast,
    clearLiveToast: () => setLiveToast(null),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {/* Global Real-time Live Toast Alert */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 border border-primary-500/40 text-slate-100 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in max-w-md">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary-300 uppercase tracking-wider">{liveToast.title}</p>
            <p className="text-sm text-slate-200 truncate mt-0.5">{liveToast.description}</p>
          </div>
          <button
            onClick={() => setLiveToast(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
