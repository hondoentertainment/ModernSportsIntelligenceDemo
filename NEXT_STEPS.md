# Recommended Next Steps — Modern Sports Intelligence

> Refreshed 2026-07-03 · Reflects `main` at `17effb4` (real-auth E2E + Vercel env sync, after PR #68 wave-3 persistence). Previous edition: 2026-06-10.

## Current state in one paragraph

MSI is deployed and being watched: since 2026-06-10 the scheduled production workflows have run green daily — **Deployed E2E**, **RLS verification**, and the **health ping** all pass against the live deployment — which means the Supabase project is restored, `PLAYWRIGHT_DEPLOYMENT_URL`/`ENABLE_DEPLOYED_E2E` are configured, and uptime monitoring is live. Two of the seven beta features (`visual-audit`, `live-impact`) were promoted to `live`, leaving **five** in beta. Wave-3 persistence for `provenance-chain` (DAL-backed, per-user, AES-GCM sealed) and the `recordInstantBuy` round-trip unit tests landed in #68. What has *not* happened since June 10: any new commit to `main`. The gap now is not hardening — it's that momentum stalled with a small queue of open PRs, three unchecked owner actions, and five betas that each need one specific thing to exit.

## Priority 0 — Clear the open-PR queue (½ day)

`main` has been idle for three weeks while four PRs sit open. Merge or close them before starting new work:

| PR  | What it is                                                            | Recommended action                                                                                                       |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| #74 | Dependabot: 7 production dependency bumps (2026-06-29)               | Rebase, let CI run, merge. The deployed-E2E gate is active, so a bad bump gets caught.                                    |
| #75 | Dependabot: 15 dev dependency bumps (2026-06-29)                     | Same — merge after #74 is green.                                                                                          |
| #59 | `ci: fix and consolidate bundle size budgets` (2026-06-11)           | Review against current `scripts/ci-bundle-gate.cjs`; merge if still applicable, close if #68/#67 superseded it.           |
| #58 | Draft: Phase 31 audit viewer roadmap (2026-05-24)                    | Stale — the audit-dossier/audit-trail fixes landed separately in `4a5f17d`. Salvage anything unique, then close.          |

## Priority 1 — Finish the launch punch list (owner-held)

[`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md) still shows every box unchecked, but the green scheduled workflows prove items 1, 3, and 4 (RLS verification, deployed E2E, uptime) are effectively done — **check them off with dates** so the doc reflects reality. That leaves three genuinely open:

1. **Sentry** — set `VITE_SENTRY_DSN` + `VITE_REQUIRE_TELEMETRY=true` in Vercel and confirm a test error arrives (punch-list item 2).
2. **Stripe lifecycle smoke** — subscribe → upgrade → downgrade → cancel → failed-payment in test mode against production; verify webhook deliveries are all 2xx and tier updates (item 6).
3. **GDPR endpoints** — verify `/api/me/export` and `/api/me/delete` on a throwaway account (item 7).

Item 5 (eBay/PSA real keys) is the gate for Priority 3 below — do it when starting that work, not before.

## Priority 2 — Exit the five remaining betas

`lib/utils/featureCatalog.ts` still has 5 `status: 'beta'` entries. Each has exactly one remaining blocker:

| ID                    | Persistence/tests | Remaining blocker to promote                                                                                              |
| --------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `provenance-chain`    | ✅ landed in #68   | One Playwright E2E: register a card → reload → entry survives. Everything else (DAL, per-user scoping, sealed storage) is done. |
| `liquidity-pool`      | ✅ landed in #68   | Surface the widget on the Dashboard (it currently has `path: null`).                                                        |
| `vision-grading`      | n/a               | Decide client-side image handling (same decision as the now-live `visual-audit` made) and keep the "estimates only" label.  |
| `fractional-vault`    | n/a (pure catalog read) | Legal/securities sign-off on the "Simulation only" disclosure. No engineering work.                                    |
| `fractional-vault-v2` | n/a               | Catalog hygiene: merge into v1 or delete the entry. It is catalog-only (`path: null`) and duplicates v1.                     |

Cheapest wins first: `fractional-vault-v2` (delete/merge, minutes), then `provenance-chain` (one E2E), then `liquidity-pool` (one widget mount). That takes the beta count from 5 to 2 in roughly a day of work.

## Priority 3 — Turn on real data (eBay, then PSA)

The brand is "pricing truth" and the adapters are ready — every response is tagged `source: 'live' | 'mock'` with `degradedReason`. The deployed environment is stable enough now to flip the flags:

1. Set `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` + `VITE_FF_REAL_EBAY=true`; watch the daily deployed-E2E and pricing-truth gates for a few days.
2. Then `PSA_API_KEY` + `VITE_FF_REAL_PSA=true`, and surface the verified label on every card with a `certNumber` via the existing `DataSourceBadge`.
3. Engineering depth once live: eBay comp pagination beyond page 1, and caching the last successful comp set per `(player, year, set, grade)` so degraded fallback shows last-known-good with a stale label instead of jumping to mock.

## Priority 4 — Onboarding & first-five-minutes

Unchanged from the last edition, and it becomes the top product priority once real data is on: arrive → scan a card → see a real value with provenance → save.

- Dashboard empty state for a brand-new user: one primary CTA ("Scan your first card") instead of the widget grid.
- Promote the Demo Flow (currently behind `/demo-flow`) into the empty-collection state.
- After first card add, a non-blocking "We're fetching live pricing" toast pointing at `DataSourceBadge`.

## Sustained dev experience (background, not blocking)

- Dependabot is now grouped (prod/dev) — keep merging the grouped PRs promptly so they don't pile up like #74/#75 did.
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- Quarterly catalog sweep: features `beta` for 90+ days either go `live` or get hidden. First sweep due ~2026-09.

## What NOT to do next

1. **Don't add Labs features.** The surface is settled; the work is exits, not entries.
2. **Don't restructure directories.** The DAL and chunk graph are stable; churn buys nothing.
3. **Don't flip both real-data flags at once.** eBay first, observe, then PSA — the degraded-fallback paths get their first production exercise.
4. **Don't let `main` idle behind open PRs again.** The deployed-E2E gate exists precisely so merging is cheap.

## Key references

| Purpose                | File                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| Owner-held launch ops  | `docs/LAUNCH_OPS_PUNCH_LIST.md`                                          |
| Env sync after Supabase unpause | `docs/DEPLOY_ENV_CHECKLIST.md` (§ Supabase unpause + Vercel env sync) |
| Beta status / criteria | `docs/BETA_FEATURE_EXIT_CRITERIA.md`, `docs/BETA_EXIT_READINESS_PASS.md` |
| MVP launch scope       | `docs/MVP_LAUNCH_SCOPE.md`                                               |
| Production rollout     | `docs/PRODUCTION_ROLLOUT_PHASES.md`                                      |
| Rollback runbook       | `docs/ROLLBACK_AND_STABILIZATION.md`                                     |
| Coverage policy        | `docs/COVERAGE_POLICY.md`                                                |
| Labs boundary          | `lib/productionLaunch.ts`                                                |
