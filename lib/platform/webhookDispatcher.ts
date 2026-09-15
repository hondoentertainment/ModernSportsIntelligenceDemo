/**
 * Client outbox wrapper around the env-gated webhook evaluator.
 */
import { store } from '../dal/syncStore';
import {
  evaluateWebhookDispatch,
  type ProductWebhookEvent,
  type WebhookDispatchResult,
} from './webhookEvents';

export {
  PRODUCT_WEBHOOK_EVENTS,
  ProductWebhookEventSchema,
  WEBHOOK_DISPATCH_DISCLOSURE,
  evaluateWebhookDispatch,
  isWebhookDispatchEnabled,
  type ProductWebhookEvent,
  type ProductWebhookEventType,
  type WebhookDispatchResult,
} from './webhookEvents';

export const WEBHOOK_OUTBOX_KEY = 'msi_webhook_outbox_v1';

export function listWebhookOutbox(): ProductWebhookEvent[] {
  const raw = store.get<ProductWebhookEvent[]>(WEBHOOK_OUTBOX_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function dispatchProductWebhook(
  input: unknown,
  env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {},
): WebhookDispatchResult {
  const result = evaluateWebhookDispatch(input, env);
  if (result.event) {
    store.set(WEBHOOK_OUTBOX_KEY, [result.event, ...listWebhookOutbox()].slice(0, 100));
  }
  return result;
}
