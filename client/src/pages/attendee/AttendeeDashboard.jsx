import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { expoService } from '../../services/expoService';
import {
  Users,
  Calendar,
  Bookmark,
  Store,
  Compass,
  ArrowRight,
  Clock,
  MapPin,
  Bell,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        setLoading(true);
        const [regRes, exposRes] = await Promise.all([
          registrationService.getMyRegistrations().catch(() => ({ data: [] })),
          expoService.getExpos().catch(() => ({ data: { expos: [] } })),
        ]);

        const regList = regRes.data?.registrations || regRes.data || [];
        const exposList = exposRes.data?.expos || exposRes.expos || [];

        setRegistrations(Array.isArray(regList) ? regList : []);
        setExpos(Array.isArray(exposList) ? exposList : []);
      } catch (err) {
        console.warn('Attendee dashboard fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendeeData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Attendee Hub Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#101828] via-[#1e1b4b] to-[#101828] text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
              <Users className="w-3.5 h-3.5" /> Delegate Experience Hub
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome, {user?.name || 'Visitor Delegate'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Explore premier trade shows, navigate interactive floor plans, reserve seats for tech keynotes, build your personalized agenda, and receive 30-minute automated reminders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/events/browse"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-700/25 hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              Explore Trade Shows
            </Link>
            <Link
              to="/events/my-schedule"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border border-white/20"
            >
              My Saved Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Expos</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#101828]">{registrations.length || 1}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">● Confirmed Access</span>
          </div>
          <p className="text-xs text-slate-400">Official expo admission tickets</p>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/events/my-schedule" className="text-xs font-bold text-brand-700 hover:text-accent-500 flex items-center gap-1">
              View registered passes <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#4338CA]">Active</span>
            <span className="text-xs text-purple-700 font-bold ml-2">Personal Calendar</span>
          </div>
          <p className="text-xs text-slate-400">Automated 30-min reminders active</p>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/events/my-schedule" className="text-xs font-bold text-brand-700 hover:text-accent-500 flex items-center gap-1">
              View itinerary <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exhibitor Directory</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-700">Verified</span>
            <span className="text-xs text-emerald-700 font-bold ml-2">Global Catalog</span>
          </div>
          <p className="text-xs text-slate-400">Locate allocated booths on floor maps</p>
          <div className="pt-2 border-t border-slate-100">
            <Link to="/events/exhibitors" className="text-xs font-bold text-brand-700 hover:text-accent-500 flex items-center gap-1">
              Search exhibitors <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Action Navigation Modules */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-[#101828]">Visitor Experience Modules</h3>
          <p className="text-xs text-slate-500">Fast pathways to discovery, session tracking, and direct exhibitor inquiry.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/events/browse"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-brand-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-brand-700 transition-colors">
              Browse Trade Shows
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore active exhibitions, view hall blueprints, and obtain entry passes.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700">
              Browse Catalog <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/events/exhibitors"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-accent-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-accent-600 transition-colors">
              Exhibitor Directory
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find commercial suppliers, inspect showcased products, and locate stalls on the map.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-accent-600">
              Explore Companies <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/events/my-schedule"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-purple-700 transition-colors">
              My Saved Itinerary
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review your personalized keynote schedule, registered passes, and automated notification alerts.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-purple-700">
              Open My Agenda <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/events/messages"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-blue-700 transition-colors">
              Networking & Messages
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Message booth representatives directly, schedule stall meetings, and request product catalogs.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              Direct Messages <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
