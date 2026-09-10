# Strategic Roadmap: Modern Sports Intelligence

This document outlines the prioritized next steps for transitioning **Modern Sports Intelligence** from a high-fidelity prototype to a production-ready asset management platform.

> **Sep 2026 refresh.** Eng-safe Waves 2–5 are shipped (`#139` / `b1a6ca5` on `main`). Owner-facing order is [`NEXT_STEPS.md`](../NEXT_STEPS.md) § Forward roadmap and [`PRODUCT_ROADMAP_2026Q4.md`](./PRODUCT_ROADMAP_2026Q4.md). **T0 = Phase A complete** (#77 closed). If #77 slips, the 30/60/90 clock does not start. This file keeps Priority 1–6 history and Phases 31–42.

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
  - **Route protection:** **Shipped (Wave-4)** — `ProtectedRoute` holds the session shell until `INITIAL_SESSION` **and** the profile fetch (`profileLoading`) resolve, then redirects unsigned users. Security model unchanged (UX gate only).
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
  - **Conflict resolution:** **Shipped** (2026-09-06) — `planMigrationPreview` + banner/Profile show merge vs skip / duplicate-key outcomes before sync; demo-safe when Supabase is unavailable.
  - **Field-level diffs:** **Shipped (Wave-4)** — key inventory / target column conflicts (mark, cost, dates, grade, notes, status) render on Migration Banner + Profile. No restore.
- **Status:** **Operational** for first-time cloud sync, duplicate-policy UX, and field-level conflict preview.

---

## Priority 2: Intelligence & Data Depth (Phase 2)

### 2.1 Official API Integrations

**Rationale:** Move beyond AI-based price estimation to verified market data.

- **Actions:**
  - **eBay API:** Integrate with the eBay Browse API to fetch "Completed/Sold" listings for more accurate FMV (Fair Market Value).
  - **MLB Stats API:** Map player IDs to performance endpoints to power "Performance vs. Price" correlation charts.
- **Current state:**
  - **eBay:** **Partially shipped** — Vercel handler `api/market/ebay.ts` (OAuth client-credentials, Zod validation, rate limiting, structured logging); client surface `lib/ebayApi.ts` + feature flags (`VITE_FF_REAL_EBAY`, etc.). FMV across the product still mixes AI estimates with optional real calls — next step is **defaulting more flows to sold/comp-backed pricing** where keys are configured.
  - **MLB:** **Client/API layer present** — `lib/utils/mlbApi.ts` (e.g. player stats by ID/season). **Performance vs Price** chart on Dashboard binds StatsService hitting lines to collection marks when names match (2026-09-07). **Non-MLB (Wave-2 + Wave-3):** NBA / NFL / NHL / Soccer hubs + Dashboard bind seeded desk stats the same way, with heuristic disclosure and empty-bind states. Production key/ops hardening still owner-held if not env-complete.
- **Status:** **Integration scaffolding live** — shift focus from "can we call the API?" to **coverage** (which screens use real comps by default) and **observability** in deploy.

### 2.2 Automated Market Sync Scheduler

**Rationale:** Keep portfolio values fresh without manual intervention.

- **Actions:**
  - **Background Sync:** Implement the `SyncScheduler` heartbeat to trigger price updates every 24 hours.
  - **Price Alerts:** Add browser push notification triggers when a "Watchlist" item drops below its target acquisition price.
- **Current state:**
  - **Scheduler:** Shipped — `lib/utils/syncScheduler.ts` (`SyncScheduler`, configurable **daily/hourly/weekly/manual**, watchdog heartbeat, `store`-backed config); integrates with `lib/utils/marketSync.ts` (portfolio + watchlist sync helpers, stale checks including 24h semantics).
  - **Notifications:** **In-app / Notification API + haptics (2026-09-08) + quiet hours (Wave-2) + Web Push client readiness (Wave-4)** — `syncScheduler` can request notification permission; `lib/utils/haptics.ts` + `notifications.ts` vibrate when a watchlist / target-price threshold fires. Delivery honors `msi_alert_preferences_v1`. Client Push API persists an endpoint via `msi_web_push_subscription_v1` when the browser already has one. **Server-triggered push still needs owner-held VAPID keys + a backend** — no VAPID secrets in git.
  - **Status:** **Client scheduling, sync loop, on-device delivery prefs, product defaults (Wave-3), and Web Push client readiness (Wave-4) implemented.** Remaining work, if required, is **owner-held full push infrastructure** (VAPID + server).

---

## Priority 3: Scarcity & Quality Intelligence (Phase 13)

### 3.1 Pop Report Integration

**Rationale:** Valuation is driven by scarcity (Population).

- **Actions:**
  - **Data Mapping:** Add `popReport` fields to `CardInventory` type.
  - **Scarcity Weighting:** Update the Alpha Score algorithm to factor in low-pop counts (e.g., "Pop 1" premium).
- **Status:** **Shipped (lite, 2026-09-07)** — `CardInventory.popReport` hydrates from a disclosed simulated model; Alpha Score applies Pop 1 / low-pop premium from `popAtGrade`. Live PSA pop remains owner-held.

### 3.2 Grading Premium Calculator

**Rationale:** Help users decide whether to invest in grading raw cards.

- **Actions:**
  - **ROI Simulation:** Build a tool that compares the user's raw card estimated value vs. current PSA 9/10 market prices.
  - **Service Recommendations:** Link to PSA/SGC submission guidelines based on card value brackets.
- **Status:** **Shipped (lite, 2026-09-08 Wave-2)** — Collection `GradingRoiLitePanel` compares raw mark vs PSA 9/10 using sold-comp titles when present, otherwise disclosed multipliers + economy fee. Service recommendations stay on existing Grading Calculator / PreGrade surfaces. **Live PSA remains owner-held.**

---

## Priority 4: Agentic Marketplace (Phase 16)

### 4.1 Negotiation Arena Evolution

**Rationale:** Automate the acquisition process through AI negotiation.

- **Actions:**
  - **Gemini Strategy:** Replace mock negotiation logic with Gemini-driven sentiment analysis (detecting seller firmness).
  - **Counter-Proposal Engine:** Implement logic that generates counter-offers based on the user's "Max Willing to Pay" and market FMV.
  - **Arena UI:** Enhance `NegotiationModal` with "Agent Thinking" animations and sentiment indicators.
- **Status:** **Shipped (deepen, Wave-4)** — Gemini seller-firmness when the generate path is available; deterministic demo fallback otherwise. Arena shows an agent-thinking animation plus a seller-firmness / sentiment meter. Still advisory — not live marketplace trading. Covered by `negotiation.spec.ts` + unit tests.

### 4.2 Trade Proposal Logic

**Rationale:** Facilitate portfolio optimization through smart swaps.

- **Actions:**
  - **Portfolio Delta:** Identify over-concentrated leagues/players in the user's portfolio.
  - **Proposal Generation:** Suggest "Card A for Card B + Cash" trades based on user needs vs. marketplace availability.
- **Status:** **Shipped (lite, 2026-09-07)** — advisory “Card A for Card B + cash” from local inventory on Collection. **Wave-3:** concentration / risk rail surfaces player + league NAV shares and links those hints to trade proposals / Auto-Pilot. Not a live marketplace / order book.

---

## Priority 5: Portfolio Intelligence Reporting

### 5.1 Enhanced PDF Exports

**Rationale:** Professional-grade reporting for tax or sharing purposes.

- **Actions:**
  - **Morning Briefing:** Automate the `generateBriefingReport` trigger for a daily summary.
  - **Visual Fidelity:** Improve `pdfExport.ts` with custom charts (using PDF shapes) for league allocation.
- **Status:** **Shipped (lite, 2026-09-07)** — Morning Briefing shows league-allocation bars in the modal DOM and downloads text/HTML via `leagueAllocation`. Live UI does not import `pdfExport` / jsPDF.

---

## Priority 6: Performance & Scaling

### 6.1 Automated Testing Suite

**Rationale:** Prevent regressions in complex financial calculations.

- **Actions:**
  - **Vitest:** Implement unit tests for NAV and ROI math in `lib/portfolioUtils.ts`.
  - **E2E:** Expand Playwright coverage to include the full "Scout-to-Acquire" flow. **Shipped (demo smoke, 2026-09-08):** `tests/e2e/scout-to-acquire.spec.ts` walks Collection holding → War Room scout desk → Autonomous Acquisition campaign persist. Cloud/live-tape E2E remains owner-held.

### 6.2 Data Virtualization

**Rationale:** Support "Whale" accounts with 1000+ assets.

- **Actions:**
  - **Virtual Lists:** Implement `react-window` or similar for high-density inventory tables.
  - **State Management:** Optimize Zustand stores for partial updates.
- **Status:** **Shipped (lite, Wave-5, 2026-09-10)** — Collection **grid** was already virtualized (`@tanstack/react-virtual`, threshold 24). Wave-5 adds a **virtualized list**, memoized `CardListRow`, and stable `getItemKey` on grid + list so 1k–10k cards stay usable. Partial-update-friendly identity keys; handlers still recreate on some parent renders. Not `react-window`.

## Wave-5 vs Sports Card Investor / Market Movers (2026-09-10)

Engineering-safe consumer-intel gaps closed on existing Dashboard / Collection / Favorites / War Room / Compare surfaces: **ratio intelligence**, **collection + favorites movers**, **deal finder lite**, **multi-segment Market Pulse**, **2–3 card compare desk**, **whale list virtualization**, and **wax/TCG adjacent rail**. Institutional stack (War Room, Auto-Pilot, tax lots, wash-sale, Arena, consensus ledger, audit dossier, card-show loop) remains the MSI differentiator. Live eBay/PSA / SCI tape parity stays owner-held (#77). `fractional-vault` stays legal-gated beta.

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
- [x] **Phase 27: Fiscal Shield**: Implement a capital gains simulator to help users plan tax-efficient exits. **Shipped (lite, Wave-3)** — sell this year vs next ST/LT on Fiscal / Tax Report / Collection sell. **Not** IRS regulatory completeness.
- [ ] **Phase 28: AR Showcase**: Explore WebXR for displaying "Grail" cards in a spatial 3D environment.
- [ ] **Phase 29: Cross-Sector Nodes**: Expand the correlation engine to ingest data from Luxury Watch and Fine Art marketplaces.
- [x] **Phase 30: Auto-Pilot** (advisory): Risk collars, human approval, local idempotency, NAV/tax preview, decision replay shipped (2026-09-07 → Wave-3). **Live marketplace fills remain Phase D / Phase 33 leftover.**

---

## Conclusion

Modern Sports Intelligence reached the "Sentinel" stage (Phase 24) and then shipped Bloomberg-core + Waves 2–5 on the local book. The next leap is **not more Labs surfaces** — it is owner-held #77 (trusted book), then pricing-truth default, then always-on wires and controlled execution.

---

## Extended Roadmap (Phase 31-36)

### Phase 31: Trust, Security, and Data Governance

**Objective:** Make MSI production-safe for real users and paid tiers.

**Status (Sep 2026):** Viewer + RLS + runbooks shipped (July). Hosted project is **INACTIVE**. **Immutability residual:** `audit_events` RLS is still `FOR ALL` (user UPDATE/DELETE). Remaining checks are Phase A / #77 after restore.

- [x] Enforce public/private social visibility with validated Supabase RLS rollout and migration checklist (applied 2026-07-18 on `vhbsokjqchaafluimgjh`; re-verify after restore).
- [x] Audit trail **viewer** for valuation updates, auto-actions, and portfolio edits (`/audit-trail` + admin viewer).
- [ ] **Append-only / immutable rows** — `00001_rls_audit_events.sql` still uses `FOR ALL` (“Users can CRUD own audit events”), so an authenticated user can UPDATE/DELETE their own history. Restrict to INSERT + SELECT (or revoke UPDATE/DELETE) after restore. Do not treat the trail as immutable until that lands.
- [x] Secret hygiene: startup env validation, key rotation runbook, leaked-key kill switch.
- [x] Incident playbooks for auth lockout, sync drift, and failed pricing syncs.
- **Exit Criteria:** Zero critical auth/RLS findings in security review; all critical actions are auditable. **Re-confirm after restore.**

### Phase 32: Pricing Truth Layer

**Objective:** Increase valuation reliability and confidence scoring.

**Status (Sep 2026):** Partial on the local book. Forward **Phase B** (after eBay live) is the remainder.

- [x] Source-priority model (eBay solds > historical portfolio comps > AI fallback) — `compConsensus` / `preferredValuationForCard` (2026-09-06). Flags not flipped.
- [x] Stale / thin / source / timestamp / confidence chips on Collection (and consensus ledger strip).
- [x] Comps Used lists sold/historical comps on Collection grid/list (2026-09-07).
- [x] Regression tests for pricing / preferred-comp selection (unit coverage on consensus paths).
- [ ] **Remaining (Phase B):** sold comps **default** on apply + core desks once `VITE_FF_REAL_EBAY` is on; stale / low-liquidity badges **everywhere** (watchlist, Pulse, War Room, Favorites); provenance **SLA** (freshness budget); optional `price_history` table **after** cloud restore.
- **Exit Criteria:** 95% of active assets priced from verifiable market sources within freshness SLA — **blocked on #77 / live eBay**.

### Phase 33: Autonomous Execution Safety

**Objective:** Move Auto-Pilot from advisory to controlled execution.

**Status (Sep 2026):** Advisory complete (collars, approval, idempotency, NAV/tax preview, local replay). **Live fills = Forward Phase D.** Do not treat remaining checkboxes as a Wave-6 feature list.

- [x] Add hard risk collars (daily budget, per-asset cap, max drawdown stop) (2026-09-07).
- [x] Require human approval checkpoints for high-dollar or low-confidence actions (2026-09-07).
- [x] Add local idempotency keys + duplicate-action guards for autonomous actions (2026-09-07). External API retry contracts still open.
- [x] Expand simulation mode with before/after NAV and tax impact preview (2026-09-08 Wave-2; advisory `FiscalService` / tax-lot helpers). Live marketplace execution still open.
- [x] Local day-bucketed decision replay of actions considered, collars, approvals, and NAV preview (2026-09-08 Wave-3). Live marketplace execution still open.
- **Exit Criteria:** No unapproved high-risk actions; full replayability of autonomous decision history. **Replayability shipped locally (lite);** live execution + external API retry contracts still open.

### Phase 34: Guild Economics and Governance

**Objective:** Turn Alpha Guilds into a durable collaboration product.

**Status:** Forward **Phase E**. Do not start before A–C are boring.

- [ ] Add role-based controls (Owner, Analyst, Member) and proposal quorum rules.
- [ ] Implement escrow-style contribution ledger for joint acquisitions.
- [ ] Add guild-level performance views (alpha attribution, hit rate, realized ROI).
- [ ] Introduce anti-spam and trust scoring for swarm signals.
- **Exit Criteria:** End-to-end guild proposal lifecycle (propose -> fund -> execute -> report) is stable.

### Phase 35: Reliability, Scale, and Cost Control

**Objective:** Support high-volume users without degraded UX or runaway spend.

**Status:** Partial — Wave-5 whale list virtualization + existing route splitting. Remaining queue/tracing/capacity work is hygiene after #77, not a Labs wave.

- [ ] Add queue-based background jobs for sync, valuation, and report generation.
- [ ] Introduce tracing/metrics (P95 latency, sync success %, model cost per user).
- [ ] Ship bundle optimization and route-level code splitting for large dashboards.
- [ ] Add capacity tests for 10k+ assets and large watchlists.
- **Exit Criteria:** SLA met under load, with budget alerts and automated throttling in place.

### Phase 36: Platform and API Productization

**Objective:** Open MSI as a programmable platform.

**Status:** `/api-licensing` GA with demo metering. Real keys + webhooks = Forward **Phase E**.

- [ ] Launch scoped API tokens with per-endpoint rate limits and usage analytics.
- [ ] Publish API docs and typed SDK for portfolio, pricing, alerts, and guild insights.
- [ ] Add webhook events (`valuation.updated`, `alert.triggered`, `autopilot.executed`).
- [ ] Pilot enterprise SSO + tenant isolation controls.
- **Exit Criteria:** External integrator can build and deploy against MSI API without manual support.

---

## 30/60/90 Day Execution Plan

**T0 = Phase A complete** — the day [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closes (restore + Vercel env sync + Stripe smoke + eBay live). PSA may still be off (eBay-first). If #77 slips, **the clocks below do not start**.

### Days T0–T0+30 (Observe + start Phase B)

- eBay tape observed (deployed-E2E + pricing-truth). Do not re-do restore/Stripe — those are pre-T0.
- PSA on **both** runtimes (Vercel `api/grading/psa/cert.ts` **and** Supabase `verify-psa-cert`) + `VITE_FF_REAL_PSA` only if eBay is stable — never both flags on day one.
- Optional leftover Phase A tails: Sentry DSN, admin-audit confirm, key-rotation drill with Stripe staging keys, audit-events append-only RLS.
- Phase B started (sold-comps default on live tape).
- Do **not** start Guilds, API keys, or new Labs.

### Days T0+31–T0+60 (Pricing truth default)

- Phase B: sold-comps default on apply + core desks; stale / low-liquidity everywhere; provenance SLA.
- Start Phase C: server Web Push (VAPID + backend) **or** MLB live catalyst / PvP wire — not both if staffing is one engineer.
- Auto-Pilot stays advisory. No live fills.

### Days T0+61–T0+90 (Wires + moat design)

- Phase C usable (push and/or MLB wire in production with honest degraded states).
- Phase D scoped: P2P match/reputation/escrow design, execution-adapter contract, show-floor partner API spike.
- Whale list already virtualized (Wave-5). Bundle/cost work is hygiene, not a roadmap bet.
- Phase E (real Alpha keys, Guilds, risk office) **waits** until A–C are boring.

### Superseded (pre-Wave-5) 30/60/90

The July plan (RLS rollout, Autopilot safeguards, guild MVP in 90 days) is **done or re-sequenced**: RLS/runtime/audit shipped as Phase 31; Auto-Pilot collars/replay shipped advisory; guilds moved to Phase E. Kept so older links do not look deleted.

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

### Phase 31 (Viewer shipped; immutability residual)

Completed in this iteration:

- Runtime config validation added at startup (`index.tsx`, `lib/runtimeConfig.ts`).
- Audit logging utility with local fallback + Supabase persistence (`lib/auditLog.ts`).
- Portfolio and autonomous action audit hooks wired into mutation paths.
- Incident playbooks added under `plans/incidents/`.
- Supabase checklist and schema additions for `audit_events`.
- **User timeline viewer:** `/audit-trail` renders recorded + cloud + sample
  rows via `getRemoteAuditEvents(userId, opts)`. Adds filter chips (category /
  severity / source), free-text search, RFC 4180 CSV export, and a "Load older
  cloud events" button that pages backward via a `before` cursor on
  `audit_events.created_at`.
- **Admin / cross-user timeline viewer:** `/audit-trail/admin` is gated by
  `<AdminRoute>` (checks `operatorRole === 'support' | 'admin'`) and reads via
  the new `supabase/functions/admin-audit-events` Edge Function. The Edge
  Function uses the service role to bypass the self-only RLS on `audit_events`
  and — critically — writes an `audit_events` row of its own
  (`category: 'admin'`, `action: 'audit.cross_user_read'`) before returning.
  Every operator read is therefore itself auditable.
- **`profiles.role` trust-boundary column:** migration `00008` adds the column
  (`member` / `support` / `admin`), an operator-visibility SELECT policy on
  `profiles`, and a `BEFORE UPDATE` trigger that rejects any client-side
  attempt to elevate role. Role changes are intentionally out-of-band (SQL
  only).
- **`operatorRole` on `AuthContext`:** the same profile fetch that resolves
  `userTier` now also loads `role` and exposes it to the UI as
  `operatorRole`, defaulting to `'member'` for demo mode and every unknown
  state.
- **Anon-client RLS smoke test in CI:** `scripts/rls-verify.mjs` gates every
  build against a leaked anon key on `user_data`, `targets`, `price_history`,
  `market_events`, `audit_events`, `stripe_processed_events`.
- **Key rotation + secret revocation runbook:**
  `plans/incidents/key-rotation-drill.md` documents the quarterly drill
  procedure, the incident-response sequence (Stripe / Supabase / eBay /
  Gemini / PSA paths), and the drill-log template. Linked from
  `plans/incidents/README.md`.

Remaining for Phase 31 hardening (procedural, non-code) — **blocked on #77 restore**:

- ~~First key-rotation drill (Supabase cutover)~~ — logged 2026-07-18. Full multi-provider quarterly drill still needs Stripe staging keys (Phase A optional).
- ~~First admin bootstrap~~ — `msi-launch-admin@example.com` promoted. Promote a personal operator after signup.
- Confirm `/audit-trail/admin` writes `audit.cross_user_read` while signed in as an operator (Priority 1 item 0.3). **Restore the paused project first.**
- Restrict `audit_events` RLS from `FOR ALL` to append/select (INSERT + SELECT) so valuation / portfolio / auto-action history cannot be rewritten by the subject user.

---

## Long-Range Roadmap (Phase 37-42)

### Phase 37: Execution Integrations

**Objective:** Connect intelligence outputs to real execution channels.

**Status:** Forward **Phase D**. Pre-trade fee-aware strip already lite on Collection.

- [ ] Add broker/marketplace adapters with normalized order intents (`buy`, `list`, `cancel`, `counter`).
- [ ] Build pre-trade checks (position limits, expected slippage, fee-aware profitability).
- [ ] Add execution status pipeline (`submitted`, `filled`, `partial`, `failed`) and reconciliation loop.
- [ ] Add kill-switch and global execution pause controls.
- **Exit Criteria:** 99%+ order state reconciliation accuracy with deterministic replay.

### Phase 38: Strategy Engine and Backtesting

**Objective:** Make strategy design measurable and repeatable.

**Status:** After Phase D. Surfaces exist (rules / what-if); walk-forward backtests are not a Q4 critical path.

- [ ] Build rule-builder for entry/exit conditions and liquidity constraints.
- [ ] Add historical backtests with walk-forward validation and overfit warnings.
- [ ] Add benchmark comparisons (buy-and-hold, sector basket, rolling DCA).
- [ ] Add strategy registry with versioned configs and changelogs.
- **Exit Criteria:** Every strategy can be simulated, scored, and compared before live activation.

### Phase 39: Risk Office and Compliance Layer

**Objective:** Operationalize institutional risk governance.

**Status:** Forward **Phase E** (depth). Concentration rail + Fiscal Shield + audit dossier already lite — not IRS theater.

- [ ] Add portfolio VaR, concentration stress tests, and scenario shocks.
- [ ] Add policy engine for hard/soft limits by tier, user, and tenant.
- [ ] Add compliance exports (audit bundles, approval trails, incident timelines).
- [ ] Add exception workflows for temporary overrides with mandatory expiration.
- **Exit Criteria:** All high-risk operations are policy-evaluated and compliance-exportable.

### Phase 40: Marketplace and Network Effects

**Objective:** Build defensible marketplace liquidity and trust loops.

**Status:** Forward **Phase D** (P2P match / reputation / escrow). Intent board is lite only.

- [ ] Add reputation engine (execution quality, delivery reliability, dispute rate).
- [ ] Add verified listing metadata and authenticity confidence badges.
- [ ] Add referral and affiliate graph for high-signal participant growth.
- [ ] Add liquidity incentives for market makers and high-integrity sellers.
- **Exit Criteria:** Repeatable buyer/seller retention with measurable liquidity depth growth.

### Phase 41: Intelligence Copilot and Workflow Automation

**Objective:** Turn MSI into an always-on operator assistant.

**Status:** After Phase C (always-on wires). War Room / briefing / why-panels already shipped — do not add Labs copilot pages.

- [ ] Add Copilot workflows (daily brief, rebalance proposal, risk digest, anomaly alerts).
- [ ] Add multi-step automation templates with approvals and rollback paths.
- [ ] Add workspace-level memory and objective tracking for teams.
- [ ] Add explainability cards for all AI recommendations and decisions.
- **Exit Criteria:** Users can run end-to-end workflows with explainable outputs and minimal manual orchestration.

### Phase 42: Ecosystem Expansion and Institutional Distribution

**Objective:** Scale MSI into a broader financial data platform.

**Status:** Forward **Phase E**. Adjacent hobby rail shipped lite (Wave-5); partner marketplace is not Q4.

- [ ] Launch partner app marketplace with secure extension model.
- [ ] Add institutional data feeds, private datasets, and governance-ready sharing.
- [ ] Add enterprise admin console (billing controls, policy templates, tenant analytics).
- [ ] Expand to adjacent collectible classes with shared intelligence core.
- **Exit Criteria:** MSI operates as a multi-tenant platform with ecosystem-level partner adoption.

---

## 6-18 Month Horizon

Clock starts at **T0 (#77)**, not at Wave-5 merge. Pre-T0 months do not count as “Months 0–6.”

### Months 0-6 (after T0)

- Phase A closed; Phase B default-on; Phase C (push + MLB wire) in production.
- Phase 32 exit criteria measurable on live tape. Phase 33 stays advisory until Phase D.
- Reliability SLOs and cost guardrails on the restored cloud. No API-product beta until A–C are boring.

### Months 6-12

- Phase D: execution adapters, controlled Auto-Pilot fills, P2P match/escrow lite, field-loop partner APIs.
- Phase 37–39 only as far as they serve real fills and risk — not IRS theater, not new Labs.
- Production CV only if it beats the disclosed heuristic.

### Months 12-18

- Phase E: real Alpha API keys + webhooks, Guilds, multi-tenant scale.
- Phases 40–42 for network effects and distribution **after** liquidity and execution exist.

---

## Additional Horizon Metrics

- **Execution Reliability:** >= 99% reconciled order lifecycle events.
- **Strategy Adoption:** >= 60% of active users running at least one tracked strategy.
- **Risk Coverage:** 100% of live strategies evaluated by risk policy engine.
- **Marketplace Depth:** 3x increase in verified listing liquidity year-over-year.
- **Platform Growth:** >= 25% of ARR from API/enterprise/platform channels.
