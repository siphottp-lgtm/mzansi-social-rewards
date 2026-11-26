"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";
import { api, friendsApi, users } from "../../lib/api";

interface PersonRecord {
  id: string;
  name: string;
  handle?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ThreadMessage {
  id: string;
  senderId?: string;
  senderName: string;
  body: string;
  createdAt?: string;
}

function resolvePersonName(obj: Record<string, unknown> | undefined | null, fallback = "Mzansi Member"): string {
  if (!obj || typeof obj !== "object") return fallback;
  const candidate =
    obj.fullName ||
    obj.displayName ||
    obj.name ||
    [obj.firstName, obj.lastName].filter(Boolean).join(" ") ||
    obj.username ||
    (typeof obj.email === "string" ? obj.email.split("@")[0] : "");
  return String(candidate || fallback);
}

function extractArray(payload: unknown, keys: string[]): Record<string, unknown>[] {
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

export default function MessagesPage() {
  const [user, setUser] = useState<MzansiUser>({
    id: "me",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });
  const [contacts, setContacts] = useState<PersonRecord[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PersonRecord | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");

  const loadThread = useCallback(
    async (peer: PersonRecord, nameMap: Map<string, string>, currentUserId: string, currentUserName: string) => {
      try {
        const rawThread = await api(`/messages/${encodeURIComponent(peer.id)}`);
        const list = extractArray(rawThread, ["messages", "thread", "items", "data"]);
        const mapped: ThreadMessage[] = list.map((m, idx) => {
          const senderObj = (m.sender || m.author || m.from || m.user) as Record<string, unknown> | undefined;
          const sid = String(m.senderId || m.fromUserId || senderObj?.id || "");
          const resolvedName =
            sid === currentUserId
              ? currentUserName
              : senderObj
              ? resolvePersonName(senderObj, nameMap.get(sid) || peer.name)
              : nameMap.get(sid) || (m.senderName ? String(m.senderName) : peer.name);

          return {
            id: String(m.id || m._id || idx),
            senderId: sid,
            senderName: resolvedName,
            body: String(m.body || m.content || m.text || m.message || ""),
            createdAt: m.createdAt
              ? new Date(String(m.createdAt)).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        });
        setMessages(mapped);
      } catch {
        setMessages([]);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    (async () => {
      let meId = "me";
      let meName = "Member";
      try {
        const me = await users.me();
        if (me && typeof me === "object") {
          const obj = me as Record<string, unknown>;
          meId = String(obj.id || "me");
          meName = resolvePersonName(obj, "Member");
          if (active) {
            setUser({
              id: meId,
              name: meName,
              handle: `@${meName.toLowerCase().replace(/\s+/g, "")}`,
              initials: meName.slice(0, 2).toUpperCase(),
              avatarColor: "green",
            });
          }
        }
      } catch {
        // Keep default user state
      }

      const nameMap = new Map<string, string>();
      const contactMap = new Map<string, PersonRecord>();

      try {
        const dirRes = await users.directory();
        const dirList = extractArray(dirRes, ["users", "members", "directory", "items", "data"]);
        dirList.forEach((u, idx) => {
          const id = String(u.id || u._id || idx);
          if (id === meId) return;
          const name = resolvePersonName(u, `Member ${idx + 1}`);
          nameMap.set(id, name);
          contactMap.set(id, {
            id,
            name,
            handle: u.username ? `@${String(u.username).replace(/^@/, "")}` : undefined,
          });
        });
      } catch {
        // Ignore directory errors
      }

      try {
        const friendRes = await friendsApi.overview();
        const friendList = extractArray(friendRes, ["friends", "accepted", "items", "data"]);
        friendList.forEach((f, idx) => {
          const nested = (f.friend || f.user || f.member) as Record<string, unknown> | undefined;
          const raw = nested && typeof nested === "object" ? nested : f;
          const id = String(raw.id || f.friendId || f.userId || idx);
          if (id === meId) return;
          const name = resolvePersonName(raw, nameMap.get(id) || `Friend ${idx + 1}`);
          nameMap.set(id, name);
          contactMap.set(id, {
            ...(contactMap.get(id) || { id }),
            id,
            name,
          });
        });
      } catch {
        // Ignore friends errors
      }

      try {
        const convRes = await api("/messages/conversations");
        const convList = extractArray(convRes, ["conversations", "threads", "items", "data"]);
        convList.forEach((c, idx) => {
          const peerObj = (c.user || c.peer || c.otherUser || c.recipient || c.member) as
            | Record<string, unknown>
            | undefined;
          const peerId = String(peerObj?.id || c.peerId || c.otherUserId || c.userId || idx);
          if (!peerId || peerId === meId) return;
          const peerName = peerObj
            ? resolvePersonName(peerObj, nameMap.get(peerId) || `Member ${idx + 1}`)
            : nameMap.get(peerId) || String(c.peerName || c.name || `Member ${idx + 1}`);
          nameMap.set(peerId, peerName);
          contactMap.set(peerId, {
            ...(contactMap.get(peerId) || { id: peerId }),
            id: peerId,
            name: peerName,
            lastMessage: c.lastMessage ? String(c.lastMessage) : undefined,
            unreadCount: typeof c.unreadCount === "number" ? c.unreadCount : undefined,
          });
        });
      } catch {
        // Ignore conversation errors
      }

      const mergedContacts = Array.from(contactMap.values());
      if (!active) return;
      setContacts(mergedContacts);

      if (mergedContacts.length > 0) {
        const first = mergedContacts[0];
        setSelectedPeer(first);
        await loadThread(first, nameMap, meId, meName);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadThread]);

  const handleSelectPeer = async (peer: PersonRecord) => {
    setSelectedPeer(peer);
    setStatusText("");
    try {
      const rawThread = await api(`/messages/${encodeURIComponent(peer.id)}`);
      const list = extractArray(rawThread, ["messages", "thread", "items", "data"]);
      const mapped: ThreadMessage[] = list.map((m, idx) => {
        const senderObj = (m.sender || m.author || m.from || m.user) as Record<string, unknown> | undefined;
        const sid = String(m.senderId || m.fromUserId || senderObj?.id || "");
        const resolvedName =
          sid === user.id
            ? user.name
            : senderObj
            ? resolvePersonName(senderObj, peer.name)
            : m.senderName
            ? String(m.senderName)
            : peer.name;

        return {
          id: String(m.id || m._id || idx),
          senderId: sid,
          senderName: resolvedName,
          body: String(m.body || m.content || m.text || m.message || ""),
          createdAt: m.createdAt
            ? new Date(String(m.createdAt)).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
            : undefined,
        };
      });
      setMessages(mapped);
    } catch {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setStatusText("");

    try {
      await api(`/messages/${encodeURIComponent(selectedPeer.id)}`, {
        method: "POST",
        body: JSON.stringify({ body: text }),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          senderId: user.id,
          senderName: user.name,
          body: text,
          createdAt: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: unknown) {
      setStatusText(err instanceof Error ? err.message : "Could not send message.");
    }
  };

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Messages"
      pageSubtitle="Direct conversations with member names clearly displayed."
    >
      {statusText && (
        <div className="mz-post mz-tiny" style={{ color: "var(--orange)", fontWeight: 600 }}>
          {statusText}
        </div>
      )}

      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--green)" }}>
          MEMBERS & CONVERSATIONS ({contacts.length})
        </div>
        {contacts.length === 0 ? (
          <p className="mz-tiny mz-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No member conversations available yet.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginTop: 12 }}>
            {contacts.map((c) => {
              const active = selectedPeer?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectPeer(c)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: active ? "1.5px solid var(--green)" : "1px solid var(--line)",
                    background: active ? "var(--white)" : "var(--bg)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 12, color: "var(--ink)" }}>{c.name}</strong>
                    {typeof c.unreadCount === "number" && c.unreadCount > 0 && (
                      <span className="mz-tiny" style={{ color: "var(--green)", fontWeight: 700 }}>
                        {c.unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="mz-tiny mz-muted" style={{ marginTop: 3 }}>
                    {c.lastMessage ? c.lastMessage : c.handle || "Open chat"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPeer && (
        <div className="mz-post">
          <div className="mz-post-head" style={{ marginBottom: 14 }}>
            <div className="mz-avatar green">{selectedPeer.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong style={{ fontSize: 14 }}>{selectedPeer.name}</strong>
              <div className="mz-tiny mz-muted">{selectedPeer.handle || "Mzansi Member"}</div>
            </div>
          </div>

          {messages.length === 0 ? (
            <p className="mz-tiny mz-muted">No messages with {selectedPeer.name} yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 12 }}>{m.senderName}</strong>
                    {m.createdAt && <span className="mz-tiny mz-muted">{m.createdAt}</span>}
                  </div>
                  <p className="mz-post-text" style={{ margin: 0 }}>
                    {m.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${selectedPeer.name}…`}
              required
              style={{
                flex: 1,
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "9px 12px",
              }}
            />
            <button type="submit" className="mz-primary">
              Send →
            </button>
          </form>
        </div>
      )}
    </CommonUpgrade>
  );
}
