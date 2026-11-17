import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';

export const AdminExpos = () => {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpo, setEditingExpo] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    city: '',
    address: '',
    bannerImage: '',
    status: 'draft',
  });

  const fetchExpos = async () => {
    try {
      setLoading(true);
      const res = await expoService.getExpos({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        q: searchQuery || undefined,
      });
      setExpos(res.data.expos || []);
    } catch (err) {
      console.error('Failed to load expos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpos();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpos();
  };

  const handleOpenCreateModal = () => {
    setEditingExpo(null);
    setFormData({
      title: '',
      theme: '',
      description: '',
      startDate: '',
      endDate: '',
      venue: '',
      city: '',
      address: '',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      status: 'draft',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expo) => {
    setEditingExpo(expo);
    setFormData({
      title: expo.title,
      theme: expo.theme,
      description: expo.description,
      startDate: expo.startDate ? expo.startDate.split('T')[0] : '',
      endDate: expo.endDate ? expo.endDate.split('T')[0] : '',
      venue: expo.location?.venue || '',
      city: expo.location?.city || '',
      address: expo.location?.address || '',
      bannerImage: expo.bannerImage || '',
      status: expo.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const payload = {
      title: formData.title,
      theme: formData.theme,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      location: {
        venue: formData.venue,
        city: formData.city,
        address: formData.address,
      },
      bannerImage: formData.bannerImage,
      status: formData.status,
    };

    try {
      if (editingExpo) {
        await expoService.updateExpo(editingExpo._id, payload);
      } else {
        await expoService.createExpo(payload);
      }
      setIsModalOpen(false);
      fetchExpos();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save exhibition.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpo = async (id) => {
    try {
      await expoService.deleteExpo(id);
      setDeleteConfirmId(null);
      fetchExpos();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete exhibition.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Exhibitions & Trade Shows
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create multi-day expos, define venue specifications, and manage floor plans.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          Create New Expo
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exhibitions by title, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'published', 'draft', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Expo Cards Grid */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading exhibitions...</p>
        </div>
      ) : expos.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Exhibitions Found</h4>
          <p className="text-xs text-slate-400">
            Create your first exhibition trade show or clear search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expos.map((expo) => (
            <div
              key={expo._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden hover:shadow-xl transition-all flex flex-col"
            >
              <div className="h-44 relative overflow-hidden bg-slate-100">
                <img
                  src={
                    expo.bannerImage ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
                  }
                  alt={expo.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    expo.status === 'published'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : expo.status === 'draft'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {expo.status}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wide">
                    {expo.theme}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{expo.title}</h3>
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(expo.startDate).toLocaleDateString()} &ndash;{' '}
                        {new Date(expo.endDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {expo.location?.venue}, {expo.location?.city}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Booth Occupancy Progress */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Floor Plan Stalls:</span>
                    <span className="font-bold text-slate-800">
                      {expo.boothsBooked || 0} / {expo.boothsTotal || 0} Booked
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{
                        width: `${
                          expo.boothsTotal > 0
                            ? ((expo.boothsBooked || 0) / expo.boothsTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <Link
                    to={`/admin/booths?expoId=${expo._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg"
                  >
                    <Layers className="w-3.5 h-3.5" /> Floor Plan
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(expo)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit Expo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(expo._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Expo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingExpo ? 'Edit Exhibition Details' : 'Create New Trade Exhibition'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Exhibition Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Global Tech & Innovation Expo 2026"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Theme / Industry *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="e.g. AI & Commercial Robotics"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="draft">Draft (Hidden from Public)</option>
                    <option value="published">Published (Live to Public)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed background, goals, target exhibitors, and audience..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Expo Center"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Karachi"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Hall 1, Main Road"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="py-2.5 px-5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingExpo ? 'Save Changes' : 'Publish Exhibition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this exhibition? All associated booth allocations will be permanently removed.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExpo(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
