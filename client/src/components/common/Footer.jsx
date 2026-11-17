import React from 'react';
import { Sparkles, Heart, ShieldCheck, Globe, Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">EventSphere</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              An enterprise-grade trade show and expo virtualization suite built with the MERN stack. Digitizing booth allocation, interactive floor plans, live schedules, and attendee engagement.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5 text-brand-600" />
              Aptech eProject 2026 Deliverable
            </div>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="/admin" className="hover:text-brand-600 transition-colors">Organizer / Admin</a></li>
              <li><a href="/exhibitor" className="hover:text-brand-600 transition-colors">Exhibitor Hub</a></li>
              <li><a href="/events" className="hover:text-brand-600 transition-colors">Attendee Explorer</a></li>
              <li><a href="/login" className="hover:text-brand-600 transition-colors">Role-based Access</a></li>
            </ul>
          </div>

          {/* Security & System */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>JWT Signed Sessions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Socket.io Real-time</span>
              </li>
              <li className="text-xs text-slate-400 pt-2">
                Designed for high availability & audit conformance.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} EventSphere Management System. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Engineered with excellence for Aptech eProject</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
