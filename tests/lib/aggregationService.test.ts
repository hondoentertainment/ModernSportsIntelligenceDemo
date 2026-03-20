import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from '../../lib/aggregationService';
import { getCardHistory } from '../../lib/analytics/priceHistory';
import { LiquidityService } from '../../lib/liquidityService';
import { CorrelationService } from '../../lib/CorrelationService';
import type { CardInventory } from '../../types';

vi.mock('../../lib/analytics/priceHistory', () => ({
  getCardHistory: vi.fn(),
}));

vi.mock('../../lib/liquidityService', () => ({
  LiquidityService: {
    calculateLiquidityScore: vi.fn().mockReturnValue(50),
  },
}));

vi.mock('../../lib/CorrelationService', () => ({
  CorrelationService: {
    calculateDiversificationScore: vi.fn().mockReturnValue(75),
  },
}));

describe('AggregationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCardHistory).mockReturnValue([]);
  });

  describe('calculatePortfolioMetrics', () => {
    it('returns empty metrics for empty inventory', () => {
      const metrics = AggregationService.calculatePortfolioMetrics([]);
      expect(metrics.totalValue).toBe(0);
      expect(metrics.totalCostBasis).toBe(0);
      expect(metrics.assetCount).toBe(0);
      expect(metrics.topPerformers).toEqual([]);
    });

    it('calculates total value and cost basis', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Player 2',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 200,
          currentValue: 250,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.totalValue).toBe(400);
      expect(metrics.totalCostBasis).toBe(300);
      expect(metrics.totalROI).toBe(100);
    });

    it('includes grading and shipping fees in cost basis', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          gradingFees: 25,
          shippingFees: 10,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.totalCostBasis).toBe(135);
    });

    it('calculates realized profit from sold cards', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          salePrice: 200,
          status: 'sold',
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.realizedProfit).toBe(100);
      expect(metrics.soldCount).toBe(1);
    });

    it('calculates ROI percentage', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.totalROIPercent).toBe(50);
    });

    it('identifies top and under performers', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Player 2',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 50,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.topPerformers.length).toBeGreaterThan(0);
      expect(metrics.underPerformers.length).toBeGreaterThan(0);
    });

    it('calculates average liquidity', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.avgLiquidity).toBe(50);
    });

    it('calculates diversification score', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.diversificationScore).toBe(75);
    });

    it('calculates trends from price history', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      vi.mocked(getCardHistory).mockReturnValue([
        { timestamp: sevenDaysAgo, value: 120 },
      ]);
      const metrics = AggregationService.calculatePortfolioMetrics(inventory);
      expect(metrics.trend7d).toBeDefined();
    });
  });
});
