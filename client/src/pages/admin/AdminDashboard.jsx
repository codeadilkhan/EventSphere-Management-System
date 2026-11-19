import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { expoService } from '../../services/expoService';
import { applicationService } from '../../services/applicationService';
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
  Clock,
  Sparkles,
  DollarSign,
  Activity,
  AlertCircle,
  ChevronRight,
  Building2,
  PieChart,
  Eye,
  FileText
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeExpos: 0,
    occupancyRate: 0,
    allocatedBooths: 0,
    totalBooths: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    totalSessions: 0,
    pendingApps: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        setLoading(true);
        const [overviewRes, exposRes, appsRes] = await Promise.all([
          analyticsService.getOverview('ALL'),
          expoService.getExpos(),
          applicationService.getApplications().catch(() => ({ data: [] })),
        ]);

        const ov = overviewRes.overview || {};
        const exposList = exposRes.data?.expos || exposRes.expos || [];
        const appsList = appsRes.data?.applications || appsRes.data || [];
        const pendingCount = Array.isArray(appsList)
          ? appsList.filter((a) => a.status === 'pending').length
          : 0;

        setStats({
          activeExpos: exposList.length || 0,
          occupancyRate: ov.booths?.occupancyRate || 0,
          allocatedBooths: ov.booths?.allocated || 0,
          totalBooths: ov.booths?.total || 0,
          totalAttendees: ov.totalAttendees || 0,
          totalRevenue: ov.booths?.totalRevenue || 0,
          totalSessions: ov.sessions?.total || 0,
          pendingApps: pendingCount,
        });
      } catch (err) {
        console.warn('Dashboard stats load fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Executive Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#101828] via-[#1a1f5e] to-[#101828] text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-500/20 text-accent-400 text-xs font-extrabold border border-accent-500/30">
              <Shield className="w-3.5 h-3.5" /> Organizer Executive Console
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Global command center for international trade fairs. Monitor stall allocation velocity, review pending exhibitor applications, and track live visitor telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/expos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-accent-500/25 hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              New Exhibition
            </Link>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border border-white/20"
            >
              <BarChart3 className="w-4 h-4" />
              Intelligence Hub
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Operational Metrics Strip (6 stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expos</span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#101828]">{stats.activeExpos}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Active Catalog</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupancy</span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-[#4338CA] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#4338CA]">{stats.occupancyRate}%</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {stats.allocatedBooths} of {stats.totalBooths} Stalls
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Apps</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{stats.pendingApps}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Awaiting Review</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attendees</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#101828]">{stats.totalAttendees}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Registered Passes</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#101828]">{stats.totalSessions}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Keynotes & Panels</span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stall Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-700">
              ${stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Commercial Bookings</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Operations Grid (6 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#101828]">Executive Operation Suites</h3>
            <p className="text-xs text-slate-500">Core administrative workflows for multi-venue trade show operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/expos"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-brand-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-brand-700 transition-colors">
              Exposition Architecture & Setup
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define event titles, multi-day scheduling, upload venue credentials, and configure hall capacities.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700">
              Manage Expos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/booths"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-accent-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-accent-600 transition-colors">
              Floor Plan Grid & Stall Allocator
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect interactive stall maps, assign approved exhibitors to vacant booths, and set premium pricing tiers.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-accent-600">
              Configure Floor Plans <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/applications"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-amber-700 transition-colors">
              Exhibitor Commercial Applications
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review corporate documents, approve stall reservations, and dispatch official commercial admission notices.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
              Review Submissions ({stats.pendingApps}) <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/schedule"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-blue-700 transition-colors">
              Keynotes & Agenda Scheduler
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Schedule plenary sessions, assign keynote stages, manage speaker bios, and trigger automated attendee reminders.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              Configure Agendas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-purple-700 transition-colors">
              Telemetry & Visitor Intelligence
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor real-time stall footfall heatmaps, keynote attendance vs room capacity, and generate audit reports.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-purple-700">
              Open Intelligence <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/feedback"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-emerald-700 transition-colors">
              Attendee Feedback & Inquiries
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect submitted event reviews, quality ratings, support requests, and visitor inquiries across all trade shows.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              View Inquiries <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
