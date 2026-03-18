import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from '../../lib/analytics/aggregationService';
import * as priceHistory from '../../lib/analytics/priceHistory';

vi.mock('../../lib/priceHistory', () => ({
    getCardHistory: vi.fn(() => []),
}));

describe('AggregationService', () => {
    beforeEach(() => {
        vi.mocked(priceHistory.getCardHistory).mockReturnValue([]);
    });

    describe('calculatePortfolioMetrics', () => {
        it('returns zeros for empty inventory', () => {
            const result = AggregationService.calculatePortfolioMetrics([]);
            expect(result.totalValue).toBe(0);
            expect(result.totalCostBasis).toBe(0);
            expect(result.assetCount).toBe(0);
            expect(result.totalROI).toBe(0);
            expect(result.totalROIPercent).toBe(0);
        });

        it('calculates total value and cost basis correctly', () => {
            const inventory = [
                {
                    id: '1',
                    player: 'Player A',
                    year: 2023,
                    manufacturer: 'Topps',
                    cardNumber: '1',
                    set: 'Chrome',
                    sport: 'MLB',
                    league: 'MLB',
                    status: 'active',
                    purchasePrice: 50,
                    currentValue: 75,
                    gradingFees: 0,
                    shippingFees: 0,
                } as any,
                {
                    id: '2',
                    player: 'Player B',
                    year: 2022,
                    manufacturer: 'Panini',
                    cardNumber: '10',
                    set: 'Prizm',
                    sport: 'NBA',
                    league: 'NBA',
                    status: 'active',
                    purchasePrice: 100,
                    currentValue: 120,
                    gradingFees: 10,
                    shippingFees: 5,
                } as any,
            ];

            const result = AggregationService.calculatePortfolioMetrics(inventory);
            expect(result.totalValue).toBeCloseTo(195);
            expect(result.totalCostBasis).toBeCloseTo(165);
            expect(result.assetCount).toBe(2);
            expect(result.totalROI).toBeCloseTo(30);
            expect(result.totalROIPercent).toBeCloseTo((30 / 165) * 100);
        });

        it('handles cards with zero or missing currentValue', () => {
            const inventory = [
                {
                    id: '1',
                    player: 'Player A',
                    year: 2023,
                    manufacturer: 'Topps',
                    cardNumber: '1',
                    set: 'Chrome',
                    sport: 'MLB',
                    league: 'MLB',
                    purchasePrice: 25,
                    currentValue: 0,
                } as any,
            ];

            const result = AggregationService.calculatePortfolioMetrics(inventory);
            expect(result.totalValue).toBe(0);
            expect(result.totalCostBasis).toBe(25);
            expect(result.assetCount).toBe(1);
        });

        it('calculates realized profit and ROI for sold assets', () => {
            const inventory = [
                {
                    id: '1',
                    player: 'Player A',
                    year: 2023,
                    manufacturer: 'Topps',
                    cardNumber: '1',
                    set: 'Chrome',
                    sport: 'MLB',
                    league: 'MLB',
                    status: 'active',
                    purchasePrice: 100,
                    currentValue: 150,
                    gradingFees: 0,
                    shippingFees: 0,
                } as any,
                {
                    id: '2',
                    player: 'Player B',
                    year: 2022,
                    manufacturer: 'Panini',
                    cardNumber: '10',
                    set: 'Prizm',
                    sport: 'NBA',
                    league: 'NBA',
                    status: 'sold',
                    purchasePrice: 50,
                    salePrice: 80,
                    gradingFees: 0,
                    shippingFees: 0,
                } as any,
            ];

            const result = AggregationService.calculatePortfolioMetrics(inventory);
            expect(result.totalValue).toBe(150);
            expect(result.assetCount).toBe(1);
            expect(result.soldCount).toBe(1);
            expect(result.realizedProfit).toBeCloseTo(30);
            expect(result.realizedROI).toBeCloseTo(60); // 30/50 * 100
        });
    });

    describe('getComparisonMetrics', () => {
        it('returns past and current values with correct delta', () => {
            const inventory = [
                {
                    id: '1',
                    player: 'Test',
                    purchasePrice: 100,
                    currentValue: 120,
                } as any,
            ];
            vi.mocked(priceHistory.getCardHistory).mockReturnValue([]);
            const result = AggregationService.getComparisonMetrics(inventory, '7d');
            expect(result.currentValue).toBe(120);
            expect(typeof result.pastValue).toBe('number');
            expect(typeof result.delta).toBe('number');
            expect(typeof result.deltaPercent).toBe('number');
        });
    });
});
