import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import {
  Sparkles,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Users,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Globe2,
  Eye,
  EyeOff
} from 'lucide-react';

export const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'attendee', // attendee, exhibitor, or admin
    consentGiven: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!formData.consentGiven) {
      setErrorMessage('You must review and consent to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        consentGiven: formData.consentGiven,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);

        // Redirect based on selected role
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'exhibitor') {
          navigate('/exhibitor', { replace: true });
        } else {
          navigate('/events/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please review your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Left Side: Brand & Role Highlights (5 cols) */}
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

            <div className="space-y-2 pt-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-500/20 text-accent-400 border border-accent-500/30">
                Join the Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                One Platform. Three Powerful Experiences.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Select your intended operational role to unlock specialized exhibition tools tailored to your workflow.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Organizer / Admin
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Host expos, create multi-hall stall grids, approve brands.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="font-bold text-brand-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Commercial Exhibitor
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Book stalls on interactive floor maps, showcase products, chat leads.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Attendee / Buyer
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Navigate stalls, bookmark keynote sessions, instant chat with booths.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Enterprise Encrypted</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-accent-400" /> ISO 27001 Aligned
            </span>
          </div>
        </div>

        {/* Right Side: Registration Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-extrabold text-[#101828] tracking-tight">
              Create Your Stakeholder Account
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete the verification profile below to enter EventSphere.
            </p>
          </div>

          {/* 3-Way Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Select Your Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('attendee')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  formData.role === 'attendee'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className={`w-4 h-4 ${formData.role === 'attendee' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Attendee</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('exhibitor')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  formData.role === 'exhibitor'
                    ? 'border-[#4338CA] bg-brand-50/70 text-[#4338CA] shadow-sm ring-1 ring-[#4338CA]'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Briefcase className={`w-4 h-4 ${formData.role === 'exhibitor' ? 'text-[#4338CA]' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Exhibitor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  formData.role === 'admin'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-sm ring-1 ring-amber-500'
                    : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${formData.role === 'admin' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">Organizer</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="consentGiven"
                name="consentGiven"
                checked={formData.consentGiven}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-700 cursor-pointer"
              />
              <label htmlFor="consentGiven" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-brand-700 font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and acknowledge the{' '}
                <Link to="/privacy" className="text-brand-700 font-bold hover:underline">
                  Privacy Policy
                </Link>{' '}
                under GDPR consent audit.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-xl shadow-lg shadow-brand-700/20 hover:shadow-xl hover:shadow-accent-500/25 transition-all text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Account...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-1 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-700 hover:text-accent-500 underline">
              Sign In to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
