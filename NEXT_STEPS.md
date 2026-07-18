# Recommended Next Steps — Modern Sports Intelligence

> Refreshed 2026-07-18 · Reflects `main` post PR #83–#86. Previous edition: 2026-07-05.

## Current state in one paragraph

MSI is deployed with a **live Supabase project** (`ModernSportsIntelligence`, ref `vhbsokjqchaafluimgjh`). Production `/api/health` reports `config.serverApiAuth: true`. Telemetry beacon (`VITE_ERROR_REPORTING_URL=/api/client-error`) and `VITE_REQUIRE_TELEMETRY=true` are on Vercel. Launch admin + GDPR throwaway users are bootstrapped (`npm run ops:bootstrap-launch`); first admin role assigned. Supabase cutover logged as the first key-rotation drill entry. Six of seven betas are `live`; only `fractional-vault` remains on legal sign-off. **Still owner-held:** Stripe test keys + lifecycle smoke, eBay/PSA live keys, optional Sentry Issues UI DSN, promote your personal account to admin if you want `/audit-trail/admin` under your email.

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

**Owner still needs to** (see Priority 1 below): apply migration `00010`, deploy the Edge Function, assign the first admin via SQL Editor, and run the first key-rotation drill.

## Status of the June recommendation (implemented on the July-3 branch)

| Item                                    | Status                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0 — open-PR queue (#74, #75, #59, #58) | ✅ Resolved: dependency groups applied here with the Stripe `apiVersion` fix #74 was missing; #59's goal already shipped on main (June 10 consolidation); #58's unique audit work (filters/search/CSV/pagination + runbook + admin spec) ported here. All four closed as superseded.                                                                                                                                    |
| P1 — punch-list items 1/3/4             | ✅ Items 1/3/4 done (2026-07-18): new Supabase project linked, secrets set, RLS smoke green locally, health `serverApiAuth: true`, Deployed E2E live. Remaining punch-list: Sentry, Stripe smoke, GDPR, eBay/PSA keys.                                                                                                                                                                                                  |
| P2 — beta exits                         | ✅ `provenance-chain` live (reload-persistence E2E added, route out of Labs gate) · ✅ `liquidity-pool` live (sim labeling added; persistence/tests landed in #68) · ✅ `fractional-vault-v2` removed (duplicate). ✅ `vision-grading` live (analysis-contract tests + in-session-only image handling documented and pinned by a no-persistence test). Remaining: `fractional-vault` (legal sign-off — no engineering). |
| P3 — integration depth                  | ✅ eBay comp pagination (offset pages), last-known-good comps served as `source: 'stale'` on live failure, PSA `CertVerifiedBadge` on any card with a `certNumber`.                                                                                                                                                                                                                                                     |
| P4 — onboarding                         | ✅ Scan-first empty state, `/demo-flow` tour link, first-card pricing toast pointing at the data-source badge.                                                                                                                                                                                                                                                                                                          |

## Priority 1 — Remaining owner-held launch actions

> **Supabase (2026-07-18):** Active project `vhbsokjqchaafluimgjh` — schema + migrations `00001`–`00010`, Edge Functions deployed, auth `site_url` + redirect allowlist set, Vercel/GitHub env synced. Old paused project `iwxqemiqtusgmemlnrby` is abandoned.

**CI hygiene shipped (engineering):** Deployed E2E on push to `main`; RLS verification fails closed when secrets missing; verifier runs on Node 22. Tracked in [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77).

0. **Phase 31 activation** (infra done; owner actions left):
   1. ~~Apply migrations / deploy Edge Functions~~ — done on `vhbsokjqchaafluimgjh`.
   2. ~~Assign first admin~~ — `msi-launch-admin@example.com` promoted (`npm run ops:promote-admin`). Promote your personal email the same way after signup.
   3. Confirm `/audit-trail/admin` + `audit.cross_user_read` row while signed in as an admin.
   4. ~~First key-rotation drill~~ — Supabase cutover logged in `plans/incidents/key-rotation-drill.md` (full multi-provider quarterly drill still needs Stripe staging keys).
1. ~~**RLS verification secrets**~~ — set; anon smoke green.
2. ~~**Server API auth on the deployment**~~ — `config.serverApiAuth: true`.
3. ~~**Error telemetry**~~ — `/api/client-error` + `VITE_ERROR_REPORTING_URL` + `VITE_REQUIRE_TELEMETRY=true`. Optional: add `VITE_SENTRY_DSN` for Issues UI.
4. **Stripe lifecycle smoke** — needs Stripe test keys on Vercel (punch-list item 6).
5. ~~**GDPR endpoints**~~ — export E2E green on prod; delete cascade fixed (`profiles` before `auth.users`).

## Priority 2 — Turn on real data (eBay, then PSA)

The engineering is done and waiting behind flags; the deployed environment is stable enough to flip them:

1. Set `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` + `VITE_FF_REAL_EBAY=true`; watch the daily deployed-E2E and pricing-truth gates for a few days. Degraded fallback now serves last-known-good comps labeled `stale` instead of jumping to mock.
2. Then `PSA_API_KEY` + `VITE_FF_REAL_PSA=true`; cards with a `certNumber` will switch from the "PSA (demo)" badge to live "PSA Verified".

## Priority 3 — Last beta exit

- `fractional-vault`: legal/securities sign-off on the "Simulation only" disclosure. No engineering blocker — on approval, flip the catalog status.
- (`vision-grading` exited on this branch: the image-handling decision matches `visual-audit` — in-session only, never persisted — and is pinned by tests.)

## Sustained dev experience (background, not blocking)

- Keep merging the grouped Dependabot PRs promptly so they don't pile up again.
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- Quarterly catalog sweep: features `beta` for 90+ days either go `live` or get hidden. First sweep due ~2026-09.
- Run the first key-rotation drill (`plans/incidents/key-rotation-drill.md`) and log it.

## What NOT to do next

1. **Don't add Labs features.** The surface is settled; the work is exits, not entries.
2. **Don't restructure directories.** The DAL and chunk graph are stable; churn buys nothing.
3. **Don't flip both real-data flags at once.** eBay first, observe, then PSA — the degraded-fallback paths get their first production exercise.
4. **Don't let `main` idle behind open PRs again.** The deployed-E2E gate exists precisely so merging is cheap.

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
