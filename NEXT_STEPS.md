# Recommended Next Steps — Modern Sports Intelligence

> Refreshed 2026-09-06 · Pricing truth (sold-comp consensus), Schedule D–style packet, NBA/NFL/NHL player-team desks. Previous edition: 2026-09-05 (catalog sweep + #115).

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
2. Then `PSA_API_KEY` + `VITE_FF_REAL_PSA=true`; cert badges switch from demo to live.

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
