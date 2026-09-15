import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  ADVISORY_STUB_VENUE,
  AUTOPILOT_PAUSE_KEY,
  EXECUTION_ADAPTER_DISCLOSURE,
  executionBlockReasons,
  ensureAdvisoryStubAdapter,
  isAutopilotGloballyPaused,
  setAutopilotGlobalPause,
  submitThroughAdvisoryStub,
  createAdvisoryStubAdapter,
} from '../../lib/trading/executionAdapterStub';
import { ExecutionService } from '../../lib/utils/executionService';

describe('executionAdapterStub', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(AUTOPILOT_PAUSE_KEY);
    ExecutionService.setKillSwitch(false);
  });

  it('blocks on global pause, kill-switch, and collars without filling', async () => {
    expect(EXECUTION_ADAPTER_DISCLOSURE).toMatch(/no live marketplace fills/i);
    expect(isAutopilotGloballyPaused()).toBe(false);
    setAutopilotGlobalPause(true);
    expect(isAutopilotGloballyPaused()).toBe(true);
    const paused = executionBlockReasons({ quantity: 1, price: 50, type: 'buy' });
    expect(paused.some((reason) => /global pause/i.test(reason))).toBe(true);

    setAutopilotGlobalPause(false);
    ExecutionService.setKillSwitch(true);
    expect(executionBlockReasons({ quantity: 1, price: 50, type: 'buy' }).join(' ')).toMatch(/kill-switch/i);

    ExecutionService.setKillSwitch(false);
    const collar = executionBlockReasons({ quantity: 1, price: 500, type: 'buy' }, { maxBudget: 100, maxSpendPerAsset: 80 });
    expect(collar.join(' ')).toMatch(/budget|per-asset/i);

    const failed = await submitThroughAdvisoryStub(
      {
        id: 'i-pause',
        type: 'buy',
        assetId: 'a1',
        assetName: 'Card',
        quantity: 1,
        price: 50,
        createdAt: new Date().toISOString(),
      },
    );
    expect(failed.venue).toBe(ADVISORY_STUB_VENUE);
  });

  it('submits through the advisory stub and never reconciles to a live fill', async () => {
    ensureAdvisoryStubAdapter();
    const order = await submitThroughAdvisoryStub({
      id: 'i-ok',
      type: 'buy',
      assetId: 'a2',
      assetName: 'Card',
      quantity: 1,
      price: 50,
      createdAt: new Date().toISOString(),
    });
    expect(order.state).toBe('submitted');
    expect(order.filledQuantity).toBe(0);
    const reconciled = await ExecutionService.reconcileOpenOrders(ADVISORY_STUB_VENUE);
    expect(reconciled[0]?.state).toBe('submitted');
    const adapter = createAdvisoryStubAdapter(() => '2026-09-15T00:00:00.000Z');
    expect(await adapter.cancel('x')).toBe(true);
    expect(await adapter.status('x')).toBe('submitted');
    const blocked = await submitThroughAdvisoryStub({
      id: 'i-zero',
      type: 'buy',
      assetId: 'a3',
      assetName: 'Card',
      quantity: 0,
      price: 0,
      createdAt: new Date().toISOString(),
    });
    expect(blocked.state).toBe('failed');
    expect(blocked.lastError).toMatch(/positive/i);
  });

  it('reuses the registered stub and applies sell vs buy collar rules', async () => {
    expect(ensureAdvisoryStubAdapter().name).toBe(ADVISORY_STUB_VENUE);
    expect(ensureAdvisoryStubAdapter().name).toBe(ADVISORY_STUB_VENUE);
    const sellBlocked = executionBlockReasons(
      { quantity: 1, price: 500, type: 'sell' },
      { maxBudget: 100, maxSpendPerAsset: 80 },
    );
    expect(sellBlocked.join(' ')).toMatch(/per-asset/i);
    expect(sellBlocked.join(' ')).not.toMatch(/cycle budget/i);
    const ok = await submitThroughAdvisoryStub(
      {
        id: 'i-collar',
        type: 'buy',
        assetId: 'a4',
        assetName: 'Card',
        quantity: 1,
        price: 40,
        createdAt: new Date().toISOString(),
      },
      { maxBudget: 200, maxSpendPerAsset: 80 },
    );
    expect(ok.state).toBe('submitted');
    const defaultNow = createAdvisoryStubAdapter();
    const submitted = await defaultNow.submit({
      id: 'i-now',
      type: 'buy',
      assetId: 'a5',
      assetName: 'Card',
      quantity: 1,
      price: 10,
      createdAt: new Date().toISOString(),
    });
    expect(submitted.submittedAt).toMatch(/T/);
  });
});
