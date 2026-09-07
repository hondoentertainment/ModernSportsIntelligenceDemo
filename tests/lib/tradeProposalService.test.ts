import { describe, expect, it } from 'vitest';
import { generateTradeProposals } from '../../lib/analytics/tradeProposalService';
import type { CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'id',
    player: 'Player',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: false,
    purchasePrice: 100,
    purchaseDate: '2024-01-01',
    currentValue: 100,
    status: 'active',
    ...overrides,
  };
}

describe('tradeProposalService', () => {
  it('returns empty when inventory is too thin', () => {
    expect(generateTradeProposals([card()])).toEqual([]);
  });

  it('suggests Card A for Card B + cash on player concentration', () => {
    const inventory = [
      card({ id: 't1', player: 'Mike Trout', currentValue: 8000, purchasePrice: 4000 }),
      card({ id: 't2', player: 'Mike Trout', currentValue: 2000, purchasePrice: 1000, cardNumber: '2' }),
      card({ id: 'o1', player: 'Other Guy', league: 'NBA', sport: 'Basketball', currentValue: 400, purchasePrice: 300 }),
    ];
    const proposals = generateTradeProposals(inventory);
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0].givePlayer).toBe('Mike Trout');
    expect(proposals[0].receivePlayer).toBe('Other Guy');
    expect(proposals[0].advisoryOnly).toBe(true);
    expect(proposals[0].source).toBe('local_inventory');
    expect(proposals[0].rationale).toMatch(/advisory only/i);
    expect(proposals[0].cashDelta).toBeGreaterThan(0);
  });

  it('does not propose when allocation is already diversified', () => {
    const inventory = [
      card({ id: 'a', player: 'A', currentValue: 110, league: 'MLB' }),
      card({ id: 'b', player: 'B', currentValue: 110, league: 'NBA', sport: 'Basketball' }),
      card({ id: 'c', player: 'C', currentValue: 110, league: 'NFL', sport: 'Football' }),
    ];
    expect(generateTradeProposals(inventory)).toEqual([]);
  });
});
