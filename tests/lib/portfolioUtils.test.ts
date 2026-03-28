import { describe, it, expect } from 'vitest';
import {
  computePortfolioStats,
  filterActiveHoldings,
  isSoldStatus,
  type PortfolioCardLike,
} from '../../lib/portfolioUtils';

describe('portfolioUtils', () => {
  describe('isSoldStatus', () => {
    it('is true only for sold', () => {
      expect(isSoldStatus('sold')).toBe(true);
      expect(isSoldStatus('active')).toBe(false);
      expect(isSoldStatus('consignment')).toBe(false);
      expect(isSoldStatus(undefined)).toBe(false);
    });
  });

  describe('filterActiveHoldings', () => {
    it('removes sold cards only', () => {
      const cards: PortfolioCardLike[] = [
        { status: 'active', purchasePrice: 1 },
        { status: 'sold', purchasePrice: 2 },
        { status: 'consignment', purchasePrice: 3 },
        {},
      ];
      expect(filterActiveHoldings(cards)).toHaveLength(3);
    });
  });

  describe('computePortfolioStats', () => {
    it('returns zeros for an empty portfolio', () => {
      expect(computePortfolioStats([])).toEqual({
        nav: 0,
        totalCost: 0,
        unrealizedPl: 0,
        roiPercent: 0,
        cardCount: 0,
      });
    });

    it('treats missing values as zero', () => {
      const cards: PortfolioCardLike[] = [
        { currentValue: undefined, purchasePrice: null },
        { currentValue: 100, purchasePrice: 50 },
      ];
      const s = computePortfolioStats(cards, { excludeSold: false });
      expect(s.nav).toBe(100);
      expect(s.totalCost).toBe(50);
      expect(s.unrealizedPl).toBe(50);
      expect(s.roiPercent).toBe(100);
      expect(s.cardCount).toBe(2);
    });

    it('excludes sold cards by default', () => {
      const cards: PortfolioCardLike[] = [
        { currentValue: 200, purchasePrice: 100, status: 'active' },
        { currentValue: 999, purchasePrice: 1, status: 'sold' },
      ];
      const s = computePortfolioStats(cards);
      expect(s.nav).toBe(200);
      expect(s.totalCost).toBe(100);
      expect(s.unrealizedPl).toBe(100);
      expect(s.roiPercent).toBe(100);
      expect(s.cardCount).toBe(1);
    });

    it('includes sold cards when excludeSold is false', () => {
      const cards: PortfolioCardLike[] = [
        { currentValue: 100, purchasePrice: 40, status: 'active' },
        { currentValue: 300, purchasePrice: 100, status: 'sold' },
      ];
      const s = computePortfolioStats(cards, { excludeSold: false });
      expect(s.nav).toBe(400);
      expect(s.totalCost).toBe(140);
      expect(s.unrealizedPl).toBe(260);
      expect(s.cardCount).toBe(2);
    });

    it('returns 0% ROI when total cost is zero (avoids division by zero)', () => {
      const cards: PortfolioCardLike[] = [{ currentValue: 50, purchasePrice: 0, status: 'active' }];
      const s = computePortfolioStats(cards);
      expect(s.roiPercent).toBe(0);
      expect(s.unrealizedPl).toBe(50);
    });

    it('handles negative unrealized P/L and ROI', () => {
      const cards: PortfolioCardLike[] = [
        { currentValue: 40, purchasePrice: 100, status: 'active' },
      ];
      const s = computePortfolioStats(cards);
      expect(s.unrealizedPl).toBe(-60);
      expect(s.roiPercent).toBeCloseTo(-60, 5);
    });

    it('ignores NaN monetary fields', () => {
      const cards: PortfolioCardLike[] = [
        { currentValue: Number.NaN, purchasePrice: 10, status: 'active' },
        { currentValue: 20, purchasePrice: Number.NaN, status: 'active' },
      ];
      const s = computePortfolioStats(cards, { excludeSold: false });
      expect(s.nav).toBe(20);
      expect(s.totalCost).toBe(10);
    });
  });
});
