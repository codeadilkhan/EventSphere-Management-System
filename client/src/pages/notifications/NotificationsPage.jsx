import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  Layers,
  Calendar,
  Briefcase,
  Sparkles,
  Loader2,
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notificationCount, refreshNotificationCount, socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({
        page,
        limit: 20,
        unreadOnly: filterUnreadOnly,
      });
      setNotifications(res.data?.notifications || []);
      setPagination(res.data?.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, filterUnreadOnly]);

  // Live real-time socket listener
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = () => {
      fetchNotifications();
    };
    socket.on('notification:new', handleNewNotif);
    return () => socket.off('notification:new', handleNewNotif);
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshNotificationCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all your notification history?')) return;
    try {
      await notificationService.clearAll();
      setNotifications([]);
      refreshNotificationCount();
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      refreshNotificationCount();
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        refreshNotificationCount();
      } catch (e) {}
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'application_update':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'booth_allocated':
        return <Layers className="w-5 h-5 text-emerald-600" />;
      case 'schedule_change':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-600" />;
    }
  };

  const filteredList = notifications.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Activity Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
            <Bell className="w-8 h-8 text-brand-600" />
            Notifications & System Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates regarding your booth allocations, session schedules, and organizer decisions.
          </p>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.read)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-bold rounded-xl text-xs transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            Mark All as Read
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'ALL', label: 'All Notices' },
            { id: 'application_update', label: 'Applications' },
            { id: 'booth_allocated', label: 'Stall Allocations' },
            { id: 'schedule_change', label: 'Schedule Updates' },
            { id: 'reminder', label: 'Reminders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer pr-2">
          <input
            type="checkbox"
            checked={filterUnreadOnly}
            onChange={(e) => setFilterUnreadOnly(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500/20"
          />
          Show Unread Only
        </label>
      </div>

      {/* Notifications Stream */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching your notification stream...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Notifications Matching Filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have no notifications in this category. Live system updates will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item._id}
              onClick={() => handleItemClick(item)}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-2xs ${
                !item.read
                  ? 'bg-white border-brand-200 hover:border-brand-400 shadow-soft'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getNotifIcon(item.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    {!item.read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-50 text-brand-700 border border-brand-200">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.link && (
                      <>
                        <span>&bull;</span>
                        <span className="text-brand-600 font-bold group-hover:underline flex items-center gap-1">
                          Navigate <ExternalLink className="w-3 h-3" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(item._id, e)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
