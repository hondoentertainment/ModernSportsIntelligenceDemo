# Launch ops punch list — owner actions

Engineering work for the world-class pass is in the repo (Labs route gating, domain-split bundles, Lighthouse a11y fix, honest adapter sourcing). The items below need credentials or accounts only the project owner holds. Each is small; together they complete `docs/PRODUCTION_ROLLOUT_PHASES.md`.

## 1. RLS verification with real users (Phase A2)

Create one test user per tier (free/basic/pro/alpha) in the Supabase dashboard, then run:

```bash
SUPABASE_DB_URL=postgres://... npm run verify:rls   # see scripts/run-rls-checks.mjs
```

Pass = every cross-tenant SELECT/UPDATE returns 0 rows. Record the run date here.

- [ ] Run completed on: \_\_\_\_ — **not yet.** The scheduled **RLS verification** workflow shows green, but its job log (run 28653194272, 2026-07-03) shows every gated step skipped: the Supabase credential secrets are not set in GitHub, so the green runs are no-ops. Set the repo secrets the workflow gates on, then confirm a run where "Run anon RLS smoke test" actually executes.

## 2. Error telemetry in production (Phase D2)

Create a (free-tier) Sentry project and set in Vercel → Project → Environment Variables:

- `VITE_SENTRY_DSN=<dsn>`
- `VITE_REQUIRE_TELEMETRY=true` (makes future builds fail loudly if telemetry is ever dropped)

- [ ] DSN set and a test error visible in Sentry

## 3. Deployed E2E (Phase E2)

Set GitHub repo secret `PLAYWRIGHT_DEPLOYMENT_URL=https://<prod>.vercel.app` and repo variable `ENABLE_DEPLOYED_E2E=true`. This activates `.github/workflows/deployed-e2e.yml` (runs after each merge to main + daily).

- [x] Secret + variable set — verified from the job log (run 28647105378, 2026-07-03) that the gated steps actually execute: Playwright installs and "Run deployed API checks" passes against the deployment. A green run alone is not proof — the workflow no-ops green without the secret.

## 4. Uptime monitoring (Phase D1)

Point any uptime service (UptimeRobot, Checkly, Vercel checks) at `GET /api/health` on the production URL. Alert at 2 consecutive failures.

- [x] Monitor live — verified from the job log (run 28660913266, 2026-07-03) that the ping actually executes: `HEALTH_CHECK_URL` is set and the response was `{"ok":true,"service":"msi",...}`. Note the same response shows `config.serverApiAuth: false` — the deployment's server API auth (Supabase env on Vercel) is not configured; see the launch tracking issue.

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
