'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function FriendsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string>('');

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('access_token')
      : null;

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [friendsRes, dirRes] = await Promise.all([
        fetch(`${API_URL}/friends`, { headers }),
        fetch(`${API_URL}/users/directory`, { headers }),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      }

      if (dirRes.ok) {
        const users = await dirRes.json();
        setDirectory(Array.isArray(users) ? users : []);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg('Could not load friends or members.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendRequest = async (targetUserId: string) => {
    const token = getToken();
    if (!token) return;
    setBusyId(targetUserId);
    setStatusMsg('');
    try {
      const res = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMsg(data.message || 'Unable to send friend request.');
      } else {
        setStatusMsg('Friend request updated!');
        await loadData();
      }
    } catch (err: any) {
      setStatusMsg(err?.message || 'Network error sending request.');
    } finally {
      setBusyId('');
    }
  };

  const handleAction = async (friendshipId: string, action: 'accept' | 'decline' | 'remove') => {
    const token = getToken();
    if (!token) return;
    setBusyId(friendshipId);
    setStatusMsg('');
    try {
      const url =
        action === 'remove'
          ? `${API_URL}/friends/${friendshipId}`
          : `${API_URL}/friends/${friendshipId}/${action}`;
      const method = action === 'remove' ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMsg(data.message || `Failed to ${action} request.`);
      } else {
        setStatusMsg(
          action === 'accept'
            ? 'Friend request accepted!'
            : action === 'decline'
              ? 'Request declined.'
              : 'Connection removed.',
        );
        await loadData();
      }
    } catch (err: any) {
      setStatusMsg(err?.message || 'Network error.');
    } finally {
      setBusyId('');
    }
  };

  const friendIds = new Set(friends.map((f) => f.user?.id));
  const outgoingMap = new Map(outgoing.map((o) => [o.addressee?.id, o.friendshipId]));
  const incomingMap = new Map(incoming.map((i) => [i.requester?.id, i.friendshipId]));

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 pb-20">
      <header className="bg-white/95 shadow-sm sticky top-0 z-50 px-6 py-3 flex items-center justify-between border-b-2 border-[#007749]">
        <div>
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase block">
            Two Hands are Better than One
          </span>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-[#007749] via-[#FFB81C] to-[#E03C31] bg-clip-text text-transparent">
            Mzansi Friends
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="text-sm font-semibold text-gray-700 hover:text-[#007749]"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-sm font-semibold text-[#007749]"
          >
            Feed
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 mt-4 space-y-6">
        {statusMsg && (
          <div className="bg-green-50 border border-green-200 text-[#007749] text-sm font-medium px-4 py-2.5 rounded-xl">
            {statusMsg}
          </div>
        )}

        {/* Incoming Friend Requests */}
        <section className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            Incoming Friend Requests ({incoming.length})
          </h2>
          {incoming.length === 0 ? (
            <p className="text-sm text-gray-500">No pending requests right now.</p>
          ) : (
            <div className="space-y-2.5">
              {incoming.map((req) => (
                <div
                  key={req.friendshipId}
                  className="flex items-center justify-between border rounded-xl p-3"
                >
                  <div>
                    <p className="font-semibold text-sm">{req.requester?.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {req.requester?.location || req.requester?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === req.friendshipId}
                      onClick={() => handleAction(req.friendshipId, 'accept')}
                      className="bg-[#007749] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-[#005f3a]"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyId === req.friendshipId}
                      onClick={() => handleAction(req.friendshipId, 'decline')}
                      className="bg-gray-200 text-gray-800 text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-gray-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accepted Friends */}
        <section className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-gray-900">My Friends ({friends.length})</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading connections...</p>
          ) : friends.length === 0 ? (
            <p className="text-sm text-gray-500">
              You have not added any friends yet. Send a request from Members below.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {friends.map((item) => (
                <div
                  key={item.friendshipId}
                  className="flex items-center justify-between border rounded-xl p-3"
                >
                  <div>
                    <p className="font-semibold text-sm">{item.user?.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {item.user?.location || 'Mzansi Community'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === item.friendshipId}
                    onClick={() => handleAction(item.friendshipId, 'remove')}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Community Members Directory */}
        <section className="bg-white rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-gray-900">Mzansi Members</h2>
          {directory.length === 0 ? (
            <p className="text-sm text-gray-500">No other members found yet.</p>
          ) : (
            <div className="space-y-2.5">
              {directory.map((member) => {
                const isFriend = friendIds.has(member.id);
                const sentReqId = outgoingMap.get(member.id);
                const incReqId = incomingMap.get(member.id);

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between border rounded-xl p-3"
                  >
                    <div>
                      <p className="font-semibold text-sm">{member.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {member.location || member.email || 'Community Member'}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{member.bio}</p>
                      )}
                    </div>

                    <div>
                      {isFriend ? (
                        <span className="text-xs font-semibold text-[#007749] bg-green-50 px-3 py-1.5 rounded-lg">
                          Friends
                        </span>
                      ) : incReqId ? (
                        <button
                          type="button"
                          disabled={busyId === incReqId}
                          onClick={() => handleAction(incReqId, 'accept')}
                          className="bg-[#007749] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg"
                        >
                          Accept Request
                        </button>
                      ) : sentReqId ? (
                        <button
                          type="button"
                          disabled={busyId === sentReqId}
                          onClick={() => handleAction(sentReqId, 'remove')}
                          className="bg-amber-100 text-amber-900 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
                        >
                          Pending (Cancel)
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() => handleSendRequest(member.id)}
                          className="bg-[#007749] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-[#005f3a]"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}