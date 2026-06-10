# Production rollout phases

Ordered checklist to take the full app from demo-grade to production-grade. Complete earlier phases before relying on later ones.

## Phase A — Data & access control

| Step | Action                                                                              | Reference                                |
| ---- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| A1   | Migrate user-owned state off raw `localStorage` to the DAL (`initDAL`, `syncStore`) | [DAL_MIGRATION.md](./DAL_MIGRATION.md)   |
| A2   | Run RLS verification SQL with real test users (free/basic/pro/alpha)                | [SUPABASE_RLS.md](./SUPABASE_RLS.md)     |
| A3   | Regenerate `types/supabase.gen.ts` after schema changes                             | [SUPABASE_TYPES.md](./SUPABASE_TYPES.md) |
| A4   | Inventory remaining `localStorage` usage                                            | `npm run audit:localstorage`             |

## Phase B — Billing & API trust boundaries

| Step | Action                                                                                                        | Reference                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1   | Deploy Edge Functions from `supabase/functions/`; JWT is source of truth; forward `Idempotency-Key` to Stripe | [supabase/functions/README.md](../supabase/functions/README.md), [SUPABASE_EDGE_FUNCTIONS.md](./SUPABASE_EDGE_FUNCTIONS.md), [PAYMENT_SECURITY.md](./PAYMENT_SECURITY.md) |
| B2   | Vercel env: `STRIPE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, price ID mapping                | `.env.example`                                                                                                                                                            |
| B3   | Browser → `/api/ai`, `/api/market`: `ALLOWED_ORIGIN` on custom domain; never `MSI_API_AUTH_DISABLED` in prod  | [MONITORING.md](./MONITORING.md)                                                                                                                                          |

## Phase C — Security & CSP

| Step | Action                                                                                           | Reference                                    |
| ---- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| C1   | Review `Content-Security-Policy` in `vercel.json` after each new third-party script              | [CSP_ROLLOUT.md](./CSP_ROLLOUT.md)           |
| C2   | Treat `npm audit --audit-level=high` as merge criteria (CI logs; tighten to blocking when clean) | CI workflow                                  |
| C3   | No server secrets in `VITE_*`; rotate keys on incident                                           | [PAYMENT_SECURITY.md](./PAYMENT_SECURITY.md) |

## Phase D — Reliability & observability

| Step | Action                                                              | Reference                        |
| ---- | ------------------------------------------------------------------- | -------------------------------- |
| D1   | Uptime checks on `GET /api/health` (production URL)                 | [MONITORING.md](./MONITORING.md) |
| D2   | Enable Sentry (`VITE_SENTRY_DSN`) and/or error beacon in production | [MONITORING.md](./MONITORING.md) |
| D3   | Alert on Stripe webhook 5xx and idempotency `503` spikes            | Runbooks                         |

## Phase E — Testing against real deployments

| Step | Action                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| E1   | `PLAYWRIGHT_BASE_URL=https://<your-prod-or-preview>.vercel.app npm run test:e2e:deployed`                                          |
| E2   | `npm run build && npx vite preview --port 4173` then `SMOKE_BASE_URL=http://127.0.0.1:4173 npm run test:smoke:routes` (223 routes) |
| E3   | Set secret `PLAYWRIGHT_DEPLOYMENT_URL` — `.github/workflows/deployed-e2e.yml` runs after CI on `main` + daily                      |

## Phase F — Performance & UX

| Step | Action                                                                            |
| ---- | --------------------------------------------------------------------------------- |
| F1   | `npm run build:size` in release process; track largest chunks                     |
| F2   | Mobile + accessibility pass on top routes (login, dashboard, collection, billing) |

## Deploy targets

- **Vercel:** Push to `main` (or merge PR) when the repo is connected — production deployment.
- **GitHub Pages:** This repo’s workflow deploys static `dist/` from `main` after CI + smoke E2E (no serverless `/api/*` on Pages).
- **Recommendation:** Use **Vercel** as the canonical host for MSI so `/api/*` and webhooks work; treat Pages as optional static mirror if configured.
