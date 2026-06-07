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

- **Implemented:** `api/lib/rateLimit.ts` — fixed-window per client key on **`api/ai/generate`** and **`api/market/ebay`** (key = `x-forwarded-for` first hop, then `x-real-ip`, then socket). Returns **429** with `Retry-After` when exceeded.
- **Env (server-only):** `RATE_LIMIT_AI_MAX_PER_MINUTE` (default **30**), `RATE_LIMIT_EBAY_MAX_PER_MINUTE` (default **60**). Set **`RATE_LIMIT_DISABLED=1`** only for local debugging (never in production).
- **Caveat:** In-memory buckets are **per serverless isolate**; for a single global budget across all regions/instances, use **Vercel KV**, **Upstash Redis**, or an edge middleware. `/api/health` and **`api/stripe-webhook`** are not throttled (health probes and signed Stripe traffic).

## CORS (AI and eBay API routes)

- **`api/lib/httpProduction.ts`** sets `Access-Control-Allow-Origin` from **`ALLOWED_ORIGIN`** or **`https://$VERCEL_URL`**. Wildcard (`*`) is used only outside production; custom domains should set **`ALLOWED_ORIGIN`** to the canonical site URL.
- **Preflight:** `Access-Control-Allow-Headers` includes **`Authorization`** so browsers may send Supabase session Bearer tokens to **`/api/ai/generate`** and **`/api/market/ebay`**.
- **Misconfiguration:** If production has neither **`ALLOWED_ORIGIN`** nor **`VERCEL_URL`**, the handler logs a warning and omits `Access-Control-Allow-Origin` until env is corrected.

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

## Sentry setup (production)

The code path is already wired ([`lib/sentry.ts`](../lib/sentry.ts), `initSentry()` in [`index.tsx`](../index.tsx), `reportError → captureException` in [`lib/errorReporting.ts`](../lib/errorReporting.ts)). Activate it in production with these steps:

1. **Create a Sentry project** of platform "React" and copy the **DSN** (looks like `https://<key>@oXXX.ingest.sentry.io/<projectId>`).
2. **Add env vars in Vercel** → Settings → Environment Variables → Production (and Preview if you want preview deploys reported separately):
   - `VITE_SENTRY_DSN=<DSN>` (required to activate Sentry).
   - `VITE_SENTRY_ENVIRONMENT=production` (optional; defaults to `import.meta.env.MODE`).
   - `VITE_SENTRY_TRACES_SAMPLE_RATE=0.1` (optional; performance traces, leave unset for errors only).
3. **Confirm the dependency.** `@sentry/react` is listed under `optionalDependencies` in [`package.json`](../package.json) so installs without a DSN do not pay for the SDK weight. Vercel installs optional deps by default; if you self-host with `npm ci --omit=optional`, drop that flag for production builds.
4. **Redeploy.** A successful build with the DSN set will produce a Sentry-instrumented bundle; without the DSN `initSentry()` returns early and no SDK is loaded.
5. **Verify.** From the deployed app, run `window.dispatchEvent(new ErrorEvent('error', { error: new Error('sentry smoke test') }))` in the console (or trigger a deliberate exception in a non-prod feature flag). The event should appear in the Sentry **Issues** view within ~30s.
6. **PII / data-scrubbing.** The default Sentry SDK forwards stack traces and breadcrumbs but not the request body. Review [Sentry's PII docs](https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/) before enabling **Send Default PII** — keep it off unless legal has signed off, since the app handles billing and user portfolios.
7. **Alerting.** Configure Sentry alerts for: new issue, regression on a resolved issue, error spike (`> 50/hr`), and any error in the `Stripe` or `Auth` files (route by file path or release tag).

CSP already permits Sentry under the wildcard `connect-src https:`; if you tighten that wildcard later (see [CSP_ROLLOUT.md](./CSP_ROLLOUT.md)), explicitly allow `https://*.ingest.sentry.io` and `https://*.sentry.io`.

## Uptime monitoring setup

`GET /api/health` is the single endpoint to monitor. It is cache-busted (`Cache-Control: no-store`) and serves from Vercel's serverless runtime, so a failing probe means the deployment itself is unreachable.

Recommended configuration (Better Uptime, Checkly, UptimeRobot, Pingdom, or Vercel Monitoring):

| Field             | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| URL               | `https://<your-domain>/api/health`                                          |
| Method            | `HEAD` preferred (cheaper); `GET` works and lets you assert response body.  |
| Interval          | 1–3 minutes for primary monitor; 5 minutes for paid-tier savings.           |
| Regions           | At least 3 (US-East, US-West, EU-West) to avoid single-region false alarms. |
| Timeout           | 10 s.                                                                       |
| Failure threshold | 3 consecutive failures before paging (filters transient blips).             |
| Status assertion  | HTTP 200 and (for GET) JSON body matches `"ok":true`.                       |
| Notify            | PagerDuty / Slack / email rotation per on-call.                             |

Optional second probe — assert the API plane is healthy end-to-end:

- **Synthetic check:** `POST /api/csp-report` with `{"csp-report":{"effective-directive":"script-src","blocked-uri":"https://probe.example"}}` — expect `204` and a `CSP violation` log line. Alerting off this catches regressions where the route is removed but `/api/health` still works.
- **Deployed E2E (`npm run test:e2e:deployed`):** Set `ENABLE_DEPLOYED_E2E=true` and `PLAYWRIGHT_DEPLOYMENT_URL` in CI to run the post-deploy E2E suite against the live URL.

## Next steps

- Use coverage and build artifacts from CI for trend and regression visibility; raise `vite.config.ts` coverage thresholds as the whitelist improves (see [COVERAGE_POLICY.md](./COVERAGE_POLICY.md)).
- After 1–2 weeks of `apiLogger.warn('CSP violation', ...)` data, tighten `connect-src` and `img-src` from `https:` wildcards to explicit origins ([CSP_ROLLOUT.md §Outstanding hardening](./CSP_ROLLOUT.md#outstanding-hardening)).
