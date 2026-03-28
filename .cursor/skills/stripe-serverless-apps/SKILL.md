---
name: stripe-serverless-apps
description: >-
  Implements and reviews Stripe in Vite/React plus Vercel serverless handlers:
  Checkout, webhooks, raw body, idempotency, and secrets. Use when adding
  payments, billing, webhooks, or when the user mentions Stripe, checkout, or
  subscription flows in this project.
---

# Stripe (web app + serverless)

## Secrets

- **Publishable key**: client-safe (`@stripe/stripe-js`, React components).
- **Secret key** (`STRIPE_SECRET_KEY`): **server only** — Vercel env, never `VITE_`.
- **Webhook signing secret**: server only; used to verify `Stripe-Signature`.

## Webhooks (this repo)

- Handler: `api/stripe-webhook.ts` verifies signatures with the **raw** request body.
- **Vercel**: ensure `bodyParser: false` for the webhook route (see comment in that file and `vercel.json` if configured). Parsing JSON before verification breaks signature validation.

## Implementation patterns

- **Verify** every webhook with `stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)`.
- **Idempotency**: use Stripe idempotency keys for create operations; for webhooks, guard duplicate `event.id` if storing processed events.
- **Return quickly**: acknowledge receipt; heavy work async or queue if needed.
- **Logging**: log `event.type` and `event.id`, not full card numbers or PII.

## Client + server split

- React (`@stripe/react-stripe-js`): Elements, PaymentElement, confirm; no secret keys.
- API routes: PaymentIntents, Checkout Sessions, Customer Portal, webhooks.

## Checklist (agent)

- [ ] No secret keys in client or bundled env
- [ ] Webhook uses raw body + signature verification
- [ ] Error responses do not leak internal Stripe errors to clients in production
