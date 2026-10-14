# Recommended Next Steps — Modern Sports Intelligence

> Refreshed **2026-10-13**. Production on `main` is healthy. Canonical owner checklist: [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) (body refreshed 2026-09-27). Forward narrative: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md). Launch ops: [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md).

## Current state

MSI's **Bloomberg terminal core** is engineering-complete: consensus ledger across Dashboard, War Room, and Audit Dossier; holdings catalysts; Alpha War Room CTA; `/api-licensing` + `/card-show-mode` GA; command palette keeps `/scan` on dashboard. **Eng-safe product waves through [#144](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/144)** (`3ca10f4`, Phase B–D scaffolds, plus the [#145](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/145) follow-up) are on `main`. The Phase B pricing-truth UI scaffold ([#141](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/141), `db907e3`) shipped **without** live flags. Waves 2–5 ([#131](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/131)–[#139](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/139)) shipped earlier. Six of seven catalog betas are `live`; only `fractional-vault` remains `beta` for legal sign-off (2026-09 quarterly sweep — no promotions, no new hides).

**Production (2026-10-13):** healthy on `main` @ [`175d354`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/175d354) from [#173](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/173) (sell planner follows the saved tax-lot method). The planner landed in [#172](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/172) (`2fe2bc2`). Prior book insights remain [`1b65481`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/1b65481) from [#170](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/170). Prior trip loop remains [`505f6e3`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/505f6e3) from [#169](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/169). Prior desk remains [`8dc031d`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/8dc031d) from [#168](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/168). Prior safe dependency land remains [`742bc5e`](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/commit/742bc5e) from [#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166) (Dependency Guardian [#155](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/155)). Toolchain on `main`: Node ≥22.22.2, TypeScript 7 (`@typescript/native` ^7.0.2) side-by-side with the TypeScript 6 API for ESLint, jsdom 30, `tailwindcss` ^4.3.3 ([#161](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/161)), `eslint` ^10.12.0. `@eslint/js` stays on 9.x. Do not add another major migration in an eng-safe PR.

**Hosted data:** Supabase `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) is **ACTIVE_HEALTHY**. Migrations `00001`–`00010` are applied. Production `GET /api/health` is `ok: true` with `config.serverApiAuth: true`. Vercel already has the Supabase URL, anon key, service role, and `ALLOWED_ORIGIN` (presence checked 2026-09-27; re-sync only if those keys rotate). Optional `supabase/migrations/00011_price_history_freshness_sla.sql` stays **file-only**. It is an owner-held optional item. **Engineering agents must not apply it.**

**Still do not claim live Market Movers / SCI Pulse parity** before eBay is live. `npm run ops:check-real-data` is a readiness check for the owner after keys exist. Do not flip `VITE_FF_REAL_*` from an engineering PR.

## Local card-show loop — shipped (2026-10-12 → 2026-10-13)

Owner direction (2026-10-12): local card-show discovery and buying-opportunity surfacing are a **headline** of the platform, and eng-safe daily builds continue toward a complete collector loop on demo/stale tape — deeper than Sports Card Investor / Market Movers on the local book. **[#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) stays the only path to live tape.** That override replaces the older “if #77 slips, do not invent a new product wave” line. It does not authorize secrets, `VITE_FF_REAL_*` flips, applying `00011`, new Labs pages, or live-listings copy.

| Slice                                                                                                            | Where                                                                                                                                                                                   | Honest limit                                                            |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Buying desk** ([#168](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/168), `8dc031d`) | `/local-card-shows` + Dashboard rail. Seeded venue calendar ranked into buy / attend / sell-into-room calls from collection gaps, deal-finder lite, portfolio movers, and the show bag. | Not a promoter scrape. Marks stay demo or stale until eBay is on.       |
| **Trip budget**                                                                                                  | Same desk. Admission + distance-band travel stub + buy reserve − sell credit, against cash the collector is bringing.                                                                   | Travel is a stub, not a fare or hotel quote.                            |
| **Floor calls**                                                                                                  | Same desk. Buy / pass / sell at a typed table price versus the local mark.                                                                                                              | Prices are what you type. Not a live marketplace.                       |
| **Recap into the book**                                                                                          | Same desk. Paper ROI on marked buys, realized gain when a sell has a cost basis, then file the buy or record the sale on the existing collection.                                       | Filing writes the typed row. Not a settlement and not IRS completeness. |

The older `/card-show-planner` demo calendar is unchanged and is not a second source of shows. Card Show Mode stays the bag and floor tools and links here for the trip and recap.

## Portfolio book insights — shipped (#170, `1b65481`)

Sports Card Investor / Market Movers still lead on live tape. On the local book, MSI already has movers and a concentration rail. This desk adds cost-basis P/L, duplicate copies, and slab / era / print-run mix in one place. It reads cards already in the collection. Marks stay demo or stale until eBay is on.

| Slice                        | Where                                                                                                                                                                                         | Honest limit                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Book totals**              | Dashboard rail (after the other local rails) and Collection (above those rails). Preferred mark, purchase plus stored grading / shipping / insurance, unrealized P/L, realized on sold cards. | Not the purchase-only header. A card with no cost stays out of the unrealized percentage. |
| **Cost-basis performers**    | Same desk. Holdings above and below all-in cost.                                                                                                                                              | Not the snapshot mover list.                                                              |
| **Duplicate stacks**         | Same desk. Same player, year, manufacturer, set, and card number. Extra copies are the mark beyond the highest copy, with a graded copy kept on a tie.                                        | Grade and condition can still differ inside a stack.                                      |
| **Slab, era, print-run mix** | Same desk. Grading company or raw, year bucket, and a print run parsed from the end of the set name (`/499`).                                                                                 | Not a Beckett checklist and not a live population report.                                 |

Copy does not claim a live Sports Card Investor portfolio.

## Show alerts and shopping list — this wave

Sports Card Investor and Market Movers still lead on live tape. On the seeded calendar, a collector can arm a home radius and walk into a show with a shopping list built from the watchlist and the local book.

| Slice             | Where                                                                                                                                                                                                                                                                                                                                                                      | Honest limit                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Show alerts**   | `/local-card-shows`. Home city or this browser’s location, a radius, and a lead time. In-app alerts record that many days before a seeded show inside the radius. Browser delivery follows existing quiet hours and browser-notification prefs.                                                                                                                            | Not a promoter feed. Server Web Push still needs owner-held VAPID keys. This change adds none.                          |
| **Shopping list** | Same desk, on each show. Active watchlist targets, collection gaps, and duplicate extras (same player, year, manufacturer, set, and card number). Target buy is the lower of the preferred local mark and the collector target. Extra copies are sell or trade lines. The higher mark stays, and a graded copy wins a tie. A same-player buy turns the extra into a trade. | Not a dealer inventory. Marks stay demo or stale until eBay is on. Grade and condition can still differ inside a stack. |

Copy does not claim a live Market Movers or Sports Card Investor show calendar.

## Watchlist and show alert digest — shipped (#175)

`/alerts` joins two local signals into one in-app list: watchlist marks at least 5% under the collector target, and seeded shows inside the home radius already saved for show alerts.

| Slice              | Where                                                                      | Honest limit                                                        |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Price drops**    | `/alerts`. Active watchlist rows.                                          | Local or demo tape. Not a live print.                               |
| **Show proximity** | Same digest. Home, radius, and lead time from show alerts on this browser. | Seeded calendar. Server Web Push still needs owner-held VAPID keys. |

Copy does not claim a live Market Movers or Sports Card Investor tape.

## Set completion from the book — this change

Collection and `/set-completion` score demo checklists the book has already started. A pinned goal remembers the target on this browser.

| Slice                | Where                                                                               | Honest limit                                                          |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Started-set gaps** | Collection and `/set-completion`. Owned card numbers versus a short demo checklist. | Not a Beckett registry. Sets with no matching card stay off the desk. |
| **Completion goal**  | Same desk. Track to 100% and the percent still left.                                | A local pin. Not a live buy list.                                     |

Copy does not claim a live Market Movers or Sports Card Investor checklist.

## Sell and trade-in planner — shipped (#172 / #173)

The book desk can now name what to sell or trade in. It reads the portfolio insights above (duplicate extras, cost-basis losers, unrealized P/L) and the saved tax-lot method. Marks stay demo or stale until eBay is on.

| Slice                                       | Where                                                                                                                                                                                                                  | Honest limit                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Duplicate extras**                        | Dashboard and Collection, under book insights. Keeps the highest mark (graded on a tie). Names the other copies in FIFO / LIFO / specific-ID / stack-average order.                                                    | Specific ID names nothing until lots are marked on the tax report. A marked keeper is not listed for sale. |
| **Cost-basis losers and long-term winners** | Same desk. Losers use the eBay ~13% fee heuristic. Long-term winners are listed only when they stay ahead after that fee. Short-term winners inside 45 days of long-term treatment are holds.                          | Not a listing and not a dealer bid.                                                                        |
| **Net of fees and wash-sale flag**          | Same desk. Card-show trade-in uses the ~4% fee heuristic. Estimated tax comes from the existing exit simulator. A loss next to a same-card copy bought inside 30 days is held back and the loss is flagged disallowed. | Heuristic only. Not IRS Form 8949 and not a wash-sale determination.                                       |

Copy does not claim a live Sports Card Investor or Market Movers sale feed.

## Mobile polish — shipped (this change)

Touch targets and stacking on the desks a collector actually opens on a phone. No new routes.

| Surface                       | What changed                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Portfolio book insights**   | One-column totals on narrow screens, wrapping names, and a 44px control that moves focus to the sell planner.                                                   |
| **Sell and trade-in planner** | 44px filters and links, stacked rows, wrapping labels.                                                                                                          |
| **`/local-card-shows`**       | 16px city and sport fields (44px tall), 44px comps / collection / show-bag links, location button exposes pressed state. Trip-loop cash and table prices match. |
| **Dashboard show rail**       | Show-desk link is a 44px target.                                                                                                                                |

Show alerts and the shopping list are the section above. The mobile pass does not edit `lib/shows/showBuyingDesk.ts`.

## Eng-safe audit — 2026-10-13

`NEXT_STEPS.md`, [`plans/FEATURE_ROADMAP_REVIEW.md`](plans/FEATURE_ROADMAP_REVIEW.md), and [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md) were checked against `main` @ `fb16a8a`. The sell planner and the mobile pass above shipped in [#172](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/172) / [#173](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/173). Show alerts and the shopping list shipped in [#171](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/171). The watchlist and show alert digest shipped in [#175](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/175). Collection now tracks demo-checklist gaps for sets the book has started. Everything still open besides that tracker is the #77 list below. Left in place on purpose: vanity DNS, a full P2P exchange, production centering CV, IRS completeness, owner VAPID, and live tape. No `VITE_FF_REAL_*` flip, no applied migration, no secret in git.

## Owner-held checklist — [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) (open)

Credentials and dashboards only. This list matches the 2026-09-27 #77 body. Do not set secrets, flip `VITE_FF_REAL_*`, apply migrations, or pause Supabase from an engineering PR.

### Still open

- [ ] **Optional migration `00011`** — freshness SLA columns on `price_history`. The SQL file is in-repo only. The owner may apply it in the SQL editor. Engineering agents must not apply it, and must not treat “env is present” as a signal to apply it.
- [ ] **Stripe lifecycle smoke** — test mode against production: subscribe → upgrade → downgrade → cancel → failed-payment (card `4000 0000 0000 0341`). Webhook deliveries 2xx and the user’s tier updates. Punch-list item 6.
- [ ] **eBay** — `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` on Vercel, then `VITE_FF_REAL_EBAY=true`. Watch deployed-E2E and pricing-truth. Degraded fallback already labels comps `source: 'stale'`.
- [ ] **PSA** (after eBay is stable; not in the same change as `VITE_FF_REAL_EBAY`) — `PSA_API_KEY`, then `VITE_FF_REAL_PSA=true`. Punch-list item 5 still requires the key on **both** runtimes: Vercel (`api/grading/psa/cert.ts`) and the Supabase `verify-psa-cert` secret. A missing Edge secret leaves `/slab-verification` on the mock path.
- [ ] **Optional Sentry** — `VITE_SENTRY_DSN` on Vercel for the Issues UI. First-party `/api/client-error` is already live.
- [ ] **`/audit-trail/admin` confirm** — while signed in as an operator, the page renders and writes an `audit.cross_user_read` row.
- [ ] **`fractional-vault` legal sign-off** — securities review of the “Simulation only” disclosure. No engineering blocker. On approval, flip catalog `beta` → `live` in `lib/utils/featureCatalog.ts`.
- [ ] **Full multi-provider key-rotation drill** — the Supabase cutover is logged (2026-07-18). The quarterly drill still needs Stripe staging keys. Runbook: [`plans/incidents/key-rotation-drill.md`](plans/incidents/key-rotation-drill.md).

### Already done on #77

- [x] Restore Supabase `vhbsokjqchaafluimgjh` — **ACTIVE_HEALTHY** (confirmed 2026-09-27). Do not pause it from an engineering PR.
- [x] Vercel Supabase env presence — URL, anon key, service role, and `ALLOWED_ORIGIN` on production.
- [x] Migrations `00001`–`00010` applied; `admin-audit-events` deployed (2026-07-18).
- [x] Health ok and `config.serverApiAuth: true`.
- [x] RLS verification secrets and the July anon smoke.
- [x] First-party error telemetry (`VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY`).
- [x] GDPR export and delete.
- [x] First admin bootstrap (`msi-launch-admin@example.com`).
- [x] First key-rotation drill log (Supabase cutover).
- [x] Quarterly catalog sweep (2026-09-05) — `fractional-vault` stayed beta. See [`docs/BETA_EXIT_READINESS_PASS.md`](docs/BETA_EXIT_READINESS_PASS.md).
- [x] Collection list/grid action parity — [#115](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/115) (`760def1`, 2026-09-05).

Leave #77 **open** until the unchecked items land.

## Bloomberg program — status

| Bet                       | Engineering                                                                        | Owner blocker                                            |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Consensus pricing ledger  | ✅ `lib/pricing/consensusMarketLedger` + Dashboard strip + `/api/market/consensus` | Flip `VITE_FF_REAL_EBAY` when keys set                   |
| Holdings-linked news rail | ✅ Dashboard `HoldingsCatalystRail` + `/catalyst-market`                           | Optional `VITE_FF_REAL_SPORTS` later                     |
| War Room as Alpha home    | ✅ Dashboard CTA + ledger context in committee prompts                             | Live tape when eBay flag on                              |
| Institutional export      | ✅ `/audit-dossier` + consensus ledger strip + Schedule D–style packet             | Full IRS regulatory completeness still legal-gated       |
| Developer API desk        | ✅ `/api-licensing` GA; demo metering opt-in / watermarked                         | Real Alpha key issuance later                            |
| Dealer mobile loop        | ✅ `MOBILE_NAV` + floor-loop CTAs; `/scan` palette intent preserved                | Field friction at a real show                            |
| eBay / PSA tape           | ✅ adapters + readiness script (+ Stripe/Sentry presence checks)                   | **Owner keys, then one flag at a time** (eBay, then PSA) |

## Shipped eng-safe detail (2026-09)

> Ship notes for Waves 2–5 and the Phase B–D scaffolds. The **2026-10-12 #77 checklist above is the live owner list.** A footer here that still says “Vercel env sync,” “restore,” or “apply `00011` after env sync” is superseded. The [Forward roadmap](#forward-roadmap-post-eng-safe) below is the current sequence.

## Eng-safe Phase B–D scaffolds — Shipped (2026-09-15, #144 / #145)

Demo/DAL-safe. **No secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no jsPDF on live briefing paths, no `fractional-vault` promotion.** Copy does **not** claim live Market Movers / SCI Pulse parity. [#144](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/144) (`3ca10f4`) plus [#145](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/145) are on `main`. This was the last eng-safe product wave before owner-held #77 keys — not a signal to apply migrations or flip flags.

| Slice                                   | Where                                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Freshness SLA helpers + UI**          | `lib/pricing/freshnessSla.ts` — stamp (≤2d / 3–6d / ≥7d) + tape (≤30d / 31–89d / ≥90d). Badges on Pulse, War Room, Pricing Truth Health, and provenance chips.       |
| **Provenance completeness**             | Confidence only when a sold-comp / thin-tape formula exists (or a stored model score). Preferred valuation stays sold → historical → AI.                             |
| **`price_history` SLA SQL (file only)** | `supabase/migrations/00011_price_history_freshness_sla.sql` — **not applied**. Optional owner SQL-editor item. Engineering agents must not apply it.                 |
| **Server Web Push scaffold**            | `GET/POST /api/push/subscribe` reads `WEB_PUSH_VAPID_*` at runtime, **503 VAPID_UNSET** when missing. Wave-4 client calls the route when configured. No keys in git. |
| **MLB catalyst / PvP wire adapters**    | `lib/integrations/mlbLiveWire.ts` — seeded fallback default; live path structured behind owner sports flag/env. Honest disclosure.                                   |
| **P2P matching lite**                   | Local crossings + reputation stub + escrow **state machine / ledger stubs** on `msi_p2p_intents_v1`. No real money.                                                  |
| **Auto-Pilot adapter + pause**          | Advisory execution stub, kill-switch, global pause. Collars/replay wired. Still no live marketplace fills.                                                           |
| **Show-floor partner stubs**            | Typed show-bag contracts; local bag remains source of truth.                                                                                                         |
| **API licensing + webhooks (lite)**     | Scoped demo tokens + watermarked metering. `valuation.updated` / `alert.triggered` no-op dispatcher gated by `MSI_WEBHOOK_DISPATCH`.                                 |

**Owner-held remainder:** see the 2026-10-12 #77 checklist at the top (optional `00011`, Stripe smoke, eBay then PSA, optional Sentry, admin-audit confirm, legal, rotation drill). Restore and Vercel Supabase env presence are done.

**Out of scope for that wave:** jsPDF on live briefing; new Labs pages; applying `00011` from an agent; live non-MLB sports wires; production CV; IRS completeness; real Alpha key issuance DB. Tailwind 4 and ESLint 10 later landed as dependency bumps on `main`; `@eslint/js` stayed on 9.x. Do not add more major churn.

## Phase B pricing-truth UI scaffold — Shipped (2026-09-10)

Demo/DAL-safe. **No Supabase restore, no secrets, no `VITE_FF_REAL_*` flips, no new Labs pages, no Tailwind 4 / `@eslint/js` 10 half-migrate, no jsPDF on live briefing paths.** `fractional-vault` stays `beta` (legal). Copy does **not** claim live Market Movers / multi-marketplace parity.

| Slice                            | Where                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source-priority model**        | `lib/pricing/pricingTruth.ts` — eBay/sold comps → historical/thin tape → AI/estimate. Collection, Dashboard, Favorites, watchlist, Compare use preferred marks. |
| **Stale + low-liquidity badges** | Portfolio cards / list rows, Dashboard recents, Favorites, watchlist targets. Thresholds disclosed (7d stamp, 90d tape, ≤2 comps, score &lt; 40).               |
| **Provenance chip**              | Source, freshness, confidence if modeled else `conf unknown`, comps count + rationale tooltip. Wired into Comps Used / preferred valuation surfaces.            |
| **Adapters ready**               | Live eBay flag still off. `Live comps` label only when `VITE_FF_REAL_EBAY` is on.                                                                               |

**Owner-held remainder:** eBay then PSA keys on #77 (restore and Vercel Supabase env presence are done). Full Phase B exit = live tape + freshness SLA. Do not claim live Market Movers / SCI parity before that.

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

**Owner-held remainder:** the 2026-10-12 #77 checklist (not a fresh Vercel env sync). Vanity DNS, production centering CV, IRS completeness, and owner VAPID values stay out of eng-safe PRs.

**Deferred from this wave (point-in-time):** jsPDF/html2canvas on the live entry graph; new Labs pages; live non-MLB sports wires; a new `price_history` table beyond optional file-only `00011`; partner show-bag APIs; full P2P matching/escrow; production CV; IRS completeness. Tailwind CSS 4 and ESLint 10 later landed as dependency bumps; do not start another major migration.

## Forward roadmap (post-eng-safe)

Waves 2–5 and the #141 / #144 scaffolds closed the first engineering-safe consumer-intel gap **on the local book**. Owner direction (2026-10-12) keeps eng-safe product depth in scope while [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) is open — including the card-show loop above — so a slipped #77 is not a reason to stop demo-tape buildout. **#77 remains the only path to live tape.** Do not flip `VITE_FF_REAL_*`, apply `00011`, or claim live Market Movers / SCI Pulse parity before eBay is live. Owner narrative: [`plans/PRODUCT_ROADMAP_2026Q4.md`](plans/PRODUCT_ROADMAP_2026Q4.md).

### Competitive positioning

| Capability                                                                 | MSI                                     | Market Movers / Sports Card Investor |
| -------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------ |
| Agents, War Room, why / consensus                                          | **Lead**                                | Absent                               |
| Tax / fiscal (lots, ST/LT, wash-sale, sell / trade-in planner)             | **Lead** (advisory; not IRS-complete)   | Thin or absent                       |
| Audit dossier + admin trail                                                | **Lead**                                | Absent                               |
| Card-show floor loop (discover, trip, floor, recap, alerts, shopping list) | **Lead** (seeded calendar + local book) | Absent                               |
| Ratio intel, movers, deals, compare, whale list, wax/TCG                   | **Parity-plus on local book** (Wave-5)  | Strong on live tape                  |
| Live multi-marketplace sold comps                                          | Behind #77                              | **They lead until Phase A**          |
| Live Market Pulse / hobby indexes                                          | Seeded + local Δ                        | **They lead until Phase A**          |

### Phase A — Unlock trusted book (#77) — OWNER ONLY

Do not implement keys, apply `00011`, or pause the project from an engineering PR. Restore and Vercel Supabase env presence are **done**. Ordered remainder:

1. ~~Restore Supabase `vhbsokjqchaafluimgjh`~~ — **done (ACTIVE_HEALTHY)**. ~~Vercel Supabase env presence~~ — **done** (URL / anon / service role / `ALLOWED_ORIGIN`). Re-sync only if those keys rotate — [`docs/DEPLOY_ENV_CHECKLIST.md`](docs/DEPLOY_ENV_CHECKLIST.md).
2. Optional `00011_price_history_freshness_sla.sql` — **file-only**. Owner SQL editor only. Agents must not apply it.
3. Stripe lifecycle smoke — [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md) item 6
4. eBay → server keys, then `VITE_FF_REAL_EBAY` (observe deployed-E2E + pricing-truth)
5. PSA (after eBay is stable; not in the same change) — `PSA_API_KEY` on **both** runtimes, then `VITE_FF_REAL_PSA`:
   - Vercel `PSA_API_KEY` → `api/grading/psa/cert.ts`
   - Supabase secret `PSA_API_KEY` + `verify-psa-cert` deployed → `/slab-verification` (`lookupPsaCert`). Missing this secret falls back to mock.
6. Optional Sentry DSN, `/audit-trail/admin` confirm, `fractional-vault` legal, full multi-provider key-rotation drill

Track on [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

### Phase B — Pricing truth default (eng, after eBay live)

Phase 32 style. Consensus / Comps Used / Collection chips already exist.

**UI scaffold shipped (2026-09-10, this PR):** sold-comp / consensus is the display default on Collection grid/list, Dashboard recents + NAV, Favorites, watchlist/targets, and Compare when comps exist — **even while `VITE_FF_REAL_EBAY` is off**. Honest labels (`Sold comps` / `Thin sold comps` / `AI estimate`); `Live comps` only if the owner-held flag is on. Stale (7d stamp or 90d tape) and thin-tape / low-liquidity (≤2 comps or score &lt; 40) badges plus a compact provenance tooltip (source, freshness, disclosed confidence or `conf unknown`, comps count) on those surfaces. Classifiers live in `lib/pricing/pricingTruth.ts` with Vitest coverage.

**Code remainder shipped (2026-09-15, #144):** freshness SLA helpers + Pulse / War Room / chip badges; confidence only when a formula exists; `00011_price_history_freshness_sla.sql` **file only** (optional owner SQL; agents must not apply it). **Full Phase B exit still needs** [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) live eBay tape + SLA against real comps. Do not flip `VITE_FF_REAL_*` from this class of PR. Do not claim live Market Movers / SCI parity before that tape is on.

### Phase C — Always-on alerts & wires

- **Server Web Push scaffold shipped (2026-09-15):** `/api/push/subscribe` refuses loudly without owner VAPID. Client Wave-4 path calls it when configured. **Keys still owner-held.**
- **MLB catalyst / PvP wire adapters shipped:** seeded fallback default; live structure behind owner sports flag. Honest disclosure — not a live tape.

### Phase D — Real trading moat

- **P2P matching lite shipped:** local suggestions + reputation stub + escrow state-machine UI / ledger stubs. No real money.
- **Execution adapter stub + kill-switch / global pause shipped.** Still no live marketplace fills.
- **Show-floor partner client stubs shipped.** Local show bag remains source of truth.
- Production CV **only if** it beats the disclosed heuristic

### Phase E — Platform

- Real Alpha API keys + webhooks
- Alpha Guilds
- Risk / compliance depth (not IRS theater)
- Multi-tenant scale

### 30 / 60 / 90 — T0 = Phase A complete

**T0** is the day [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closes. Restore, migrations `00001`–`00010`, health, `serverApiAuth`, and Vercel Supabase env presence are already done, so the critical path inside Phase A is **Stripe lifecycle smoke + eBay live**. PSA stays off until eBay is stable. Optional `00011` does not gate T0 and must not be applied by an agent. If #77 slips, **the clock does not start**.

Eng-safe Phase B–D **scaffolds already shipped** before T0 (#141 / #144) with flags off. That does not start the live-tape clock.

| Window      | Outcome                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-T0**  | Finish the open #77 items. Eng-safe demo-tape depth may continue (owner override, 2026-10-12). No new Labs. Do not flip both real-data flags. Do not apply `00011`. |
| **T0 + 30** | eBay tape observed. PSA on **both** runtimes only if eBay is stable. Live Phase B exit started.                                                                     |
| **T0 + 60** | Phase B default-on + freshness SLA against real comps. Phase C started (Web Push or MLB wire).                                                                      |
| **T0 + 90** | Phase C usable. Phase D scoped. Phase E waits until A–C are boring.                                                                                                 |

### Explicit non-goals (still)

No new Labs pages. Tailwind CSS 4 (`tailwindcss` ^4.3.3) and ESLint 10 are already on `main`; `@eslint/js` stays 9.x — do not start another major migration. Do not flip both real-data flags at once. Do not pause Supabase or apply `00011` from an engineering PR. Do not put secrets in git. Do not promote `fractional-vault` without legal. Do not put jsPDF on live briefing paths. Do not claim live SCI / Market Movers Pulse parity before eBay is live.

## Older wave logs (point-in-time)

> Superseded for sequencing. Use the 2026-10-12 #77 checklist. Lines below that say the project is paused, that restore or Vercel env sync is still open, or that Tailwind is still on 3.4.19 described an earlier week.

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

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

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

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

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

**Owner list at the time of this wave (superseded):** see the 2026-10-12 #77 checklist. Restore is done.

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

**Deferred this pass (2026-09-08, superseded on toolchain):** Tailwind was still on 3.4.19 that week. `tailwindcss` ^4.3.3 landed later in [#161](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/161); `eslint` is ^10.12.0; `@eslint/js` stayed on 9.x. Do not start another major migration. Full P2P order book / exchange, production centering CV / PSA-grade model, and a custom vanity domain stayed open.

Owner list at the time of this wave (superseded): see the 2026-10-12 #77 checklist. Restore is done.

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

Owner list at the time of this wave (superseded): see the 2026-10-12 #77 checklist. Restore is done.

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

**Activation infra is done and the project is ACTIVE_HEALTHY** (confirmed 2026-09-27, still the status as of this 2026-10-12 refresh). Migrations `00001`–`00010` are applied on `vhbsokjqchaafluimgjh`, Edge Functions were deployed, `msi-launch-admin@example.com` was promoted, and the cutover is logged as the first rotation drill (`plans/incidents/key-rotation-drill.md`, entry `2026-07-18`). Health is `ok: true` with `config.serverApiAuth: true`. Do not pause the project and do not re-run a restore from an engineering PR. The owner check still open is a real login: **confirm `/audit-trail/admin` renders and writes an `audit.cross_user_read` row while signed in as an operator**.

## Platform & toolchain hardening — Shipped (2026-08-01 → 2026-08-13)

Two security findings surfaced through the Dependabot queue and were traced to a
single root cause: the Node 20 floor had fallen behind what the ecosystem ships.

| Change                                                    | Detail                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Node floor 20 → 22** (`def3e06`)                        | `.nvmrc` = `22`, `engines.node` = `>=22.22.2`. Every workflow reads `.nvmrc`; `rls-verify.yml` already pinned 22 independently.                                                                                                                                                                                                              |
| **jsdom 29 → 30** (`def3e06`)                             | Required the Node bump (jsdom 30 floor is `^22.22.2`). Pulls patched `undici@^8.9.0`, closing 5 high-severity advisories.                                                                                                                                                                                                                    |
| **`brace-expansion` → 5.0.9** (`e47efc8`)                 | Override bump; closes the DoS that bypassed the CVE-2026-14257 mitigation.                                                                                                                                                                                                                                                                   |
| **TypeScript 7.0.2** (`49c077e`, #102)                    | TS 7 has no programmatic compiler API, so `typescript` is aliased to `@typescript/typescript6` for typescript-eslint while TS 7 installs as `@typescript/native`. No bin collision — the TS 6 alias ships its binary as `tsc6`, so `tsc` is unambiguously 7.0.2.                                                                             |
| **Stripe API version sync** (#97, later #105 / `10407e1`) | `stripe@22.x` `apiVersion` pin follows the 2026 dahlia generation.                                                                                                                                                                                                                                                                           |
| **Dependabot queue**                                      | August pass drained #89 and #92–#103. Later safe bumps continued through [#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166) (`742bc5e`, 2026-10-12) from Dependency Guardian [#155](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/155). No open pull requests as of 2026-10-12. |

Why it matters beyond hygiene: the `undici` advisories were failing
`npm audit --audit-level=high` on `main` itself, so the `CI / CD` gate was red
for every contributor until the Node floor moved. **Contributors on Node 20 must
upgrade** — `npm ci` will refuse the engine constraint.

## Status of the June recommendation (implemented on the July-3 branch)

| Item                                    | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P0 — open-PR queue (#74, #75, #59, #58) | ✅ Resolved: dependency groups applied here with the Stripe `apiVersion` fix #74 was missing; #59's goal already shipped on main (June 10 consolidation); #58's unique audit work (filters/search/CSV/pagination + runbook + admin spec) ported here. All four closed as superseded.                                                                                                                                                                                                                   |
| P1 — punch-list items 1/3/4             | ✅ Items 1/3/4 done (2026-07-18): new Supabase project linked, secrets set, RLS smoke green locally, health `serverApiAuth: true`, Deployed E2E live. **2026-10-12:** `vhbsokjqchaafluimgjh` is ACTIVE_HEALTHY again; Vercel Supabase env presence is confirmed; health and `serverApiAuth` still hold. The September “INACTIVE / re-sync first” caveat is superseded. Remaining owner punch-list is the #77 checklist at the top (Stripe smoke, eBay then PSA, optional Sentry). GDPR closed 2026-08. |
| P2 — beta exits                         | ✅ `provenance-chain` live · ✅ `liquidity-pool` live · ✅ `fractional-vault-v2` removed (duplicate). ✅ `vision-grading` live. **2026-09 sweep:** remaining `fractional-vault` stays `beta` (legal sign-off — no engineering).                                                                                                                                                                                                                                                                        |
| P3 — integration depth                  | ✅ eBay comp pagination (offset pages), last-known-good comps served as `source: 'stale'` on live failure, PSA `CertVerifiedBadge` on any card with a `certNumber`.                                                                                                                                                                                                                                                                                                                                    |
| P4 — onboarding                         | ✅ Scan-first empty state, `/demo-flow` tour link, first-card pricing toast pointing at the data-source badge.                                                                                                                                                                                                                                                                                                                                                                                         |

## Priority 1 — Remaining owner-held launch actions

> **Superseded as a checklist by the 2026-10-12 #77 section at the top.** `vhbsokjqchaafluimgjh` is **ACTIVE_HEALTHY**. Migrations `00001`–`00010`, Edge Functions, and the July 18 auth redirect allowlist still stand. Vercel Supabase env presence is confirmed. Optional `00011_price_history_freshness_sla.sql` is file-only — the owner may apply it in the SQL editor; **agents must not**. Abandoned project `iwxqemiqtusgmemlnrby` is unused. **Do not pause from an engineering PR.**

**CI hygiene shipped (engineering):** Deployed E2E on push to `main`; RLS verification fails closed when secrets missing; all workflows now run Node 22 via `.nvmrc`. Tracked in [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

0. **Phase 31 activation** (infra done; one owner check left — item 3):
   1. ~~Apply migrations / deploy Edge Functions~~ — done on `vhbsokjqchaafluimgjh` (2026-07-18). `00001`–`00010` are applied. Do not apply `00011` from an agent.
   2. ~~Assign first admin~~ — `msi-launch-admin@example.com` promoted (`npm run ops:promote-admin`). Promote a personal email the same way after signup.
   3. Confirm `/audit-trail/admin` + `audit.cross_user_read` row while signed in as an admin.
   4. ~~First key-rotation drill~~ — Supabase cutover logged in `plans/incidents/key-rotation-drill.md` (full multi-provider quarterly drill still needs Stripe staging keys).
1. ~~**RLS verification secrets**~~ — set; anon smoke green in July.
2. ~~**Server API auth on the deployment**~~ — `config.serverApiAuth: true` (confirmed with health `ok: true`).
3. ~~**Error telemetry**~~ — `/api/client-error` + `VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY=true`. Optional: add `VITE_SENTRY_DSN` for Issues UI.
4. **Stripe lifecycle smoke** — needs Stripe test keys on Vercel (punch-list item 6). Restore is no longer the blocker.
5. ~~**GDPR endpoints**~~ — export E2E green on prod; delete cascade fixed (`profiles` before `auth.users`).

## Priority 2 — Turn on real data (eBay, then PSA)

**Prerequisite:** project is ACTIVE_HEALTHY and Vercel Supabase env is already present. Re-sync (`docs/DEPLOY_ENV_CHECKLIST.md`) only if those keys rotate. Do not set keys or flip `VITE_FF_REAL_*` from an engineering PR. Do not turn eBay and PSA on in the same change.

`npm run ops:check-real-data` is the owner readiness check once keys exist.

1. Set `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` + `VITE_FF_REAL_EBAY=true`; watch Deployed E2E + pricing-truth for a few days. Stale-comp fallback already labels `source: 'stale'`.
2. Then PSA on **both** runtimes (`PSA_API_KEY` on Vercel **and** Supabase `verify-psa-cert`) + `VITE_FF_REAL_PSA=true`. Cert badges and `/slab-verification` switch from demo/mock to live.

## Priority 3 — Last beta exit

- `fractional-vault`: legal/securities sign-off on the "Simulation only" disclosure. No engineering blocker — on approval, flip the catalog status.
- (`vision-grading` exited earlier: the image-handling decision matches `visual-audit` — in-session only, never persisted — and is pinned by tests.)

## Sustained dev experience (background, not blocking)

- Keep merging grouped dependency PRs promptly so they don't pile up. **No open pull requests as of 2026-10-12.** Latest safe patch/minor land is [#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166) (`742bc5e`) from Dependency Guardian [#155](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/155). The weekly report ([#50](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/50) / #155) can stay open as an issue; that is not an open PR. Do not take majors that #166 excluded (`@eslint/js` 10, a `lucide-react` jump, another Tailwind major).
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- **Quarterly catalog sweep — completed 2026-09-05.** Next due ~2026-12. Features `beta` for 90+ days either go `live` or get hidden. `fractional-vault` is still the only remaining beta and is legal-gated.
- The first key-rotation drill is logged (Supabase cutover, `2026-07-18`). The **full multi-provider quarterly drill** still needs Stripe staging keys — it rolls up with Priority 1 item 4.
- Watch for `typescript-eslint` shipping native TS 7 support ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)); when it lands, the `@typescript/typescript6` alias in `package.json` can be dropped and `typescript` pointed straight at 7.x.

## What NOT to do next

1. **Don't add Labs features.** The surface is settled; the work is exits, not entries.
2. **Don't restructure directories.** The DAL and chunk graph are stable; churn buys nothing.
3. **Don't flip both real-data flags at once.** eBay first, observe, then PSA — the degraded-fallback paths get their first production exercise.
4. **Don't let `main` idle behind open PRs again.** The deployed-E2E gate exists precisely so merging is cheap. As of 2026-10-12 there are none.
5. **Don't pause Supabase from an engineering PR.** The project is ACTIVE_HEALTHY. Owner-held dashboard action only.
6. **Don't set real API keys or `VITE_FF_REAL_*` in git or in this class of PR.**
7. **Don't apply `00011_price_history_freshness_sla.sql`.** It stays file-only until the owner chooses the SQL editor.
8. **Don't put secrets in git, jsPDF on live briefing paths, or live Market Movers / SCI parity claims in copy** before eBay is live.
9. **Don't start another Tailwind or ESLint major migration.** `tailwindcss` ^4.3.3 and `eslint` ^10.12.0 are already on `main`; `@eslint/js` stays 9.x.

## Key references

| Purpose                       | File                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Owner-held launch ops         | `docs/LAUNCH_OPS_PUNCH_LIST.md`                                                     |
| Env checklist (presence done) | `docs/DEPLOY_ENV_CHECKLIST.md` (unpause steps apply only if a future pause happens) |
| Beta status / criteria        | `docs/BETA_FEATURE_EXIT_CRITERIA.md`, `docs/BETA_EXIT_READINESS_PASS.md`            |
| Admin audit viewer design     | `plans/admin-audit-viewer-spec.md`                                                  |
| Key-rotation runbook          | `plans/incidents/key-rotation-drill.md`                                             |
| MVP launch scope              | `docs/MVP_LAUNCH_SCOPE.md`                                                          |
| Production rollout            | `docs/PRODUCTION_ROLLOUT_PHASES.md`                                                 |
| Rollback runbook              | `docs/ROLLBACK_AND_STABILIZATION.md`                                                |
| Coverage policy               | `docs/COVERAGE_POLICY.md`                                                           |
| Labs boundary                 | `lib/productionLaunch.ts`                                                           |
| Forward roadmap (post Wave-5) | `plans/PRODUCT_ROADMAP_2026Q4.md`                                                   |
| Feature inventory vs catalog  | `plans/FEATURE_ROADMAP_REVIEW.md`                                                   |
