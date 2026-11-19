import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Sparkles,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.data?.devResetToken) {
        setSuccessInfo({
          message: response.message,
          token: response.data.devResetToken,
          link: response.data.resetUrl,
        });
      } else {
        setSuccessInfo({ message: response.message || 'Password reset instructions dispatched.' });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Unable to process password reset request at this time.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#101828] to-[#4338CA] text-white shadow-lg shadow-brand-700/25 mb-1">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#101828] tracking-tight">
            Account Recovery
          </h2>
          <p className="text-xs text-slate-500">
            Enter your enterprise email to generate security password reset instructions.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset Dispatch Confirmed</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              {typeof successInfo === 'object' ? successInfo.message : successInfo}
            </p>
            {successInfo.link && (
              <div className="pt-2 border-t border-emerald-200/60">
                <Link
                  to={successInfo.link}
                  className="font-bold text-emerald-900 underline block"
                >
                  Direct Reset Link (Dev Mode) &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Registered Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#4338CA] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] hover:from-[#3730A3] hover:to-[#E54E18] text-white font-bold rounded-xl shadow-lg shadow-brand-700/20 hover:shadow-xl hover:shadow-accent-500/25 transition-all text-sm disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching Instructions...
              </>
            ) : (
              <>
                Send Recovery Instructions
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#101828] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
