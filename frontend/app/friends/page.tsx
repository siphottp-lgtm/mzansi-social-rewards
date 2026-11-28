"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";
import { friendsApi, SHARED_STORAGE_KEYS, users } from "../../lib/api";

interface FriendItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  handle?: string;
  status?: string;
  avatarUrl?: string;
}

function normalizeFriendEntry(item: Record<string, unknown>, idx: number): FriendItem {
  const person =
    (item.friend && typeof item.friend === "object" ? item.friend : null) ||
    (item.addressee && typeof item.addressee === "object" ? item.addressee : null) ||
    (item.requester && typeof item.requester === "object" ? item.requester : null) ||
    (item.user && typeof item.user === "object" ? item.user : null) ||
    item;
  const personObj = person as Record<string, unknown>;

  const fullName =
    personObj.displayName ||
    personObj.name ||
    personObj.fullName ||
    [personObj.firstName, personObj.lastName].filter(Boolean).join(" ") ||
    personObj.username ||
    (typeof personObj.email === "string" ? personObj.email.split("@")[0] : undefined) ||
    `Member ${idx + 1}`;

  const userId = String(
    personObj.id || personObj.userId || item.friendId || item.addresseeId || item.requesterId || item.id || idx + 1
  );

  const rawAvatar =
    personObj.avatarUrl || personObj.avatar || item.avatarUrl || item.avatar;

  return {
    id: String(item.id || userId),
    userId,
    name: String(fullName),
    email: personObj.email ? String(personObj.email) : undefined,
    handle: personObj.username ? `@${String(personObj.username).replace(/^@/, "")}` : undefined,
    status: item.status ? String(item.status) : undefined,
    avatarUrl: typeof rawAvatar === "string" && rawAvatar.trim() ? rawAvatar.trim() : undefined,
  };
}

function MemberAvatarBadge({
  href,
  name,
  avatarUrl,
  small = false,
}: {
  href: string;
  name: string;
  avatarUrl?: string;
  small?: boolean;
}) {
  const sizeClass = small ? "mz-avatar small green" : "mz-avatar green";
  return (
    <Link href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={sizeClass}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className={sizeClass}>{name.slice(0, 2).toUpperCase()}</div>
      )}
    </Link>
  );
}

export default function FriendsPage() {
  const [user, setUser] = useState<MzansiUser>({
    id: "me",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendItem[]>([]);
  const [members, setMembers] = useState<FriendItem[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    users
      .me()
      .then((me: unknown) => {
        if (!me || typeof me !== "object") return;
        const obj = me as Record<string, unknown>;
        const displayName = String(
          obj.displayName ||
            obj.name ||
            obj.fullName ||
            [obj.firstName, obj.lastName].filter(Boolean).join(" ") ||
            obj.email ||
            "Member"
        );
        const rawAvatar = obj.avatarUrl || obj.avatar;
        setUser({
          id: String(obj.id || "me"),
          name: displayName,
          handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
          initials: displayName.slice(0, 2).toUpperCase(),
          avatarColor: "green",
          avatar: typeof rawAvatar === "string" ? rawAvatar : undefined,
          avatarUrl: typeof rawAvatar === "string" ? rawAvatar : undefined,
        });
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [friendsRes, incomingRes, outgoingRes, directoryRes] = await Promise.all([
        friendsApi.list().catch(() => []),
        friendsApi.incoming().catch(() => []),
        friendsApi.outgoing().catch(() => []),
        users.directory().catch(() => []),
      ]);

      const fList = Array.isArray(friendsRes)
        ? friendsRes
        : Array.isArray((friendsRes as { data?: unknown[] })?.data)
        ? (friendsRes as { data: unknown[] }).data
        : [];
      const inList = Array.isArray(incomingRes)
        ? incomingRes
        : Array.isArray((incomingRes as { data?: unknown[] })?.data)
        ? (incomingRes as { data: unknown[] }).data
        : [];
      const outList = Array.isArray(outgoingRes)
        ? outgoingRes
        : Array.isArray((outgoingRes as { data?: unknown[] })?.data)
        ? (outgoingRes as { data: unknown[] }).data
        : [];
      const dirList = Array.isArray(directoryRes)
        ? directoryRes
        : Array.isArray((directoryRes as { data?: unknown[] })?.data)
        ? (directoryRes as { data: unknown[] }).data
        : [];

      setFriends(fList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setIncomingRequests(inList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setOutgoingRequests(outList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setMembers(dirList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));

      try {
        window.localStorage.setItem(SHARED_STORAGE_KEYS.members, JSON.stringify(dirList));
      } catch {
        // Ignore storage quota errors
      }
    } catch {
      // Keep current lists if offline
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleFollow = (targetUserId: string, targetName: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(targetUserId)) {
        next.delete(targetUserId);
        setFeedback(`Unfollowed ${targetName}.`);
      } else {
        next.add(targetUserId);
        setFeedback(`Following ${targetName}.`);
      }
      return next;
    });
  };

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
    <CommonUpgrade
      watermarkKey="image2"
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
                <MemberAvatarBadge
                  href={`/profile/?memberId=${encodeURIComponent(String(req.userId || req.id))}&name=${encodeURIComponent(req.name)}`}
                  name={req.name}
                  avatarUrl={req.avatarUrl}
                />
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
                <MemberAvatarBadge
                  href={`/profile/?memberId=${encodeURIComponent(String(f.userId || f.id))}&name=${encodeURIComponent(f.name)}`}
                  name={f.name}
                  avatarUrl={f.avatarUrl}
                />
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
          <p classNameSet-Location "C:\jacinta_community_platform\community-app-2\community-app\frontend"

# 1. Write clean app/friends/page.tsx
@'
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";
import { friendsApi, SHARED_STORAGE_KEYS, users } from "../../lib/api";

interface FriendItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  handle?: string;
  status?: string;
  avatarUrl?: string;
}

function normalizeFriendEntry(item: Record<string, unknown>, idx: number): FriendItem {
  const person =
    (item.friend && typeof item.friend === "object" ? item.friend : null) ||
    (item.addressee && typeof item.addressee === "object" ? item.addressee : null) ||
    (item.requester && typeof item.requester === "object" ? item.requester : null) ||
    (item.user && typeof item.user === "object" ? item.user : null) ||
    item;
  const personObj = person as Record<string, unknown>;

  const fullName =
    personObj.displayName ||
    personObj.name ||
    personObj.fullName ||
    [personObj.firstName, personObj.lastName].filter(Boolean).join(" ") ||
    personObj.username ||
    (typeof personObj.email === "string" ? personObj.email.split("@")[0] : undefined) ||
    `Member ${idx + 1}`;

  const userId = String(
    personObj.id || personObj.userId || item.friendId || item.addresseeId || item.requesterId || item.id || idx + 1
  );

  const rawAvatar =
    personObj.avatarUrl || personObj.avatar || item.avatarUrl || item.avatar;

  return {
    id: String(item.id || userId),
    userId,
    name: String(fullName),
    email: personObj.email ? String(personObj.email) : undefined,
    handle: personObj.username ? `@${String(personObj.username).replace(/^@/, "")}` : undefined,
    status: item.status ? String(item.status) : undefined,
    avatarUrl: typeof rawAvatar === "string" && rawAvatar.trim() ? rawAvatar.trim() : undefined,
  };
}

function MemberAvatarBadge({
  href,
  name,
  avatarUrl,
  small = false,
}: {
  href: string;
  name: string;
  avatarUrl?: string;
  small?: boolean;
}) {
  const sizeClass = small ? "mz-avatar small green" : "mz-avatar green";
  return (
    <Link href={href} style={{ textDecoration: "none", flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={sizeClass}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className={sizeClass}>{name.slice(0, 2).toUpperCase()}</div>
      )}
    </Link>
  );
}

export default function FriendsPage() {
  const [user, setUser] = useState<MzansiUser>({
    id: "me",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendItem[]>([]);
  const [members, setMembers] = useState<FriendItem[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    users
      .me()
      .then((me: unknown) => {
        if (!me || typeof me !== "object") return;
        const obj = me as Record<string, unknown>;
        const displayName = String(
          obj.displayName ||
            obj.name ||
            obj.fullName ||
            [obj.firstName, obj.lastName].filter(Boolean).join(" ") ||
            obj.email ||
            "Member"
        );
        const rawAvatar = obj.avatarUrl || obj.avatar;
        setUser({
          id: String(obj.id || "me"),
          name: displayName,
          handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
          initials: displayName.slice(0, 2).toUpperCase(),
          avatarColor: "green",
          avatar: typeof rawAvatar === "string" ? rawAvatar : undefined,
          avatarUrl: typeof rawAvatar === "string" ? rawAvatar : undefined,
        });
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [friendsRes, incomingRes, outgoingRes, directoryRes] = await Promise.all([
        friendsApi.list().catch(() => []),
        friendsApi.incoming().catch(() => []),
        friendsApi.outgoing().catch(() => []),
        users.directory().catch(() => []),
      ]);

      const fList = Array.isArray(friendsRes)
        ? friendsRes
        : Array.isArray((friendsRes as { data?: unknown[] })?.data)
        ? (friendsRes as { data: unknown[] }).data
        : [];
      const inList = Array.isArray(incomingRes)
        ? incomingRes
        : Array.isArray((incomingRes as { data?: unknown[] })?.data)
        ? (incomingRes as { data: unknown[] }).data
        : [];
      const outList = Array.isArray(outgoingRes)
        ? outgoingRes
        : Array.isArray((outgoingRes as { data?: unknown[] })?.data)
        ? (outgoingRes as { data: unknown[] }).data
        : [];
      const dirList = Array.isArray(directoryRes)
        ? directoryRes
        : Array.isArray((directoryRes as { data?: unknown[] })?.data)
        ? (directoryRes as { data: unknown[] }).data
        : [];

      setFriends(fList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setIncomingRequests(inList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setOutgoingRequests(outList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));
      setMembers(dirList.map((item, idx) => normalizeFriendEntry((item || {}) as Record<string, unknown>, idx)));

      try {
        window.localStorage.setItem(SHARED_STORAGE_KEYS.members, JSON.stringify(dirList));
      } catch {
        // Ignore storage quota errors
      }
    } catch {
      // Keep current lists if offline
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleFollow = (targetUserId: string, targetName: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(targetUserId)) {
        next.delete(targetUserId);
        setFeedback(`Unfollowed ${targetName}.`);
      } else {
        next.add(targetUserId);
        setFeedback(`Following ${targetName}.`);
      }
      return next;
    });
  };

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
    <CommonUpgrade
      watermarkKey="image2"
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
                <MemberAvatarBadge
                  href={`/profile/?memberId=${encodeURIComponent(String(req.userId || req.id))}&name=${encodeURIComponent(req.name)}`}
                  name={req.name}
                  avatarUrl={req.avatarUrl}
                />
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
                <MemberAvatarBadge
                  href={`/profile/?memberId=${encodeURIComponent(String(f.userId || f.id))}&name=${encodeURIComponent(f.name)}`}
                  name={f.name}
                  avatarUrl={f.avatarUrl}
                />
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
                  <MemberAvatarBadge
                    href={`/profile/?memberId=${encodeURIComponent(String(m.userId || m.id))}&name=${encodeURIComponent(m.name)}`}
                    name={m.name}
                    avatarUrl={m.avatarUrl}
                    small
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>{m.name}</strong>
                    <div className="mz-tiny mz-muted">{m.handle || m.email || "Registered member"}</div>
                  </div>
                </div>

                {!isSelf && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={isFriend || isPending ? "mz-follow followed" : "mz-primary"}
                      disabled={isFriend || isPending || busyId === m.userId}
                      onClick={() => handleAddFriend(m.userId, m.name)}
                    >
                      {isFriend ? "Friends" : isPending ? "Request Sent" : "Add Friend"}
                    </button>
                    <button
                      type="button"
                      className={followedIds.has(m.userId) ? "mz-follow followed" : "mz-follow"}
                      onClick={() => handleToggleFollow(m.userId, m.name)}
                    >
                      {followedIds.has(m.userId) ? "Following" : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </CommonUpgrade>
  );
}
