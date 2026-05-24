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

## Next steps

- Set `VITE_SENTRY_DSN` and/or `VITE_ERROR_REPORTING_URL` in production for client error tracking (Sentry wiring is already in code; DSN activates it).
- Configure uptime monitoring to hit `https://<your-domain>/api/health` every 1–5 minutes.
- Use coverage and build artifacts from CI for trend and regression visibility; raise `vite.config.ts` coverage thresholds as the whitelist improves (see [COVERAGE_POLICY.md](./COVERAGE_POLICY.md)).

## CodeQL & dependency audit

Two automated security scans run on every PR + push to `main`:

- **CodeQL** (`.github/workflows/codeql.yml`) — GitHub's native SAST for `javascript-typescript` using the `security-and-quality` query pack. Also runs weekly on Monday 06:00 UTC so newly disclosed vulns are caught against an unchanged codebase. Findings appear under **Security → Code scanning** in the GitHub UI.
- **`npm audit --audit-level=high`** (in `.github/workflows/ci.yml` → `ci` job) — **blocking** as of v4.4. Use `npm audit fix` or pin the affected dependency to address. If a transitive vuln has no fix yet, document the exception in `plans/incidents/` and add a temporary `package.json` override.

Local equivalents:

```bash
npm run audit:high   # same gate as CI
```

## Lighthouse CI

`.github/workflows/lighthouse.yml` runs on every PR + push to `main` (also `workflow_dispatch`). It builds `dist/`, serves it as static, and runs Lighthouse 3× against the SPA root + `#/login` deep-link (Dashboard is the SPA index route at `/`, so the secondary URL audits a distinct public view).

Reports are uploaded to Google's free temporary public storage and the URL is posted as a PR comment. **Links expire after a few days** — capture the report if you want a permanent record.

### Budgets (`.lighthouserc.json`)

- **A11y ≥ 0.90 → blocking**. We invested in axe + color-contrast; regressions break a real promise.
- **CLS ≤ 0.10 → blocking**. Layout shift regressions are user-visible bugs.
- Performance / best-practices / SEO → warn-only at first. Tighten over time.

### Tightening the budget

When a PR consistently exceeds a `warn` threshold, promote it to `error` so it starts blocking. The reverse is also fine — if a budget catches noise more than regressions, demote it.

### Running locally

```bash
npm run build
npx lhci autorun
```

(Requires the `@lhci/cli` to be on the PATH — `npx` will fetch on first run.)

## Real-user Web Vitals (RUM)

`lib/utils/webVitals.ts` wraps the [`web-vitals`](https://github.com/GoogleChrome/web-vitals) library and reports CLS, INP, LCP, FCP, TTFB to a beacon endpoint on every page load.

### Pipeline

1. `index.tsx` calls `initWebVitals()` once after the React root mounts.
2. Each Core Web Vital fires its handler when the metric becomes final (e.g. LCP on visibility-change).
3. Each event is sampled (default **25% in production, 100% in dev**, override via `VITE_RUM_SAMPLE_RATE=0-1`).
4. Surviving events are POSTed via `navigator.sendBeacon` to `VITE_RUM_BEACON_URL` (default `/api/telemetry/web-vitals`), with a `fetch keepalive` fallback if the browser doesn't support sendBeacon or rejected the payload.

### Server endpoint

The beacon URL `/api/telemetry/web-vitals` does NOT exist yet — RUM events will 404 silently until it's implemented. The recommended shape:

```ts
// api/telemetry/web-vitals.ts
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  // parse body, forward to Sentry / Datadog / your warehouse here.
  res.status(204).end();
}
```

Until that handler exists, the metrics are still computed in the browser but silently dropped on the server.

### Why 25% sampling

A 100% sample rate on a high-traffic SPA pushes beacons in the tens of thousands per day. 25% gives a statistically clean signal at a quarter of the cost. Drop to 5–10% if you scale to millions of pageviews.

### Local override

To see every metric while developing:

```bash
VITE_RUM_SAMPLE_RATE=1 npm run dev
```

## Bundle size budget

`.github/workflows/bundle-size.yml` runs on every PR + push to `main` (also `workflow_dispatch`). It builds `dist/`, sums gzipped JS, and **blocks the PR** if the total exceeds the budget defined in `package.json → scripts.size:check` (currently **3,030,000** bytes ≈ **2,959 KB** ≈ **2.89 MB** gzipped — see TODO note in the workflow about tightening once `lib-services` is code-split).

The budget was set at measured-current (~2,881 KB gzipped at v4.3.0) × 1.05, rounded up to the nearest 10 KB. This is **deliberately a regression gate, not an aspirational target** — the `lib-services` chunk alone is ~1.1 MB gzipped and needs structural work before the budget can drop meaningfully.

### Tightening the budget

When the gap between the measured size and the budget grows, ratchet the budget down — open a one-line PR that lowers the `--max=` flag in `scripts.size:check`. The expected long-term floor (after `lib-services` is properly code-split and `recharts` lazy-loaded) is closer to ~600–800 KB gzipped.

### Diagnosing a regression

The Action uploads the full `dist/` as an artifact for 7 days. To investigate:

1. Download `bundle-report` from the failed workflow run.
2. Run `npx source-map-explorer dist/assets/*.js` locally to attribute size to source modules.
3. Common offenders: a new icon library import, a heavy date/i18n lib, a duplicated copy of React via npm peer issues, a non-tree-shakeable `lucide-react` star-import.

### Running locally

```bash
npm run build && npm run size:check
```

Exits `0` under budget, `1` over budget with a top-10 chunk breakdown by gzipped size.

