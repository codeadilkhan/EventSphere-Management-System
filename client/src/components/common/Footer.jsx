import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Globe, Code2, ArrowUpRight, Award, Layers, Users, Building2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#101828] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4338CA] to-[#FF6B35] flex items-center justify-center text-white shadow-lg shadow-brand-700/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">EventSphere</span>
                <span className="block text-[10px] font-bold text-accent-400 uppercase tracking-widest">
                  Enterprise Trade Show SaaS
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Global virtual and in-person exhibition management platform. Engineered for seamless multi-hall booth reservations, interactive floor plans, keynote scheduling, and real-time networking.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5 text-accent-400" />
              <span>Full-Stack MERN Architecture | Aptech 2026</span>
            </div>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-extrabold text-accent-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Stakeholder Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  Organizer Console <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/exhibitor" className="hover:text-white transition-colors flex items-center gap-1">
                  Exhibitor Commercial Hub <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors flex items-center gap-1">
                  Attendee Expo Discovery <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:text-white transition-colors flex items-center gap-1">
                  Keynote Agendas & Tracks <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/exhibitors" className="hover:text-white transition-colors flex items-center gap-1">
                  Global Exhibitors Index <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-extrabold text-accent-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Core Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>Atomic Floor Plan Allocation</li>
              <li>Socket.IO Live Notifications</li>
              <li>Joi Data Sanitization & RBAC</li>
              <li>Automated Session Reminders</li>
              <li>Real-time Visitor Footfall</li>
              <li>Direct Buyer-Exhibitor Chat</li>
            </ul>
          </div>

          {/* Security & System */}
          <div>
            <h4 className="text-xs font-extrabold text-accent-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>JWT Encryption Enabled</span>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy (GDPR Audit)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Enterprise Service
                </Link>
              </li>
              <li className="text-slate-500 text-[11px] pt-1">
                Security standard ISO/IEC 27001 aligned architecture.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} EventSphere Management System. Built with enterprise specifications.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Aptech eProject Gold Standard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
