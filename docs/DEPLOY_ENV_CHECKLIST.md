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

| Item                        | Action                                                                           |
| --------------------------- | -------------------------------------------------------------------------------- |
| `ENABLE_DEPLOYED_E2E`       | Repo variable `true` to run Playwright against a deployment                      |
| `PLAYWRIGHT_DEPLOYMENT_URL` | Secret, e.g. `https://app.vercel.app`                                            |
| `HEALTH_CHECK_URL`          | Secret base URL for [health ping workflow](../.github/workflows/health-ping.yml) |
| `VITE_SENTRY_DSN`           | On Vercel for client errors                                                      |

## Post-deploy smoke

1. `GET /api/health` → 200, `ok: true`
2. Signed-in checkout (test mode) → Stripe → webhook → `profiles` tier (if configured)
3. `PLAYWRIGHT_BASE_URL=<url> npm run test:e2e:deployed`
4. Run SQL in [scripts/rls-verify-queries.sql](../scripts/rls-verify-queries.sql) in Supabase SQL Editor

## References

- [PRODUCTION_ROLLOUT_PHASES.md](./PRODUCTION_ROLLOUT_PHASES.md)
- [OPS_RUNBOOK.md](./OPS_RUNBOOK.md)
- [SUPABASE_EDGE_FUNCTIONS.md](./SUPABASE_EDGE_FUNCTIONS.md)
