"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CommonUpgrade, MzansiUser } from "../../components/CommonUpgrade";
import { fetchSharedMembers, makeInitials, SHARED_STORAGE_KEYS } from "../../lib/api";

interface ChatMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  time: string;
}

interface ChatThread {
  id: string;
  memberName: string;
  handle: string;
  initials: string;
  role: string;
  color?: "" | "green" | "pink" | "blue";
  unread: number;
  messages: ChatMessage[];
}

const MESSAGES_STORAGE_KEY = SHARED_STORAGE_KEYS.messages;
const PROFILE_STORAGE_KEY = SHARED_STORAGE_KEYS.profile;
const MEMBER_STORAGE_KEYS = [
  SHARED_STORAGE_KEYS.members,
  "mzansi_members_v1",
  "mzansi_friends_v1",
  "mzansi_users_v1",
  "mzansi_community_members_v1",
];

const DEFAULT_USER: MzansiUser = {
  id: "member-1",
  name: "Member",
  handle: "@member",
  initials: "M",
  avatarColor: "green",
};

function normalizeMemberThreads(rawList: unknown[]): ChatThread[] {
  const colors: ("" | "green" | "pink" | "blue")[] = ["green", "pink", "blue", ""];
  const seen = new Set<string>();
  const threads: ChatThread[] = [];

  rawList.forEach((entry, idx) => {
    if (!entry || typeof entry !== "object") return;
    const item = entry as Record<string, unknown>;
    const rawName =
      (typeof item.memberName === "string" && item.memberName) ||
      (typeof item.fullName === "string" && item.fullName) ||
      (typeof item.name === "string" && item.name) ||
      "";
    const name = rawName.trim();
    if (!name) return;

    const id = String(item.id ?? item.handle ?? name.toLowerCase().replace(/\s+/g, "-"));
    if (seen.has(id)) return;
    seen.add(id);

    const handle =
      (typeof item.handle === "string" && item.handle.trim()) ||
      `@${name.toLowerCase().replace(/[^a-z0-9_]/g, "") || "member"}`;
    const role =
      (typeof item.role === "string" && item.role.trim()) ||
      (typeof item.bio === "string" && item.bio.trim()) ||
      "Registered Member";
    const initials =
      (typeof item.initials === "string" && item.initials.trim().slice(0, 2).toUpperCase()) ||
      makeInitials(name);
    const color =
      item.color === "green" || item.color === "pink" || item.color === "blue" || item.color === ""
        ? item.color
        : colors[idx % colors.length];

    const rawMsgs = Array.isArray(item.messages) ? item.messages : [];
    const messages: ChatMessage[] = rawMsgs
      .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === "object"))
      .map((m, mIdx) => ({
        id: String(m.id ?? `${id}-msg-${mIdx}`),
        sender: typeof m.sender === "string" && m.sender.trim() ? m.sender.trim() : name,
        isMe: Boolean(m.isMe),
        text: typeof m.text === "string" ? m.text : "",
        time: typeof m.time === "string" ? m.time : "",
      }))
      .filter((m) => m.text.trim().length > 0);

    threads.push({
      id,
      memberName: name,
      handle,
      initials,
      role,
      color,
      unread: typeof item.unread === "number" ? item.unread : 0,
      messages,
    });
  });

  return threads;
}

function loadRegisteredMembersFromStorage(): ChatThread[] {
  for (const key of MEMBER_STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { members?: unknown[] }).members)
        ? (parsed as { members: unknown[] }).members
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { friends?: unknown[] }).friends)
        ? (parsed as { friends: unknown[] }).friends
        : [];
      const normalized = normalizeMemberThreads(list);
      if (normalized.length > 0) return normalized;
    } catch {
      // Ignore malformed storage entries
    }
  }
  return [];
}

export default function MessagesPage() {
  const [user, setUser] = useState<MzansiUser>(DEFAULT_USER);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [draft, setDraft] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");

  useEffect(() => {
    try {
      const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile) as { fullName?: string; handle?: string; avatarUrl?: string };
        const name = parsed.fullName?.trim();
        if (name) {
          setUser((prev) => ({
            ...prev,
            name,
            handle: parsed.handle?.trim() || prev.handle,
            initials: makeInitials(name),
            avatarUrl: parsed.avatarUrl || "",
          }));
        }
      }
    } catch {
      // Ignore profile storage read errors
    }

    let savedThreads: ChatThread[] = [];
    try {
      const rawThreads = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (rawThreads) {
        const parsed = JSON.parse(rawThreads);
        if (Array.isArray(parsed)) {
          savedThreads = normalizeMemberThreads(parsed);
        }
      }
    } catch {
      // Ignore message storage read errors
    }

    const registered = loadRegisteredMembersFromStorage();
    const mergedMap = new Map<string, ChatThread>();
    for (const r of registered) {
      mergedMap.set(r.id, r);
    }
    for (const s of savedThreads) {
      const existing = mergedMap.get(s.id);
      mergedMap.set(
        s.id,
        existing
          ? {
              ...existing,
              unread: s.unread,
              messages: s.messages.length > 0 ? s.messages : existing.messages,
            }
          : s
      );
    }

    const merged = Array.from(mergedMap.values());
    setThreads(merged);
    if (merged.length > 0) {
      setActiveId(merged[0].id);
    }

    const fetchBackendMembers = async () => {
      try {
        const remoteMembers = await fetchSharedMembers();
        if (remoteMembers.length > 0) {
          const remoteThreads: ChatThread[] = remoteMembers.map((m) => ({
            id: String(m.id),
            memberName: m.name,
            handle: m.handle,
            initials: m.initials || makeInitials(m.name),
            role: m.role,
            color: m.color,
            unread: 0,
            messages: [],
          }));
          setThreads((prev) => {
            const byId = new Map<string, ChatThread>();
            for (const rt of remoteThreads) byId.set(rt.id, rt);
            for (const pt of prev) {
              const found = byId.get(pt.id);
              byId.set(
                pt.id,
                found
                  ? {
                      ...found,
                      unread: pt.unread,
                      messages: pt.messages.length > 0 ? pt.messages : found.messages,
                    }
                  : pt
              );
            }
            const next = Array.from(byId.values());
            setActiveId((cur) => cur || next[0]?.id || "");
            return next;
          });
        }
      } catch {
        // Keep local members when offline
      }
    };

    void fetchBackendMembers();
  }, []);

  const saveThreads = (nextThreads: ChatThread[]) => {
    setThreads(nextThreads);
    try {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(nextThreads));
    } catch {
      // Ignore storage write errors
    }
  };

  const filteredThreads = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.memberName.toLowerCase().includes(q) ||
        t.handle.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q)
    );
  }, [threads, searchTerm]);

  const activeThread = useMemo(
    () => filteredThreads.find((t) => t.id === activeId) ?? threads.find((t) => t.id === activeId) ?? filteredThreads[0],
    [filteredThreads, threads, activeId]
  );

  const selectThread = (threadId: string) => {
    setActiveId(threadId);
    const updated = threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t));
    saveThreads(updated);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !activeThread) return;

    const nowLabel = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: (user.name ?? ""),
      isMe: true,
      text: trimmed,
      time: nowLabel,
    };

    const next = threads.map((t) =>
      t.id === activeThread.id ? { ...t, unread: 0, messages: [...t.messages, msg] } : t
    );
    saveThreads(next);
    setDraft("");
    setStatusNote(`Sent to ${activeThread.memberName}.`);
    window.setTimeout(() => setStatusNote(""), 2500);
  };

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Messages"
      pageSubtitle="Direct chats with registered members and friends."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span className="mz-label">Inbox</span>
            <Link href="/friends" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 700 }}>
              Friends & Members
            </Link>
          </div>

          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members or friends..."
            style={{
              width: "100%",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "7px 10px",
              fontSize: 12,
              background: "var(--bg)",
            }}
          />

          {filteredThreads.length === 0 ? (
            <div className="mz-tiny mz-muted" style={{ padding: "12px 4px", lineHeight: 1.5 }}>
              No registered members or friends found yet. Connect or register members in{" "}
              <Link href="/friends" style={{ color: "var(--green)", fontWeight: 700 }}>
                Friends & Members
              </Link>
              .
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {filteredThreads.map((t) => {
                const lastMsg = t.messages[t.messages.length - 1];
                const isSelected = t.id === activeThread?.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectThread(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: isSelected ? "var(--bg)" : "var(--white)",
                      cursor: "pointer",
                    }}
                  >
                    <div className={`mz-avatar small ${t.color ?? ""}`}>{t.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <strong style={{ fontSize: 12 }}>{t.memberName}</strong>
                        {t.unread > 0 && (
                          <span
                            style={{
                              background: "var(--green)",
                              color: "#fff",
                              borderRadius: 999,
                              padding: "1px 6px",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {t.unread}
                          </span>
                        )}
                      </div>
                      <div
                        className="mz-tiny mz-muted"
                        style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {lastMsg ? lastMsg.text : `${t.handle} · ${t.role}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 14,
            display: "grid",
            gap: 12,
          }}
        >
          {activeThread ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={`mz-avatar small ${activeThread.color ?? ""}`}>{activeThread.initials}</div>
                  <div>
                    <strong style={{ fontSize: 13 }}>{activeThread.memberName}</strong>
                    <div className="mz-tiny mz-muted">
                      {activeThread.handle} · {activeThread.role}
                    </div>
                  </div>
                </div>
              </div>

              {statusNote && (
                <div role="status" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 600 }}>
                  {statusNote}
                </div>
              )}

              <div style={{ display: "grid", gap: 8, minHeight: 160, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
                {activeThread.messages.length === 0 ? (
                  <div className="mz-tiny mz-muted" style={{ textAlign: "center", padding: "28px 12px" }}>
                    Start a conversation with {activeThread.memberName}.
                  </div>
                ) : (
                  activeThread.messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        justifySelf: m.isMe ? "end" : "start",
                        maxWidth: "82%",
                        background: m.isMe ? "var(--bg)" : "var(--white)",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ fontSize: 12 }}>{m.text}</div>
                      <div className="mz-tiny mz-muted" style={{ marginTop: 4 }}>
                        {m.sender}
                        {m.time ? ` · ${m.time}` : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                style={{ display: "flex", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 10 }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeThread.memberName}...`}
                  required
                  style={{
                    flex: 1,
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 12,
                  }}
                />
                <button type="submit" className="mz-primary">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="mz-tiny mz-muted" style={{ padding: "24px 8px", textAlign: "center" }}>
              Select or add a registered member or friend to begin chatting.
            </div>
          )}
        </section>
      </div>
    </CommonUpgrade>
  );
}


