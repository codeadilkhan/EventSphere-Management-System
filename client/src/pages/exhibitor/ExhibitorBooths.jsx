import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { boothService } from '../../services/boothService';
import { applicationService } from '../../services/applicationService';
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
  Sparkles
} from 'lucide-react';

export const ExhibitorBooths = () => {
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
    }
  }, [selectedExpoId]);

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
    </div>
  );
};
