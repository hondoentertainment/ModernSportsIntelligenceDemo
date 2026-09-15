/**
 * Advisory execution adapter + Auto-Pilot kill-switch / global pause.
 * Never performs live marketplace fills. Collars and replay stay local.
 */
import { store } from '../dal/syncStore';
import {
  ExecutionService,
  type ExecutionAdapter,
  type ExecutionOrder,
  type OrderIntent,
} from '../utils/executionService';
import type { RiskCollar } from '../../types';

export const ADVISORY_STUB_VENUE = 'advisory-stub';
export const AUTOPILOT_PAUSE_KEY = 'msi_autopilot_global_pause_v1';
export const EXECUTION_ADAPTER_DISCLOSURE =
  'Advisory execution stub only — collars, kill-switch, and replay stay local. No live marketplace fills.';

export function isAutopilotGloballyPaused(): boolean {
  return store.get<boolean>(AUTOPILOT_PAUSE_KEY, false) === true;
}

export function setAutopilotGlobalPause(paused: boolean): boolean {
  store.set(AUTOPILOT_PAUSE_KEY, paused);
  return isAutopilotGloballyPaused();
}

export function executionBlockReasons(
  intent: Pick<OrderIntent, 'quantity' | 'price' | 'type'>,
  collar?: Pick<RiskCollar, 'maxBudget' | 'maxSpendPerAsset'>,
): string[] {
  const reasons: string[] = [];
  if (isAutopilotGloballyPaused()) reasons.push('Auto-Pilot global pause is on.');
  if (ExecutionService.getKillSwitch()) reasons.push('Global execution kill-switch is active.');
  if (intent.quantity <= 0) reasons.push('Quantity must be positive.');
  if (intent.price <= 0) reasons.push('Price must be positive.');
  if (collar && intent.type === 'buy' && intent.price * intent.quantity > collar.maxBudget) {
    reasons.push('Intent exceeds Auto-Pilot max cycle budget.');
  }
  if (collar && intent.price > collar.maxSpendPerAsset) {
    reasons.push('Intent exceeds Auto-Pilot per-asset cap.');
  }
  return reasons;
}

export function createAdvisoryStubAdapter(now: () => string = () => new Date().toISOString()): ExecutionAdapter {
  return {
    name: ADVISORY_STUB_VENUE,
    submit: async (intent: OrderIntent): Promise<ExecutionOrder> => ({
      id: `adv-${intent.id}`,
      intentId: intent.id,
      venue: ADVISORY_STUB_VENUE,
      state: 'submitted',
      submittedAt: now(),
      filledQuantity: 0,
    }),
    cancel: async () => true,
    status: async () => 'submitted',
  };
}

let registered = false;

export function ensureAdvisoryStubAdapter(): ExecutionAdapter {
  const adapter = createAdvisoryStubAdapter();
  if (!registered) {
    ExecutionService.registerAdapter(adapter);
    registered = true;
  }
  return adapter;
}

export async function submitThroughAdvisoryStub(
  intent: OrderIntent,
  collar?: Pick<RiskCollar, 'maxBudget' | 'maxSpendPerAsset'>,
): Promise<ExecutionOrder> {
  ensureAdvisoryStubAdapter();
  const blocked = executionBlockReasons(intent, collar);
  if (blocked.length > 0) {
    return {
      id: `adv-${intent.id}`,
      intentId: intent.id,
      venue: ADVISORY_STUB_VENUE,
      state: 'failed',
      submittedAt: new Date().toISOString(),
      filledQuantity: 0,
      lastError: blocked.join(' '),
    };
  }
  const budget = collar?.maxBudget ?? intent.price * intent.quantity * 2;
  return ExecutionService.submitIntent(intent, ADVISORY_STUB_VENUE, budget);
}
