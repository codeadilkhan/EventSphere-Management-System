import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Layers,
  ChevronDown,
  ArrowUpRight,
  Eye,
  Bookmark,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PieChart as PieIcon,
  Search
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { expoService } from '../../services/expoService';
import { useSocket } from '../../context/SocketContext';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export const AdminAnalytics = () => {
  const { isConnected } = useSocket();
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('ALL');
  const [days, setDays] = useState(14);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('trends'); // 'trends' | 'booths' | 'sessions' | 'raw'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Data states
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [boothData, setBoothData] = useState({ topBooths: [], categoryDistribution: [] });
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Active series toggles for trends chart
  const [seriesToggles, setSeriesToggles] = useState({
    pageViews: true,
    registrations: true,
    boothViews: true,
    bookmarks: true,
    messages: true,
  });

  // Load list of exhibitions for dropdown
  useEffect(() => {
    const fetchExpos = async () => {
      try {
        const res = await expoService.getExpos();
        const list = res.data?.expos || res.expos || [];
        setExpos(list);
      } catch (err) {
        console.warn('Failed to load expos list:', err);
      }
    };
    fetchExpos();
  }, []);

  // Fetch all analytics reports for the selected expo & range
  const loadAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [overviewRes, timelineRes, boothRes, sessionRes] = await Promise.all([
        analyticsService.getOverview(selectedExpoId),
        analyticsService.getEngagement(selectedExpoId, days),
        analyticsService.getBoothTraffic(selectedExpoId, 10),
        analyticsService.getSessionPopularity(selectedExpoId),
      ]);

      setOverview(overviewRes.overview || null);
      setTimeline(timelineRes || []);
      setBoothData(boothRes || { topBooths: [], categoryDistribution: [] });
      setSessions(sessionRes || []);
    } catch (error) {
      console.error('Failed to load analytics datasets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedExpoId, days]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Periodic 30s auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadAnalytics]);

  // CSV download trigger
  const handleExport = async (type) => {
    try {
      setExporting(true);
      setExportOpen(false);
      await analyticsService.downloadCsv(selectedExpoId, type);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const toggleSeries = (key) => {
    setSeriesToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedExpoName =
    selectedExpoId === 'ALL'
      ? 'All Active Exhibitions'
      : expos.find((e) => e._id === selectedExpoId)?.title || 'Selected Expo';

  // Filtered sessions for raw table
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.speakerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hall.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Executive Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" /> Executive Analytics & Intelligence
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Event Intelligence & Reporting
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Real-time attendee engagement metrics, commercial floor footfall heatmaps, keynote room capacity rates, and automated CSV report generation.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Expo Selector */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedExpoId}
                onChange={(e) => setSelectedExpoId(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">🌐 All Exhibitions (Aggregate)</option>
                {expos.map((expo) => (
                  <option key={expo._id} value={expo._id}>
                    🏛️ {expo.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Time Window Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { label: '7D', val: 7 },
                { label: '14D', val: 14 },
                { label: '30D', val: 30 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setDays(opt.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    days === opt.val
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadAnalytics(true)}
              disabled={refreshing}
              title="Refresh Analytics Data"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              {autoRefresh ? '30s Auto' : 'Auto Off'}
            </button>

            {/* CSV Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/30"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Generating...' : 'Export CSV'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {exportOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Select Report Dataset
                  </div>
                  <button
                    onClick={() => handleExport('overview')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-between"
                  >
                    <span>Executive Overview</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">KPIs</span>
                  </button>
                  <button
                    onClick={() => handleExport('engagement')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-between"
                  >
                    <span>Engagement Timeline</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Daily</span>
                  </button>
                  <button
                    onClick={() => handleExport('booths')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-between"
                  >
                    <span>Floor Plan & Booths</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Stalls</span>
                  </button>
                  <button
                    onClick={() => handleExport('sessions')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center justify-between"
                  >
                    <span>Keynote Sessions</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Seats</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Attendees */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Attendees</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {overview?.totalAttendees || 0}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> High Turnout
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {overview?.totalExpoRegistrations || 0} general badges · {overview?.totalSessionRegistrations || 0} keynote seats
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Booth Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-brand-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commercial Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                ${(overview?.booths?.totalRevenue || 0).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-brand-600">
                {overview?.booths?.occupancyRate || 0}% Realized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Potential: ${(overview?.booths?.potentialRevenue || 0).toLocaleString()} across all stalls
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overview?.booths?.occupancyRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Stall Occupancy */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stall Occupancy Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {overview?.booths?.occupancyRate || 0}%
              </span>
              <span className="text-xs font-bold text-purple-600">
                {overview?.booths?.allocated || 0} / {overview?.booths?.total || 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {overview?.booths?.available || 0} vacant stalls remaining on floor plan
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overview?.booths?.occupancyRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Session Fill Rate */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Capacity Fill</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {overview?.sessions?.averageFillRate || 0}%
              </span>
              <span className="text-xs font-bold text-amber-600">
                {overview?.sessions?.registeredSeats || 0} / {overview?.sessions?.totalCapacity || 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Across {overview?.sessions?.total || 0} scheduled keynote presentations
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overview?.sessions?.averageFillRate || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'trends', label: 'Engagement & Footfall Trends', icon: TrendingUp },
          { id: 'booths', label: 'Commercial Booth Traffic', icon: Store },
          { id: 'sessions', label: 'Keynote & Seat Popularity', icon: Calendar },
          { id: 'raw', label: 'Auditable Data Tables', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Engagement & Footfall Trends */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Activity & Interaction Time-Series</h3>
                <p className="text-xs text-slate-500">
                  Daily registrations, bookmarking activity, live booth visits, and inquiries over the last {days} days.
                </p>
              </div>

              {/* Metric Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'pageViews', label: 'Page Views', color: 'bg-blue-500' },
                  { key: 'registrations', label: 'Registrations', color: 'bg-emerald-500' },
                  { key: 'boothViews', label: 'Booth Visits', color: 'bg-purple-500' },
                  { key: 'bookmarks', label: 'Bookmarks', color: 'bg-amber-500' },
                  { key: 'messages', label: 'Inquiries', color: 'bg-pink-500' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleSeries(item.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      seriesToggles[item.key]
                        ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-sm'
                        : 'bg-transparent border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-80 w-full pt-4">
              {timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBoothViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBookmarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {seriesToggles.pageViews && (
                      <Area
                        type="monotone"
                        dataKey="pageViews"
                        name="Page Views"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPageViews)"
                      />
                    )}
                    {seriesToggles.registrations && (
                      <Area
                        type="monotone"
                        dataKey="registrations"
                        name="Registrations"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRegistrations)"
                      />
                    )}
                    {seriesToggles.boothViews && (
                      <Area
                        type="monotone"
                        dataKey="boothViews"
                        name="Booth Visits"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBoothViews)"
                      />
                    )}
                    {seriesToggles.bookmarks && (
                      <Area
                        type="monotone"
                        dataKey="bookmarks"
                        name="Bookmarks"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBookmarks)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No engagement timeline activity recorded for this period.
                </div>
              )}
            </div>

            {/* Bottom Summary Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Exposure</span>
                  <p className="text-base font-extrabold text-slate-900">
                    {overview?.traffic?.pageViews || 0} Views
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Stall Inquiries</span>
                  <p className="text-base font-extrabold text-slate-900">
                    {overview?.traffic?.boothViews || 0} Booth Impressions
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Agenda Bookmarks</span>
                  <p className="text-base font-extrabold text-slate-900">
                    {overview?.totalBookmarks || 0} Sessions Saved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Commercial Booth Traffic */}
      {activeTab === 'booths' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Booths Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Top Visited Commercial Booths</h3>
                <p className="text-xs text-slate-500">
                  Ranked by visitor footfall, floor plan interactions, and attendee profile views.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Top {boothData.topBooths.length} Stalls
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              {boothData.topBooths.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boothData.topBooths} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="boothNumber"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val, name, item) => [
                        `${val} views (${item.payload.exhibitorName})`,
                        'Traffic',
                      ]}
                    />
                    <Bar dataKey="views" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No booth footfall logged yet.
                </div>
              )}
            </div>

            {/* Booth Leaderboard Table */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Stall Performance Leaderboard
              </h4>
              <div className="divide-y divide-slate-100">
                {boothData.topBooths.slice(0, 5).map((booth, idx) => (
                  <div key={booth._id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">
                            Booth {booth.boothNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600">
                            {booth.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{booth.exhibitorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900">{booth.views} Views</span>
                      <span className="block text-[10px] text-purple-600 font-bold">
                        {booth.trafficShare}% of total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stall Category Distribution Pie */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-500">Stall classification on current exhibition layout.</p>
            </div>

            <div className="h-64 w-full">
              {boothData.categoryDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={boothData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {boothData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No booth categories available.
                </div>
              )}
            </div>

            {/* Category breakdown stats */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {boothData.categoryDistribution?.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {cat.count} stalls ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Keynote & Seat Popularity */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Keynote Capacity & Utilization Rate</h3>
              <p className="text-xs text-slate-500">
                Track reserved attendee seats against hall limits to prevent overbooking and identify peak speaker demand.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {sessions.length} Scheduled Keynotes
            </span>
          </div>

          {/* Double Bar Chart */}
          <div className="h-80 w-full pt-4">
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessions} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="title"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tickFormatter={(val) => (val.length > 18 ? `${val.slice(0, 16)}...` : val)}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                  <Bar dataKey="registeredCount" name="Booked Attendees" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="capacity" name="Room Capacity" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No session schedule registered for this exhibition.
              </div>
            )}
          </div>

          {/* High Demand Warning Alert if any session >= 85% full */}
          {sessions.some((s) => s.fillRate >= 85) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs">High Keynote Demand Detected</h5>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  One or more conference rooms have reached over 85% seating capacity. Consider upgrading the hall assignment in Schedule Management.
                </p>
              </div>
            </div>
          )}

          {/* Session Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {session.hall}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      session.fillRate >= 90
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : session.fillRate >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {session.fillRate}% Full
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{session.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Speaker: <span className="font-semibold text-slate-700">{session.speakerName}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Seats Filled</span>
                    <span className="font-extrabold text-slate-800">
                      {session.registeredCount} / {session.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        session.fillRate >= 90
                          ? 'bg-rose-500'
                          : session.fillRate >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(session.fillRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Auditable Data Tables & Immediate Export */}
      {activeTab === 'raw' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Auditable System Datasets</h3>
              <p className="text-xs text-slate-500">
                Detailed breakdowns with instant one-click CSV download for compliance and administrative reporting.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
                />
              </div>

              <button
                onClick={() => handleExport('sessions')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Sessions CSV
              </button>
              <button
                onClick={() => handleExport('booths')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Booths CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Session Title</th>
                  <th className="py-3.5 px-4">Speaker</th>
                  <th className="py-3.5 px-4">Hall</th>
                  <th className="py-3.5 px-4 text-center">Capacity</th>
                  <th className="py-3.5 px-4 text-center">Registered</th>
                  <th className="py-3.5 px-4 text-center">Fill Rate</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.title}</td>
                      <td className="py-3 px-4 text-slate-600">{s.speakerName}</td>
                      <td className="py-3 px-4">{s.hall}</td>
                      <td className="py-3 px-4 text-center">{s.capacity}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{s.registeredCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            s.fillRate >= 90
                              ? 'bg-rose-50 text-rose-600'
                              : s.fillRate >= 60
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {s.fillRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="capitalize text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
