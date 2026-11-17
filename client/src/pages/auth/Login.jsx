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
  Loader2
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
          navigate('/events', { replace: true });
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
      setPassword('Password123!');
    } else if (role === 'exhibitor') {
      setEmail('exhibitor1@eventsphere.com');
      setPassword('Password123!');
    } else {
      setEmail('attendee1@eventsphere.com');
      setPassword('Password123!');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to EventSphere
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in with your role-authorized credentials
          </p>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="p-3.5 bg-brand-50/70 border border-brand-100 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-900">
              1-Click Demo Fill:
            </span>
            <span className="text-[10px] text-brand-600 font-medium">Evaluation Shortcuts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-brand-100/50 border border-brand-200 text-brand-800 rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              <Shield className="w-3 h-3 text-amber-600" /> Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('exhibitor')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-brand-100/50 border border-brand-200 text-brand-800 rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              <Briefcase className="w-3 h-3 text-purple-600" /> Exhibitor
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('attendee')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-brand-100/50 border border-brand-200 text-brand-800 rounded-lg text-xs font-semibold transition-all shadow-2xs"
            >
              <Users className="w-3 h-3 text-blue-600" /> Attendee
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@eventsphere.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Session...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
