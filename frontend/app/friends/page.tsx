"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";
import { friendsApi, users } from "../../lib/api";

interface FriendRelationItem {
  id: string; // friendship or user id
  userId: string;
  name: string;
  email?: string;
  handle?: string;
  status?: string;
}

function extractList(payload: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const k of keys) {
      if (Array.isArray(obj[k])) return obj[k] as Record<string, unknown>[];
    }
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      for (const k of keys) {
        if (Array.isArray(inner[k])) return inner[k] as Record<string, unknown>[];
      }
    }
  }
  return [];
}

function mapPerson(item: Record<string, unknown>, idx: number): FriendRelationItem {
  const nested = (item.friend || item.requester || item.addressee || item.user || item.member) as
    | Record<string, unknown>
    | undefined;
  const raw = nested && typeof nested === "object" ? { ...nested, ...item } : item;
  const personObj = nested && typeof nested === "object" ? nested : raw;

  const fullName =
    personObj.displayName ||
    personObj.name ||
    personObj.fullName ||
    [personObj.firstName, personObj.lastName].filter(Boolean).join(" ") ||
    personObj.username ||
    (typeof personObj.email === "string" ? personObj.email.split("@")[0] : undefined) ||
    `Member ${idx + 1}`;

  const userId = String(personObj.id || raw.targetUserId || raw.userId || raw.id || idx);
  const relationId = String(item.id || raw.id || userId);

  return {
    id: relationId,
    userId,
    name: String(fullName),
    email: personObj.email ? String(personObj.email) : undefined,
    handle: personObj.username ? `@${String(personObj.username).replace(/^@/, "")}` : undefined,
    status: item.status ? String(item.status) : undefined,
  };
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendRelationItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRelationItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRelationItem[]>([]);
  const [members, setMembers] = useState<FriendRelationItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [user, setUser] = useState<MzansiUser>({
    id: "me",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });

  const loadData = useCallback(async () => {
    try {
      const me = await users.me();
      if (me && typeof me === "object") {
        const obj = me as Record<string, unknown>;
        const displayName = String(
          obj.displayName ||
            obj.name ||
            obj.fullName ||
            [obj.firstName, obj.lastName].filter(Boolean).join(" ") ||
            obj.email ||
            "Member"
        );
        setUser({
          id: String(obj.id || "me"),
          name: displayName,
          handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
          initials: displayName.slice(0, 2).toUpperCase(),
          avatarColor: "green",
        });
      }
    } catch {
      // Keep default user state if unauthenticated
    }

    try {
      const overview = await friendsApi.overview();
      const obj = (overview && typeof overview === "object" ? overview : {}) as Record<string, unknown>;
      const accepted = extractList(overview, ["friends", "accepted"]).map(mapPerson);
      const incoming = extractList(obj.incoming ?? obj.pendingIncoming ?? obj.requests, [
        "incoming",
        "pendingIncoming",
        "requests",
      ]).map(mapPerson);
      const outgoing = extractList(obj.outgoing ?? obj.pendingOutgoing ?? obj.sent, [
        "outgoing",
        "pendingOutgoing",
        "sent",
      ]).map(mapPerson);

      setFriends(accepted);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch {
      // Ignore if friends overview isn't available yet
    }

    try {
      const dirData = await users.directory();
      const list = extractList(dirData, ["users", "members", "directory", "items", "data"]).map(mapPerson);
      setMembers(list);
    } catch {
      // Ignore if directory isn't available yet
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddFriend = async (targetUserId: string, targetName: string) => {
    setBusyId(targetUserId);
    setFeedback("");
    try {
      await friendsApi.sendRequest(targetUserId);
      setFeedback(`Friend request sent to ${targetName}.`);
      await loadData();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Could not send friend request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = async (requestId: string, name: string) => {
    setBusyId(requestId);
    setFeedback("");
    try {
      await friendsApi.accept(requestId);
      setFeedback(`Accepted friend request from ${name}.`);
      await loadData();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Could not accept request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (requestId: string, name: string) => {
    setBusyId(requestId);
    setFeedback("");
    try {
      await friendsApi.decline(requestId);
      setFeedback(`Declined friend request from ${name}.`);
      await loadData();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Could not decline request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: string, name: string) => {
    setBusyId(friendshipId);
    setFeedback("");
    try {
      await friendsApi.remove(friendshipId);
      setFeedback(`Removed ${name} from friends.`);
      await loadData();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Could not remove friend.");
    } finally {
      setBusyId(null);
    }
  };

  const friendUserIds = new Set(friends.map((f) => f.userId));
  const outgoingUserIds = new Set(outgoingRequests.map((r) => r.userId));

  return (
    <CommonUpgrade watermarkKey="image3"
      currentUser={user}
      showFeed={false}
      pageTitle="Friends & Registered Members"
      pageSubtitle="Send friend requests, manage connections, and browse Mzansi members."
    >
      {feedback && (
        <div className="mz-post" style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>
          {feedback}
        </div>
      )}

      {incomingRequests.length > 0 && (
        <div className="mz-post">
          <div className="mz-label" style={{ color: "var(--orange)" }}>
            FRIEND REQUESTS ({incomingRequests.length})
          </div>
          {incomingRequests.map((req) => (
            <div
              key={req.id}
              className="mz-post-head"
              style={{ marginTop: 14, justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="mz-avatar green">{req.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong style={{ fontSize: 13 }}>{req.name}</strong>
                  <div className="mz-tiny mz-muted">{req.handle || req.email || "Wants to connect"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="mz-primary"
                  disabled={busyId === req.id}
                  onClick={() => handleAccept(req.id, req.name)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="mz-follow"
                  disabled={busyId === req.id}
                  onClick={() => handleDecline(req.id, req.name)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--green)" }}>
          YOUR FRIENDS ({friends.length})
        </div>
        {friends.length === 0 ? (
          <p className="mz-tiny mz-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No connected friends yet. Send a friend request to a member below.
          </p>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              className="mz-post-head"
              style={{ marginTop: 14, justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="mz-avatar green">{f.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <strong style={{ fontSize: 13 }}>{f.name}</strong>
                  <div className="mz-tiny mz-muted">{f.handle || f.email || "Connected friend"}</div>
                </div>
              </div>
              <button
                type="button"
                className="mz-follow"
                disabled={busyId === f.id}
                onClick={() => handleRemoveFriend(f.id, f.name)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--orange)" }}>
          REGISTERED MEMBERS ({members.length})
        </div>
        {members.length === 0 ? (
          <p className="mz-tiny mz-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No registered members returned from /users/directory yet.
          </p>
        ) : (
          members.map((m) => {
            const isFriend = friendUserIds.has(m.userId);
            const isPending = outgoingUserIds.has(m.userId);
            const isSelf = m.userId === user.id;

            return (
              <div
                key={m.id}
                className="mz-post-head"
                style={{ marginTop: 14, justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="mz-avatar small green">{m.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong style={{ fontSize: 13 }}>{m.name}</strong>
                    <div className="mz-tiny mz-muted">{m.handle || m.email || "Registered member"}</div>
                  </div>
                </div>

                {!isSelf && (
                  <button
                    type="button"
                    className={isFriend || isPending ? "mz-follow followed" : "mz-primary"}
                    disabled={isFriend || isPending || busyId === m.userId}
                    onClick={() => handleAddFriend(m.userId, m.name)}
                  >
                    {isFriend ? "Friends" : isPending ? "Request Sent" : "Add Friend"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </CommonUpgrade>
  );
}

