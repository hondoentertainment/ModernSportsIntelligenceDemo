/**
 * Stripe webhook handler — verifies signature and processes events.
 * Deploy as Vercel serverless. Requires STRIPE_WEBHOOK_SECRET in env.
 * Configure Vercel for raw body: vercel.json "api": {"stripe-webhook": {"bodyParser": false}}
 *
 * @see docs/PAYMENT_SECURITY.md §(b)
 */

import Stripe from 'stripe';
import { apiLogger } from './lib/logger';

type ApiResponse = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => unknown };
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(
  req: { method?: string; body?: string | Buffer | unknown; headers?: Record<string, string | string[] | undefined> },
  res: ApiResponse
) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    apiLogger.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig =
    typeof req.headers?.['stripe-signature'] === 'string'
      ? req.headers['stripe-signature']
      : Array.isArray(req.headers?.['stripe-signature'])
        ? req.headers['stripe-signature'][0]
        : '';

  if (!sig) {
    return res.status(400).json({ error: 'Missing Stripe-Signature' });
  }

  const rawBody =
    typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
  if (!rawBody) {
    return res.status(400).json({ error: 'Missing request body; configure bodyParser: false' });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-02-25.clover',
    });
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    apiLogger.warn('Stripe webhook signature verification failed', msg);
    return res.status(400).json({ error: msg });
  }

  apiLogger.info('Stripe webhook', { type: event.type, id: event.id });

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      // Backend should update profiles table via Supabase. Implement per event.
      break;
    default:
      apiLogger.info('Unhandled event type', event.type);
  }

  return res.status(200).json({ received: true });
}
