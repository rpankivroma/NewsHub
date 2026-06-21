import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Search, Filter, ShieldAlert, Check, CheckCheck, Send, User, 
  Trash2, Archive, Loader2, Volume2, VolumeX, Mail, Network, UserCheck, HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminSupportProps {
  user: any;
  onBadgeUpdate?: (totalBadge: number) => void;
}

interface Chat {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'deleted';
  is_online: boolean;
  is_registered: boolean;
  unread_count: number;
  last_message: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  chat_id: number;
  sender_type: string;
  sender_id?: number | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function SupportManager({ user, onBadgeUpdate }: AdminSupportProps) {
  // Stats
  const [activeChatsCount, setActiveChatsCount] = useState(0);
  const [newChatsCount, setNewChatsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);

  // Chat List & Pagination & Search
  const [chats, setChats] = useState<Chat[]>([]);
  const [totalChats, setTotalChats] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('active');
  const [registrationFilter, setRegistrationFilter] = useState<'All' | 'registered' | 'guest'>('All');
  const [onlineFilter, setOnlineFilter] = useState<'All' | 'online' | 'offline'>('All');

  // Currently Selected Chat Window
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Websocket Refs & sound
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 1. Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/admin/support/statistics');
      if (res.ok) {
        const data = await res.json();
        setActiveChatsCount(data.active_chats || 0);
        setNewChatsCount(data.new_chats || 0);
        setUnreadMessagesCount(data.unread_messages || 0);
        setAvgResponseTime(data.avg_response_time || 0);

        // Update badge counters (new chats + unread messages) for step 46
        const totalBadge = (data.active_chats || 0) + (data.unread_messages || 0);
        if (onBadgeUpdate) {
          onBadgeUpdate(totalBadge);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin support stats:', err);
    }
  };

  // 2. Fetch Chats List
  const fetchChatsList = async () => {
    setIsLoadingChats(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (registrationFilter !== 'All') params.append('registered', registrationFilter === 'registered' ? 'true' : 'false');
      if (onlineFilter !== 'All') params.append('online', onlineFilter === 'online' ? 'true' : 'false');

      const res = await fetch(`/admin/support/chats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
        setTotalChats(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load chats list:', err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Trigger loading list when tab changes, search fields change, or filters alter
  useEffect(() => {
    fetchChatsList();
    fetchStats();
  }, [page, statusFilter, registrationFilter, onlineFilter]);

  // Debounced Search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchChatsList();
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load selected chat history
  const loadChatHistory = async (chatId: number) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/support/chat/${chatId}/messages`);
      if (res.ok) {
        const history = await res.json();
        setMessages(history);

        // Mark chat as read
        await fetch(`/support/chat/${chatId}/read?sender_type=agent`, { method: 'PATCH' });
        
        // Refresh items to clear unread counts on list
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c));
        fetchStats();
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 3. Connect to Admin WebSocket
  useEffect(() => {
    const connectAdminWs = () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${window.location.host}/ws/admin/support`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'support.message.sent' && payload.data) {
            const newMsg: Message = payload.data;
            
            // Check if it belongs to currently viewable chat
            if (selectedChat && newMsg.chat_id === selectedChat.id) {
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              
              // Mark admin-received visitor messages read instantly
              if (newMsg.sender_type !== 'agent') {
                await fetch(`/support/chat/${selectedChat.id}/read?sender_type=agent`, { method: 'PATCH' });
              }
            }

            // Play notification sound if not agent message and sound is on
            if (newMsg.sender_type !== 'agent' && soundEnabled) {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch sound
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
              } catch (soundErr) {
                console.warn('Audio feedback failed (standard user interaction block is typical):', soundErr);
              }
            }

            // Reload stats and chats list
            fetchChatsList();
            fetchStats();
          }
        } catch (err) {
          console.error('Error handling WebSocket message in Admin Support Manager:', err);
        }
      };

      ws.onclose = () => {
        console.log('WS Admin connection closed. Reconnecting in 3 seconds...');
        setTimeout(connectAdminWs, 3000);
      };

      wsRef.current = ws;
    };

    connectAdminWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedChat, soundEnabled]);

  // Scroll active window of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 60);
    }
  }, [messages]);

  // Handle Send from Admin Box
  const handleAdminSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedChat || !wsRef.current) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        chat_id: selectedChat.id,
        content: inputMessage.trim(),
        sender_id: user?.id || null
      }));
      setInputMessage('');
    } else {
      alert('WebSocket is currently disconnected. Re-connecting, please try again.');
    }
  };

  // Support actions: Inactivate
  const handleMarkChatInactive = async (chatId: number) => {
    if (!window.confirm('Do you want to mark this support session as inactive?')) return;
    try {
      const res = await fetch(`/admin/support/chat/${chatId}/inactive`, {
        method: 'PATCH'
      });
      if (res.ok) {
        if (selectedChat?.id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, status: 'inactive' } : null);
        }
        fetchChatsList();
        fetchStats();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  // Support actions: Soft Delete
  const handleSoftDeleteChat = async (chatId: number) => {
    if (!window.confirm('Are you absolutely sure you want to delete this support session? All messages will remain in database but hidden.')) return;
    try {
      const res = await fetch(`/admin/support/chat/${chatId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        fetchChatsList();
        fetchStats();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sound & Configuration controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700 font-mono">LIVE KAFKA / WEBSOCKET TERMINAL RUNNING</span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-all"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Sound Enabled</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-400" />
              <span>Sound Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of 4 Statistics Cards (Step 33) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Conversations</span>
          <span className="text-2xl md:text-3xl font-black text-gray-800 mt-2">{activeChatsCount}</span>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">New chats (24h)</span>
          <span className="text-2xl md:text-3xl font-black text-blue-600 mt-2">{newChatsCount}</span>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Unread Messages</span>
          <span className="text-2xl md:text-3xl font-black text-amber-500 mt-2">{unreadMessagesCount}</span>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Response Time</span>
          <span className="text-xl md:text-2xl font-black text-emerald-600 mt-2">
            {avgResponseTime > 60 ? `${(avgResponseTime / 60).toFixed(1)} min` : `${avgResponseTime.toFixed(0)} sec`}
          </span>
        </div>
      </div>

      {/* Primary Workspace Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[600px] items-stretch">
        
        {/* Left Column: List and Filters (7 Columns) */}
        <div className="xl:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-xl font-bold text-[#0f172a] mb-5">Support Sessions</h2>
          
          {/* Filters Bar */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search visitor list by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:border-blue-500 hover:bg-gray-50 focus:bg-white text-sm outline-hidden font-medium text-gray-800 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Registered filter */}
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                {(['All', 'registered', 'guest'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => { setPage(1); setRegistrationFilter(option); }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                      registrationFilter === option 
                        ? "bg-white text-slate-800 shadow-xs" 
                        : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Online Filter */}
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                {(['All', 'online', 'offline'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => { setPage(1); setOnlineFilter(option); }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                      onlineFilter === option 
                        ? "bg-white text-slate-800 shadow-xs" 
                        : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                {(['All', 'active', 'inactive'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => { setPage(1); setStatusFilter(option); }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                      statusFilter === option 
                        ? "bg-white text-slate-800 shadow-xs" 
                        : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[300px] relative">
            {isLoadingChats ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-400 font-semibold text-sm">No matches found in visitor register</p>
                <p className="text-gray-300 text-xs mt-1">Try resetting some filters or modifying search terms</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {chats.map(chat => {
                  const isSelected = selectedChat?.id === chat.id;
                  return (
                    <motion.div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChat(chat);
                        loadChatHistory(chat.id);
                      }}
                      className={cn(
                        "p-4 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all flex items-start gap-3.5 border-2 border-transparent mt-1",
                        isSelected && "bg-slate-50 border-blue-100"
                      )}
                    >
                      {/* Name initials & badges */}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center border border-blue-100 uppercase">
                          {chat.name.slice(0, 2)}
                        </div>
                        <span className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white",
                          chat.is_online ? "bg-emerald-500" : "bg-gray-300"
                        )} />
                      </div>

                      {/* Descriptive body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {chat.name}
                            {chat.unread_count > 0 && (
                              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-black text-white">
                                {chat.unread_count}
                              </span>
                            )}
                          </h4>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            chat.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"
                          )}>
                            {chat.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{chat.email}</p>
                        <p className="text-xs text-gray-500 mt-1.5 truncate italic">
                          {chat.last_message || 'No messages sent yet'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Simple Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-40 transition-all"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Chat Box Details (5 Columns) */}
        <div className="xl:col-span-5 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between items-stretch min-h-[500px]">
          {selectedChat ? (
            <div className="h-full flex flex-col min-h-[500px] justify-between">
              
              {/* Box Header & quick tools */}
              <div className="px-6 py-5 bg-white border-b border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-800">{selectedChat.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn("w-2 h-2 rounded-full", selectedChat.is_online ? "bg-emerald-500" : "bg-gray-400")} />
                        <span className="text-[10px] font-bold text-gray-500">
                          {selectedChat.is_online ? 'Support Online' : 'Support Offline'}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {selectedChat.is_registered ? 'Registered Member' : 'Guest Visitor'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete action */}
                  <button
                    onClick={() => handleSoftDeleteChat(selectedChat.id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                    title="Soft Delete Support Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status controls block */}
                <div className="flex gap-2 justify-end border-t border-gray-50 pt-3 mt-1">
                  {selectedChat.status === 'active' ? (
                    <button
                      onClick={() => handleMarkChatInactive(selectedChat.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-all"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Mark Inactive</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2.5 py-1 rounded-lg">
                      Session closed / inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Messages timeline scrolling */}
              <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50 space-y-4 max-h-[350px] min-h-[250px]">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-xs text-gray-400 font-semibold italic">Send first response message to {selectedChat.name}</p>
                  </div>
                ) : (
                  messages.map((m, index) => {
                    const isAgent = m.sender_type === 'agent';
                    return (
                      <div
                        key={m.id || index}
                        className={cn("flex flex-col max-w-[85%]", isAgent ? "ml-auto items-end" : "mr-auto items-start")}
                      >
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            isAgent
                              ? "bg-slate-800 text-white rounded-br-none font-semibold shadow-xs"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-xs font-semibold"
                          )}
                        >
                          {m.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-gray-400 font-bold">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          {!isAgent && (
                            m.is_read ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-300" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message inputs box */}
              {selectedChat.status === 'active' ? (
                <form onSubmit={handleAdminSendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Reply to ${selectedChat.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all text-xs font-semibold outline-hidden text-gray-800"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:scale-100"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 text-center text-xs font-bold text-gray-400 uppercase italic">
                  Cannot reply. Session has been marked inactive.
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-3 animate-bounce" />
              <p className="font-bold text-sm">Select a Conversation</p>
              <p className="text-xs text-gray-300 mt-1 max-w-[200px]">Click a chat on the list to view history and message the user in real-time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
