import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import { expoService } from '../../services/expoService';
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileText,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  X,
  MessageSquare,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch expos for filter
  useEffect(() => {
    const loadExpos = async () => {
      try {
        const res = await expoService.getExpos();
        setExpos(res.data.expos || []);
      } catch (err) {
        console.error('Failed to load expos', err);
      }
    };
    loadExpos();
  }, []);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getAllApplications({
        expoId: selectedExpoId || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedExpoId, statusFilter]);

  const handleOpenReviewModal = (app) => {
    setSelectedApp(app);
    setReviewStatus(app.status === 'pending' ? 'approved' : app.status);
    setAdminRemarks(app.adminRemarks || '');
    setModalError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setReviewing(true);
    setModalError('');

    try {
      await applicationService.reviewApplication(selectedApp._id, reviewStatus, adminRemarks);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update review status.');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Exhibitor Application Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Verify corporate credentials, inspect documentation, and grant floor plan stall booking rights.
          </p>
        </div>

        {/* Expo Selector */}
        <select
          value={selectedExpoId}
          onChange={(e) => setSelectedExpoId(e.target.value)}
          className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All Exhibitions</option>
          {expos.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs w-fit">
        {['ALL', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading submitted applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Applications Found</h4>
          <p className="text-xs text-slate-400">
            There are currently no exhibitor submissions matching this filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Company & Exhibitor</th>
                  <th className="py-3.5 px-4">Target Exhibition</th>
                  <th className="py-3.5 px-4">Products / Services</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Exhibitor */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">
                          {app.companyDetails?.companyName || app.exhibitorId?.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {app.companyDetails?.contactEmail || app.exhibitorId?.email}
                        </p>
                        {app.companyDetails?.website && (
                          <a
                            href={app.companyDetails.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Visit Website
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Expo */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {app.expoId?.title || 'Exhibition'}
                    </td>

                    {/* Products */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600">{app.productsServices}</p>
                    </td>

                    {/* Documents */}
                    <td className="py-3.5 px-4">
                      {app.documents && app.documents.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {app.documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline"
                            >
                              <FileText className="w-3 h-3 text-slate-400" />
                              Doc #{idx + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {app.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                        {app.status}
                      </span>
                    </td>

                    {/* Review Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReviewModal(app)}
                        className="py-1.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                Application Review & Decision
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
              <p>
                <strong className="text-slate-800">Company:</strong>{' '}
                {selectedApp.companyDetails?.companyName || selectedApp.exhibitorId?.name}
              </p>
              <p>
                <strong className="text-slate-800">Target Expo:</strong> {selectedApp.expoId?.title}
              </p>
              <p className="text-slate-500 pt-1 border-t border-slate-200/60">
                <strong>Showcase Intent:</strong> {selectedApp.productsServices}
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Status Radio Buttons */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      reviewStatus === 'approved'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={reviewStatus === 'approved'}
                      onChange={() => setReviewStatus('approved')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs font-bold">Approve for Stalls</div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      reviewStatus === 'rejected'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={reviewStatus === 'rejected'}
                      onChange={() => setReviewStatus('rejected')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div className="text-xs font-bold">Reject Application</div>
                  </label>
                </div>
              </div>

              {/* Admin Remarks */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Organizer Feedback / Remarks (Sent to Exhibitor)
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Approved. You may now proceed to lock a premium stall on the floor plan."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="py-2 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2"
                >
                  {reviewing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
