# Payment Security (Stripe / Billing)

Phase 3 checklist for production-safe Stripe usage in MSI. See also PRODUCTION_READINESS.md §4.2.

---

## Checklist

### (a) No raw card data on client

- **Status:** Compliant. The app never collects or sends raw card numbers, CVC, or expiry.
- **Implementation:** Checkout uses **Stripe Hosted Checkout** and **Stripe Customer Portal**. The client only:
  - Calls `createCheckoutSession` (Supabase Edge Function) to get a session ID, then `stripe.redirectToCheckout({ sessionId })`.
  - Calls `createBillingPortalSession` for manage/cancel — redirects to Stripe-hosted pages.
- **Rule:** Do not add card input fields (e.g. card number, CVC) on the client. Use Stripe Elements or Stripe.js tokenization only if you ever need on-site card capture; otherwise keep redirect-based flows.

### (b) Webhook signature verification required

- **Status:** No Stripe webhook route exists in this repo. Session creation is via Supabase Edge Functions (`create-checkout-session`, `create-billing-portal-session`).
- **Requirement:** Any handler that receives Stripe webhooks (e.g. in Supabase Edge Functions, or in `api/*` such as `api/stripe-webhook.ts`) **must** verify the signature before processing:
  - Read `Stripe-Signature` from the request headers.
  - Use `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)` (raw body required; do not parse JSON before verification).
  - Reject the request if verification fails. Never process unverified webhook payloads.

### (c) Idempotency keys for payment operations

- **Status:** Client sends a stable idempotency key with each checkout and portal request.
- **Client:** `lib/billingService.ts` generates and sends `idempotencyKey` in the request body for `create-checkout-session` and `create-billing-portal-session` (1-minute bucket: `checkout-{userId}-{tier}-{bucket}` / `portal-{userId}-{bucket}`). Callers may pass a custom key as the optional fifth (checkout) or third (portal) argument.
- **Backend:** Edge Functions that receive these requests **must** forward the `idempotencyKey` to Stripe as the `Idempotency-Key` header when creating Checkout Sessions or Subscriptions so retries do not create duplicate charges.

### (d) Stripe keys via environment variables

- **Status:** Compliant. No Stripe keys are hardcoded.
- **Client:** `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_STRIPE_BASIC_PRICE_ID`, `VITE_STRIPE_PRO_PRICE_ID`, `VITE_STRIPE_ALPHA_PRICE_ID` are read from `import.meta.env` (see `.env.example`).
- **Backend:** Use `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in server-side env only; never expose them to the client or commit them.

---

## Where Stripe is used (reference)

| Location | Description |
|----------|-------------|
| `lib/billingService.ts` | Loads Stripe.js, creates checkout/portal sessions via Edge Functions, redirects to Stripe Hosted Checkout/Portal. |
| `pages/Billing.tsx` | UI for plan selection; calls `createCheckoutSession` and `redirectToCheckout` or `createBillingPortalSession`. No card inputs. |
| `lib/envValidation.ts` | Validates presence of Stripe-related `VITE_*` env vars. |

Subscription lifecycle (updates, cancellations, failed payments) is expected to be handled by the backend (e.g. Stripe webhooks → Edge Function or API route that updates `profiles`). Those handlers must verify webhook signatures as in (b).
