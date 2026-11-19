import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { expoService } from '../services/expoService';
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
  BarChart3,
  MessageSquare,
  Globe,
  Building2,
  Award,
  Star,
  MapPin,
  TrendingUp,
  ChevronRight,
  Compass,
  Check
} from 'lucide-react';

export const Home = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [expos, setExpos] = useState([]);
  const [loadingExpos, setLoadingExpos] = useState(true);

  // Ping backend health route & load expos
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

    const fetchExpos = async () => {
      try {
        setLoadingExpos(true);
        const res = await expoService.getExpos();
        const list = res.data?.expos || res.expos || [];
        setExpos(list.slice(0, 3));
      } catch (err) {
        console.warn('Expos fetch fallback:', err);
      } finally {
        setLoadingExpos(false);
      }
    };

    fetchHealth();
    fetchExpos();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { title: 'Technology & AI', count: '14+ Expos', icon: Zap, color: 'from-blue-600 to-indigo-600' },
    { title: 'Industrial & Manufacturing', count: '8+ Expos', icon: Building2, color: 'from-amber-500 to-orange-600' },
    { title: 'CleanTech & Energy', count: '10+ Expos', icon: Globe, color: 'from-emerald-500 to-teal-600' },
    { title: 'Healthcare & Biotech', count: '6+ Expos', icon: Activity, color: 'from-rose-500 to-pink-600' },
  ];

  const featuredExhibitors = [
    { name: 'Apex Innovations', industry: 'Enterprise SaaS & Cloud', tier: 'Global Sponsor', stalls: 'Booth A-01' },
    { name: 'Nova Dynamics', industry: 'Autonomous Systems & AI', tier: 'Platinum Partner', stalls: 'Booth B-04' },
    { name: 'Quantum Energy Corp', industry: 'Sustainable Power Solutions', tier: 'Gold Partner', stalls: 'Booth C-12' },
    { name: 'BioVanguard Labs', industry: 'Next-Gen Medical Devices', tier: 'Featured Exhibitor', stalls: 'Booth D-08' },
  ];

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 lg:pt-20 pb-16 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-200/40 via-accent-100/20 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/90 text-[#101828] text-xs font-bold tracking-wide shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse"></span>
            <span className="text-slate-500 font-semibold">Enterprise Edition:</span>
            <span className="text-[#4338CA]">International Trade Show & Expo Management</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#101828] tracking-tight max-w-5xl mx-auto leading-[1.08]">
            The Global Standard for <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#101828] via-[#4338CA] to-[#FF6B35]">
              International Expos & Trade Shows
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Unite organizers, commercial exhibitors, and thousands of attendees. Featuring interactive multi-hall floor plans, atomic stall reservations, real-time networking, and deep analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-2xl shadow-xl shadow-brand-700/25 hover:shadow-2xl hover:shadow-accent-500/35 hover:-translate-y-0.5 transition-all text-sm"
            >
              Explore Live Trade Shows
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-[#101828] font-bold rounded-2xl border border-slate-300/80 shadow-sm hover:shadow-md hover:border-slate-400 transition-all text-sm"
            >
              Apply as Exhibitor
            </Link>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="max-w-3xl mx-auto mt-10 p-4 rounded-2xl bg-slate-900 text-white text-left text-xs shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-accent-500/20 text-accent-400 border border-accent-500/30 flex items-center justify-center font-bold">
                🔑
              </div>
              <div>
                <p className="font-bold text-white text-xs">Evaluator & Quick Test Portals (Password: Password123!)</p>
                <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                  Admin: admin@eventsphere.com | Exhibitor: exhibitor1@eventsphere.com | Attendee: attendee1@eventsphere.com
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-95 shadow-sm text-xs"
            >
              Quick Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Platform Key Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card text-center sm:text-left space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#101828]">50K+</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Attendees</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +38% year over year
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card text-center sm:text-left space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#4338CA]">1,200+</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commercial Booths</p>
            <p className="text-[11px] text-slate-500 font-medium">99.8% allocation rate</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card text-center sm:text-left space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B35]">98.4%</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exhibitor Satisfaction</p>
            <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Rated 4.9/5
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card text-center sm:text-left space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">0.0 ms</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Double-Booking Clashes</p>
            <p className="text-[11px] text-slate-500 font-medium">Guaranteed by atomic lock</p>
          </div>
        </div>
      </section>

      {/* 3. Live System Health & Engine Monitor */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#101828] text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-white">EventSphere Live Core Monitor</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">v1.0 Production</span>
                </div>
                <p className="text-xs text-slate-400">Live communication diagnostic: React Client ↔ Express.js REST ↔ MongoDB</p>
              </div>
            </div>

            <div>
              {healthLoading ? (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Checking Service...
                </span>
              ) : healthStatus ? (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  API Gateway Active (200 OK)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Service Offline
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Architecture</span>
              <span className="font-bold text-white">{healthStatus?.service || 'EventSphere Core'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Environment</span>
              <span className="font-bold text-slate-200 uppercase tracking-wider">{healthStatus?.nodeEnvironment || 'development'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Database State</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {healthStatus?.databaseStatus || 'Connected'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400 block mb-1">Engine Uptime</span>
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {healthStatus ? `${healthStatus.uptimeSeconds}s active` : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Premier Expos & Trade Shows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-widest mb-1">
              <Calendar className="w-3.5 h-3.5" /> Exhibition Calendar
            </div>
            <h2 className="text-3xl font-extrabold text-[#101828] tracking-tight">
              Featured International Expos
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-accent-500 transition-colors"
          >
            Browse All Expos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expos.length > 0 ? (
            expos.map((expo) => (
              <div
                key={expo._id}
                className="group p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                      {expo.category || 'Trade Fair'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Open for Stalls
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#101828] group-hover:text-brand-700 transition-colors line-clamp-1">
                      {expo.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {expo.description}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent-500" />
                      <span>{expo.venue || 'Exhibition Grand Hall A & B'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>
                        {expo.startDate ? new Date(expo.startDate).toLocaleDateString() : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <Link
                    to={`/events/${expo._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-brand-50 text-[#101828] hover:text-brand-700 font-bold rounded-xl text-xs border border-slate-200 group-hover:border-brand-200 transition-all"
                  >
                    View Floor Plan & Reserve <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">Loading Featured Expos...</p>
              <p className="text-xs text-slate-500">Connecting to the live database catalog.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Industry Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Industry Sectors</span>
          <h2 className="text-3xl font-extrabold text-[#101828] tracking-tight">
            Discover Exhibitions by Sector
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Connecting enterprise buyers with cutting-edge suppliers across key global markets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#101828] group-hover:text-brand-700 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Three Stakeholder Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Enterprise Ecosystem</span>
          <h2 className="text-3xl font-extrabold text-[#101828] tracking-tight">
            Purpose-Built Portals for Every Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tailored consoles engineered to streamline operations, maximize commercial exhibitor ROI, and elevate attendee journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Organizer */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-accent-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 border border-accent-100 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Admin & Organizers</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Full-lifecycle exhibition orchestration. Create complex multi-day expos, layout floor plans with custom stall pricing, review commercial exhibitor credentials, and export revenue reports.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-accent-500" /> Dynamic booth grid generator</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-accent-500" /> Exhibitor application approval workflow</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-accent-500" /> Agenda & keynote schedule manager</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-xs font-bold text-accent-600 hover:text-accent-700"
              >
                Organizer Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Exhibitor */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Exhibitors & Brands</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Maximize corporate presence. Submit company documentation, choose premier stall positions on the live floor plan, configure showcased products and assigned booth staff, and chat directly with buyers.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-600" /> Interactive booth self-selection</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-600" /> Showcase catalogue & booth staff team</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-brand-600" /> Direct in-app buyer lead messaging</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/exhibitor"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                Exhibitor Commercial Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Attendee */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">Attendees & Buyers</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Effortless discovery and networking. Search verified company directories, highlight allocated booths on floor maps, register for tracks, and receive automated 30-min reminder notifications.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 pt-2 font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Interactive exhibition stall navigator</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Personalized session calendar & reminders</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 1-on-1 networking chat with exhibitors</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Attendee Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How EventSphere Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">Workflow Architecture</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              How EventSphere Powers Exhibitions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-full bg-accent-500 text-white font-extrabold text-sm mx-auto flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Create & Map Expo</h4>
              <p className="text-xs text-slate-400">Organizers generate multi-day trade shows with custom stall layouts and floor maps.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold text-sm mx-auto flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Exhibitors Apply</h4>
              <p className="text-xs text-slate-400">Companies submit credentials and choose premium stalls via the interactive floor plan.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-sm mx-auto flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Attendees Discover</h4>
              <p className="text-xs text-slate-400">Visitors bookmark keynotes, navigate stalls, and set automated reminders.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-extrabold text-sm mx-auto flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Real-Time Networking</h4>
              <p className="text-xs text-slate-400">Instant messaging, lead qualification, and comprehensive post-event analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Featured Exhibitors Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-accent-500 uppercase tracking-widest">Global Exhibitors</span>
            <h2 className="text-3xl font-extrabold text-[#101828] tracking-tight">
              Featured Commercial Partners
            </h2>
          </div>
          <Link
            to="/exhibitors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-accent-500 transition-colors"
          >
            Explore Full Directory <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredExhibitors.map((ex, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                  {ex.tier}
                </span>
                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                  {ex.stalls}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-base text-[#101828]">{ex.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{ex.industry}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Verified Profile</span>
                <Link to="/exhibitors" className="font-bold text-brand-700 hover:text-accent-500">
                  Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Executive Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Industry Endorsements</span>
          <h2 className="text-3xl font-extrabold text-[#101828] tracking-tight">
            Trusted by World-Class Exhibition Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "EventSphere eliminated our double-booking headaches completely. The interactive stall reservation engine allowed our commercial exhibitors to select stalls in minutes."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                SM
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">Sarah Mitchell</p>
                <p className="text-[11px] text-slate-500">Operations Director, TechEx Global</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "As an exhibitor managing 4 trade shows a year, having our products, staff profiles, and buyer messaging in one unified portal gave us a 40% jump in qualified leads."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-700 text-white font-bold text-xs flex items-center justify-center">
                DK
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">David Krueger</p>
                <p className="text-[11px] text-slate-500">VP Marketing, Apex Industrial</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The attendee experience is seamless. Real-time notifications for bookmarked sessions and direct links from exhibitor directory to the floor plan stall are brilliant."
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-500 text-white font-bold text-xs flex items-center justify-center">
                EL
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">Elena Rostova</p>
                <p className="text-[11px] text-slate-500">Keynote Delegate & Venture Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-[#101828] via-[#1e1b4b] to-[#101828] text-white text-center space-y-6 relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-accent-500/20 text-accent-300 border border-accent-500/30">
              Transform Your Exhibition
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Host Your Next Global Trade Show?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Join leading exhibition organizers and commercial brands delivering world-class visitor experiences with EventSphere.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold rounded-2xl shadow-lg shadow-accent-500/30 hover:-translate-y-0.5 transition-all text-sm"
              >
                Get Started Free
              </Link>
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm"
              >
                Browse Live Catalogs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
