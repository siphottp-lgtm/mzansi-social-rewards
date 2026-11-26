"use client";

import React from "react";
import Link from "next/link";
import "../styles/common-upgrade.css";

export default function HomePage() {
  return (
    <div className="mz-common-app" style={{ gridTemplateColumns: "1fr" }}>
      <div className="mz-content" style={{ maxWidth: 1080, width: "100%", margin: "0 auto" }}>
        <header className="mz-topbar">
          <Link href="/" className="mz-brand">
            <span className="mz-brand-mark">✳</span>mzansi
          </Link>
          <div className="mz-top-actions">
            <Link href="/login" className="mz-action" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
              Log in
            </Link>
            <Link href="/register" className="mz-primary">
              Join Mzansi →
            </Link>
          </div>
        </header>

        <main style={{ padding: "48px 28px 64px" }}>
          <section className="mz-banner" style={{ padding: "36px 32px", marginBottom: 32 }}>
            <div className="mz-label" style={{ color: "var(--green)" }}>
              KASIC Ecosystem · Celo Community Rewards
            </div>
            <h1
              style={{
                fontFamily: "var(--display)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                margin: "12px 0 14px",
                lineHeight: 1.15,
              }}
            >
              Less scrolling. More belonging.
            </h1>
            <p className="mz-muted" style={{ maxWidth: 640, lineHeight: 1.7, margin: "0 0 24px", fontSize: 14 }}>
              Connect in small local corners, share real stories and local commerce, and earn KASI Coin
              rewards on Celo for meaningful community participation.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="mz-primary">
                Open Community Feed →
              </Link>
              <Link
                href="/register"
                className="mz-follow"
                style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, background: "var(--white)" }}
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="mz-follow"
                style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, background: "var(--white)" }}
              >
                Sign in
              </Link>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            <div className="mz-post" style={{ marginBottom: 0 }}>
              <div className="mz-label" style={{ color: "var(--orange)" }}>01 · LOCAL CIRCLES</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 18, margin: "8px 0" }}>Your little corners</h2>
              <p className="mz-tiny mz-muted" style={{ lineHeight: 1.65, margin: 0 }}>
                Focused spaces for builders, local merchants, and everyday voices across Mzansi.
              </p>
            </div>

            <div className="mz-post" style={{ marginBottom: 0 }}>
              <div className="mz-label" style={{ color: "var(--green)" }}>02 · KASI COIN</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 18, margin: "8px 0" }}>Rewards that stay local</h2>
              <p className="mz-tiny mz-muted" style={{ lineHeight: 1.65, margin: 0 }}>
                Earn KASI Coin and claim Celo rewards as you contribute to your community.
              </p>
            </div>

            <div className="mz-post" style={{ marginBottom: 0 }}>
              <div className="mz-label" style={{ color: "var(--ink)" }}>03 · DIRECT CONNECTION</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: 18, margin: "8px 0" }}>Friends & messages</h2>
              <p className="mz-tiny mz-muted" style={{ lineHeight: 1.65, margin: 0 }}>
                Keep up with friends, messages, and your profile in one calm workspace.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
