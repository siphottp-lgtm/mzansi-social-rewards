"use client";

import React, { useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MemberItem {
  id: string;
  name: string;
  email?: string;
}

export default function FriendsPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
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

    fetch(`${API_URL}/users`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(
            data.map((m: Record<string, unknown>, idx: number) => ({
              id: String(m.id || idx),
              name: String(m.name || m.email || `Member ${idx + 1}`),
              email: m.email ? String(m.email) : undefined,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Friends & Members"
      pageSubtitle="Members connected to the Mzansi community."
    >
      {members.length === 0 ? (
        <div className="mz-post mz-muted">No members returned yet.</div>
      ) : (
        members.map((m) => (
          <div key={m.id} className="mz-post">
            <div className="mz-post-head">
              <div className="mz-avatar green">{m.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong style={{ fontSize: 13 }}>{m.name}</strong>
                {m.email && <div className="mz-tiny mz-muted">{m.email}</div>}
              </div>
            </div>
          </div>
        ))
      )}
    </CommonUpgrade>
  );
}
