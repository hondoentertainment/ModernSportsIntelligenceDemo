import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTOPILOT_REPLAY_DISCLOSURE,
  AUTOPILOT_REPLAY_KEY,
  listAutopilotReplay,
  listAutopilotReplayForDay,
  recordAutopilotReplay,
  replayDayKey,
} from '../../lib/trading/autoPilotReplay';
import { store } from '../../lib/dal/syncStore';
import type { AutonomousAction, RiskCollar } from '../../types';

const collar: RiskCollar = {
  maxBudget: 1000,
  maxSpendPerAsset: 200,
  riskTolerance: 'Balanced',
  autoSellThreshold: 15,
  maxDailyBudget: 800,
  maxDrawdownPct: 12,
  requireApprovalAbove: 500,
};

function action(overrides: Partial<AutonomousAction> = {}): AutonomousAction {
  return {
    id: 'a1',
    type: 'SELL',
    assetName: '2011 Mike Trout',
    amount: 4000,
    rationale: 'Take profit',
    timestamp: '2026-09-08T12:00:00.000Z',
    status: 'pending',
    cycleId: 'cycle-1',
    confidence: 0.8,
    policyDecision: 'needs_approval',
    policyReason: 'Above approval collar',
    ...overrides,
  };
}

describe('autoPilotReplay', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
  });

  it('records a day-bucketed advisory snapshot and ignores junk store rows', () => {
    store.set(AUTOPILOT_REPLAY_KEY, [{ nope: true }, 'bad']);
    const now = new Date('2026-09-08T15:00:00.000Z');
    const entry = recordAutopilotReplay({
      source: 'preview',
      cycleId: 'cycle-1',
      considered: [action(), action({ id: 'a2', type: 'BUY', assetName: 'Scout', amount: 150, policyDecision: 'approved' })],
      gated: [action(), action({ id: 'a2', type: 'BUY', assetName: 'Scout', amount: 150, policyDecision: 'blocked', policyReason: 'Budget' })],
      collar,
      impact: {
        startingValue: 10000,
        projectedPostCycleValue: 9800,
        navDelta: -200,
        estimatedTotalTax: 40,
      },
      now,
    });
    expect(entry.dayKey).toBe('2026-09-08');
    expect(entry.dayKey).toBe(replayDayKey(now));
    expect(entry.considered).toHaveLength(2);
    expect(entry.approvals.pending).toBe(1);
    expect(entry.approvals.blocked).toBe(1);
    expect(entry.navPreview.startingValue).toBe(10000);
    expect(entry.disclosure).toMatch(/not live marketplace/i);
    expect(AUTOPILOT_REPLAY_DISCLOSURE).toMatch(/day-bucketed/i);
    expect(listAutopilotReplayForDay('2026-09-08')).toHaveLength(1);
    expect(listAutopilotReplayForDay('2026-09-07')).toEqual([]);
  });

  it('caps history and hydrates a missing cycle id', () => {
    const now = new Date('2026-09-08T15:00:00.000Z');
    for (let i = 0; i < 42; i += 1) {
      recordAutopilotReplay({
        source: i % 2 === 0 ? 'preview' : 'cycle',
        considered: [],
        gated: [action({ id: `n${i}`, cycleId: undefined })],
        collar,
        impact: { startingValue: 1, projectedPostCycleValue: 1, navDelta: 0, estimatedTotalTax: 0 },
        now,
      });
    }
    const rows = listAutopilotReplay();
    expect(rows.length).toBe(40);
    expect(rows[0].cycleId).toMatch(/replay-|cycle/);
  });
});
