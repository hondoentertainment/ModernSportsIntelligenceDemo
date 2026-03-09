import { CardInventory, Sport } from '../types';
import { getCardHistory } from './priceHistory';

export interface CorrelationPoint {
    sportA: Sport;
    sportB: Sport;
    correlation: number; // -1 to 1
}

export interface HedgeRecommendation {
    id: string;
    type: 'Concentration' | 'Seasonal' | 'Diversification' | 'Momentum' | 'Volatility';
    impact: 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    action: string;
}

export interface HedgeNode {
    id: string;
    type: 'rebalance' | 'rotate' | 'hedge' | 'trim';
    fromSport: Sport;
    toSport: Sport;
    allocationPercent: number;
    rationale: string;
    expectedImpact: number; // diversification score change
    status: 'proposed' | 'deployed' | 'expired';
    deployedAt?: string;
    expiresAt?: string;
}

export interface HedgeSimulation {
    currentScore: number;
    projectedScore: number;
    nodes: HedgeNode[];
    portfolioRisk: 'Critical' | 'Elevated' | 'Moderate' | 'Low' | 'Minimal';
    rebalanceUrgency: number; // 0-100
    seasonalOutlook: string;
    concentrationBreakdown: { sport: Sport; weight: number; value: number; risk: 'High' | 'Medium' | 'Low' }[];
    correlationInsights: string[];
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

    /**
     * Enhanced correlation using price history data when available.
     */
    static calculateEnhancedCorrelation(inventory: CardInventory[]): CorrelationPoint[] {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        const sports = Array.from(new Set(activeCards.map(c => c.sport))) as Sport[];
        const matrix: CorrelationPoint[] = [];

        // Build per-sport price trend arrays from history
        const sportTrends: Record<string, number[]> = {};
        sports.forEach(sport => {
            const sportCards = activeCards.filter(c => c.sport === sport);
            const trends: number[] = [];
            sportCards.forEach(card => {
                const history = getCardHistory(card.id);
                if (history.length >= 2) {
                    const recent = history.slice(-7);
                    recent.forEach((h, i) => {
                        if (i > 0) {
                            trends.push((h.value - recent[i - 1].value) / recent[i - 1].value);
                        }
                    });
                } else {
                    // Simulate daily returns from value/cost
                    const base = card.currentValue || card.purchasePrice || 100;
                    const cost = card.purchasePrice || base;
                    const dailyReturn = Math.pow(base / cost, 1 / 30) - 1;
                    for (let i = 0; i < 6; i++) {
                        trends.push(dailyReturn + (Math.sin(card.id.charCodeAt(0) + i) * 0.01));
                    }
                }
            });
            sportTrends[sport] = trends;
        });

        sports.forEach(sportA => {
            sports.forEach(sportB => {
                if (sportA === sportB) {
                    matrix.push({ sportA, sportB, correlation: 1 });
                    return;
                }
                const trendsA = sportTrends[sportA] || [];
                const trendsB = sportTrends[sportB] || [];
                let correlation: number;
                if (trendsA.length >= 3 && trendsB.length >= 3) {
                    correlation = this.pearsonCorrelation(trendsA, trendsB);
                } else {
                    correlation = this.getHeuristicCorrelation(sportA, sportB);
                }
                matrix.push({ sportA, sportB, correlation });
            });
        });

        return matrix;
    }

    /**
     * Pearson correlation coefficient between two arrays.
     */
    private static pearsonCorrelation(a: number[], b: number[]): number {
        const n = Math.min(a.length, b.length);
        if (n < 2) return 0;
        const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
        const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
        let num = 0, denA = 0, denB = 0;
        for (let i = 0; i < n; i++) {
            const dA = a[i] - meanA;
            const dB = b[i] - meanB;
            num += dA * dB;
            denA += dA * dA;
            denB += dB * dB;
        }
        const den = Math.sqrt(denA * denB);
        if (den === 0) return 0;
        return Math.max(-1, Math.min(1, num / den));
    }

    /**
     * Generates a full hedge simulation with proposed rebalancing nodes.
     */
    static generateHedgeSimulation(inventory: CardInventory[]): HedgeSimulation {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        const totalValue = activeCards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
        const currentScore = this.calculateDiversificationScore(inventory);
        const matrix = this.calculateEnhancedCorrelation(inventory);

        // Build concentration breakdown
        const sportGroups: Record<string, CardInventory[]> = {};
        activeCards.forEach(c => {
            if (!sportGroups[c.sport]) sportGroups[c.sport] = [];
            sportGroups[c.sport].push(c);
        });

        const concentrationBreakdown = Object.entries(sportGroups).map(([sport, cards]) => {
            const value = cards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
            const weight = totalValue > 0 ? value / totalValue : 0;
            return {
                sport: sport as Sport,
                weight,
                value,
                risk: weight > 0.6 ? 'High' as const : weight > 0.35 ? 'Medium' as const : 'Low' as const,
            };
        }).sort((a, b) => b.weight - a.weight);

        // Generate hedge nodes
        const nodes: HedgeNode[] = [];
        const overweightSports = concentrationBreakdown.filter(c => c.weight > 0.4);
        const underweightSports = concentrationBreakdown.filter(c => c.weight < 0.2);
        const allSports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
        const missingSports = allSports.filter(s => !concentrationBreakdown.find(c => c.sport === s));

        // Propose rebalance nodes for overweight sports
        overweightSports.forEach(ow => {
            const targetWeight = 0.3;
            const trimPercent = Math.round((ow.weight - targetWeight) * 100);

            // Find lowest correlated sport to rotate into
            const correlations = matrix.filter(p => p.sportA === ow.sport && p.sportB !== ow.sport);
            correlations.sort((a, b) => a.correlation - b.correlation);
            const bestTarget = correlations[0]?.sportB || (missingSports[0] ?? 'Hockey');

            nodes.push({
                id: `hedge-node-${nodes.length + 1}`,
                type: 'rotate',
                fromSport: ow.sport,
                toSport: bestTarget as Sport,
                allocationPercent: trimPercent,
                rationale: `${ow.sport} is ${Math.round(ow.weight * 100)}% of portfolio (target: 30%). Rotate ${trimPercent}% to ${bestTarget} (correlation: ${correlations[0]?.correlation.toFixed(2) || '0.10'}).`,
                expectedImpact: Math.min(25, trimPercent),
                status: 'proposed',
            });

            if (ow.weight > 0.6) {
                nodes.push({
                    id: `hedge-node-${nodes.length + 1}`,
                    type: 'trim',
                    fromSport: ow.sport,
                    toSport: ow.sport,
                    allocationPercent: Math.round((ow.weight - 0.5) * 100),
                    rationale: `Critical concentration: ${Math.round(ow.weight * 100)}% in ${ow.sport}. Trim weakest performers to reduce single-sport exposure.`,
                    expectedImpact: 15,
                    status: 'proposed',
                });
            }
        });

        // Propose diversification into missing sports
        missingSports.slice(0, 2).forEach(sport => {
            const source = concentrationBreakdown[0]?.sport || 'Baseball';
            nodes.push({
                id: `hedge-node-${nodes.length + 1}`,
                type: 'hedge',
                fromSport: source,
                toSport: sport,
                allocationPercent: 10,
                rationale: `No ${sport} exposure detected. Adding 10% allocation creates cross-ecosystem hedge against ${source} corrections.`,
                expectedImpact: 12,
                status: 'proposed',
            });
        });

        // Seasonal rotation node
        const month = new Date().getMonth();
        const seasonalSport = month >= 2 && month <= 9 ? 'Baseball' : month >= 8 && month <= 1 ? 'Football' : 'Basketball';
        const seasonalWeight = concentrationBreakdown.find(c => c.sport === seasonalSport)?.weight || 0;
        if (seasonalWeight > 0.3) {
            const offSeasonTarget = seasonalSport === 'Baseball' ? 'Basketball' : seasonalSport === 'Football' ? 'Baseball' : 'Football';
            nodes.push({
                id: `hedge-node-${nodes.length + 1}`,
                type: 'rebalance',
                fromSport: seasonalSport as Sport,
                toSport: offSeasonTarget as Sport,
                allocationPercent: 15,
                rationale: `${seasonalSport} approaching peak season pricing. Rotate 15% to ${offSeasonTarget} for counter-cyclical positioning.`,
                expectedImpact: 8,
                status: 'proposed',
            });
        }

        // Calculate projected score
        const projectedImprovement = nodes.reduce((sum, n) => sum + n.expectedImpact, 0);
        const projectedScore = Math.min(100, currentScore + Math.round(projectedImprovement * 0.6));

        // Portfolio risk level
        const portfolioRisk = currentScore >= 80 ? 'Minimal' as const
            : currentScore >= 60 ? 'Low' as const
            : currentScore >= 40 ? 'Moderate' as const
            : currentScore >= 20 ? 'Elevated' as const
            : 'Critical' as const;

        // Rebalance urgency (higher = more urgent)
        const rebalanceUrgency = Math.min(100, Math.max(0, 100 - currentScore + (overweightSports.length * 15)));

        // Seasonal outlook
        const seasonMap: Record<number, string> = {
            0: 'Winter accumulation window. Football postseason driving NFL premiums.',
            1: 'Pre-spring training. Baseball values bottoming — prime entry.',
            2: 'Spring training hype cycle. Baseball momentum building.',
            3: 'NBA playoffs approaching. Basketball card liquidity peaking.',
            4: 'NFL draft catalyst. Rookie card speculation at maximum.',
            5: 'MLB season in full swing. Performance-driven repricing active.',
            6: 'Summer lull. Cross-sport accumulation opportunity.',
            7: 'Football training camps. NFL preseason buzz increasing.',
            8: 'NFL regular season begins. Football cards at seasonal peak.',
            9: 'MLB postseason. October baseball premiums in effect.',
            10: 'NBA regular season. Basketball momentum building.',
            11: 'Holiday buying season. Elevated retail demand across all sports.',
        };
        const seasonalOutlook = seasonMap[month] || 'Standard market conditions.';

        // Correlation insights
        const correlationInsights: string[] = [];
        const highCorr = matrix.filter(p => p.sportA !== p.sportB && p.correlation > 0.35);
        const lowCorr = matrix.filter(p => p.sportA !== p.sportB && p.correlation < 0.15 && p.correlation > -1);

        if (highCorr.length > 0) {
            const pair = highCorr[0];
            correlationInsights.push(`${pair.sportA} and ${pair.sportB} show high correlation (${pair.correlation.toFixed(2)}). Holding both provides limited downside protection.`);
        }
        if (lowCorr.length > 0) {
            const pair = lowCorr[0];
            correlationInsights.push(`${pair.sportA} and ${pair.sportB} have low correlation (${pair.correlation.toFixed(2)}). Ideal hedge pairing for portfolio stability.`);
        }
        if (currentScore < 40) {
            correlationInsights.push('Portfolio concentration exceeds institutional thresholds. Immediate rebalancing recommended.');
        }
        if (missingSports.length >= 3) {
            correlationInsights.push(`${missingSports.length} sport ecosystems have zero allocation. Significant diversification runway available.`);
        }

        return {
            currentScore,
            projectedScore,
            nodes,
            portfolioRisk,
            rebalanceUrgency,
            seasonalOutlook,
            concentrationBreakdown,
            correlationInsights,
        };
    }

    /**
     * Deploys a hedge node (persists to localStorage).
     */
    static deployHedgeNode(nodeId: string): void {
        const history = this.getDeployedHedges();
        const now = new Date();
        const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 day expiry
        history.push({
            nodeId,
            deployedAt: now.toISOString(),
            expiresAt: expires.toISOString(),
        });
        localStorage.setItem('msi_deployed_hedges', JSON.stringify(history));
    }

    static getDeployedHedges(): { nodeId: string; deployedAt: string; expiresAt: string }[] {
        try {
            const data = localStorage.getItem('msi_deployed_hedges');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static isNodeDeployed(nodeId: string): boolean {
        return this.getDeployedHedges().some(h => h.nodeId === nodeId);
    }

    private static getHeuristicCorrelation(a: Sport, b: Sport): number {
        const pairs: Record<string, number> = {
            'Baseball-Football': 0.15,
            'Baseball-Basketball': 0.12,
            'Baseball-Hockey': 0.08,
            'Baseball-Soccer': 0.05,
            'Basketball-Football': 0.45,
            'Basketball-Hockey': 0.20,
            'Basketball-Soccer': 0.35,
            'Football-Hockey': 0.25,
            'Football-Soccer': 0.18,
            'Hockey-Soccer': 0.30,
        };

        const key = [a, b].sort().join('-');
        return pairs[key] || 0.1;
    }
}
