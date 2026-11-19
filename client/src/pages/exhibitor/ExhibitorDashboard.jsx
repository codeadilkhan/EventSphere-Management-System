import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { applicationService } from '../../services/applicationService';
import { boothService } from '../../services/boothService';
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
  Building2,
  Sparkles,
  Users,
  Package,
  Award,
  ChevronRight,
  Plus
} from 'lucide-react';

export const ExhibitorDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await applicationService.getMyApplications();
        const list = res.data?.applications || res.data || [];
        setApplications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Exhibitor apps load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const approvedApps = applications.filter((a) => a.status === 'approved');
  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Exhibitor Hub Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#101828] via-[#1e1b4b] to-[#101828] text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-extrabold border border-brand-500/30">
              <Briefcase className="w-3.5 h-3.5 text-accent-400" /> Commercial Exhibitor Suite
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {user?.name || 'Exhibitor Commercial Partner'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Manage your commercial presence across global exhibitions. Select interactive floor plan stalls, update showcased product catalogues, assign booth staff, and chat directly with buyers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/exhibitor/applications"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-brand-700/25 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Apply for Stalls
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all border border-white/20"
            >
              Expos Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Approved Expos Tile */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Stalls</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-[#101828]">{approvedApps.length}</span>
            <p className="text-xs text-slate-500 mt-1">Confirmed exhibition contracts</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/exhibitor/booths" className="text-brand-700 font-bold hover:text-accent-500 flex items-center gap-1">
              Configure Stalls <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pending Submissions Tile */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-600">{pendingApps.length}</span>
            <p className="text-xs text-slate-500 mt-1">Awaiting organizer verification</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/exhibitor/applications" className="text-brand-700 font-bold hover:text-accent-500 flex items-center gap-1">
              View Applications <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Showcase Readiness */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Showcase Profile</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-brand-600" /> Active
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-[#4338CA]">100%</span>
            <p className="text-xs text-slate-500 mt-1">Catalogue and staff configured</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/exhibitor/profile" className="text-brand-700 font-bold hover:text-accent-500 flex items-center gap-1">
              Update Profile <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Operational Feature Modules Grid (4 Cards) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-[#101828]">Commercial Management Modules</h3>
          <p className="text-xs text-slate-500">Self-service control suites for stall configuration and buyer engagement.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/exhibitor/booths"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-brand-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-brand-700 transition-colors">
              Stall Selection & Details
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore interactive multi-hall floor plans, choose vacant booths, manage showcased products, and assign staff.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700">
              Manage Stalls <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/exhibitor/applications"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-accent-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-accent-600 transition-colors">
              Trade Show Applications
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit company documentation, track real-time approval status, and view allocated hall slots.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-accent-600">
              My Submissions <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/exhibitor/profile"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-emerald-700 transition-colors">
              Company Showcase & Brand
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customize company bio, contact information, social links, and public directory visibility for buyers.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              Edit Showcase <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/exhibitor/messages"
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-500 shadow-card hover:shadow-card-hover transition-all duration-300 group space-y-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-[#101828] text-base group-hover:text-blue-700 transition-colors">
              Buyer Networking & Leads
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chat directly with delegates inquiring about your stall, negotiate deals, and exchange corporate contact cards.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-blue-700">
              Open Chat Room <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
