"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";
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
  avatarUrl?: string;
  unread: number;
  messages: ChatMessage[];
}

const MESSAGES_STORAGE_KEY = SHARED_STORAGE_KEYS.messages;
const PROFILE_STORAGE_KEY = SHARED_STORAGE_KEYS.profile;
const MEMBER_STORAGE_KEYS = [
  SHARED_STORAGE_KEYS.members,
  "mzansi_registered_members",
  "mzansi_members",
  "mzansi_users",
];

const DEFAULT_USER: MzansiUser = {
  id: "member-1",
  name: "Member",
  handle: "@member",
  initials: "M",
  avatarColor: "green",
};

function ThreadAvatar({
  href,
  name,
  initials,
  color,
  avatarUrl,
  stopPropagation = false,
}: {
  href: string;
  name: string;
  initials: string;
  color?: "" | "green" | "pink" | "blue";
  avatarUrl?: string;
  stopPropagation?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      style={{ textDecoration: "none", flexShrink: 0 }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`mz-avatar small ${color ?? ""}`}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className={`mz-avatar small ${color ?? ""}`}>{initials}</div>
      )}
    </Link>
  );
}

function normalizeMemberThreads(rawList: unknown[]): ChatThread[] {
  const seen = new Set<string>();
  const threads: ChatThread[] = [];

  for (let idx = 0; idx < rawList.length; idx += 1) {
    const entry = rawList[idx];
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;

    const rawName =
      (typeof item.memberName === "string" && item.memberName) ||
      (typeof item.fullName === "string" && item.fullName) ||
      (typeof item.name === "string" && item.name) ||
      "";
    const name = rawName.trim();
    if (!name) continue;

    const id = String(item.id ?? item.handle ?? name.toLowerCase().replace(/\s+/g, "-"));
    if (seen.has(id)) continue;
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
        : (["green", "pink", "blue", ""] as const)[idx % 4];
    const rawAvatar = item.avatarUrl || item.avatar;

    const msgs: ChatMessage[] = Array.isArray(item.messages)
      ? item.messages
          .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === "object"))
          .map((m, mIdx) => ({
            id: String(m.id ?? `${id}-msg-${mIdx}`),
            sender: typeof m.sender === "string" && m.sender.trim() ? m.sender.trim() : name,
            isMe: Boolean(m.isMe),
            text: typeof m.text === "string" ? m.text : "",
            time: typeof m.time === "string" && m.time.trim() ? m.time.trim() : "Recently",
          }))
      : [];

    threads.push({
      id,
      memberName: name,
      handle,
      initials,
      role,
      color,
      avatarUrl: typeof rawAvatar === "string" && rawAvatar.trim() ? rawAvatar.trim() : undefined,
      unread: typeof item.unread === "number" ? item.unread : 0,
      messages: msgs,
    });
  }

  return threads;
}

function readStoredThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const rawSaved = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved) as unknown;
      if (Array.isArray(parsed)) {
        const normalized = normalizeMemberThreads(parsed);
        if (normalized.length > 0) return normalized;
      }
    }
  } catch {
    // Ignore storage read error
  }

  for (const key of MEMBER_STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { members?: unknown[] }).members)
        ? (parsed as { members: unknown[] }).members
        : [];
      const normalized = normalizeMemberThreads(list);
      if (normalized.length > 0) return normalized;
    } catch {
      // Ignore malformed storage entry
    }
  }

  return [];
}

export default function MessagesPage() {
  const [user, setUser] = useState<MzansiUser>(DEFAULT_USER);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
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
            avatar: parsed.avatarUrl || "",
          }));
        }
      }
    } catch {
      // Ignore profile storage read error
    }

    const stored = readStoredThreads();
    if (stored.length > 0) {
      setThreads(stored);
      setActiveId((prev) => prev || stored[0].id);
    }

    let cancelled = false;
    void fetchSharedMembers()
      .then((shared) => {
        if (cancelled || shared.length === 0) return;
        setThreads((prev) => {
          const existingById = new Map(prev.map((t) => [t.id, t]));
          const merged: ChatThread[] = shared.map((m) => {
            const existing = existingById.get(m.id);
            return {
              id: String(m.id),
              memberName: m.name,
              handle: m.handle,
              initials: m.initials || makeInitials(m.name),
              role: m.role,
              color: m.color,
              avatarUrl: m.avatarUrl || existing?.avatarUrl,
              unread: existing?.unread ?? 0,
              messages: existing?.messages ?? [],
            };
          });
          for (const extra of prev) {
            if (!merged.some((item) => item.id === extra.id)) {
              merged.push(extra);
            }
          }
          try {
            window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // Ignore storage write error
          }
          return merged;
        });
        setActiveId((prev) => prev || String(shared[0].id));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const persistThreads = useCallback((next: ChatThread[]) => {
    setThreads(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota error
      }
    }
  }, []);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.memberName.toLowerCase().includes(q) ||
        t.handle.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q)
    );
  }, [threads, search]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? filteredThreads[0] ?? threads[0] ?? null,
    [threads, filteredThreads, activeId]
  );

  const selectThread = (id: string) => {
    setActiveId(id);
    const updated = threads.map((t) => (t.id === id ? { ...t, unread: 0 } : t));
    persistThreads(updated);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeThread) return;

    const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const outgoing: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: user.name || "Member",
      isMe: true,
      text,
      time: nowLabel,
    };

    const updated = threads.map((t) =>
      t.id === activeThread.id
        ? { ...t, unread: 0, messages: [...t.messages, outgoing] }
        : t
    );
    persistThreads(updated);
    setDraft("");
    setStatusNote(`Sent to ${activeThread.memberName}.`);
    window.setTimeout(() => setStatusNote(""), 2500);
  };

  return (
    <CommonUpgrade
      watermarkKey="image3"
      currentUser={user}
      showFeed={false}
      pageTitle="Messages"
      pageSubtitle="Direct conversations with registered Mzansi community members."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 290px) minmax(0, 1fr)",
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registered members..."
            aria-label="Search registered members"
            className="mz-transparent-input"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 12 }}
          />

          {filteredThreads.length === 0 ? (
            <div className="mz-tiny mz-muted" style={{ padding: "12px 4px", lineHeight: 1.5 }}>
              No registered members available yet. Members appear here once registered or loaded on{" "}
              <Link href="/friends/" style={{ color: "var(--green)", fontWeight: 600 }}>
                Friends
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
                    <ThreadAvatar
                      href={`/profile/?memberId=${encodeURIComponent(t.id)}&name=${encodeURIComponent(t.memberName)}`}
                      name={t.memberName}
                      initials={t.initials}
                      color={t.color}
                      avatarUrl={t.avatarUrl}
                      stopPropagation
                    />
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
                  <ThreadAvatar
                    href={`/profile/?memberId=${encodeURIComponent(activeThread.id)}&name=${encodeURIComponent(activeThread.memberName)}`}
                    name={activeThread.memberName}
                    initials={activeThread.initials}
                    color={activeThread.color}
                    avatarUrl={activeThread.avatarUrl}
                  />
                  <div>
                    <strong style={{ fontSize: 13 }}>{activeThread.memberName}</strong>
                    <div className="mz-tiny mz-muted">
                      {activeThread.handle} · {activeThread.role}
                    </div>
                  </div>
                </div>
                <div role="status" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 600 }}>
                  {statusNote}
                </div>
              </div>

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
                        maxWidth: "80%",
                        background: m.isMe ? "var(--green)" : "var(--bg)",
                        color: m.isMe ? "#fff" : "var(--ink)",
                        border: m.isMe ? "none" : "1px solid var(--line)",
                        borderRadius: 10,
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ fontSize: 13 }}>{m.text}</div>
                      <div
                        className="mz-tiny"
                        style={{
                          marginTop: 4,
                          opacity: m.isMe ? 0.85 : 0.65,
                          textAlign: "right",
                        }}
                      >
                        {m.time}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeThread.memberName}...`}
                  required
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
                <button type="submit" className="mz-primary">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="mz-tiny mz-muted" style={{ padding: "24px 8px" }}>
              Select a registered member on the left to start messaging.
            </div>
          )}
        </section>
      </div>
    </CommonUpgrade>
  );
}
