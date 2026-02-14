import { CardInventory } from '../types.ts';

/**
 * Simulates a PSA/BGS Population Report based on card metadata.
 * In a real app, this would query an API like CardLadder or PSA.
 */
export function generatePopData(card: CardInventory): { popCount: number; popHigher: number; scarcityIndex: number } {
    // 1. Deterministic Seed based on card ID (mock consistent data)
    const seed = card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rand = (offset: number = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // 2. Base Pop Calculation
    // Modern cards (2020+) have high pops. Vintage (<1980) have low pops.
    const isModern = card.year >= 2000;
    const isUltraModern = card.year >= 2020;

    let basePop = isUltraModern ? 5000 : isModern ? 1000 : 200;

    // Adjust for Set Tier (heuristic)
    const lowerSet = card.set.toLowerCase();
    if (lowerSet.includes('prizm') || lowerSet.includes('chrome') || lowerSet.includes('optic')) {
        basePop *= 2; // High print run sets
    } else if (lowerSet.includes('nt') || lowerSet.includes('national treasures') || lowerSet.includes('flawless') || lowerSet.includes('dynasty')) {
        basePop *= 0.05; // Ultra high end
    }

    // Adjust for Grade (The "Gem Mint" Cliff)
    // PSA 10 is usually 20-50% of the total pop for modern, but <5% for vintage.
    const gradeVal = parseFloat(card.grade || '0');
    let gradeDistribution = 0.3; // Default 30% are this grade

    if (gradeVal === 10) {
        gradeDistribution = isUltraModern ? 0.4 : 0.1;
    } else if (gradeVal === 9) {
        gradeDistribution = 0.4;
    } else {
        gradeDistribution = 0.2;
    }

    // 3. Final Pop Count
    // Add some randomness so every card isn't identical
    const noise = rand(1) * 0.5 + 0.75; // 0.75 to 1.25 multiplier
    const popCount = Math.max(1, Math.round(basePop * gradeDistribution * noise));

    // 4. Pop Higher Calculation
    let popHigher = 0;
    if (gradeVal === 10) {
        popHigher = 0; // Nothing higher than a 10 (simplification for Black Labels etc)
    } else {
        // If it's a 9, the 10s are "higher"
        // If 30% are 9s and 40% are 10s, then Pop Higher is roughly (Pop9 / 0.3) * 0.4
        const estimatedTotalPop = popCount / gradeDistribution;
        const higherDistribution = gradeVal >= 9 ? 0.4 : 0.6; // Simplification
        popHigher = Math.round(estimatedTotalPop * higherDistribution * rand(2));
    }

    // Numbered cards override (e.g. /99)
    if (card.cardNumber.includes('/')) {
        const parts = card.cardNumber.split('/');
        const denominator = parseInt(parts[1]);
        if (!isNaN(denominator)) {
            // For numbered cards, pop is capped by print run
            // Pop count is usually denominator * 0.8 (grading rate) * gradeDistribution
            const gradedCount = Math.max(1, Math.round(denominator * 0.6)); // Assume 60% graded
            return {
                popCount: Math.max(1, Math.round(gradedCount * gradeDistribution)),
                popHigher: Math.max(0, Math.round(gradedCount * (gradeVal === 10 ? 0 : 0.2))),
                scarcityIndex: calculateScarcityIndex(Math.max(1, Math.round(gradedCount * gradeDistribution)), denominator)
            };
        }
    }

    return {
        popCount,
        popHigher,
        scarcityIndex: calculateScarcityIndex(popCount, popHigher)
    };
}

/**
 * Calculates a 0-100 Scarcity Index.
 * 100 = Pop 1 / None Higher (The Holy Grail)
 * 0 = Junk Wax Era Base Card
 */
export function calculateScarcityIndex(popCount: number, popHigher: number): number {
    // 1. Pop Higher Penalty (The most important factor)
    // If there are thousands better, this card isn't scarce relative to the market.
    const higherPenalty = Math.min(popHigher * 2, 50); // Max 50 pt penalty

    // 2. Pop Count Score (Logarithmic decay)
    // Pop 1 = 100 pts
    // Pop 10 = 80 pts
    // Pop 100 = 50 pts
    // Pop 1000 = 20 pts
    // Pop 10000 = 0 pts

    let baseScore = 0;
    if (popCount <= 1) baseScore = 100;
    else if (popCount <= 5) baseScore = 95;
    else if (popCount <= 10) baseScore = 90;
    else if (popCount <= 50) baseScore = 75;
    else if (popCount <= 100) baseScore = 60;
    else if (popCount <= 500) baseScore = 40;
    else if (popCount <= 1000) baseScore = 20;
    else baseScore = 10;

    // Combine
    const rawScore = baseScore - higherPenalty;
    return Math.max(0, Math.min(100, rawScore));
}
