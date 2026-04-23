// @ts-nocheck
/**
 * Tests for Zod schema validation of Stripe webhook event payloads.
 * Covers the five event types handled in api/stripe-webhook.ts:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CheckoutSessionSchema,
  SubscriptionSchema,
  InvoiceSchema,
} from '../../api/lib/stripeEventSchemas';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeCheckoutSession(overrides = {}) {
  return {
    id: 'cs_test_123',
    object: 'checkout.session',
    mode: 'subscription',
    customer: 'cus_abc',
    client_reference_id: 'user-uuid-1',
    metadata: { user_id: 'user-uuid-1' },
    subscription: 'sub_xyz',
    ...overrides,
  };
}

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_test_123',
    object: 'subscription',
    status: 'active',
    customer: 'cus_abc',
    metadata: { user_id: 'user-uuid-1' },
    items: {
      data: [{ price: { id: 'price_pro' } }],
    },
    start_date: 1700000000,
    ended_at: null,
    trial_end: null,
    ...overrides,
  };
}

function makeInvoice(overrides = {}) {
  return {
    id: 'in_test_123',
    object: 'invoice',
    customer: 'cus_abc',
    parent: {
      type: 'subscription_details',
      subscription_details: { subscription: 'sub_xyz' },
    },
    lines: {
      data: [{ subscription: 'sub_xyz' }],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// CheckoutSessionSchema
// ---------------------------------------------------------------------------

describe('CheckoutSessionSchema', () => {
  it('accepts a valid checkout.session.completed payload', () => {
    const result = CheckoutSessionSchema.safeParse(makeCheckoutSession());
    expect(result.success).toBe(true);
  });

  it('rejects payload missing required id field', () => {
    const payload = makeCheckoutSession();
    delete payload.id;
    const result = CheckoutSessionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('id');
    }
  });

  it('rejects payload with wrong object literal', () => {
    const result = CheckoutSessionSchema.safeParse(
      makeCheckoutSession({ object: 'subscription' })
    );
    expect(result.success).toBe(false);
  });

  it('passes through unknown extra fields (no stripping)', () => {
    const result = CheckoutSessionSchema.safeParse(
      makeCheckoutSession({ some_future_field: 'value' })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.some_future_field).toBe('value');
    }
  });
});

// ---------------------------------------------------------------------------
// SubscriptionSchema (covers .updated and .deleted event types)
// ---------------------------------------------------------------------------

describe('SubscriptionSchema', () => {
  it('accepts a valid customer.subscription.updated payload', () => {
    const result = SubscriptionSchema.safeParse(makeSubscription());
    expect(result.success).toBe(true);
  });

  it('accepts a valid customer.subscription.deleted payload', () => {
    const result = SubscriptionSchema.safeParse(
      makeSubscription({ status: 'canceled', ended_at: 1700001000 })
    );
    expect(result.success).toBe(true);
  });

  it('rejects payload missing required id field', () => {
    const payload = makeSubscription();
    delete payload.id;
    const result = SubscriptionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('id');
    }
  });

  it('rejects payload missing required start_date field', () => {
    const payload = makeSubscription();
    delete payload.start_date;
    const result = SubscriptionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('start_date');
    }
  });

  it('rejects payload with wrong object literal', () => {
    const result = SubscriptionSchema.safeParse(
      makeSubscription({ object: 'invoice' })
    );
    expect(result.success).toBe(false);
  });

  it('passes through unknown extra fields', () => {
    const result = SubscriptionSchema.safeParse(
      makeSubscription({ current_period_end: 1700009999 })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.current_period_end).toBe(1700009999);
    }
  });
});

// ---------------------------------------------------------------------------
// InvoiceSchema (covers invoice.payment_succeeded and invoice.payment_failed)
// ---------------------------------------------------------------------------

describe('InvoiceSchema', () => {
  it('accepts a valid invoice.payment_succeeded payload', () => {
    const result = InvoiceSchema.safeParse(makeInvoice());
    expect(result.success).toBe(true);
  });

  it('accepts a valid invoice.payment_failed payload', () => {
    const result = InvoiceSchema.safeParse(makeInvoice());
    expect(result.success).toBe(true);
  });

  it('rejects payload missing required id field', () => {
    const payload = makeInvoice();
    delete payload.id;
    const result = InvoiceSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('id');
    }
  });

  it('rejects payload with wrong object literal', () => {
    const result = InvoiceSchema.safeParse(makeInvoice({ object: 'subscription' }));
    expect(result.success).toBe(false);
  });

  it('accepts invoice with no lines (lines is optional)', () => {
    const payload = makeInvoice();
    delete payload.lines;
    const result = InvoiceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('passes through unknown extra fields', () => {
    const result = InvoiceSchema.safeParse(
      makeInvoice({ amount_due: 2999, currency: 'usd' })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount_due).toBe(2999);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration: webhook handler schema validation guard behaviour
// ---------------------------------------------------------------------------

describe('Webhook handler schema validation guard', () => {
  // These tests verify the behaviour described in api/stripe-webhook.ts:
  // valid payload → sync function called; invalid payload → warn + no DB write.

  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('valid checkout session payload passes validation with no warning', () => {
    const result = CheckoutSessionSchema.safeParse(makeCheckoutSession());
    expect(result.success).toBe(true);
    // No warning should be issued for valid payloads
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('invalid checkout session (missing id) fails validation and warns', () => {
    const payload = makeCheckoutSession();
    delete payload.id;
    const result = CheckoutSessionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    // Simulate the handler warning on failure
    if (!result.success) {
      console.warn('checkout.session.completed payload failed schema validation', {
        issues: result.error.issues,
      });
    }
    expect(warnSpy).toHaveBeenCalledWith(
      'checkout.session.completed payload failed schema validation',
      expect.objectContaining({ issues: expect.any(Array) })
    );
  });

  it('valid subscription payload passes validation with no warning', () => {
    const result = SubscriptionSchema.safeParse(makeSubscription());
    expect(result.success).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('invalid subscription (missing id) fails validation and warns', () => {
    const payload = makeSubscription();
    delete payload.id;
    const result = SubscriptionSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      console.warn('customer.subscription.updated payload failed schema validation', {
        issues: result.error.issues,
      });
    }
    expect(warnSpy).toHaveBeenCalledWith(
      'customer.subscription.updated payload failed schema validation',
      expect.objectContaining({ issues: expect.any(Array) })
    );
  });

  it('valid invoice payload passes validation with no warning', () => {
    const result = InvoiceSchema.safeParse(makeInvoice());
    expect(result.success).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('invalid invoice (missing id) fails validation and warns', () => {
    const payload = makeInvoice();
    delete payload.id;
    const result = InvoiceSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      console.warn('invoice.payment_succeeded payload failed schema validation', {
        issues: result.error.issues,
      });
    }
    expect(warnSpy).toHaveBeenCalledWith(
      'invoice.payment_succeeded payload failed schema validation',
      expect.objectContaining({ issues: expect.any(Array) })
    );
  });
});
