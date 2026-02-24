import { CardInventory, ExitPlan } from '../types';
import { generatePopData } from './scarcityService';

export class LiquidityService {
    /**
     * Institutional-grade liquidity scoring model.
     * Score (0-100) based on market demand, scarcity, and player prominence.
     */
    static calculateLiquidityScore(card: CardInventory): number {
        // Base score starts at a moderate level
        let score = 50;

        // 1. Player/Sport Profile Impact
        // High-volume sports/leagues get naturally higher liquidity
        if (card.league === 'MLB' || card.league === 'NBA' || card.league === 'NFL') score += 15;
        if (card.league === 'MiLB') score -= 10; // Prospects have lower instant liquidity

        // 2. Scarcity Impact (The "Liquidity Paradox")
        // High scarcity = Low liquidity (fewer buyers/sellers), but higher premium
        // Low scarcity = High liquidity (easily traded), but lower premium
        const popData = card.popReport || generatePopData(card);
        const pop = (popData as any).popAtGrade || (popData as any).popCount || 0;

        if (pop > 1000) score += 20; // Mass market cards are highly liquid
        else if (pop > 100) score += 10;
        else if (pop < 10) score -= 20; // Pop < 10 is illiquid (specialist market)
        else if (pop === 1) score -= 35; // Pop 1 is highly illiquid (requires private sale)

        // 3. Grade/Condition Impact
        if (card.isGraded) {
            if (card.grade === '10' || card.grade === 'Gem Mint') score += 10;
            if (card.gradingCompany === 'PSA') score += 5; // PSA is the most liquid slab
        } else {
            score -= 15; // Raw cards have variable liquidity due to condition risk
        }

        // 4. Value Bracket Impact
        const val = card.currentValue || card.purchasePrice || 0;
        if (val > 10000) score -= 20; // "Whale" assets have narrow liquid exit paths
        else if (val < 100) score += 10; // Entry-level assets trade rapidly

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Logic for recommending an exit strategy based on portfolio health and market depth.
     */
    static generateExitRecommendation(card: CardInventory): Partial<ExitPlan> {
        const score = this.calculateLiquidityScore(card);
        const val = card.currentValue || card.purchasePrice || 0;
        const purchasePrice = card.purchasePrice || 0;
        const roi = val > 0 && purchasePrice > 0 ? ((val - purchasePrice) / purchasePrice) * 100 : 0;

        // Illiquid assets (low score) benefit from "Institutional Hold" or "Take Profit" with patience
        if (score < 40) {
            return {
                targetPrice: Math.round(val * 1.5),
                timeframe: 'Long (1-3y)',
                strategy: 'Institutional Hold',
                notes: 'Low liquidity requires specialized auction placement for maximum ROI.'
            };
        }

        // High ROI assets reach "Take Profit" thresholds faster
        if (roi > 50) {
            return {
                targetPrice: Math.round(val * 1.1),
                timeframe: 'Short (3m)',
                strategy: 'Take Profit',
                notes: 'High ROI and strong liquidity suggest locking in gains now.'
            };
        }

        return {
            targetPrice: Math.round(val * 1.25),
            timeframe: 'Medium (6-12m)',
            strategy: 'Take Profit',
            notes: 'Steady market depth; targeting mid-range appreciation.'
        };
    }
}
