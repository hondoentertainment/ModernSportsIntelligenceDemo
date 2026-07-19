import { describe, it, expect } from 'vitest';
import {
  buildConsensusLedger,
  quoteCard,
  rankQuotes,
} from '../../lib/pricing/consensusMarketLedger';
import type { CardInventory } from '../../types';

function card(partial: Partial<CardInventory> & Pick<CardInventory, 'id' | 'player'>): CardInventory {
  return {
    year: 2020,
    set: 'Prizm',
    currentValue: 100,
    purchasePrice: 50,
    ...partial,
  } as CardInventory;
}

describe('consensusMarketLedger', () => {
  const now = Date.parse('2026-07-19T12:00:00.000Z');

  it('quotes cards with provenance labels', () => {
    const q = quoteCard(
      card({
        id: '1',
        player: 'Mahomes',
        currentValue: 1200,
        valuationSource: 'ebay-api',
        valuationTimestamp: '2026-07-18T12:00:00.000Z',
        valuationConfidence: 0.9,
      }),
      now,
    );
    expect(q).toMatchObject({
      fmv: 1200,
      source: 'ebay-api',
      verifiable: true,
      fresh: true,
      label: 'Live eBay comps',
    });
  });

  it('ranks ebay above gemini', () => {
    const ranked = rankQuotes([
      {
        cardId: 'g',
        player: 'A',
        fmv: 500,
        source: 'gemini',
        confidence: 0.5,
        valuationTimestamp: null,
        fresh: false,
        verifiable: false,
        label: 'AI estimate',
      },
      {
        cardId: 'e',
        player: 'B',
        fmv: 400,
        source: 'ebay-api',
        confidence: 0.8,
        valuationTimestamp: '2026-07-18T12:00:00.000Z',
        fresh: true,
        verifiable: true,
        label: 'Live eBay comps',
      },
    ]);
    expect(ranked[0]?.cardId).toBe('e');
  });

  it('builds a portfolio ledger summary', () => {
    const ledger = buildConsensusLedger(
      [
        card({
          id: '1',
          player: 'A',
          currentValue: 1000,
          valuationSource: 'ebay-api',
          valuationTimestamp: '2026-07-18T12:00:00.000Z',
        }),
        card({
          id: '2',
          player: 'B',
          currentValue: 200,
          valuationSource: 'gemini',
          valuationTimestamp: '2026-07-18T12:00:00.000Z',
        }),
        card({ id: '3', player: 'C', currentValue: 0 }),
      ],
      now,
    );
    expect(ledger.quotedCount).toBe(2);
    expect(ledger.totalFmv).toBe(1200);
    expect(ledger.sourceMix['ebay-api']).toBe(1);
    expect(ledger.sourceMix.gemini).toBe(1);
    expect(ledger.coverageTargetPct).toBe(95);
  });
});
