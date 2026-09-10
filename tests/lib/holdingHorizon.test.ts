import { describe, expect, it } from 'vitest';
import { makeCard } from '../helpers';
import {
  HOLDING_HORIZON_DISCLOSURE,
  analyzeHoldingHorizon,
  daysHeld,
  daysToLongTerm,
  holdingTreatment,
  isSoldLotLoss,
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
          salePrice: 60,
          purchasePrice: 100,
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
          salePrice: 40,
          purchasePrice: 120,
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

  it('does not flag profitable sales as wash-sale proximity', () => {
    const asOf = new Date('2026-09-10T12:00:00Z');
    const summary = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'replacement',
          player: 'Mike Trout',
          purchaseDate: '2026-09-05',
        }),
        makeCard({
          id: 'profit-sale',
          player: 'Mike Trout',
          purchaseDate: '2024-01-01',
          saleDate: '2026-09-02',
          salePrice: 250,
          purchasePrice: 100,
          status: 'sold',
        }),
      ],
      asOf,
    );
    expect(isSoldLotLoss(makeCard({ salePrice: 250, purchasePrice: 100 }))).toBe(false);
    expect(isSoldLotLoss(makeCard({ salePrice: 40, purchasePrice: 100 }))).toBe(true);
    expect(isSoldLotLoss(makeCard({ realizedGainLoss: -25 }))).toBe(true);
    expect(isSoldLotLoss(makeCard({ realizedGainLoss: 10 }))).toBe(false);
    expect(isSoldLotLoss(makeCard({ salePrice: Number.NaN, purchasePrice: 100 }))).toBe(false);
    expect(isSoldLotLoss(makeCard({ salePrice: undefined, purchasePrice: 100 }))).toBe(false);
    expect(isSoldLotLoss({ ...makeCard({ salePrice: 10 }), purchasePrice: undefined as unknown as number })).toBe(false);
    expect(summary.washSaleWatch).toBe(0);
    expect(summary.rows[0].washSaleProximity).toBe('clear');
  });

  it('compares disposal date to the replacement purchaseDate, not asOf', () => {
    const lateAsOf = new Date('2026-10-20T12:00:00Z');
    const replacement = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'true-replace',
          player: 'Mike Trout',
          purchaseDate: '2026-09-05',
        }),
        makeCard({
          id: 'loss-sale',
          player: 'Mike Trout',
          purchaseDate: '2024-01-01',
          saleDate: '2026-09-02',
          salePrice: 50,
          purchasePrice: 140,
          status: 'sold',
        }),
      ],
      lateAsOf,
    );
    expect(replacement.rows[0].washSaleProximity).toBe('restricted');

    const oldHolding = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'old-hold',
          player: 'Mike Trout',
          purchaseDate: '2024-01-01',
        }),
        makeCard({
          id: 'recent-loss',
          player: 'Mike Trout',
          purchaseDate: '2023-01-01',
          saleDate: '2026-09-08',
          salePrice: 70,
          purchasePrice: 200,
          status: 'sold',
        }),
      ],
      new Date('2026-09-10T12:00:00Z'),
    );
    expect(oldHolding.rows[0].washSaleProximity).toBe('clear');
    expect(oldHolding.washSaleWatch).toBe(0);

    const unparseable = analyzeHoldingHorizon(
      [
        makeCard({
          id: 'bad-date',
          player: 'Mike Trout',
          purchaseDate: 'not-a-date',
        }),
        makeCard({
          id: 'loss-near',
          player: 'Mike Trout',
          saleDate: '2026-09-02',
          salePrice: 10,
          purchasePrice: 80,
          status: 'sold',
        }),
      ],
      lateAsOf,
    );
    expect(unparseable.rows[0].washSaleProximity).toBe('clear');
  });
});
