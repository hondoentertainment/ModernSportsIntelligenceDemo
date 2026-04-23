/**
 * Stripe webhook handler — verifies signature and processes events.
 * Deploy as Vercel serverless. Requires STRIPE_WEBHOOK_SECRET in env.
 *
 * Uses the Web `Request` API and `request.text()` so the body stays raw for
 * `constructEvent`. Legacy `(req, res)` handlers with parsed `req.body` break
 * signature verification for `application/json` payloads.
 *
 * @see docs/PAYMENT_SECURITY.md §(b)
 */

import Stripe from 'stripe';
import { apiLogger } from './lib/logger';
import {
  claimStripeWebhookEvent,
  releaseStripeWebhookEventClaim,
} from './lib/stripeWebhookIdempotency';
import {
  syncProfileFromCheckoutSession,
  syncProfileFromInvoice,
  syncProfileFromSubscription,
  syncProfileOnSubscriptionDeleted,
} from './lib/stripeProfileSync';
import {
  CheckoutSessionSchema,
  SubscriptionSchema,
  InvoiceSchema,
} from './lib/stripeEventSchemas';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request): Promise<Response> {
  if (!webhookSecret) {
    apiLogger.error('STRIPE_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey && (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production')) {
    apiLogger.error('STRIPE_SECRET_KEY not configured in production');
    return Response.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const sig = request.headers.get('stripe-signature') ?? '';
  if (!sig) {
    return Response.json({ error: 'Missing Stripe-Signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!rawBody) {
    return Response.json({ error: 'Missing request body' }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = new Stripe(stripeKey || '', {
    apiVersion: '2026-02-25.clover',
  });
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    apiLogger.warn('Stripe webhook signature verification failed', msg);
    return Response.json({ error: msg }, { status: 400 });
  }

  apiLogger.info('Stripe webhook', { type: event.type, id: event.id });

  const claim = await claimStripeWebhookEvent(event.id);
  if (claim === 'duplicate') {
    apiLogger.info('Stripe webhook duplicate delivery ignored', { id: event.id });
    return Response.json({ received: true, duplicate: true });
  }
  if (claim === 'misconfigured' || claim === 'error') {
    return Response.json({ received: false, error: 'idempotency_unavailable' }, { status: 503 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const parsed = CheckoutSessionSchema.safeParse(event.data.object);
        if (!parsed.success) {
          apiLogger.warn('checkout.session.completed payload failed schema validation', {
            eventId: event.id,
            issues: parsed.error.issues,
          });
          await releaseStripeWebhookEventClaim(event.id);
          return Response.json({ received: false, error: 'invalid_payload' }, { status: 400 });
        }
        apiLogger.info('[Stripe] checkout.session.completed', { sessionId: parsed.data.id });
        await syncProfileFromCheckoutSession(stripe, parsed.data as unknown as Stripe.Checkout.Session);
        break;
      }
      case 'customer.subscription.updated': {
        const parsed = SubscriptionSchema.safeParse(event.data.object);
        if (!parsed.success) {
          apiLogger.warn('customer.subscription.updated payload failed schema validation', {
            eventId: event.id,
            issues: parsed.error.issues,
          });
          await releaseStripeWebhookEventClaim(event.id);
          return Response.json({ received: false, error: 'invalid_payload' }, { status: 400 });
        }
        await syncProfileFromSubscription(parsed.data as unknown as Stripe.Subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const parsed = SubscriptionSchema.safeParse(event.data.object);
        if (!parsed.success) {
          apiLogger.warn('customer.subscription.deleted payload failed schema validation', {
            eventId: event.id,
            issues: parsed.error.issues,
          });
          await releaseStripeWebhookEventClaim(event.id);
          return Response.json({ received: false, error: 'invalid_payload' }, { status: 400 });
        }
        await syncProfileOnSubscriptionDeleted(parsed.data as unknown as Stripe.Subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const parsed = InvoiceSchema.safeParse(event.data.object);
        if (!parsed.success) {
          apiLogger.warn('invoice.payment_succeeded payload failed schema validation', {
            eventId: event.id,
            issues: parsed.error.issues,
          });
          await releaseStripeWebhookEventClaim(event.id);
          return Response.json({ received: false, error: 'invalid_payload' }, { status: 400 });
        }
        await syncProfileFromInvoice(stripe, parsed.data as unknown as Stripe.Invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const parsed = InvoiceSchema.safeParse(event.data.object);
        if (!parsed.success) {
          apiLogger.warn('invoice.payment_failed payload failed schema validation', {
            eventId: event.id,
            issues: parsed.error.issues,
          });
          await releaseStripeWebhookEventClaim(event.id);
          return Response.json({ received: false, error: 'invalid_payload' }, { status: 400 });
        }
        await syncProfileFromInvoice(stripe, parsed.data as unknown as Stripe.Invoice);
        break;
      }
      default:
        apiLogger.info('Unhandled event type', event.type);
        await releaseStripeWebhookEventClaim(event.id);
    }
  } catch (syncErr) {
    apiLogger.error('Stripe profile sync failed', syncErr);
    await releaseStripeWebhookEventClaim(event.id);
    return Response.json({ received: false, error: 'sync_failed' }, { status: 500 });
  }

  return Response.json({ received: true });
}
