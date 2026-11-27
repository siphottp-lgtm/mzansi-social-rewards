"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CommonUpgrade, MzansiUser } from "../../components/CommonUpgrade";

interface ChatMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  time: string;
  tipAmount?: number;
}

interface ChatThread {
  id: string;
  memberName: string;
  initials: string;
  role: string;
  walletHint: string;
  color?: "" | "green" | "pink" | "blue";
  unread: number;
  messages: ChatMessage[];
}

const MESSAGES_STORAGE_KEY = "mzansi_messages_v1";
const PROFILE_STORAGE_KEY = "mzansi_profile_details_v1";

const DEFAULT_USER: MzansiUser = {
  id: "member-1",
  name: "Member",
  handle: "@member",
  initials: "M",
  avatarColor: "green",
};

const INITIAL_THREADS: ChatThread[] = [
  {
    id: "thread-thabo",
    memberName: "Thabo Mokoena",
    initials: "TM",
    role: "Soshanguve Builder",
    walletHint: "0x71C...9A4E",
    color: "green",
    unread: 1,
    messages: [
      {
        id: "m-1",
        sender: "Thabo Mokoena",
        isMe: false,
        text: "Saw your latest post on the feed. Are you joining the weekend space?",
        time: "10:14",
      },
    ],
  },
  {
    id: "thread-lerato",
    memberName: "Lerato Dlamini",
    initials: "LD",
    role: "Community Organizer",
    walletHint: "0x4B2...3D10",
    color: "pink",
    unread: 0,
    messages: [
      {
        id: "m-2",
        sender: "Lerato Dlamini",
        isMe: false,
        text: "Welcome to the workspace! Let me know if you test KASI tipping on Celo.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "thread-sipho",
    memberName: "Sipho Ndlovu",
    initials: "SN",
    role: "Celo MiniPay User",
    walletHint: "0x9E8...1F22",
    color: "blue",
    unread: 0,
    messages: [
      {
        id: "m-3",
        sender: "Sipho Ndlovu",
        isMe: false,
        text: "MiniPay transfers on Celo confirm fast for local micro-rewards.",
        time: "Wed",
      },
    ],
  },
];

export default function MessagesPage() {
  const [user, setUser] = useState<MzansiUser>(DEFAULT_USER);
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeId, setActiveId] = useState<string>(INITIAL_THREADS[0].id);
  const [draft, setDraft] = useState<string>("");
  const [tipDrawerOpen, setTipDrawerOpen] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<string>("10");
  const [tipAddress, setTipAddress] = useState<string>(INITIAL_THREADS[0].walletHint);
  const [statusNote, setStatusNote] = useState<string>("");

  useEffect(() => {
    try {
      const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile) as { fullName?: string; handle?: string; avatarUrl?: string };
        const name = parsed.fullName?.trim();
        if (name) {
          const initials = name
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUser((prev) => ({
            ...prev,
            name,
            handle: parsed.handle?.trim() || prev.handle,
            initials,
            avatarUrl: parsed.avatarUrl || "",
          }));
        }
      }
    } catch {
      // Ignore profile storage read errors
    }

    try {
      const rawThreads = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (rawThreads) {
        const parsed = JSON.parse(rawThreads) as ChatThread[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveId(parsed[0].id);
          setTipAddress(parsed[0].walletHint);
        }
      }
    } catch {
      // Ignore message storage read errors
    }
  }, []);

  const saveThreads = (nextThreads: ChatThread[]) => {
    setThreads(nextThreads);
    try {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(nextThreads));
    } catch {
      // Ignore storage write errors
    }
  };

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [threads, activeId]
  );

  const selectThread = (threadId: string) => {
    setActiveId(threadId);
    const chosen = threads.find((t) => t.id === threadId);
    if (chosen) {
      setTipAddress(chosen.walletHint);
    }
    const updated = threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t));
    saveThreads(updated);
  };

  const appendMessage = (text: string, tipAmt?: number) => {
    const nowLabel = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: user.name,
      isMe: true,
      text,
      time: nowLabel,
      tipAmount: tipAmt,
    };
    const next = threads.map((t) =>
      t.id === activeThread.id ? { ...t, unread: 0, messages: [...t.messages, msg] } : t
    );
    saveThreads(next);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !activeThread) return;
    appendMessage(trimmed);
    setDraft("");
    setStatusNote(`Sent to ${activeThread.memberName}.`);
    window.setTimeout(() => setStatusNote(""), 2500);
  };

  const handleSendTipInDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(tipAmount);
    if (!activeThread || Number.isNaN(amt) || amt <= 0) return;

    const eth = (
      window as unknown as {
        ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
      }
    ).ethereum;

    const target = tipAddress.trim() || activeThread.walletHint;
    if (eth?.request && target.startsWith("0x") && target.length === 42) {
      try {
        const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[] | undefined;
        const fromAddr = accounts?.[0];
        if (fromAddr) {
          const weiHex = `0x${BigInt(Math.round(amt * 1e18)).toString(16)}`;
          await eth.request({
            method: "eth_sendTransaction",
            params: [{ from: fromAddr, to: target, value: weiHex }],
          });
        }
      } catch {
        setStatusNote("Wallet tip cancelled; logged note in thread.");
      }
    }

    appendMessage(`Sent a ${amt} KASI tip to ${activeThread.memberName}.`, amt);
    setStatusNote(`${amt} KASI tip recorded for ${activeThread.memberName}.`);
    setTipDrawerOpen(false);
    window.setTimeout(() => setStatusNote(""), 3000);
  };

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Messages"
      pageSubtitle="Direct chats and KASI Coin tips on Celo."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Left Member Roster */}
        <aside
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <div className="mz-label">Chats</div>
          {threads.map((t) => {
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
                  <div className="mz-tiny mz-muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lastMsg ? lastMsg.text : t.role}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Conversation Thread + KASI Tip Drawer */}
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
          {activeThread && (
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
                    <div className="mz-tiny mz-muted">{activeThread.role}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mz-follow ${tipDrawerOpen ? "followed" : ""}`}
                  style={{ fontSize: 11 }}
                  onClick={() => setTipDrawerOpen((prev) => !prev)}
                >
                  {tipDrawerOpen ? "Close KASI Tip" : "KASI Tip Drawer"}
                </button>
              </div>

              {tipDrawerOpen && (
                <form
                  onSubmit={handleSendTipInDrawer}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: 10,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div className="mz-label" style={{ color: "var(--green)" }}>
                    Send KASI Tip to {activeThread.memberName}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      value={tipAddress}
                      onChange={(e) => setTipAddress(e.target.value)}
                      placeholder="0x... Celo address"
                      style={{
                        flex: 1,
                        minWidth: 150,
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "6px 8px",
                        fontSize: 11,
                        background: "var(--white)",
                      }}
                    />
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      required
                      style={{
                        width: 84,
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "6px 8px",
                        fontSize: 11,
                        background: "var(--white)",
                      }}
                    />
                    <button type="submit" className="mz-primary" style={{ fontSize: 11 }}>
                      Send Tip
                    </button>
                  </div>
                </form>
              )}

              {statusNote && (
                <div role="status" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 600 }}>
                  {statusNote}
                </div>
              )}

              <div style={{ display: "grid", gap: 8, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
                {activeThread.messages.map((m) => (
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
                    <div style={{ fontSize: 12 }}>
                      {m.text}
                      {m.tipAmount !== undefined && (
                        <span style={{ marginLeft: 6, color: "var(--green)", fontWeight: 700 }}>
                          +{m.tipAmount} KASI
                        </span>
                      )}
                    </div>
                    <div className="mz-tiny mz-muted" style={{ marginTop: 4 }}>
                      {m.sender} · {m.time}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
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
          )}
        </section>
      </div>
    </CommonUpgrade>
  );
}
