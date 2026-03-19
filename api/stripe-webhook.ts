/**
 * Stripe webhook handler — verifies signature before processing.
 * Deploy as Vercel serverless or Supabase Edge Function.
 * Set STRIPE_WEBHOOK_SECRET in environment. See docs/PAYMENT_SECURITY.md §(b).
 */
import Stripe from 'stripe';
import { apiLogger } from './lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

type VercelRequest = { method?: string; body?: string | Buffer; headers?: Record<string, string> };
type VercelResponse = {
  status: (code: number) => { json: (o: object) => void; end: () => void };
  setHeader: (k: string, v: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!webhookSecret) {
    apiLogger.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  const sig = req.headers?.['stripe-signature'] ?? req.headers?.['Stripe-Signature'];
  const rawBody = typeof req.body === 'string' ? req.body : (req.body && Buffer.isBuffer(req.body) ? req.body.toString() : '');
  if (!sig || !rawBody) {
    res.status(400).json({ error: 'Missing signature or body' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    apiLogger.warn('[stripe-webhook] Signature verification failed', msg);
    res.status(400).json({ error: msg });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        apiLogger.info('[stripe-webhook]', event.type, event.id);
        break;
      default:
        apiLogger.info('[stripe-webhook] Unhandled event', event.type);
    }
  } catch (err) {
    apiLogger.error('[stripe-webhook] Processing error', err);
    res.status(500).json({ error: 'Processing failed' });
    return;
  }

  res.status(200).json({ received: true });
}
