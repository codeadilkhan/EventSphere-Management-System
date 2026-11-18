import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { boothService } from '../../services/boothService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { FloorPlan } from '../../components/floorplan/FloorPlan';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Loader2,
  X,
  Sparkles,
  MessageSquare,
  Users,
  Building,
  Mail,
  MapPin,
  Package,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

export const ExhibitorBooths = () => {
  const { user } = useAuth();
  const { socket, joinExpo, leaveExpo, isUserOnline } = useSocket();
  const [searchParams] = useSearchParams();
  const urlExpoId = searchParams.get('expoId');

  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('');
  const [booths, setBooths] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reservation Confirmation Modal
  const [selectedBoothForBooking, setSelectedBoothForBooking] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  // Manage Booth Details Modal (Products Showcased & Staff Info)
  const [editingBoothDetails, setEditingBoothDetails] = useState(null);
  const [detailsForm, setDetailsForm] = useState({
    productsInput: '',
    staff: [],
    notes: '',
  });
  const [savingDetails, setSavingDetails] = useState(false);

  const handleOpenDetailsModal = (booth) => {
    setEditingBoothDetails(booth);
    setDetailsForm({
      productsInput: (booth.productsShowcased || []).join(', '),
      staff:
        booth.staff && booth.staff.length > 0
          ? [...booth.staff]
          : [{ name: '', role: 'Booth Representative', email: '', phone: '' }],
      notes: booth.notes || '',
    });
  };

  const handleAddStaffRow = () => {
    setDetailsForm((prev) => ({
      ...prev,
      staff: [...prev.staff, { name: '', role: 'Booth Representative', email: '', phone: '' }],
    }));
  };

  const handleRemoveStaffRow = (index) => {
    setDetailsForm((prev) => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }));
  };

  const handleStaffChange = (index, field, value) => {
    setDetailsForm((prev) => {
      const updated = [...prev.staff];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, staff: updated };
    });
  };

  const handleSaveBoothDetails = async (e) => {
    e.preventDefault();
    if (!editingBoothDetails) return;
    try {
      setSavingDetails(true);
      const productsShowcased = detailsForm.productsInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const validStaff = detailsForm.staff.filter((s) => s.name && s.name.trim());

      await boothService.updateBoothDetails(editingBoothDetails._id, {
        productsShowcased,
        staff: validStaff,
        notes: detailsForm.notes,
      });

      setBookingMessage({
        type: 'success',
        text: `Booth ${editingBoothDetails.boothNumber} showcase and staff details saved successfully.`,
      });
      setEditingBoothDetails(null);
      const res = await boothService.getBoothsByExpo(selectedExpoId);
      setBooths(res.data.booths || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booth details.');
    } finally {
      setSavingDetails(false);
    }
  };

  // Load expos and applications on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const [exposRes, appsRes] = await Promise.all([
          expoService.getExpos(),
          applicationService.getMyApplications(),
        ]);

        const exposList = exposRes.data.expos || [];
        setExpos(exposList);
        setMyApplications(appsRes.data.applications || []);

        if (urlExpoId && exposList.some((e) => e._id === urlExpoId)) {
          setSelectedExpoId(urlExpoId);
        } else if (exposList.length > 0) {
          setSelectedExpoId(exposList[0]._id);
        }
      } catch (err) {
        console.error('Initialization error', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [urlExpoId]);

  // Load booths when selected expo changes
  const loadBooths = async (expoId) => {
    if (!expoId) return;
    try {
      const res = await boothService.getBoothsByExpo(expoId);
      setBooths(res.data.booths || []);
    } catch (err) {
      console.error('Failed to load booths', err);
    }
  };

  useEffect(() => {
    if (selectedExpoId) {
      loadBooths(selectedExpoId);
      setBookingMessage(null);
      joinExpo(selectedExpoId);
    }
    return () => {
      if (selectedExpoId) leaveExpo(selectedExpoId);
    };
  }, [selectedExpoId, joinExpo, leaveExpo]);

  // Live Socket.io booth update listener
  useEffect(() => {
    if (!socket) return;
    const handleBoothUpdated = ({ booth }) => {
      setBooths((prev) =>
        prev.map((b) => (b._id === booth._id ? { ...b, ...booth } : b))
      );
    };
    socket.on('booth:updated', handleBoothUpdated);
    return () => {
      socket.off('booth:updated', handleBoothUpdated);
    };
  }, [socket]);

  // My Allocated Booth in this expo
  const myBooths = useMemo(() => {
    return booths.filter(
      (b) =>
        b.exhibitorId?._id === user?._id ||
        b.exhibitorId === user?._id ||
        (user?.id && (b.exhibitorId?._id === user.id || b.exhibitorId === user.id))
    );
  }, [booths, user]);

  // Neighbor Exhibitors (adjacent stalls or same row)
  const neighborExhibitors = useMemo(() => {
    if (myBooths.length === 0) return [];

    const myRows = new Set(myBooths.map((b) => b.position?.row));
    const myCols = new Set(myBooths.map((b) => b.position?.col));

    const neighborsMap = new Map();

    booths.forEach((b) => {
      if (b.status === 'allocated' && b.exhibitorId) {
        const exhibitorId = b.exhibitorId?._id || b.exhibitorId;
        const isMe = exhibitorId === user?._id || exhibitorId === user?.id;
        if (!isMe) {
          const rowDiff = Math.min(...Array.from(myRows).map((r) => Math.abs(r - (b.position?.row || 1))));
          const colDiff = Math.min(...Array.from(myCols).map((c) => Math.abs(c - (b.position?.col || 1))));

          // Considered neighbor if within adjacent row/col
          if (rowDiff <= 1 && colDiff <= 2) {
            let relation = 'Adjacent Hall Stall';
            if (rowDiff === 0 && colDiff === 1) relation = 'Immediate Neighbor (Next Door)';
            else if (rowDiff === 0) relation = 'Same Row Partner';
            else if (colDiff === 0) relation = 'Facing Stall';

            neighborsMap.set(exhibitorId.toString(), {
              booth: b,
              exhibitor: b.exhibitorId,
              relation,
            });
          }
        }
      }
    });

    return Array.from(neighborsMap.values());
  }, [booths, myBooths, user]);

  // Determine application status for the selected Expo
  const currentExpoApplication = myApplications.find(
    (app) => app.expoId?._id === selectedExpoId || app.expoId === selectedExpoId
  );

  const isApprovedForExpo = currentExpoApplication?.status === 'approved';

  // Handle booth selection from floor plan
  const handleSelectBooth = (booth) => {
    if (booth.status !== 'available') return;
    setSelectedBoothForBooking(booth);
    setBookingMessage(null);
  };

  // Perform atomic reservation
  const handleConfirmReservation = async () => {
    if (!selectedBoothForBooking) return;
    setReserving(true);
    setBookingMessage(null);

    try {
      const res = await boothService.reserveBooth(selectedBoothForBooking._id);
      setBookingMessage({
        type: 'success',
        text: `Success! Booth ${selectedBoothForBooking.boothNumber} is now officially secured for your company.`,
      });
      setSelectedBoothForBooking(null);
      loadBooths(selectedExpoId);
    } catch (err) {
      setBookingMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Failed to reserve this booth. It may have just been claimed by another exhibitor.',
      });
      setSelectedBoothForBooking(null);
      loadBooths(selectedExpoId);
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Floor Plan & Stall Selection
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive booth map with atomic conflict prevention and instant reservation.
          </p>
        </div>

        {/* Expo Selector */}
        <select
          value={selectedExpoId}
          onChange={(e) => setSelectedExpoId(e.target.value)}
          className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          {expos.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Verification & Eligibility Alert Banner */}
      {isApprovedForExpo ? (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold">Verified Exhibitor Access Enabled</p>
              <p className="text-emerald-700">
                Your application for this exhibition is approved. Click on any green "Available" stall below to lock your reservation.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold uppercase text-[10px]">
            Ready to Reserve
          </span>
        </div>
      ) : currentExpoApplication?.status === 'pending' ? (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold">Application Pending Approval</p>
              <p className="text-amber-700">
                Your exhibition credentials are under review. You can browse the floor plan below, but booth locking is enabled once approved.
              </p>
            </div>
          </div>
          <Link
            to="/exhibitor/applications"
            className="px-3 py-1.5 bg-amber-700 text-white font-bold rounded-lg text-xs hover:bg-amber-800 transition-colors shrink-0"
          >
            Check Status
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold">Exhibition Application Required</p>
              <p className="text-slate-500">
                You must submit an exhibitor application for this event before reserving a stall.
              </p>
            </div>
          </div>
          <Link
            to="/exhibitor/applications"
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            Apply for this Expo
          </Link>
        </div>
      )}

      {/* Booking Alert feedback */}
      {bookingMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
            bookingMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {bookingMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{bookingMessage.text}</span>
        </div>
      )}

      {/* Interactive Floor Plan Canvas */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading interactive floor map...</p>
        </div>
      ) : (
        <FloorPlan
          booths={booths}
          isAdmin={false}
          onSelectBooth={handleSelectBooth}
        />
      )}

      {/* My Allocated Stalls & Showcase Details */}
      {myBooths.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  My Allocated Stalls & Showcase Details
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure products/services showcased and register on-site booth staff for your confirmed spaces.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {myBooths.length} Reserved Stall{myBooths.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {myBooths.map((booth) => (
              <div
                key={booth._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-purple-600 text-white">
                      Stall {booth.boothNumber}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      {booth.category} Tier • Size: {booth.size} • Row {booth.position?.row}, Col {booth.position?.col}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenDetailsModal(booth)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Manage Details
                  </button>
                </div>

                {/* Showcased Products */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Showcased Products & Services:
                  </span>
                  {booth.productsShowcased && booth.productsShowcased.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {booth.productsShowcased.map((prod, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No products listed yet. Click "Manage Details" to add.</p>
                  )}
                </div>

                {/* On-site Staff */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    On-site Booth Staff:
                  </span>
                  {booth.staff && booth.staff.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {booth.staff.map((st, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200 text-xs">
                          <p className="font-bold text-slate-800">{st.name}</p>
                          <p className="text-[10px] text-purple-600">{st.role || 'Representative'}</p>
                          {st.email && <p className="text-[10px] text-slate-400">{st.email}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No booth staff assigned yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neighbor Exhibitors & Networking Section (T06.13) */}
      {myBooths.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Neighboring Exhibitors & Peer Networking
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Collaborate with fellow enterprises allocated to stalls directly adjacent to your booth ({myBooths.map((b) => b.boothNumber).join(', ')}).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {neighborExhibitors.length} Nearby Peers
            </span>
          </div>

          {neighborExhibitors.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No neighbors have been allocated to stalls immediately adjacent to yours yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {neighborExhibitors.map(({ booth, exhibitor, relation }) => {
                const isOnline = isUserOnline(exhibitor._id || exhibitor);
                return (
                  <div
                    key={booth._id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                          Booth {booth.boothNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {relation}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {exhibitor.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {exhibitor.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        {isOnline ? 'Online now' : 'Offline'}
                      </div>
                    </div>

                    <Link
                      to={`/exhibitor/messages?userId=${exhibitor._id || exhibitor}`}
                      className="w-full py-2 px-3 bg-white hover:bg-purple-600 text-slate-700 hover:text-white font-bold rounded-xl text-xs transition-colors border border-slate-200 hover:border-purple-600 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat with Neighbor
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reservation Confirmation Modal */}
      {selectedBoothForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Confirm Booth Reservation</h3>
              </div>
              <button
                onClick={() => setSelectedBoothForBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                    Stall Number
                  </span>
                  <span className="text-lg font-extrabold text-purple-900">
                    {selectedBoothForBooking.boothNumber}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-100 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tier</span>
                    <strong className="text-slate-800">{selectedBoothForBooking.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Size</span>
                    <strong className="text-slate-800">{selectedBoothForBooking.size}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Price</span>
                    <strong className="text-emerald-700">${selectedBoothForBooking.price}</strong>
                  </div>
                </div>
              </div>

              {!isApprovedForExpo ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Your application for this expo is not yet approved. You cannot reserve stalls until organizer approval.
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  By clicking confirm, this booth will be <strong>atomically allocated</strong> to your company profile, instantly locking out other exhibitors from reserving it.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBoothForBooking(null)}
                className="py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isApprovedForExpo || reserving}
                onClick={handleConfirmReservation}
                className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5"
              >
                {reserving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm & Lock Booth
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Manage Booth Showcase & Staff Details Modal */}
      {editingBoothDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Manage Booth {editingBoothDetails.boothNumber} Details
                </h3>
              </div>
              <button
                onClick={() => setEditingBoothDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBoothDetails} className="space-y-4">
              {/* Showcased Products / Services */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Products & Services Showcased (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Vision Pro, Autonomous Forklift, Cloud Dashboard"
                  value={detailsForm.productsInput}
                  onChange={(e) => setDetailsForm({ ...detailsForm, productsInput: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="text-[11px] text-slate-400">Separate multiple product or service names with commas.</p>
              </div>

              {/* On-site Staff Info */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    On-Site Booth Staff
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStaffRow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Staff Member
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {detailsForm.staff.map((st, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Staff Name *"
                          value={st.name}
                          onChange={(e) => handleStaffChange(idx, 'name', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Lead Engineer)"
                          value={st.role}
                          onChange={(e) => handleStaffChange(idx, 'role', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          placeholder="Staff Email"
                          value={st.email}
                          onChange={(e) => handleStaffChange(idx, 'email', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="tel"
                          placeholder="Phone / WhatsApp"
                          value={st.phone}
                          onChange={(e) => handleStaffChange(idx, 'phone', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      {detailsForm.staff.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStaffRow(idx)}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-full"
                          title="Remove staff"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Booth Logistics & Setup Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 240V power outlet required, demo podium on left corner"
                  value={detailsForm.notes}
                  onChange={(e) => setDetailsForm({ ...detailsForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBoothDetails(null)}
                  className="py-2 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDetails}
                  className="py-2.5 px-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  {savingDetails && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
