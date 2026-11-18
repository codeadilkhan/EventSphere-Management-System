import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, ArrowLeft, CheckCircle2, AlertCircle, Scale, Users } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to EventSphere Home
          </Link>
        </div>

        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
              <Scale className="w-4 h-4 text-brand-600" /> Platform Operating Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Terms of Service & Commercial Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Effective date: November 2026. Please read these terms carefully before registering, reserving commercial stalls, or booking keynote conference tickets.
            </p>
          </div>
        </div>

        {/* Terms Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                1
              </div>
              <h3>Acceptance of Terms</h3>
            </div>
            <p>
              By accessing, browsing, registering an account, or interacting with the EventSphere Management System, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you are registering on behalf of a corporate exhibitor, you represent that you possess legal authority to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                2
              </div>
              <h3>User Accounts & Role Permissions</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Account Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your authentication credentials and for all activities conducted through your account.
              </li>
              <li>
                <strong>Role Integrity:</strong> Accounts are partitioned into Administrator (Organizer), Exhibitor, and Attendee roles with strict Role-Based Access Control (RBAC). Any attempt to bypass access boundaries is prohibited.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                3
              </div>
              <h3>Commercial Stall Allocations & Exhibitor Responsibilities</h3>
            </div>
            <p>
              Corporate exhibitors seeking exhibition booth space must submit an official application with genuine documentation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">Stall Allocation Authority</h4>
                <p className="text-xs text-slate-500">
                  Event organizers reserve final authority to approve or reject exhibitor applications and reassign booths if structural floor safety requirements dictate.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">Commercial Conduct</h4>
                <p className="text-xs text-slate-500">
                  Exhibitors must operate within assigned booth dimensions and respect neighbor exhibitors in adjacent stalls.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                4
              </div>
              <h3>Attendee Keynotes & Hall Seating Capacity</h3>
            </div>
            <p>
              Conference sessions are restricted to strict hall seating capacities to adhere to fire code regulations. Registration for keynotes is granted on a first-come, first-served basis. If you can no longer attend a booked session, you agree to cancel your reservation in the Attendee Portal so your seat can be released to fellow attendees.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                5
              </div>
              <h3>Communication, Chat & Prohibited Conduct</h3>
            </div>
            <p>
              EventSphere provides direct messaging and networking channels. You agree not to transmit spam, unsolicited commercial advertisements outside booth inquiries, offensive content, or malicious code. Violations will result in immediate account termination.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                6
              </div>
              <h3>Limitation of Liability</h3>
            </div>
            <p className="text-xs text-slate-500">
              To the maximum extent permitted by applicable law, EventSphere Management System and its organizers shall not be liable for any indirect, incidental, or consequential damages resulting from exhibition interruptions, technical outages, or force majeure events.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4">
          <p>&copy; 2026 EventSphere Management System · Aptech eProject</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-brand-600 transition-colors font-semibold">
              Privacy Policy
            </Link>
            <Link to="/register" className="hover:text-brand-600 transition-colors font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
