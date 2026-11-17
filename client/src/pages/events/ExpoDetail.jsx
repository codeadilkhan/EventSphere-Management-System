import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { FloorPlan } from '../../components/floorplan/FloorPlan';
import {
  Calendar,
  MapPin,
  Layers,
  Users,
  Store,
  Clock,
  ArrowRight,
  Share2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Ticket
} from 'lucide-react';

export const ExpoDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { socket, joinExpo, leaveExpo } = useSocket();
  const [expo, setExpo] = useState(null);
  const [booths, setBooths] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('floorplan'); // 'floorplan' | 'about' | 'exhibitors'

  useEffect(() => {
    if (id) {
      joinExpo(id);
    }
    return () => {
      if (id) leaveExpo(id);
    };
  }, [id, joinExpo, leaveExpo]);

  // Live Socket updates for floor plan and expo changes
  useEffect(() => {
    if (!socket || !id) return;

    const handleBoothUpdated = ({ booth }) => {
      setBooths((prev) =>
        prev.map((b) => (b._id === booth._id ? { ...b, ...booth } : b))
      );
    };

    const handleExpoUpdated = ({ expo: updatedExpo }) => {
      if (updatedExpo._id === id) {
        setExpo((prev) => ({ ...prev, ...updatedExpo }));
      }
    };

    socket.on('booth:updated', handleBoothUpdated);
    socket.on('expo:updated', handleExpoUpdated);

    return () => {
      socket.off('booth:updated', handleBoothUpdated);
      socket.off('expo:updated', handleExpoUpdated);
    };
  }, [socket, id]);

  useEffect(() => {
    const fetchExpoDetails = async () => {
      try {
        setLoading(true);
        const res = await expoService.getExpoById(id);
        setExpo(res.data.expo);
        setBooths(res.data.booths || []);
        setStats(res.data.stats || {});

        if (isAuthenticated) {
          try {
            const regRes = await registrationService.getMyRegistrations();
            const exposList = regRes.data.registeredExpos || [];
            setIsRegistered(exposList.some((r) => r.expo?._id === id || r.expo === id));
          } catch (e) {
            // User might not have registrations yet
          }
        }
      } catch (err) {
        console.error('Failed to load expo details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpoDetails();
  }, [id, isAuthenticated]);

  const handleRegisterExpo = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      setRegistering(true);
      await registrationService.registerForExpo(id);
      setIsRegistered(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not register for exhibition.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading exhibition specifications...</p>
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Exhibition Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested trade exhibition is either private or does not exist.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Expos Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl min-h-[360px] flex flex-col justify-end p-6 sm:p-10 border border-slate-800">
        <img
          src={
            expo.bannerImage ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'
          }
          alt={expo.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {expo.theme}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {expo.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>
                {new Date(expo.startDate).toLocaleDateString()} &ndash;{' '}
                {new Date(expo.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>
                {expo.location?.venue}, {expo.location?.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">
                {stats?.available || 0} Stalls Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'floorplan'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Interactive Floor Plan & Stalls
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            About Exhibition
          </button>

          <button
            onClick={() => setActiveTab('exhibitors')}
            className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'exhibitors'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            Confirmed Exhibitors ({stats?.allocated || 0})
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {isRegistered ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Expo Pass Active
            </span>
          ) : (
            <button
              onClick={handleRegisterExpo}
              disabled={registering}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              {registering ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Ticket className="w-3.5 h-3.5" />
              )}
              Get Free Attendee Pass
            </button>
          )}

          <Link
            to={`/schedule?expoId=${expo._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Sessions
          </Link>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Book Stall <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tab 1: Floor Plan */}
      {activeTab === 'floorplan' && (
        <div className="space-y-4">
          <FloorPlan booths={booths} isAdmin={false} />
        </div>
      )}

      {/* Tab 2: About Expo */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Exhibition Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {expo.description}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Venue & Access
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-semibold">Complex</span>
                <p className="font-bold text-slate-800 text-sm">{expo.location?.venue}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">City</span>
                <p className="font-bold text-slate-800">{expo.location?.city}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Address Details</span>
                <p>{expo.location?.address || 'Main Entrance Pavilion'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Confirmed Exhibitors */}
      {activeTab === 'exhibitors' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Participating Enterprise Brands</h3>

          {booths.filter((b) => b.status === 'allocated' && b.exhibitorId).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No exhibitors have been officially allocated to stalls yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {booths
                .filter((b) => b.status === 'allocated' && b.exhibitorId)
                .map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.exhibitorId.name}</h4>
                      <p className="text-xs text-slate-500">{b.exhibitorId.email}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold">
                      Booth {b.boothNumber}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
