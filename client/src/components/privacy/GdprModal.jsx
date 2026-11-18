import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  X,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Calendar,
  FileText,
  Loader2,
  Database
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const GdprModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setErrorMsg('');
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        console.warn('Could not fetch user privacy profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setErrorMsg('');
      setSuccessMsg('');
      await userService.downloadUserData();
      setSuccessMsg('Your personal data archive (.json) has been successfully downloaded.');
    } catch (err) {
      setErrorMsg('Failed to download user archive. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Password confirmation is required.');
      return;
    }

    try {
      setDeleting(true);
      setErrorMsg('');
      await userService.deleteAccount(password);
      logout();
      onClose();
      navigate('/register', {
        state: { message: 'Your account and personal data have been completely purged from EventSphere.' },
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Incorrect password or failed to delete account.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Privacy & Data Governance
              </h3>
              <p className="text-xs text-slate-500">
                GDPR & CCPA Self-Service Portability & Right-to-be-Forgotten Controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Consent Status Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Consent & Processing Record
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Consent
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">User Account:</span>
                <span className="font-extrabold text-slate-900">{profile?.name || user?.name}</span>
                <span className="block text-slate-500 text-[11px]">{profile?.email || user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Consent Timestamp:</span>
                <span className="font-semibold text-slate-800">
                  {profile?.consentTimestamp
                    ? new Date(profile.consentTimestamp).toLocaleString()
                    : 'Recorded at Registration'}
                </span>
                <span className="block text-slate-400 text-[10px]">Article 6(1)(a) GDPR</span>
              </div>
            </div>
          </div>

          {/* Section 1: Right to Data Portability */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                1. Right to Data Portability (GDPR Article 20)
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export and download a complete machine-readable copy of your personal data stored in EventSphere, including profile details, session registrations, stall applications, and direct messages.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Packaging Archive...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Personal Data (.JSON)
                </>
              )}
            </button>
          </div>

          {/* Section 2: Right to Erasure / Delete Account */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wide">
                2. Right to Erasure / Delete Account (GDPR Article 17)
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Permanently delete your account. This action will release any allocated exhibition stalls, release reserved keynote seats, and delete your profile and personal messages.
            </p>

            {!deleteConfirmOpen ? (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Request Permanent Account Deletion
              </button>
            ) : (
              <form
                onSubmit={handleDeleteAccount}
                className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in"
              >
                <div className="flex items-start gap-2 text-rose-800 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>
                    Warning: This action is permanent and cannot be undone. Enter your current password to confirm deletion.
                  </span>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={deleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Purging Data...
                      </>
                    ) : (
                      'Confirm Permanent Deletion'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setPassword('');
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-xl text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">EventSphere Privacy Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GdprModal;
