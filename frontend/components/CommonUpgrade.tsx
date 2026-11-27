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
        opacity: 0.1,
        backgroundImage: `url("${src}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

interface SwipeUpTaskbarProps {
  spaces?: MzansiSpace[];
  selectedSpace?: string;
  onSelectSpace?: (spaceName: string) => void;
  onConnectWallet?: () => void;
  onClaimReward?: () => void;
  onSendTip?: (recipient: string, amount: number) => Promise<void> | void;
  walletAddress?: string;
  claimStatus?: string;
}

export const SwipeUpTaskbar: React.FC<SwipeUpTaskbarProps> = ({
  spaces = [],
  selectedSpace = "",
  onSelectSpace,
  onConnectWallet,
  onClaimReward,
  onSendTip,
  walletAddress = "",
  claimStatus = "Celo ready",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTree, setActiveTree] = useState<"workspace" | "kasiCoin" | "groups">("workspace");
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [tipOpen, setTipOpen] = useState<boolean>(false);
  const [tipRecipient, setTipRecipient] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("10");

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartY(e.touches[0]?.clientY ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY;
    const deltaY = touchStartY - endY;
    if (deltaY > 20) setExpanded(true);
    if (deltaY < -20) setExpanded(false);
    setTouchStartY(null);
  };

  const openTree = (tree: "workspace" | "kasiCoin" | "groups") => {
    setActiveTree(tree);
    setExpanded(true);
  };

  const handleTipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(tipAmount);
    if (!tipRecipient.trim() || Number.isNaN(amt) || amt <= 0) return;
    if (onSendTip) {
      await onSendTip(tipRecipient.trim(), amt);
    }
    setTipRecipient("");
    setTipOpen(false);
  };

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
        boxShadow: "0 -6px 20px rgba(26, 25, 22, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
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
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          <span>{expanded ? "▾" : "▴"}</span>
          <span>Menu</span>
        </button>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            className={`mz-follow ${expanded && activeTree === "workspace" ? "followed" : ""}`}
            onClick={() => openTree("workspace")}
          >
            Workspace
          </button>
          <button
            type="button"
            className={`mz-follow ${expanded && activeTree === "kasiCoin" ? "followed" : ""}`}
            onClick={() => openTree("kasiCoin")}
          >
            KASI Coin
          </button>
          <button
            type="button"
            className={`mz-follow ${expanded && activeTree === "groups" ? "followed" : ""}`}
            onClick={() => openTree("groups")}
          >
            Groups & Pages
          </button>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "4px 14px 14px",
            borderTop: "1px solid var(--line)",
          }}
        >
          {activeTree === "workspace" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                className={`mz-follow ${pathname === "/dashboard" ? "followed" : ""}`}
                style={{ justifyContent: "flex-start", padding: "8px 10px", fontSize: 11 }}
                onClick={() => {
                  setExpanded(false);
                  router.push("/dashboard");
                }}
              >
                Feed
              </button>
              <button
                type="button"
                  className={pathname === "/friends" ? "active" : ""}
                  onClick={() => router.push("/friends")}
                >
                  Friends & Members
                </button>
                <button
                  type="button"
                  className={pathname === "/messages" ? "active" : ""}
                  onClick={() => router.push("/messages")}
                >
                  Messages
                </button>
                <button
                  type="button"
                  className={savedOnly ? "active" : ""}
                  onClick={() => {
                    setSavedOnly((prev) => !prev);
                    if (pathname !== "/dashboard") router.push("/dashboard");
                  }}
                >
                  Saved
                </button>
                <button
                  type="button"
                  className={pathname === "/profile" ? "active" : ""}
                  onClick={() => router.push("/profile")}
                >
                  Profile
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
                  Wallet {walletAddress ? `(${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)})` : "· Connect"}
                </button>
                <button
                  type="button"
                  className="mz-action"
                  style={{ padding: "7px 8px", textAlign: "left", justifyContent: "flex-start" }}
                  onClick={handleTriggerClaim}
                >
                  Claim Rewards
                </button>
                <button
                  type="button"
                  className="mz-action"
                  style={{ padding: "7px 8px", textAlign: "left", justifyContent: "flex-start" }}
                  onClick={() => setTipOpen((prev) => !prev)}
                >
                  Send KASI Tip {tipOpen ? "▴" : "▾"}
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
                      placeholder="0x… or member"
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
                        Send
                      </button>
                    </div>
                  </form>
                )}

                <div className="mz-tiny mz-muted" style={{ padding: "2px 8px" }}>
                  Status: {claimStatus}
                </div>
              </div>
            )}
          </div>

          {spaces.length > 0 && (
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
                      {sp.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  placeholder="Search…"
                />
              </label>
            )}
            <Link href="/profile" className={`mz-avatar small ${currentUser.avatarColor ?? ""}`}>
              {currentUser.initials}
            </Link>
          </div>
        </header>

        {notice && (
          <div role="status" style={{ padding: "8px 20px", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
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
              <span style={{ fontSize: 24, color: "var(--orange)" }} aria-hidden="true">
                ☼
              </span>
            </div>

            {children}

            {showFeed && (
              <>
                <section className="mz-banner">
                  <div className="mz-label" style={{ color: "var(--green)" }}>
                    KASI Coin · Celo
                  </div>
                  <h2>Less scrolling. More belonging.</h2>
                  <p className="mz-tiny mz-muted">
                    Share updates, connect with members, and claim KASI Coin rewards on Celo.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button type="button" className="mz-primary" onClick={handleTriggerClaim}>
                      Claim KASI Coin →
                    </button>
                    <button
                      type="button"
                      className="mz-follow"
                      style={{ background: "var(--white)", fontSize: 11 }}
                      onClick={handleConnectWalletInfo}
                    >
                      {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Connect Wallet"}
                    </button>
                  </div>
                </section>

                {onCreatePost && (
                  <form className="mz-composer" onSubmit={handlePostSubmit}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
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
                        Post →
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
                      No posts yet.
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
                              placeholder="Write a reply…"
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
                  <h2>Members</h2>
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

      <SwipeUpTaskbar
        spaces={spaces}
        selectedSpace={selectedSpace}
        onSelectSpace={(sp) => setSelectedSpace(sp)}
        onConnectWallet={handleConnectWalletInfo}
        onClaimReward={handleTriggerClaim}
        onSendTip={handleSendTipAmount}
        walletAddress={walletAddress}
        claimStatus={claimStatus}
      />
    </div>
  );
};
