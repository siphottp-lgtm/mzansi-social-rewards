'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PeerUser {
  id: string;
  email?: string;
  fullName: string;
  avatarUrl?: string | null;
}

interface ConversationItem {
  user: PeerUser;
  lastMessage: string;
  lastAt: string | null;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const me = await res.json();
        if (me?.id) setCurrentUserId(me.id);
      }
    } catch {
      // ignore
    }
  };

  const fetchConversations = async (token: string, autoSelect = false) => {
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg('Please log in to access Mzansi Messenger.');
        }
        return;
      }
      const list: ConversationItem[] = await res.json();
      const safeList = Array.isArray(list) ? list : [];
      setConversations(safeList);

      if (autoSelect && safeList.length > 0) {
        const params =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
        const requestedId = params?.get('userId');
        const matched = requestedId
          ? safeList.find((c) => c.user.id === requestedId)
          : null;
        const initialPeer = matched ? matched.user : safeList[0].user;
        setSelectedPeer(initialPeer);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchThread = async (token: string, peerId: string, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetch(`${API_URL}/messages/${peerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.peer) setSelectedPeer(data.peer);
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setConversations((prev) =>
          prev.map((c) => (c.user.id === peerId ? { ...c, unreadCount: 0 } : c)),
        );
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoadingList(false);
      setErrorMsg('Please log in first to use Mzansi Messenger.');
      return;
    }
    fetchCurrentUser(token);
    fetchConversations(token, true);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token || !selectedPeer?.id) return;

    fetchThread(token, selectedPeer.id, false);

    const interval = setInterval(() => {
      fetchThread(token, selectedPeer.id, true);
      fetchConversations(token, false);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedPeer?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !selectedPeer?.id || sending) return;

    const text = draft.trim();
    if (!text) return;

    setSending(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/messages/${selectedPeer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text }),
      });

      if (res.ok) {
        const created: ChatMessage = await res.json();
        setDraft('');
        setMessages((prev) => [...prev, created]);
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.user.id === selectedPeer.id
              ? { ...c, lastMessage: created.body, lastAt: created.createdAt }
              : c,
          );
          return updated;
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || 'Could not send message.');
      }
    } catch (err) {
      console.error('Send error:', err);
      setErrorMsg('Network error while sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm px-4 md:px-6 py-3 flex items-center justify-between border-b-2 border-[#007749]">
        <h1 className="text-xl md:text-2xl font-extrabold text-[#007749]">
          🇿🇦 Mzansi Messenger
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <a href="/friends" className="font-semibold text-gray-700 hover:text-[#007749]">
            Friends
          </a>
          <a href="/dashboard" className="font-semibold text-[#007749] hover:underline">
            Back to Feed
          </a>
        </div>
      </header>

      {errorMsg && (
        <div className="max-w-4xl w-full mx-auto mt-3 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-4 py-2.5 rounded-lg">
            {errorMsg}
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full mx-auto flex-1 grid grid-cols-1 md:grid-cols-3 bg-white shadow-sm my-3 md:my-4 rounded-xl overflow-hidden min-h-[70vh]">
        {/* Left: Real Friends & Active Chats */}
        <div className="border-b md:border-b-0 md:border-r p-4 space-y-2 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
              Chats &amp; Friends
            </h3>
            <a href="/friends" className="text-xs text-[#007749] font-semibold hover:underline">
              + Find Friends
            </a>
          </div>

          {loadingList ? (
            <p className="text-xs text-gray-400 py-4">Loading contacts...</p>
          ) : conversations.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-2">
              <p>No friends or active chats yet.</p>
              <a
                href="/friends"
                className="inline-block bg-[#007749] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#005f3a]"
              >
                Add Friends to Chat
              </a>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedPeer?.id === conv.user.id;
              return (
                <button
                  key={conv.user.id}
                  type="button"
                  onClick={() => setSelectedPeer(conv.user)}
                  className={`w-full text-left p-2.5 rounded-lg transition flex items-center gap-3 ${
                    isSelected ? 'bg-green-50 border border-[#007749]/30' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 bg-[#007749] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {(conv.user.fullName || 'M')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-sm truncate">{conv.user.fullName}</h4>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#007749] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage || 'Tap to start chatting'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right: Active Conversation Thread */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 min-h-[420px]">
          {!selectedPeer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6">
              <p className="text-sm font-medium text-gray-600">Select a friend to start messaging</p>
              <p className="text-xs mt-1">
                Accept or send friend requests on the Friends page to unlock direct chat.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b pb-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#007749] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {(selectedPeer.fullName || 'M')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-sm md:text-base">{selectedPeer.fullName}</h2>
                  {selectedPeer.email && (
                    <p className="text-xs text-gray-400">{selectedPeer.email}</p>
                  )}
                </div>
              </div>

              <div className="flex-1 py-4 space-y-2.5 overflow-y-auto max-h-[52vh]">
                {loadingThread ? (
                  <p className="text-xs text-gray-400 text-center py-8">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    No messages with {selectedPeer.fullName} yet. Say sawubona below!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`px-3.5 py-2 rounded-2xl max-w-xs md:max-w-md text-sm break-words ${
                            isMine
                              ? 'bg-[#007749] text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          {msg.body}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${selectedPeer.fullName}...`}
                  className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="bg-[#007749] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#005f3a] disabled:opacity-50 transition"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}