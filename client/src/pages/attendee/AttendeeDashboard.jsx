import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  CheckCircle2
} from 'lucide-react';

export const AttendeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 text-xs font-bold border border-blue-400/30">
              <Users className="w-3.5 h-3.5" /> Attendee Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Visitor'}
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm max-w-xl">
              Discover industry leaders, reserve seats for tech keynotes, build your personalized agenda, and receive 30-minute automated reminders.
            </p>
          </div>

          <Link
            to="/events/browse"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 font-bold rounded-xl text-xs hover:bg-blue-50 transition-all shadow-md"
          >
            Explore Active Expos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900">3</span>
            <span className="text-xs text-emerald-600 font-semibold ml-2">● Confirmed Seats</span>
          </div>
          <p className="text-xs text-slate-400">Guaranteed access to keynote halls</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookmarked Stalls</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900">7</span>
            <span className="text-xs text-purple-600 font-semibold ml-2">Saved Exhibitors</span>
          </div>
          <p className="text-xs text-slate-400">Ready to locate on interactive map</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Reminders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900">Active</span>
            <span className="text-xs text-emerald-600 font-semibold ml-2">Email + In-app</span>
          </div>
          <p className="text-xs text-slate-400">30 min countdown prior to keynotes</p>
        </div>
      </div>

      {/* Upcoming Registered Sessions Preview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Upcoming Agenda</h3>
            <p className="text-xs text-slate-500">Upcoming sessions reserved under your badge</p>
          </div>
          <Link
            to="/events/my-schedule"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Full Agenda <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 uppercase">
                  Keynote
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Today, 11:30 AM
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Future of Cloud Robotics & Decentralized Automation
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Grand Tech Auditorium (Hall A)
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Seat Confirmed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                  Panel
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Tomorrow, 02:00 PM
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                AI Innovations in Manufacturing & Commercial Robotics
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Innovation Arena (Hall C)
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Seat Confirmed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
