"use client";

import React, { useEffect, useState } from "react";
import { CommonUpgrade, type MzansiUser } from "../../components/CommonUpgrade";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MemberItem {
  id: string;
  name: string;
  email?: string;
  handle?: string;
}

function extractList(payload: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const k of keys) {
      if (Array.isArray(obj[k])) return obj[k] as Record<string, unknown>[];
    }
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      for (const k of keys) {
        if (Array.isArray(inner[k])) return inner[k] as Record<string, unknown>[];
      }
    }
  }
  return [];
}

function mapMember(item: Record<string, unknown>, idx: number): MemberItem {
  const nested = (item.user || item.friend || item.member) as Record<string, unknown> | undefined;
  const raw = nested && typeof nested === "object" ? { ...item, ...nested } : item;
  const fullName =
    raw.displayName ||
    raw.name ||
    raw.fullName ||
    [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
    raw.username ||
    (typeof raw.email === "string" ? raw.email.split("@")[0] : undefined) ||
    `Member ${idx + 1}`;
  return {
    id: String(raw.id || raw._id || idx),
    name: String(fullName),
    email: raw.email ? String(raw.email) : undefined,
    handle: raw.username ? `@${String(raw.username).replace(/^@/, "")}` : undefined,
  };
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<MemberItem[]>([]);
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
        if (data && typeof data === "object") {
          const obj = data as Record<string, unknown>;
          const displayName = String(
            obj.displayName ||
              obj.name ||
              obj.fullName ||
              [obj.firstName, obj.lastName].filter(Boolean).join(" ") ||
              obj.email ||
              "Member"
          );
          setUser({
            id: String(obj.id || "me"),
            name: displayName,
            handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
            initials: displayName.slice(0, 2).toUpperCase(),
            avatarColor: "green",
          });
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/friends`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = extractList(data, ["friends", "items", "users", "members", "data"]).map(mapMember);
        setFriends(list);
      })
      .catch(() => {});

    const candidatePaths = ["/users/directory", "/users", "/api/users", "/members"];
    (async () => {
      for (const path of candidatePaths) {
        try {
          const res = await fetch(`${API_URL}${path}`, { headers });
          if (!res.ok) continue;
          const data = await res.json();
          const list = extractList(data, ["users", "members", "directory", "items", "friends", "data"]).map(mapMember);
          if (list.length > 0) {
            setMembers(list);
            break;
          }
        } catch {
          // Try next candidate path
        }
      }
    })();
  }, []);

  return (
    <CommonUpgrade
      currentUser={user}
      showFeed={false}
      pageTitle="Friends & Registered Members"
      pageSubtitle="Your connected friends and registered Mzansi members."
    >
      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--green)" }}>
          YOUR FRIENDS ({friends.length})
        </div>
        {friends.length === 0 ? (
          <p className="mz-tiny mz-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No connected friends returned yet.
          </p>
        ) : (
          friends.map((f) => (
            <div key={f.id} className="mz-post-head" style={{ marginTop: 14 }}>
              <div className="mz-avatar green">{f.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong style={{ fontSize: 13 }}>{f.name}</strong>
                <div className="mz-tiny mz-muted">{f.handle || f.email || "Connected friend"}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mz-post">
        <div className="mz-label" style={{ color: "var(--orange)" }}>
          REGISTERED MEMBERS ({members.length})
        </div>
        {members.length === 0 ? (
          <p className="mz-tiny mz-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No registered members returned from /users/directory yet.
          </p>
        ) : (
          members.map((m) => (
            <div key={m.id} className="mz-post-head" style={{ marginTop: 14 }}>
              <div className="mz-avatar small green">{m.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong style={{ fontSize: 13 }}>{m.name}</strong>
                <div className="mz-tiny mz-muted">{m.handle || m.email || "Registered member"}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </CommonUpgrade>
  );
}
