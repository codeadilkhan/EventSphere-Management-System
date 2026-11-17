import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { expoService } from '../../services/expoService';
import { sessionService } from '../../services/sessionService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  UserCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';

export const EventSchedule = () => {
  const [searchParams] = useSearchParams();
  const urlExpoId = searchParams.get('expoId');
  const { isAuthenticated } = useAuth();
  const { socket, joinExpo, leaveExpo } = useSocket();

  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myBookmarks, setMyBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [actionMessage, setActionMessage] = useState(null);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const exposRes = await expoService.getExpos();
        const list = exposRes.data.expos || [];
        setExpos(list);

        if (urlExpoId && list.some((e) => e._id === urlExpoId)) {
          setSelectedExpoId(urlExpoId);
        } else if (list.length > 0) {
          setSelectedExpoId(list[0]._id);
        }

        // If logged in, fetch current attendee registrations
        if (isAuthenticated) {
          const regRes = await registrationService.getMyRegistrations();
          const registeredIds = (regRes.data.registeredSessions || []).map((r) => r.session?._id);
          const bookmarkIds = (regRes.data.bookmarkedSessions || []).map((r) => r.session?._id);
          setMyRegistrations(registeredIds);
          setMyBookmarks(new Set(bookmarkIds));
        }
      } catch (err) {
        console.error('Failed to initialize schedule', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [urlExpoId, isAuthenticated]);

  // Load sessions when expo or filters change
  const fetchSessions = async (expoId) => {
    if (!expoId) return;
    try {
      const res = await sessionService.getSessionsByExpo(expoId, {
        topic: selectedTopic,
        hall: selectedHall,
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  useEffect(() => {
    if (selectedExpoId) {
      fetchSessions(selectedExpoId);
      joinExpo(selectedExpoId);
    }
    return () => {
      if (selectedExpoId) leaveExpo(selectedExpoId);
    };
  }, [selectedExpoId, selectedTopic, selectedHall, joinExpo, leaveExpo]);

  // Live schedule reload on socket event
  useEffect(() => {
    if (!socket || !selectedExpoId) return;
    const handleScheduleUpdated = () => {
      fetchSessions(selectedExpoId);
    };
    socket.on('schedule:updated', handleScheduleUpdated);
    return () => {
      socket.off('schedule:updated', handleScheduleUpdated);
    };
  }, [socket, selectedExpoId]);

  // Handle Register for Session
  const handleRegister = async (sessionId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      await registrationService.registerForSession(sessionId);
      setMyRegistrations([...myRegistrations, sessionId]);
      setActionMessage({ type: 'success', text: 'Seat successfully reserved for this keynote!' });
      fetchSessions(selectedExpoId);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not register for session.',
      });
    }
  };

  // Handle Toggle Bookmark
  const handleBookmarkToggle = async (sessionId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await registrationService.toggleBookmark(sessionId);
      const nextBookmarks = new Set(myBookmarks);
      if (res.data.bookmarked) {
        nextBookmarks.add(sessionId);
      } else {
        nextBookmarks.delete(sessionId);
      }
      setMyBookmarks(nextBookmarks);
    } catch (err) {
      console.error('Bookmark error', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Chronological Agenda
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Keynote Sessions & Workshops
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reserve your seats in advance, bookmark topics, and access auditorium halls.
          </p>
        </div>

        {/* Expo Selector */}
        <select
          value={selectedExpoId}
          onChange={(e) => setSelectedExpoId(e.target.value)}
          className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {expos.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Action feedback */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Track Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
            Track:
          </span>
          {['ALL', 'Artificial Intelligence', 'Robotics & Hardware', 'Cloud Infrastructure'].map(
            (top) => (
              <button
                key={top}
                onClick={() => setSelectedTopic(top)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTopic === top
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {top}
              </button>
            )
          )}
        </div>

        {/* Hall Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hall:</span>
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
          >
            <option value="ALL">All Halls</option>
            <option value="Grand Tech Auditorium (Hall A)">Grand Tech Auditorium (Hall A)</option>
            <option value="Innovation Arena (Hall B)">Innovation Arena (Hall B)</option>
            <option value="Commercial Workshop Room 1">Commercial Workshop Room 1</option>
          </select>
        </div>
      </div>

      {/* Sessions Lineup List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching event schedule...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Keynotes Found</h4>
          <p className="text-xs text-slate-400">
            No sessions match the selected topic or auditorium filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sessions.map((sess) => {
            const isRegistered = myRegistrations.includes(sess._id);
            const isBookmarked = myBookmarks.has(sess._id);
            const isFull = sess.registeredCount >= sess.capacity;

            return (
              <div
                key={sess._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Session Main Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                      {sess.topic}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(sess.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      &ndash;{' '}
                      {new Date(sess.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {sess.hall}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">{sess.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {sess.description}
                  </p>

                  {/* Speaker Details */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {sess.speaker?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{sess.speaker?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {sess.speaker?.role}{' '}
                        {sess.speaker?.company && `&bull; ${sess.speaker.company}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Seat Capacity & Actions */}
                <div className="shrink-0 flex flex-col items-end gap-3 min-w-[220px]">
                  {/* Seat Progress */}
                  <div className="w-full space-y-1 text-right">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Seat Availability:</span>
                      <span className="font-extrabold text-slate-800">
                        {isFull ? (
                          <span className="text-rose-600 font-bold">Full House</span>
                        ) : (
                          `${sess.capacity - (sess.registeredCount || 0)} seats left`
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isFull
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-brand-600 to-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((sess.registeredCount || 0) / sess.capacity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Booking & Bookmark Buttons */}
                  <div className="flex items-center gap-2 w-full">
                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmarkToggle(sess._id)}
                      className={`p-3 rounded-2xl border transition-all ${
                        isBookmarked
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark Session'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                      />
                    </button>

                    {/* Register Seat */}
                    {isRegistered ? (
                      <span className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Seat Confirmed
                      </span>
                    ) : isFull ? (
                      <button
                        disabled
                        className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
                      >
                        Capacity Reached
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(sess._id)}
                        className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        Reserve Seat
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
