import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { buildWarRoomLedgerContext } from '../../lib/utils/warRoomLedgerContext';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'a',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps Update',
    league: 'MLB',
    purchasePrice: 100,
    currentValue: 1200,
    isGraded: true,
    isAutographed: false,
    status: 'active',
    valuationSource: 'ebay-api',
    valuationTimestamp: new Date().toISOString(),
    valuationConfidence: 0.9,
    ...overrides,
  } as CardInventory;
}

describe('buildWarRoomLedgerContext', () => {
  it('includes book FMV, source mix, and live flag line', () => {
    const text = buildWarRoomLedgerContext([card(), card({ id: 'b', player: 'Wemby', currentValue: 800, valuationSource: 'gemini' })]);
    expect(text).toContain('CONSENSUS MARKET LEDGER');
    expect(text).toMatch(/Live comps flag \(USE_REAL_EBAY\): (ON|OFF)/);
    expect(text).toContain('Book FMV:');
    expect(text).toContain('Source mix:');
    expect(text).toContain('Shohei Ohtani');
  });

  it('handles empty inventory without throwing', () => {
    const text = buildWarRoomLedgerContext([]);
    expect(text).toContain('(no priced assets)');
    expect(text).toContain('Quoted assets: 0/0');
  });

  it('reports source mix n/a when nothing is quoted', () => {
    const text = buildWarRoomLedgerContext([
      card({ id: 'z', currentValue: 0, valuationSource: 'fallback' }),
    ]);
    expect(text).toMatch(/Source mix: n\/a/);
  });
});
