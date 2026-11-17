import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Layers,
  Calendar,
  Briefcase,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const NotificationBell = () => {
  const { notificationCount, refreshNotificationCount, socket } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load latest notifications when dropdown opens
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 6 });
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      fetchRecentNotifications();
    }
  }, [dropdownOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to new socket notifications to refresh if dropdown is open
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = () => {
      if (dropdownOpen) {
        fetchRecentNotifications();
      }
    };
    socket.on('notification:new', handleNewNotif);
    return () => socket.off('notification:new', handleNewNotif);
  }, [socket, dropdownOpen]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshNotificationCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  // Click on a single notification
  const handleItemClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        refreshNotificationCount();
      } catch (e) {
        // Continue navigation regardless
      }
    }
    setDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'application_update':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'booth_allocated':
        return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'schedule_change':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-rose-600 text-white rounded-full ring-2 ring-white animate-pulse">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-scale-up overflow-hidden">
          {/* Header */}
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
              {notificationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                  {notificationCount} New
                </span>
              )}
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                <p className="text-xs text-slate-400">Loading notices...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Notifications</p>
                <p className="text-[11px] text-slate-400">
                  You're all caught up! Updates about keynotes, booth allocations, and applications appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    !item.read
                      ? 'bg-brand-50/40 hover:bg-brand-50/70 border-l-4 border-brand-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>

                    {item.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:underline mt-1">
                        View details &rarr;
                      </span>
                    )}
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pt-3 pb-1 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/notifications"
              onClick={() => setDropdownOpen(false)}
              className="text-slate-600 hover:text-slate-900 font-semibold"
            >
              View All History
            </Link>
            <span className="text-[11px] text-slate-400">Live Gateway Sync</span>
          </div>
        </div>
      )}
    </div>
  );
};
