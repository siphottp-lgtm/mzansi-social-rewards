# Mzansi Social Rewards — Powered by KASIC Ecosystem (Celo)

**Live Web Portal:** [https://vercel.app](https://vercel.app)  
**Smart Contract & Ledger Repository:** [siphottp-lgtm/KASIC_Ecosystem](https://github.com)

---

## Executive Overview

**Mzansi Social Rewards** is a mobile-first community engagement and social micro-commerce platform built for South Africa and the SADC region. Powered by the **KASIC Ecosystem** on **Celo**, it rewards constructive participation—such as content creation and supporting local merchants—with **Native KASI Coin** (`ERC-20`) and tiered **KASIC Reputation NFTs** (`ERC-721`) via an off-chain **Anti-Fraud Points Ledger** that settles weekly on Celo.

---

## Architecture & Repository Structure

- **4-Layer Ecosystem:** Integrates a Next.js/NestJS social layer, PostgreSQL anti-fraud database layer, soulbound/tiered reputation NFTs (`KasicNFT.sol`), and Celo Sepolia settlement (`KasiCoin.sol`) with Role-Based Access Control and MiniPay alignment.
- **Core Directories:** Structured across `frontend/` (Next.js 14 / Capacitor Android), `backend/` (NestJS REST API), `db/` (PostgreSQL migrations), and `docs/`.

---

## Local Quick Start

1. **Database:** Create and migrate via `createdb community_app` and `psql -d community_app -f db/migrations/001_init_schema.sql`.
2. **Backend:** Run `npm install` and `npm run start:dev` inside `backend/` (`http://localhost:3001`).
3. **Frontend:** Run `npm install` and `npm run dev` inside `frontend/` (`http://localhost:3000`).

---

## 12-Week Celo Pilot Roadmap

- **Weeks 1–2:** Deploy core smart contracts (`KasiCoin` & `KasicNFT`) on Celo Sepolia and set up PostgreSQL ledger migrations.
- **Weeks 3–7:** Integrate the off-chain reward engine, anti-fraud scoring, mobile UI, creator tipping, and MiniPay wallet onboarding.
- **Weeks 8–12:** Onboard **300 verified users**, **20 creators**, and **10 merchants** for a controlled regional pilot and transparent on-chain impact report.
