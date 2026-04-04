# Content Security Policy (CSP) rollout

## Current state

[Vercel `headers`](../vercel.json) send a **blocking** **`Content-Security-Policy`** (same directive set that previously shipped as Report-Only). Monitor real traffic for violations; if a third-party origin is blocked, extend `connect-src` / `script-src` / `frame-src` as needed, or temporarily restore Report-Only while fixing.

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

## When to enforce blocking CSP

Move to a **blocking** `Content-Security-Policy` header only after:

1. **Violations are near-zero** in report-only mode (check browser devtools or a reporting endpoint `report-uri` / `report-to`).
2. **Inline script reliance is reduced** — e.g. nonces or hashes for any required inline scripts, or none in production build.
3. **`connect-src`** lists every API origin (Supabase HTTP + **WebSocket `wss:`** for Realtime, Stripe, Gemini proxy, eBay, error beacon, Sentry, etc.). Report-Only policy in `vercel.json` includes `wss:` alongside `https:` so violations surface early.
4. **Staging verification** on a preview deployment with real auth and payments test mode.

## How to flip in `vercel.json`

1. Copy the current `Content-Security-Policy-Report-Only` value.
2. Add a header key **`Content-Security-Policy`** with the same policy string (adjust `script-src` / `style-src` as you remove `'unsafe-inline'`).
3. Keep **Report-Only** temporarily in parallel to compare violation reports, then remove Report-Only once stable.
4. Do **not** commit a blocking CSP that has not been validated against production asset URLs (fonts, CDNs, analytics).

## Related docs

- [MONITORING.md](./MONITORING.md) — health, errors, audits.
- [PRODUCTION_READINESS.md §4.1](../PRODUCTION_READINESS.md#41-input-validation-and-sanitization) — CSP and XSS hardening context.
