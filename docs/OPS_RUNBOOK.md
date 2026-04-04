# Operations runbook (production)

Companion to [MONITORING.md](./MONITORING.md) and [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md). Items marked **manual** require human action in Supabase / Vercel / DNS.

## Deploy pipeline

- **GitHub:** Push to `main` triggers CI (typecheck, lint, tests, build, E2E smoke).
- **Vercel:** Connect the repo; set env vars per environment (Production + Preview). Use Preview deployments for risky changes.

## Environment (Vercel / hosting)

| Variable                                       | Purpose                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Auth + cloud data                                                                        |
| `VITE_SENTRY_DSN`                              | Optional client errors ([lib/sentry.ts](../lib/sentry.ts))                               |
| `VITE_ERROR_REPORTING_URL`                     | Optional error beacon ([lib/errorReporting.ts](../lib/errorReporting.ts))                |
| `RATE_LIMIT_AI_MAX_PER_MINUTE`                 | Server: cap for `api/ai/generate` (default **30**; see [MONITORING.md](./MONITORING.md)) |
| `RATE_LIMIT_EBAY_MAX_PER_MINUTE`               | Server: cap for `api/market/ebay` (default **60**)                                       |
| `RATE_LIMIT_DISABLED`                          | Set `1` or `true` to disable throttling — **local debugging only**, never Production     |
| `VITE_*` for Gemini, Stripe, eBay, etc.        | Feature flags; see `.env.example`                                                        |

**Manual:** Rotate keys on incident; never commit secrets.

## Health and uptime

- **GET** `/api/health` — expect `200` and `{ ok: true, ... }`.
- **Manual:** Configure an external uptime checker (e.g. 1–5 min interval) against production URL + `/api/health`.

## Auth and routes

- **App shell:** [App.tsx](../App.tsx) wraps non-public routes in `ProtectedRoute`; public: login, signup, password flows, `/p/:username`.
- **Manual — RLS audit:** Follow **[docs/SUPABASE_RLS.md](./SUPABASE_RLS.md)** (policy map, verification SQL, two-account spot-check). Apply `supabase/migrations/` after baseline schema; confirm `user_data` has RLS for DAL cloud sync.
- **API abuse:** `api/ai/generate` and `api/market/ebay` enforce per-IP rate limits (see **[MONITORING.md](./MONITORING.md)** § Rate limiting). Tune `RATE_LIMIT_*_MAX_PER_MINUTE` on Vercel if needed; use shared storage (KV/Redis) for strict global caps.

## Security

- **CSP:** Report-Only in [vercel.json](../vercel.json); graduate per [CSP_ROLLOUT.md](./CSP_ROLLOUT.md).
- **Dependencies:** `npm run audit:high`; address recurring high/critical advisories.

## Data layer

- **DAL:** [docs/DAL_MIGRATION.md](./DAL_MIGRATION.md) — batches 1–3; canonical code under `lib/utils/`, `lib/core/`, `lib/trading/`, `lib/analytics/`; root `lib/*.ts` shims re-export where listed.

## Quality (ongoing)

- **Coverage:** Raise [vite.config.ts](../vite.config.ts) thresholds as tests land ([COVERAGE_POLICY.md](./COVERAGE_POLICY.md)).
- **Strict TS:** CI runs `npm run typecheck:strict` (required). Locally: same before risky merges ([TYPESCRIPT_STRICT.md](./TYPESCRIPT_STRICT.md)).

## Beta features

- Promote catalog `beta` → `live` only per [BETA_FEATURE_EXIT_CRITERIA.md](./BETA_FEATURE_EXIT_CRITERIA.md) (product + engineering sign-off).
