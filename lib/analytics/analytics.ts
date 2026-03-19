
import { CardInventory } from '../../types.ts';
import { getRarityTier } from '../utils/rarity.ts';
import { generatePopData } from './scarcityService.ts';

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
 * Enriches card with scarcity data for Alpha Score if missing.
 */
function withScarcity(card: CardInventory): CardInventory & { popCount: number; scarcityIndex: number } {
    if (card.scarcityIndex !== undefined) {
        return card as CardInventory & { popCount: number; scarcityIndex: number };
    }
    const pop = generatePopData(card);
    return { ...card, ...pop };
}

/**
 * Calculates a 0-100 Alpha Score based on portfolio stats.
 * Phase 13: Scarcity-weighted with Pop 1 premium.
 */
export function calculateAlphaScore(inventory: CardInventory[]): number {
    if (inventory.length === 0) return 0;

    // 1. Scarcity Component (40 pts) — Pop 1 gets 1.5x weight
    let scarcityScore = 0;
    inventory.forEach(card => {
        const enriched = withScarcity(card);
        let weight: number;

        // Dynamic weighting based on Scarcity Index
        weight = (enriched.scarcityIndex || 10) / 100;

        // Apex Scarcity Bonus
        if (enriched.popCount === 1) weight *= 2.0;
        else if (enriched.popCount < 50) weight *= 1.5;

        scarcityScore += weight;
    });
    // Scale scarcity (max 40 pts)
    const normalizedScarcity = Math.min((scarcityScore / 2) * 40, 40);

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

    // Momentum — average gain % across cards with both purchase and current value
    const cardsWithDelta = inventory.filter(c => c.currentValue && c.purchasePrice > 0);
    let momentumVal: number;
    if (cardsWithDelta.length > 0) {
        const avgGainPct = cardsWithDelta.reduce((sum, c) => {
            return sum + ((c.currentValue! - c.purchasePrice) / c.purchasePrice) * 100;
        }, 0) / cardsWithDelta.length;
        // Map [-50%, +100%] gain range → [0, 100] momentum score
        momentumVal = Math.min(Math.max(((avgGainPct + 50) / 150) * 100, 0), 100);
    } else {
        momentumVal = 40; // neutral default when no delta data is available
    }

    return [
        { subject: 'Scarcity', A: Math.round(scarcityVal), fullMark: 100 },
        { subject: 'Value', A: Math.round(valueVal), fullMark: 100 },
        { subject: 'Diversity', A: Math.round(diversityVal), fullMark: 100 },
        { subject: 'Momentum', A: Math.round(momentumVal), fullMark: 100 },
        { subject: 'Volume', A: Math.round(volumeVal), fullMark: 100 }
    ];
}
