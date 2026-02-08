
import { CardInventory } from '../types';
import { getCardHistory, PriceSnapshot } from './priceHistory';

export interface PortfolioMetrics {
    totalValue: number;
    totalCostBasis: number;
    totalROI: number;
    totalROIPercent: number;
    trend7d: number;
    trend30d: number;
    assetCount: number;
    topPerformers: Array<{ player: string; roi: number; roiPercent: number }>;
    underPerformers: Array<{ player: string; roi: number; roiPercent: number }>;
}

export const AggregationService = {
    /**
     * Calculates comprehensive portfolio metrics based on current inventory and price history.
     */
    calculatePortfolioMetrics(inventory: CardInventory[]): PortfolioMetrics {
        if (!inventory || inventory.length === 0) {
            return {
                totalValue: 0,
                totalCostBasis: 0,
                totalROI: 0,
                totalROIPercent: 0,
                trend7d: 0,
                trend30d: 0,
                assetCount: 0,
                topPerformers: [],
                underPerformers: []
            };
        }

        const metrics = inventory.reduce((acc, card) => {
            const cost = card.purchasePrice + (card.gradingFees || 0) + (card.shippingFees || 0);
            const current = card.currentValue || 0;

            acc.totalValue += current;
            acc.totalCostBasis += cost;
            acc.assetCount += 1;

            return acc;
        }, { totalValue: 0, totalCostBasis: 0, assetCount: 0 });

        const totalROI = metrics.totalValue - metrics.totalCostBasis;
        const totalROIPercent = metrics.totalCostBasis > 0
            ? (totalROI / metrics.totalCostBasis) * 100
            : 0;

        // Calculate trends (comparing current value vs snapshots from history)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        let value7d = 0;
        let value30d = 0;

        inventory.forEach(card => {
            const history = getCardHistory(card.id);
            if (history.length === 0) {
                // If no history, assume purchase price or current value as baseline
                value7d += card.currentValue || 0;
                value30d += card.currentValue || 0;
                return;
            }

            // Find snapshots closest to the target dates
            const snap7d = history.find(s => new Date(s.timestamp) <= sevenDaysAgo) || history[history.length - 1];
            const snap30d = history.find(s => new Date(s.timestamp) <= thirtyDaysAgo) || history[history.length - 1];

            value7d += snap7d.value;
            value30d += snap30d.value;
        });

        const trend7d = value7d > 0 ? ((metrics.totalValue - value7d) / value7d) * 100 : 0;
        const trend30d = value30d > 0 ? ((metrics.totalValue - value30d) / value30d) * 100 : 0;

        // Identify Top/Under Performers
        const individualPerformance = inventory.map(card => {
            const cost = card.purchasePrice + (card.gradingFees || 0) + (card.shippingFees || 0);
            const current = card.currentValue || 0;
            const roi = current - cost;
            const roiPercent = cost > 0 ? (roi / cost) * 100 : 0;
            return {
                player: card.player,
                roi,
                roiPercent
            };
        });

        const sorted = [...individualPerformance].sort((a, b) => b.roiPercent - a.roiPercent);
        const topPerformers = sorted.slice(0, 3);
        const underPerformers = sorted.reverse().slice(0, 3);

        return {
            ...metrics,
            totalROI,
            totalROIPercent,
            trend7d,
            trend30d,
            topPerformers,
            underPerformers
        };
    },

    /**
     * Gets comparison data between current value and a past timeframe.
     */
    getComparisonMetrics(inventory: CardInventory[], timeframe: '7d' | '30d' | '6m' | '1y'): {
        pastValue: number;
        currentValue: number;
        delta: number;
        deltaPercent: number;
    } {
        const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
        const now = new Date();
        let pastDate: Date;

        switch (timeframe) {
            case '7d': pastDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); break;
            case '30d': pastDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); break;
            case '6m':
                pastDate = new Date();
                pastDate.setMonth(now.getMonth() - 6);
                break;
            case '1y':
                pastDate = new Date();
                pastDate.setFullYear(now.getFullYear() - 1);
                break;
            default: pastDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        }

        const pastDateStr = pastDate.toISOString().split('T')[0];
        let pastTotalValue = 0;

        inventory.forEach(card => {
            const history = getCardHistory(card.id);
            const snapshot = history.find(s => s.timestamp.split('T')[0] <= pastDateStr);
            pastTotalValue += snapshot ? snapshot.value : (card.purchasePrice || 0);
        });

        const delta = totalValue - pastTotalValue;
        const deltaPercent = pastTotalValue > 0 ? (delta / pastTotalValue) * 100 : 0;

        return {
            pastValue: pastTotalValue,
            currentValue: totalValue,
            delta,
            deltaPercent
        };
    },

    /**
     * Aggregates price movement across the entire portfolio for chart visualization.
     * Groups by day and sums current values.
     */
    getAggregatedTrendData(inventory: CardInventory[], days: number = 30): { date: string; value: number }[] {
        if (!inventory || inventory.length === 0) return [];

        const now = new Date();
        const data: { date: string; value: number }[] = [];

        // Pre-fetch all histories to avoid redundant localStorage hits
        const histories = inventory.reduce((acc, card) => {
            acc[card.id] = getCardHistory(card.id);
            return acc;
        }, {} as Record<string, PriceSnapshot[]>);

        for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = date.toISOString().split('T')[0];

            let dailyTotal = 0;

            inventory.forEach(card => {
                const history = histories[card.id] || [];
                // Since history is [newest...oldest], find() gets the latest one before/on dateStr
                const relevantSnapshot = history.find(s => s.timestamp.split('T')[0] <= dateStr);

                if (relevantSnapshot) {
                    dailyTotal += relevantSnapshot.value;
                } else {
                    // Fallback to purchase price if no history yet
                    dailyTotal += card.purchasePrice || 0;
                }
            });

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: Math.round(dailyTotal)
            });
        }

        return data;
    },

    /**
     * Comparison against market benchmarks
     */
    getBenchmarkComparison(inventory: CardInventory[]) {
        const portfolioMetrics = this.calculatePortfolioMetrics(inventory);
        const roi = portfolioMetrics.totalROIPercent;

        return [
            { name: 'Your Portfolio', value: roi, color: '#D9F99D', description: 'Institutional blend of sports assets' },
            { name: 'S&P 500', value: 12.4, color: '#94A3B8', description: 'Broad market equity benchmark (30d)' },
            { name: 'Gold', value: 4.2, color: '#FCD34D', description: 'Global safe-haven commodity' },
            { name: 'Card Ladder 50', value: -2.1, color: '#F87171', description: 'Top 50 most liquid cards index' },
            { name: 'MSI Alpha Index', value: 18.2, color: '#60A5FA', description: 'Proprietary high-conviction signals' }
        ].sort((a, b) => b.value - a.value);
    }
};
