# Production Monitoring & Observability

## Health check

- **Endpoint:** `GET /api/health` (or `HEAD /api/health`)
- **Response:** `200` with JSON `{ ok: true, service: "msi", timestamp: "<ISO>" }`
- **Use:** Load balancers, uptime checks (e.g. Better Uptime, Checkly), and post-deploy verification.
- **Note:** Served by Vercel serverless when deployed; not available under `npm run preview`.

## Error reporting

- **Client:** `reportError(error, context)` in `lib/errorReporting.ts` logs via the app logger and, when `VITE_ERROR_REPORTING_URL` is set, sends a JSON beacon (e.g. Sentry ingest or your API).
- **Wired:** `ErrorBoundary` and `LazyErrorBoundary` call `reportError` on `componentDidCatch`. **Unhandled promise rejections** are also reported: `window.addEventListener('unhandledrejection', ...)` in `index.tsx` calls `reportError(event.reason)` so escaped rejections are captured.
- **Optional:** Set `VITE_ERROR_REPORTING_URL` in production to collect errors (ensure endpoint accepts POST and CORS if needed). To use Sentry, add `@sentry/react`, call `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })` when DSN is set, and optionally have `reportError` call `Sentry.captureException` when Sentry is initialized.

## CI

- **Build & test:** CI runs typecheck, lint, format, unit tests with coverage, build, and E2E smoke (auth, dashboard, release).
- **Health in CI:** The E2E spec `api-health.spec.ts` skips when `/api/health` is not available (e.g. Vite preview). To assert health in CI, run E2E against a deployed URL (`PLAYWRIGHT_BASE_URL` set to the Vercel deployment).

## API (server-side) logging

- **Structured logging:** API routes use `api/lib/logger.ts` (`apiLogger.error`, `apiLogger.warn`, `apiLogger.info`) so Vercel/server logs are consistent and grep-able (e.g. `[api] ERROR`).
- **Used in:** `api/market/ebay.ts`, `api/ai/generate.ts`. Use `apiLogger` in new API handlers instead of `console.error`.

## Rate limiting

API routes (e.g. `/api/health`, `/api/market/ebay`, `/api/ai/generate`) should be protected by rate limiting in production (e.g. Vercel rate limit or a middleware). Implement per-IP or per-key limits to prevent abuse.

## Bundle size

- **Script:** `npm run build:size` runs `vite build` then prints the size of `dist/assets/*.js` (top 5 largest chunks and total). Use it to track bundle size and enforce the performance budget (see PRODUCTION_READINESS.md §2.3).

## Runbook: Health check failing

When `GET /api/health` returns non-200 or timeouts:

1. **Check Vercel deployment status and function logs** — Confirm the latest deploy succeeded and inspect Vercel dashboard logs for the health route.
2. **Verify the `api/health.ts` function is deployed** — Ensure there are no build/syntax errors and the serverless function is present in the deployment.
3. **If using a load balancer or proxy** — Ensure the `/api/health` path is allowed and not blocked or rewritten.
4. **Consider alerting** — Alert when the health endpoint fails 3 times in a row (e.g. via your uptime checker) to reduce noise from transient blips.

## Next steps

- Add Sentry (or similar) and set `VITE_ERROR_REPORTING_URL` or `VITE_SENTRY_DSN` for client error tracking.
- Configure uptime monitoring to hit `https://<your-domain>/api/health` every 1–5 minutes.
- Use coverage and build artifacts from CI for trend and regression visibility.
