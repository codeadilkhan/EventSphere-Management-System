import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { FeedbackModal } from '../feedback/FeedbackModal';
import {
  LayoutDashboard,
  Calendar,
  Store,
  Layers,
  BarChart3,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Shield,
  Briefcase,
  Users,
  Compass,
  HelpCircle
} from 'lucide-react';

export const DashboardLayout = ({ roleTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { unreadCount, isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic navigation items based on user role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Manage Expos', path: '/admin/expos', icon: Calendar },
        { label: 'Floor Plans & Booths', path: '/admin/booths', icon: Layers },
        { label: 'Exhibitor Applications', path: '/admin/applications', icon: Store },
        { label: 'Event Schedule', path: '/admin/schedule', icon: Calendar },
        { label: 'Live Messages', path: '/admin/messages', icon: MessageSquare },
        { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Feedback & Support', path: '/admin/feedback', icon: Bell },
      ];
    } else if (user?.role === 'exhibitor') {
      return [
        { label: 'Overview', path: '/exhibitor', icon: LayoutDashboard },
        { label: 'My Applications', path: '/exhibitor/applications', icon: Store },
        { label: 'Floor Plan & Select Booth', path: '/exhibitor/booths', icon: Layers },
        { label: 'Company Profile & Showcase', path: '/exhibitor/profile', icon: Settings },
        { label: 'Messages & Networking', path: '/exhibitor/messages', icon: MessageSquare },
      ];
    } else {
      return [
        { label: 'My Dashboard', path: '/events/dashboard', icon: LayoutDashboard },
        { label: 'Browse Expos', path: '/events/browse', icon: Compass },
        { label: 'Exhibitor Directory', path: '/events/exhibitors', icon: Store },
        { label: 'My Registered Sessions', path: '/events/my-schedule', icon: Calendar },
        { label: 'Direct Messages', path: '/events/messages', icon: MessageSquare },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">EventSphere</span>
              <span className="block text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                {user?.role} portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Icon === MessageSquare && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-brand-600" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-sm mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 text-center py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile trigger and notifications */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">{roleTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Gateway Active
            </div>

            <NotificationBell />

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Support & Feedback"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Support & Feedback Drawer Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
};
