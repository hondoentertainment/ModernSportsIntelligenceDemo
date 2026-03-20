# Content Security Policy (CSP) rollout

## Current state

[Vercel `headers`](../vercel.json) send **`Content-Security-Policy-Report-Only`** so browsers log violations without blocking. This is appropriate while the SPA still relies on `'unsafe-inline'` for scripts/styles (typical for Vite + Tailwind during transition).

## When to enforce blocking CSP

Move to a **blocking** `Content-Security-Policy` header only after:

1. **Violations are near-zero** in report-only mode (check browser devtools or a reporting endpoint `report-uri` / `report-to`).
2. **Inline script reliance is reduced** — e.g. nonces or hashes for any required inline scripts, or none in production build.
3. **`connect-src`** lists every API origin (Supabase, Stripe, Gemini proxy, eBay, error beacon, Sentry, etc.).
4. **Staging verification** on a preview deployment with real auth and payments test mode.

## How to flip in `vercel.json`

1. Copy the current `Content-Security-Policy-Report-Only` value.
2. Add a header key **`Content-Security-Policy`** with the same policy string (adjust `script-src` / `style-src` as you remove `'unsafe-inline'`).
3. Keep **Report-Only** temporarily in parallel to compare violation reports, then remove Report-Only once stable.
4. Do **not** commit a blocking CSP that has not been validated against production asset URLs (fonts, CDNs, analytics).

## Related docs

- [MONITORING.md](./MONITORING.md) — health, errors, audits.
- [PRODUCTION_READINESS.md §4.1](../PRODUCTION_READINESS.md#41-input-validation-and-sanitization) — CSP and XSS hardening context.
