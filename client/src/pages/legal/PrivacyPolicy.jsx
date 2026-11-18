import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, CheckCircle2, ArrowLeft, Mail, Server, Eye, Database } from 'lucide-react';

export const PrivacyPolicy = () => {
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
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> GDPR & CCPA Conformance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Last updated: November 2026. This policy describes how the EventSphere Management System collects, processes, stores, and protects your personal and commercial data.
            </p>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs">
                1
              </div>
              <h3>Data Controller & Identity</h3>
            </div>
            <p>
              EventSphere Management System ("EventSphere", "we", "us", or "our") acts as the Data Controller under European Union General Data Protection Regulation (GDPR) Regulation (EU) 2016/679 and California Consumer Privacy Act (CCPA).
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <strong>Data Protection Contact:</strong> dpo@eventsphere.local · Security Team, EventSphere Platform
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs">
                2
              </div>
              <h3>Categories of Personal Data We Collect</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600">
              <li>
                <strong className="text-slate-800">Identity & Account Data:</strong> Full name, verified email address, phone number, hashed password credentials, and assigned role (Organizer, Commercial Exhibitor, Attendee).
              </li>
              <li>
                <strong className="text-slate-800">Commercial & Organization Data:</strong> Business tax documents, incorporation certificates, brand logos, company descriptions, and booth stall assignments.
              </li>
              <li>
                <strong className="text-slate-800">Event Engagement & Telemetry:</strong> Floor plan stall visits, session reservations, keynote agenda bookmarks, and physical hall check-in data.
              </li>
              <li>
                <strong className="text-slate-800">Communication & Support Records:</strong> Secure WebSocket direct messages, inquiry tickets, and organizer broadcast notices.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs">
                3
              </div>
              <h3>Legal Basis for Processing (GDPR Article 6)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">Contractual Necessity</h4>
                <p className="text-xs text-slate-500">
                  Processing account credentials, ticketing, and booth contracts to provide exhibition virtualization services.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">Explicit User Consent</h4>
                <p className="text-xs text-slate-500">
                  Recorded upon registration with ISO timestamp for event notifications and commercial networking.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs">
                4
              </div>
              <h3>Your Legal Rights (GDPR & CCPA)</h3>
            </div>
            <p>
              Every user is empowered with direct self-service tools within the EventSphere platform:
            </p>
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <Database className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Right to Data Portability (Article 20)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You can download a complete, machine-readable JSON archive of your personal profile, registrations, bookmarks, applications, and messaging history via the <strong>"Download My Data"</strong> function.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Right to Erasure / "To Be Forgotten" (Article 17)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You have the right to request permanent deletion of your account. All allocated booths, keynote reservations, and personal credentials will be completely purged from our database upon password verification.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs">
                5
              </div>
              <h3>Technical & Organizational Security Safeguards</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
              <li>Transport Layer Security (TLS/HTTPS) for all incoming and outbound traffic.</li>
              <li>Bcrypt cryptographic salting and hashing for passwords.</li>
              <li>JWT session signing with expiration and tamper-detection.</li>
              <li>Strict CORS whitelisting, Helmet HTTP headers, NoSQL injection sanitization, and IP rate-limiting.</li>
              <li>Strict file type and extension whitelisting on uploads with random cryptographic renaming.</li>
            </ul>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4">
          <p>&copy; 2026 EventSphere Management System · Aptech eProject</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-brand-600 transition-colors font-semibold">
              Terms of Service
            </Link>
            <Link to="/login" className="hover:text-brand-600 transition-colors font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
