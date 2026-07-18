# Launch ops punch list — owner actions

Engineering work for the world-class pass is in the repo (Labs route gating, domain-split bundles, Lighthouse a11y fix, honest adapter sourcing). The items below need credentials or accounts only the project owner holds. Each is small; together they complete `docs/PRODUCTION_ROLLOUT_PHASES.md`.

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

- [ ] DSN set and a test error visible in Sentry

## 3. Deployed E2E (Phase E2)

Set GitHub repo secret `PLAYWRIGHT_DEPLOYMENT_URL=https://<prod>.vercel.app` and repo variable `ENABLE_DEPLOYED_E2E=true`. This activates `.github/workflows/deployed-e2e.yml` (runs after each merge to main + daily).

- [x] Secret + variable set — verified from the job log (run 28647105378, 2026-07-03). Workflow now runs on **push to `main`** (not only `workflow_run` after CI) so cancelled concurrent CI cannot skip it. Still no-ops green without `PLAYWRIGHT_DEPLOYMENT_URL`.

## 4. Uptime monitoring (Phase D1)

Point any uptime service (UptimeRobot, Checkly, Vercel checks) at `GET /api/health` on the production URL. Alert at 2 consecutive failures.

- [x] Monitor live — `HEALTH_CHECK_URL` pings production. As of **2026-07-18** redeploy after Vercel Supabase env sync: `GET /api/health` → `ok: true`, `config.serverApiAuth: true` (project `vhbsokjqchaafluimgjh`).

## 5. Real-data API keys (when ready to leave mock mode)

Server-side env (Vercel), never `VITE_*`:

- eBay: `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET`, then set `VITE_FF_REAL_EBAY=true`
- PSA: `PSA_API_KEY` (consumed by `api/grading/psa/cert.ts`), then `VITE_FF_REAL_PSA=true`

The adapters now tag every response `source: 'live' | 'mock'` with a `degradedReason` on live failures — UI surfaces can trust the label.

- [ ] eBay keys set · [ ] PSA key set

## 6. Stripe lifecycle smoke (money path)

In Stripe test mode against the production deployment: subscribe → upgrade → downgrade → cancel → failed-payment (use card `4000 0000 0000 0341`). Verify webhook events land (Stripe dashboard → webhook deliveries, all 2xx) and the user's tier updates each step.

- [ ] All five transitions verified

## 7. GDPR endpoints (just landed)

While signed in on production: call `/api/me/export` (expect a JSON download of your data) and on a throwaway account `/api/me/delete` (expect account + rows gone, sign-in revoked).

- [ ] Export verified · [ ] Delete verified

## Labs surface reminder

Production hides the long-tail routes unless `VITE_FF_ENABLE_BETA_SURFACES=1` is set in the Vercel env. Leave it **unset** for GA per `docs/MVP_LAUNCH_SCOPE.md`; set it on preview deployments if you want the full surface for demos.
