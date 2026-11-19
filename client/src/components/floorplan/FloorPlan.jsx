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
  MessageSquare,
  Compass,
  Building2,
  Zap,
  Info
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
        return 'bg-emerald-500/15 border-emerald-400 text-emerald-200 hover:bg-emerald-500/25 hover:border-emerald-300';
      case 'reserved':
        return 'bg-amber-500/15 border-amber-400 text-amber-200 hover:bg-amber-500/25 hover:border-amber-300';
      case 'allocated':
        return 'bg-rose-500/15 border-rose-400/80 text-rose-200 hover:bg-rose-500/25 hover:border-rose-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Premium':
        return 'bg-purple-900/60 text-purple-300 border-purple-500/40';
      case 'Corner':
        return 'bg-amber-900/60 text-amber-300 border-amber-500/40';
      case 'Island':
        return 'bg-blue-900/60 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Interactive Control Strip & Live Availability Metrics */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#101828] to-[#4338CA] text-white flex items-center justify-center font-bold shadow-md shadow-brand-700/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-[#101828]">Interactive Architectural Floor Plan</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-accent-50 text-accent-600 border border-accent-200">
                Live Grid
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Atomic stall reservation engine with instant visual occupancy tracking.
            </p>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Available ({stats.availableCount})
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Reserved ({stats.reservedCount})
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/90 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Occupied ({stats.allocatedCount})
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium">Occupancy:</span>
            <span className="text-[#101828] text-sm font-black">{stats.occupancyPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search booth (e.g. A-01, TechCorp)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'available', 'reserved', 'allocated'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider ml-2 mr-1">Tier:</span>
          {['ALL', 'Standard', 'Premium', 'Corner'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-[#4338CA] to-[#FF6B35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dark Exhibition Floor Canvas with Architectural Grid */}
      <div className="bg-gradient-to-b from-[#101828] via-[#0d1424] to-[#101828] rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl overflow-x-auto relative">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Stage Orientation Bar */}
        <div className="w-full max-w-lg mx-auto mb-10 py-3 px-8 rounded-2xl bg-gradient-to-r from-brand-900/30 via-brand-700/40 to-brand-900/30 border border-brand-500/40 text-center text-xs font-black text-brand-300 uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span>Plenary Keynote Arena & Main Exhibition Stage</span>
          <Sparkles className="w-4 h-4 text-accent-400" />
        </div>

        {/* Booth Grid Layout */}
        {Object.keys(gridRows).length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            No booths have been configured for this exhibition yet.
          </div>
        ) : (
          <div className="space-y-4 min-w-[760px] relative z-10">
            {Object.keys(gridRows).map((rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3">
                {/* Row Indicator Badge */}
                <span className="w-9 h-9 rounded-xl bg-slate-800/90 text-slate-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-700 shadow-xs">
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
                        className={`p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between text-left relative group min-h-[105px] ${
                          getStatusStyle(booth.status)
                        } ${
                          !isVisible ? 'opacity-20 pointer-events-none' : ''
                        } ${
                          isSelected
                            ? 'ring-4 ring-accent-500 border-accent-400 scale-[1.04] z-20 shadow-2xl shadow-accent-500/30'
                            : ''
                        }`}
                      >
                        {/* Top: Booth ID & Category */}
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-sm tracking-tight text-white">
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
                            <p className="text-[11px] font-extrabold text-white truncate drop-shadow-xs">
                              {booth.exhibitorId.name}
                            </p>
                          ) : (
                            <p className="text-[10px] font-bold capitalize tracking-wide opacity-80">
                              {booth.status}
                            </p>
                          )}
                        </div>

                        {/* Bottom: Price & Dimensions */}
                        <div className="flex items-center justify-between w-full text-[10px] text-slate-400 border-t border-white/10 pt-1.5 mt-auto">
                          <span className="text-[10px]">{booth.size}</span>
                          <span className="font-extrabold text-white">${booth.price}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entrance Marker */}
        <div className="w-full max-w-sm mx-auto mt-10 py-2.5 px-6 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>▼ Main Exhibition Entrance & Registration Foyer ▼</span>
        </div>
      </div>

      {/* 4. Selected Booth Drawer / Modal */}
      {activeBooth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#101828] to-[#4338CA] text-white flex items-center justify-center font-bold shadow-md">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#101828]">
                    Stall {activeBooth.boothNumber}
                  </h3>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase mt-0.5 ${getCategoryBadgeColor(
                      activeBooth.category
                    )}`}
                  >
                    {activeBooth.category} Classification
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveBooth(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5 font-medium">Stall Dimensions</span>
                <span className="font-extrabold text-[#101828] text-sm">{activeBooth.size}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5 font-medium">Rental Tariff</span>
                <span className="font-black text-emerald-700 text-sm">${activeBooth.price}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5 font-medium">Hall Coordinates</span>
                <span className="font-extrabold text-[#101828]">
                  Row {activeBooth.position?.row}, Col {activeBooth.position?.col}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-slate-400 block mb-0.5 font-medium">Allocation Status</span>
                <span className="font-black uppercase text-brand-700">{activeBooth.status}</span>
              </div>
            </div>

            {/* Current Allocation Information */}
            {activeBooth.status === 'allocated' && activeBooth.exhibitorId ? (
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/90 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-brand-900 font-extrabold">
                  <UserCheck className="w-4 h-4 text-brand-700" />
                  Allocated Commercial Exhibitor
                </div>
                <p className="text-base font-black text-[#101828]">
                  {activeBooth.exhibitorId.name}
                </p>
                <p className="text-slate-500 font-medium">{activeBooth.exhibitorId.email}</p>
                {activeBooth.notes && (
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-brand-200/60 italic">
                    Stall Specification: "{activeBooth.notes}"
                  </p>
                )}
                {!isAdmin && (
                  <a
                    href={`/messages?userId=${activeBooth.exhibitorId._id || activeBooth.exhibitorId}`}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Inquire / Message Exhibitor
                  </a>
                )}
              </div>
            ) : null}

            {/* Admin Management Actions */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-black text-[#101828] uppercase tracking-wider">
                  Admin Allocation Control
                </h4>

                {activeBooth.status === 'allocated' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleConfirmRelease}
                    className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Release Stall Back to Available
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Assign to Approved Exhibitor:
                      </label>
                      <select
                        value={selectedExhibitorId}
                        onChange={(e) => setSelectedExhibitorId(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20"
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
                      <label className="block text-[11px] font-bold text-slate-700">
                        Admin Stall Notes (Optional):
                      </label>
                      <input
                        type="text"
                        value={allocationNotes}
                        onChange={(e) => setAllocationNotes(e.target.value)}
                        placeholder="e.g. Premium corner stall with 3-phase power"
                        className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338CA]/20"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedExhibitorId || actionLoading}
                      onClick={handleConfirmAllocation}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-700/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Allocate Stall Now
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
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#4338CA] to-[#FF6B35] text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Apply & Reserve Stall {activeBooth.boothNumber}
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
