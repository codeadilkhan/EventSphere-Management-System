import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { boothService } from '../../services/boothService';
import { applicationService } from '../../services/applicationService';
import { FloorPlan } from '../../components/floorplan/FloorPlan';
import {
  Layers,
  Plus,
  Grid,
  List,
  Wand2,
  Trash2,
  Edit,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export const AdminBooths = () => {
  const [searchParams] = useSearchParams();
  const urlExpoId = searchParams.get('expoId');

  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('');
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'table'

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Bulk Generator State
  const [bulkConfig, setBulkConfig] = useState({
    rows: 4,
    cols: 6,
    basePrice: 500,
    defaultSize: '10x10',
    defaultCategory: 'Standard',
  });

  // Single Booth State
  const [singleBooth, setSingleBooth] = useState({
    boothNumber: '',
    size: '10x10',
    price: 500,
    category: 'Standard',
    row: 1,
    col: 1,
    notes: '',
  });

  // Approved exhibitors list for admin allocation
  const sampleExhibitors = [
    { _id: '673a00000000000000000002', name: 'TechNova Solutions', email: 'exhibitor1@eventsphere.com' },
    { _id: '673a00000000000000000003', name: 'Apex Robotics Inc.', email: 'exhibitor2@eventsphere.com' },
    { _id: '673a00000000000000000004', name: 'Quantum Cloud Systems', email: 'quantum@example.com' },
    { _id: '673a00000000000000000005', name: 'BioTech Automation Labs', email: 'biotech@example.com' },
  ];
  const [exhibitors, setExhibitors] = useState(sampleExhibitors);

  // Dynamically load approved exhibitors for the selected expo
  useEffect(() => {
    const fetchApprovedExhibitors = async () => {
      try {
        const res = await applicationService.getApplications({
          expoId: selectedExpoId || undefined,
          status: 'approved',
        });
        const apps = res.data?.applications || [];
        const dynamicList = apps
          .map((app) => ({
            _id: app.userId?._id || app.userId,
            name: app.companyName || app.userId?.name || 'Approved Exhibitor',
            email: app.userId?.email || '',
          }))
          .filter((ex, idx, self) => self.findIndex((s) => s._id === ex._id) === idx);

        setExhibitors(dynamicList.length > 0 ? dynamicList : sampleExhibitors);
      } catch (err) {
        setExhibitors(sampleExhibitors);
      }
    };
    if (selectedExpoId) {
      fetchApprovedExhibitors();
    }
  }, [selectedExpoId]);

  // Fetch all expos for selector
  useEffect(() => {
    const loadExpos = async () => {
      try {
        const res = await expoService.getExpos();
        const exposList = res.data.expos || [];
        setExpos(exposList);

        if (urlExpoId && exposList.some((e) => e._id === urlExpoId)) {
          setSelectedExpoId(urlExpoId);
        } else if (exposList.length > 0) {
          setSelectedExpoId(exposList[0]._id);
        }
      } catch (err) {
        console.error('Failed to load expos', err);
      }
    };
    loadExpos();
  }, [urlExpoId]);

  // Fetch booths whenever selected Expo changes
  const fetchBooths = async (expoId) => {
    if (!expoId) return;
    try {
      setLoading(true);
      const res = await boothService.getBoothsByExpo(expoId);
      setBooths(res.data.booths || []);
    } catch (err) {
      console.error('Failed to fetch booths', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExpoId) {
      fetchBooths(selectedExpoId);
    }
  }, [selectedExpoId]);

  // Handle Admin Allocation
  const handleAllocate = async (boothId, exhibitorId, notes) => {
    try {
      await boothService.allocateBooth(boothId, exhibitorId, notes);
      fetchBooths(selectedExpoId);
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
  };

  // Handle Admin Release
  const handleRelease = async (boothId) => {
    try {
      await boothService.releaseBooth(boothId);
      fetchBooths(selectedExpoId);
    } catch (err) {
      alert(err.response?.data?.message || 'Release failed');
    }
  };

  // Bulk Generation Submit
  const handleBulkGenerateSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      await boothService.bulkGenerateBooths({
        expoId: selectedExpoId,
        rows: parseInt(bulkConfig.rows, 10),
        cols: parseInt(bulkConfig.cols, 10),
        basePrice: parseFloat(bulkConfig.basePrice),
        defaultSize: bulkConfig.defaultSize,
        defaultCategory: bulkConfig.defaultCategory,
      });
      setIsBulkModalOpen(false);
      fetchBooths(selectedExpoId);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Bulk generation failed');
    } finally {
      setModalLoading(false);
    }
  };

  // Single Booth Submit
  const handleSingleBoothSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      await boothService.createBooth({
        expoId: selectedExpoId,
        boothNumber: singleBooth.boothNumber,
        size: singleBooth.size,
        price: parseFloat(singleBooth.price),
        category: singleBooth.category,
        position: {
          row: parseInt(singleBooth.row, 10),
          col: parseInt(singleBooth.col, 10),
        },
        notes: singleBooth.notes,
      });
      setIsSingleModalOpen(false);
      setSingleBooth({
        boothNumber: '',
        size: '10x10',
        price: 500,
        category: 'Standard',
        row: 1,
        col: 1,
        notes: '',
      });
      fetchBooths(selectedExpoId);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create booth');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBooth = async (boothId) => {
    if (!window.confirm('Delete this booth from the floor plan?')) return;
    try {
      await boothService.deleteBooth(boothId, true);
      fetchBooths(selectedExpoId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete booth');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Floor Plans & Booth Allocations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive stall matrix, bulk grid generator, and exhibitor assignments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Expo Switcher */}
          <select
            value={selectedExpoId}
            onChange={(e) => setSelectedExpoId(e.target.value)}
            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {expos.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} ({e.status})
              </option>
            ))}
          </select>

          {/* Bulk Generator Button */}
          <button
            onClick={() => {
              setModalError('');
              setIsBulkModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-600/20"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Bulk Matrix Generator
          </button>

          {/* Add Single Booth Button */}
          <button
            onClick={() => {
              setModalError('');
              setIsSingleModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Single Booth
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('visual')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'visual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Interactive Visual Map"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Rendering exhibition floor layout...</p>
        </div>
      ) : viewMode === 'visual' ? (
        /* Visual Interactive Canvas */
        <FloorPlan
          booths={booths}
          isAdmin={true}
          onAllocate={handleAllocate}
          onRelease={handleRelease}
          exhibitorList={exhibitors}
        />
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Booth #</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Grid Pos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Allocated Exhibitor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booths.map((booth) => (
                  <tr key={booth._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-slate-900">{booth.boothNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {booth.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">{booth.size}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">${booth.price}</td>
                    <td className="py-3 px-4">
                      R{booth.position?.row}, C{booth.position?.col}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          booth.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : booth.status === 'allocated'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {booth.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {booth.exhibitorId?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteBooth(booth._id)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Booth"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Matrix Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Bulk Floor Plan Generator</h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
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

            <form onSubmit={handleBulkGenerateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Rows (A, B, C...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={26}
                    required
                    value={bulkConfig.rows}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, rows: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Columns per Row
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={bulkConfig.cols}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, cols: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={bulkConfig.basePrice}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, basePrice: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Default Size
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkConfig.defaultSize}
                    onChange={(e) => setBulkConfig({ ...bulkConfig, defaultSize: e.target.value })}
                    placeholder="10x10"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                ⚡ <strong>Smart Layout:</strong> Generating {bulkConfig.rows} rows ×{' '}
                {bulkConfig.cols} columns will create up to{' '}
                <strong>{bulkConfig.rows * bulkConfig.cols} booths</strong>. Edge columns are automatically marked as Corner category stalls.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Single Booth Modal */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Individual Stall</h3>
              <button
                onClick={() => setIsSingleModalOpen(false)}
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

            <form onSubmit={handleSingleBoothSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Booth Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP-01"
                    value={singleBooth.boothNumber}
                    onChange={(e) => setSingleBooth({ ...singleBooth, boothNumber: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Category *
                  </label>
                  <select
                    value={singleBooth.category}
                    onChange={(e) => setSingleBooth({ ...singleBooth, category: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Corner">Corner</option>
                    <option value="Island">Island</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={singleBooth.price}
                    onChange={(e) => setSingleBooth({ ...singleBooth, price: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={singleBooth.size}
                    onChange={(e) => setSingleBooth({ ...singleBooth, size: e.target.value })}
                    placeholder="10x10"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Grid Row #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={singleBooth.row}
                    onChange={(e) => setSingleBooth({ ...singleBooth, row: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Grid Col #
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={singleBooth.col}
                    onChange={(e) => setSingleBooth({ ...singleBooth, col: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/20 flex items-center gap-1.5"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Stall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
