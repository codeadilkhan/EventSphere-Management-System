import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import {
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export const AdminFeedback = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket for Modal / Reply
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getAllFeedback({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        type: filterType === 'ALL' ? undefined : filterType,
        q: searchQuery || undefined,
      });
      setTickets(res.data?.tickets || []);
    } catch (err) {
      console.error('Failed to load feedback tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setReplyStatus(ticket.status === 'open' ? 'in-progress' : ticket.status);
    setActionSuccess(null);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSubmittingReply(true);
      const res = await feedbackService.replyToFeedback(
        selectedTicket._id,
        replyText.trim(),
        replyStatus
      );

      setActionSuccess('Reply successfully dispatched to the user!');
      setSelectedTicket(res.data?.feedback);

      // Refresh tickets list
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await feedbackService.updateStatus(ticketId, newStatus);
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            In Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'issue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Organizer Helpdesk
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-brand-600" />
            Feedback, Inquiries & Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review stakeholder questions, bug reports, and suggestions with direct response dispatch.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
          />
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {[
            { id: 'ALL', label: 'All Statuses' },
            { id: 'open', label: 'Pending Review' },
            { id: 'in-progress', label: 'In Review' },
            { id: 'resolved', label: 'Resolved' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {['ALL', 'inquiry', 'issue', 'suggestion'].map((tp) => (
            <button
              key={tp}
              onClick={() => setFilterType(tp)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterType === tp
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tp === 'ALL' ? 'All' : tp.charAt(0).toUpperCase() + tp.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Feed */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Tickets Matching Filter</h4>
          <p className="text-xs text-slate-400">
            No inquiries or feedback match the selected criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                    {getTypeIcon(t.type)}
                    <span>{t.type}</span>
                  </div>
                  {getStatusBadge(t.status)}
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.subject}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {t.message}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-600" />
                    {t.userId?.name || 'Anonymous User'}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {t.userId?.email}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700">
                    {t.userId?.role || 'Attendee'}
                  </span>
                </div>
              </div>

              {/* Actions & Quick Status */}
              <div className="shrink-0 flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleOpenTicket(t)}
                  className="py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-brand-600/20 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Review & Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  {getTypeIcon(selectedTicket.type)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Ticket #{selectedTicket._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Author: {selectedTicket.userId?.name} ({selectedTicket.userId?.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Ticket Subject & Description Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Subject & Inquiry Description
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {selectedTicket.subject}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-700">
                    Official Organizer Response:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Set Ticket Status:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white"
                    >
                      <option value="in-progress">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="open">Pending Review</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Type your official answer or resolution here. The author will be notified immediately via in-app alert and email..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="py-2 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="py-2.5 px-5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Transmit Official Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
