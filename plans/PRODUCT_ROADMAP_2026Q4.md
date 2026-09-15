# Product roadmap — post Wave-5 (2026 Q4)

**Audience:** owner / Kyle  
**Status:** planning + Phase B–D **eng-safe code scaffolds** (2026-09-15) — no secrets or `VITE_FF_REAL_*` flips. Supabase restore is done. Full Phase B exit still needs #77 live tape.  
**Canonical ops:** [`NEXT_STEPS.md`](../NEXT_STEPS.md) § Forward roadmap · [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77)

Eng-safe Waves 2–5 plus the 2026-09-15 B–D scaffolds are on the engineering branch. Remaining unlock is **owner-held #77 keys / env sync**. If #77 slips, Phase A (cloud ops) stays the only critical path.

---

## 1. Where we are (Sep 2026)

| Fact                                  | Reality                                                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bloomberg / institutional core        | Engineering-complete: consensus ledger, War Room, audit dossier, tax lots (demo-honest), card-show loop, agents                                                                         |
| Consumer intel vs SCI / Market Movers | Wave-5 shipped: ratio intel, collection/favorites movers, deal finder lite, multi-segment Pulse, 2–3 card compare, whale list, wax/TCG rail                                             |
| Catalog                               | Six of seven former betas are `live`. Only `fractional-vault` remains `beta` (legal)                                                                                                    |
| Hosted data                           | Supabase `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) restore **complete (ACTIVE_HEALTHY)**. Remaining #77 = Vercel env sync + Stripe/eBay/PSA/Sentry/admin-audit/legal/rotation |
| Honest copy                           | Seeded Pulse / movers / deals are local + disclosed — not live marketplace scrapes                                                                                                      |

Do **not** restore Supabase or set live-data flags from an engineering PR.

---

## 2. Competitive positioning

| Capability                                      | MSI                                    | Market Movers / Sports Card Investor |
| ----------------------------------------------- | -------------------------------------- | ------------------------------------ |
| Multi-agent War Room + why / consensus          | **Lead**                               | Absent                               |
| Tax lots, ST/LT, wash-sale rail, Fiscal Shield  | **Lead** (advisory; not IRS-complete)  | Thin or absent                       |
| Audit dossier + admin audit trail               | **Lead**                               | Absent                               |
| Card-show floor loop (scan, swipe, show bag)    | **Lead**                               | Absent                               |
| Negotiation Arena / Auto-Pilot (advisory)       | **Lead**                               | Absent                               |
| Ratio intel, movers, deals, compare, whale list | **Parity-plus on local book** (Wave-5) | Strong on live tape                  |
| Live multi-marketplace sold comps               | Behind #77                             | **They lead today**                  |
| Live Market Pulse / hobby indexes               | Seeded + local Δ                       | **They lead today**                  |

MSI wins on **agents, fiscal, War Room, show-floor, audit**. SCI / Market Movers still win on **live comps depth and live Pulse** until Phase A lands.

---

## 3. Forward phases (ordered)

Map to older phase numbers in [`next-steps-recommendation.md`](./next-steps-recommendation.md). Do not start B–E until A is done (or A is explicitly waived by the owner).

| Phase | Name                     | Who                  | Older map                      |
| ----- | ------------------------ | -------------------- | ------------------------------ |
| **A** | Unlock trusted book      | **Owner only**       | #77 / punch-list               |
| **B** | Pricing truth default    | Eng, after eBay live | Phase 32                       |
| **C** | Always-on alerts & wires | Eng + owner VAPID    | Priority 2.2 remainder         |
| **D** | Real trading moat        | Eng                  | Phase 33 leftover, 37, 40 lite |
| **E** | Platform                 | Eng                  | Phases 34, 36, 39, 42          |

### Phase A — Unlock trusted book (#77) — OWNER ONLY

Ordered. Do not implement keys in a docs or feature PR.

1. ~~Restore Supabase `vhbsokjqchaafluimgjh`~~ **done (ACTIVE_HEALTHY)**. Remaining: Vercel / GitHub env sync
2. Stripe lifecycle smoke (subscribe → upgrade → downgrade → cancel → failed-payment)
3. eBay → set server keys, then `VITE_FF_REAL_EBAY` (watch deployed-E2E + pricing-truth)
4. PSA (after eBay is stable) — **both** runtimes, then `VITE_FF_REAL_PSA`:
   - Vercel `PSA_API_KEY` → `api/grading/psa/cert.ts`
   - Supabase secret `PSA_API_KEY` + `verify-psa-cert` deployed → `/slab-verification` (`lookupPsaCert`). Absent secret → silent mock fallback.
5. Optional: Sentry DSN, `/audit-trail/admin` confirm, `fractional-vault` legal sign-off, full multi-provider key-rotation drill

Refs: [`docs/DEPLOY_ENV_CHECKLIST.md`](../docs/DEPLOY_ENV_CHECKLIST.md) · [`docs/LAUNCH_OPS_PUNCH_LIST.md`](../docs/LAUNCH_OPS_PUNCH_LIST.md) · [issue #77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77)

### Phase B — Pricing truth default (eng, after eBay live)

Phase 32 style. Consensus / Comps Used / collection provenance chips already exist.

**UI scaffold shipped (2026-09-10):** sold-comp default + stale / thin-tape badges + provenance chips on Collection, Dashboard, Favorites, watchlist/targets, and Compare **without** flipping `VITE_FF_REAL_*`. Honest labels while the eBay flag is off.

**Code remainder shipped (2026-09-15):** freshness SLA policy + Pulse / War Room / chip badges; confidence only with a formula; `00011_price_history_freshness_sla.sql` **file only** (owner apply after env sync).

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

**T0** = [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77) closed (restore **done**; remaining = env sync + Stripe smoke + eBay live). PSA may lag (eBay-first). If #77 slips, **the clock does not start**.

| Window      | Outcome                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| **Pre-T0**  | Phase A only. No B–E, no Labs, no both-flags-at-once.                                             |
| **T0 + 30** | eBay tape observed. PSA on both runtimes only if eBay is stable. Phase B started.                 |
| **T0 + 60** | Phase B default-on + freshness SLA. Phase C Web Push or MLB wire started.                         |
| **T0 + 90** | Phase C usable. Phase D design / lite matching scoped. Phase E not started unless A–C are boring. |

---

## 5. Explicit non-goals

- No new Labs pages
- No Tailwind 4 / `@eslint/js` 10 half-migrates as roadmap items
- Do not flip both `VITE_FF_REAL_EBAY` and `VITE_FF_REAL_PSA` at once
- Do not restore Supabase from engineering PRs
- Do not promote `fractional-vault` without legal
- Do not claim live Market Movers / SCI Pulse parity before Phase A

---

## 6. Doc map

| Doc                                                                          | Role after this refresh                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`NEXT_STEPS.md`](../NEXT_STEPS.md)                                          | Shipped Waves 2–5 + Forward A–E                              |
| This file                                                                    | Owner-facing narrative                                       |
| [`FEATURE_ROADMAP_REVIEW.md`](./FEATURE_ROADMAP_REVIEW.md)                   | Inventory vs catalog (what exists)                           |
| [`next-steps-recommendation.md`](./next-steps-recommendation.md)             | Priority 1–6 + Phases 31–42, T0-relative 30/60/90            |
| [`roadmap-review-and-enhancements.md`](./roadmap-review-and-enhancements.md) | Historical enhancement inventory — superseded for sequencing |
