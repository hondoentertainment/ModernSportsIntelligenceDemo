# Recommended Next Steps — Modern Sports Intelligence

> Generated 2026-06-10 · Reflects the state of `main` after the World-Class Pass 1 PRs (#57 wave-2 beta safety + #67 bundle split / a11y / Labs / adapter truth).

## Current state in one paragraph

MSI is past the “impressive prototype” bar and into a launchable MVP. The DAL is enforced (0 `localStorage` violators), auth + RLS are wired, billing webhook + idempotency are in place, CSP + Sentry + error beacon are required in production builds, and CI gates are dense (typecheck/strict, lint, format, 92/80 coverage, pricing-truth, smoke E2E, deployed-E2E, bundle gate, axe smoke, route smoke across all 223 routes, CodeQL, visual regression, Lighthouse). The product surface is now focused: the curated MVP routes ship by default and the ~300 Labs routes only mount when `VITE_FF_ENABLE_BETA_SURFACES=1`. eBay/PSA adapters label every response `source: 'live' \| 'mock'`. The lib-services monolith (1.16 MB gz) is split into five domain chunks.

The remaining gap to “world-class” is **not** more engineering surface — it’s **executing the launch playbook** with real credentials, **finishing the wave-3 beta items** for the seven features still labeled `beta`, and **deepening two integrations** (eBay sold comps and PSA cert) so the brand promise of pricing truth is backed by real data, not mocks.

## Priority 0 — Owner-held launch actions

See [`docs/LAUNCH_OPS_PUNCH_LIST.md`](docs/LAUNCH_OPS_PUNCH_LIST.md). Every item is a one-shot configuration that engineering cannot do without credentials. They unblock the staged rollout in [`docs/ROLLBACK_AND_STABILIZATION.md`](docs/ROLLBACK_AND_STABILIZATION.md).

1. Run `npm run verify:rls` against Supabase with real free/basic/pro/alpha test users.
2. Set `VITE_SENTRY_DSN` + `VITE_REQUIRE_TELEMETRY=true` in Vercel.
3. Set repo secret `PLAYWRIGHT_DEPLOYMENT_URL` and repo variable `ENABLE_DEPLOYED_E2E=true` to activate the deployed-E2E workflow.
4. Point uptime monitoring at `GET /api/health`.
5. When ready to leave mock mode: `EBAY_CLIENT_ID/SECRET` + `VITE_FF_REAL_EBAY=true`, then `PSA_API_KEY` + `VITE_FF_REAL_PSA=true`.
6. Run the Stripe lifecycle smoke (subscribe → upgrade → downgrade → cancel → failed-payment) in test mode against the production deployment.
7. Verify `/api/me/export` returns the user’s data and `/api/me/delete` purges + revokes session on a throwaway account.

## Priority 1 — Wave-3 beta exits (engineering)

Status of the 7 `status: 'beta'` IDs in [`lib/utils/featureCatalog.ts`](lib/utils/featureCatalog.ts) — wave-2 cleared all misleading copy and tenancy issues (see [`docs/BETA_EXIT_READINESS_PASS.md`](docs/BETA_EXIT_READINESS_PASS.md)). Wave-3 promotes them to `live` once persistence and tests land.

| ID                    | Wave-3 work to promote                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `liquidity-pool`      | Surface the widget on the Dashboard, write a unit test for `recordInstantBuy` round-tripping through the per-user key.                                  |
| `visual-audit`        | Modal-only feature; needs E2E covering upload → result; consider client-side image storage opt-in.                                                      |
| `live-impact`         | Either wire a real sports-feed adapter behind a flag or commit to demo-only with a doc note; either way, add a snapshot test for `getLiveImpactAlerts`. |
| `vision-grading`      | Same image-handling decision as `visual-audit`; explicit PSA/BGS comparison must remain labeled.                                                        |
| `fractional-vault`    | Service is pure catalog read — promote when legal/securities review approves the "Simulation only" disclosure; no engineering blocker.                  |
| `provenance-chain`    | `registerCard()` now persists via the DAL with per-user scoping (this PR). Promote when an E2E covers register → reload → entry survives.               |
| `fractional-vault-v2` | Catalog-only since the route collision was resolved; remove from catalog or merge with v1.                                                              |

## Priority 2 — Real-data integration depth

The brand is “pricing truth.” Two integrations move the needle most:

- **eBay sold comps:** `lib/integrations/ebayAdapter.ts` now tags `source` and computes `trendPercent` from real history when live. Next: pagination beyond the first page, store the last successful comp set per `(player, year, set, grade)` so degraded fallback shows the last-known-good response with a stale-data label instead of jumping to mock.
- **PSA cert verification:** Adapter is ready. Surface the verified label on every card that has a `certNumber` using the existing `DataSourceBadge` component.

## Priority 3 — Onboarding & first-five-minutes

The funnel that defines "world-class" is: arrive → scan a card → see a real value with provenance → save. Audit it as a single flow:

- Dashboard empty state for a brand-new user: one primary CTA ("Scan your first card") instead of widget grid.
- Demo Flow currently sits behind `/demo-flow` and a widget — promote it into the empty-collection state.
- After first card add, queue a non-blocking "We're fetching live pricing for this card" toast pointing at `DataSourceBadge`.

## Priority 4 — Sustained dev experience

- Add a `npm run perf:audit` script that runs `vite build && node scripts/ci-bundle-gate.cjs` and prints a one-line summary, so engineers see when their PR moves a chunk.
- Tighten coverage gates incrementally — every PR that crosses a service file should add it to the explicit whitelist in `vite.config.ts`.
- Schedule a quarterly catalog sweep — features that have been `beta` for 90+ days either go `live` or get hidden.

## What NOT to do next

1. **Don’t add Labs features.** 330 routes is more than enough.
2. **Don’t chase the lighthouse score below 0.95.** Diminishing returns versus shipping the wave-3 items.
3. **Don’t restructure directories.** The DAL and chunk graph are settled; rearranging now would just churn the import map.
4. **Don’t expose Labs routes in production** until the wave-3 work for a given beta lands — the Labs gate is now the only enforcer.

## Key references

| Purpose                | File                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| Owner-held launch ops  | `docs/LAUNCH_OPS_PUNCH_LIST.md`                                          |
| Beta status / criteria | `docs/BETA_FEATURE_EXIT_CRITERIA.md`, `docs/BETA_EXIT_READINESS_PASS.md` |
| MVP launch scope       | `docs/MVP_LAUNCH_SCOPE.md`                                               |
| Production rollout     | `docs/PRODUCTION_ROLLOUT_PHASES.md`                                      |
| Rollback runbook       | `docs/ROLLBACK_AND_STABILIZATION.md`                                     |
| Coverage policy        | `docs/COVERAGE_POLICY.md`                                                |
| Labs boundary          | `lib/productionLaunch.ts`                                                |
