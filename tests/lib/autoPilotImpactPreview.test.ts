import { describe, expect, it } from 'vitest';
import {
  AUTOPILOT_IMPACT_DISCLOSURE,
  matchInventoryCard,
  simulateAutopilotImpact,
} from '../../lib/trading/autoPilotImpactPreview';
import type { AutonomousAction, CardInventory } from '../../types';

const trout: CardInventory = {
  id: 'trout-1',
  player: 'Mike Trout',
  year: 2011,
  manufacturer: 'Topps',
  cardNumber: '1',
  set: 'Update',
  sport: 'Baseball',
  league: 'MLB',
  isAutographed: false,
  condition: 'Mint',
  isGraded: false,
  purchasePrice: 1000,
  purchaseDate: '2020-01-01',
  currentValue: 4000,
  status: 'active',
};

const shortTerm: CardInventory = {
  ...trout,
  id: 'luka-1',
  player: 'Luka Doncic',
  year: 2018,
  purchasePrice: 200,
  purchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  currentValue: 800,
};

function action(partial: Partial<AutonomousAction>): AutonomousAction {
  return {
    id: 'a1',
    type: 'SELL',
    assetName: '2011 Mike Trout',
    amount: 4000,
    rationale: 'test',
    timestamp: '2026-09-08T00:00:00Z',
    status: 'pending',
    policyDecision: 'approved',
    ...partial,
  };
}

describe('autoPilotImpactPreview', () => {
  it('matches year+player then loose player inclusion', () => {
    expect(matchInventoryCard([trout], '2011 Mike Trout')?.id).toBe('trout-1');
    expect(matchInventoryCard([trout], 'Sell Mike Trout now')?.id).toBe('trout-1');
    expect(matchInventoryCard([trout], '')).toBeUndefined();
    expect(matchInventoryCard([trout], 'Nobody')).toBeUndefined();
  });

  it('computes NAV delta and long-term tax on matched sells', () => {
    const preview = simulateAutopilotImpact(
      [trout],
      [action({ type: 'SELL', assetName: '2011 Mike Trout', amount: 4000 })],
    );
    expect(preview.startingValue).toBe(4000);
    expect(preview.navDelta).toBe(4000);
    expect(preview.projectedNetCashDelta).toBe(4000);
    expect(preview.matchedSellCount).toBe(1);
    expect(preview.longTermTaxDelta).toBeGreaterThan(0);
    expect(preview.shortTermTaxDelta).toBe(0);
    expect(preview.disclosure).toBe(AUTOPILOT_IMPACT_DISCLOSURE);
  });

  it('buckets short-term tax, ignores blocked rows, and counts unmatched sells', () => {
    const preview = simulateAutopilotImpact(
      [shortTerm],
      [
        action({ id: 'buy', type: 'BUY', assetName: 'Prospect', amount: 100 }),
        action({ id: 'block', type: 'SELL', assetName: '2018 Luka Doncic', amount: 800, policyDecision: 'blocked' }),
        action({ id: 'st', type: 'SELL', assetName: '2018 Luka Doncic', amount: 800 }),
        action({ id: 'miss', type: 'SELL', assetName: 'Unknown Player', amount: 50 }),
      ],
    );
    expect(preview.projectedBuySpend).toBe(100);
    expect(preview.projectedSellValue).toBe(850);
    expect(preview.shortTermTaxDelta).toBeGreaterThan(0);
    expect(preview.longTermTaxDelta).toBe(0);
    expect(preview.unmatchedSellCount).toBe(1);
    expect(preview.matchedSellCount).toBe(1);
  });
});
