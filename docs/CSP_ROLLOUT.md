# Content Security Policy (CSP) rollout

## Current state

[Vercel `headers`](../vercel.json) send a **blocking** **`Content-Security-Policy`** plus matching `report-uri` / `report-to` directives. Violations POST to **[`api/csp-report.ts`](../api/csp-report.ts)**, which structured-logs them via `apiLogger.warn` so they appear next to other API logs.

Headers also shipped alongside CSP:

- **`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`** — HTTPS only, two years.
- **`Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`** — disable unused powerful features and the FLoC cohort.
- **`X-Frame-Options: SAMEORIGIN`** / **`X-Content-Type-Options: nosniff`** / **`Referrer-Policy: strict-origin-when-cross-origin`**.

Policy (summary):

- **`base-uri 'self'`** / **`frame-ancestors 'self'`** — align with same-origin framing expectations.
- **`script-src`** — `'self'`, `'unsafe-inline'` (see hardening below), **`https://cdn.tailwindcss.com`** (dev index), **`https://js.stripe.com`** (Stripe.js).
- **`style-src`** — `'self'`, `'unsafe-inline'`, **`https://fonts.googleapis.com`**.
- **`font-src`** — `'self'`, **`https://fonts.gstatic.com`**, **`data:`** (icons).
- **`img-src`** — `'self'`, **`data:`**, **`blob:`**, **`https:`** (card images and CDNs).
- **`connect-src`** — `'self'`, **`https:`**, **`wss:`** (Supabase HTTP + Realtime, Sentry, error beacon).
- **`worker-src 'self'`** — service worker.
- **`manifest-src 'self'`** — PWA manifest.
- **`media-src`** — `'self'` + **`https:`** for streamed assets if used.
- **`frame-src`** — **`https://js.stripe.com`**, **`https://hooks.stripe.com`** (Stripe Elements / 3DS).
- **`form-action`** — `'self'` + **`https://checkout.stripe.com`** (hosted Checkout redirects).

## Monitoring violations

1. **Vercel logs** — search for `CSP violation` to see the structured `apiLogger.warn` payloads (`directive`, `blockedUri`, `documentUri`, `sourceFile`, `userAgent`).
2. **Browser devtools** — the Issues panel surfaces violations during local testing. Use this when tightening directives.
3. **Sentry** — optional. Forwarding from `api/csp-report.ts` to Sentry is left as a follow-up; today it logs to Vercel only to keep the report path dependency-free.

## Outstanding hardening

- **Remove `'unsafe-inline'` from `script-src`.** `index.html` still inlines a service-worker registration script and a small bootstrap. Either move the inline scripts to external files under `/public` (preferred) or compute SHA-256 hashes and add them to `script-src`. Until this is done the policy does not protect against most injection-based XSS.
- **Drop `https:` wildcards in `connect-src` / `img-src`.** Replace with the explicit list of API and image origins (Supabase project URL, `wss://*.supabase.co`, eBay, MLB Stats, image CDNs). Use real traffic from `api/csp-report.ts` to identify the long tail.
- **Move `cdn.tailwindcss.com` out of production.** It is convenient for the prototype but pulls a runtime JIT compiler from a third party. Switch to the Tailwind CLI / PostCSS pipeline for production builds and remove the host from `script-src`.

## When to adjust

Move the policy back to **Report-Only** temporarily if a directive change starts blocking real users (you will see `CSP violation` spikes in `apiLogger.warn` and a regression in feature usage). Steps:

1. Rename the `Content-Security-Policy` header in `vercel.json` to `Content-Security-Policy-Report-Only`.
2. Ship the broader directive in parallel and watch reports until the violation rate drops.
3. Flip back to enforcing once stable.

## Related docs

- [MONITORING.md](./MONITORING.md) — health, errors, audits.
- [PRODUCTION_READINESS.md §4.1](../PRODUCTION_READINESS.md#41-input-validation-and-sanitization) — CSP and XSS hardening context.
