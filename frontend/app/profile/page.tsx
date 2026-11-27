"use client";

import React, { useEffect, useRef, useState } from "react";
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
  avatarUrl: string;
  coverUrl: string;
}

const STORAGE_KEY = "mzansi_profile_details_v1";

const DEFAULT_FORM: PersonalDetailsForm = {
  fullName: "Member",
  handle: "@member",
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
  avatarUrl: "",
  coverUrl: "",
};

function resizeImageFile(file: File, maxWidth: number, maxHeight: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file."));
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [savedBanner, setSavedBanner] = useState<string>("");
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [form, setForm] = useState<PersonalDetailsForm>(DEFAULT_FORM);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonalDetailsForm>;
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setHydrated(true);
    }
  }, []);

  const persistForm = (nextForm: PersonalDetailsForm, message = "Profile details saved.") => {
    setForm(nextForm);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextForm));
      setSavedBanner(message);
    } catch {
      setSavedBanner("Could not save to browser storage (image may be too large).");
    }
    window.setTimeout(() => setSavedBanner(""), 3200);
  };

  const currentUser: MzansiUser = {
    id: "member-1",
    name: form.fullName.trim() || DEFAULT_FORM.fullName,
    handle: form.handle.trim() || DEFAULT_FORM.handle,
    initials: (form.fullName.trim() || DEFAULT_FORM.fullName)
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    avatarColor: "green",
  };

  const updateField = <K extends keyof PersonalDetailsForm>(key: K, value: PersonalDetailsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSavedBanner("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, 360, 360, 0.85);
      persistForm({ ...form, avatarUrl: dataUrl }, "Profile picture updated.");
    } catch {
      setSavedBanner("Failed to process profile picture.");
    }
    e.target.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSavedBanner("Please choose an image file.");
      return;
    }
    try {
      const dataUrl = await resizeImageFile(file, 1200, 420, 0.82);
      persistForm({ ...form, coverUrl: dataUrl }, "Cover background updated.");
    } catch {
      setSavedBanner("Failed to process cover background.");
    }
    e.target.value = "";
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    persistForm(form, "Profile details saved.");
  };

  return (
    <CommonUpgrade
      currentUser={currentUser}
      showFeed={false}
      pageTitle="Your profile"
      pageSubtitle="Personal details, photos, contact info, and Celo wallet settings."
    >
      {/* Facebook-style Cover Banner + Overlapping Profile Picture Header */}
      <section
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            position: "relative",
            height: 150,
            background: form.coverUrl
              ? `url("${form.coverUrl}") center / cover no-repeat`
              : "linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #d97706 100%)",
          }}
        >
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleCoverUpload}
          />
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              display: "flex",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                color: "#111",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {form.coverUrl ? "Change Cover" : "Upload Cover"}
            </button>
            {form.coverUrl && (
              <button
                type="button"
                onClick={() => persistForm({ ...form, coverUrl: "" }, "Cover removed.")}
                style={{
                  background: "rgba(255, 255, 255, 0.92)",
                  color: "#991b1b",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            padding: "0 16px 14px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: -34 }}>
            <div style={{ position: "relative" }}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={currentUser.name}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--white)",
                    background: "var(--white)",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className={`mz-avatar ${currentUser.avatarColor ?? ""}`}
                  style={{
                    width: 76,
                    height: 76,
                    fontSize: 22,
                    border: "3px solid var(--white)",
                  }}
                >
                  {currentUser.initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Upload profile picture"
                style={{
                  position: "absolute",
                  right: -2,
                  bottom: -2,
                  background: "var(--white)",
                  border: "1px solid var(--line)",
                  borderRadius: "999px",
                  padding: "3px 7px",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                Photo
              </button>
            </div>

            <div style={{ paddingBottom: 2 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {hydrated ? currentUser.name : "Loading…"}
              </div>
              <div className="mz-tiny mz-muted">
                {currentUser.handle} · {[form.city, form.country].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className="mz-follow"
              style={{ fontSize: 11 }}
              onClick={() => avatarInputRef.current?.click()}
            >
              Upload Avatar
            </button>
            {form.avatarUrl && (
              <button
                type="button"
                className="mz-follow"
                style={{ fontSize: 11 }}
                onClick={() => persistForm({ ...form, avatarUrl: "" }, "Profile picture removed.")}
              >
                Remove Avatar
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, alignItems: "start" }}>
        {/* Left Compact Summary Rail */}
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
          <div className="mz-label">About</div>
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

        {/* Right Tabbed Workspace */}
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
