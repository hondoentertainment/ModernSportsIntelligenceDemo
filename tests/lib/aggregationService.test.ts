import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from '../../lib/aggregationService';
import * as priceHistory from '../../lib/priceHistory';

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
                    purchasePrice: 100,
                    currentValue: 120,
                    gradingFees: 10,
                    shippingFees: 5,
                } as any,
            ];

            const result = AggregationService.calculatePortfolioMetrics(inventory);
            expect(result.totalValue).toBe(195);
            expect(result.totalCostBasis).toBe(50 + 100 + 10 + 5);
            expect(result.assetCount).toBe(2);
            expect(result.totalROI).toBe(195 - 165);
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
    });
});
