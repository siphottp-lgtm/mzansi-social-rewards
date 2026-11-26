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

    fetch(`${API_URL}/users`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedMembers: SuggestedMember[] = data
            .slice(0, 5)
            .map((u: Record<string, unknown>, idx: number) => {
              const memberName = String(u.name || u.email || `Member ${idx + 1}`);
              return {
                id: String(u.id || idx),
                name: memberName,
                role: String(u.role || "Community Member"),
                initials: memberName.slice(0, 2).toUpperCase(),
                color: "green",
                following: false,
              };
            });
          setSuggestions(mappedMembers);
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/posts`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: MzansiPost[] = data.map((p: Record<string, unknown>, idx: number) => {
            const authorObj = p.author as { name?: string } | undefined;
            const authorName = authorObj?.name || String(p.authorName || "Member");
            return {
              id: (p.id as string | number) || idx + 1,
              name: authorName,
              initials: authorName.slice(0, 2).toUpperCase(),
              color: "green",
              time: "Recently",
              space: String(p.space || "Kasi Builders"),
              following: true,
              text: String(p.content || p.text || ""),
              likes: Number(p.likesCount || 0),
              comments: 0,
            };
          });
          setPosts(mapped);
        }
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

  const handleToggleFollow = (memberId: string) => {
    setSuggestions((prev) => prev.map((m) => (m.id === memberId ? { ...m, following: !m.following } : m)));
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
    <CommonUpgrade
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
