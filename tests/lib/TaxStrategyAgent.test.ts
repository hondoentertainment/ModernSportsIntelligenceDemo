import { describe, expect, it } from 'vitest';
import { TaxStrategyAgent } from '../../lib/utils/TaxStrategyAgent';
import { CardInventory } from '../../types';

const makeCard = (overrides: Partial<CardInventory> = {}): CardInventory => ({
  id: 'card-1',
  player: 'Demo Player',
  year: 2024,
  manufacturer: 'Topps',
  cardNumber: '1',
  set: 'Chrome',
  sport: 'Baseball',
  league: 'MLB',
  isAutographed: false,
  condition: 'Near Mint',
  isGraded: false,
  purchasePrice: 100,
  purchaseDate: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
  currentValue: 180,
  status: 'active',
  ...overrides,
});

describe('TaxStrategyAgent', () => {
  it('flags harvest opportunities and near-term long-term transitions', () => {
    const insights = TaxStrategyAgent.generateInsights([
      makeCard({ id: 'loss', currentValue: 40, purchasePrice: 120 }),
      makeCard({
        id: 'wait',
        purchaseDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
        currentValue: 180,
      }),
    ]);
    expect(insights.some((i) => /Tax Loss Harvesting/i.test(i.insight))).toBe(true);
    expect(insights.some((i) => /Long-Term Capital Gains/i.test(i.insight))).toBe(true);
  });

  it('warns when 1099-K volume is near the reporting threshold', () => {
    const insights = TaxStrategyAgent.generateInsights([
      makeCard({
        id: 'sold-1',
        status: 'sold',
        saleDate: `${new Date().getFullYear()}-03-01`,
        salePrice: 4500,
        purchasePrice: 1000,
      }),
    ]);
    expect(insights.some((i) => /1099-K/i.test(i.insight))).toBe(true);
  });

  it('does not invent insights for a flat empty book', () => {
    expect(TaxStrategyAgent.generateInsights([])).toEqual([]);
  });
});
