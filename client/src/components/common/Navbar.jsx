import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { FeedbackModal } from '../feedback/FeedbackModal';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Layers,
  Store,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Shield,
  Briefcase,
  Users,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Globe2
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Shield className="w-3 h-3 text-amber-700" /> Organizer
          </span>
        );
      case 'exhibitor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            <Briefcase className="w-3 h-3 text-brand-600" /> Exhibitor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Users className="w-3 h-3 text-emerald-600" /> Attendee
          </span>
        );
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'exhibitor') return '/exhibitor';
    return '/events/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#101828] via-[#4338CA] to-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-brand-700/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#101828] tracking-tight font-sans">
                  EventSphere
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-accent-50 text-accent-600 border border-accent-200">
                  Global
                </span>
              </div>
              <span className="block text-[11px] font-bold text-brand-700 tracking-wider uppercase -mt-0.5">
                Expo & Trade Show Management
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/'
                  ? 'text-brand-700 bg-brand-50 shadow-xs'
                  : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100/70'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/events'
                  ? 'text-brand-700 bg-brand-50 shadow-xs'
                  : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100/70'
              }`}
            >
              Browse Expos
            </Link>
            <Link
              to="/schedule"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/schedule'
                  ? 'text-brand-700 bg-brand-50 shadow-xs'
                  : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100/70'
              }`}
            >
              Keynote Schedule
            </Link>
            <Link
              to="/exhibitors"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === '/exhibitors'
                  ? 'text-brand-700 bg-brand-50 shadow-xs'
                  : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100/70'
              }`}
            >
              Exhibitor Directory
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/messages"
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname.startsWith('/messages')
                      ? 'text-brand-700 bg-brand-50 shadow-xs'
                      : 'text-slate-600 hover:text-[#101828] hover:bg-slate-100/70'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-accent-500 text-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    title={isConnected ? 'Live Socket Connected' : 'Connecting'}
                  />
                </Link>

                <Link
                  to={getDashboardLink()}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/exhibitor') ||
                    location.pathname.startsWith('/events/dashboard')
                      ? 'text-accent-600 bg-accent-50 shadow-xs'
                      : 'text-brand-700 bg-brand-50/70 hover:bg-brand-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600" />
                  Management Portal
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions / User Pill */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="p-2.5 rounded-xl text-slate-600 hover:text-[#101828] hover:bg-slate-100 transition-colors border border-slate-200/70 shadow-xs"
                  title="Feedback & Inquiries"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <div className="relative ml-1">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200/90 hover:border-brand-300 bg-white shadow-xs hover:shadow-md transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#101828] to-[#4338CA] text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col pr-1">
                      <span className="text-xs font-bold text-[#101828] leading-tight">
                        {user?.name}
                      </span>
                      <div className="scale-90 origin-left mt-0.5">
                        {getRoleBadge(user?.role)}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-[#101828] truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        Dashboard Console
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#101828] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] rounded-xl shadow-md shadow-brand-700/25 hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Register Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl px-5 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50"
          >
            Overview
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50"
          >
            Browse Expos
          </Link>
          <Link
            to="/schedule"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50"
          >
            Keynote Schedule
          </Link>
          <Link
            to="/exhibitors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-brand-50"
          >
            Exhibitor Directory
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="px-3 py-2 flex items-center justify-between bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-extrabold text-[#101828]">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                {getRoleBadge(user?.role)}
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-700 bg-brand-50"
              >
                Go to Management Console
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-700 to-accent-500 rounded-xl shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Inquiries & Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </nav>
  );
};
