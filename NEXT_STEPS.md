# Recommended Next Steps — Modern Sports Intelligence

> Refreshed 2026-09-10 · **Phase B pricing-truth UI scaffold** shipped (sold-comp default + stale/thin badges; flags off). Wave-5 (`#139` / `b1a6ca5`) + roadmap `#140` / `17762ff`. Forward plan: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md).

## Current state in one paragraph

MSI's **Bloomberg terminal core** is engineering-complete: consensus ledger across Dashboard, War Room, and Audit Dossier; holdings catalysts; Alpha War Room CTA; `/api-licensing` + `/card-show-mode` GA; command palette keeps `/scan` on dashboard. Coverage whitelist includes ledger + War Room context. The toolchain is current — Node ≥22.22.2, TypeScript 7.0.2 (side-by-side with the TS 6 API for ESLint), jsdom 30 — and `npm audit --audit-level=high` was clean at the August pass. **#115** (2026-09-05, `760def1`) closed Collection list/grid action parity. Six of seven catalog betas are `live`; only `fractional-vault` remains on legal (2026-09 quarterly sweep confirmed — no promotions, no new hides). **Hosted data is paused:** Supabase project `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) is **INACTIVE** so Pulse can use the free-plan slot. Restore that project and re-sync Vercel/GitHub env before any owner-held live-data step. **Still owner-held (blocking “trusted book”):** Stripe smoke, **eBay then PSA live keys**, optional Sentry DSN, personal admin promote, admin-audit confirm — check `npm run ops:check-real-data` only after restore.

## Bloomberg program — status

| Bet                       | Engineering                                                                        | Owner blocker                                      |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Consensus pricing ledger  | ✅ `lib/pricing/consensusMarketLedger` + Dashboard strip + `/api/market/consensus` | Flip `VITE_FF_REAL_EBAY` when keys set             |
| Holdings-linked news rail | ✅ Dashboard `HoldingsCatalystRail` + `/catalyst-market`                           | Optional `VITE_FF_REAL_SPORTS` later               |
| War Room as Alpha home    | ✅ Dashboard CTA + ledger context in committee prompts                             | Live tape when eBay flag on                        |
| Institutional export      | ✅ `/audit-dossier` + consensus ledger strip + Schedule D–style packet             | Full IRS regulatory completeness still legal-gated |
| Developer API desk        | ✅ `/api-licensing` GA; demo metering opt-in / watermarked                         | Real Alpha key issuance later                      |
| Dealer mobile loop        | ✅ `MOBILE_NAV` + floor-loop CTAs; `/scan` palette intent preserved                | Field friction at a real show                      |
| eBay / PSA tape           | ✅ adapters + readiness script (+ Stripe/Sentry presence checks)                   | **Keys on Vercel** (after restore)                 |

## Phase B pricing-truth UI scaffold — Shipped (2026-09-10)

Demo/DAL-safe. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on live briefing paths.** `fractional-vault` stays `beta` (legal). Copy does **not** claim live Market Movers / multi-marketplace parity.

| Slice                            | Where                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source-priority model**        | `lib/pricing/pricingTruth.ts` — eBay/sold comps → historical/thin tape → AI/estimate. Collection, Dashboard, Favorites, watchlist, Compare use preferred marks. |
| **Stale + low-liquidity badges** | Portfolio cards / list rows, Dashboard recents, Favorites, watchlist targets. Thresholds disclosed (7d stamp, 90d tape, ≤2 comps, score &lt; 40).               |
| **Provenance chip**              | Source, freshness, confidence if modeled else `conf unknown`, comps count + rationale tooltip. Wired into Comps Used / preferred valuation surfaces.            |
| **Adapters ready**               | Live eBay flag still off. `Live comps` label only when `VITE_FF_REAL_EBAY` is on.                                                                               |

**Still owner-held:** #77 restore + eBay/PSA keys. Full Phase B exit = live tape + freshness SLA.

## September 2026 Wave-5 — Shipped (2026-09-10)

Demo/DAL-safe deepenings so a serious collector/investor prefers MSI over **Sports Card Investor / Market Movers** _before_ #77 live eBay/PSA keys — while keeping disclosures honest. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.** `fractional-vault` stays `beta` (legal).

| Slice                                 | Label                                    | Where                                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ratio intelligence reports**        | **deepen** (beat Market Movers headline) | Grade / player / variation price-ratio panels from local + sold-comp / consensus marks on Collection, Dashboard, and War Room. Thin tape and heuristic 9/10 fills stay labeled.                                    |
| **Collection & Favorites Top Movers** | **lite**                                 | Portfolio-relative and favorites movers (%, $) from stored snapshots then dated comps. Dashboard, Collection, Favorites, War Room. Empty/thin states honest — not a global live feed.                              |
| **Deal Finder lite**                  | **lite**                                 | Watchlist / target / holding-scan candidates below consensus or fee-aware eBay break-even. Disclosed 15% “great deal” threshold. Existing pricing/comp paths only.                                                 |
| **Market Pulse / hobby indexes**      | **deepen**                               | Multi-segment Pulse (sport / era / sealed-vs-singles) on Dashboard + Collection; Macro-Sentinel chips; terminal quote table uses local Δ instead of random. Seeded + local — **not** live SCI Market Pulse parity. |
| **Card Compare desk**                 | **deepen**                               | `/compare` now desks 2–3 cards: marks, comps used, ratios, ST/LT, concentration. Collection per-card action + 2–3 select “Compare desk”. No new Labs route.                                                        |
| **Whale Collection list**             | **lite** (Priority 6.2)                  | Virtualized list (tanstack) above 24 rows; memoized rows; stable virtual keys on grid + list. Grid was already virtualized.                                                                                        |
| **Sealed wax / TCG parity lite**      | **lite**                                 | Adjacent hobby rail (Pokémon / MTG / memorabilia) on Dashboard + Collection next to sports Pulse. Disclosed proxies.                                                                                               |

### vs Sports Card Investor / Market Movers

MSI now covers **ratio intel + collection/favorites movers + deals + multi-segment Pulse + 2–3 card compare + whale-scale list** on top of the institutional stack SCI lacks (War Room, Auto-Pilot, tax lots, wash-sale, Negotiation Arena, consensus ledger, audit dossier, card-show loop, agent why/consensus). Live eBay/PSA tape and SCI-style marketplace scrapes remain owner-held (#77) — copy does not claim live Market Movers parity.

**Still owner-held (do not start from this PR):** #77 Supabase restore, Stripe / eBay / PSA keys, Sentry DSN, fractional-vault legal, vanity DNS, full P2P exchange, production centering CV, IRS tax-lot regulatory completeness, server-triggered Web Push (VAPID + backend).

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs; full P2P matching/escrow; production CV; IRS completeness.

## Forward roadmap (post-eng-safe)

Waves 2–5 closed the engineering-safe consumer-intel gap. Remaining unlock is owner-held [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77). Owner narrative: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md). If #77 slips, **Phase A is the only critical path**.

### Competitive positioning

| Capability                                               | MSI                                    | Market Movers / Sports Card Investor |
| -------------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| Agents, War Room, why / consensus                        | **Lead**                               | Absent                               |
| Tax / fiscal (lots, ST/LT, wash-sale, Fiscal Shield)     | **Lead** (advisory; not IRS-complete)  | Thin or absent                       |
| Audit dossier + admin trail                              | **Lead**                               | Absent                               |
| Card-show floor loop                                     | **Lead**                               | Absent                               |
| Ratio intel, movers, deals, compare, whale list, wax/TCG | **Parity-plus on local book** (Wave-5) | Strong on live tape                  |
| Live multi-marketplace sold comps                        | Behind #77                             | **They lead until Phase A**          |
| Live Market Pulse / hobby indexes                        | Seeded + local Δ                       | **They lead until Phase A**          |

### Phase A — Unlock trusted book (#77) — OWNER ONLY

Do not implement keys or restore the project from this (or any engineering) PR. Ordered:

1. Restore Supabase `vhbsokjqchaafluimgjh` + Vercel / GitHub env sync — [`docs/DEPLOY_ENV_CHECKLIST.md`](docs/DEPLOY_ENV_CHECKLIST.md)
2. Stripe lifecycle smoke — [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md) item 6
3. eBay → server keys, then `VITE_FF_REAL_EBAY` (observe deployed-E2E + pricing-truth)
4. PSA (after eBay is stable) — **both** runtimes, then `VITE_FF_REAL_PSA`:
   - Vercel `PSA_API_KEY` → `api/grading/psa/cert.ts`
   - Supabase secret `PSA_API_KEY` + `verify-psa-cert` deployed → `/slab-verification` (`lookupPsaCert`). Missing this secret falls back to mock.
5. Optional: Sentry DSN, `/audit-trail/admin` confirm, `fractional-vault` legal, full key-rotation drill

Track on [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

### Phase B — Pricing truth default (eng, after eBay live)

Phase 32 style. Consensus / Comps Used / Collection chips already exist.

**UI scaffold shipped (2026-09-10, this PR):** sold-comp / consensus is the display default on Collection grid/list, Dashboard recents + NAV, Favorites, watchlist/targets, and Compare when comps exist — **even while `VITE_FF_REAL_EBAY` is off**. Honest labels (`Sold comps` / `Thin sold comps` / `AI estimate`); `Live comps` only if the owner-held flag is on. Stale (7d stamp or 90d tape) and thin-tape / low-liquidity (≤2 comps or score &lt; 40) badges plus a compact provenance tooltip (source, freshness, disclosed confidence or `conf unknown`, comps count) on those surfaces. Classifiers live in `lib/pricing/pricingTruth.ts` with Vitest coverage.

**Full Phase B exit still needs** [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) live eBay tape + freshness SLA against real comps. Optional `price_history` once cloud is restored — not before. Do not flip `VITE_FF_REAL_*` from this class of PR.

### Phase C — Always-on alerts & wires

- Server Web Push (VAPID + backend). Client Push readiness shipped Wave-4
- Live sports catalysts / PvP wires — **MLB first**

### Phase D — Real trading moat

- P2P matching + reputation + escrow (intent board is lite only)
- Execution adapters + Auto-Pilot **controlled** fills
- Show-floor field loop / partner APIs
- Production CV **only if** it beats the disclosed heuristic

### Phase E — Platform

- Real Alpha API keys + webhooks
- Alpha Guilds
- Risk / compliance depth (not IRS theater)
- Multi-tenant scale

### 30 / 60 / 90 — T0 = Phase A complete

**T0** is the day [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closes: restore + Vercel env sync + Stripe smoke + eBay live. PSA may still be pending (eBay-first). If #77 slips, **the clock does not start** — Phase A stays the only critical path.

| Window      | Outcome                                                                               |
| ----------- | ------------------------------------------------------------------------------------- |
| **Pre-T0**  | Phase A only. No B–E, no Labs, no both-flags-at-once.                                 |
| **T0 + 30** | eBay tape observed. PSA on **both** runtimes only if eBay is stable. Phase B started. |
| **T0 + 60** | Phase B default-on + freshness SLA. Phase C started (Web Push or MLB wire).           |
| **T0 + 90** | Phase C usable. Phase D scoped. Phase E waits until A–C are boring.                   |

### Explicit non-goals (still)

No new Labs pages. No Tailwind 4 / `@eslint/js` 10 as roadmap items. Do not flip both real-data flags at once. Do not restore Supabase from engineering PRs. Do not promote `fractional-vault` without legal. Do not claim live SCI / Market Movers Pulse parity before Phase A.

## September 2026 Wave-4 — Shipped (2026-09-10)

Demo/DAL-safe deepenings on existing Alerts / Profile / Notification Center, Negotiation Arena, Migration Banner / Profile, Collection / Fiscal / Tax, ProtectedRoute, and the offline banner. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

| Slice                                | Label                              | Where                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web Push subscription lite**       | **lite** (Priority 2.2 remainder)  | Client Push API / service-worker readiness on Alert delivery (Alerts / Profile / Notification Center). Endpoint persisted via `msi_web_push_subscription_v1`. Quiet hours + browser-notification prefs still gate delivery. Honest copy: **server-triggered push still needs owner-held VAPID keys + a backend** — no VAPID secrets in git. |
| **Negotiation Arena UX**             | **deepen** (Priority 4.1)          | Agent-thinking animation + seller-firmness / sentiment meter on the existing Arena modal. Gemini firmness when the generate path returns a score; deterministic demo fallback otherwise. Still advisory — not live marketplace trading.                                                                                                     |
| **Field-level migration merge**      | **deepen** (Priority 1.2 leftover) | Duplicate inventory / target preview now lists key field conflicts (mark, cost, dates, grade, notes, status) on Migration Banner + Profile. Demo-safe when cloud is unavailable. No restore.                                                                                                                                                |
| **Holding horizon / wash-sale rail** | **lite**                           | Days held, ST vs LT, and 30-day repurchase proximity on Collection, Fiscal Shield, and Tax Report. Uses local lot dates. **Not** tax advice or IRS completeness.                                                                                                                                                                            |
| **ProtectedRoute loading polish**    | **leftover** (Priority 1.1)        | Session shell stays up until `INITIAL_SESSION` **and** profile are ready (`loading` or `profileLoading`). Auth security model unchanged.                                                                                                                                                                                                    |
| **Offline sync status**              | **lite**                           | Pending / failed counts + retry / requeue on the offline banner and Profile Data Management. Real MSI-store queue only — no mock pending rows.                                                                                                                                                                                              |

**Still owner-held (do not start from this PR):** #77 Supabase restore, Stripe / eBay / PSA keys, Sentry DSN, fractional-vault legal, vanity DNS, full P2P exchange, production centering CV, IRS tax-lot regulatory completeness.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs; full P2P matching/escrow; production CV; IRS completeness; server-triggered Web Push (VAPID + backend).

## September 2026 Wave-3 — Shipped (2026-09-08)

Demo/DAL-safe deepenings on existing Collection, Dashboard, Soccer Hub, Fiscal / Tax Report, War Room Auto-Pilot, and Alerts / Profile / Notification Center. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

| Slice                                   | Label                                    | Where                                                                                                                                                                                                                                                 |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portfolio concentration / risk rail** | **lite** (extends trade-proposal math)   | Player + league share of local NAV on Collection + Dashboard. 35% heuristic threshold. Advisory rebalance hints link to existing trade proposals (`/collection`) or Auto-Pilot (`/war-room`). Local inventory only.                                   |
| **Fee-aware break-even strip**          | **lite** (extends Break-Even calculator) | Collection grid/list + Exit Strategy + `BreakEvenModal`. Purchase + grading + shipping + selectable eBay ~13% / COMC / MySlabs / custom presets via `breakEvenService`. Full calculator now wired from card actions.                                  |
| **Soccer hub player/team desks**        | **parity** (NBA/NFL/NHL Wave-2 pattern)  | `/soccer-hub` Players + Teams desks + `LeaguePerformanceVsPricePanel` bound to collection marks. Seeded/heuristic disclosure and empty-bind state. Live soccer wires still unconfigured.                                                              |
| **Capital gains exit simulator**        | **lite** (Phase 27 Fiscal Shield)        | Sell-this-year vs next ST/LT compare via `FiscalService.simulateExit` on Tax Report, Fiscal Shield widget, Tax Exit Simulator, and Collection sell modal. Advisory only — **not** IRS regulatory completeness.                                        |
| **Auto-Pilot decision replay**          | **lite** (Phase 33 exit criteria)        | Day-bucketed local replay (`msi_autopilot_replay_v1`) of actions considered, collars, approvals, and NAV preview snapshot. War Room Auto-Pilot surface. No live marketplace execution.                                                                |
| **SyncScheduler product defaults**      | **lite** (Priority 2.2 leftover)         | Signed-in / demo daily portfolio+watchlist defaults remembered via `msi_sync_product_defaults_v1`. Opt-in toggle on Alert delivery (Alerts / Profile / Notification Center). Quiet hours still suppress haptics + Notification API. **Not** Web Push. |

**Still owner-held (do not start from this PR):** #77 Supabase restore, eBay/PSA/Stripe keys and smokes, fractional-vault legal flip, custom vanity DNS, full P2P exchange, production centering CV, IRS tax-lot regulatory completeness.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; Web Push / server push; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs; full P2P matching/escrow.

## Post-#130 / September 2026 Wave-2 — Shipped (2026-09-08)

Demo/DAL-safe batch on existing Alerts / Profile / Notification Center, Dashboard + NBA/NFL/NHL hubs, Collection, Card Show Mode, and War Room Auto-Pilot. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on these live paths.**

**What already shipped through #130:** Scout-to-Acquire Playwright smoke; thin P2P intent board; `@google/genai` 2.x; adjacent hobby correlation (lite); price-alert haptics; disclosed centering heuristic (lite). Plus the 2026-09-07 engineering batch (seasonal windows, catalysts, MLB PvP, pop weighting, trade proposals, briefing HTML, Auto-Pilot idempotency / collars, Consensus View, Comps Used, tax-lot selector).

| Slice                                  | Label                                           | Where                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Alert quiet hours + channel prefs**  | **lite** (extends #130 haptics)                 | `msi_alert_preferences_v1` via MSI store. Quiet hours, haptic on/off, Notification API on/off. Gated on NotificationService / haptics / watchlist / target-price / syncScheduler. Settings on `/alerts`, Profile Native Experience, Notification Center prefs. In-app alerts still record. **Not** Web Push. |
| **Non-MLB Performance vs Price**       | **partial** (parity with MLB Dashboard binding) | NBA / NFL / NHL hubs + Dashboard when those leagues are selected. Seeded `getStatLeaders` bound to collection marks. Disclosed heuristic — not a live feed.                                                                                                                                                  |
| **Local valuation / price sparklines** | **lite**                                        | Collection grid + list from stored snapshots, then dated sold comps. Thin/empty states stay honest. **No** new Supabase `price_history` table.                                                                                                                                                               |
| **Card-show “show bag”**               | **lite**                                        | Printable/checklist packing list from swipe-triage review + consignment + active targets + Card Show supplies. `/card-show-mode` + Collection mobile. Local-only.                                                                                                                                            |
| **Grading ROI lite**                   | **lite** (Priority 3.2)                         | Raw vs PSA 9/10 on Collection from sold-comp titles or disclosed multipliers + economy fee. Live PSA owner-held.                                                                                                                                                                                             |
| **Auto-Pilot NAV + tax preview**       | **lite** (Phase 33 leftover)                    | War Room cycle preview: before/after NAV and rough ST/LT tax via `FiscalService.simulateExit`. Advisory — no live execution.                                                                                                                                                                                 |

**Still owner-held (do not start from this PR):** #77 Supabase restore, eBay/PSA/Stripe keys and smokes, fractional-vault legal flip, custom vanity DNS, full P2P exchange, production centering CV, IRS tax-lot regulatory completeness.

**Deferred / not this wave:** Tailwind 4; `@eslint/js` 10; jsPDF/html2canvas on live entry graph; Web Push / server push; new Labs pages; live non-MLB sports wires; new `price_history` table; partner show-bag APIs.

## Engineering-friendly NEXT_STEPS — Shipped (2026-09-08)

Demo/DAL-safe slices. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages.**

| Slice                                             | Where                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scout-to-Acquire Playwright smoke**             | `tests/e2e/scout-to-acquire.spec.ts` — demo login, seeded Collection holding, Dashboard → War Room scout desk, Acquisition campaign persist. Added to `test:e2e:smoke`. No live Gemini refresh click. |
| **Thin P2P intent board** (roadmap #7 lite)       | Collection panel + Liquidity Pool summary. Local bids/asks via `msi_p2p_intents_v1`. **Not** live trading, matching, escrow, or MSI-house inventory.                                                  |
| **`@google/genai` 2.x**                           | Major bump; `generateContent` / `Type` adapters unchanged (v2 breaks Interactions only).                                                                                                              |
| **Adjacent hobby correlation** (roadmap #15 lite) | Seeded Pokémon / MTG / memorabilia on existing Cross-Asset Correlation page, dashboard widget, and correlation modals. Disclosed synthetic proxies — **not** live feeds. No new Labs pages.           |
| **Price-alert haptics** (roadmap #2)              | Vibration API on watchlist / target-price / NotificationService paths (`lib/utils/haptics.ts`). No-ops on desktop.                                                                                    |
| **Centering heuristic** (roadmap #17 lite)        | Disclosed non-CV geometry/metadata stub on Visual Audit + Centering Analyzer. **Not** a production CV model and **not** a PSA prediction. No heavy CV library.                                        |

**Deferred this pass:** Tailwind 4 (high-risk class/config migration — left on 3.4.19; do not half-migrate). `@eslint/js` 10 (eslint major yak-shave; keep `@eslint/js` 9.x with eslint 10). Full P2P order book / exchange. Production centering CV / PSA-grade model. Custom vanity domain.

Still owner-held: Supabase restore, Stripe smoke, eBay/PSA keys, optional Sentry DSN, fractional-vault legal flip.

## Engineering-friendly NEXT_STEPS — Shipped (2026-09-07, post-#123)

Demo/DAL-safe product slices on existing Dashboard, Collection, Morning Briefing, and Auto-Pilot surfaces. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages.**

| Slice                                                    | Where                                                                                                                                                                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Seasonal Buy/Sell windows** (roadmap #11)              | Seeded calendar (spring training / All-Star / playoffs / off-season) on Dashboard + Collection rails and per-card chips. Heuristic disclosure — not live tape.                                                             |
| **Injury / transaction catalysts** (roadmap #9)          | `HoldingsCatalystRail` + `CatalystEngine` seeded injury/DFA/call-up cards for matching holdings. Not a live sports wire.                                                                                                   |
| **Performance vs Price** (MLB binding)                   | Dashboard binds `StatsService` / mlbApi hitting lines to collection marks on an existing Recharts composed chart.                                                                                                          |
| **Pop / scarcity weighting** (Priority 3.1 lite)         | `popReport` hydrates from a simulated model when live PSA is unavailable; Alpha Score applies a Pop 1 / low-pop premium; list/grid badges stay honest about source.                                                        |
| **Trade proposal / portfolio delta** (Priority 4.2 lite) | Advisory “Card A for Card B + cash” from local inventory on Collection. Not a P2P marketplace.                                                                                                                             |
| **Morning briefing visual fidelity** (Priority 5.1 lite) | In-modal league-allocation bars + text/HTML download via `leagueAllocation` (no jsPDF/html2canvas on the live briefing path).                                                                                              |
| **Auto-Pilot idempotency stub** (Phase 33 leftover)      | Day-bucketed local keys + duplicate-action guards in `AutonomousExecutionService`. Still advisory — no live execution.                                                                                                     |
| **Agent Consensus View** (roadmap #14)                   | Per-agent Buy / Wait / Hold / Sell stances + split summary on Analyst War Room and Outcome Memory. Builds on `WhyRecommendationPanel` / `agentReasoning`. Missing stances disclosed, never invented.                       |
| **Comps Used** (roadmap #10)                             | Collection grid + list show the sold/historical comps that underpin `preferredValuationForCard`. Thin tape and AI-only paths stay labeled.                                                                                 |
| **Tax-lot method selector**                              | FIFO / LIFO / Specific ID / Average persist via MSI store (`msi_tax_lot_preferences`) and drive Fiscal Intelligence + `/tax-report`. Lot-selection math is unit-tested. **Not** IRS regulatory completeness.               |
| **Auto-Pilot collars + approval**                        | Daily budget, per-asset cap, max drawdown stop; high-dollar or low-confidence actions go to the human approval queue. Acquisition campaigns preview the same collars. Advisory stays default — no live marketplace trades. |

**Deferred / skipped that pass:** Scout-to-Acquire Playwright E2E and thin P2P intent board shipped 2026-09-08. Full P2P order book, production centering CV, custom vanity domain still open.

Still owner-held: Supabase restore, Stripe smoke, eBay/PSA keys, optional Sentry DSN, fractional-vault legal flip.

## Collection list/grid action parity — Shipped (2026-09-05)

[#115](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/115) squash-merged to `main` (`760def143b6dd79251674c5cd37dfc8c4ec24787`). Collection **list view** now exposes the same per-card actions as grid (watchlist, consignment, sold vault, dossier). No remaining engineering on that gap.

## Quarterly catalog sweep — Done (2026-09-05)

Audit of `lib/utils/featureCatalog.ts` + route supplement + `DISCOVERABLE_FEATURE_CATALOG` gating. Full notes: [`docs/BETA_EXIT_READINESS_PASS.md`](docs/BETA_EXIT_READINESS_PASS.md) § September 2026 sweep.

| Outcome              | Detail                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stayed beta**      | `fractional-vault` — legal/securities-gated; do **not** flip to `live`                                                                                                                                                                            |
| **Hidden / demoted** | None this cycle. Default discovery already excludes `beta` and `demo`                                                                                                                                                                             |
| **Already gone**     | `fractional-vault-v2` was removed earlier (duplicate of v1)                                                                                                                                                                                       |
| **GA honesty**       | Wave-3 exits (`provenance-chain`, `vision-grading`, `liquidity-pool`, `visual-audit`, `live-impact`) remain `live`. Auto-supplement “Demo-grade surface” rows stay `demo` and stay out of Feature Directory unless `VITE_FF_ENABLE_DEMO_SURFACES` |
| **Next sweep**       | ~2026-12                                                                                                                                                                                                                                          |

## Phase 31 — Shipped (2026-07-04 → 2026-07-05)

| Piece                                                                   | Where                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| User audit timeline (`/audit-trail`) with filters/search/CSV/pagination | `pages/AuditTrail.tsx`, `components/audit/*`, `lib/utils/auditTrail*`                                              |
| Admin cross-user viewer (`/audit-trail/admin`)                          | `pages/AdminAuditTrail.tsx`, `components/AdminRoute.tsx`                                                           |
| Server-side cross-user read + audit-of-audit write                      | `supabase/functions/admin-audit-events/index.ts`                                                                   |
| `profiles.role` (member/support/admin) + RLS + trigger guard            | `supabase/migrations/00008_profiles_role.sql` + `00010_profiles_role_fixes.sql` (the P1 recursion + trigger fixes) |
| `operatorRole` + `profileLoading` on AuthContext                        | `contexts/AuthContext.tsx`                                                                                         |
| Key-rotation runbook                                                    | `plans/incidents/key-rotation-drill.md`                                                                            |
| Design reference (post-implementation)                                  | `plans/admin-audit-viewer-spec.md`                                                                                 |

**Activation is done except one check — and the project is now paused.** Migrations `00001`–`00010` were applied on `vhbsokjqchaafluimgjh` in July, Edge Functions were deployed, `msi-launch-admin@example.com` was promoted, and the cutover is logged as the first rotation drill (`plans/incidents/key-rotation-drill.md`, entry `2026-07-18`). **Restore the project before repeating any of those checks.** The single item left is owner-held and needs a real login: **confirm `/audit-trail/admin` renders and writes an `audit.cross_user_read` row while signed in as an operator** (Priority 1, item 0.3).

## Platform & toolchain hardening — Shipped (2026-08-01 → 2026-08-13)

Two security findings surfaced through the Dependabot queue and were traced to a
single root cause: the Node 20 floor had fallen behind what the ecosystem ships.

| Change                                                    | Detail                                                                                                                                                                                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node floor 20 → 22** (`def3e06`)                        | `.nvmrc` = `22`, `engines.node` = `>=22.22.2`. Every workflow reads `.nvmrc`; `rls-verify.yml` already pinned 22 independently.                                                                                                                                  |
| **jsdom 29 → 30** (`def3e06`)                             | Required the Node bump (jsdom 30 floor is `^22.22.2`). Pulls patched `undici@^8.9.0`, closing 5 high-severity advisories.                                                                                                                                        |
| **`brace-expansion` → 5.0.9** (`e47efc8`)                 | Override bump; closes the DoS that bypassed the CVE-2026-14257 mitigation.                                                                                                                                                                                       |
| **TypeScript 7.0.2** (`49c077e`, #102)                    | TS 7 has no programmatic compiler API, so `typescript` is aliased to `@typescript/typescript6` for typescript-eslint while TS 7 installs as `@typescript/native`. No bin collision — the TS 6 alias ships its binary as `tsc6`, so `tsc` is unambiguously 7.0.2. |
| **Stripe API version sync** (#97, later #105 / `10407e1`) | `stripe@22.x` `apiVersion` pin follows the 2026 dahlia generation.                                                                                                                                                                                               |
| **Dependabot queue**                                      | August pass drained #89 and #92–#103. Subsequent weekly bumps through #114 (fflate) landed on `main`. No open Dependabot PRs as of 2026-09-05.                                                                                                                   |

Why it matters beyond hygiene: the `undici` advisories were failing
`npm audit --audit-level=high` on `main` itself, so the `CI / CD` gate was red
for every contributor until the Node floor moved. **Contributors on Node 20 must
upgrade** — `npm ci` will refuse the engine constraint.

## Status of the June recommendation (implemented on the July-3 branch)

| Item                                    | Status                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 — open-PR queue (#74, #75, #59, #58) | ✅ Resolved: dependency groups applied here with the Stripe `apiVersion` fix #74 was missing; #59's goal already shipped on main (June 10 consolidation); #58's unique audit work (filters/search/CSV/pagination + runbook + admin spec) ported here. All four closed as superseded.                                                                                           |
| P1 — punch-list items 1/3/4             | ✅ Items 1/3/4 done (2026-07-18): new Supabase project linked, secrets set, RLS smoke green locally, health `serverApiAuth: true`, Deployed E2E live. **2026-09 caveat:** that project is now INACTIVE/paused — restore + Vercel env sync before treating health/RLS as current. Remaining punch-list: Stripe smoke, eBay/PSA keys, optional Sentry DSN (GDPR closed 2026-08). |
| P2 — beta exits                         | ✅ `provenance-chain` live · ✅ `liquidity-pool` live · ✅ `fractional-vault-v2` removed (duplicate). ✅ `vision-grading` live. **2026-09 sweep:** remaining `fractional-vault` stays `beta` (legal sign-off — no engineering).                                                                                                                                                |
| P3 — integration depth                  | ✅ eBay comp pagination (offset pages), last-known-good comps served as `source: 'stale'` on live failure, PSA `CertVerifiedBadge` on any card with a `certNumber`.                                                                                                                                                                                                            |
| P4 — onboarding                         | ✅ Scan-first empty state, `/demo-flow` tour link, first-card pricing toast pointing at the data-source badge.                                                                                                                                                                                                                                                                 |

## Priority 1 — Remaining owner-held launch actions

> **Supabase (2026-09-05):** Project `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) is **INACTIVE / paused** so Pulse can occupy the free-plan slot. July 18 cutover (schema + migrations `00001`–`00010`, Edge Functions, auth `site_url` + redirect allowlist, Vercel/GitHub env) still stands as the last successful activation — it is **not** currently live. Old abandoned project `iwxqemiqtusgmemlnrby` is unused. **Do not restore or pause from an engineering PR.** Owner: restore in the Supabase dashboard, then `docs/DEPLOY_ENV_CHECKLIST.md` § Supabase unpause + Vercel env sync, before Stripe smoke, eBay/PSA flags, or admin-audit confirm.

**CI hygiene shipped (engineering):** Deployed E2E on push to `main`; RLS verification fails closed when secrets missing; all workflows now run Node 22 via `.nvmrc`. Tracked in [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

0. **Phase 31 activation** (infra done in July; restore first; one owner check left — item 3):
   1. ~~Apply migrations / deploy Edge Functions~~ — done on `vhbsokjqchaafluimgjh` (2026-07-18). Re-verify after restore if the pause dropped functions.
   2. ~~Assign first admin~~ — `msi-launch-admin@example.com` promoted (`npm run ops:promote-admin`). Promote your personal email the same way after signup.
   3. Confirm `/audit-trail/admin` + `audit.cross_user_read` row while signed in as an admin.
   4. ~~First key-rotation drill~~ — Supabase cutover logged in `plans/incidents/key-rotation-drill.md` (full multi-provider quarterly drill still needs Stripe staging keys).
1. ~~**RLS verification secrets**~~ — set; anon smoke green in July. Re-run after restore.
2. ~~**Server API auth on the deployment**~~ — `config.serverApiAuth: true` when the project was active.
3. ~~**Error telemetry**~~ — `/api/client-error` + `VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY=true`. Optional: add `VITE_SENTRY_DSN` for Issues UI.
4. **Stripe lifecycle smoke** — needs Stripe test keys on Vercel (punch-list item 6). Blocked on restore if webhooks read `profiles`.
5. ~~**GDPR endpoints**~~ — export E2E green on prod; delete cascade fixed (`profiles` before `auth.users`).

## Priority 2 — Turn on real data (eBay, then PSA)

**Prerequisite:** restore `vhbsokjqchaafluimgjh` and sync Vercel env (`docs/DEPLOY_ENV_CHECKLIST.md`). Do not set keys or flip `VITE_FF_REAL_*` from an engineering PR.

Check readiness anytime after restore: `npm run ops:check-real-data`.

1. Set `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` + `VITE_FF_REAL_EBAY=true`; watch Deployed E2E + pricing-truth for a few days. Stale-comp fallback already labels `source: 'stale'`.
2. Then PSA on **both** runtimes (`PSA_API_KEY` on Vercel **and** Supabase `verify-psa-cert`) + `VITE_FF_REAL_PSA=true`. Cert badges and `/slab-verification` switch from demo/mock to live.

## Priority 3 — Last beta exit

- `fractional-vault`: legal/securities sign-off on the "Simulation only" disclosure. No engineering blocker — on approval, flip the catalog status.
- (`vision-grading` exited earlier: the image-handling decision matches `visual-audit` — in-session only, never persisted — and is pinned by tests.)

## Sustained dev experience (background, not blocking)

- Keep merging the grouped Dependabot PRs promptly so they don't pile up again. No open Dependabot PRs as of 2026-09-05 — the Dependency Guardian report ([#50](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/50)) runs weekly.
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- **Quarterly catalog sweep — completed 2026-09-05.** Next due ~2026-12. Features `beta` for 90+ days either go `live` or get hidden. `fractional-vault` is still the only remaining beta and is legal-gated.
- The first key-rotation drill is logged (Supabase cutover, `2026-07-18`). The **full multi-provider quarterly drill** still needs Stripe staging keys — it rolls up with Priority 1 item 4.
- Watch for `typescript-eslint` shipping native TS 7 support ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)); when it lands, the `@typescript/typescript6` alias in `package.json` can be dropped and `typescript` pointed straight at 7.x.

## What NOT to do next

1. **Don't add Labs features.** The surface is settled; the work is exits, not entries.
2. **Don't restructure directories.** The DAL and chunk graph are stable; churn buys nothing.
3. **Don't flip both real-data flags at once.** eBay first, observe, then PSA — the degraded-fallback paths get their first production exercise.
4. **Don't let `main` idle behind open PRs again.** The deployed-E2E gate exists precisely so merging is cheap.
5. **Don't restore or pause Supabase from an engineering PR.** Owner-held dashboard action only.
6. **Don't set real API keys or `VITE_FF_REAL_*` in git or in this class of PR.**

## Key references

| Purpose                         | File                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| Owner-held launch ops           | `docs/LAUNCH_OPS_PUNCH_LIST.md`                                          |
| Env sync after Supabase unpause | `docs/DEPLOY_ENV_CHECKLIST.md` (§ Supabase unpause + Vercel env sync)    |
| Beta status / criteria          | `docs/BETA_FEATURE_EXIT_CRITERIA.md`, `docs/BETA_EXIT_READINESS_PASS.md` |
| Admin audit viewer design       | `plans/admin-audit-viewer-spec.md`                                       |
| Key-rotation runbook            | `plans/incidents/key-rotation-drill.md`                                  |
| MVP launch scope                | `docs/MVP_LAUNCH_SCOPE.md`                                               |
| Production rollout              | `docs/PRODUCTION_ROLLOUT_PHASES.md`                                      |
| Rollback runbook                | `docs/ROLLBACK_AND_STABILIZATION.md`                                     |
| Coverage policy                 | `docs/COVERAGE_POLICY.md`                                                |
| Labs boundary                   | `lib/productionLaunch.ts`                                                |
| Forward roadmap (post Wave-5)   | `plans/PRODUCT_ROADMAP_2026Q4.md`                                        |
| Feature inventory vs catalog    | `plans/FEATURE_ROADMAP_REVIEW.md`                                        |
