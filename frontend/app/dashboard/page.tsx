"use client";

import React, { useEffect, useState } from "react";
import {
  CommonUpgrade,
  type MzansiPost,
  type MzansiSpace,
  type MzansiUser,
  type SuggestedMember,
} from "../../components/CommonUpgrade";
import { claimKasicTaskReward } from "../../lib/celoRewards";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiUser {
  id: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  handle?: string;
  role?: string;
}

interface ApiComment {
  id?: string | number;
  content?: string;
  text?: string;
  author?: ApiUser;
  user?: ApiUser;
}

interface ApiPost {
  id: string | number;
  content?: string;
  text?: string;
  imageUrl?: string;
  image?: string;
  createdAt?: string;
  space?: string;
  likesCount?: number;
  likes?: number;
  likedByMe?: boolean;
  liked?: boolean;
  savedByMe?: boolean;
  saved?: boolean;
  followingAuthor?: boolean;
  author?: ApiUser;
  user?: ApiUser;
  comments?: ApiComment[];
}

interface ApiGroupOrPage {
  id: string | number;
  name?: string;
  title?: string;
  kind?: "group" | "page";
}

function formatName(u?: ApiUser): string {
  if (!u) return "Mzansi Member";
  if (u.name && u.name.trim()) return u.name.trim();
  const full = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  if (full) return full;
  if (u.email) return u.email.split("@")[0];
  return "Mzansi Member";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MZ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<MzansiUser>({
    id: "me",
    name: "Mzansi Member",
    handle: "@mzansi",
    initials: "MZ",
    avatarColor: "green",
    unreadMessages: 0,
  });
  const [posts, setPosts] = useState<MzansiPost[]>([]);
  const [spaces, setSpaces] = useState<MzansiSpace[]>([]);
  const [suggestedMembers, setSuggestedMembers] = useState<SuggestedMember[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>("");

  const getHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const mapPost = (p: ApiPost, idx: number): MzansiPost => {
    const author = p.author ?? p.user;
    const name = formatName(author);
    const colors: Array<"" | "green" | "pink" | "blue"> = ["green", "pink", "blue", ""];
    const replies = Array.isArray(p.comments)
      ? p.comments.map((c) => ({
          author: formatName(c.author ?? c.user),
          text: String(c.content ?? c.text ?? ""),
        }))
      : [];

    return {
      id: p.id ?? idx + 1,
      name,
      initials: getInitials(name),
      color: colors[idx % colors.length],
      time: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-ZA") : "Recently",
      space: String(p.space || "Community"),
      following: Boolean(p.followingAuthor),
      text: String(p.content ?? p.text ?? ""),
      likes: Number(p.likesCount ?? p.likes ?? 0),
      liked: Boolean(p.likedByMe ?? p.liked),
      saved: Boolean(p.savedByMe ?? p.saved),
      comments: replies.length,
      replies,
      image: p.imageUrl || p.image || undefined,
    };
  };

  useEffect(() => {
    if (!API_URL) return;
    const headers = getHeaders();

    fetch(`${API_URL}/users/me`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: ApiUser | null) => {
        if (!me) return;
        const name = formatName(me);
        setCurrentUser((prev) => ({
          ...prev,
          id: String(me.id ?? "me"),
          name,
          handle: me.handle ? `@${me.handle.replace(/^@/, "")}` : `@${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "member"}`,
          initials: getInitials(name),
        }));
      })
      .catch(() => {});

    fetch(`${API_URL}/posts`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ApiPost[] | { items?: ApiPost[]; data?: ApiPost[] }) => {
        const list = Array.isArray(data) ? data : data.items ?? data.data ?? [];
        setPosts(list.map(mapPost));
      })
      .catch(() => {});

    fetch(`${API_URL}/users/directory`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ApiUser[] | { items?: ApiUser[]; data?: ApiUser[] }) => {
        const list = Array.isArray(data) ? data : data.items ?? data.data ?? [];
        const colors: Array<"" | "green" | "pink" | "blue"> = ["green", "pink", "blue", ""];
        setSuggestedMembers(
          list.slice(0, 6).map((u, idx) => {
            const name = formatName(u);
            return {
              id: String(u.id ?? idx + 1),
              name,
              role: u.role || "Community member",
              initials: getInitials(name),
              color: colors[idx % colors.length],
              following: false,
            };
          })
        );
      })
      .catch(() => {});

    Promise.all([
      fetch(`${API_URL}/groups`, { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(`${API_URL}/pages`, { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([groupsRes, pagesRes]) => {
      const groups = Array.isArray(groupsRes) ? groupsRes : groupsRes?.items ?? groupsRes?.data ?? [];
      const pages = Array.isArray(pagesRes) ? pagesRes : pagesRes?.items ?? pagesRes?.data ?? [];
      const combined: MzansiSpace[] = [
        ...groups.map((g: ApiGroupOrPage, i: number) => ({
          id: `group-${g.id ?? i}`,
          name: String(g.name || g.title || `Group ${i + 1}`),
          icon: "👥",
          badgeBg: "var(--green-lt)",
        })),
        ...pages.map((p: ApiGroupOrPage, i: number) => ({
          id: `page-${p.id ?? i}`,
          name: String(p.name || p.title || `Page ${i + 1}`),
          icon: "📄",
          badgeBg: "var(--orange-lt)",
        })),
      ];
      setSpaces(combined);
    });
  }, []);

  const handleCreatePost = async (payload: { text: string; space: string; image?: string }) => {
    if (API_URL) {
      try {
        const res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            content: payload.text,
            space: payload.space,
            imageUrl: payload.image,
          }),
        });
        if (res.ok) {
          const created: ApiPost = await res.json();
          setPosts((prev) => [mapPost({ ...created, author: created.author ?? currentUser }, 0), ...prev]);
          return;
        }
      } catch {
        // Fall back to optimistic entry below
      }
    }

    setPosts((prev) => [
      {
        id: Date.now(),
        name: currentUser.name,
        initials: currentUser.initials,
        color: currentUser.avatarColor,
        time: "Just now",
        space: payload.space,
        following: true,
        text: payload.text,
        likes: 0,
        liked: false,
        saved: false,
        comments: 0,
        replies: [],
        image: payload.image,
      },
      ...prev,
    ]);
  };

  const handleToggleLike = async (postId: string | number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.liked;
        return { ...p, liked: nextLiked, likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)) };
      })
    );
    if (API_URL) {
      await fetch(`${API_URL}/posts/${postId}/like`, { method: "POST", headers: getHeaders() }).catch(() => {});
    }
  };

  const handleToggleSave = async (postId: string | number) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
    if (API_URL) {
      await fetch(`${API_URL}/posts/${postId}/save`, { method: "POST", headers: getHeaders() }).catch(() => {});
    }
  };

  const handleAddComment = async (postId: string | number, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments + 1,
              replies: [...(p.replies ?? []), { author: currentUser.name, text }],
            }
          : p
      )
    );
    if (API_URL) {
      await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content: text }),
      }).catch(() => {});
    }
  };

  const handleToggleFollow = async (memberId: string) => {
    setSuggestedMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, following: !m.following } : m))
    );
    if (API_URL) {
      await fetch(`${API_URL}/friends/request/${memberId}`, { method: "POST", headers: getHeaders() }).catch(() => {});
    }
  };

  const handleClaimReward = async () => {
    try {
      const txHash = await claimKasicTaskReward("daily-community-reward");
      setStatusBanner(`KASI Coin reward claimed on Celo! Tx: ${txHash}`);
    } catch (err: unknown) {
      setStatusBanner(err instanceof Error ? err.message : "Connect Celo wallet to claim KASI Coin.");
    }
  };

  return (
    <CommonUpgrade
      currentUser={currentUser}
      posts={posts}
      spaces={spaces}
      suggestedMembers={suggestedMembers}
      showFeed={true}
      watermarkKey="image1"
      onCreatePost={handleCreatePost}
      onToggleLike={handleToggleLike}
      onToggleSave={handleToggleSave}
      onAddComment={handleAddComment}
      onToggleFollow={handleToggleFollow}
      onClaimReward={handleClaimReward}
    >
      {statusBanner && (
        <div className="mz-post" role="status" style={{ color: "var(--green)", fontWeight: 600 }}>
          {statusBanner}
        </div>
      )}
    </CommonUpgrade>
  );
}

