# Deployment environment checklist

Use this when promoting a build to **production** (Vercel + Supabase + Stripe + GitHub). Check each box; store secrets only in host dashboards, never in git.

## Vercel (app + serverless `api/*`)

| Variable                                  | Required           | Notes                                                       |
| ----------------------------------------- | ------------------ | ----------------------------------------------------------- |
| `VITE_SUPABASE_URL`                       | Yes                | Same project as Supabase                                    |
| `VITE_SUPABASE_ANON_KEY`                  | Yes                | Browser anon key                                            |
| `VITE_STRIPE_PUBLISHABLE_KEY`             | If billing         | Test vs live per environment                                |
| `VITE_STRIPE_*_PRICE_ID`                  | If billing         | Match Stripe Dashboard price ids                            |
| `SUPABASE_URL`                            | Yes (API routes)   | Server JWT validation for `/api/ai`, `/api/market/ebay`     |
| `SUPABASE_ANON_KEY`                       | Yes                | Same anon key as browser                                    |
| `ALLOWED_ORIGIN`                          | Prod custom domain | Canonical site URL (CORS). Preview can rely on `VERCEL_URL` |
| `GEMINI_API_KEY`                          | If AI              | Server-only                                                 |
| `EBAY_*`                                  | If eBay proxy      | Server-only per `.env.example`                              |
| `STRIPE_SECRET_KEY`                       | If webhooks + sync | Production live key on prod                                 |
| `STRIPE_WEBHOOK_SECRET`                   | If webhooks        | Per Stripe endpoint                                         |
| `SUPABASE_SERVICE_ROLE_KEY`               | If webhooks        | Never `VITE_*`; idempotency + `profiles` PATCH              |
| `STRIPE_BASIC_PRICE_ID` / `PRO` / `ALPHA` | If webhooks        | Same ids as client, for tier mapping                        |
| `MSI_SERVER_API_SECRET`                   | Optional           | Automation Bearer for protected APIs                        |
| `MSI_API_AUTH_DISABLED`                   | **Never in prod**  |                                                             |

## Supabase (project settings)

| Item                  | Action                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migrations            | Apply `supabase/migrations/*.sql` in order (see [SUPABASE_RLS.md](./SUPABASE_RLS.md))                                                                                         |
| Edge Function secrets | `STRIPE_SECRET_KEY`, auto: `SUPABASE_URL`, `SUPABASE_ANON_KEY`                                                                                                                |
| Deploy functions      | From repo root: `supabase functions deploy create-checkout-session` and `create-billing-portal-session` (see [supabase/functions/README.md](../supabase/functions/README.md)) |
| Auth redirect URLs    | Add production and preview site URLs                                                                                                                                          |

## Stripe

| Item        | Action                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Webhook URL | `https://<vercel>/api/stripe-webhook` (or dedicated API domain)                                              |
| Events      | `checkout.session.completed`, subscription + invoice events per [PAYMENT_SECURITY.md](./PAYMENT_SECURITY.md) |
| Prices      | Match `VITE_STRIPE_*_PRICE_ID` and server `STRIPE_*_PRICE_ID`                                                |

## GitHub (optional automation)

| Item                             | Action                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ENABLE_DEPLOYED_E2E`            | Repo variable `true` — adds blocking job `e2e_deployed` in [ci.yml](../.github/workflows/ci.yml)                                     |
| `PLAYWRIGHT_DEPLOYMENT_URL`      | Secret, e.g. `https://app.vercel.app`; required for deployed E2E in CI and [deployed-e2e.yml](../.github/workflows/deployed-e2e.yml) |
| `HEALTH_CHECK_URL`               | Secret base URL for [health ping workflow](../.github/workflows/health-ping.yml)                                                     |
| `VITE_SENTRY_DSN`                | On Vercel for client errors (see [MONITORING.md § Sentry setup](./MONITORING.md#sentry-setup-production))                            |
| `VITE_SENTRY_ENVIRONMENT`        | On Vercel, optional; defaults to build mode (`production` / `preview`)                                                               |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | On Vercel, optional `0`–`1`; defaults to `0.1`                                                                                       |

## Supabase project + Vercel env sync

**Current production project:** `ModernSportsIntelligence` — ref `vhbsokjqchaafluimgjh` (`https://vhbsokjqchaafluimgjh.supabase.co`). The older paused project `iwxqemiqtusgmemlnrby` is not used.

**Status (2026-09-05):** `vhbsokjqchaafluimgjh` is **INACTIVE / paused** so Pulse can occupy the free-plan slot. July 18 cutover (migrations, Edge Functions, Vercel/GitHub env) is the last successful activation. Restore this project, then re-sync Vercel env, before owner-held live-data steps (Stripe smoke, eBay/PSA flags, admin-audit confirm). Do **not** restore or pause from an engineering PR.

## Supabase unpause + Vercel env sync

If the linked Supabase project is **paused** (free-tier slot or inactivity), restore it before migrations or env sync:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → select the project → **Restore project**
2. Wait until the project is active (API + database healthy)
3. From repo root (after `supabase link`):

```bash
npm run sync:vercel-env
# optional preview targets: npm run sync:vercel-env -- --preview
```

`sync:vercel-env` reads the linked project ref from `supabase/.temp/project-ref` (or `supabase status --output json`), fetches anon credentials via `supabase projects api-keys`, and prints `vercel env add` commands for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ALLOWED_ORIGIN`. In CI, secret values are **not** printed — run interactively locally or paste from **Settings → API** in the dashboard.

If the project is still paused, the script exits with the dashboard URL to unpause.

## Pre-deploy validation

From a linked Vercel project, pull production env and validate:

```bash
npm run check:prod-env -- --from-vercel
# or: vercel env pull .env.production.local --environment=production
#     npm run check:prod-env
```

`npm run deploy:infra` runs this check automatically at the end (non–dry-run) after Supabase migrations/functions.

Use `--strict` to fail on warnings (e.g. missing `ALLOWED_ORIGIN`, `MSI_API_AUTH_DISABLED`).

## Post-deploy smoke

1. `GET /api/health` → 200, `ok: true`, `config.serverApiAuth: true` when Supabase is configured
2. Signed-in checkout (test mode) → Stripe → webhook → `profiles` tier (if configured)
3. `PLAYWRIGHT_BASE_URL=<url> npm run test:e2e:deployed`
4. Run SQL in [scripts/rls-verify-queries.sql](../scripts/rls-verify-queries.sql) in Supabase SQL Editor

## References

- [PRODUCTION_ROLLOUT_PHASES.md](./PRODUCTION_ROLLOUT_PHASES.md)
- [OPS_RUNBOOK.md](./OPS_RUNBOOK.md)
- [SUPABASE_EDGE_FUNCTIONS.md](./SUPABASE_EDGE_FUNCTIONS.md)
