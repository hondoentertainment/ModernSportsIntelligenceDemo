
import { TargetWatchlist, CardInventory } from '../../types.ts';
import { generatePopData } from '../analytics/scarcityService.ts';

export interface Signal {
    id: string;
    type: 'buy' | 'sell' | 'scarcity';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    targetId?: string;
}

/**
 * Enriches a card with scarcity data if missing (for Alpha Score and signals).
 */
function withScarcity(card: CardInventory): CardInventory & { popCount: number; popHigher: number; scarcityIndex: number } {
    if (card.popCount !== undefined && card.scarcityIndex !== undefined) {
        return card as CardInventory & { popCount: number; popHigher: number; scarcityIndex: number };
    }
    const pop = generatePopData(card);
    return { ...card, ...pop };
}

/**
 * Detects trade signals based on current market data vs. user targets.
 * Includes Pop 1 / low-pop scarcity alerts.
 */
export function detectSignals(watchlist: TargetWatchlist[], inventory: CardInventory[]): Signal[] {
    const signals: Signal[] = [];

    // 1. Buy Opportunities (Target Price breaches)
    watchlist.forEach(item => {
        if (item.status === 'active' && item.currentMarketPrice && item.currentMarketPrice <= item.targetPrice) {
            const discount = ((item.targetPrice - item.currentMarketPrice) / item.targetPrice) * 100;
            signals.push({
                id: `signal-buy-${item.id}`,
                type: 'buy',
                title: 'Target Price Breached',
                description: `${item.player} is trading at $${item.currentMarketPrice.toLocaleString()}, which is ${Math.round(discount)}% below your target of $${item.targetPrice.toLocaleString()}.`,
                impact: item.priority === 'High' ? 'high' : 'medium',
                targetId: item.id
            });
        }
    });

    // 2. Sell Signals (Simulated take-profit opportunities)
    inventory.forEach(card => {
        if (card.currentValue && card.purchasePrice && card.currentValue > (card.purchasePrice * 1.5)) {
            const gain = ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100;
            signals.push({
                id: `signal-sell-${card.id}`,
                type: 'sell',
                title: 'High ROI Alert',
                description: `${card.player} (${card.year}) has reached a +${Math.round(gain)}% ROI. Consider locking in profits.`,
                impact: gain > 100 ? 'high' : 'low',
                targetId: card.id
            });
        }
    });

    // 3. Scarcity Signals: Pop 1 and low-pop alerts (Phase 13)
    inventory.forEach(card => {
        const enriched = withScarcity(card);
        if (enriched.popCount === 1) {
            signals.push({
                id: `signal-scarcity-pop1-${card.id}`,
                type: 'scarcity',
                title: 'Pop 1 Alert',
                description: `${card.player} (${card.year} ${card.set}) is a Pop 1 — none higher. Ultra-rare scarcity premium.`,
                impact: 'high',
                targetId: card.id
            });
        } else if (enriched.popCount <= 5 && enriched.scarcityIndex >= 85) {
            signals.push({
                id: `signal-scarcity-lowpop-${card.id}`,
                type: 'scarcity',
                title: 'Low Population',
                description: `${card.player} (${card.year}) has Pop ${enriched.popCount} — scarcity index ${enriched.scarcityIndex}.`,
                impact: 'medium',
                targetId: card.id
            });
        }
    });

    return signals;
}
