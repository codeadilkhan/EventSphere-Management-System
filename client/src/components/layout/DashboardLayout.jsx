import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { GdprModal } from '../privacy/GdprModal';
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
  HelpCircle,
  ExternalLink,
  Radio
} from 'lucide-react';

export const DashboardLayout = ({ roleTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { unreadCount, isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [gdprOpen, setGdprOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic navigation items based on user role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Executive Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Manage Expos', path: '/admin/expos', icon: Calendar },
        { label: 'Floor Plans & Stalls', path: '/admin/booths', icon: Layers },
        { label: 'Exhibitor Applications', path: '/admin/applications', icon: Store },
        { label: 'Sessions & Schedule', path: '/admin/schedule', icon: Calendar },
        { label: 'Live Communications', path: '/admin/messages', icon: MessageSquare },
        { label: 'Intelligence & Reports', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Feedback & Inquiries', path: '/admin/feedback', icon: Bell },
      ];
    } else if (user?.role === 'exhibitor') {
      return [
        { label: 'Commercial Dashboard', path: '/exhibitor', icon: LayoutDashboard },
        { label: 'My Applications', path: '/exhibitor/applications', icon: Store },
        { label: 'Floor Plan & Stalls', path: '/exhibitor/booths', icon: Layers },
        { label: 'Company Showcase', path: '/exhibitor/profile', icon: Settings },
        { label: 'Buyer Networking', path: '/exhibitor/messages', icon: MessageSquare },
      ];
    } else {
      return [
        { label: 'Attendee Hub', path: '/events/dashboard', icon: LayoutDashboard },
        { label: 'Explore Expos', path: '/events/browse', icon: Compass },
        { label: 'Exhibitor Directory', path: '/events/exhibitors', icon: Store },
        { label: 'My Saved Schedule', path: '/events/my-schedule', icon: Calendar },
        { label: 'Exhibitor Chat', path: '/events/messages', icon: MessageSquare },
      ];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadgeConfig = () => {
    switch (user?.role) {
      case 'admin':
        return { label: 'Organizer Console', color: 'bg-accent-500/15 text-accent-400 border-accent-500/30' };
      case 'exhibitor':
        return { label: 'Exhibitor Suite', color: 'bg-brand-500/15 text-brand-300 border-brand-500/30' };
      default:
        return { label: 'Attendee Portal', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    }
  };

  const roleBadge = getRoleBadgeConfig();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Navy Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#101828] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800 shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-700/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-sans">
                  EventSphere
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
              </div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                International Expos
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Indicator Pill */}
        <div className="px-5 pt-4 pb-2">
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold ${roleBadge.color}`}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
              {roleBadge.label}
            </span>
            <Link to="/" className="text-[10px] underline hover:opacity-80 text-slate-400 flex items-center gap-1">
              Public <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Main Management
          </p>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-700/40 to-slate-800/80 text-white font-bold border-l-4 border-accent-500 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-accent-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Icon === MessageSquare && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-accent-500 text-white text-[10px] font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent-400" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom User Card & Actions */}
        <div className="p-3 border-t border-slate-800/90 bg-[#0a1020]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-700 to-accent-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setGdprOpen(true)}
              className="flex-1 text-center py-2 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              title="GDPR & Privacy Controls"
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Privacy & GDPR</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#101828] tracking-tight">{roleTitle}</h1>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">Enterprise Exhibition & Trade Show Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Gateway Pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Engine Connected</span>
            </div>

            <NotificationBell />

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/60"
              title="Support & Feedback"
            >
              <HelpCircle className="w-4 h-4" />
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

      {/* GDPR & Privacy Self-Service Modal */}
      <GdprModal isOpen={gdprOpen} onClose={() => setGdprOpen(false)} />
    </div>
  );
};
