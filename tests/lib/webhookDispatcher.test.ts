import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  PRODUCT_WEBHOOK_EVENTS,
  WEBHOOK_DISPATCH_DISCLOSURE,
  WEBHOOK_OUTBOX_KEY,
  dispatchProductWebhook,
  evaluateWebhookDispatch,
  isWebhookDispatchEnabled,
  listWebhookOutbox,
} from '../../lib/platform/webhookDispatcher';

describe('webhookDispatcher', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(WEBHOOK_OUTBOX_KEY);
  });

  it('documents valuation.updated and alert.triggered and no-ops unless env is set', () => {
    expect(PRODUCT_WEBHOOK_EVENTS).toEqual(['valuation.updated', 'alert.triggered']);
    expect(isWebhookDispatchEnabled({})).toBe(false);
    expect(isWebhookDispatchEnabled({ MSI_WEBHOOK_DISPATCH: '1' })).toBe(true);
    const invalid = evaluateWebhookDispatch({ type: 'nope' });
    expect(invalid.accepted).toBe(false);
    const gated = dispatchProductWebhook({ type: 'valuation.updated', payload: { cardId: 'c1' } }, {});
    expect(gated.accepted).toBe(true);
    expect(gated.dispatched).toBe(false);
    expect(gated.reason).toMatch(/unset/i);
    expect(listWebhookOutbox()).toHaveLength(1);
    expect(WEBHOOK_DISPATCH_DISCLOSURE).toMatch(/no-op/i);
  });

  it('still does not deliver when dispatch is enabled without a partner URL', () => {
    const result = evaluateWebhookDispatch(
      { type: 'alert.triggered', payload: { alertId: 'a1' }, source: 'war-room' },
      { MSI_WEBHOOK_DISPATCH: 'true' },
    );
    expect(result.accepted).toBe(true);
    expect(result.dispatched).toBe(false);
    expect(result.reason).toMatch(/no partner endpoint/i);
    store.set(WEBHOOK_OUTBOX_KEY, { nope: true } as never);
    expect(listWebhookOutbox()).toEqual([]);
    const prior = process.env.MSI_WEBHOOK_DISPATCH;
    process.env.MSI_WEBHOOK_DISPATCH = '1';
    expect(isWebhookDispatchEnabled()).toBe(true);
    if (prior === undefined) delete process.env.MSI_WEBHOOK_DISPATCH;
    else process.env.MSI_WEBHOOK_DISPATCH = prior;
  });

  it('evaluates against process.env when no env bag is passed', () => {
    const prior = process.env.MSI_WEBHOOK_DISPATCH;
    delete process.env.MSI_WEBHOOK_DISPATCH;
    expect(isWebhookDispatchEnabled()).toBe(false);
    const result = evaluateWebhookDispatch({ type: 'valuation.updated', payload: {} });
    expect(result.accepted).toBe(true);
    expect(result.dispatched).toBe(false);
    const dispatched = dispatchProductWebhook({ type: 'alert.triggered', payload: { id: 'a' } });
    expect(dispatched.event?.type).toBe('alert.triggered');
    if (prior === undefined) delete process.env.MSI_WEBHOOK_DISPATCH;
    else process.env.MSI_WEBHOOK_DISPATCH = prior;
  });
});
