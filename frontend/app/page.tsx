"use client";

import React from "react";
import Link from "next/link";
import { MzansiBrandMark, SwipeUpTaskbar, WatermarkBackdrop } from "../components/CommonUpgrade";
import "../styles/common-upgrade.css";

export default function HomePage() {
  return (
    <div
      className="mz-common-app"
      style={{
        gridTemplateColumns: "1fr",
        position: "relative",
        minHeight: "100vh",
        paddingBottom: 96,
        background: "transparent",
      }}
    >
      <WatermarkBackdrop imageKey="image1" />

      <div
        className="mz-content"
        style={{
          maxWidth: 1040,
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="mz-flag-strip" />
        <header className="mz-topbar" style={{ background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(8px)" }}>
          <MzansiBrandMark />
          <div className="mz-top-actions">
            <Link href="/dashboard" className="mz-action" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
              Feed
            </Link>
            <Link href="/login" className="mz-action" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
              Log in
            </Link>
            <Link href="/register" className="mz-primary">
              Join 🇿🇦 mzansi →
            </Link>
          </div>
        </header>

        <main style={{ padding: "56px 24px 64px", display: "grid", placeItems: "center" }}>
          <section
            className="mz-banner"
            style={{
              width: "100%",
              maxWidth: 680,
              padding: "36px 28px",
              textAlign: "center",
              borderRadius: 16,
            }}
          >
            <div
              className="mz-label"
              style={{
                color: "#007749",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              🇿🇦 MZANSI COMMUNITY NETWORK
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(1.85rem, 3.6vw, 2.6rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#0b0f14",
              }}
            >
              Welcome to Mzansi
            </h1>

            <p
              style={{
                margin: "0 auto 22px",
                maxWidth: 480,
                fontSize: 14,
                lineHeight: 1.55,
                color: "rgba(11, 15, 20, 0.82)",
              }}
            >
              Connect with friends, share local moments, and build together across South Africa.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link href="/register" className="mz-primary" style={{ padding: "10px 18px", fontSize: 13 }}>
                Join 🇿🇦 mzansi →
              </Link>
              <Link
                href="/login"
                className="mz-follow"
                style={{
                  padding: "10px 18px",
                  fontSize: 13,
                  background: "rgba(255, 255, 255, 0.45)",
                  borderColor: "#007749",
                  color: "#0b0f14",
                }}
              >
                Log in
              </Link>
              <Link
                href="/dashboard"
                className="mz-follow"
                style={{
                  padding: "10px 18px",
                  fontSize: 13,
                  background: "rgba(255, 255, 255, 0.45)",
                  borderColor: "#ffb81c",
                  color: "#0b0f14",
                }}
              >
                Open Feed
              </Link>
            </div>
          </section>
        </main>
      </div>

      {/* Taskbar keeps extra navigation/tools tucked away cleanly */}
      <SwipeUpTaskbar />

      {/* Bottom Streaming Banner */}
      <div className="mz-flag-marquee" role="region" aria-label="Community Banner">
        <div className="mz-flag-marquee-track">
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
          <span>★ Together We Can Do It • Mzansi Community Network</span>
          <span>🇿🇦 Freedom Chatter • People Shall Govern</span>
        </div>
      </div>
    </div>
  );
}
