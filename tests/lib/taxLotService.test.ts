import { describe, it, expect } from 'vitest';
import { TaxLotService } from '../../lib/taxLotService';
import { makeCard } from '../helpers';

describe('TaxLotService', () => {
  const today = new Date();
  const thisYear = today.getFullYear();
  const twoYearsAgo = `${thisYear - 2}-01-15`;
  const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  describe('getCardTaxLot', () => {
    it('returns unrealized lot for active card', () => {
      const card = makeCard({ purchasePrice: 100, currentValue: 150, purchaseDate: '2023-01-01' });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.isRealized).toBe(false);
      expect(lot.costBasis).toBe(100);
      expect(lot.gainLoss).toBe(50);
      expect(lot.proceeds).toBeUndefined();
    });

    it('returns realized lot for sold card', () => {
      const card = makeCard({
        purchasePrice: 100,
        currentValue: 150,
        status: 'sold',
        salePrice: 200,
        saleDate: '2024-06-01',
        purchaseDate: '2023-01-01',
      });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.isRealized).toBe(true);
      expect(lot.proceeds).toBe(200);
      expect(lot.gainLoss).toBe(100);
    });

    it('includes grading and shipping fees in cost basis', () => {
      const card = makeCard({
        purchasePrice: 100,
        gradingFees: 25,
        shippingFees: 10,
      });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.costBasis).toBe(135);
    });

    it('classifies long-term holding correctly', () => {
      const card = makeCard({ purchaseDate: twoYearsAgo });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.holdingPeriod).toBe('Long-Term');
    });

    it('classifies short-term holding correctly', () => {
      const card = makeCard({ purchaseDate: sixMonthsAgo });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.holdingPeriod).toBe('Short-Term');
    });

    it('includes player and description', () => {
      const card = makeCard({ player: 'Shohei Ohtani', year: 2023, manufacturer: 'Topps' });
      const lot = TaxLotService.getCardTaxLot(card);
      expect(lot.player).toBe('Shohei Ohtani');
      expect(lot.description).toContain('Shohei Ohtani');
      expect(lot.description).toContain('2023');
    });
  });

  describe('generateTaxSummary', () => {
    it('returns zeros for empty inventory', () => {
      const summary = TaxLotService.generateTaxSummary([], thisYear);
      expect(summary.totalProceeds).toBe(0);
      expect(summary.totalCostBasis).toBe(0);
      expect(summary.totalNetGainLoss).toBe(0);
      expect(summary.estimatedTaxLiability).toBe(0);
      expect(summary.totalTransactions).toBe(0);
      expect(summary.scheduleDEntries).toHaveLength(0);
    });

    it('computes gains for sold cards in the target year', () => {
      const saleDate = `${thisYear}-06-15`;
      const cards = [
        makeCard({
          id: '1',
          purchasePrice: 100,
          purchaseDate: `${thisYear - 1}-01-01`,
          status: 'sold',
          salePrice: 200,
          saleDate,
          currentValue: 200,
        }),
      ];
      const summary = TaxLotService.generateTaxSummary(cards, thisYear);
      expect(summary.totalTransactions).toBe(1);
      expect(summary.totalNetGainLoss).toBeGreaterThan(0);
      expect(summary.estimatedTaxLiability).toBeGreaterThan(0);
    });

    it('excludes sales from different years', () => {
      const cards = [
        makeCard({
          id: '1',
          purchasePrice: 100,
          status: 'sold',
          salePrice: 200,
          saleDate: `${thisYear - 3}-06-15`,
          purchaseDate: `${thisYear - 4}-01-01`,
        }),
      ];
      const summary = TaxLotService.generateTaxSummary(cards, thisYear);
      expect(summary.totalTransactions).toBe(0);
    });

    it('identifies unrealized gains from active cards', () => {
      const cards = [makeCard({ purchasePrice: 100, currentValue: 300 })];
      const summary = TaxLotService.generateTaxSummary(cards, thisYear);
      expect(summary.unrealizedGains).toBe(200);
    });

    it('identifies unrealized losses and harvest candidates', () => {
      const cards = [makeCard({ purchasePrice: 300, currentValue: 100 })];
      const summary = TaxLotService.generateTaxSummary(cards, thisYear);
      expect(summary.unrealizedLosses).toBe(200);
      expect(summary.harvestCandidates.length).toBe(1);
      expect(summary.harvestCandidates[0].unrealizedLoss).toBe(200);
      expect(summary.harvestCandidates[0].taxSavingsEstimate).toBeGreaterThan(0);
    });

    it('has correct shape for Schedule D entries', () => {
      const cards = [
        makeCard({
          id: '1',
          purchasePrice: 100,
          status: 'sold',
          salePrice: 200,
          saleDate: `${thisYear}-03-01`,
          purchaseDate: `${thisYear - 1}-01-01`,
        }),
      ];
      const summary = TaxLotService.generateTaxSummary(cards, thisYear);
      expect(summary.scheduleDEntries).toHaveLength(1);
      const entry = summary.scheduleDEntries[0];
      expect(entry).toHaveProperty('description');
      expect(entry).toHaveProperty('dateAcquired');
      expect(entry).toHaveProperty('dateSold');
      expect(entry).toHaveProperty('proceeds');
      expect(entry).toHaveProperty('costBasis');
      expect(entry).toHaveProperty('gainLoss');
      expect(entry).toHaveProperty('holdingPeriod');
    });
  });

  describe('compareMethodTaxImpact', () => {
    it('returns all four methods', () => {
      const cards = [
        makeCard({
          id: '1',
          purchasePrice: 50,
          status: 'sold',
          salePrice: 200,
          saleDate: `${thisYear}-06-15`,
          purchaseDate: `${thisYear - 1}-01-01`,
        }),
        makeCard({
          id: '2',
          purchasePrice: 150,
          status: 'sold',
          salePrice: 200,
          saleDate: `${thisYear}-07-15`,
          purchaseDate: `${thisYear}-01-01`,
        }),
      ];
      const comparison = TaxLotService.compareMethodTaxImpact(cards, thisYear);
      expect(comparison).toHaveLength(4);
      const methods = comparison.map(c => c.method);
      expect(methods).toContain('FIFO');
      expect(methods).toContain('LIFO');
      expect(methods).toContain('SpecificID');
      expect(methods).toContain('AvgCost');
    });

    it('returns zeros for empty inventory', () => {
      const comparison = TaxLotService.compareMethodTaxImpact([], thisYear);
      for (const entry of comparison) {
        expect(entry.liability).toBe(0);
        expect(entry.netGain).toBe(0);
      }
    });
  });
});
