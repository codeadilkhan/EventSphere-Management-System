import React, { useState, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Briefcase,
  Search,
  Filter,
  DollarSign,
  Maximize2,
  Tag,
  UserCheck,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export const FloorPlan = ({
  booths = [],
  isAdmin = false,
  onAllocate,
  onRelease,
  onSelectBooth,
  selectedBoothId = null,
  exhibitorList = [],
}) => {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBooth, setActiveBooth] = useState(null);
  const [selectedExhibitorId, setSelectedExhibitorId] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Group booths into a grid layout by row
  const { gridRows, maxCols, stats } = useMemo(() => {
    const rowsMap = {};
    let highestCol = 1;
    let availableCount = 0;
    let reservedCount = 0;
    let allocatedCount = 0;

    booths.forEach((booth) => {
      const r = booth.position?.row || 1;
      const c = booth.position?.col || 1;
      if (!rowsMap[r]) rowsMap[r] = [];
      rowsMap[r].push(booth);

      if (c > highestCol) highestCol = c;
      if (booth.status === 'available') availableCount++;
      else if (booth.status === 'reserved') reservedCount++;
      else if (booth.status === 'allocated') allocatedCount++;
    });

    // Sort booths in each row by column
    Object.keys(rowsMap).forEach((r) => {
      rowsMap[r].sort((a, b) => (a.position?.col || 1) - (b.position?.col || 1));
    });

    const total = booths.length;
    const occupancyPercent = total > 0 ? Math.round(((reservedCount + allocatedCount) / total) * 100) : 0;

    return {
      gridRows: rowsMap,
      maxCols: highestCol,
      stats: { total, availableCount, reservedCount, allocatedCount, occupancyPercent },
    };
  }, [booths]);

  // Handle booth click
  const handleBoothClick = (booth) => {
    setActiveBooth(booth);
    setSelectedExhibitorId(booth.exhibitorId?._id || '');
    setAllocationNotes(booth.notes || '');
    if (onSelectBooth) {
      onSelectBooth(booth);
    }
  };

  // Perform Admin Allocation
  const handleConfirmAllocation = async () => {
    if (!selectedExhibitorId || !activeBooth || !onAllocate) return;
    try {
      setActionLoading(true);
      await onAllocate(activeBooth._id, selectedExhibitorId, allocationNotes);
      setActiveBooth(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Perform Admin Release
  const handleConfirmRelease = async () => {
    if (!activeBooth || !onRelease) return;
    try {
      setActionLoading(true);
      await onRelease(activeBooth._id);
      setActiveBooth(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter evaluation
  const isBoothVisible = (booth) => {
    if (filterCategory !== 'ALL' && booth.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && booth.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = booth.boothNumber?.toLowerCase().includes(q);
      const matchExhibitor = booth.exhibitorId?.name?.toLowerCase().includes(q);
      if (!matchNum && !matchExhibitor) return false;
    }
    return true;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100/60 shadow-xs';
      case 'reserved':
        return 'bg-amber-50/80 border-amber-300 text-amber-800 hover:border-amber-500 hover:bg-amber-100/60 shadow-xs';
      case 'allocated':
        return 'bg-indigo-50/80 border-indigo-300 text-indigo-900 hover:border-indigo-500 hover:bg-indigo-100/60 shadow-xs';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Premium':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Corner':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Island':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Occupancy Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Interactive Floor Plan Map</h4>
            <p className="text-xs text-slate-500">Live stall layout & real-time allocation status</p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Available: {stats.availableCount}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Reserved: {stats.reservedCount}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Allocated: {stats.allocatedCount}
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-slate-500">Occupancy:</span>
            <span className="text-slate-900 font-extrabold">{stats.occupancyPercent}%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search booth (e.g. B-04)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">Status:</span>
          {['ALL', 'available', 'reserved', 'allocated'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-2 mr-1">Tier:</span>
          {['ALL', 'Standard', 'Premium', 'Corner'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Plan Canvas */}
      <div className="bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-x-auto">
        {/* Stage / Entrance Orientation Markers */}
        <div className="w-full max-w-md mx-auto mb-8 py-2 px-6 rounded-xl bg-gradient-to-r from-indigo-900/40 via-brand-600/30 to-indigo-900/40 border border-brand-500/40 text-center text-xs font-bold text-brand-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Main Exhibition Stage & Keynote Arena
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        </div>

        {/* Booth Grid Layout */}
        {Object.keys(gridRows).length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No booths have been configured for this exhibition yet.
          </div>
        ) : (
          <div className="space-y-4 min-w-[700px]">
            {Object.keys(gridRows).map((rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3">
                {/* Row Indicator Badge */}
                <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                  R{rowIndex}
                </span>

                {/* Booths in Row */}
                <div className="flex-1 grid grid-cols-6 gap-3">
                  {gridRows[rowIndex].map((booth) => {
                    const isVisible = isBoothVisible(booth);
                    const isSelected = selectedBoothId === booth._id || activeBooth?._id === booth._id;

                    return (
                      <button
                        key={booth._id}
                        type="button"
                        onClick={() => handleBoothClick(booth)}
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between text-left relative group min-h-[95px] ${
                          getStatusStyle(booth.status)
                        } ${
                          !isVisible ? 'opacity-25 pointer-events-none' : ''
                        } ${
                          isSelected ? 'ring-4 ring-brand-500 scale-[1.03] z-10' : ''
                        }`}
                      >
                        {/* Top: Booth ID & Category */}
                        <div className="flex items-center justify-between w-full">
                          <span className="font-extrabold text-sm tracking-tight">
                            {booth.boothNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadgeColor(
                              booth.category
                            )}`}
                          >
                            {booth.category}
                          </span>
                        </div>

                        {/* Middle: Exhibitor info if allocated */}
                        <div className="my-1">
                          {booth.status === 'allocated' && booth.exhibitorId ? (
                            <p className="text-[10px] font-bold text-indigo-900 truncate">
                              {booth.exhibitorId.name}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500 font-medium capitalize">
                              {booth.status}
                            </p>
                          )}
                        </div>

                        {/* Bottom: Price & Dimensions */}
                        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 border-t border-slate-200/60 pt-1 mt-auto">
                          <span>{booth.size}</span>
                          <span className="font-bold text-slate-900">${booth.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entrance Gate Marker */}
        <div className="w-full max-w-xs mx-auto mt-8 py-2 px-6 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          ▼ Main Visitor Entry & Reception Gate ▼
        </div>
      </div>

      {/* Selected Booth Slide-over Drawer / Modal */}
      {activeBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Booth {activeBooth.boothNumber}
                  </h3>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getCategoryBadgeColor(
                      activeBooth.category
                    )}`}
                  >
                    {activeBooth.category} Tier
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveBooth(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5">Dimensions</span>
                <span className="font-bold text-slate-800">{activeBooth.size}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5">Rental Fee</span>
                <span className="font-bold text-emerald-700 text-sm">${activeBooth.price}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5">Floor Position</span>
                <span className="font-bold text-slate-800">
                  Row {activeBooth.position?.row}, Col {activeBooth.position?.col}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span className="font-bold uppercase text-brand-600">{activeBooth.status}</span>
              </div>
            </div>

            {/* Current Allocation Information */}
            {activeBooth.status === 'allocated' && activeBooth.exhibitorId ? (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  Allocated Exhibitor
                </div>
                <p className="text-sm font-extrabold text-slate-900">
                  {activeBooth.exhibitorId.name}
                </p>
                <p className="text-slate-500">{activeBooth.exhibitorId.email}</p>
                {activeBooth.notes && (
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100 italic">
                    Note: "{activeBooth.notes}"
                  </p>
                )}
                {!isAdmin && (
                  <a
                    href={`/messages?userId=${activeBooth.exhibitorId._id || activeBooth.exhibitorId}`}
                    className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message Exhibitor
                  </a>
                )}
              </div>
            ) : null}

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Admin Allocation Control
                </h4>

                {activeBooth.status === 'allocated' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleConfirmRelease}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 flex items-center justify-center gap-2"
                  >
                    Release Booth Back to Available
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Assign to Exhibitor:
                      </label>
                      <select
                        value={selectedExhibitorId}
                        onChange={(e) => setSelectedExhibitorId(e.target.value)}
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">-- Choose Approved Exhibitor --</option>
                        {exhibitorList.map((ex) => (
                          <option key={ex._id || ex.id} value={ex._id || ex.id}>
                            {ex.name} ({ex.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Admin Allocation Remarks (Optional):
                      </label>
                      <input
                        type="text"
                        value={allocationNotes}
                        onChange={(e) => setAllocationNotes(e.target.value)}
                        placeholder="e.g. Priority corner booth with dual power"
                        className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedExhibitorId || actionLoading}
                      onClick={handleConfirmAllocation}
                      className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2"
                    >
                      Allocate Booth Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Non-Admin Exhibitor Booking Trigger */}
            {!isAdmin && activeBooth.status === 'available' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBooth(null);
                    if (onSelectBooth) onSelectBooth(activeBooth);
                  }}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Apply & Reserve Booth {activeBooth.boothNumber}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
