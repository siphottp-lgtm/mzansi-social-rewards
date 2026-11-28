"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const WATERMARK_IMAGES = {
  image1: "/images/jacinta.jpg",
  image2: "/images/child.jpg",
  image3: "/images/lawyer.jpg",
} as const;

export type WatermarkKey = keyof typeof WATERMARK_IMAGES;

export interface MzansiUser {
  id?: string | number;
  userId?: string | number;
  name?: string;
  fullName?: string;
  displayName?: string;
  handle?: string;
  email?: string;
  role?: string;
  avatar?: string;
  initials?: string;
  color?: string;
  avatarColor?: string;
  following?: boolean;
  [key: string]: unknown;
}

export interface MzansiPostComment {
  id?: string | number;
  author?: string;
  text: string;
  createdAt?: string;
}

export interface MzansiPost {
  id: string | number;
  title?: string;
  body?: string;
  content?: string;
  text?: string;
  name?: string;
  author?: string;
  authorId?: string | number;
  handle?: string;
  initials?: string;
  color?: string;
  time?: string;
  space?: string;
  createdAt?: string;
  following?: boolean;
  likes?: number;
  liked?: boolean;
  saved?: boolean;
  comments?: number | MzansiPostComment[];
  replies?: MzansiPostComment[];
  image?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface MzansiSpace {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

export interface SuggestedMember {
  id: string;
  name: string;
  role?: string;
  initials?: string;
  color?: string;
  following?: boolean;
}

export interface SwipeUpTaskbarProps {
  spaces?: MzansiSpace[];
  selectedSpace?: string;
  onSelectSpace?: (space: string) => void;
  onConnectWallet?: () => void;
  onClaimReward?: () => void;
  onSendTip?: (amount?: number) => void;
  walletAddress?: string;
  claimStatus?: string;
}

export interface CommonUpgradeProps {
  children?: React.ReactNode;
  watermarkKey?: WatermarkKey;
  activeNav?: string;
  currentUser?: MzansiUser | null;
  posts?: MzansiPost[];
  onCreatePost?: (payload: {
    title?: string;
    body?: string;
    text?: string;
    space?: string;
    image?: string;
    imageUrl?: string;
  }) => Promise<void> | void;
  onToggleLike?: (postId: string | number) => Promise<void> | void;
  onToggleSave?: (postId: string | number) => Promise<void> | void;
  onAddComment?: (postId: string | number, text: string) => Promise<void> | void;
  onDeletePost?: (postId: string | number) => Promise<void> | void;
  onEditPost?: (postId: string | number, body: string) => Promise<void> | void;
  spaces?: MzansiSpace[];
  selectedSpace?: string;
  onSelectSpace?: (space: string) => void;
  suggestedMembers?: SuggestedMember[];
  onToggleFollow?: (memberId: string) => void;
  walletAddress?: string;
  claimStatus?: string;
  onConnectWallet?: () => void;
  onClaimReward?: () => void;
  onSendTip?: (amount?: number) => void;
  showFeed?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const WatermarkBackdrop: React.FC<{ imageKey?: WatermarkKey }> = ({ imageKey = "image1" }) => {
  const src = WATERMARK_IMAGES[imageKey] || WATERMARK_IMAGES.image1;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: `url("${src}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: 0.24,
      }}
    />
  );
};

export const MzansiBrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <Link
    href="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      textDecoration: "none",
      color: "#0b0f14",
      fontWeight: 800,
      fontSize: compact ? 15 : 18,
      letterSpacing: "-0.02em",
    }}
  >
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: compact ? 26 : 32,
        height: compact ? 26 : 32,
        borderRadius: 8,
        background: "linear-gradient(135deg, #007749 0%, #ffb81c 55%, #de3831 100%)",
        color: "#ffffff",
        fontSize: compact ? 12 : 14,
        fontWeight: 900,
        border: "1px solid #000000",
      }}
    >
      🇿🇦
    </span>
    <span>
      mzansi<span style={{ color: "#007749" }}>.</span>
    </span>
  </Link>
);

export const SwipeUpTaskbar: React.FC<SwipeUpTaskbarProps> = ({
  spaces = [],
  selectedSpace = "All",
  onSelectSpace,
  onConnectWallet,
  onClaimReward,
  onSendTip,
  walletAddress = "",
  claimStatus = "Ready",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 36,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {open && (
        <div
          className="mz-glass-card"
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 640,
            marginBottom: 8,
            borderRadius: 14,
            padding: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="mz-label" style={{ color: "#007749" }}>
              Mzansi Quick Bar · {claimStatus}
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="mz-follow" onClick={() => setOpen(false)}>
                Feed
              </Link>
              <Link href="/friends" className="mz-follow" onClick={() => setOpen(false)}>
                Friends
              </Link>
              <Link href="/messages" className="mz-follow" onClick={() => setOpen(false)}>
                Messages
              </Link>
              <Link href="/profile" className="mz-follow" onClick={() => setOpen(false)}>
                Profile
              </Link>
            </div>
          </div>

          {spaces.length > 0 && onSelectSpace && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className={selectedSpace === "All" ? "mz-primary" : "mz-follow"}
                onClick={() => onSelectSpace("All")}
              >
                All Spaces
              </button>
              {spaces.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  className={selectedSpace === sp.name ? "mz-primary" : "mz-follow"}
                  onClick={() => onSelectSpace(sp.name)}
                >
                  {sp.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {onConnectWallet && (
              <button type="button" className="mz-follow" onClick={onConnectWallet}>
                {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Connect Wallet"}
              </button>
            )}
            {onClaimReward && (
              <button type="button" className="mz-primary" onClick={onClaimReward}>
                Claim KASI
              </button>
            )}
            {onSendTip && (
              <button type="button" className="mz-follow" onClick={() => onSendTip(5)}>
                Tip 5 KASI
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          pointerEvents: "auto",
          padding: "5px 14px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          background: "rgba(255, 255, 255, 0.84)",
          backdropFilter: "blur(8px)",
          color: "#0b0f14",
          border: "1px solid rgba(0, 119, 73, 0.45)",
          cursor: "pointer",
        }}
      >
        {open ? "▾ Hide Taskbar" : "▴ Taskbar"}
      </button>
    </div>
  );
};

export const CommonUpgrade: React.FC<CommonUpgradeProps> = ({
  children,
  watermarkKey = "image1",
  activeNav = "feed",
  currentUser = null,
  posts = [],
  onCreatePost,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onDeletePost,
  onEditPost,
  spaces = [],
  selectedSpace = "All",
  onSelectSpace,
  suggestedMembers = [],
  onToggleFollow,
  walletAddress = "",
  claimStatus = "Ready",
  onConnectWallet,
  onClaimReward,
  onSendTip,
  showFeed = false,
  pageTitle,
  pageSubtitle,
}) => {
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState<MzansiPost[]>(posts);
  const [draftText, setDraftText] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [longPressPost, setLongPressPost] = useState<MzansiPost | null>(null);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState("");
  const pressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? "" : prev));
    }, 2400);
  };

  const startLongPress = (postItem: MzansiPost) => {
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      setLongPressPost(postItem);
    }, 500);
  };

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleSharePost = async (postItem: MzansiPost) => { const shareText = postItem.text || postItem.body || postItem.content || postItem.title || "Mzansi post";
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "Mzansi • Freedom Chatter", text: shareText, url: shareUrl });
        showToast("Post shared.");
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
        showToast("Post link copied.");
        return;
      }
    } catch {
      // Ignore user share cancellation
    }
    showToast("Ready to share.");
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draftText.trim();
    if (!text) return;

    if (editingPostId) {
      setLocalPosts((prev) =>
        prev.map((p) => (p.id === editingPostId ? { ...p, body: text, content: text } : p))
      );
      if (onEditPost) await onEditPost(editingPostId, text);
      setEditingPostId(null);
      setDraftText("");
      showToast("Post updated.");
      return;
    }

    if (onCreatePost) { await onCreatePost({ body: text, text, space: selectedSpace === "All" ? undefined : selectedSpace }); } else {
      const authorName =
        currentUser?.fullName || currentUser?.displayName || currentUser?.name || "Mzansi Member";
      setLocalPosts((prev) => [
        {
          id: `local-${Date.now()}`,
          author: authorName,
          handle: currentUser?.handle || "@mzansi",
          body: text,
          createdAt: "Just now",
          likes: 0,
          comments: [],
        },
        ...prev,
      ]);
    }
    setDraftText("");
    showToast("Post published.");
  };

  const handleLike = async (postId: string | number) => {
    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.liked;
        const nextLikes = Math.max(0, (p.likes || 0) + (nextLiked ? 1 : -1));
        return { ...p, liked: nextLiked, likes: nextLikes };
      })
    );
    if (onToggleLike) await onToggleLike(postId);
  };

  const handleSave = async (postId: string | number) => {
    setLocalPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
    if (onToggleSave) await onToggleSave(postId);
    showToast("Saved status updated.");
  };

  const handleDelete = async (postId: string | number) => {
    setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
    if (onDeletePost) await onDeletePost(postId);
    showToast("Post deleted.");
  };

  const handleBlockAuthor = (postItem: MzansiPost) => {
    const key = String(postItem.authorId || postItem.author || "");
    if (!key) return;
    setBlockedAuthors((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setLocalPosts((prev) => prev.filter((p) => String(p.authorId || p.author || "") !== key));
    showToast(`Blocked ${postItem.author || "member"}.`);
  };

  const handleCommentSubmit = async (postId: string | number, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentDrafts[String(postId)] || "").trim();
    if (!text) return;
    const authorName = currentUser?.fullName || currentUser?.name || "Member";
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: Array.isArray(p.comments) ? [...p.comments, { id: `c-${Date.now()}`, author: authorName, text }] : p.comments,
            }
          : p
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [String(postId)]: "" }));
    if (onAddComment) await onAddComment(postId, text);
  };

  const visiblePosts = localPosts.filter((p) => {
    const authorKey = String(p.authorId || p.author || "");
    if (authorKey && blockedAuthors.includes(authorKey)) return false;
    if (selectedSpace && selectedSpace !== "All" && p.space && p.space !== selectedSpace) return false;
    return true;
  });

  const navItems = [
    { key: "feed", label: "Feed", href: "/dashboard" },
    { key: "friends", label: "Friends", href: "/friends" },
    { key: "messages", label: "Messages", href: "/messages" },
    { key: "profile", label: "Profile", href: "/profile" },
  ];

  return (
    <div
      className="mz-common-app"
      style={{
        gridTemplateColumns: "1fr",
        position: "relative",
        minHeight: "100vh",
        paddingBottom: 96,
        background: "transparent",
      }}
    >
      <WatermarkBackdrop imageKey={watermarkKey} />

      <div
        className="mz-content"
        style={{
          maxWidth: 960,
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="mz-flag-strip" />
        <header
          className="mz-topbar"
          style={{
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <MzansiBrandMark compact />

          <nav aria-label="Primary sections" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={activeNav === item.key ? "mz-primary" : "mz-follow"}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mz-top-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {currentUser ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#007749" }}>
                {currentUser.fullName || currentUser.name || currentUser.handle || "Member"}
              </span>
            ) : (
              <button
                type="button"
                className="mz-follow"
                style={{ fontSize: 12 }}
                onClick={() => router.push("/login")}
              >
                Log in
              </button>
            )}
          </div>
        </header>

        <main style={{ padding: "24px 16px 48px", display: "grid", gap: 16 }}>
          {toastMsg && (
            <div
              role="status"
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.86)",
                border: "1px solid #007749",
                fontSize: 12,
                fontWeight: 700,
                color: "#005c38",
              }}
            >
              {toastMsg}
            </div>
          )}

          {(pageTitle || pageSubtitle) && (
            <section className="mz-banner" style={{ padding: "18px 20px", borderRadius: 14 }}>
              {pageTitle && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{pageTitle}</h1>}
              {pageSubtitle && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(11, 15, 20, 0.78)" }}>{pageSubtitle}</p>
              )}
            </section>
          )}

          {showFeed && (
            <>
              <form
                onSubmit={handlePostSubmit}
                className="mz-composer"
                style={{ padding: 14, borderRadius: 14, display: "grid", gap: 10 }}
              >
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder={editingPostId ? "Edit your post..." : "Share something with Mzansi..."}
                  rows={3}
                  className="mz-transparent-input"
                  style={{ width: "100%", borderRadius: 10, padding: 10, fontSize: 13, resize: "vertical" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(11, 15, 20, 0.72)" }}>
                    Touch and hold any post on mobile for tree options
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {editingPostId && (
                      <button
                        type="button"
                        className="mz-follow"
                        onClick={() => {
                          setEditingPostId(null);
                          setDraftText("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="mz-primary">
                      {editingPostId ? "Save Edit" : "Post"}
                    </button>
                  </div>
                </div>
              </form>

              <div style={{ display: "grid", gap: 12 }}>
                {visiblePosts.map((post) => {
                  const postBody = post.text || post.body || post.content || "";
                  return (
                    <article
                      key={post.id}
                      className="mz-post"
                      style={{ padding: 16, borderRadius: 14, display: "grid", gap: 10 }}
                      onTouchStart={() => startLongPress(post)}
                      onTouchEnd={cancelLongPress}
                      onTouchMove={cancelLongPress}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setLongPressPost(post);
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span
    aria-hidden="true"
    style={{
      width: 34,
      height: 34,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 800,
      color: "#ffffff",
      background:
        post.color === "green"
          ? "#007749"
          : post.color === "pink"
          ? "#de3831"
          : post.color === "blue"
          ? "#001489"
          : "#ffb81c",
      border: "1px solid #0b0f14",
      flexShrink: 0,
    }}
  >
    {post.initials ||
      String(post.author || "MZ")
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
  </span>
  <div>
    <strong style={{ fontSize: 13 }}>{post.author || "Mzansi Member"}</strong>
    {post.handle && (
      <span style={{ marginLeft: 6, fontSize: 11, color: "rgba(11, 15, 20, 0.65)" }}>
        {post.handle}
      </span>
    )}
  </div>
</div>                        <span style={{ fontSize: 11, color: "rgba(11, 15, 20, 0.65)" }}>{post.createdAt || ""}</span>
                      </div>

                      {post.title && <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{post.title}</h2>}
                      {postBody && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{postBody}</p>}

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
                        <button type="button" className="mz-follow" onClick={() => void handleLike(post.id)}>
                          {post.liked ? "♥ Liked" : "♡ Like"} ({post.likes || 0})
                        </button>
                        <button type="button" className="mz-follow" onClick={() => void handleSave(post.id)}>
                          {post.saved ? "★ Saved" : "☆ Save"}
                        </button>
                        <button type="button" className="mz-follow" onClick={() => void handleSharePost(post)}>
                          ↗ Share
                        </button>
<button
  type="button"
  className="mz-follow"
  aria-label="Post options"
  onClick={() => setLongPressPost(post)}
>
  •••
</button>
                      </div>

                      <form
                        onSubmit={(e) => void handleCommentSubmit(post.id, e)}
                        style={{ display: "flex", gap: 8 }}
                      >
                        <input
                          type="text"
                          value={commentDrafts[String(post.id)] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({ ...prev, [String(post.id)]: e.target.value }))
                          }
                          placeholder="Write a reply..."
                          className="mz-transparent-input"
                          style={{ flex: 1, borderRadius: 8, padding: "6px 10px", fontSize: 12 }}
                        />
                        <button type="submit" className="mz-follow">
                          Reply
                        </button>
                      </form>

                      {Array.isArray(post.comments) && post.comments.length > 0 && (
                        <div style={{ display: "grid", gap: 4, paddingLeft: 10, borderLeft: "2px solid #007749" }}>
                          {post.comments.map((c, idx) => (
                            <div key={c.id || idx} style={{ fontSize: 12 }}>
                              <strong>{c.author || "Member"}: </strong>
                              <span>{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {suggestedMembers.length > 0 && onToggleFollow && (
            <section className="mz-glass-card" style={{ padding: 14, borderRadius: 14, display: "grid", gap: 8 }}>
              <div className="mz-label" style={{ color: "#007749" }}>
                Suggested Members
              </div>
              {suggestedMembers.map((member) => (
                <div
                  key={member.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
                >
                  <div>
                    <strong style={{ fontSize: 12 }}>{member.name}</strong>
                    {member.role && (
                      <div style={{ fontSize: 11, color: "rgba(11, 15, 20, 0.68)" }}>{member.role}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={member.following ? "mz-follow followed" : "mz-follow"}
                    onClick={() => onToggleFollow(member.id)}
                  >
                    {member.following ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </section>
          )}

          {children}
        </main>
      </div>

      {longPressPost && (
        <div
          role="dialog"
          aria-label="Post tree options"
          onClick={() => setLongPressPost(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 320,
              borderRadius: 14,
              padding: 16,
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid #007749",
              boxShadow: "0 14px 36px rgba(0, 0, 0, 0.24)",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mz-label" style={{ color: "#007749" }}>
                🌳 Post Options Tree
              </span>
              <button
                type="button"
                className="mz-follow"
                style={{ padding: "2px 8px", fontSize: 11 }}
                onClick={() => setLongPressPost(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 6, paddingLeft: 10, borderLeft: "2px solid #007749" }}>
              <button
                type="button"
                className="mz-follow"
                style={{ justifyContent: "flex-start" }}
                onClick={() => {
                  void handleSharePost(longPressPost);
                  setLongPressPost(null);
                }}
              >
                ├─ ↗ Share Post
              </button>
              <button
                type="button"
                className="mz-follow"
                style={{ justifyContent: "flex-start" }}
                onClick={() => {
                  void handleSave(longPressPost.id);
                  setLongPressPost(null);
                }}
              >
                ├─ ★ Save Post
              </button>
              <button
                type="button"
                className="mz-follow"
                style={{ justifyContent: "flex-start" }}
                onClick={() => {
                  setEditingPostId(String(longPressPost.id));
                  setDraftText(longPressPost.text || longPressPost.body || longPressPost.content || "");
                  setLongPressPost(null);
                }}
              >
                ├─ ✎ Edit Post
              </button>
              <button
                type="button"
                className="mz-follow"
                style={{ justifyContent: "flex-start", color: "#991b1b" }}
                onClick={() => {
                  void handleDelete(longPressPost.id);
                  setLongPressPost(null);
                }}
              >
                ├─ 🗑 Delete Post
              </button>
              <button
                type="button"
                className="mz-follow"
                style={{ justifyContent: "flex-start", color: "#991b1b" }}
                onClick={() => {
                  handleBlockAuthor(longPressPost);
                  setLongPressPost(null);
                }}
              >
                └─ 🚫 Block Member
              </button>
            </div>
          </div>
        </div>
      )}

      <SwipeUpTaskbar
        spaces={spaces}
        selectedSpace={selectedSpace}
        onSelectSpace={onSelectSpace}
        onConnectWallet={onConnectWallet}
        onClaimReward={onClaimReward}
        onSendTip={onSendTip}
        walletAddress={walletAddress}
        claimStatus={claimStatus}
      />

      <div className="mz-flag-marquee" role="region" aria-label="Community Banner">
        <div className="mz-flag-marquee-track">
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
          <span>★ Together We Can Do It • Mzansi Community Network</span>
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
        </div>
      </div>
    </div>
  );
};


