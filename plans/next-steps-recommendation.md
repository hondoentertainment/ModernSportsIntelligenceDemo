# Strategic Roadmap: Modern Sports Intelligence

This document outlines the prioritized next steps for transitioning **Modern Sports Intelligence** from a high-fidelity prototype to a production-ready asset management platform.

---

## Priority 1: High-Impact Stabilization

### 1.1 Complete Supabase Auth Flow
**Rationale:** Ensure users can securely manage their portfolios across devices.
- **Actions:**
    - **Password Reset:** Implement `ForgotPassword.tsx` and the corresponding `auth.resetPasswordForEmail` flow.
    - **Error Handling:** Add robust error state UI for `Login.tsx` and `Signup.tsx` (e.g., handling "Email already in use", "Invalid credentials", and Rate Limiting).
    - **Route Protection:** Audit `ProtectedRoute` logic to handle asynchronous session loading without "flicker."
- **Status:** Foundations in place; UI/UX refinement needed.

### 1.2 Multi-Tenant Data Migration
**Rationale:** Ensure `localStorage` data is seamlessly synced to Supabase when a user signs up.
- **Actions:**
    - **Detection Logic:** Create a `MigrationProvider` that checks for `msi_inventory` in `localStorage` on successful login.
    - **Batch Upload:** Implementation of a "Sync Now" trigger that pushes local data to the Supabase `inventory` table.
    - **Conflict Resolution:** Define logic for handling duplicate items between local and cloud states.
- **Status:** Hook logic exists; automated migration trigger pending.

---

## Priority 2: Intelligence & Data Depth (Phase 2)

### 2.1 Official API Integrations
**Rationale:** Move beyond AI-based price estimation to verified market data.
- **Actions:**
    - **eBay API:** Integrate with the eBay Browse API to fetch "Completed/Sold" listings for more accurate FMV (Fair Market Value).
    - **MLB Stats API:** Map player IDs to performance endpoints to power "Performance vs. Price" correlation charts.
- **Status:** Research phase.

### 2.2 Automated Market Sync Scheduler
**Rationale:** Keep portfolio values fresh without manual intervention.
- **Actions:**
    - **Background Sync:** Implement the `SyncScheduler` heartbeat to trigger price updates every 24 hours.
    - **Price Alerts:** Add browser push notification triggers when a "Watchlist" item drops below its target acquisition price.
- **Status:** UI logic exists; backend scheduling pending.

---

## Priority 3: Scarcity & Quality Intelligence (Phase 13)

### 3.1 Pop Report Integration
**Rationale:** Valuation is driven by scarcity (Population).
- **Actions:**
    - **Data Mapping:** Add `popReport` fields to `CardInventory` type.
    - **Scarcity Weighting:** Update the Alpha Score algorithm to factor in low-pop counts (e.g., "Pop 1" premium).
- **Status:** Strategic planning.

### 3.2 Grading Premium Calculator
**Rationale:** Help users decide whether to invest in grading raw cards.
- **Actions:**
    - **ROI Simulation:** Build a tool that compares the user's raw card estimated value vs. current PSA 9/10 market prices.
    - **Service Recommendations:** Link to PSA/SGC submission guidelines based on card value brackets.
- **Status:** Conceptual.

---

## Priority 4: Agentic Marketplace (Phase 16)

### 4.1 Negotiation Arena Evolution
**Rationale:** Automate the acquisition process through AI negotiation.
- **Actions:**
    - **Gemini Strategy:** Replace mock negotiation logic with Gemini-driven sentiment analysis (detecting seller firmness).
    - **Counter-Proposal Engine:** Implement logic that generates counter-offers based on the user's "Max Willing to Pay" and market FMV.
    - **Arena UI:** Enhance `NegotiationModal` with "Agent Thinking" animations and sentiment indicators.
- **Status:** Prototype in test (`negotiation.spec.ts`).

### 4.2 Trade Proposal Logic
**Rationale:** Facilitate portfolio optimization through smart swaps.
- **Actions:**
    - **Portfolio Delta:** Identify over-concentrated leagues/players in the user's portfolio.
    - **Proposal Generation:** Suggest "Card A for Card B + Cash" trades based on user needs vs. marketplace availability.
- **Status:** R&D.

---

## Priority 5: Portfolio Intelligence Reporting

### 5.1 Enhanced PDF Exports
**Rationale:** Professional-grade reporting for tax or sharing purposes.
- **Actions:**
    - **Morning Briefing:** Automate the `generateBriefingReport` trigger for a daily summary.
    - **Visual Fidelity:** Improve `pdfExport.ts` with custom charts (using PDF shapes) for league allocation.
- **Status:** Basic export functional; formatting pending.

---

## Priority 6: Performance & Scaling

### 6.1 Automated Testing Suite
**Rationale:** Prevent regressions in complex financial calculations.
- **Actions:**
    - **Vitest:** Implement unit tests for NAV and ROI math in `lib/portfolioUtils.ts`.
    - **E2E:** Expand Playwright coverage to include the full "Scout-to-Acquire" flow.

### 6.2 Data Virtualization
**Rationale:** Support "Whale" accounts with 1000+ assets.
- **Actions:**
    - **Virtual Lists:** Implement `react-window` or similar for high-density inventory tables.
    - **State Management:** Optimize Zustand stores for partial updates.

---

## Success Metrics
- **Sync Reliability:** 100% data parity between local and cloud state.
- **Valuation Accuracy:** Prices within 5% of recent eBay sold listings.
- **App Performance:** < 100ms interaction latency on high-density data tables.
- **Negotiation Success:** > 70% deal completion rate within user's "Max Willing to Pay."
