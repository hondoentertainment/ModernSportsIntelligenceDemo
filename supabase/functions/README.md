# Supabase Edge Functions (billing)

Implements the contract in **[docs/SUPABASE_EDGE_FUNCTIONS.md](../../docs/SUPABASE_EDGE_FUNCTIONS.md)**:

- **`create-checkout-session`** — JWT-only identity; optional body `userId` must match `sub`; forwards **`idempotencyKey`** to Stripe.
- **`create-billing-portal-session`** — same; requires `profiles.stripe_customer_id`.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed and logged in.
- Project linked: `supabase link --project-ref <ref>`

## Secrets (Dashboard → Edge Functions → Secrets, or CLI)

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret (test or live) |
| `SUPABASE_URL` | Usually injected by Supabase |
| `SUPABASE_ANON_KEY` | Usually injected |

## Deploy

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal-session
```

## Local serve

```bash
supabase functions serve create-checkout-session --no-verify-jwt
# Send Authorization: Bearer <valid_access_token> and JSON body per client (lib/utils/billingService.ts).
```

`verify_jwt` is enabled in **[config.toml](../config.toml)** for both functions when deployed.

## Client

The app invokes these names via `supabase.functions.invoke('create-checkout-session', …)` and `create-billing-portal-session` — names must match exactly.
