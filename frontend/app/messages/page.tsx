"use client";

import React, { useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function MessagesPage() {
  const [user, setUser] = useState<MzansiUser>({
    id: "me",
    name: "Member",
    handle: "@member",
    initials: "MZ",
    avatarColor: "green",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_URL}/users/me`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name || data?.email) {
          const displayName = String(data.name || data.email);
          setUser({
            id: String(data.id || "me"),
            name: displayName,
            handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
            initials: displayName.slice(0, 2).toUpperCase(),
            avatarColor: "green",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Messages"
      pageSubtitle="Direct conversations across your community."
    >
      <div className="mz-post">
        <p className="mz-post-text" style={{ margin: 0 }}>
          Connect with members from your Friends & Members list to start a conversation.
        </p>
      </div>
    </CommonUpgrade>
  );
}
