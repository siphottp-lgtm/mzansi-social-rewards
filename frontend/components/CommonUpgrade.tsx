"use client";

import React, { useMemo, useState } from "react";
import "../styles/common-upgrade.css";

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
posts: MzansiPost[];
spaces: MzansiSpace[];
suggestedMembers: SuggestedMember[];
onCreatePost: (payload: { text: string; space: string; image?: string }) => Promise<void> | void;
onToggleLike: (postId: string | number) => Promise<void> | void;
onToggleSave: (postId: string | number) => Promise<void> | void;
onAddComment: (postId: string | number, text: string) => Promise<void> | void;
onToggleFollow: (memberId: string) => Promise<void> | void;
onClaimReward?: () => Promise<void> | void;
}

export const CommonUpgrade: React.FC<CommonUpgradeProps> = ({
currentUser,
posts,
spaces,
suggestedMembers,
onCreatePost,
onToggleLike,
onToggleSave,
onAddComment,
onToggleFollow,
onClaimReward,
}) => {
const [activeNav, setActiveNav] = useState<"home" | "explore" | "messages" | "notifications" | "saved" | "communities">("home");
const [filter, setFilter] = useState<"all" | "following" | "latest">("all");
const [selectedSpace, setSelectedSpace] = useState<string>("");
const [searchQuery, setSearchQuery] = useState<string>("");
const [draftText, setDraftText] = useState<string>("");
const [draftImage, setDraftImage] = useState<string>("");
const [openReplyId, setOpenReplyId] = useState<string | number | null>(null);
const [replyText, setReplyText] = useState<string>("");
const [notice, setNotice] = useState<string>("");

const showNotice = (msg: string) => {
setNotice(msg);
window.setTimeout(() => setNotice(""), 3500);
};

const visiblePosts = useMemo(() => {
const q = searchQuery.trim().toLowerCase();
let list = posts.filter((p) => {
  if (activeNav === "saved" && !p.saved) return false;
  if (selectedSpace && p.space !== selectedSpace) return false;
  if (filter === "following" && !p.following) return false;
  if (!q) return true;
  return `${p.name} ${p.text} ${p.tag ?? ""} ${p.space}`.toLowerCase().includes(q);
});
if (filter === "latest") {
  list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
}
return list;
}, [posts, activeNav, selectedSpace, filter, searchQuery]);

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
if (!trimmed) return;
await onCreatePost({
  text: trimmed,
  space: selectedSpace || spaces[0]?.name || "Community",
  image: draftImage || undefined,
});
setDraftText("");
setDraftImage("");
showNotice("Shared with your Mzansi community (+KASIC Points logged).");
};

const todayLabel = new Date()
.toLocaleDateString("en-ZA", { weekday: "long", month: "long", day: "numeric" })
.toUpperCase();

return (
<div className="mz-common-app">
  <aside className="mz-sidebar" aria-label="Main navigation">
    <a
      href="#home"
      className="mz-brand"
      onClick={(e) => {
        e.preventDefault();
        setActiveNav("home");
        setSelectedSpace("");
      }}
    >
      <span className="mz-brand-mark">✳</span>mzansi
    </a>
    <p className="mz-tagline">A little closer · Powered by KASIC</p>
    <nav className="mz-nav">
      <button
        type="button"
        className={activeNav === "home" ? "active" : ""}
        onClick={() => {
          setActiveNav("home");
          setSelectedSpace("");
        }}
      >
        Home
      </button>
      <button
        type="button"
        className={activeNav === "explore" ? "active" : ""}
        onClick={() => setActiveNav("explore")}
      >
        Explore
      </button>
      <button
        type="button"
        className={activeNav === "saved" ? "active" : ""}
        onClick={() => setActiveNav("saved")}
      >
        Saved
      </button>
      <button
        type="button"
        className={activeNav === "communities" ? "active" : ""}
        onClick={() => setActiveNav("communities")}
      >
        Communities
      </button>
    </nav>

    <div className="mz-spaces">
      <div className="mz-label">Your little corners</div>
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

    <div className="mz-profile">
      <div className={`mz-avatar ${currentUser.avatarColor ?? ""}`}>{currentUser.initials}</div>
      <div>
        <strong>{currentUser.name}</strong>
        <div className="mz-tiny mz-muted">{currentUser.handle}</div>
      </div>
    </div>
  </aside>

  <div className="mz-content">
    <header className="mz-topbar">
      <div className="mz-breadcrumb">
        Your space <span>/ {selectedSpace || activeNav.toUpperCase()}</span>
      </div>
      <div className="mz-top-actions">
        <label className="mz-search">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mzansi…"
          />
        </label>
        <div className={`mz-avatar small ${currentUser.avatarColor ?? ""}`}>{currentUser.initials}</div>
      </div>
    </header>

    {notice && (
      <div role="status" style={{ padding: "10px 36px", fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
        {notice}
      </div>
    )}

    <main className="mz-workspace">
      <section className="mz-feed">
        <div className="mz-greeting">
          <div>
            <div className="mz-label">{todayLabel}</div>
            <h1>A good day to connect.</h1>
            <p className="mz-muted mz-tiny">Meaningful participation · Real local commerce on Celo.</p>
          </div>
          <span style={{ fontSize: 28, color: "var(--orange)" }} aria-hidden="true">
            ☼
          </span>
        </div>

        <section className="mz-banner">
          <div className="mz-label" style={{ color: "var(--green)" }}>
            KASIC Ecosystem · Celo Rewards
          </div>
          <h2>Less scrolling. More belonging.</h2>
          <p className="mz-tiny mz-muted">
            Earn Native KASI Coin & Reputation NFTs for constructive posts and supporting local merchants.
          </p>
          <button
            type="button"
            className="mz-primary"
            style={{ marginTop: 10 }}
            onClick={async () => {
              if (onClaimReward) {
                await onClaimReward();
              } else {
                showNotice("Connect Celo wallet to claim weekly KASIC rewards.");
              }
            }}
          >
            Claim KASIC Reward (Celo) →
          </button>
        </section>

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
                onClick={() => setDraftText((t) => `${t} Building Mzansi 🇿🇦`)}
              >
                Mzansi Pride
              </button>
            </div>
            <button className="mz-primary" type="submit">
              Share a thought →
            </button>
          </div>
        </form>

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
              Nothing here just yet. Try another filter or share the first thought.
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
                  <button
                    type="button"
                    className={`mz-action ${post.liked ? "active" : ""}`}
                    onClick={() => onToggleLike(post.id)}
                  >
                    ♥ {post.likes}
                  </button>
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
                  <button
                    type="button"
                    className={`mz-action mz-save ${post.saved ? "active" : ""}`}
                    onClick={() => onToggleSave(post.id)}
                  >
                    {post.saved ? "Saved" : "Save"}
                  </button>
                </div>

                {openReplyId === post.id && (
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
      </section>

      <aside className="mz-rail" aria-label="Community activity">
        <section className="mz-rail-section">
          <div className="mz-rail-heading">
            <h2>You might click</h2>
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
    </main>
  </div>
</div>
);
};
