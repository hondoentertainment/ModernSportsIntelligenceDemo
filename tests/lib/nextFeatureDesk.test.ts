import { describe, expect, it } from 'vitest';
import {
  confidenceHistory,
  delegationRows,
  exitProbability,
  fairValueIntervals,
  liquidationPlan,
  marketTruthLedger,
  priceIndex,
  regulatoryChecklist,
  thesisBacktest,
  washSaleWindows,
} from '../../lib/analytics/nextFeatureDesk';
import type { AgentRecommendationRecord, CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'c1',
    player: 'Justin Herbert',
    year: 2020,
    manufacturer: 'Prizm',
    cardNumber: '325',
    set: 'Prizm',
    sport: 'Football',
    league: 'NFL',
    isAutographed: false,
    condition: 'Mint',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    purchasePrice: 800,
    purchaseDate: '2024-01-01',
    currentValue: 1000,
    status: 'active',
    liquidityScore: 80,
    ...overrides,
  };
}

describe('nextFeatureDesk', () => {
  it('does not invent sales when the book has no comps', () => {
    expect(marketTruthLedger([card()])).toEqual([]);
  });

  it('uses the comp low and high as the fair-value interval', () => {
    const [interval] = fairValueIntervals([card({
      salesData: [
        { title: 'Herbert', price: 900, condition: 'PSA 10', soldAt: '2026-01-01' },
        { title: 'Herbert', price: 1100, condition: 'PSA 10', soldAt: '2026-02-01' },
      ],
    })]);
    expect(interval.method).toBe('comps');
    expect(interval.low).toBe(900);
    expect(interval.high).toBe(1100);
  });

  it('flags a sale inside the 30-day window', () => {
    const now = Date.parse('2026-03-10T00:00:00Z');
    const [window] = washSaleWindows([card({
      status: 'sold',
      saleDate: '2026-03-01',
      salePrice: 1200,
    })], now);
    expect(window.clear).toBe(false);
    expect(window.washWindowEnd).toBe('2026-03-31');
  });

  it('liquidates the more liquid card first', () => {
    const plan = liquidationPlan([
      card({ id: 'illiquid', liquidityScore: 10, currentValue: 5000 }),
      card({ id: 'liquid', liquidityScore: 90, currentValue: 400 }),
    ], 100);
    expect(plan.sequence[0].id).toBe('liquid');
  });

  it('raises exit odds as the horizon lengthens', () => {
    expect(exitProbability(70, 30, 0.9)).toBeGreaterThan(exitProbability(70, 1, 0.9));
  });

  it('sets index level at 100 when mark equals cost', () => {
    const quote = priceIndex([card({ purchasePrice: 500, currentValue: 500 })], {
      id: 'idx',
      name: 'All',
      sport: 'All',
      yearMin: 1900,
      yearMax: 2030,
      gradedOnly: false,
      playerQuery: '',
    });
    expect(quote.level).toBe(100);
    expect(quote.constituents).toBe(1);
  });

  it('keeps the regulatory checklist off a live statute feed', () => {
    const items = regulatoryChecklist([card()]);
    expect(items.some(item => /does not monitor statute/i.test(item.detail))).toBe(true);
  });

  it('matches a thesis only when the recommendation names the player', () => {
    const recommendation = {
      id: 'r1',
      source: 'war-room',
      summary: 'Add Justin Herbert exposure',
      recommendedAction: 'Buy',
      status: 'approved',
      keyTakeaways: [],
      agents: [],
      createdAt: new Date().toISOString(),
    } as AgentRecommendationRecord;
    const result = thesisBacktest([recommendation], [card(), card({ id: 'other', player: 'Other' })], 12);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].player).toBe('Justin Herbert');
    expect(result.pnl).toBe(200);
  });

  it('counts acted-on recommendations separately from a price hit rate', () => {
    const now = Date.parse('2026-10-06T00:00:00Z');
    const history = confidenceHistory([
      {
        id: 'r1',
        source: 'war-room',
        summary: 'Hold',
        recommendedAction: 'Hold',
        status: 'approved',
        keyTakeaways: [],
        agents: [],
        createdAt: '2026-10-02T00:00:00Z',
      } as AgentRecommendationRecord,
    ], now);
    expect(history.approvalPct).toBe(100);
    expect(history.rolling30).toBe(100);
  });

  it('keeps portfolio edits out of the delegation log', () => {
    expect(delegationRows([{ category: 'portfolio', action: 'card.updated', created_at: '2026-01-01' }])).toEqual([]);
    expect(delegationRows([{ category: 'autonomy', action: 'autopilot.pause', created_at: '2026-01-01', metadata: { decision: 'Paused' } }])).toHaveLength(1);
  });
});
