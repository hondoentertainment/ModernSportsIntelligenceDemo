
import { TargetWatchlist, CardInventory, Alert } from '../types.ts';

export interface Signal {
    id: string;
    type: 'buy' | 'sell' | 'scarcity';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    targetId?: string;
}

/**
 * Detects trade signals based on current market data vs. user targets.
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

    // 2. Sell Signals (Simulated take-profit opportunities for now)
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

    return signals;
}
