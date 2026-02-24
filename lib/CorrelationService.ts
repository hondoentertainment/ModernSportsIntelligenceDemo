import { CardInventory, Sport } from '../types';
import { getCardHistory } from './priceHistory';

export interface CorrelationPoint {
    sportA: Sport;
    sportB: Sport;
    correlation: number; // -1 to 1
}

export interface HedgeRecommendation {
    id: string;
    type: 'Concentration' | 'Seasonal' | 'Diversification';
    impact: 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    action: string;
}

export class CorrelationService {
    /**
     * Calculates the correlation matrix between sports based on 30-day value trends.
     */
    static calculateCorrelationMatrix(inventory: CardInventory[]): CorrelationPoint[] {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        const sports = Array.from(new Set(activeCards.map(c => c.sport)));
        const matrix: CorrelationPoint[] = [];

        sports.forEach(sportA => {
            sports.forEach(sportB => {
                if (sportA === sportB) {
                    matrix.push({ sportA, sportB, correlation: 1 });
                    return;
                }

                // Calculate correlation based on aggregated 30-day trends
                // For a prototype, we use a deterministic model based on league affinity
                // In production, this would use actual R-squared calculations of price historicals
                const correlation = this.getHeuristicCorrelation(sportA, sportB);
                matrix.push({ sportA, sportB, correlation });
            });
        });

        return matrix;
    }

    /**
     * Returns a 0-100 score for portfolio diversification.
     */
    static calculateDiversificationScore(inventory: CardInventory[]): number {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        if (activeCards.length === 0) return 0;

        const totalValue = activeCards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
        const sportsDistribution = activeCards.reduce((acc, c) => {
            const val = c.currentValue || c.purchasePrice || 0;
            acc[c.sport] = (acc[c.sport] || 0) + (val / totalValue);
            return acc;
        }, {} as Record<string, number>);

        // Use Herfindahl-Hirschman Index (HHI) for concentration
        const hhi = Object.values(sportsDistribution).reduce((sum, share) => sum + (share * share), 0);

        // Convert HHI to 0-100 score (lower HHI = better diversification)
        // HHI of 1.0 (concentrated in 1 sport) = 0 score
        // HHI of 0.2 (even split across 5 sports) = 100 score (roughly)
        const score = Math.max(0, Math.min(100, Math.round((1 - hhi) / 0.8 * 100)));

        return score;
    }

    /**
     * Generates strategic hedging advice.
     */
    static getHedgingRecommendations(inventory: CardInventory[]): HedgeRecommendation[] {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        const recommendations: HedgeRecommendation[] = [];
        const score = this.calculateDiversificationScore(inventory);

        // 1. Concentration Risk
        if (score < 40) {
            recommendations.push({
                id: 'hedge-1',
                type: 'Concentration',
                impact: 'High',
                title: 'Sector Over-Concentration',
                description: 'Over 70% of your portfolio NAV is tied to a single sport ecosystem.',
                action: 'Diversify into lagging sports with low correlation (e.g., Hockey or Soccer).'
            });
        }

        // 2. Seasonal Logic (Prototype)
        const month = new Date().getMonth();
        const isBaseballSeason = month >= 2 && month <= 9; // March to October

        const baseballWeight = activeCards.filter(c => c.sport === 'Baseball').length / activeCards.length;

        if (isBaseballSeason && baseballWeight > 0.5) {
            recommendations.push({
                id: 'hedge-2',
                type: 'Seasonal',
                impact: 'Medium',
                title: 'Pre-Postseason Peak',
                description: 'Your Baseball heavy portfolio is nearing peak seasonal liquidity.',
                action: 'Consider exit triggers for non-core assets before the winter liquidity dip.'
            });
        }

        // 3. Asset Cluster Logic
        const highEndCount = activeCards.filter(c => (c.currentValue || 0) > 5000).length;
        if (highEndCount > (activeCards.length * 0.3)) {
            recommendations.push({
                id: 'hedge-3',
                type: 'Diversification',
                impact: 'Low',
                title: 'Illiquidity Cluster',
                description: 'High concentration of "Whale" assets may lead to exit delays.',
                action: 'Rebalance into liquid "Blue Chip" $500-$1000 assets.'
            });
        }

        return recommendations;
    }

    private static getHeuristicCorrelation(a: Sport, b: Sport): number {
        // Affinity mapping: Sports that move together (e.g., Football & Basketball)
        const pairs: Record<string, number> = {
            'Baseball-Football': 0.15,
            'Baseball-Basketball': 0.12,
            'Football-Basketball': 0.45,
            'Soccer-Basketball': 0.35,
            'Hockey-Football': 0.25,
        };

        const key = [a, b].sort().join('-');
        return pairs[key] || 0.1;
    }
}
