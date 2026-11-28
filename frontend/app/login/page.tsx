"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MzansiBrandMark, WatermarkBackdrop } from "../../components/CommonUpgrade";
import { auth } from "../../lib/api";
import "../../styles/common-upgrade.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await auth.login({ email: email.trim(), password });
      const token =
        res?.access_token || res?.accessToken || res?.token || res?.data?.access_token || res?.data?.token;
      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("token", String(token));
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mz-common-app"
      style={{
        gridTemplateColumns: "1fr",
        position: "relative",
        minHeight: "100vh",
        paddingBottom: 56,
        background: "transparent",
      }}
    >
      <WatermarkBackdrop imageKey="image2" />
      <div style={{ maxWidth: 960, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="mz-flag-strip" />
        <header className="mz-topbar" style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(8px)" }}>
          <MzansiBrandMark />
          <div className="mz-top-actions">
            <Link href="/" className="mz-action" style={{ fontSize: 12, fontWeight: 600 }}>
              Home
            </Link>
            <Link href="/register" className="mz-primary">
              Register
            </Link>
          </div>
        </header>

        <main style={{ padding: "48px 20px", display: "grid", placeItems: "center" }}>
          <form
            onSubmit={handleSubmit}
            className="mz-glass-card"
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 16,
              padding: 24,
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <div className="mz-label" style={{ color: "#007749" }}>
                🇿🇦 MZANSI SIGN IN
              </div>
              <h1 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800 }}>Log in</h1>
            </div>

            {error && (
              <div
                style={{
                  fontSize: 12,
                  color: "#991b1b",
                  background: "rgba(254, 226, 226, 0.78)",
                  border: "1px solid #de3831",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                {error}
              </div>
            )}

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 600 }}>
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mz-transparent-input"
                style={{ borderRadius: 8, padding: "9px 11px", fontSize: 13 }}
              />
            </label>

            <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 600 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Password</span>
                <Link href="/forgot-password" style={{ color: "#007749", fontSize: 11, fontWeight: 700 }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mz-transparent-input"
                style={{ borderRadius: 8, padding: "9px 11px", fontSize: 13 }}
              />
            </label>

            <button type="submit" className="mz-primary" disabled={loading} style={{ padding: "10px 14px" }}>
              {loading ? "Signing in..." : "Log in →"}
            </button>

            <div style={{ fontSize: 12, textAlign: "center" }}>
              No account?{" "}
              <Link href="/register" style={{ color: "#007749", fontWeight: 700 }}>
                Join Mzansi
              </Link>
            </div>
          </form>
        </main>
      </div>

      <div className="mz-flag-marquee">
        <div className="mz-flag-marquee-track">
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
          <span>★ Together We Can Do It • Mzansi Community Network</span>
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
        </div>
      </div>
    </div>
  );
}

