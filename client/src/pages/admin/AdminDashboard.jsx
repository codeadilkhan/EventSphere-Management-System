import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield,
  Calendar,
  Layers,
  Store,
  Users,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Shield className="w-3.5 h-3.5" /> Administrator Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Manage exhibitions, approve commercial exhibitors, inspect floor plan allocations, and monitor live attendee engagement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/expos"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Expos
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Expos</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">4</span>
            <span className="text-[11px] text-emerald-600 font-semibold ml-2">● 2 Live Now</span>
          </div>
          <p className="text-[11px] text-slate-400">Scheduled across 2026 calendar</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booth Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">78%</span>
            <span className="text-[11px] text-purple-600 font-semibold ml-2">156/200</span>
          </div>
          <p className="text-[11px] text-slate-400">44 available stalls remaining</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exhibitor Apps</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">12</span>
            <span className="text-[11px] text-amber-700 font-semibold ml-2">Pending Review</span>
          </div>
          <p className="text-[11px] text-slate-400">Documentation uploaded</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Attendees</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">1,420</span>
            <span className="text-[11px] text-emerald-600 font-semibold ml-2">+18% this wk</span>
          </div>
          <p className="text-[11px] text-slate-400">Active session registrations</p>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Management Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/expos"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Expos & Floor Plan Setup</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create and publish new trade shows, upload banners, and configure booth dimensions and pricing.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600">
              Manage Expos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/admin/applications"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-500 hover:shadow-lg transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Exhibitor Applications</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review corporate submissions, inspect attached certificates, approve booths, or send rejection feedback.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600">
              Review Applications <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900">Analytics & Reports</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track real-time footfall per booth, keynote attendance against capacity, and download CSV reports.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">
              Open Analytics <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
