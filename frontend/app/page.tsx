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
        paddingBottom: 156,
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
        <header className="mz-topbar" style={{ background: "rgba(255, 255, 255, 0.72)", backdropFilter: "blur(8px)" }}>
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

        <main style={{ padding: "44px 24px 72px", display: "grid", placeItems: "center" }}>
          <section
            className="mz-banner"
            style={{
              width: "100%",
              maxWidth: 680,
              padding: "32px 28px",
              textAlign: "center",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.84)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 119, 73, 0.35)",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                color: "#0b0f14",
              }}
            >
              Mzansi
            </h1>

            <p
              style={{
                margin: "0 auto 24px",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.03em",
                color: "#005c38",
              }}
            >
              The People Shall Govern - Freedom Chatter
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
                  background: "rgba(255, 255, 255, 0.65)",
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
                  background: "rgba(255, 255, 255, 0.65)",
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

      <SwipeUpTaskbar />

      {/* Tribute moved up 2 steps above the bottom streaming banner for clear visibility */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 68,
          zIndex: 44,
          textAlign: "center",
          padding: "8px 16px",
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(0, 119, 73, 0.35)",
          borderBottom: "1px solid rgba(0, 119, 73, 0.2)",
          fontSize: 13,
          fontWeight: 800,
          color: "#0b0f14",
        }}
      >
        Tribute to Mrs. Jacinta ZM Zuma
      </div>

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
