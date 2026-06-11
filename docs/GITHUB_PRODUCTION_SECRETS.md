# GitHub production secrets & variables

Configure these in **GitHub → Settings → Secrets and variables → Actions** for automated production verification.

## Repository variables

| Variable              | Value  | Purpose                                                                                                 |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `ENABLE_DEPLOYED_E2E` | `true` | Optional: runs deployed E2E inside the main CI workflow (`.github/workflows/ci.yml` job `e2e_deployed`) |

## Repository secrets

| Secret                      | Example                                              | Purpose                                                                                                                             |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `PLAYWRIGHT_DEPLOYMENT_URL` | `https://modern-sports-intelligence-demo.vercel.app` | Base URL for `npm run test:e2e:deployed` — used by `.github/workflows/deployed-e2e.yml` (after merge to `main`) and optional CI job |
| `HEALTH_CHECK_URL`          | `https://modern-sports-intelligence-demo.vercel.app` | Scheduled `GET /api/health` (`.github/workflows/health-ping.yml`)                                                                   |
| `PLAYWRIGHT_TEST_EMAIL`     | `collector@example.com`                              | Optional: real Supabase user for `npm run test:e2e:real-auth` (when Supabase env is on Vercel)                                      |
| `PLAYWRIGHT_TEST_PASSWORD`  | _(test account password)_                            | Pair with `PLAYWRIGHT_TEST_EMAIL`; never use production user passwords                                                              |
| `SUPABASE_DB_URL`           | `postgresql://...`                                   | Optional RLS guardrail (`npm run test:rls`)                                                                                         |

## Vercel (not GitHub — set in Vercel dashboard)

| Variable                   | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `VITE_SENTRY_DSN`          | Client error reporting ([lib/sentry.ts](../lib/sentry.ts)) |
| `VITE_ERROR_REPORTING_URL` | Optional error beacon                                      |
| `ALLOWED_ORIGIN`           | Production CORS for `/api/*`                               |

## Post-config verification

```bash
npm run deploy:infra:dry          # local checklist
npm run build && npx vite preview --port 4173 &
SMOKE_BASE_URL=http://127.0.0.1:4173 npm run test:smoke:routes
PLAYWRIGHT_BASE_URL=https://<url> npm run test:e2e:deployed
PLAYWRIGHT_BASE_URL=https://<url> PLAYWRIGHT_TEST_EMAIL=... PLAYWRIGHT_TEST_PASSWORD=... npm run test:e2e:real-auth
npm run test:rls                  # when SUPABASE_DB_URL is set locally or in CI
```

### Quick GitHub CLI setup (production URL)

```bash
gh secret set PLAYWRIGHT_DEPLOYMENT_URL --body "https://modern-sports-intelligence-demo.vercel.app"
gh secret set HEALTH_CHECK_URL --body "https://modern-sports-intelligence-demo.vercel.app"
```

See also: [DEPLOY_ENV_CHECKLIST.md](./DEPLOY_ENV_CHECKLIST.md), [MONITORING.md](./MONITORING.md).
