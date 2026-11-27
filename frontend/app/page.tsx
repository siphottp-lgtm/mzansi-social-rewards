"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, getToken } from "../lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHasSession(Boolean(getToken()));
  }, []);

  const handleQuickLogin = async (e: React.FormEvent) => {
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
      setError(err instanceof Error ? err.message : "Could not sign in. Check your details or register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Compact Top Navigation */}
      <header
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--line)",
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="mz-brand" style={{ fontSize: 20 }}>
            Freedom Chatter
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="mz-action" style={{ fontSize: 12, fontWeight: 600 }}>
              Feed
            </Link>
            <Link href="/friends" className="mz-action" style={{ fontSize: 12, fontWeight: 600 }}>
              Members
            </Link>
            <Link href="/messages" className="mz-action" style={{ fontSize: 12, fontWeight: 600 }}>
              Messages
            </Link>
            <Link href="/register" className="mz-primary" style={{ fontSize: 12 }}>
              Join Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Split Editorial Welcome & Direct Portal */}
      <main
        style={{
          flex: 1,
          maxWidth: 1120,
          width: "100%",
          margin: "0 auto",
          padding: "32px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* Left: Editorial Manifesto & Community Pillars */}
        <section style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: "fit-content",
              padding: "5px 11px",
              borderRadius: 999,
              background: "var(--white)",
              border: "1px solid var(--line)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--green)",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Mzansi Community Network · Celo &amp; KASI Ready
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            People Shall Govern — Freedom Chatter
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--muted)",
              maxWidth: 520,
            }}
          >
            Connect with local organizers, creatives, and neighbours across Soshanguve and Mzansi. Share updates,
            message registered members directly, and earn KASI rewards on Celo.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="mz-primary" style={{ padding: "10px 16px", fontSize: 13 }}>
              {hasSession ? "Open Your Dashboard" : "Explore Community Feed"}
            </Link>
            <Link href="/register" className="mz-follow" style={{ padding: "10px 16px", fontSize: 13 }}>
              Create Member Account
            </Link>
          </div>

          {/* Three Compact Pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
              gap: 10,
              marginTop: 6,
            }}
          >
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div className="mz-label" style={{ color: "var(--green)", marginBottom: 4 }}>
                Local Spaces
              </div>
              <div className="mz-tiny mz-muted" style={{ lineHeight: 1.45 }}>
                Post updates, photos, and discussions with your community in real time.
              </div>
            </div>

            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div className="mz-label" style={{ color: "var(--orange)", marginBottom: 4 }}>
                Direct Member Chat
              </div>
              <div className="mz-tiny mz-muted" style={{ lineHeight: 1.45 }}>
                Connect with registered members and friends in a unified inbox.
              </div>
            </div>

            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div className="mz-label" style={{ color: "var(--green)", marginBottom: 4 }}>
                KASI Wallet Rail
              </div>
              <div className="mz-tiny mz-muted" style={{ lineHeight: 1.45 }}>
                Built for MiniPay and MetaMask on Celo for community rewards.
              </div>
            </div>
          </div>
        </section>

        {/* Right: Direct Sign-In & Onboarding Portal Card */}
        <aside
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: 22,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <div className="mz-label" style={{ color: "var(--green)" }}>
              Member Portal
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700 }}>
              {hasSession ? "Welcome back, Member" : "Sign in to Freedom Chatter"}
            </h2>
            <p className="mz-tiny mz-muted" style={{ margin: "4px 0 0" }}>
              {hasSession
                ? "Your session is active. Jump straight into your feed, friends, or messages."
                : "Sign in to sync your posts, friends, and messages across devices."}
            </p>
          </div>

          {hasSession ? (
            <div style={{ display: "grid", gap: 10 }}>
              <Link
                href="/dashboard"
                className="mz-primary"
                style={{ textAlign: "center", padding: "10px 14px", fontSize: 13 }}
              >
                Continue to Dashboard
              </Link>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link href="/friends" className="mz-follow" style={{ textAlign: "center", padding: "8px 10px" }}>
                  Friends &amp; Members
                </Link>
                <Link href="/messages" className="mz-follow" style={{ textAlign: "center", padding: "8px 10px" }}>
                  Open Messages
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuickLogin} style={{ display: "grid", gap: 11 }}>
              {error && (
                <div
                  role="alert"
                  className="mz-tiny"
                  style={{
                    color: "#991b1b",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  {error}
                </div>
              )}

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 600 }}>
                <span>Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "9px 11px",
                    fontSize: 13,
                    background: "var(--bg)",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 600 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Password</span>
                  <Link href="/forgot-password" className="mz-tiny" style={{ color: "var(--green)", fontWeight: 600 }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "9px 11px",
                    fontSize: 13,
                    background: "var(--bg)",
                  }}
                />
              </label>

              <button
                type="submit"
                className="mz-primary"
                disabled={loading}
                style={{ padding: "10px 14px", fontSize: 13, marginTop: 2 }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
            }}
          >
            <span className="mz-muted">New to Mzansi Freedom Chatter?</span>
            <Link href="/register" style={{ color: "var(--green)", fontWeight: 700 }}>
              Register a Member Account →
            </Link>
          </div>
        </aside>
      </main>

      {/* Minimal Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--white)",
          padding: "12px 20px",
        }}
      >
        <div
          className="mz-tiny mz-muted"
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>Freedom Chatter · People Shall Govern</span>
          <span>Together we can do it · Celo &amp; MiniPay Ecosystem</span>
        </div>
      </footer>
    </div>
  );
}
