"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../styles/common-upgrade.css";

export const WATERMARK_IMAGES = {
  image1: "/images/1789794530888.jpg",
  image2: "/images/1795326848083.jpg",
  image3: "/images/1789669657455.jpg",
} as const;

export type WatermarkKey = keyof typeof WATERMARK_IMAGES;

export interface MzansiUser {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarColor?: "" | "green" | "pink" | "blue";
  unreadMessages?: number;
}

export interface MzansiPost {
  id: string | number;
  name: string;
  initials: string;
  color?: "" | "green" | "pink" | "blue";
  time: string;
  space: string;
  following: boolean;
  text: string;
  tag?: string;
  likes: number;
  liked?: boolean;
  saved?: boolean;
  comments: number;
  replies?: { author: string; text: string }[];
  image?: string;
}

export interface MzansiSpace {
  id: string;
  name: string;
  icon: string;
  badgeBg?: string;
}

export interface SuggestedMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color?: "" | "green" | "pink" | "blue";
  following: boolean;
}

interface CommonUpgradeProps {
  currentUser: MzansiUser;
  posts?: MzansiPost[];
  spaces?: MzansiSpace[];
  suggestedMembers?: SuggestedMember[];
  showFeed?: boolean;
  watermarkKey?: WatermarkKey;
  pageTitle?: string;
  pageSubtitle?: string;
  onCreatePost?: (payload: { text: string; space: string; image?: string }) => Promise<void> | void;
  onToggleLike?: (postId: string | number) => Promise<void> | void;
  onToggleSave?: (postId: string | number) => Promise<void> | void;
  onAddComment?: (postId: string | number, text: string) => Promise<void> | void;
  onToggleFollow?: (memberId: string) => Promise<void> | void;
  onClaimReward?: () => Promise<void> | void;
  children?: React.ReactNode;
}

export const WatermarkBackdrop: React.FC<{ imageKey: WatermarkKey }> = ({ imageKey }) => {
  const src = WATERMARK_IMAGES[imageKey];
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.14,
        backgroundImage: `url("${src}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export const SwipeUpTaskbar: React.FC<{ onNotify?: (msg: string) => void }> = ({ onNotify }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartY(e.touches[0]?.clientY ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY;
    const deltaY = touchStartY - endY;
    if (deltaY > 24) setExpanded(true);
    if (deltaY < -24) setExpanded(false);
    setTouchStartY(null);
  };

  const products = [
    { name: "KASI Coin", tag: "Celo Rewards & Tipping", href: "/dashboard" },
    { name: "KASI Wallet", tag: "MiniPay & Celo", href: "/profile" },
    { name: "Groups & Pages", tag: "Corners & Subscriptions", href: "/friends" },
    { name: "Direct Messages", tag: "Member Chat", href: "/messages" },
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: "var(--white)",
        borderTop: "1px solid var(--line)",
        boxShadow: "0 -6px 24px rgba(26, 25, 22, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            background: "none",
            border: 0,
            padding: "4px 6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          <span>{expanded ? "▾" : "▴"}</span>
          <span>Swipe up for Mzansi Products</span>
        </button>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/dashboard" className="mz-action" style={{ fontSize: 11, fontWeight: 600 }}>
            KASI Coin
          </Link>
          <Link href="/friends" className="mz-action" style={{ fontSize: 11, fontWeight: 600 }}>
            Groups & Friends
          </Link>
          <Link href="/messages" className="mz-action" style={{ fontSize: 11, fontWeight: 600 }}>
            Messages
          </Link>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "6px 20px 16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 10,
          }}
        >
          {products.map((prod) => (
            <Link
              key={prod.name}
              href={prod.href}
              onClick={() => onNotify?.(`Opened ${prod.name}`)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                textDecoration: "none",
                color: "var(--ink)",
                display: "block",
              }}
            >
              <strong style={{ fontSize: 12, display: "block" }}>{prod.name}</strong>
              <span className="mz-tiny mz-muted">{prod.tag}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const MzansiBrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <Link href="/" className="mz-brand" style={compact ? { fontSize: 22 } : undefined}>
    <span aria-label="South Africa flag" role="img" style={{ fontSize: compact ? 20 : 24, lineHeight: 1 }}>
      🇿🇦
    </span>
    <span className="mz-brand-mark" style={compact ? { fontSize: 28 } : undefined}>
      ✳
    </span>
    <span>mzansi</span>
  </Link>
);

export const CommonUpgrade: React.FC<CommonUpgradeProps> = ({
  currentUser,
  posts = [],
  spaces = [],
  suggestedMembers = [],
  showFeed = true,
  watermarkKey = "image1",
  pageTitle = "A good day to connect.",
  pageSubtitle = "Meaningful participation · Real local commerce on Celo.",
  onCreatePost,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onToggleFollow,
  onClaimReward,
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [openBranches, setOpenBranches] = useState<{
    workspace: boolean;
    kasiCoin: boolean;
    corners: boolean;
  }>({
    workspace: true,
    kasiCoin: true,
    corners: true,
  });

  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "following" | "latest">("all");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [desiredGroupImage, setDesiredGroupImage] = useState<WatermarkKey>("image1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [draftText, setDraftText] = useState<string>("");
  const [draftImage, setDraftImage] = useState<string>("");
  const [openReplyId, setOpenReplyId] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");

  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipRecipient, setTipRecipient] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("10");
  const [claimStatus, setClaimStatus] = useState<string>("Ready on Celo");

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const toggleBranch = (key: "workspace" | "kasiCoin" | "corners") => {
    setOpenBranches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRequestGroupBackground = (e: React.FormEvent) => {
    e.preventDefault();
    const targetName = selectedSpace || spaces[0]?.name || "Community Group/Page";
    showNotice(
      `Background subscription & request sent for "${targetName}" → ${desiredGroupImage.toUpperCase()} (${WATERMARK_IMAGES[desiredGroupImage]}).`
    );
  };

  const handleConnectWalletInfo = async () => {
    const eth = (
      window as unknown as {
        ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
      }
    ).ethereum;
    if (!eth?.request) {
      showNotice("Wallet info: No browser wallet detected. Connect MiniPay or MetaMask on Celo.");
      return;
    }
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[] | undefined;
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
        showNotice(`Connected wallet: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch {
      showNotice("Wallet connection request was cancelled.");
    }
  };

  const handleTriggerClaim = async () => {
    setClaimStatus("Claiming on Celo…");
    try {
      if (onClaimReward) {
        await onClaimReward();
        setClaimStatus("Claim submitted");
      } else {
        await handleConnectWalletInfo();
        setClaimStatus("Wallet ready");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Claim failed";
      setClaimStatus(`Error: ${message}`);
      showNotice(message);
    }
  };

  const handleSendKasiTip = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = tipRecipient.trim();
    const amt = Number(tipAmount);
    if (!target || Number.isNaN(amt) || amt <= 0) {
      showNotice("Enter a valid recipient address or member handle and KASI amount.");
      return;
    }

    const eth = (
      window as unknown as {
        ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
      }
    ).ethereum;

    if (!eth?.request) {
      showNotice(`Tip queued (${amt} KASI → ${target}). Connect a Celo wallet to sign on-chain.`);
      setTipRecipient("");
      setTipOpen(false);
      return;
    }

    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[] | undefined;
      const fromAddr = accounts?.[0];
      if (fromAddr) setWalletAddress(fromAddr);

      if (target.startsWith("0x") && target.length === 42 && fromAddr) {
        const weiHex = `0x${BigInt(Math.round(amt * 1e18)).toString(16)}`;
        const txHash = (await eth.request({
          method: "eth_sendTransaction",
          params: [{ from: fromAddr, to: target, value: weiHex }],
        })) as string;
        setClaimStatus(`Tip sent (${txHash.slice(0, 10)}…)`);
        showNotice(`Sent ${amt} KASI tip to ${target.slice(0, 6)}…${target.slice(-4)}`);
      } else {
        setClaimStatus(`Tip recorded (${amt} KASI)`);
        showNotice(`Tip of ${amt} KASI prepared for ${target}.`);
      }

      setTipRecipient("");
      setTipOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tip transaction cancelled";
      setClaimStatus("Tip cancelled");
      showNotice(msg);
    }
  };

  const visiblePosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = posts.filter((p) => {
      if (savedOnly && !p.saved) return false;
      if (selectedSpace && p.space !== selectedSpace) return false;
      if (filter === "following" && !p.following) return false;
      if (!q) return true;
      return `${p.name} ${p.text} ${p.tag ?? ""} ${p.space}`.toLowerCase().includes(q);
    });
    if (filter === "latest") {
      list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    }
    return list;
  }, [posts, savedOnly, selectedSpace, filter, searchQuery]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      showNotice("Please select an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftImage(reader.result);
        showNotice("Photo attached.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed || !onCreatePost) return;
    await onCreatePost({
      text: trimmed,
      space: selectedSpace || spaces[0]?.name || "Community",
      image: draftImage || undefined,
    });
    setDraftText("");
    setDraftImage("");
    showNotice("Shared with your Mzansi community.");
  };

  const todayLabel = new Date()
    .toLocaleDateString("en-ZA", { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  return (
    <div className="mz-common-app" style={{ position: "relative", paddingBottom: 68, background: "transparent" }}>
      <WatermarkBackdrop imageKey={watermarkKey} />

      <aside className="mz-sidebar" aria-label="Main navigation" style={{ position: "relative", zIndex: 1 }}>
        <MzansiBrandMark />
        <p className="mz-tagline">A little closer · KASI Coin</p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <button
              type="button"
              className="mz-label"
              style={{
                background: "none",
                border: 0,
                padding: "4px 6px",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
              }}
              onClick={() => toggleBranch("workspace")}
              aria-expanded={openBranches.workspace}
            >
              <span>Workspace</span>
              <span>{openBranches.workspace ? "▾" : "▸"}</span>
            </button>

            {openBranches.workspace && (
              <nav className="mz-nav" style={{ paddingLeft: 10, marginTop: 4, borderLeft: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className={pathname === "/dashboard" && !savedOnly ? "active" : ""}
                  onClick={() => {
                    setSavedOnly(false);
                    setSelectedSpace("");
                    router.push("/dashboard");
                  }}
                >
                  ↳ Feed
                </button>
                <button
                  type="button"
                  className={pathname === "/friends" ? "active" : ""}
                  onClick={() => router.push("/friends")}
                >
                  ↳ Friends & Members
                </button>
                <button
                  type="button"
                  className={pathname === "/messages" ? "active" : ""}
                  onClick={() => router.push("/messages")}
                >
                  ↳ Messages
                </button>
                <button
                  type="button"
                  className={savedOnly ? "active" : ""}
                  onClick={() => {
                    setSavedOnly((prev) => !prev);
                    if (pathname !== "/dashboard") router.push("/dashboard");
                  }}
                >
                  ↳ Saved
                </button>
                <button
                  type="button"
                  className={pathname === "/profile" ? "active" : ""}
                  onClick={() => router.push("/profile")}
                >
                  ↳ Profile
                </button>
              </nav>
            )}
          </div>

          <div>
            <button
              type="button"
              className="mz-label"
              style={{
                background: "none",
                border: 0,
                padding: "4px 6px",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                color: "var(--green)",
              }}
              onClick={() => toggleBranch("kasiCoin")}
              aria-expanded={openBranches.kasiCoin}
            >
              <span>KASI Coin</span>
              <span>{openBranches.kasiCoin ? "▾" : "▸"}</span>
            </button>

            {openBranches.kasiCoin && (
              <div style={{ paddingLeft: 10, marginTop: 4, borderLeft: "1px solid var(--line)", display: "grid", gap: 6 }}>
                <button
                  type="button"
                  className="mz-action"
                  style={{ padding: "7px 8px", textAlign: "left", justifyContent: "flex-start" }}
                  onClick={handleConnectWalletInfo}
                >
                  ↳ Wallet {walletAddress ? `(${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)})` : "· Connect"}
                </button>
                <button
                  type="button"
                  className="mz-action"
                  style={{ padding: "7px 8px", textAlign: "left", justifyContent: "flex-start" }}
                  onClick={handleTriggerClaim}
                >
                  ↳ Claim Rewards (Celo)
                </button>
                <button
                  type="button"
                  className="mz-action"
                  style={{ padding: "7px 8px", textAlign: "left", justifyContent: "flex-start" }}
                  onClick={() => setTipOpen((prev) => !prev)}
                >
                  ↳ Send KASI Tip {tipOpen ? "▴" : "▾"}
                </button>

                {tipOpen && (
                  <form
                    onSubmit={handleSendKasiTip}
                    style={{
                      display: "grid",
                      gap: 6,
                      padding: "8px",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                    }}
                  >
                    <input
                      value={tipRecipient}
                      onChange={(e) => setTipRecipient(e.target.value)}
                      placeholder="0x… or @member"
                      required
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 5,
                        padding: "5px 7px",
                        fontSize: 11,
                        background: "var(--white)",
                      }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        required
                        style={{
                          width: 68,
                          border: "1px solid var(--line)",
                          borderRadius: 5,
                          padding: "5px 7px",
                          fontSize: 11,
                          background: "var(--white)",
                        }}
                      />
                      <button type="submit" className="mz-primary" style={{ padding: "5px 9px", fontSize: 11, flex: 1 }}>
                        Send Tip
                      </button>
                    </div>
                  </form>
                )}

                <div className="mz-tiny mz-muted" style={{ padding: "2px 8px" }}>
                  ↳ Status: {claimStatus}
                </div>
                <div className="mz-tiny mz-muted" style={{ padding: "0 8px 2px" }}>
                  ↳ Network: Celo · Token: KASI
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              className="mz-label"
              style={{
                background: "none",
                border: 0,
                padding: "4px 6px",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
              }}
              onClick={() => toggleBranch("corners")}
              aria-expanded={openBranches.corners}
            >
              <span>Groups & Pages</span>
              <span>{openBranches.corners ? "▾" : "▸"}</span>
            </button>

            {openBranches.corners && (
              <div style={{ paddingLeft: 10, marginTop: 4, borderLeft: "1px solid var(--line)", display: "grid", gap: 6 }}>
                {spaces.map((sp) => (
                  <a
                    key={sp.id}
                    href={`#space-${sp.id}`}
                    className={`mz-space-link ${selectedSpace === sp.name ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSpace((prev) => (prev === sp.name ? "" : sp.name));
                    }}
                  >
                    <span
                      className="mz-space-icon"
                      style={sp.badgeBg ? { background: sp.badgeBg } : undefined}
                    >
                      {sp.icon}
                    </span>
                    ↳ {sp.name}
                  </a>
                ))}

                <form
                  onSubmit={handleRequestGroupBackground}
                  style={{
                    display: "grid",
                    gap: 6,
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                  }}
                >
                  <div className="mz-tiny" style={{ fontWeight: 700 }}>
                    Background Image Request
                  </div>
                  <select
                    value={desiredGroupImage}
                    onChange={(e) => setDesiredGroupImage(e.target.value as WatermarkKey)}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 5,
                      padding: "5px 6px",
                      fontSize: 11,
                      background: "var(--white)",
                    }}
                  >
                    <option value="image1">Image no:1 (1789794530888)</option>
                    <option value="image2">Image no:2 (1795326848083)</option>
                    <option value="image3">Image no:3 (1789669657455)</option>
                  </select>
                  <button type="submit" className="mz-follow" style={{ fontSize: 11 }}>
                    Request & Subscribe
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <Link href="/profile" className="mz-profile">
          <div className={`mz-avatar ${currentUser.avatarColor ?? ""}`}>{currentUser.initials}</div>
          <div>
            <strong>{currentUser.name}</strong>
            <div className="mz-tiny mz-muted">{currentUser.handle}</div>
          </div>
        </Link>
      </aside>

      <div className="mz-content" style={{ position: "relative", zIndex: 1 }}>
        <header className="mz-topbar">
          <div className="mz-breadcrumb">
            Mzansi <span>/ {selectedSpace || (savedOnly ? "SAVED" : pathname.replace("/", "").toUpperCase() || "HOME")}</span>
          </div>
          <div className="mz-top-actions">
            {showFeed && (
              <label className="mz-search">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Mzansi…"
                />
              </label>
            )}
            <Link href="/profile" className={`mz-avatar small ${currentUser.avatarColor ?? ""}`}>
              {currentUser.initials}
            </Link>
          </div>
        </header>

        {notice && (
          <div role="status" style={{ padding: "10px 36px", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
            {notice}
          </div>
        )}

        <main className="mz-workspace" style={!showFeed ? { gridTemplateColumns: "1fr" } : undefined}>
          <section className="mz-feed">
            <div className="mz-greeting">
              <div>
                <div className="mz-label">{todayLabel}</div>
                <h1>{pageTitle}</h1>
                <p className="mz-muted mz-tiny">{pageSubtitle}</p>
              </div>
              <span style={{ fontSize: 28, color: "var(--orange)" }} aria-hidden="true">
                ☼
              </span>
            </div>

            {children}

            {showFeed && (
              <>
                <section className="mz-banner">
                  <div className="mz-label" style={{ color: "var(--green)" }}>
                    KASI Coin · Celo Rewards
                  </div>
                  <h2>Less scrolling. More belonging.</h2>
                  <p className="mz-tiny mz-muted">
                    Earn KASI Coin rewards for constructive posts and supporting local community members.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" className="mz-primary" onClick={handleTriggerClaim}>
                      Claim KASI Coin (Celo) →
                    </button>
                    <button
                      type="button"
                      className="mz-follow"
                      style={{ background: "var(--white)", fontSize: 11 }}
                      onClick={handleConnectWalletInfo}
                    >
                      {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Wallet Details"}
                    </button>
                  </div>
                </section>

                {onCreatePost && (
                  <form className="mz-composer" onSubmit={handlePostSubmit}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div className={`mz-avatar ${currentUser.avatarColor ?? ""}`}>{currentUser.initials}</div>
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder={`What is on your mind, ${currentUser.name.split(" ")[0]}?`}
                        maxLength={2000}
                        required
                      />
                    </div>
                    {draftImage && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={draftImage}
                          alt="Preview"
                          style={{ maxHeight: 180, borderRadius: 8, objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div className="mz-composer-bottom">
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <label className="mz-action">
                          Photo
                          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </label>
                        <button
                          type="button"
                          className="mz-action"
                          onClick={() => setDraftText((t) => `${t} 🇿🇦`)}
                        >
                          Add 🇿🇦
                        </button>
                      </div>
                      <button className="mz-primary" type="submit">
                        Share a thought →
                      </button>
                    </div>
                  </form>
                )}

                <div className="mz-tabs" role="tablist" aria-label="Feed filter">
                  <button
                    type="button"
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                  >
                    For you
                  </button>
                  <button
                    type="button"
                    className={filter === "following" ? "active" : ""}
                    onClick={() => setFilter("following")}
                  >
                    Following
                  </button>
                  <button
                    type="button"
                    className={filter === "latest" ? "active" : ""}
                    onClick={() => setFilter("latest")}
                  >
                    Latest
                  </button>
                </div>

                <div>
                  {visiblePosts.length === 0 ? (
                    <div className="mz-post mz-muted" style={{ textAlign: "center" }}>
                      No posts loaded yet.
                    </div>
                  ) : (
                    visiblePosts.map((post) => (
                      <article key={post.id} className="mz-post">
                        <div className="mz-post-head">
                          <div className={`mz-avatar ${post.color ?? ""}`}>{post.initials}</div>
                          <div>
                            <strong style={{ fontSize: 12 }}>{post.name}</strong>
                            <div className="mz-tiny mz-muted">
                              {post.time} · {post.space}
                            </div>
                          </div>
                        </div>

                        <p className="mz-post-text">
                          {post.text}
                          {post.tag && <span className="mz-hashtag">{post.tag}</span>}
                        </p>

                        {post.image && (
                          <img
                            src={post.image}
                            alt={`Shared by ${post.name}`}
                            style={{ width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 8 }}
                          />
                        )}

                        <div className="mz-post-footer">
                          {onToggleLike && (
                            <button
                              type="button"
                              className={`mz-action ${post.liked ? "active" : ""}`}
                              onClick={() => onToggleLike(post.id)}
                            >
                              ♥ {post.likes}
                            </button>
                          )}
                          {onAddComment && (
                            <button
                              type="button"
                              className="mz-action"
                              onClick={() => {
                                setOpenReplyId((prev) => (prev === post.id ? null : post.id));
                                setReplyText("");
                              }}
                            >
                              💬 {post.comments}
                            </button>
                          )}
                          {onToggleSave && (
                            <button
                              type="button"
                              className={`mz-action mz-save ${post.saved ? "active" : ""}`}
                              onClick={() => onToggleSave(post.id)}
                            >
                              {post.saved ? "Saved" : "Save"}
                            </button>
                          )}
                        </div>

                        {openReplyId === post.id && onAddComment && (
                          <form
                            style={{ display: "flex", gap: 8, marginTop: 12 }}
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const trimmed = replyText.trim();
                              if (!trimmed) return;
                              await onAddComment(post.id, trimmed);
                              setReplyText("");
                              setOpenReplyId(null);
                            }}
                          >
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Add a kind thought…"
                              maxLength={500}
                              required
                              style={{
                                flex: 1,
                                border: "1px solid var(--line)",
                                borderRadius: 6,
                                padding: "8px 10px",
                              }}
                            />
                            <button type="submit" className="mz-primary">
                              Reply
                            </button>
                          </form>
                        )}

                        {post.replies && post.replies.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            {post.replies.map((r, idx) => (
                              <div
                                key={idx}
                                className="mz-tiny"
                                style={{ paddingTop: 8, marginTop: 8, borderTop: "1px solid var(--line)" }}
                              >
                                <strong>{r.author}</strong> · {r.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </section>

          {showFeed && suggestedMembers.length > 0 && onToggleFollow && (
            <aside className="mz-rail" aria-label="Community activity">
              <section className="mz-rail-section">
                <div className="mz-rail-heading">
                  <h2>Community members</h2>
                </div>
                {suggestedMembers.map((member) => (
                  <div key={member.id} className="mz-person">
                    <div className={`mz-avatar small ${member.color ?? ""}`}>{member.initials}</div>
                    <div>
                      <strong style={{ fontSize: 11 }}>{member.name}</strong>
                      <div className="mz-tiny mz-muted">{member.role}</div>
                    </div>
                    <button
                      type="button"
                      className={`mz-follow ${member.following ? "followed" : ""}`}
                      onClick={() => onToggleFollow(member.id)}
                    >
                      {member.following ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </section>
            </aside>
          )}
        </main>
      </div>

      <SwipeUpTaskbar onNotify={showNotice} />
    </div>
  );
};
