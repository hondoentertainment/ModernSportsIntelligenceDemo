# Launch ops punch list — owner actions

Engineering work for the world-class pass is in the repo (Labs route gating, domain-split bundles, Lighthouse a11y fix, honest adapter sourcing). The items below need credentials or accounts only the project owner holds. Each is small; together they complete `docs/PRODUCTION_ROLLOUT_PHASES.md`.

> **2026-10-12:** Hosted project `ModernSportsIntelligence` (`vhbsokjqchaafluimgjh`) is **ACTIVE_HEALTHY**. Migrations `00001`–`00010` are applied. Production `GET /api/health` is `ok: true` with `config.serverApiAuth: true` (reconfirmed on [#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77), 2026-09-27). Vercel Supabase env presence (URL, anon, service role, `ALLOWED_ORIGIN`) is already confirmed — re-sync only if those keys rotate (`docs/DEPLOY_ENV_CHECKLIST.md`). Do not pause Supabase, set `VITE_FF_REAL_*`, or apply migrations from an engineering PR. Optional `supabase/migrations/00011_price_history_freshness_sla.sql` stays **file-only**. The owner may apply it in the SQL editor. Engineering agents must not apply it. Latest prod deploy includes `742bc5e` ([#166](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/pull/166)). No open pull requests.

**Still open (#77 remainder):** optional migration `00011` · Stripe lifecycle smoke · eBay keys then `VITE_FF_REAL_EBAY` · `PSA_API_KEY` then `VITE_FF_REAL_PSA` (not in the same change as eBay; both runtimes) · optional `VITE_SENTRY_DSN` · `/audit-trail/admin` confirm · fractional-vault legal · multi-provider key-rotation drill. **Already done:** restore · Vercel Supabase env presence · migrations `00001`–`00010` · health / `serverApiAuth` · quarterly catalog sweep (`fractional-vault` stays beta) · eng-safe waves through #144 and Phase B UI #141 (flags off).

## 1. RLS verification with real users (Phase A2)

Create one test user per tier (free/basic/pro/alpha) in the Supabase dashboard, then run:

```bash
SUPABASE_DB_URL=postgres://... npm run verify:rls   # see scripts/run-rls-checks.mjs
```

Pass = every cross-tenant SELECT/UPDATE returns 0 rows. Record the run date here.

- [x] Run completed on: **2026-07-18** — new hosted project `ModernSportsIntelligence` (ref `vhbsokjqchaafluimgjh`) replaced paused `iwxqemiqtusgmemlnrby`. Schema + migrations applied; GitHub secrets `SUPABASE_URL` / `SUPABASE_ANON_KEY` set; local `npm run verify:rls` passed (all six strict-tenant tables deny anon reads). CI workflow bumped to Node 22 so the smoke test can create a Supabase client.

## 2. Error telemetry in production (Phase D2)

Create a (free-tier) Sentry project and set in Vercel → Project → Environment Variables:

- `VITE_SENTRY_DSN=<dsn>`
- `VITE_REQUIRE_TELEMETRY=true` (makes future builds fail loudly if telemetry is ever dropped)

- [x] First-party beacon live — `VITE_ERROR_REPORTING_URL=/api/client-error` + `VITE_REQUIRE_TELEMETRY=true` on Vercel (Phase D2). Optional Sentry Issues UI still available when you add `VITE_SENTRY_DSN`.

## 3. Deployed E2E (Phase E2)

Set GitHub repo secret `PLAYWRIGHT_DEPLOYMENT_URL=https://<prod>.vercel.app` and repo variable `ENABLE_DEPLOYED_E2E=true`. This activates `.github/workflows/deployed-e2e.yml` (runs after each merge to main + daily).

- [x] Secret + variable set — verified from the job log (run 28647105378, 2026-07-03). Workflow now runs on **push to `main`** (not only `workflow_run` after CI) so cancelled concurrent CI cannot skip it. Still no-ops green without `PLAYWRIGHT_DEPLOYMENT_URL`.

## 4. Uptime monitoring (Phase D1)

Point any uptime service (UptimeRobot, Checkly, Vercel checks) at `GET /api/health` on the production URL. Alert at 2 consecutive failures.

- [x] Monitor live — `HEALTH_CHECK_URL` pings production. **2026-07-18** redeploy after Vercel Supabase env sync: `GET /api/health` → `ok: true`, `config.serverApiAuth: true` (project `vhbsokjqchaafluimgjh`). **2026-09-27:** same health result while the project is ACTIVE_HEALTHY ([#77](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/issues/77)).

## 5. Real-data API keys (when ready to leave mock mode)

Server-side env (Vercel), never `VITE_*`:

- eBay: `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET`, then set `VITE_FF_REAL_EBAY=true`
- PSA: set `PSA_API_KEY` in **both** places, then `VITE_FF_REAL_PSA=true`
  - Vercel (server) — `api/grading/psa/cert.ts`
  - Supabase Edge Function secret — `verify-psa-cert` (`supabase secrets set PSA_API_KEY=…` + confirm the function is deployed). `/slab-verification` calls this via `lookupPsaCert` and **silently mocks** if the secret is missing.

The adapters now tag every response `source: 'live' | 'mock'` with a `degradedReason` on live failures — UI surfaces can trust the label.

- [ ] eBay keys set · [ ] PSA key set

## 6. Stripe lifecycle smoke (money path)

In Stripe test mode against the production deployment: subscribe → upgrade → downgrade → cancel → failed-payment (use card `4000 0000 0000 0341`). Verify webhook events land (Stripe dashboard → webhook deliveries, all 2xx) and the user's tier updates each step.

- [ ] All five transitions verified

## 7. GDPR endpoints (just landed)

While signed in on production: call `/api/me/export` (expect a JSON download of your data) and on a throwaway account `/api/me/delete` (expect account + rows gone, sign-in revoked).

- [x] Export verified — `npm run test:e2e:gdpr` against production (contract + authenticated export) after ESM `.js` import fix.
- [x] Delete verified — `/api/me/delete` now deletes `profiles` (and optional price/market rows) before `auth.admin.deleteUser`; throwaway recreated via `npm run ops:bootstrap-launch`.

## Labs surface reminder

Production hides the long-tail routes unless `VITE_FF_ENABLE_BETA_SURFACES=1` is set in the Vercel env. Leave it **unset** for GA per `docs/MVP_LAUNCH_SCOPE.md`; set it on preview deployments if you want the full surface for demos.
