import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  Sparkles,
  Layers,
  Calendar,
  Store,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  BarChart3,
  MessageSquare
} from 'lucide-react';

export const Home = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  // Ping backend health route on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const res = await authService.checkHealth();
        setHealthStatus(res.data);
        setHealthError(null);
      } catch (err) {
        setHealthError(err.message || 'Cannot reach backend server');
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    // Auto-refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Background decorative gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-brand-300/30 to-purple-300/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Next-Gen Trade Show & Expo Virtuality
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Digitize Exhibitions with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">EventSphere</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            The end-to-end platform for organizers, exhibitors, and attendees. Interactive booth layouts, dynamic session scheduling, and real-time networking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35 transition-all text-sm"
            >
              Explore Active Expos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200/90 shadow-sm hover:shadow transition-all text-sm"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* Quick Demo Credentials Card for Easy Testing */}
          <div className="max-w-3xl mx-auto mt-10 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs text-amber-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold">
                ℹ
              </span>
              <div>
                <p className="font-bold">Evaluation & Demo Accounts (Password: Password123!)</p>
                <p className="text-amber-700">Admin: admin@eventsphere.com | Exhibitor: exhibitor1@eventsphere.com | Attendee: attendee1@eventsphere.com</p>
              </div>
            </div>
            <Link
              to="/login"
              className="whitespace-nowrap px-3 py-1.5 bg-amber-800 text-white font-semibold rounded-lg hover:bg-amber-900 transition-colors"
            >
              Quick Login
            </Link>
          </div>
        </div>
      </section>

      {/* Live System Health Monitor (Task 01 Acceptance Criterion) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">EventSphere Engine & API Monitor</h3>
                <p className="text-xs text-slate-400">Live communication test between React Client and Express Server</p>
              </div>
            </div>

            {/* Status indicator badge */}
            <div>
              {healthLoading ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Checking Service...
                </span>
              ) : healthStatus ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  API Connected (200 OK)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Backend Offline
                </span>
              )}
            </div>
          </div>

          {/* Diagnostic Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Service Core</span>
              <span className="font-semibold text-slate-200">
                {healthStatus?.service || 'EventSphere Core'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Environment</span>
              <span className="font-semibold text-slate-200 uppercase tracking-wide">
                {healthStatus?.nodeEnvironment || 'development'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Database State</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {healthStatus?.databaseStatus || 'Ready / Active'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Uptime</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {healthStatus ? `${healthStatus.uptimeSeconds}s operational` : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Ecosystem Showcase (Three Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Purpose-built workflows engineered to optimize event operations, exhibitor sales, and visitor engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Organizers */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-xl hover:border-brand-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Admin & Organizers</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Full-lifecycle control. Create multi-day expos, design custom booth layouts, approve company applications, manage session conflicts, and export engagement analytics.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:text-brand-700"
              >
                Organizer Management <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Exhibitors */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-xl hover:border-purple-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Exhibitors & Sponsors</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Elevate your commercial presence. Submit applications with corporate documentation, select desired booth locations on the interactive map, and chat directly with leads.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/exhibitor"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:text-purple-700"
              >
                Exhibitor Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Attendees */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Attendees & Visitors</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Seamless discovery. Browse verified exhibitors, locate stalls on the floor plan, bookmark keynotes, receive automated 30-min reminders, and network in real-time.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700"
              >
                Attendee Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-slate-100/80 to-slate-50 border border-slate-200/70">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Engineered for Reliability & Scale</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Built according to strict software engineering standards for Aptech eProject.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Interactive Floor Plans</h4>
              <p className="text-xs text-slate-500">Atomic booth reservation prevents double-booking disputes.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Real-time Socket Sync</h4>
              <p className="text-xs text-slate-500">Immediate schedule updates and in-app instant messaging.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Visual Analytics</h4>
              <p className="text-xs text-slate-500">Engagement KPIs, booth footfall trends, and CSV data exports.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Security & Privacy</h4>
              <p className="text-xs text-slate-500">Rate limiting, Helmet headers, Joi sanitization, and consent audit.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
