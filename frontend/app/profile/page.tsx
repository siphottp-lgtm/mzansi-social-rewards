"use client";

import React, { useState } from "react";
import { CommonUpgrade, MzansiUser } from "../../components/CommonUpgrade";

type ProfileTab = "details" | "overview" | "wallet";

interface PersonalDetailsForm {
  fullName: string;
  handle: string;
  bio: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  country: string;
  communityRole: string;
  interests: string;
  preferredWallet: "MiniPay" | "MetaMask";
  walletAddress: string;
}

const DEFAULT_USER: MzansiUser = {
  id: "member-1",
  name: "Member",
  handle: "@member",
  initials: "M",
  avatarColor: "green",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [savedBanner, setSavedBanner] = useState<string>("");

  const [form, setForm] = useState<PersonalDetailsForm>({
    fullName: DEFAULT_USER.name,
    handle: DEFAULT_USER.handle,
    bio: "",
    email: "",
    phone: "",
    city: "Soshanguve",
    province: "Gauteng",
    country: "South Africa",
    communityRole: "Community Member",
    interests: "KASI Coin, Local Spaces, Celo",
    preferredWallet: "MiniPay",
    walletAddress: "",
  });

  const currentUser: MzansiUser = {
    ...DEFAULT_USER,
    name: form.fullName.trim() || DEFAULT_USER.name,
    handle: form.handle.trim() || DEFAULT_USER.handle,
    initials: (form.fullName.trim() || DEFAULT_USER.name)
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };

  const updateField = <K extends keyof PersonalDetailsForm>(key: K, value: PersonalDetailsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner("Profile details updated.");
    window.setTimeout(() => setSavedBanner(""), 3000);
  };

  return (
    <CommonUpgrade
      currentUser={currentUser}
      showFeed={false}
      pageTitle="Your profile"
      pageSubtitle="Personal details, contact info, and Celo wallet settings."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, alignItems: "start" }}>
        <aside
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 14,
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className={`mz-avatar ${currentUser.avatarColor ?? ""}`}>{currentUser.initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{currentUser.name}</div>
              <div className="mz-tiny mz-muted">{currentUser.handle}</div>
            </div>
          </div>

          <p className="mz-tiny" style={{ margin: 0, lineHeight: 1.5 }}>
            {form.bio.trim() || "Add a short bio to introduce yourself to the community."}
          </p>

          <div className="mz-tiny mz-muted" style={{ display: "grid", gap: 4, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
            <div>
              <strong>Location:</strong> {[form.city, form.province, form.country].filter(Boolean).join(", ")}
            </div>
            <div>
              <strong>Role:</strong> {form.communityRole || "Member"}
            </div>
            <div>
              <strong>Wallet:</strong> {form.preferredWallet}
              {form.walletAddress ? ` (${form.walletAddress.slice(0, 6)}…${form.walletAddress.slice(-4)})` : " · Not set"}
            </div>
          </div>
        </aside>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 14,
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
            <button
              type="button"
              className={`mz-follow ${activeTab === "details" ? "followed" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Personal Details
            </button>
            <button
              type="button"
              className={`mz-follow ${activeTab === "overview" ? "followed" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={`mz-follow ${activeTab === "wallet" ? "followed" : ""}`}
              onClick={() => setActiveTab("wallet")}
            >
              Wallet & Rewards
            </button>
          </div>

          {savedBanner && (
            <div role="status" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 600 }}>
              {savedBanner}
            </div>
          )}

          {activeTab === "details" && (
            <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
              <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 10 }}>
                <legend className="mz-label" style={{ marginBottom: 4 }}>Identity & Bio</legend>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Full Name</span>
                    <input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      required
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Handle</span>
                    <input
                      value={form.handle}
                      onChange={(e) => updateField("handle", e.target.value)}
                      required
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                </div>

                <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                  <span>Bio</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Share a brief summary of your work or interests..."
                    style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                  />
                </label>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 10 }}>
                <legend className="mz-label" style={{ marginBottom: 4 }}>Contact & Location</legend>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Email Address</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="name@example.com"
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Phone Number</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+27 ..."
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>City / Area</span>
                    <input
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Province</span>
                    <input
                      value={form.province}
                      onChange={(e) => updateField("province", e.target.value)}
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Country</span>
                    <input
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 10 }}>
                <legend className="mz-label" style={{ marginBottom: 4 }}>Community & Focus</legend>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Role</span>
                    <input
                      value={form.communityRole}
                      onChange={(e) => updateField("communityRole", e.target.value)}
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                    <span>Interests & Spaces</span>
                    <input
                      value={form.interests}
                      onChange={(e) => updateField("interests", e.target.value)}
                      style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                    />
                  </label>
                </div>
              </fieldset>

              <div>
                <button type="submit" className="mz-primary">
                  Save Details
                </button>
              </div>
            </form>
          )}

          {activeTab === "overview" && (
            <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
              <div><strong>Name:</strong> {form.fullName || "—"}</div>
              <div><strong>Handle:</strong> {form.handle || "—"}</div>
              <div><strong>Email:</strong> {form.email || "—"}</div>
              <div><strong>Phone:</strong> {form.phone || "—"}</div>
              <div><strong>Location:</strong> {[form.city, form.province, form.country].filter(Boolean).join(", ") || "—"}</div>
              <div><strong>Focus:</strong> {form.interests || "—"}</div>
            </div>
          )}

          {activeTab === "wallet" && (
            <form onSubmit={handleSave} style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                <span>Preferred Celo Wallet</span>
                <select
                  value={form.preferredWallet}
                  onChange={(e) => updateField("preferredWallet", e.target.value as "MiniPay" | "MetaMask")}
                  style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px", background: "var(--white)" }}
                >
                  <option value="MiniPay">MiniPay</option>
                  <option value="MetaMask">MetaMask</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
                <span>Celo Wallet Address (0x...)</span>
                <input
                  value={form.walletAddress}
                  onChange={(e) => updateField("walletAddress", e.target.value)}
                  placeholder="0x..."
                  style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "7px 9px" }}
                />
              </label>

              <div>
                <button type="submit" className="mz-primary">
                  Save Wallet Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </CommonUpgrade>
  );
}
