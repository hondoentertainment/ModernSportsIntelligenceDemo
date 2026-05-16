# Content Security Policy (CSP) rollout

## Current state

[Vercel `headers`](../vercel.json) send a **blocking** **`Content-Security-Policy`** with violation reporting wired: the policy carries `report-uri /api/csp-report` plus `report-to csp-endpoint`, and a `Reporting-Endpoints` header maps `csp-endpoint` to [`/api/csp-report`](../api/csp-report.ts). That route logs each violation via `apiLogger.warn`, so an over-tight policy surfaces in server logs instead of failing silently. Monitor those logs after adding any new third-party script/origin; if something legitimate is blocked, extend `connect-src` / `script-src` / `frame-src` accordingly.

Policy (summary):

- **`base-uri 'self'`** / **`frame-ancestors 'self'`** — align with same-origin framing expectations.
- **`script-src`** — `'self'`, `'unsafe-inline'`, **`https://cdn.tailwindcss.com`** (dev index), **`https://js.stripe.com`** (Stripe.js).
- **`font-src`** — `'self'`, **`https://fonts.gstatic.com`**, **`data:`** (icons).
- **`img-src`** — `'self'`, **`data:`**, **`blob:`**, **`https:`** (card images and CDNs).
- **`connect-src`** — `'self'`, **`https:`**, **`wss:`** (Supabase HTTP + Realtime).
- **`worker-src 'self'`** — service worker.
- **`manifest-src 'self'`** — PWA manifest.
- **`media-src`** — `'self'` + **`https:`** for streamed assets if used.
- **`frame-src`** — **`https://js.stripe.com`**, **`https://hooks.stripe.com`** (Stripe Elements / 3DS).
- **`form-action`** — `'self'` + **`https://checkout.stripe.com`** (hosted Checkout redirects).

## Hardening backlog

The policy is already blocking; remaining tightening work, in priority order:

1. **Remove `'unsafe-inline'` from `script-src`** — adopt nonces or hashes for the
   few required inline scripts (or eliminate them from the production build).
   This is the largest remaining XSS gap.
2. **Drop `https://cdn.tailwindcss.com`** from `script-src` once Tailwind is
   built locally rather than loaded from the dev CDN.
3. **Narrow `connect-src`** from the broad `https:` to an explicit allowlist of
   API origins (Supabase HTTP + `wss:` Realtime, Stripe, Gemini proxy, eBay,
   error beacon, Sentry) once they are all known and stable.

## Changing the policy safely

1. Make the change on a **preview deployment** first, with real auth and
   payments in test mode.
2. Watch `/api/csp-report` log output (`apiLogger.warn 'CSP violation'`) for
   anything legitimate being blocked.
3. Only widen a directive for an origin you positively identify; never restore
   a blanket wildcard to silence reports.

## Related docs

- [MONITORING.md](./MONITORING.md) — health, errors, audits.
- [PRODUCTION_READINESS.md §4.1](../PRODUCTION_READINESS.md#41-input-validation-and-sanitization) — CSP and XSS hardening context.
