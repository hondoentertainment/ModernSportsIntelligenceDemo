# Product roadmap — post Wave-5 (2026 Q4)

**Audience:** owner / Kyle  
**Status:** refreshed 2026-10-20. Eng-safe waves through #144, the Phase B UI scaffold (#141, flags off), the #168 local-show buying desk, the show-trip / floor / recap loop, portfolio book insights (#170), the sell / trade-in planner, set completion (#177), table notes / grading submit / portfolio chart / CSV / want-list share (#178), and show day / comps snapshot / trade balance / location / weekly recap (#179) are on the local book. #180 dropped the Gemini web SDK from the client bundle. #181 raised the gzip cap to 3,350,000 bytes. #182 connected set holes, pull-from place, ask versus median, and floor notes. #183 keeps Google sign-in on the login page when the provider is off. #184 closed the show. #185 aligned frontier desk tests with the collection. #186 added username + password auth. #187 added the show pull sheet. #188 and #189 are the Dependabot dev and production bumps. `00013` stays file-only until the owner applies it. No secrets or `VITE_FF_REAL_*` flips in this plan. Full Phase B exit still needs #77 live eBay tape. Do not claim live Market Movers / SCI Pulse parity before that. Owner direction (2026-10-12): eng-safe demo-tape buildout continues while #77 is open. **#77 stays the only path to live tape.**  
**Canonical ops:** [`NEXT_STEPS.md`](../NEXT_STEPS.md) · [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77)

Production on `main` is healthy (`b35555e`, [#189](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/189) and [#188](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/188) on [#187](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/187), which is on [#186](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/186), [#185](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/185), [#184](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/184), [#182](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/182), [#183](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/183), and [#181](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/181)). Remaining unlock for **live tape** is **owner-held #77** (optional file-only `00011`, Stripe smoke, eBay then PSA, optional Sentry, admin-audit confirm, legal, rotation drill). Restore and Vercel Supabase env presence are done. If #77 slips, live tape waits — eng-safe depth on demo/stale tape does not. Engineering agents must not apply `00011`.

---

## 1. Where we are (Oct 2026)

| Fact                                  | Reality                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bloomberg / institutional core        | Engineering-complete: consensus ledger, War Room, audit dossier, tax lots (demo-honest), card-show loop, agents                                                                                                                                                                                                                                           |
| Consumer intel vs SCI / Market Movers | Wave-5 shipped: ratio intel, collection/favorites movers, deal finder lite, multi-segment Pulse, 2–3 card compare, whale list, wax/TCG rail. Portfolio book insights add all-in cost, preferred-mark P/L, duplicate stacks, and slab / era / print-run mix. The sell / trade-in planner adds fee-net proceeds and wash-sale holds on that same local book |
| Catalog                               | Six of seven former betas are `live`. Only `fractional-vault` remains `beta` (legal)                                                                                                                                                                                                                                                                      |
| Hosted data                           | Supabase `vhbsokjqchaafluimgjh` **ACTIVE_HEALTHY**. Migrations `00001`–`00010` applied. Health `ok` / `serverApiAuth: true`. Vercel Supabase env presence done. Optional `00011` file-only (agents must not apply). Remaining #77 = Stripe smoke, eBay then PSA, optional Sentry, admin-audit, legal, rotation drill                                      |
| Honest copy                           | Seeded Pulse / movers / deals are local + disclosed — not live marketplace scrapes                                                                                                                                                                                                                                                                        |

Do **not** pause Supabase, apply `00011`, or set live-data flags from an engineering PR.

---

## 2. Competitive positioning

| Capability                                               | MSI                                    | Market Movers / Sports Card Investor |
| -------------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| Multi-agent War Room + why / consensus                   | **Lead**                               | Absent                               |
| Tax lots, ST/LT, wash-sale rail, sell / trade-in planner | **Lead** (advisory; not IRS-complete)  | Thin or absent                       |
| Audit dossier + admin audit trail                        | **Lead**                               | Absent                               |
| Card-show loop (discover, trip budget, floor, recap)     | **Lead** (seeded + local book)         | Absent                               |
| Negotiation Arena / Auto-Pilot (advisory)                | **Lead**                               | Absent                               |
| Ratio intel, movers, deals, compare, whale list          | **Parity-plus on local book** (Wave-5) | Strong on live tape                  |
| Live multi-marketplace sold comps                        | Behind #77                             | **They lead today**                  |
| Live Market Pulse / hobby indexes                        | Seeded + local Δ                       | **They lead today**                  |

MSI wins on **agents, fiscal, War Room, show-floor, audit**. SCI / Market Movers still win on **live comps depth and live Pulse** until Phase A lands.

---

## 3. Forward phases (ordered)

Map to older phase numbers in [`next-steps-recommendation.md`](./next-steps-recommendation.md). Do not start **live** B–E until A is done. Eng-safe demo-tape depth is already in scope under the 2026-10-12 owner override (card-show loop included) and is not a live-tape phase.

| Phase | Name                     | Who                  | Older map                      |
| ----- | ------------------------ | -------------------- | ------------------------------ |
| **A** | Unlock trusted book      | **Owner only**       | #77 / punch-list               |
| **B** | Pricing truth default    | Eng, after eBay live | Phase 32                       |
| **C** | Always-on alerts & wires | Eng + owner VAPID    | Priority 2.2 remainder         |
| **D** | Real trading moat        | Eng                  | Phase 33 leftover, 37, 40 lite |
| **E** | Platform                 | Eng                  | Phases 34, 36, 39, 42          |

### Phase A — Unlock trusted book (#77) — OWNER ONLY

Ordered. Do not implement keys in a docs or feature PR.

1. ~~Restore Supabase `vhbsokjqchaafluimgjh`~~ **done (ACTIVE_HEALTHY)**. ~~Vercel Supabase env presence~~ **done** (re-sync only if keys rotate).
2. Optional `00011_price_history_freshness_sla.sql` — file-only. Owner SQL editor only. **Agents must not apply it.**
3. Stripe lifecycle smoke (subscribe → upgrade → downgrade → cancel → failed-payment)
4. eBay → set server keys, then `VITE_FF_REAL_EBAY` (watch deployed-E2E + pricing-truth)
5. PSA (after eBay is stable; not in the same change) — **both** runtimes, then `VITE_FF_REAL_PSA`:
   - Vercel `PSA_API_KEY` → `api/grading/psa/cert.ts`
   - Supabase secret `PSA_API_KEY` + `verify-psa-cert` deployed → `/slab-verification` (`lookupPsaCert`). Absent secret → silent mock fallback.
6. Optional: Sentry DSN, `/audit-trail/admin` confirm, `fractional-vault` legal sign-off, full multi-provider key-rotation drill

Refs: [`docs/DEPLOY_ENV_CHECKLIST.md`](../docs/DEPLOY_ENV_CHECKLIST.md) · [`docs/LAUNCH_OPS_PUNCH_LIST.md`](../docs/LAUNCH_OPS_PUNCH_LIST.md) · [issue #77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77)

### Phase B — Pricing truth default (eng, after eBay live)

Phase 32 style. Consensus / Comps Used / collection provenance chips already exist.

**UI scaffold shipped (2026-09-10):** sold-comp default + stale / thin-tape badges + provenance chips on Collection, Dashboard, Favorites, watchlist/targets, and Compare **without** flipping `VITE_FF_REAL_*`. Honest labels while the eBay flag is off.

**Code remainder shipped (2026-09-15, #144):** freshness SLA policy + Pulse / War Room / chip badges; confidence only with a formula; `00011_price_history_freshness_sla.sql` **file only** (optional owner SQL; agents must not apply it).

**Full Phase B exit still needs** #77 live eBay tape + freshness SLA against real comps.

- Sold comps **default** on valuation apply + core desks once live tape is on
- Stale / low-liquidity / SLA badges on core desks + Pulse / War Room (live-tape SLA remaining)
- Provenance SLA (source, timestamp, confidence, freshness) — chip + policy landed; SLA vs live tape is remaining
- Optional `price_history` SLA columns — SQL in-repo, **not applied from engineering**

### Phase C — Always-on alerts & wires

- **Server Web Push scaffold shipped.** Owner VAPID keys still required. Client Push readiness shipped Wave-4 and now calls `/api/push/subscribe`
- **MLB catalyst / PvP wire adapters shipped** — seeded fallback default; live structure behind owner sports flag

### Phase D — Real trading moat

Already known; do not invent Labs pages.

- **P2P matching lite shipped** (local suggestions + reputation stub + escrow UI/ledger stubs — no real money)
- **Execution adapter stub + kill-switch / global pause shipped** (still no live fills)
- **Show-floor partner client stubs shipped** (local bag remains source of truth)
- Production CV **only if** it beats the disclosed heuristic

### Phase E — Platform

- **Lite shipped:** scoped demo tokens + watermarked metering; `valuation.updated` / `alert.triggered` no-op dispatcher
- Real Alpha API keys + partner webhook delivery still need cloud ops
- Alpha Guilds (governance / pooled ledger)
- Risk / compliance depth — not IRS theater
- Multi-tenant scale

---

## 4. 30 / 60 / 90 — T0 = Phase A complete

**T0** = [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closed. Restore, migrations `00001`–`00010`, health, and Vercel Supabase env presence are **done**. Critical path left inside Phase A: Stripe smoke + eBay live. PSA may lag (eBay-first). Optional `00011` does not gate T0. If #77 slips, **the clock does not start**. Eng-safe B–D scaffolds (#141 / #144) already shipped with flags off; that is not the live-tape clock.

| Window      | Outcome                                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-T0**  | Finish open #77 items. Eng-safe demo-tape depth may continue (owner override, 2026-10-12). No new Labs. No both-flags-at-once. Do not apply `00011` from an engineering PR. |
| **T0 + 30** | eBay tape observed. PSA on both runtimes only if eBay is stable. Live Phase B exit started.                                                                                 |
| **T0 + 60** | Phase B default-on + freshness SLA against real comps. Phase C Web Push or MLB wire started.                                                                                |
| **T0 + 90** | Phase C usable. Phase D design / lite matching scoped. Phase E not started unless A–C are boring.                                                                           |

---

## 5. Explicit non-goals

- No new Labs pages
- Tailwind CSS 4 and ESLint 10 are already on `main` (`tailwindcss` ^4.3.3, `eslint` ^10.12.0). `@eslint/js` stays 9.x. Do not start another major migration as roadmap work.
- Do not flip both `VITE_FF_REAL_EBAY` and `VITE_FF_REAL_PSA` at once
- Do not restore Supabase from engineering PRs
- Do not promote `fractional-vault` without legal
- Do not claim live Market Movers / SCI Pulse parity before Phase A

---

## 6e. Eng-safe depth — 2026-10-20

Checked against `main` @ `b35555e` (#187, plus Dependabot #188 and #189). Still owner-held: #77, including file-only `00013` (agents must not apply it). The pull sheet is #187. `npm ci` still warns about deprecated `node-domexception@1.0.0` under `@google/genai`; that transitive chain is not a trivial non-major fix. This change places the collector's number on the low, median, and high of stored sold comps, or a stable demo sketch when those sales are absent: comps snapshot, `/alerts`, shopping-list buys, a held-card table ask, and the sell planner. No live flags, no applied migration, gzip cap stays 3,350,000.

## 6d. Eng-safe depth — 2026-10-19

Checked against `main` @ `569dd05` (#186). Still owner-held: #77, including file-only `00013` (agents must not apply it). This pass follows username + password auth: the password hint matches the 8+ / upper / lower / number rule, auth pages keep an error and a loading state, a stale reset link or a dead session returns to sign-in, and password sign-in stays throttled without echoing the username. The local book adds a pull sheet that groups shopping-list sell lines by binder, box, or slab case. That pull sheet shipped as #187. No live flags, no applied migration, gzip cap stays 3,350,000.

## 6. Eng-safe depth — 2026-10-16

Checked against `main` @ `557fe23` (#182, with #183 on the login page). Still owner-held: #77. This pass closes the show on the local book: name the card on a table note, the cheapest typed ask in the room, file a bought note as cost basis, open notes and cheap passes on `/alerts`, cash fit on the shopping list, and unfiled buys on the weekly recap. No live flags, no applied migration, gzip cap stays 3,350,000.

## 6c. Eng-safe depth — 2026-10-15

Checked against `main` @ `d0bd552` (#181). Still owner-held: #77. This pass connects desks that were already on the local book: demo set holes on the show shopping list, a watch button for a hole, the saved binder / box / slab on sell lines, a typed ask versus the card median, and dated floor notes on the weekly recap. No live flags, no applied migration, gzip cap stays 3,350,000.

## 6b. Eng-safe depth — 2026-10-14

Checked against `main` @ `2e1a09a` (#178). Still owner-held: #77. Shipped that day, and now on `main` as #179: show-day checklist, comps snapshot, trade-value balancer, card location, and weekly collection recap. #178 review notes fixed: empty-book CSV import, no silent 200-row cut, demo-only import, want-list refresh, and a real $0 mark. No live flags, no applied migration.

## 7. Doc map

| Doc                                                                          | Role after this refresh                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`NEXT_STEPS.md`](../NEXT_STEPS.md)                                          | Shipped Waves 2–5 + Forward A–E                              |
| This file                                                                    | Owner-facing narrative                                       |
| [`FEATURE_ROADMAP_REVIEW.md`](./FEATURE_ROADMAP_REVIEW.md)                   | Inventory vs catalog (what exists)                           |
| [`next-steps-recommendation.md`](./next-steps-recommendation.md)             | Priority 1–6 + Phases 31–42, T0-relative 30/60/90            |
| [`roadmap-review-and-enhancements.md`](./roadmap-review-and-enhancements.md) | Historical enhancement inventory — superseded for sequencing |
