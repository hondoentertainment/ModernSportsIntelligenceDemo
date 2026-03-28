# Feature roadmap review — phased inventory

**Purpose:** Single document to review **what exists in the product**, **what is production-grade vs demo/beta**, and **what remains open**.  
**Sources:** `PRD.md` §4 & §14, `lib/utils/featureCatalog.ts`, `PRODUCTION_READINESS.md`, `plans/next-steps-recommendation.md`, `plans/roadmap-review-and-enhancements.md`, routing in `App.tsx`.

**Last updated:** March 24, 2026

---

## 1. How to read this doc

| Tag | Meaning |
|-----|--------|
| **Shipped** | User-visible flow exists (page, modal, or shell in the SPA). |
| **Live** | `featureCatalog` marks `status: 'live'` (treated as default product surface). |
| **Beta** | `featureCatalog` marks `status: 'beta'` — UX exists; needs live data, policy, or validation before “subscriber-grade.” |
| **Cloud-backed** | Portfolio/targets can persist via DAL / Supabase when configured (not pure local-only). |
| **Open** | Missing, stubbed, mock-heavy, or explicitly called out in PRD/plans as next work. |

**Important:** The app has **180+ routed/named surfaces** in the PRD inventory; `FEATURE_CATALOG` currently lists **100** curated entries (88 **live**, 12 **beta**). Many additional pages exist as lazy routes without a separate catalog row — they still count as **Shipped (demo surface)**.

---

## 2. Executive snapshot

| Dimension | State |
|-----------|--------|
| **Feature catalog (curated)** | 100 entries — **88 live**, **12 beta**, **0 coming-soon** |
| **Routing** | 100+ lazy-loaded pages in `App.tsx` (full vertical: portfolio, trading, intelligence, frontier) |
| **Data** | DAL + `useSupabaseInventory`; local → cloud **migration** with merge summaries in UI; consignment snapshot **embedded in card notes** for sync |
| **Auth** | Supabase + demo mode; password reset; **ProtectedRoute** loading shell + session alignment on `INITIAL_SESSION` |
| **Ops** | Vercel, GitHub Actions, health API, rate limits on serverless routes, optional Sentry, CSP Report-Only |
| **Tests** | Vitest (lib/components), Playwright E2E (incl. collection add-asset); coverage policy documented |

**Strategic gap (from roadmap review):** Largest remaining risk is **pricing truth** (AI + partial real comps vs pervasive verified sold data) and **financial/regulatory depth** (full tax-lot rigor, observability at scale).

---

## 3. Phased review (product phases)

### Phase block A — Core platform (catalog phases ~1–14)

| Area | Implemented (high level) | Open / next |
|------|---------------------------|-------------|
| **Dashboard** | NAV-style hub, widgets, market pulse concepts | Deeper default use of verified comps; performance budgets on largest charts |
| **Collection** | Inventory + sold vault, OCR/vision ingest, grading/scarcity UI, virtualized grid, bulk actions, **consignment** modal + **status + Supabase notes codec**, return-to-collection, **stale valuation / thin market** chips, **portfolio stats** helper for header tiles | List view parity with grid actions; optional dedicated DB columns for consignment vs notes |
| **Watchlist / targets** | Targets tab in Collection flow; alerts surfaces | Server-driven push beyond on-device notifications (if product requires) |
| **Deep search / audit** | Routes `/deep-search`, `/audit` | Tighter coupling to live indices where applicable |
| **MLB / players / teams / games / trends / compare** | Routed pages, data layers (mix of live + simulated) | Non-MLB hubs depth per PRD “in progress” |
| **Auth & profile** | Login, signup, forgot/reset password, demo; Profile + **migration policy** + **last uplink merge line** | Tier gates + RLS breadth verification per env |
| **Billing** | Stripe surfaces, webhooks, docs | Enterprise / SSO out of scope here |
| **Social / hype** | Feed patterns, public portfolio concepts | Full P2P marketplace (roadmap recommendation) |

---

### Phase block B — Competitive moat (catalog ~15–38)

| Area | Implemented | Open / next |
|------|-------------|-------------|
| **15 Mobile / PWA** | Service worker, offline shell, mobile nav, swipe/haptics patterns | Battle-test offline edge cases; barcode flow completion per roadmap |
| **16 Agentic negotiation** | Negotiation UI, **playbooks**, tests | Bundle/lot negotiation; Gemini-deepened counters; **analytics dashboard** (win rate, discount) |
| **17 Liquidity / consignment** | Instant-sell concept, **ConsignmentService** (local history), **card-level consignment** + cloud sync | P2P order book (roadmap); MSI-house execution rails |
| **18 Predictive alpha** | Modals / engines (prototype) | Live injury/transaction feeds; comp regression layer |
| **19 Multi-agent** | Workspace / thesis patterns | Explicit conflict UI; audit trail of agent reasoning |
| **20 Liquidity intelligence** | Scores, badges, market depth modals | Exchange-grade depth where APIs allow |
| **21 Cross-asset correlation** | **Beta** in catalog; hedging UI concepts | Live cross-asset data feeds |
| **22 Fiscal** | Tax-lot style tooling in product (**live** in catalog) | FIFO/LIFO/specific ID **regulatory completeness**; Schedule D-grade exports |
| **23 Visual audit / grading** | Vision / prediction modals (**beta** elements) | Centering CV; production vision pipeline |
| **24 Macro sentinel** | Signals / monitoring patterns | “Hobby health index” style composite (frontier) |
| **25–31 Tools** | Break-even, insurance report, what-if, grading planner, eBay listing gen, wax ROI, etc. (mostly **live**) | Polish + data provenance labels everywhere |
| **35 Consignment tracker** | Catalog still **beta**; **now includes inventory lifecycle + return flow** | Align catalog copy with Supabase persistence; partner APIs if any |
| **38 Anomaly detection** | **Beta** | Live anomaly feeds |

---

### Phase block C — Advanced intelligence (catalog ~39–63)

| Area | Implemented | Open / next |
|------|-------------|-------------|
| **Trading / rules / reports** | Trade block concepts, rules engine UI, PDF/exports, benchmarks | Idempotent automation + approvals (frontier) |
| **Technical analysis / time machine / goals** | Shipped surfaces | Historical price table in Supabase (roadmap recommendation) |
| **Notifications** | `/alerts`, scheduler hooks | Web push + server triggers at scale |
| **Data import** | Hub patterns | Reduce remaining direct `localStorage` in services (`PRODUCTION_READINESS`) |

---

### Phase block D — Differentiated & industry-first (catalog ~64–73+)

| Area | Implemented | Open / next |
|------|-------------|-------------|
| **Stress testing, grade predict, tax harvest** | Live surfaces | Test coverage on all financial outputs |
| **Live game impact** | **Beta** | Real play-by-play + pricing link |
| **Vision grading lab** | **Beta** | Production model + cert integration |
| **Fractional / provenance** | **Beta** / live mix | Execution rails |
| **Live breaks** | Live route | Marketplace integrations depth |

---

### Phase block E — Bloomberg-grade & catalog “extra” routes

Large set of **live** routes in `featureCatalog` (e.g. War Room, Builder, Leaderboard, OCR, Liquidity Twin, Catalyst Market, Frontier Lab family, v5/v6 style pages: genome sequencer, injury oracle, forensics lab, …).  

**Implemented:** Page shells, services, and demos.  
**Open:** Per-feature graduation via `docs/BETA_FEATURE_EXIT_CRITERIA.md` and data backends.

---

## 4. Cross-cutting engineering phases (production readiness)

Aligned with `PRODUCTION_READINESS.md` (not the same numbering as product “Phase 15” in the PRD).

| Theme | Implemented | Open |
|-------|-------------|------|
| **DAL / Supabase** | `lib/dal.ts`, migrations, RLS docs, `useSupabaseInventory` | Migrate remaining services off raw `localStorage` |
| **Auth** | Session refresh, recovery flow, **loading UX** on protected routes | CSRF/rate limits on any new mutating public API |
| **API** | `api/ai/generate`, `api/market/ebay`, Zod, rate limit, logging | Broader tracing/metrics (roadmap 30–90 day plan) |
| **Security** | Headers, CSP Report-Only, sanitization, payment docs | Enforce CSP when rollout complete |
| **Testing** | Vitest + Playwright + coverage thresholds | Raise coverage on NAV/ROI/tax paths; more E2E critical paths |
| **Observability** | `reportError`, optional Sentry | Error budgets, dashboards |

---

## 5. PRD §14 roadmap alignment

| PRD bucket | In this codebase (summary) |
|------------|----------------------------|
| **Completed v1–v3** | Broad feature surface + analytics + social + gamification (see PRD) |
| **In progress v4** | Multi-sport hubs, vision engine, PWA, marketplace integrations, insurance/appraisal, offline — **partially** reflected in pages + `PRODUCTION_READINESS` |
| **Planned v5** | Draft Night, Options Desk, Condition Census, Break-Even Velocity, Tax Autopilot, Card Show GPS, Rookie Contract Correlation, Bankruptcy Shield, **Negotiation Coach** (overlap with existing coach page — verify product scope), Multi-Gen Compare |
| **Frontier v5.1+** | Agent memory, market truth ledger, counterparty passport, catastrophe sim, immunization, synthetic index, regulatory/narrative trackers — **mostly future / partial prototypes** |

---

## 6. Net-new recommendations still “open” (from roadmap review)

These were proposed as **high-value additions**; overlap with existing tools is noted in `plans/roadmap-review-and-enhancements.md`.

| Item | Status in product |
|------|-------------------|
| Insurance-grade report | Partially addressed by insurance report / dossier — **extend** for carrier-ready packets |
| Break-even calculator | **Shipped** (catalog + UI) |
| What-if simulator | **Shipped** (route) |
| Grading batch planner | **Shipped** |
| eBay listing generator | **Shipped** |
| Collection embed / vanity URL | **Partial** — public portfolio exists; **embed/widget** can deepen |
| Wax break ROI | **Shipped** |
| Tax-lot accounting (full) | **Open** (major regulatory lift) |
| P2P marketplace | **Open** |
| Negotiation analytics | **Open** |
| Agent transparency / audit | **Open** |
| Visual centering / grade probability | **Open** (vision roadmap) |
| Hobby health index | **Open** |

---

## 7. `featureCatalog` — beta list (explicit)

These 12 entries are **beta** until exit criteria are met (data, policy, tests):

1. Agentic negotiation  
2. Institutional liquidity pool  
3. Predictive alpha engine  
4. Multi-agent intelligence  
5. Cross-asset correlation (moat row)  
6. Visual audit simulation  
7. Consignment tracker *(inventory sync recently added — revisit status in catalog when you formalize exit criteria)*  
8. Market anomaly detection  
9. Live game impact engine  
10. AI vision grading lab  
11. Fractional vault & copy-trading  
12. Provenance chain & digital twin  

---

## 8. Suggested review cadence

1. **Quarterly:** Pick 5–10 **beta** features and either graduate them (data + tests + copy) or demote scope.  
2. **Per release:** Update this doc’s “Last updated” and the **Open** columns for anything touched.  
3. **Single source of tension:** Keep `featureCatalog.status` in sync with reality for the 100 curated IDs; use PRD §4 for the full 180+ inventory.

---

## References

- `PRD.md` — full feature table & §14 roadmap  
- `lib/utils/featureCatalog.ts` — curated 100-feature registry  
- `PRODUCTION_READINESS.md` — engineering/production phases  
- `plans/next-steps-recommendation.md` — stabilization & intelligence priorities  
- `plans/roadmap-review-and-enhancements.md` — gap analysis & net-new ideas  
- `docs/BETA_FEATURE_EXIT_CRITERIA.md` — how to exit beta  
