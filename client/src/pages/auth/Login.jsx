import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Briefcase,
  Users,
  Loader2,
  CheckCircle2,
  Globe2,
  Award
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);

        // Role-based smart redirection
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'exhibitor') {
          navigate('/exhibitor', { replace: true });
        } else {
          navigate('/events/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fill Demo Credentials for instant evaluation
  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@eventsphere.com');
      setPassword('Admin@123456');
    } else if (role === 'exhibitor') {
      setEmail('exhibitor1@eventsphere.com');
      setPassword('Exhibitor@123');
    } else {
      setEmail('attendee1@eventsphere.com');
      setPassword('Attendee@123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Left Side: Premium Brand Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#101828] via-[#1a1f5e] to-[#101828] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4338CA] to-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-brand-700/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">EventSphere</span>
            </Link>

            <div className="space-y-2 pt-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Enterprise Gateway
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Welcome to the International Trade Show Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Access your designated organizer controls, exhibitor commercial suite, or attendee exhibition itinerary.
              </p>
            </div>

            <div className="space-y-3 pt-4 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-hall real-time floor plans & stall status</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live Socket.IO instant messaging & networking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ISO/IEC aligned role-based encryption</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Aptech eProject Standard</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-accent-400" /> Global Edition
            </span>
          </div>
        </div>

        {/* Right Side: Form & Evaluator Credentials (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-extrabold text-[#101828] tracking-tight">
              Sign In to Your Account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your corporate credentials to access your stakeholder dashboard.
            </p>
          </div>

          {/* Quick Evaluator Role Selector Pills */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-accent-500" /> 1-Click Evaluator Auto-Fill
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white hover:bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Shield className="w-3 h-3 text-amber-600" /> Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('exhibitor')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white hover:bg-brand-50 text-brand-700 border border-brand-200/80 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3 h-3 text-brand-600" /> Exhibitor
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('attendee')}
                className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Users className="w-3 h-3 text-emerald-600" /> Attendee
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-brand-700 hover:text-accent-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-xl shadow-lg shadow-brand-700/20 hover:shadow-xl hover:shadow-accent-500/25 transition-all text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don't have an enterprise account?{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:text-accent-500 underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
