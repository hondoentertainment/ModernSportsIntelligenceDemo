import { describe, it, expect } from 'vitest';
import {
  buildConsensusLedger,
  quoteCard,
  rankQuotes,
  type ConsensusQuote,
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

function quote(partial: Partial<ConsensusQuote> & Pick<ConsensusQuote, 'cardId' | 'source'>): ConsensusQuote {
  return {
    player: 'P',
    fmv: 100,
    confidence: 0.5,
    valuationTimestamp: null,
    fresh: false,
    verifiable: false,
    label: 'x',
    ...partial,
  };
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

  it('labels stale ebay and historical comps', () => {
    const staleEbay = quoteCard(
      card({
        id: '1',
        player: 'A',
        valuationSource: 'ebay-api',
        valuationTimestamp: '2026-01-01T00:00:00.000Z',
      }),
      now,
    );
    expect(staleEbay?.label).toBe('Stale eBay comps');
    expect(staleEbay?.fresh).toBe(false);

    const histFresh = quoteCard(
      card({
        id: '2',
        player: 'B',
        valuationSource: 'historical-comps',
        valuationTimestamp: '2026-07-18T12:00:00.000Z',
      }),
      now,
    );
    expect(histFresh?.label).toBe('Historical comps');

    const histStale = quoteCard(
      card({
        id: '3',
        player: 'C',
        valuationSource: 'historical-comps',
        lastValuationDate: '2025-01-01T00:00:00.000Z',
      }),
      now,
    );
    expect(histStale?.label).toBe('Stale historical comps');
  });

  it('labels gemini and fallback; ignores invalid timestamps', () => {
    expect(
      quoteCard(
        card({ id: '1', player: 'G', valuationSource: 'gemini', valuationTimestamp: 'not-a-date' }),
        now,
      )?.label,
    ).toBe('AI estimate');

    expect(
      quoteCard(card({ id: '2', player: 'F', valuationSource: undefined, currentValue: 50 }), now)?.label,
    ).toBe('Fallback estimate');

    expect(quoteCard(card({ id: '3', player: 'Z', currentValue: 0 }), now)).toBeNull();
  });

  it('ranks ebay above gemini', () => {
    const ranked = rankQuotes([
      quote({ cardId: 'g', source: 'gemini', fmv: 500 }),
      quote({
        cardId: 'e',
        source: 'ebay-api',
        fmv: 400,
        fresh: true,
        verifiable: true,
        label: 'Live eBay comps',
      }),
    ]);
    expect(ranked[0]?.cardId).toBe('e');
  });

  it('breaks ties by freshness then FMV; treats mixed as fallback rank', () => {
    const ranked = rankQuotes([
      quote({ cardId: 'stale', source: 'ebay-api', fmv: 300, fresh: false }),
      quote({ cardId: 'fresh', source: 'ebay-api', fmv: 200, fresh: true }),
      quote({ cardId: 'hi', source: 'gemini', fmv: 90, fresh: true }),
      quote({ cardId: 'lo', source: 'gemini', fmv: 10, fresh: true }),
      quote({ cardId: 'mix', source: 'mixed', fmv: 999, fresh: true }),
      quote({
        cardId: 'unknown',
        source: 'not-a-source' as ConsensusQuote['source'],
        fmv: 1,
        fresh: true,
      }),
    ]);
    expect(ranked.map((q) => q.cardId)).toEqual(['fresh', 'stale', 'hi', 'lo', 'mix', 'unknown']);
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
    expect(ledger.cardCount).toBe(3);
  });
});
