import { describe, expect, it } from 'vitest';
import { makeCard } from '../helpers';
import {
  HOLDING_HORIZON_DISCLOSURE,
  analyzeHoldingHorizon,
  daysHeld,
  daysToLongTerm,
  holdingTreatment,
} from '../../lib/analytics/holdingHorizon';

describe('holdingHorizon', () => {
  it('classifies ST vs LT from purchase date', () => {
    const asOf = new Date('2026-09-10T12:00:00Z');
    expect(holdingTreatment('2026-08-01', asOf)).toBe('Short-Term');
    expect(holdingTreatment('2025-01-01', asOf)).toBe('Long-Term');
    expect(daysHeld('2026-09-01T12:00:00Z', asOf)).toBe(9);
    expect(daysToLongTerm('2026-08-01', asOf)).toBeGreaterThan(300);
    expect(HOLDING_HORIZON_DISCLOSURE).toMatch(/not tax advice/i);
  });

  it('flags same-lot wash-sale proximity and player watch', () => {
    const asOf = new Date('2026-09-10T12:00:00Z');
    const summary = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'hold',
          player: 'Mike Trout',
          purchaseDate: '2026-09-05',
          currentValue: 400,
        }),
        makeCard({
          id: 'sold-same',
          player: 'Mike Trout',
          purchaseDate: '2024-01-01',
          saleDate: '2026-09-02',
          status: 'sold',
          currentValue: 300,
        }),
        makeCard({
          id: 'lt',
          player: 'Other Star',
          purchaseDate: '2024-01-01',
          currentValue: 200,
        }),
      ],
      asOf,
    );
    expect(summary.shortTerm).toBe(1);
    expect(summary.longTerm).toBe(1);
    expect(summary.washSaleWatch).toBe(1);
    expect(summary.rows[0].washSaleProximity).toBe('restricted');
    expect(summary.rows[0].washSaleDetail).toMatch(/wash-sale/i);
    expect(summary.disclosure).toBe(HOLDING_HORIZON_DISCLOSURE);
  });

  it('ignores sold lots without a sale date', () => {
    const summary = analyzeHoldingHorizon([
      makeCard({ id: 'a', purchaseDate: '2024-01-01', currentValue: 100 }),
      makeCard({ id: 'b', status: 'sold', saleDate: undefined, player: 'Mike Trout' }),
    ]);
    expect(summary.washSaleWatch).toBe(0);
    expect(summary.active).toBe(1);
  });

  it('watches same-player different-lot sales and sorts restricted first', () => {
    const asOf = new Date('2026-09-10T12:00:00Z');
    const summary = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'watch-hold',
          player: 'Shohei Ohtani',
          cardNumber: '99',
          purchaseDate: '2026-09-08',
        }),
        makeCard({
          id: 'sold-other-lot',
          player: 'Shohei Ohtani',
          cardNumber: '1',
          purchaseDate: '2024-01-01',
          saleDate: '2026-09-03',
          status: 'sold',
        }),
        makeCard({
          id: 'clear-hold',
          player: 'Unrelated',
          purchaseDate: '2025-08-01',
        }),
        makeCard({
          id: 'stale-sold',
          player: 'Unrelated',
          saleDate: '2025-01-01',
          status: 'sold',
        }),
        makeCard({
          id: 'bad-sale',
          player: 'Shohei Ohtani',
          saleDate: 'not-a-date',
          status: 'sold',
        }),
      ],
      asOf,
    );
    expect(summary.rows[0].washSaleProximity).toBe('watch');
    expect(summary.rows[0].washSaleDetail).toMatch(/repurchase proximity/i);
    expect(summary.rows.some((row) => row.washSaleProximity === 'clear')).toBe(true);
    expect(daysHeld('not-a-date', asOf)).toBe(0);
    expect(holdingTreatment('not-a-date', asOf)).toBe('Short-Term');
    expect(daysHeld('2024-01-01', asOf, '2024-01-10')).toBe(9);
    expect(holdingTreatment('2024-01-01', asOf, '2025-02-01')).toBe('Long-Term');
  });
});
