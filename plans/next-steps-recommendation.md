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
- **Current state (aligned with PRD 4.3 / production hardening):**
    - **Password reset:** Shipped — `pages/ForgotPassword.tsx`, route `/#/forgot-password`, `AuthContext` `resetPassword` + demo-mode messaging.
    - **Error handling:** Shipped — `lib/utils/authErrors.ts` (`getFriendlyAuthMessage`) wired on `Login.tsx` and `Signup.tsx`.
    - **Route protection:** Core guards and Supabase session handling are in place across protected routes; optional polish remains (e.g. loading-state UX to avoid any perceived flicker on slow networks).
- **Status:** **Largely complete for demo → subscriber path** — treat remaining work as UX hardening and edge-case messaging, not greenfield implementation.

### 1.2 Multi-Tenant Data Migration
**Rationale:** Ensure `localStorage` data is seamlessly synced to Supabase when a user signs up.
- **Actions:**
    - **Detection Logic:** Create a `MigrationProvider` that checks for `msi_inventory` in `localStorage` on successful login.
    - **Batch Upload:** Implementation of a "Sync Now" trigger that pushes local data to the Supabase `inventory` table.
    - **Conflict Resolution:** Define logic for handling duplicate items between local and cloud states.
- **Current state:**
    - **Detection + auto sync:** Shipped — `contexts/MigrationContext.tsx` runs `needsMigration()` and **auto-triggers** `migrateToSupabase` once per user after login when local data exists (non-demo, Supabase configured).
    - **Manual sync:** Shipped — `components/MigrationBanner.tsx` ("Sync Now"), `pages/Profile.tsx` institutional sync control, both call `triggerMigration()`.
    - **Persistence stack:** DAL + `store` (`lib/dal/syncStore.ts`, `lib/dal.ts`, `initDAL`) — see `docs/DAL_MIGRATION.md` and `PRODUCTION_READINESS.md`.
    - **Conflict resolution:** Still **productize** — document and enforce explicit rules for duplicate keys / merge vs skip when cloud already has rows (today: migrate path exists; advanced merge policy is the gap).
- **Status:** **Operational for typical first-time cloud sync** — prioritize conflict/duplicate policy and user-visible outcomes next, not the initial migration plumbing.

---

## Priority 2: Intelligence & Data Depth (Phase 2)

### 2.1 Official API Integrations
**Rationale:** Move beyond AI-based price estimation to verified market data.
- **Actions:**
    - **eBay API:** Integrate with the eBay Browse API to fetch "Completed/Sold" listings for more accurate FMV (Fair Market Value).
    - **MLB Stats API:** Map player IDs to performance endpoints to power "Performance vs. Price" correlation charts.
- **Current state:**
    - **eBay:** **Partially shipped** — Vercel handler `api/market/ebay.ts` (OAuth client-credentials, Zod validation, rate limiting, structured logging); client surface `lib/ebayApi.ts` + feature flags (`VITE_FF_REAL_EBAY`, etc.). FMV across the product still mixes AI estimates with optional real calls — next step is **defaulting more flows to sold/comp-backed pricing** where keys are configured.
    - **MLB:** **Client/API layer present** — `lib/utils/mlbApi.ts` (e.g. player stats by ID/season). Next step is **deeper UI binding** (Performance vs. Price charts, portfolio-linked alerts) and production key/ops hardening if not already env-complete.
- **Status:** **Integration scaffolding live** — shift focus from "can we call the API?" to **coverage** (which screens use real comps by default) and **observability** in deploy.

### 2.2 Automated Market Sync Scheduler
**Rationale:** Keep portfolio values fresh without manual intervention.
- **Actions:**
    - **Background Sync:** Implement the `SyncScheduler` heartbeat to trigger price updates every 24 hours.
    - **Price Alerts:** Add browser push notification triggers when a "Watchlist" item drops below its target acquisition price.
- **Current state:**
    - **Scheduler:** Shipped — `lib/utils/syncScheduler.ts` (`SyncScheduler`, configurable **daily/hourly/weekly/manual**, watchdog heartbeat, `store`-backed config); integrates with `lib/utils/marketSync.ts` (portfolio + watchlist sync helpers, stale checks including 24h semantics).
    - **Notifications:** **In-app / Notification API path** — `syncScheduler` can request notification permission; `lib/utils/notifications.ts` supports vibrate + `Notification` display patterns. Watchlist target UX exists in product surfaces (e.g. alerts/watchlist cards); **dedicated Web Push subscription + server-triggered pushes** remain optional product work if you want off-device alerts at scale.
- **Status:** **Client scheduling and sync loop implemented** — remaining work is **product defaults** (what runs automatically for signed-in users) and, if required, **full push infrastructure** beyond on-device notifications.

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

---

## Priority 4: The Intelligent Frontier (Phases 25-30)
**Objective**: Transition from a monitoring tool to an autonomous asset management partner.

#### Action Items:
- [ ] **Phase 25: Smart Vaulting**: Research API endpoints for PWCC and Goldin to enable real-time "Vault NAV" tracking.
- [ ] **Phase 26: Alpha Guilds**: Design the social architecture for gated intelligence sharing and shared agent pipelines.
- [ ] **Phase 27: Fiscal Shield**: Implement a capital gains simulator to help users plan tax-efficient exits.
- [ ] **Phase 28: AR Showcase**: Explore WebXR for displaying "Grail" cards in a spatial 3D environment.
- [ ] **Phase 29: Cross-Sector Nodes**: Expand the correlation engine to ingest data from Luxury Watch and Fine Art marketplaces.
- [ ] **Phase 30: Auto-Pilot**: Prototype the "Autonomous Trader" agent with strict risk-collars and user-defined budget locks.

---

## Conclusion
Modern Sports Intelligence has successfully reached the "Sentinel" stage (Phase 24). The next leap involves institutionalizing the infrastructure and deploying autonomous agentic value creation.

---

## Extended Roadmap (Phase 31-36)

### Phase 31: Trust, Security, and Data Governance
**Objective:** Make MSI production-safe for real users and paid tiers.
- [ ] Enforce public/private social visibility with validated Supabase RLS rollout and migration checklist.
- [ ] Add immutable audit trails for valuation updates, auto-actions, and portfolio edits.
- [ ] Implement secret hygiene: startup env validation, key rotation runbook, and leaked-key kill switch.
- [ ] Add incident playbooks for auth lockout, sync drift, and failed pricing syncs.
- **Exit Criteria:** Zero critical auth/RLS findings in security review; all critical actions are auditable.

### Phase 32: Pricing Truth Layer
**Objective:** Increase valuation reliability and confidence scoring.
- [ ] Build a source-priority model (eBay solds > historical portfolio comps > AI fallback).
- [ ] Add stale-data and low-liquidity flags directly in portfolio cards and watchlist rows.
- [ ] Capture model provenance for each valuation (`source`, `timestamp`, `confidence`, `rationale`).
- [ ] Add regression tests for pricing and edge-case comp selection.
- **Exit Criteria:** 95% of active assets priced from verifiable market sources within freshness SLA.

### Phase 33: Autonomous Execution Safety
**Objective:** Move Auto-Pilot from advisory to controlled execution.
- [ ] Add hard risk collars (daily budget, per-asset cap, max drawdown stop).
- [ ] Require human approval checkpoints for high-dollar or low-confidence actions.
- [ ] Add idempotency + retry contracts for autonomous actions and external API calls.
- [ ] Expand simulation mode with before/after NAV and tax impact preview.
- **Exit Criteria:** No unapproved high-risk actions; full replayability of autonomous decision history.

### Phase 34: Guild Economics and Governance
**Objective:** Turn Alpha Guilds into a durable collaboration product.
- [ ] Add role-based controls (Owner, Analyst, Member) and proposal quorum rules.
- [ ] Implement escrow-style contribution ledger for joint acquisitions.
- [ ] Add guild-level performance views (alpha attribution, hit rate, realized ROI).
- [ ] Introduce anti-spam and trust scoring for swarm signals.
- **Exit Criteria:** End-to-end guild proposal lifecycle (propose -> fund -> execute -> report) is stable.

### Phase 35: Reliability, Scale, and Cost Control
**Objective:** Support high-volume users without degraded UX or runaway spend.
- [ ] Add queue-based background jobs for sync, valuation, and report generation.
- [ ] Introduce tracing/metrics (P95 latency, sync success %, model cost per user).
- [ ] Ship bundle optimization and route-level code splitting for large dashboards.
- [ ] Add capacity tests for 10k+ assets and large watchlists.
- **Exit Criteria:** SLA met under load, with budget alerts and automated throttling in place.

### Phase 36: Platform and API Productization
**Objective:** Open MSI as a programmable platform.
- [ ] Launch scoped API tokens with per-endpoint rate limits and usage analytics.
- [ ] Publish API docs and typed SDK for portfolio, pricing, alerts, and guild insights.
- [ ] Add webhook events (`valuation.updated`, `alert.triggered`, `autopilot.executed`).
- [ ] Pilot enterprise SSO + tenant isolation controls.
- **Exit Criteria:** External integrator can build and deploy against MSI API without manual support.

---

## 30/60/90 Day Execution Plan

### Days 0-30 (Stabilize)
- Roll out RLS/schema updates and validate social/public portfolio flows.
- Lock down env/key handling and add runtime config checks.
- Fix test lane boundaries (Vitest vs Playwright) and enforce in CI.

### Days 31-60 (Harden)
- Deploy pricing truth layer with provenance and stale-data controls.
- Add autonomous action safeguards and simulation-based approvals.
- Launch observability dashboards and error budgets.

### Days 61-90 (Scale)
- Ship guild governance + pooled acquisition ledger MVP.
- Optimize bundle and data workloads for whale accounts.
- Prepare API product beta with auth, rate limits, and docs.

---

## Updated Success Metrics
- **Security:** 0 critical RLS/Auth findings in quarterly audits.
- **Data Integrity:** < 1% sync drift incidents per month.
- **Pricing Quality:** >= 95% valuations from verified market sources within SLA.
- **Autonomous Safety:** 100% high-risk actions gated by policy.
- **Performance:** P95 dashboard interaction < 150ms at 10k asset scale.
- **Reliability:** 99.9% uptime for core portfolio + pricing workflows.

---

## Phase Execution Log

### Phase 31 (In Progress)
Completed in this iteration:
- Runtime config validation added at startup (`index.tsx`, `lib/runtimeConfig.ts`).
- Audit logging utility with local fallback + Supabase persistence (`lib/auditLog.ts`).
- Portfolio and autonomous action audit hooks wired into mutation paths.
- Incident playbooks added under `plans/incidents/`.
- Supabase checklist and schema additions for `audit_events`.
- **Audit trail UI surface (user timeline viewer):** `pages/AuditTrail.tsx`
  now reads recorded + sample + the signed-in user's `audit_events` rows from
  Supabase via `fetchCloudAuditEvents(userId)`. Adds filter chips (category /
  severity / source), free-text search across action/resource/details/actor,
  CSV export, and a "Load older cloud events" button that pages backward
  through the user's history via a `before` cursor on `created_at`. RFC
  4180-quoted CSV is generated by `exportAuditEventsToCSV()` in
  `lib/utils/auditTrailService.ts`.
- **Anon-client RLS smoke test in CI:** `scripts/rls-verify.mjs` already runs
  against `user_data`, `targets`, `price_history`, `market_events`,
  `audit_events`, `stripe_processed_events` and fails build on any anon-readable
  leak (see `.github/workflows/ci.yml` for the gating job).
- **Key rotation + secret revocation runbook:** `plans/incidents/key-rotation-drill.md`
  documents the quarterly drill, the incident-response sequence, and the
  drill-log template. Linked from `plans/incidents/README.md`.

Remaining for full Phase 31 completion:
- Admin-grade audit timeline (cross-user, role-gated) for support and
  compliance staff — current viewer is correctly scoped to the signed-in
  user. Design spec in `plans/admin-audit-viewer-spec.md`; ~4 eng days,
  blocked on shipping `profiles.role` + a service-role Edge Function for the
  cross-user read.
- Execute the first key-rotation drill against staging and capture the result
  in the drill log (`plans/incidents/key-rotation-drill.md`).

---

## Long-Range Roadmap (Phase 37-42)

### Phase 37: Execution Integrations
**Objective:** Connect intelligence outputs to real execution channels.
- [ ] Add broker/marketplace adapters with normalized order intents (`buy`, `list`, `cancel`, `counter`).
- [ ] Build pre-trade checks (position limits, expected slippage, fee-aware profitability).
- [ ] Add execution status pipeline (`submitted`, `filled`, `partial`, `failed`) and reconciliation loop.
- [ ] Add kill-switch and global execution pause controls.
- **Exit Criteria:** 99%+ order state reconciliation accuracy with deterministic replay.

### Phase 38: Strategy Engine and Backtesting
**Objective:** Make strategy design measurable and repeatable.
- [ ] Build rule-builder for entry/exit conditions and liquidity constraints.
- [ ] Add historical backtests with walk-forward validation and overfit warnings.
- [ ] Add benchmark comparisons (buy-and-hold, sector basket, rolling DCA).
- [ ] Add strategy registry with versioned configs and changelogs.
- **Exit Criteria:** Every strategy can be simulated, scored, and compared before live activation.

### Phase 39: Risk Office and Compliance Layer
**Objective:** Operationalize institutional risk governance.
- [ ] Add portfolio VaR, concentration stress tests, and scenario shocks.
- [ ] Add policy engine for hard/soft limits by tier, user, and tenant.
- [ ] Add compliance exports (audit bundles, approval trails, incident timelines).
- [ ] Add exception workflows for temporary overrides with mandatory expiration.
- **Exit Criteria:** All high-risk operations are policy-evaluated and compliance-exportable.

### Phase 40: Marketplace and Network Effects
**Objective:** Build defensible marketplace liquidity and trust loops.
- [ ] Add reputation engine (execution quality, delivery reliability, dispute rate).
- [ ] Add verified listing metadata and authenticity confidence badges.
- [ ] Add referral and affiliate graph for high-signal participant growth.
- [ ] Add liquidity incentives for market makers and high-integrity sellers.
- **Exit Criteria:** Repeatable buyer/seller retention with measurable liquidity depth growth.

### Phase 41: Intelligence Copilot and Workflow Automation
**Objective:** Turn MSI into an always-on operator assistant.
- [ ] Add Copilot workflows (daily brief, rebalance proposal, risk digest, anomaly alerts).
- [ ] Add multi-step automation templates with approvals and rollback paths.
- [ ] Add workspace-level memory and objective tracking for teams.
- [ ] Add explainability cards for all AI recommendations and decisions.
- **Exit Criteria:** Users can run end-to-end workflows with explainable outputs and minimal manual orchestration.

### Phase 42: Ecosystem Expansion and Institutional Distribution
**Objective:** Scale MSI into a broader financial data platform.
- [ ] Launch partner app marketplace with secure extension model.
- [ ] Add institutional data feeds, private datasets, and governance-ready sharing.
- [ ] Add enterprise admin console (billing controls, policy templates, tenant analytics).
- [ ] Expand to adjacent collectible classes with shared intelligence core.
- **Exit Criteria:** MSI operates as a multi-tenant platform with ecosystem-level partner adoption.

---

## 6-18 Month Horizon

### Months 0-6
- Complete Phases 31-36 with production hardening and API beta.
- Establish reliability SLOs, cost guardrails, and governance adoption.

### Months 6-12
- Deliver Phases 37-39 for execution + strategy + risk office capabilities.
- Expand institutional readiness and compliance package depth.

### Months 12-18
- Deliver Phases 40-42 for network effects, copilot automation, and platform distribution.
- Shift from product feature velocity to ecosystem-scale adoption metrics.

---

## Additional Horizon Metrics
- **Execution Reliability:** >= 99% reconciled order lifecycle events.
- **Strategy Adoption:** >= 60% of active users running at least one tracked strategy.
- **Risk Coverage:** 100% of live strategies evaluated by risk policy engine.
- **Marketplace Depth:** 3x increase in verified listing liquidity year-over-year.
- **Platform Growth:** >= 25% of ARR from API/enterprise/platform channels.
