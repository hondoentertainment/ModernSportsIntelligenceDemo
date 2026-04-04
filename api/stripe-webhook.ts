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
import { markStripeEventProcessed, wasStripeEventProcessed } from './lib/stripeWebhookIdempotency';
import {
  syncProfileFromCheckoutSession,
  syncProfileFromInvoice,
  syncProfileFromSubscription,
  syncProfileOnSubscriptionDeleted,
} from './lib/stripeProfileSync';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request): Promise<Response> {
  if (!webhookSecret) {
    apiLogger.error('STRIPE_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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

  if (await wasStripeEventProcessed(event.id)) {
    apiLogger.info('Stripe webhook duplicate delivery ignored', { id: event.id });
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await syncProfileFromCheckoutSession(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await syncProfileFromSubscription(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await syncProfileOnSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await syncProfileFromInvoice(stripe, event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await syncProfileFromInvoice(stripe, event.data.object as Stripe.Invoice);
        break;
      default:
        apiLogger.info('Unhandled event type', event.type);
    }
  } catch (syncErr) {
    apiLogger.error('Stripe profile sync failed', syncErr);
    return Response.json({ received: false, error: 'sync_failed' }, { status: 500 });
  }

  try {
    await markStripeEventProcessed(event.id);
  } catch (e) {
    apiLogger.error('Failed to record Stripe event id (will retry on Stripe redelivery)', e);
    return Response.json({ received: false, error: 'persist_failed' }, { status: 500 });
  }

  return Response.json({ received: true });
}
