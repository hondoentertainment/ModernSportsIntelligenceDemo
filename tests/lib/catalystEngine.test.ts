import { describe, expect, it } from 'vitest';
import { CatalystEngine } from '../../lib/utils/catalystEngine';
import type { CardInventory } from '../../types';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'c1',
    player: 'Generic Player',
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
    currentValue: 120,
    status: 'active',
    ...overrides,
  };
}

describe('CatalystEngine impact signals', () => {
  it('emits a seeded injury card for Ohtani holdings', () => {
    const scenarios = CatalystEngine.generateImpactSignals([
      card({ id: 'sho', player: 'Shohei Ohtani', currentValue: 3400 }),
    ]);
    expect(scenarios.some((s) => s.catalyst === 'injury')).toBe(true);
    expect(scenarios[0].disclosure).toMatch(/seeded/i);
    expect(scenarios[0].source).toBe('seeded_demo');
  });

  it('emits a seeded transaction card for Judge holdings', () => {
    const scenarios = CatalystEngine.generateImpactSignals([
      card({ id: 'aj', player: 'Aaron Judge', currentValue: 2200 }),
    ]);
    expect(scenarios.some((s) => s.catalyst === 'transaction')).toBe(true);
  });

  it('merges impact signals into generateScenarios', () => {
    const scenarios = CatalystEngine.generateScenarios([
      card({ id: 'sho', player: 'Shohei Ohtani', currentValue: 3400 }),
      card({ id: 'milb', player: 'Prospect Kid', league: 'MiLB', currentValue: 80 }),
    ]);
    expect(scenarios.some((s) => s.catalyst === 'injury')).toBe(true);
    expect(scenarios.some((s) => s.catalyst === 'call_up')).toBe(true);
  });
});
