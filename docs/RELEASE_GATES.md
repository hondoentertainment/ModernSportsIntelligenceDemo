# Release gates

Required checks before merge to `main` or release tag creation.

## CI required gates

Run in CI workflow (`.github/workflows/ci.yml`):

1. `npm run typecheck`
2. `npm run typecheck:strict`
3. `npm run lint`
4. `npm run format:check`
5. `npm run test:coverage`
6. `npm run guardrail:pricing-truth`
7. `npm run build`
8. `npm run test:e2e:smoke` (auth, dashboard, release smoke, billing/checkout UX)
9. `npm run test:e2e:pricing-truth`
10. **Optional (Vercel):** `PLAYWRIGHT_BASE_URL=https://<deployment> npm run test:e2e:deployed` — asserts `/api/health` and unauthenticated 401/503 on protected API routes. CI: set repo variable `ENABLE_DEPLOYED_E2E=true` and secret `PLAYWRIGHT_DEPLOYMENT_URL` (see `.github/workflows/ci.yml`).

## Release workflow gates

Run in release workflow (`.github/workflows/release.yml`):

1. Version format validation and package version match.
2. `npm run verify`
3. `npm run guardrail:pricing-truth`
4. `npm run test:e2e:pricing-truth`
5. `npm run build`

## Manual quality sign-off

- Desktop and mobile smoke pass for login, dashboard, collection, favorites, profile.
- No open Sev-1 / Sev-2 defects.
- Rollback instructions validated from `docs/ROLLBACK_AND_STABILIZATION.md`.
