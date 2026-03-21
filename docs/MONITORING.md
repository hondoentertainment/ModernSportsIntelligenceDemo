# Production Monitoring & Observability

For a broader checklist (deploy, RLS audit, env vars, CSP), see **[OPS_RUNBOOK.md](./OPS_RUNBOOK.md)**.

## Health check

- **Endpoint:** `GET /api/health` (or `HEAD /api/health`)
- **Response:** `200` with JSON `{ ok: true, service: "msi", timestamp: "<ISO>" }`
- **Use:** Load balancers, uptime checks (e.g. Better Uptime, Checkly), and post-deploy verification.
- **Note:** Served by Vercel serverless when deployed; not available under `npm run preview`.

## Error reporting

- **Client:** `reportError(error, context)` in `lib/errorReporting.ts` logs via the app logger and, when `VITE_ERROR_REPORTING_URL` is set, sends a JSON beacon (e.g. your API or ingest).
- **Sentry (optional):** `initSentry()` runs at bootstrap in [`index.tsx`](../index.tsx). When `VITE_SENTRY_DSN` is set and `@sentry/react` is installed (**optionalDependency** in `package.json`), the SDK loads dynamically and `reportError` forwards to `captureException` via [`lib/sentry.ts`](../lib/sentry.ts). No DSN → no-op.
- **Wired:** `ErrorBoundary` and `LazyErrorBoundary` call `reportError` on `componentDidCatch`. **Unhandled promise rejections** are also reported: `window.addEventListener('unhandledrejection', ...)` in `index.tsx` calls `reportError(event.reason)` so escaped rejections are captured.
- **Production:** Set `VITE_SENTRY_DSN` and/or `VITE_ERROR_REPORTING_URL` in the Vercel (or host) environment; never commit secrets.

## CI

- **Build & test:** CI runs typecheck, lint, format, unit tests with coverage, `npm audit --audit-level=high` (non-blocking), build, and E2E smoke (auth, dashboard, release).
- **Health in CI:** The E2E spec `api-health.spec.ts` skips when `/api/health` is not available (e.g. Vite preview). To assert health in CI, run E2E against a deployed URL (`PLAYWRIGHT_BASE_URL` set to the Vercel deployment).

## API (server-side) logging

- **Structured logging:** API routes use `api/lib/logger.ts` (`apiLogger.error`, `apiLogger.warn`, `apiLogger.info`) so Vercel/server logs are consistent and grep-able (e.g. `[api] ERROR`).
- **Used in:** `api/market/ebay.ts`, `api/ai/generate.ts`. Use `apiLogger` in new API handlers instead of `console.error`.

## Rate limiting

API routes (e.g. `/api/health`, `/api/market/ebay`, `/api/ai/generate`) should be protected by rate limiting in production (e.g. Vercel rate limit or a middleware). Implement per-IP or per-key limits to prevent abuse.

## Bundle size

- **Script:** `npm run build:size` runs `vite build` then prints the size of `dist/assets/*.js` (top 5 largest chunks and total). Use it to track bundle size and enforce the performance budget (see PRODUCTION_READINESS.md §2.3).

## Dependency audit

- **Local:** Run `npm run audit:high` (same as `npm audit --audit-level=high`) to list known vulnerabilities at **high** or **critical** severity in the dependency tree. Lower severities are omitted so the output stays focused on the most serious issues.
- **CI:** The main CI job runs this audit after unit tests with `continue-on-error: true`, so the workflow still passes while surfacing audit results in the job log. Treat repeated failures as a signal to upgrade or patch dependencies (see `npm audit fix` where safe).
- **Note:** `npm audit` reflects the npm advisory database and your lockfile; it does not replace code review or other supply-chain checks.

## Runbook: Health check failing

When `GET /api/health` returns non-200 or timeouts:

1. **Check Vercel deployment status and function logs** — Confirm the latest deploy succeeded and inspect Vercel dashboard logs for the health route.
2. **Verify the `api/health.ts` function is deployed** — Ensure there are no build/syntax errors and the serverless function is present in the deployment.
3. **If using a load balancer or proxy** — Ensure the `/api/health` path is allowed and not blocked or rewritten.
4. **Consider alerting** — Alert when the health endpoint fails 3 times in a row (e.g. via your uptime checker) to reduce noise from transient blips.

## Next steps

- Set `VITE_SENTRY_DSN` and/or `VITE_ERROR_REPORTING_URL` in production for client error tracking (Sentry wiring is already in code; DSN activates it).
- Configure uptime monitoring to hit `https://<your-domain>/api/health` every 1–5 minutes.
- Use coverage and build artifacts from CI for trend and regression visibility; raise `vite.config.ts` coverage thresholds as the whitelist improves (see [COVERAGE_POLICY.md](./COVERAGE_POLICY.md)).
