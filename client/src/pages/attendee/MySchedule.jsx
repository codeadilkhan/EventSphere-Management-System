import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import {
  Calendar,
  Clock,
  MapPin,
  Bookmark,
  CheckCircle2,
  Bell,
  Trash2,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const MySchedule = () => {
  const [data, setData] = useState({
    registeredExpos: [],
    registeredSessions: [],
    bookmarkedSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'expos' | 'bookmarks'
  const [actionMessage, setActionMessage] = useState(null);

  const fetchMySchedule = async () => {
    try {
      setLoading(true);
      const res = await registrationService.getMyRegistrations();
      setData({
        registeredExpos: res.data.registeredExpos || [],
        registeredSessions: res.data.registeredSessions || [],
        bookmarkedSessions: res.data.bookmarkedSessions || [],
      });
    } catch (err) {
      console.error('Failed to load my schedule', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const handleCancelExpo = async (expoId) => {
    if (!window.confirm('Cancel your attendee pass for this exhibition?')) return;
    try {
      await registrationService.cancelExpoRegistration(expoId);
      setActionMessage({ type: 'success', text: 'Exhibition pass cancelled.' });
      fetchMySchedule();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel pass.');
    }
  };

  const handleCancelRegistration = async (sessionId) => {
    if (!window.confirm('Cancel your confirmed seat for this keynote?')) return;
    try {
      await registrationService.cancelRegistration(sessionId);
      setActionMessage({ type: 'success', text: 'Seat reservation cancelled.' });
      fetchMySchedule();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel reservation.');
    }
  };

  const handleRemoveBookmark = async (sessionId) => {
    try {
      await registrationService.toggleBookmark(sessionId);
      fetchMySchedule();
    } catch (err) {
      console.error('Bookmark error', err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Event Agenda & Bookmarks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Confirmed keynote seat passes and saved bookmark keynotes.
          </p>
        </div>

        <Link
          to="/events/schedule"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20"
        >
          <Calendar className="w-4 h-4" />
          Explore Full Schedule
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)}>&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('registered')}
          className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'registered'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirmed Keynote Seats ({data.registeredSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('expos')}
          className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'expos'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Exhibition Passes ({data.registeredExpos.length})
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'bookmarks'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Bookmarks ({data.bookmarkedSessions.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your personalized schedule...</p>
        </div>
      ) : activeTab === 'registered' ? (
        data.registeredSessions.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-800">No Reserved Keynote Seats</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You haven't reserved seats for any keynotes yet. Browse the schedule to lock in your seats.
              </p>
            </div>
            <Link
              to="/events/schedule"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
            >
              Browse Event Lineup
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.registeredSessions.map((item) => {
              const sess = item.session;
              if (!sess) return null;

              return (
                <div
                  key={item.registrationId}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700">
                        {sess.topic}
                      </span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
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
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {sess.hall}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{sess.title}</h3>

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">Speaker: {sess.speaker?.name}</span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3 text-emerald-600" />
                        30m Reminder Active
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => handleCancelRegistration(sess._id)}
                      className="py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel Seat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'expos' ? (
        data.registeredExpos.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-800">No Exhibition Passes</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You haven't registered for any full exhibition passes yet.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
            >
              Browse Exhibitions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.registeredExpos.map((item) => {
              const expo = item.expo;
              if (!expo) return null;

              return (
                <div
                  key={item.registrationId}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-brand-600 uppercase text-[10px]">
                        {expo.theme || 'Exhibition Pass'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {expo.venue || expo.location?.venue}, {expo.city || expo.location?.city}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{expo.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      {new Date(expo.startDate).toLocaleDateString()} &ndash;{' '}
                      {new Date(expo.endDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${expo._id}`}
                      className="py-2 px-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      View Expo <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleCancelExpo(expo._id)}
                      className="py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : data.bookmarkedSessions.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-slate-800">No Bookmarked Sessions</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Save keynotes by clicking the bookmark icon on any session.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.bookmarkedSessions.map((item) => {
            const sess = item.session;
            if (!sess) return null;

            return (
              <div
                key={item.registrationId}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-brand-600 uppercase text-[10px]">
                      {sess.topic}
                    </span>
                    <span>&bull;</span>
                    <span>{sess.hall}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{sess.title}</h3>
                  <p className="text-xs text-slate-500">Speaker: {sess.speaker?.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/events/schedule"
                    className="py-2 px-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    View & Reserve Seat <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleRemoveBookmark(sess._id)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
