import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AutoPilotReplayLog from '../../components/AutoPilotReplayLog';
import { AUTOPILOT_REPLAY_DISCLOSURE, type AutopilotReplayEntry } from '../../lib/trading/autoPilotReplay';

const entry: AutopilotReplayEntry = {
  id: 'r1',
  dayKey: '2026-09-08',
  cycleId: 'c1',
  timestamp: '2026-09-08T15:00:00.000Z',
  source: 'preview',
  considered: [{ type: 'SELL', assetName: '2011 Mike Trout', amount: 4000, confidence: 0.8 }],
  gated: [{ type: 'SELL', assetName: '2011 Mike Trout', policyDecision: 'needs_approval', policyReason: 'Collar' }],
  collar: { maxBudget: 1000, maxDailyBudget: 800, maxSpendPerAsset: 200, maxDrawdownPct: 12, requireApprovalAbove: 500 },
  approvals: { pending: 1, approved: 0, blocked: 0 },
  navPreview: { startingValue: 10000, projectedPostCycleValue: 9800, navDelta: -200, estimatedTotalTax: 40 },
  disclosure: AUTOPILOT_REPLAY_DISCLOSURE,
};

describe('AutoPilotReplayLog', () => {
  it('shows empty-state copy when no cycles exist', () => {
    render(<AutoPilotReplayLog entries={[]} />);
    expect(screen.getByRole('region', { name: /auto-pilot decision replay/i })).toBeInTheDocument();
    expect(screen.getByText(/no advisory cycles recorded/i)).toBeInTheDocument();
    expect(screen.getByText(AUTOPILOT_REPLAY_DISCLOSURE)).toBeInTheDocument();
  });

  it('renders a recorded preview snapshot', () => {
    render(<AutoPilotReplayLog entries={[entry]} />);
    expect(screen.getByText(/preview · 2026-09-08/i)).toBeInTheDocument();
    expect(screen.getByText(/2011 Mike Trout/)).toBeInTheDocument();
    expect(screen.getByText(/pending 1/i)).toBeInTheDocument();
  });
});
