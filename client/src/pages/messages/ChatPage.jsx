import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import {
  Send,
  Search,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Building,
  User,
  Shield,
  Loader2,
  Sparkles,
  ArrowLeft,
  Circle,
  HelpCircle,
  Store
} from 'lucide-react';

export const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const {
    socket,
    isUserOnline,
    setActiveChatPartner,
    emitTypingStart,
    emitTypingStop,
    refreshUnreadCount,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); // 'ALL' | 'exhibitor' | 'admin' | 'attendee'
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await messageService.getConversations();
      const list = res.data?.conversations || [];
      setConversations(list);
      return list;
    } catch (err) {
      console.error('Failed to load conversations', err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // 2. Load messages with specific user
  const loadMessagesWithUser = useCallback(
    async (partnerId, expoId = null) => {
      if (!partnerId) return;
      try {
        setLoadingMessages(true);
        setActiveChatPartner(partnerId);

        const res = await messageService.getMessagesWithUser(partnerId, expoId);
        setActivePartner(res.data?.partner || null);
        setMessages(res.data?.messages || []);

        // Refresh unread count in badge
        refreshUnreadCount();

        // Update local conversation list to set unreadCount = 0 for this partner
        setConversations((prev) =>
          prev.map((c) =>
            c.partner._id === partnerId ? { ...c, unreadCount: 0 } : c
          )
        );

        setTimeout(() => scrollToBottom('auto'), 100);
      } catch (err) {
        console.error('Failed to load messages with user', err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [setActiveChatPartner, refreshUnreadCount]
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      const list = await fetchConversations();
      if (targetUserId) {
        await loadMessagesWithUser(targetUserId);
      } else if (list.length > 0 && window.innerWidth >= 768) {
        // On desktop, auto-select first conversation
        loadMessagesWithUser(list[0].partner._id);
      }
    };
    init();

    return () => {
      setActiveChatPartner(null);
    };
  }, [targetUserId, fetchConversations, loadMessagesWithUser, setActiveChatPartner]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new incoming message
    const handleNewMessage = ({ message }) => {
      const senderId = message?.senderId?._id || message?.senderId;
      const receiverId = message?.receiverId?._id || message?.receiverId;

      // If active conversation matches
      if (activePartner && (activePartner._id === senderId || activePartner._id === receiverId)) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // If I received this message while in the chat, mark read immediately
        if (senderId === activePartner._id) {
          messageService.markAsRead(senderId).catch(() => {});
        }
      }

      // Update sidebar conversations list
      fetchConversations();
    };

    // My sent message confirmation
    const handleMessageSent = ({ message }) => {
      if (activePartner && message?.receiverId?._id === activePartner._id) {
        setMessages((prev) => {
          // Avoid duplicate if already in state
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
      fetchConversations();
    };

    // Read receipts
    const handleMessagesRead = ({ readerId, readAt }) => {
      if (activePartner && activePartner._id === readerId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId?._id === user?._id || m.senderId === user?._id
              ? { ...m, readAt }
              : m
          )
        );
      }
    };

    // Typing indicators
    const handleTypingStart = ({ senderId }) => {
      if (activePartner && activePartner._id === senderId) {
        setIsPartnerTyping(true);
      }
    };

    const handleTypingStop = ({ senderId }) => {
      if (activePartner && activePartner._id === senderId) {
        setIsPartnerTyping(false);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('messages:read', handleMessagesRead);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('messages:read', handleMessagesRead);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activePartner, user, fetchConversations]);

  // Handle typing debounce
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!activePartner) return;

    emitTypingStart(activePartner._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(activePartner._id);
    }, 1500);
  };

  // Send message action
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activePartner || sending) return;

    const content = messageText.trim();
    setMessageText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      emitTypingStop(activePartner._id);
    }

    try {
      setSending(true);
      const res = await messageService.sendMessage({
        receiverId: activePartner._id,
        content,
      });

      // Optimistically append sent message if socket hasn't yet
      if (res.data?.message) {
        const sent = res.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === sent._id)) return prev;
          return [...prev, sent];
        });
        scrollToBottom();
      }

      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deliver message.');
    } finally {
      setSending(false);
    }
  };

  // Quick message template insertion
  const insertTemplate = (text) => {
    setMessageText(text);
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((c) => {
    const partner = c.partner;
    const matchesQuery =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.companyName && partner.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessage?.content && c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      filterRole === 'ALL' || partner.role === filterRole;

    return matchesQuery && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-brand-600" />
            Communications & Inquiries Hub
          </h1>
          <p className="text-xs text-slate-500">
            Real-time direct messaging between attendees, commercial exhibitors, and organizers.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/exhibitors"
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            Browse Exhibitors
          </Link>
          <Link
            to="/events"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-500 flex items-center gap-1.5 shadow-sm"
          >
            <Store className="w-3.5 h-3.5" />
            Floor Plans
          </Link>
        </div>
      </div>

      {/* Main Split Window */}
      <div className="mt-4 flex-1 bg-white border border-slate-200 rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
            activePartner ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages or contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'exhibitor', label: 'Exhibitors' },
                { id: 'admin', label: 'Organizers' },
                { id: 'attendee', label: 'Attendees' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterRole(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    filterRole === tab.id
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                <p className="text-xs text-slate-400">Loading inbox...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Conversations Found</h4>
                <p className="text-[11px] text-slate-400">
                  {searchQuery ? 'No threads match your search.' : 'You have no messages yet. Inquire with exhibitors to begin!'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.partner;
                const isSelected = activePartner && activePartner._id === partner._id;
                const online = isUserOnline(partner._id);

                return (
                  <button
                    key={partner._id}
                    onClick={() => {
                      setSearchParams({ userId: partner._id });
                      loadMessagesWithUser(partner._id);
                    }}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-brand-50/70 border-l-4 border-brand-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* Avatar with Presence Dot */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-2xs">
                        {partner.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          online ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={online ? 'Online' : 'Offline'}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">
                          {partner.companyName || partner.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conv.lastMessage?.createdAt
                            ? new Date(conv.lastMessage.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>

                      {partner.companyName && (
                        <p className="text-[10px] text-slate-500 truncate font-medium">
                          Rep: {partner.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>

                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Stream */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/30 ${
            activePartner ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activePartner ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setActivePartner(null);
                      setSearchParams({});
                    }}
                    className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                      {activePartner.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isUserOnline(activePartner._id) ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {activePartner.companyName || activePartner.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {activePartner.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {activePartner.companyName && <span>Contact: {activePartner.name} &bull; </span>}
                      <span className="flex items-center gap-1">
                        <Circle
                          className={`w-2 h-2 ${
                            isUserOnline(activePartner._id)
                              ? 'fill-emerald-500 text-emerald-500'
                              : 'fill-slate-300 text-slate-300'
                          }`}
                        />
                        {isUserOnline(activePartner._id) ? 'Online now' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {activePartner.role === 'exhibitor' && (
                  <Link
                    to={`/exhibitors`}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    Exhibitor Profile
                  </Link>
                )}
              </div>

              {/* Message History Bubble Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                    <p className="text-xs text-slate-400">Loading conversation history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">
                      Start an inquiry with {activePartner.companyName || activePartner.name}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ask about booth exhibits, schedule 1-on-1 commercial meetings, or discuss partnerships.
                    </p>

                    {/* Quick Icebreakers */}
                    <div className="space-y-1.5 w-full pt-2">
                      {[
                        "Hello! I'm interested in viewing your products at the expo.",
                        'Could you share your schedule for booth demonstrations?',
                        'Can we arrange a 15-minute meeting during the exhibition?',
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertTemplate(prompt)}
                          className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-all shadow-2xs"
                        >
                          &ldquo;{prompt}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe =
                      (msg.senderId?._id || msg.senderId) === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl shadow-2xs text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Timestamp & Read Receipts */}
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            msg.readAt ? (
                              <CheckCheck className="w-3.5 h-3.5 text-brand-600" title="Read" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400" title="Sent" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Live Typing Indicator */}
                {isPartnerTyping && (
                  <div className="flex items-center gap-2 p-2 bg-white/80 border border-slate-200/70 rounded-2xl w-fit text-xs text-slate-500 shadow-2xs animate-fade-in">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="text-[11px] font-medium">
                      {activePartner.name} is typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder={`Message ${activePartner.companyName || activePartner.name}... (Enter to send)`}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="p-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-2xl transition-all shadow-md shadow-brand-600/20 disabled:shadow-none shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state when no conversation selected */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-extrabold text-slate-800">
                  Select a Conversation Thread
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Choose a contact from the left sidebar to resume discussions or reach out directly to exhibitors from the directory.
                </p>
              </div>
              <Link
                to="/exhibitors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/20 transition-all"
              >
                <Building className="w-3.5 h-3.5" />
                Find Exhibitors to Message
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
