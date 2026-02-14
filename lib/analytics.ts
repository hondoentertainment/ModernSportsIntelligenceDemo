
import { CardInventory } from '../types.ts';
import { getRarityTier } from './rarity.ts';

export interface CollectorTier {
    title: string;
    icon: string;
    description: string;
    color: string;
    minScore: number;
}

export interface DNAPoint {
    subject: string;
    A: number;
    fullMark: number;
}

export const TIERS: CollectorTier[] = [
    { title: 'Whale', icon: '🐋', description: 'Elite institutional-grade portfolio.', color: '#D9F99D', minScore: 81 },
    { title: 'Shark', icon: '🦈', description: 'Aggressive value capture dominant.', color: '#22C55E', minScore: 61 },
    { title: 'Collector', icon: '📦', description: 'Balanced and diversified archive.', color: '#10B981', minScore: 41 },
    { title: 'Prospector', icon: '⛏️', description: 'Focused on growth and breakouts.', color: '#34D399', minScore: 21 },
    { title: 'Scout', icon: '🔭', description: 'Initial portfolio calibration phase.', color: '#94A3B8', minScore: 0 }
];

/**
 * Calculates a 0-100 Alpha Score based on portfolio stats.
 */
export function calculateAlphaScore(inventory: CardInventory[]): number {
    if (inventory.length === 0) return 0;

    // 1. Scarcity Component (40 pts)
    const tierWeights: Record<string, number> = {
        'One-of-One': 1.0,
        'Grail': 0.8,
        'Ultra Rare': 0.6,
        'Rare': 0.3,
        'Uncommon': 0.1,
        'Common': 0.05
    };

    let scarcityScore = 0;
    inventory.forEach(card => {
        // Use Scarcity Index if available (new logic), otherwise fallback to Rarity Tier (legacy)
        if (card.scarcityIndex !== undefined) {
            // 0-100 scale, normalized to contribution
            scarcityScore += (card.scarcityIndex / 100);
        } else {
            const tier = getRarityTier(card);
            scarcityScore += (tierWeights[tier] || 0.05);
        }
    });
    // Normalize sparsity (max 10 cards worth of weight)
    const normalizedScarcity = Math.min((scarcityScore / 5) * 40, 40);

    // 2. Value Density Component (30 pts)
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice), 0);
    const avgValue = totalValue / inventory.length;
    // Avg value of $5,000+ gets max points
    const normalizedValue = Math.min((avgValue / 5000) * 30, 30);

    // 3. Diversification Component (30 pts)
    const leagues = new Set(inventory.map(c => c.league)).size;
    const sports = new Set(inventory.map(c => c.sport)).size;
    const divFactor = (leagues * 4) + (sports * 2);
    const normalizedDiv = Math.min((divFactor / 20) * 20, 20);

    // 4. Realized Alpha Component (10 pts)
    const realizedProfit = inventory.filter(c => c.status === 'sold').reduce((sum, c) => sum + ((c.salePrice || 0) - (c.purchasePrice || 0)), 0);
    const realizedAlpha = Math.min(Math.max(realizedProfit / 1000, 0) * 10, 10);

    return Math.round(normalizedScarcity + normalizedValue + normalizedDiv + realizedAlpha);
}

/**
 * Returns tier metadata based on score.
 */
export function getCollectorTier(score: number): CollectorTier {
    return TIERS.find(t => score >= t.minScore) || TIERS[TIERS.length - 1];
}

/**
 * Generates Radar Chart data for Portfolio DNA.
 */
export function getPortfolioDNA(inventory: CardInventory[]): DNAPoint[] {
    if (inventory.length === 0) {
        return [
            { subject: 'Scarcity', A: 20, fullMark: 100 },
            { subject: 'Value', A: 20, fullMark: 100 },
            { subject: 'Diversity', A: 20, fullMark: 100 },
            { subject: 'Momentum', A: 20, fullMark: 100 },
            { subject: 'Volume', A: 20, fullMark: 100 }
        ];
    }

    // Scarcity Calc
    const rarities = inventory.map(c => getRarityTier(c));
    const rareCount = rarities.filter(r => ['One-of-One', 'Grail', 'Ultra Rare'].includes(r)).length;
    const scarcityVal = Math.min((rareCount / Math.max(inventory.length * 0.2, 1)) * 100, 100);

    // Value Calc (Density)
    const avgVal = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0) / inventory.length;
    const valueVal = Math.min((avgVal / 2000) * 100, 100);

    // Diversity Calc
    const leagues = new Set(inventory.map(c => c.league)).size;
    const diversityVal = Math.min((leagues / 5) * 100, 100);

    // Volume Calc (Asset Count)
    const volumeVal = Math.min((inventory.length / 50) * 100, 100);

    // Momentum (Randomized for now, until Phase 1 deltas are more pervasive)
    const momentumVal = 40 + Math.random() * 40;

    return [
        { subject: 'Scarcity', A: Math.round(scarcityVal), fullMark: 100 },
        { subject: 'Value', A: Math.round(valueVal), fullMark: 100 },
        { subject: 'Diversity', A: Math.round(diversityVal), fullMark: 100 },
        { subject: 'Momentum', A: Math.round(momentumVal), fullMark: 100 },
        { subject: 'Volume', A: Math.round(volumeVal), fullMark: 100 }
    ];
}
