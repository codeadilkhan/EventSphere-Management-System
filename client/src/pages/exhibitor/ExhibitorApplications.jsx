import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { expoService } from '../../services/expoService';
import {
  Store,
  Plus,
  Calendar,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Upload,
  Loader2,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';

export const ExhibitorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    expoId: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    productsServices: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications();
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpos = async () => {
    try {
      const res = await expoService.getExpos();
      setExpos(res.data.expos || []);
    } catch (err) {
      console.error('Failed to load expos', err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchExpos();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      expoId: expos.length > 0 ? expos[0]._id : '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      productsServices: '',
    });
    setSelectedFiles([]);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const formPayload = new FormData();
      formPayload.append('expoId', formData.expoId);
      formPayload.append('productsServices', formData.productsServices);
      formPayload.append(
        'companyDetails',
        JSON.stringify({
          companyName: formData.companyName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          website: formData.website,
        })
      );

      selectedFiles.forEach((file) => {
        formPayload.append('documents', file);
      });

      await applicationService.submitApplication(formPayload);
      setIsModalOpen(false);
      fetchApplications();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Approved &bull; Stall Booking Open
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Application Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending Organizer Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Exhibition Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Apply to upcoming trade shows, upload credentials, and monitor verification status.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          Apply for New Expo
        </button>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-slate-800">No Applications Submitted</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't applied to any exhibitions yet. Submit an application to reserve your company's booth.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs"
          >
            Submit Application Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {app.expoId?.title || 'Exhibition'}
                  </h3>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Submitted on {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  {app.expoId?.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {app.expoId.location.venue}, {app.expoId.location.city}
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-800">Exhibit Summary:</strong>{' '}
                    {app.productsServices}
                  </p>
                  {app.adminRemarks && (
                    <p className="pt-1 border-t border-slate-200/70 text-brand-700">
                      <strong>Organizer Remarks:</strong> "{app.adminRemarks}"
                    </p>
                  )}
                </div>

                {/* Attached Documents */}
                {app.documents && app.documents.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-400 font-semibold">Attached Docs:</span>
                    {app.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {app.status === 'approved' ? (
                  <Link
                    to={`/exhibitor/booths?expoId=${app.expoId?._id}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    Select Stall on Floor Plan
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : app.status === 'pending' ? (
                  <div className="text-right text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Under Organizer Review
                  </div>
                ) : (
                  <span className="text-xs text-rose-500 font-semibold">
                    Contact organizer for re-submission
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">
                Apply for Trade Show Exhibition
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Select Target Exhibition *
                </label>
                <select
                  required
                  value={formData.expoId}
                  onChange={(e) => setFormData({ ...formData, expoId: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">-- Choose Exhibition --</option>
                  {expos.map((expo) => (
                    <option key={expo._id} value={expo._id}>
                      {expo.title} ({new Date(expo.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Robotics Inc."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Corporate Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="exhibits@company.com"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Products & Services Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.productsServices}
                  onChange={(e) => setFormData({ ...formData, productsServices: e.target.value })}
                  placeholder="Detail the hardware, software, or commercial innovations you plan to display..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Upload Documents */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Supporting Documents (PDF / Images)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Upload company registration certificates, product catalogs (max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
