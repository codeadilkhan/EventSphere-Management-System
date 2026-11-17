import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { useAuth } from '../../hooks/useAuth';
import {
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  X,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const FeedbackModal = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my-tickets'
  const [type, setType] = useState('inquiry'); // 'suggestion' | 'issue' | 'inquiry'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // My tickets list
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  const fetchMyTickets = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingTickets(true);
      const res = await feedbackService.getMyFeedback();
      setMyTickets(res.data?.tickets || []);
    } catch (err) {
      console.error('Failed to load my tickets', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'my-tickets') {
      fetchMyTickets();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      setStatusMessage(null);
      await feedbackService.submitFeedback({
        type,
        subject: subject.trim(),
        message: message.trim(),
      });

      setStatusMessage({
        type: 'success',
        text: 'Your feedback or support request has been logged. An organizer will review it promptly.',
      });
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setActiveTab('my-tickets');
        fetchMyTickets();
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit feedback.',
      });
    } finally {
      setSubmitting(false);
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

  const getTypeIcon = (ticketType) => {
    switch (ticketType) {
      case 'issue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-amber-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-brand-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Support, Inquiries & Feedback
              </h3>
              <p className="text-xs text-slate-500">
                Direct conduit to the EventSphere organizing committee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'submit'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submit Feedback or Ticket
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-tickets')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'my-tickets'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Inquiries & Status
          </button>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Category of Submission
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'inquiry', label: 'General Inquiry', icon: HelpCircle },
                    { id: 'issue', label: 'Report Issue', icon: AlertTriangle },
                    { id: 'suggestion', label: 'Improvement', icon: Lightbulb },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setType(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 text-xs font-bold ${
                          type === cat.id
                            ? 'bg-brand-50/80 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiring regarding Hall B electrical drops / Audio setup"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question, technical issue, or recommendation in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="py-2.5 px-5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Transmit to Organizers
                </button>
              </div>
            </form>
          ) : (
            /* My Tickets List */
            <div className="space-y-3">
              {loadingTickets ? (
                <div className="p-10 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                  <p className="text-xs text-slate-400">Loading your inquiry history...</p>
                </div>
              ) : myTickets.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">No Support Tickets Yet</h4>
                  <p className="text-[11px] text-slate-400">
                    You haven't submitted any questions or feedback.
                  </p>
                </div>
              ) : (
                myTickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket._id;
                  return (
                    <div
                      key={ticket._id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 transition-all"
                    >
                      <div
                        onClick={() =>
                          setExpandedTicketId(isExpanded ? null : ticket._id)
                        }
                        className="flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getTypeIcon(ticket.type)}</div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">
                              {ticket.subject}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ticket.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </p>

                      {/* Admin Reply Card */}
                      {ticket.adminReply ? (
                        <div className="p-3 bg-white border border-brand-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-brand-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Official Response from Organizers:
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {ticket.repliedAt &&
                                new Date(ticket.repliedAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {ticket.adminReply}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Awaiting response from the organizing team...
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
