# Supabase Edge Functions (billing & Stripe)

The app invokes Edge Functions from **`lib/utils/billingService.ts`** via `supabase.functions.invoke`.

**Implementations in this repo:** [`supabase/functions/create-checkout-session/`](../supabase/functions/create-checkout-session/index.ts) and [`supabase/functions/create-billing-portal-session/`](../supabase/functions/create-billing-portal-session/index.ts). Deploy with the Supabase CLI — see **[supabase/functions/README.md](../supabase/functions/README.md)**.

This document remains the **contract** for behavior and security.

## `create-checkout-session`

**Input (JSON body):** May include `userId`, `tier`, `successUrl`, `cancelUrl`, `idempotencyKey`.

**Required behavior**

1. **Identity:** Resolve the caller from the **Authorization: Bearer &lt;JWT&gt;** header. Use **`auth.getUser(jwt)`** (or equivalent) and take **`sub`** as the only trusted user id.
2. **Reject mismatch:** If the body contains `userId` (or similar), it **must** equal `sub`. Otherwise return **403** (do not create a session for another user).
3. **Stripe:** Call `stripe.checkout.sessions.create` with the **Idempotency-Key** header set from the client’s `idempotencyKey` when provided (see [PAYMENT_SECURITY.md §c](./PAYMENT_SECURITY.md)).
4. **Metadata:** Set `client_reference_id` or `metadata.user_id` / `metadata.supabase_user_id` to **`sub`** so [api/stripe-webhook.ts](../api/stripe-webhook.ts) can PATCH the correct `profiles` row.

## `create-billing-portal-session`

Same trust model: **user id from JWT only**; forward **Idempotency-Key** when creating portal sessions if your Stripe API version supports it.

## Webhooks

Subscription truth should flow **Stripe → webhook → `profiles`**. Do not rely on the client to PATCH paid tier fields after checkout; the Vercel handler in this repo performs sync when env is configured.

## Local testing

Use Supabase CLI `supabase functions serve` with the same JWT the browser would send; verify 403 when body `userId` ≠ JWT `sub`.
