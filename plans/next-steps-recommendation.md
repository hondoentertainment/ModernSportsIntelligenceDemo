# Strategic Roadmap: Modern Sports Intelligence

This document outlines the prioritized next steps for transitioning **Modern Sports Intelligence** from a high-fidelity prototype to a production-ready asset management platform.

---

## Priority 1: High-Impact Stabilization

### 1.1 Complete Supabase Auth Flow
**Rationale:** Ensure users can securely manage their portfolios across devices.
- **Actions:**
    - Implement `ForgotPassword.tsx` and the corresponding Supabase password reset flow.
    - Add robust error handling to `Login.tsx` and `Signup.tsx` (e.g., rate limiting messages).
    - Verify `ProtectedRoute` logic for sub-routes like `/inventory` and `/watchlist`.
- **Status:** Foundations in place; UI/UX refinement needed.

### 1.2 Multi-Tenant Data Migration
**Rationale:** Ensure `localStorage` data is seamlessly synced to Supabase when a user signs up.
- **Actions:**
    - Create a migration utility that checks for local data on first login.
    - Update `useSupabaseInventory` to handle the "initial sync" event.
- **Status:** Hook logic exists; automated migration trigger pending.

---

## Priority 2: Intelligence & Data Depth (Phase 2)

### 2.1 Official API Integrations
**Rationale:** Move beyond AI-based price estimation to verified market data.
- **Actions:**
    - **eBay API:** Replace or supplement the Gemini scraper with official "Sold Listings" data via the eBay Browse API.
    - **MLB Stats API:** Integrate real-time performance data to power "Performance vs. Price" correlation charts.
- **Status:** Research phase.

### 2.2 Automated Market Sync Scheduler
**Rationale:** Keep portfolio values fresh without manual intervention.
- **Actions:**
    - Implement a "Price Heartbeat" that checks for significant market moves in the background.
    - Add push notification triggers when watched assets hit target prices.
- **Status:** UI logic exists; backend scheduling pending.

---

## Priority 3: Feature Expansion

### 3.1 Scarcity & Quality Metrics
**Rationale:** Valuation in the hobby is driven by "Pop Reports" (Population).
- **Actions:**
    - Integrate PSA/SGC population report data into the card detail view.
    - Implement a "Grading Premium" calculator to show the potential ROI of grading a raw card.
- **Status:** Strategic planning.

### 3.2 Advanced Sentiment Tracking
**Rationale:** Identify "Hype" vs. "Utility" using AI-driven social listening.
- **Actions:**
    - Use Gemini to analyze sports news and social sentiment for key athletes.
    - Display a "Hype Score" on the Intelligence HUD.
- **Status:** Conceptual.

---

## Priority 4: Performance & Quality

### 4.1 Automated Testing Suite
**Rationale:** Prevent regressions in complex financial calculations.
- **Actions:**
    - Set up `Vitest` for core logic testing (NAV calculations, ROI tracking).
    - Implement E2E tests for the "Add Card" and "Market Sync" flows.

### 4.2 Optimized UI Renderers
**Rationale:** Support "Whale" accounts with 500+ assets.
- **Actions:**
    - Implement virtual scrolling for the Inventory and Watchlist hubs.
    - Optimize image lazy-loading to maintain 60fps scrolling on mobile.

---

## Success Metrics
- **Sync Reliability:** 100% data parity between local and cloud state.
- **Valuation Accuracy:** Prices within 5% of recent eBay sold listings.
- **App Performance:** < 100ms interaction latency on high-density data tables.