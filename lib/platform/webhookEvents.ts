/**
 * Product webhook event contracts + env-gated evaluate (no persistence).
 */
import { z } from 'zod';

export const PRODUCT_WEBHOOK_EVENTS = ['valuation.updated', 'alert.triggered'] as const;
export type ProductWebhookEventType = (typeof PRODUCT_WEBHOOK_EVENTS)[number];

export const WEBHOOK_DISPATCH_DISCLOSURE =
  'Documented webhook event stubs (valuation.updated, alert.triggered). Dispatcher is a no-op unless MSI_WEBHOOK_DISPATCH=1 is set on the host. No partner delivery from this scaffold.';

export const ProductWebhookEventSchema = z.object({
  type: z.enum(PRODUCT_WEBHOOK_EVENTS),
  payload: z.record(z.string(), z.unknown()),
  source: z.string().min(1).default('msi-local'),
});

export type ProductWebhookEvent = z.infer<typeof ProductWebhookEventSchema>;

export interface WebhookDispatchResult {
  accepted: boolean;
  dispatched: boolean;
  reason: string;
  event: ProductWebhookEvent | null;
}

export function isWebhookDispatchEnabled(
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): boolean {
  const raw = env.MSI_WEBHOOK_DISPATCH;
  return raw === '1' || raw === 'true';
}

export function evaluateWebhookDispatch(
  input: unknown,
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): WebhookDispatchResult {
  const parsed = ProductWebhookEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      accepted: false,
      dispatched: false,
      reason: 'Invalid webhook event.',
      event: null,
    };
  }

  if (!isWebhookDispatchEnabled(env)) {
    return {
      accepted: true,
      dispatched: false,
      reason: 'MSI_WEBHOOK_DISPATCH is unset — no-op (documented stub).',
      event: parsed.data,
    };
  }

  return {
    accepted: true,
    dispatched: false,
    reason: 'Dispatch enabled but no partner endpoint is configured — still a no-op.',
    event: parsed.data,
  };
}
