import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Briefcase,
  Store,
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building
} from 'lucide-react';

export const ExhibitorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-400/20 text-purple-200 text-xs font-bold border border-purple-400/30">
              <Briefcase className="w-3.5 h-3.5" /> Exhibitor Commercial Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name || 'Exhibitor Partner'}
            </h2>
            <p className="text-purple-200 text-xs sm:text-sm max-w-xl">
              Track your trade show applications, manage booth selection, showcase innovative products, and network with attendees.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-purple-900 font-bold rounded-xl text-xs hover:bg-purple-50 transition-all shadow-md"
          >
            Browse Available Expos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Status Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Application Status */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved
            </span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Global Tech & Innovation Expo</h4>
            <p className="text-xs text-slate-500 mt-1">Application verified by organizer team.</p>
          </div>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Reviewed 2 days ago</span>
            <Link to="/exhibitor/applications" className="text-brand-600 font-semibold hover:underline">
              View details
            </Link>
          </div>
        </div>

        {/* Booth Allocation */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated Space</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
              <Layers className="w-3 h-3 text-brand-500" /> Booth B-04
            </span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">Main Exhibition Hall &bull; Row 2</h4>
            <p className="text-xs text-slate-500 mt-1">10×10 Premium corner stall with dual visitor frontage.</p>
          </div>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Power & Wifi Allocated</span>
            <Link to="/exhibitor/booths" className="text-brand-600 font-semibold hover:underline">
              Floor Plan
            </Link>
          </div>
        </div>

        {/* Networking Leads */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">8 Messages</h4>
            <p className="text-xs text-slate-500 mt-1">Inquiries from registered trade visitors and neighboring booths.</p>
          </div>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Live real-time messaging</span>
            <Link to="/exhibitor/messages" className="text-brand-600 font-semibold hover:underline">
              Open Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Exhibitor Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Showcase Profile & Product Catalog</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Upload your company logo, description, product brochures, and assign booth staff representatives so attendees can connect with your team.
          </p>
          <Link
            to="/exhibitor/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 pt-2"
          >
            Edit Company Showcase <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Interactive Booth Selection</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            View the live expo layout, browse available stalls, check neighbor exhibitors, and reserve your spot with zero conflicts.
          </p>
          <Link
            to="/exhibitor/booths"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 pt-2"
          >
            Open Interactive Floor Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
