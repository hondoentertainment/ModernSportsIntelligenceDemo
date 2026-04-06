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

- **Status:** [`api/stripe-webhook.ts`](../api/stripe-webhook.ts) verifies signatures using the Web `Request` API and `await request.text()` so the payload stays **raw** (Vercel’s parsed `request.body` helper is not used for verification).
- **Requirement:** Any handler that receives Stripe webhooks (this route or Supabase Edge Functions) **must** verify the signature before processing:
  - Read `Stripe-Signature` from the request headers.
  - Use `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)` (raw body required; do not verify against a pre-parsed JSON object).
  - Reject the request if verification fails. Never process unverified webhook payloads.
- **Idempotency:** Deduplicate on Stripe `event.id` before applying side effects. The handler uses **insert-first** `claimStripeWebhookEvent` (unique `stripe_event_id`) to avoid TOCTOU; on handler failure it **releases** the row so Stripe retries succeed. **Unhandled** `event.type` branches **release** the claim so future handlers are not blocked by a stuck row.
- **Profile sync failures:** In production, [`api/lib/stripeProfileSync.ts`](../api/lib/stripeProfileSync.ts) **throws** on missing Supabase credentials, failed `profiles` PATCH, unknown price IDs, or missing user/customer identifiers when an update was required — the webhook returns **500**, releases the claim, and Stripe retries.
- **Env (Vercel/server):** **`SUPABASE_URL`**, **`SUPABASE_SERVICE_ROLE_KEY`**, **`STRIPE_WEBHOOK_SECRET`**, **`STRIPE_SECRET_KEY`** (required in production for subscription retrieval). Optional **`STRIPE_WEBHOOK_FAIL_CLOSED=1`** aligns non-prod with production idempotency behavior (see [`api/lib/stripeWebhookIdempotency.ts`](../api/lib/stripeWebhookIdempotency.ts)).

### (c1) Supabase Edge Functions (checkout / portal)

**Contract:** See **[SUPABASE_EDGE_FUNCTIONS.md](./SUPABASE_EDGE_FUNCTIONS.md)** — functions invoked from the client must bind **`userId` to the JWT `sub`** and forward **`Idempotency-Key`** to Stripe.

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

| Location                | Description                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `lib/billingService.ts` | Loads Stripe.js, creates checkout/portal sessions via Edge Functions, redirects to Stripe Hosted Checkout/Portal.              |
| `pages/Billing.tsx`     | UI for plan selection; calls `createCheckoutSession` and `redirectToCheckout` or `createBillingPortalSession`. No card inputs. |
| `lib/envValidation.ts`  | Validates presence of Stripe-related `VITE_*` env vars.                                                                        |

Subscription lifecycle (updates, cancellations, failed payments) is expected to be handled by the backend (e.g. Stripe webhooks → Edge Function or API route that updates `profiles`). Those handlers must verify webhook signatures as in (b).

**Webhook → `profiles` (this repo):** [`api/stripe-webhook.ts`](../api/stripe-webhook.ts) calls [`api/lib/stripeProfileSync.ts`](../api/lib/stripeProfileSync.ts) when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. It maps the subscription’s Stripe **price id** to `subscription_tier` using **`STRIPE_BASIC_PRICE_ID`**, **`STRIPE_PRO_PRICE_ID`**, and **`STRIPE_ALPHA_PRICE_ID`** (or the same values under `VITE_STRIPE_*` if duplicated on the server). **Checkout sessions** should set **`client_reference_id`** to the Supabase user UUID **or** `metadata.user_id` / `metadata.supabase_user_id` so the first purchase can target the correct row; otherwise the handler falls back to **`stripe_customer_id`** on `profiles` (must already match the Stripe customer).
