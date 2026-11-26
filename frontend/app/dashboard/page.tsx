"use client";

import React, { useEffect, useState } from "react";
import { CommonUpgrade, type MzansiPost, type MzansiSpace, type MzansiUser, type SuggestedMember } from "../../components/CommonUpgrade";
import { claimKasicTaskReward } from "../../lib/celoRewards";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DEFAULT_SPACES: MzansiSpace[] = [
  { id: "kasi-builders", name: "Kasi Builders", icon: "✺" },
  { id: "local-merchants", name: "Local Merchants", icon: "↟", badgeBg: "#eadfcd" },
  { id: "celo-rewards", name: "KASI Coin Hub", icon: "〰", badgeBg: "#e9dbd7" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<MzansiUser>({
    id: "member",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });
  const [posts, setPosts] = useState<MzansiPost[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedMember[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_URL}/users/me`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name || data?.email) {
          const displayName = data.name || data.email.split("@")[0];
          const initials = displayName.slice(0, 2).toUpperCase();
          setUser({
            id: data.id || "me",
            name: displayName,
            handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
            initials,
            avatarColor: "green",
          });
        }
      })
      .catch(() => {});

    const friendNames = new Set<string>();
    const friendIds = new Set<string>();

    fetch(`${API_URL}/friends`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const rawFriends = Array.isArray(data)
          ? data
          : Array.isArray(data?.friends)
          ? data.friends
          : [];
        rawFriends.forEach((f: Record<string, unknown>) => {
          const person = (f.friend || f.user || f) as Record<string, unknown>;
          if (person?.id) friendIds.add(String(person.id));
          if (person?.name) friendNames.add(String(person.name).toLowerCase());
        });
      })
      .catch(() => {});

    fetch(`${API_URL}/users/directory`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.members)
          ? data.members
          : [];
        const mappedMembers: SuggestedMember[] = list
          .slice(0, 5)
          .map((u: Record<string, unknown>, idx: number) => {
            const memberName = String(u.name || u.displayName || u.email || `Member ${idx + 1}`);
            const memberId = String(u.id || idx);
            return {
              id: memberId,
              name: memberName,
              role: String(u.role || "Community Member"),
              initials: memberName.slice(0, 2).toUpperCase(),
              color: "green",
              following: friendIds.has(memberId) || friendNames.has(memberName.toLowerCase()),
            };
          });
        setSuggestions(mappedMembers);
      })
      .catch(() => {});

    fetch(`${API_URL}/posts`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.posts)
          ? data.posts
          : [];
        const mapped: MzansiPost[] = list.map((p: Record<string, unknown>, idx: number) => {
          const authorObj = p.author as { id?: string; name?: string } | undefined;
          const authorName = authorObj?.name || String(p.authorName || "Member");
          const authorId = authorObj?.id ? String(authorObj.id) : "";
          const isFriend =
            (authorId && friendIds.has(authorId)) || friendNames.has(authorName.toLowerCase());
          return {
            id: (p.id as string | number) || idx + 1,
            name: authorName,
            initials: authorName.slice(0, 2).toUpperCase(),
            color: "green",
            time: p.createdAt ? new Date(String(p.createdAt)).toLocaleDateString("en-ZA") : "Recently",
            space: String(p.space || p.communityName || "Kasi Builders"),
            following: isFriend,
            text: String(p.content || p.text || p.body || ""),
            likes: Number(p.likesCount ?? p.likes ?? 0),
            comments: Number(p.commentsCount ?? p.comments ?? 0),
          };
        });
        setPosts(mapped);
      })
      .catch(() => {});
  }, []);

  const handleCreatePost = async (payload: { text: string; space: string; image?: string }) => {
    const newPost: MzansiPost = {
      id: Date.now(),
      name: user.name,
      initials: user.initials,
      color: user.avatarColor,
      time: "Just now",
      space: payload.space,
      following: true,
      text: payload.text,
      likes: 0,
      comments: 0,
      image: payload.image,
    };
    setPosts((prev) => [newPost, ...prev]);

    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: payload.text }),
      }).catch(() => {});
    }
  };

  const handleToggleLike = (postId: string | number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (!p.liked ? 1 : -1) } : p))
    );
  };

  const handleToggleSave = (postId: string | number) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
  };

  const handleAddComment = (postId: string | number, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments + 1, replies: [...(p.replies ?? []), { author: user.name, text }] }
          : p
      )
    );
  };

  const handleToggleFollow = async (memberId: string) => {
    setSuggestions((prev) => prev.map((m) => (m.id === memberId ? { ...m, following: !m.following } : m)));
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_URL}/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: memberId }),
      }).catch(() => {});
    }
  };

  const handleClaimReward = async () => {
    try {
      const txHash = await claimKasicTaskReward("daily-community-engagement");
      alert(`KASI Coin reward claimed on Celo! Tx: ${txHash}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Connect Celo wallet to claim KASI Coin.");
    }
  };

  return (
    <CommonUpgrade watermarkKey="image1"
      currentUser={user}
      posts={posts}
      spaces={DEFAULT_SPACES}
      suggestedMembers={suggestions}
      onCreatePost={handleCreatePost}
      onToggleLike={handleToggleLike}
      onToggleSave={handleToggleSave}
      onAddComment={handleAddComment}
      onToggleFollow={handleToggleFollow}
      onClaimReward={handleClaimReward}
    />
  );
}

