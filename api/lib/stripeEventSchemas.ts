/**
 * Zod schemas for Stripe webhook event `data.object` payloads.
 *
 * These schemas validate the minimum set of fields the webhook handler
 * actually reads before it calls any sync function. Unknown / extra fields
 * are stripped via `.passthrough()` so we never reject a payload just
 * because Stripe added a new field.
 *
 * @see api/stripe-webhook.ts
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Stripe customer field — can be a bare id string or an expanded object. */
const customerField = z.union([z.string(), z.object({ id: z.string() }).passthrough()]).nullable().optional();

/** Stripe metadata map (always a plain string→string record or null). */
const metadataField = z.record(z.string()).nullable().optional();

// ---------------------------------------------------------------------------
// checkout.session.completed
// ---------------------------------------------------------------------------

export const CheckoutSessionSchema = z
  .object({
    id: z.string(),
    object: z.literal('checkout.session'),
    mode: z.string(),
    customer: customerField,
    client_reference_id: z.string().nullable().optional(),
    metadata: metadataField,
    subscription: z
      .union([z.string(), z.object({ id: z.string() }).passthrough()])
      .nullable()
      .optional(),
  })
  .passthrough();


// ---------------------------------------------------------------------------
// customer.subscription.updated / customer.subscription.deleted
// ---------------------------------------------------------------------------

const SubscriptionItemSchema = z
  .object({
    price: z
      .object({
        id: z.string(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const SubscriptionSchema = z
  .object({
    id: z.string(),
    object: z.literal('subscription'),
    status: z.string(),
    customer: customerField,
    metadata: metadataField,
    items: z
      .object({
        data: z.array(SubscriptionItemSchema),
      })
      .passthrough(),
    start_date: z.number(),
    ended_at: z.number().nullable().optional(),
    trial_end: z.number().nullable().optional(),
  })
  .passthrough();


// ---------------------------------------------------------------------------
// invoice.payment_succeeded / invoice.payment_failed
// ---------------------------------------------------------------------------

const InvoiceLineItemSchema = z
  .object({
    subscription: z
      .union([z.string(), z.object({ id: z.string() }).passthrough()])
      .nullable()
      .optional(),
  })
  .passthrough();

const InvoiceParentSchema = z
  .object({
    type: z.string(),
    subscription_details: z
      .object({
        subscription: z
          .union([z.string(), z.object({ id: z.string() }).passthrough()])
          .nullable()
          .optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough()
  .nullable()
  .optional();

export const InvoiceSchema = z
  .object({
    id: z.string(),
    object: z.literal('invoice'),
    customer: customerField,
    parent: InvoiceParentSchema,
    lines: z
      .object({
        data: z.array(InvoiceLineItemSchema),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

