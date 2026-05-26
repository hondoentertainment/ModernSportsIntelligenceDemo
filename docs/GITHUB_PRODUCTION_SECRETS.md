# GitHub production secrets & variables

Configure these in **GitHub → Settings → Secrets and variables → Actions** for automated production verification.

## Repository variables

| Variable | Value | Purpose |
| -------- | ----- | ------- |
| `ENABLE_DEPLOYED_E2E` | `true` | Runs Playwright against a live Vercel deployment after CI (`.github/workflows/ci.yml`) |

## Repository secrets

| Secret | Example | Purpose |
| ------ | ------- | ------- |
| `PLAYWRIGHT_DEPLOYMENT_URL` | `https://your-app.vercel.app` | Base URL for `npm run test:e2e:deployed` in CI |
| `HEALTH_CHECK_URL` | `https://your-app.vercel.app` | Scheduled `GET /api/health` (`.github/workflows/health-ping.yml`) |
| `SUPABASE_DB_URL` | `postgresql://...` | Optional RLS guardrail (`npm run test:rls`) |

## Vercel (not GitHub — set in Vercel dashboard)

| Variable | Purpose |
| -------- | ------- |
| `VITE_SENTRY_DSN` | Client error reporting ([lib/sentry.ts](../lib/sentry.ts)) |
| `VITE_ERROR_REPORTING_URL` | Optional error beacon |
| `ALLOWED_ORIGIN` | Production CORS for `/api/*` |

## Post-config verification

```bash
npm run deploy:infra:dry          # local checklist
PLAYWRIGHT_BASE_URL=https://<url> npm run test:e2e:deployed
npm run test:rls                  # when SUPABASE_DB_URL is set locally or in CI
```

See also: [DEPLOY_ENV_CHECKLIST.md](./DEPLOY_ENV_CHECKLIST.md), [MONITORING.md](./MONITORING.md).
