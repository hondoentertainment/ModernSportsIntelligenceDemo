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

const troutChrome: CardInventory = {
  ...trout,
  id: 'trout-chrome',
  set: 'Chrome',
  purchasePrice: 2500,
  purchaseDate: '2025-08-01',
  currentValue: 9000,
};

const soldVault: CardInventory = {
  ...trout,
  id: 'trout-sold',
  status: 'sold',
  currentValue: 12000,
  salePrice: 11000,
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

  it('prefers inventoryCardId and otherwise keeps only an unambiguous holding', () => {
    const twins = [trout, troutChrome];
    expect(matchInventoryCard(twins, '2011 Mike Trout', { inventoryCardId: 'trout-chrome' })?.id).toBe(
      'trout-chrome',
    );
    expect(matchInventoryCard(twins, '2011 Mike Trout', { amount: 9000 })?.id).toBe('trout-chrome');
    expect(matchInventoryCard(twins, '2011 Mike Trout')).toBeUndefined();
    expect(matchInventoryCard(twins, 'Sell Mike Trout now')).toBeUndefined();
    expect(matchInventoryCard(twins, 'Sell Mike Trout now', { amount: 4000 })?.id).toBe('trout-1');
    expect(matchInventoryCard([soldVault, trout], '2011 Mike Trout')?.id).toBe('trout-1');
    expect(matchInventoryCard([soldVault], '2011 Mike Trout', { inventoryCardId: 'trout-sold' })).toBeUndefined();
    expect(
      matchInventoryCard(twins, '2011 Mike Trout', { inventoryCardId: '  ', amount: Number.NaN }),
    ).toBeUndefined();
  });

  it('converts a sole marked holding to cash without inflating NAV', () => {
    const preview = simulateAutopilotImpact(
      [trout],
      [action({ type: 'SELL', assetName: '2011 Mike Trout', amount: 4000, inventoryCardId: 'trout-1' })],
    );
    expect(preview.startingValue).toBe(4000);
    expect(preview.projectedDisposedAssetValue).toBe(4000);
    expect(preview.projectedAcquiredAssetValue).toBe(0);
    expect(preview.projectedNetCashDelta).toBe(4000);
    expect(preview.projectedPostCycleValue).toBe(4000);
    expect(preview.navDelta).toBe(0);
    expect(preview.matchedSellCount).toBe(1);
    expect(preview.longTermTaxDelta).toBeGreaterThan(0);
    expect(preview.shortTermTaxDelta).toBe(0);
    expect(preview.disclosure).toBe(AUTOPILOT_IMPACT_DISCLOSURE);
  });

  it('swaps cash for a buy at cost without destroying NAV', () => {
    const preview = simulateAutopilotImpact(
      [trout],
      [action({ id: 'buy', type: 'BUY', assetName: 'Prospect', amount: 1000 })],
    );
    expect(preview.startingValue).toBe(4000);
    expect(preview.projectedBuySpend).toBe(1000);
    expect(preview.projectedAcquiredAssetValue).toBe(1000);
    expect(preview.projectedNetCashDelta).toBe(-1000);
    expect(preview.projectedPostCycleValue).toBe(4000);
    expect(preview.navDelta).toBe(0);
  });

  it('excludes sold-vault rows from starting NAV like Collection', () => {
    const preview = simulateAutopilotImpact([trout, soldVault], []);
    expect(preview.startingValue).toBe(4000);
    expect(preview.navDelta).toBe(0);
  });

  it('uses the card-id lot for tax when two year+player holdings exist', () => {
    const chromePreview = simulateAutopilotImpact(
      [trout, troutChrome],
      [action({ amount: 9000, inventoryCardId: 'trout-chrome' })],
    );
    const updatePreview = simulateAutopilotImpact(
      [trout, troutChrome],
      [action({ amount: 4000, inventoryCardId: 'trout-1' })],
    );
    expect(chromePreview.matchedSellCount).toBe(1);
    expect(updatePreview.matchedSellCount).toBe(1);
    expect(chromePreview.shortTermTaxDelta).toBeGreaterThan(0);
    expect(updatePreview.longTermTaxDelta).toBeGreaterThan(0);
    expect(chromePreview.shortTermTaxDelta).not.toBe(updatePreview.shortTermTaxDelta);
  });

  it('buckets short-term tax, ignores blocked rows, and counts unmatched sells', () => {
    const preview = simulateAutopilotImpact(
      [shortTerm],
      [
        action({ id: 'buy', type: 'BUY', assetName: 'Prospect', amount: 100 }),
        action({ id: 'block', type: 'SELL', assetName: '2018 Luka Doncic', amount: 800, policyDecision: 'blocked' }),
        action({ id: 'st', type: 'SELL', assetName: '2018 Luka Doncic', amount: 800 }),
        action({ id: 'miss', type: 'SELL', assetName: 'Unknown Player', amount: 50 }),
        action({ id: 'hold', type: 'HOLD', assetName: 'Sit', amount: 0 }),
      ],
    );
    expect(preview.projectedBuySpend).toBe(100);
    expect(preview.projectedSellValue).toBe(850);
    expect(preview.projectedPostCycleValue).toBe(800);
    expect(preview.navDelta).toBe(0);
    expect(preview.shortTermTaxDelta).toBeGreaterThan(0);
    expect(preview.longTermTaxDelta).toBe(0);
    expect(preview.unmatchedSellCount).toBe(1);
    expect(preview.matchedSellCount).toBe(1);
  });

  it('treats missing currentValue as zero book', () => {
    const preview = simulateAutopilotImpact(
      [{ ...trout, currentValue: undefined as unknown as number }],
      [],
    );
    expect(preview.startingValue).toBe(0);
    expect(preview.navDelta).toBe(0);
  });

  it('counts a second sell of the same lot as unmatched', () => {
    const preview = simulateAutopilotImpact(
      [trout],
      [
        action({ id: 'first', inventoryCardId: 'trout-1', amount: 4000 }),
        action({ id: 'dup', inventoryCardId: 'trout-1', amount: 4000 }),
      ],
    );
    expect(preview.matchedSellCount).toBe(1);
    expect(preview.unmatchedSellCount).toBe(1);
    expect(preview.projectedPostCycleValue).toBe(4000);
  });
});
