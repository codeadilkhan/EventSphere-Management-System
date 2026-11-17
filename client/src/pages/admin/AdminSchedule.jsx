import React, { useState, useEffect } from 'react';
import { expoService } from '../../services/expoService';
import { sessionService } from '../../services/sessionService';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const AdminSchedule = () => {
  const [expos, setExpos] = useState([]);
  const [selectedExpoId, setSelectedExpoId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'Artificial Intelligence',
    hall: 'Grand Tech Auditorium (Hall A)',
    startDate: '',
    startTime: '10:00',
    endTime: '11:30',
    capacity: 150,
    speakerName: '',
    speakerRole: 'Keynote Speaker',
    speakerCompany: '',
    speakerBio: '',
  });

  // Load expos on mount
  useEffect(() => {
    const loadExpos = async () => {
      try {
        const res = await expoService.getExpos();
        const list = res.data.expos || [];
        setExpos(list);
        if (list.length > 0) setSelectedExpoId(list[0]._id);
      } catch (err) {
        console.error('Failed to load expos', err);
      }
    };
    loadExpos();
  }, []);

  // Load sessions when expo changes
  const fetchSessions = async (expoId) => {
    if (!expoId) return;
    try {
      setLoading(true);
      const res = await sessionService.getSessionsByExpo(expoId);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExpoId) {
      fetchSessions(selectedExpoId);
    }
  }, [selectedExpoId]);

  const handleOpenCreateModal = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      description: '',
      topic: 'Artificial Intelligence',
      hall: 'Grand Tech Auditorium (Hall A)',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:30',
      capacity: 150,
      speakerName: '',
      speakerRole: 'Keynote Speaker',
      speakerCompany: '',
      speakerBio: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    setFormData({
      title: session.title,
      description: session.description,
      topic: session.topic,
      hall: session.hall,
      startDate: start.toISOString().split('T')[0],
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      capacity: session.capacity,
      speakerName: session.speaker?.name || '',
      speakerRole: session.speaker?.role || '',
      speakerCompany: session.speaker?.company || '',
      speakerBio: session.speaker?.bio || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    const startISO = new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString();
    const endISO = new Date(`${formData.startDate}T${formData.endTime}:00`).toISOString();

    const payload = {
      expoId: selectedExpoId,
      title: formData.title,
      description: formData.description,
      topic: formData.topic,
      hall: formData.hall,
      startTime: startISO,
      endTime: endISO,
      capacity: parseInt(formData.capacity, 10),
      speaker: {
        name: formData.speakerName,
        role: formData.speakerRole,
        company: formData.speakerCompany,
        bio: formData.speakerBio,
      },
    };

    try {
      if (editingSession) {
        await sessionService.updateSession(editingSession._id, payload);
      } else {
        await sessionService.createSession(payload);
      }
      setIsModalOpen(false);
      fetchSessions(selectedExpoId);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to schedule session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this keynote session from the schedule?')) return;
    try {
      await sessionService.deleteSession(id);
      fetchSessions(selectedExpoId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete session');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Event Schedule & Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Build chronological keynote lineups, assign auditorium halls, and enforce conflict checks.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Sessions Timeline Cards */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading session timeline...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-slate-800">No Keynote Sessions Scheduled</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Schedule keynotes, panel discussions, or workshops to populate the public agenda.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
          >
            Schedule First Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => (
            <div
              key={sess._id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                    {sess.topic}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    &ndash;{' '}
                    {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {sess.hall}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{sess.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{sess.description}</p>

                {/* Speaker Info */}
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-700">
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  <span className="font-bold">{sess.speaker?.name}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500">
                    {sess.speaker?.role} {sess.speaker?.company && `at ${sess.speaker.company}`}
                  </span>
                </div>
              </div>

              {/* Capacity Progress & Actions */}
              <div className="shrink-0 flex flex-col items-end gap-3 min-w-[200px]">
                <div className="w-full space-y-1 text-right">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Booked Seats:</span>
                    <span className="font-extrabold text-slate-800">
                      {sess.registeredCount || 0} / {sess.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
                      style={{
                        width: `${Math.min(100, ((sess.registeredCount || 0) / sess.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(sess)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Edit Session"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(sess._id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingSession ? 'Edit Keynote Session' : 'Schedule New Session'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Next-Gen Cloud Robotics & Autonomous Fleet Operations"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Topic / Track *
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Smart Mobility">Smart Mobility</option>
                    <option value="Commercial Scaling">Commercial Scaling</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Auditorium / Hall *
                  </label>
                  <select
                    value={formData.hall}
                    onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Grand Tech Auditorium (Hall A)">Grand Tech Auditorium (Hall A)</option>
                    <option value="Innovation Arena (Hall B)">Innovation Arena (Hall B)</option>
                    <option value="Commercial Workshop Room 1">Commercial Workshop Room 1</option>
                    <option value="Executive Briefing Center">Executive Briefing Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Speaker Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.speakerName}
                    onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Speaker Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.speakerRole}
                    onChange={(e) => setFormData({ ...formData, speakerRole: e.target.value })}
                    placeholder="e.g. Chief Robotics Scientist"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Speaker Organization
                  </label>
                  <input
                    type="text"
                    value={formData.speakerCompany}
                    onChange={(e) => setFormData({ ...formData, speakerCompany: e.target.value })}
                    placeholder="e.g. DeepTech Labs"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Session Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key takeaways, target audience, technical concepts covered..."
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
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
                  className="py-2.5 px-5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/20 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingSession ? 'Update Keynote' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
