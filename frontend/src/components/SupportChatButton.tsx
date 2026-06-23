import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Mail, ShieldAlert, Check, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSupportErrorMessage, supportUrl, supportWsUrl } from '../services/supportService';

interface SupportChatButtonProps {
  user: any;
  currentPage: string;
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

export default function SupportChatButton({ user, currentPage }: SupportChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isSupportOnline, setIsSupportOnline] = useState(false);
  
  // Guest registration form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingGuest, setSubmittingGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active chat state
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Polling for Support Online status
  useEffect(() => {
    const fetchSupportStatus = async () => {
      try {
        const res = await fetch(supportUrl('/support/status'));
        if (res.ok) {
          const data = await res.json();
          setIsSupportOnline(!!data.support_online);
        }
      } catch (err) {
        console.error('Failed to fetch support online status:', err);
      }
    };

    fetchSupportStatus();
    const interval = setInterval(fetchSupportStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Load chat history & initialize WebSocket connection
  const initializeChat = async (chatId: number) => {
    setActiveChatId(chatId);
    setIsLoadingHistory(true);
    setChatError('');
    
    // Load history
    try {
      const res = await fetch(supportUrl(`/support/chat/${chatId}/messages`));
      if (res.ok) {
        const history: Message[] = await res.json();
        setMessages(history);
        
        // Mark messages as read by user
        await fetch(supportUrl(`/support/chat/${chatId}/read?sender_type=user`), { method: 'PATCH' });
      } else {
        setChatError(await getSupportErrorMessage(res, 'Could not load the conversation.'));
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setChatError('Support chat is temporarily unavailable. Please try again in a moment.');
    } finally {
      setIsLoadingHistory(false);
    }

    // Connect WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }

    setIsSocketConnected(false);
    const wsUrl = supportWsUrl(`/ws/support/${chatId}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsSocketConnected(true);
      setChatError('');
    };

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'support.message.sent' && payload.data) {
          const newMsg: Message = payload.data;
          if (newMsg.chat_id === chatId) {
            setMessages((prev) => {
              // Avoid duplicate messages
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Mark received merchant replies as read instantly
            if (newMsg.sender_type === 'agent') {
              await fetch(supportUrl(`/support/chat/${chatId}/read?sender_type=user`), { method: 'PATCH' });
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    };

    ws.onclose = () => {
      setIsSocketConnected(false);
      console.log(`WebSocket closed for chat ${chatId}`);
    };

    ws.onerror = () => {
      setChatError('Live connection is not ready yet. Reopen the chat or try again shortly.');
    };

    wsRef.current = ws;
  };

  const startSupportChat = async () => {
    setChatError('');

    // If authenticated user
    if (user && user.id) {
      setIsStartingChat(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(supportUrl('/support/chat'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const chat = await res.json();
          initializeChat(chat.id);
        } else {
          setChatError(await getSupportErrorMessage(res, 'Failed to start support chat.'));
          console.error('Failed to initialize authenticated support chat');
        }
      } catch (err) {
        setChatError('Support chat is temporarily unavailable. Please try again in a moment.');
        console.error('Failed to register support chat for authenticated user:', err);
      } finally {
        setIsStartingChat(false);
      }
    } else {
      // If guest user, check local storage
      const savedChatId = localStorage.getItem('support_guest_chat_id');
      if (savedChatId) {
        initializeChat(parseInt(savedChatId));
      } else {
        // Show guest modal
        setShowGuestModal(true);
      }
    }
  };

  // Trigger when opening the support widget
  const handleToggleOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    await startSupportChat();
  };

  // Register Guest Support Chat
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setErrorMsg('All fields are required');
      return;
    }

    setErrorMsg('');
    setSubmittingGuest(true);

    try {
      const res = await fetch(supportUrl('/support/guest/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: guestName,
          email: guestEmail
        })
      });

      if (!res.ok) {
        throw new Error(await getSupportErrorMessage(res, 'Guest registration failed'));
      }

      const chat = await res.json();
      localStorage.setItem('support_guest_chat_id', chat.id.toString());
      localStorage.setItem('support_guest_email', guestEmail);
      localStorage.setItem('support_guest_name', guestName);
      
      setShowGuestModal(false);
      initializeChat(chat.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmittingGuest(false);
    }
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !wsRef.current || !activeChatId) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content: inputMessage.trim()
      }));
      setInputMessage('');
    } else {
      console.warn('WebSocket connection is not open. Re-connecting...');
      setChatError('Reconnecting to support...');
      initializeChat(activeChatId).then(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            content: inputMessage.trim()
          }));
          setInputMessage('');
        }
      });
    }
  };

  // Hide on admin pages
  if (currentPage === 'admin' || window.location.pathname.startsWith('/administration')) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        id="support-chat-trigger-btn"
        onClick={handleToggleOpen}
        className={cn(
          "fixed bottom-5 right-5 z-50 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center border border-blue-500",
          isOpen && "bg-slate-700 hover:bg-slate-800 border-slate-600"
        )}
        title="Support Live Chat"
      >
        {isOpen ? <X className="w-6 h-6 animate-in spin-in-90 duration-200" /> : <MessageSquare className="w-6 h-6 animate-in zoom-in duration-200" />}
      </button>

      {/* Guest Modal */}
      <AnimatePresence>
        {isOpen && showGuestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Support Chat</h3>
                    <p className="text-sm text-gray-500 mt-1">Please introduce yourself to start chatting</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowGuestModal(false);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-hidden font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingGuest}
                    className="w-full mt-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {submittingGuest ? 'Starting chat...' : 'Start Chat'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Modal */}
      <AnimatePresence>
        {isOpen && !showGuestModal && (activeChatId || isStartingChat || chatError) && (
          <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/20 p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="w-full sm:w-[380px] h-[min(620px,calc(100vh-7rem))] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* ChatHeader Component inline */}
            <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold border border-blue-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">NewsHub Support</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("w-2 h-2 rounded-full", isSocketConnected ? "bg-emerald-500" : isSupportOnline ? "bg-amber-400" : "bg-gray-400")} />
                    <span className="text-[11px] font-semibold text-gray-500">
                      {isSocketConnected ? 'Connected' : isSupportOnline ? 'Support Online' : 'Support Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MessagesList Component inline */}
            <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#f8fafc] space-y-3.5">
              {isStartingChat ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-gray-600">Opening support chat...</p>
                </div>
              ) : chatError && !activeChatId ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <ShieldAlert className="w-8 h-8 text-red-500 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">{chatError}</p>
                  <button
                    onClick={startSupportChat}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : isLoadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="h-2 w-20 bg-gray-200 rounded-sm" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm font-semibold text-gray-500">Welcome to NewsHub support!</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Send us a message below and we will help you shortly.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_type !== 'agent';
                  return (
                    <div
                      key={msg.id || index}
                      className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
                    >
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isMe 
                            ? "bg-blue-600 text-white rounded-br-none font-medium shadow-xs" 
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-xs font-medium"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        {isMe && (
                          msg.is_read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-300" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatError && activeChatId && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs font-semibold text-amber-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{chatError}</span>
              </div>
            )}

            {/* MessageInput Component inline */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                type="text"
                required
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!activeChatId}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 transition-all text-sm outline-hidden font-medium text-gray-800"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !activeChatId}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
