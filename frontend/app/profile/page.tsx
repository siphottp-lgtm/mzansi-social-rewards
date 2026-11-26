"use client";

import React, { useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
      .then((data: ProfileData | null) => {
        if (data) {
          setProfile(data);
          const displayName = String(data.name || data.email || "Member");
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
      pageTitle="Your Profile"
      pageSubtitle="Account details and KASI Coin identity."
    >
      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--green)" }}>MEMBER PROFILE</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 20, margin: "8px 0" }}>{user.name}</h2>
        <p className="mz-tiny mz-muted">{user.handle}</p>
        {profile?.email && (
          <p className="mz-post-text" style={{ marginBottom: 0 }}>
            <strong>Email:</strong> {profile.email}
          </p>
        )}
      </div>
    </CommonUpgrade>
  );
}
