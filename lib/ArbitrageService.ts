import { CardInventory, TargetWatchlist } from '../types';
import { getCardHistory, PriceSnapshot } from './priceHistory';
import { LiquidityService } from './liquidityService';

export interface ArbitrageSignal {
    id: string;
    assetId: string;
    assetName: string;
    type: 'Flash Sale' | 'Undervalued' | 'Overvalued';
    score: number; // 0-100
    delta: number; // Percentage deviation
    confidence: 'High' | 'Medium' | 'Low';
    actionUrl?: string;
}

export class ArbitrageService {
    /**
     * Calculates the opportunity score and arbitrage delta for an asset.
     * Compares the current value to a 90-day rolling average to find deviations.
     * Flash Sales (steep dips in < 24h) significantly boost the score.
     */
    static evaluateOpportunity(asset: CardInventory | TargetWatchlist): { score: number; delta: number } {
        const history = getCardHistory(asset.id);
        const currentValue = 'cardDescription' in asset ? asset.currentMarketPrice : asset.currentValue;

        // Fallback if no history or current value is set
        if (!history || history.length < 2 || !currentValue) {
            return { score: 50, delta: 0 };
        }

        // 1. Calculate Historical Mean (e.g., last 30 snapshots, approx 90 days)
        const thirtySnapshots = history.slice(0, 30);
        const sum = thirtySnapshots.reduce((acc, snap) => acc + snap.value, 0);
        const mean = sum / thirtySnapshots.length;

        // 2. Calculate Deviation (Delta)
        // Negative delta = Undervalued (priced below mean)
        // Positive delta = Overvalued (priced above mean)
        const delta = ((currentValue - mean) / mean) * 100;

        // 3. Flash Sale Detection
        // Did it drop more than 15% since the last recorded snapshot?
        const previousSnapshot = history[0]; // Assuming history is ordered newest first or we just look at the most recent past point
        // We should make sure we are comparing current against the strict 'last' snapshot in history.
        let flashSaleMultiplier = 1;
        if (previousSnapshot) {
            const shortTermDrop = ((currentValue - previousSnapshot.value) / previousSnapshot.value) * 100;
            if (shortTermDrop <= -15) {
                flashSaleMultiplier = 1.5; // Significant boost for sudden dips
            }
        }

        // 4. Base Score Calculation
        // Base 50. Undervalued adds to score. Overvalued subtracts.
        let score = 50 + (delta * -2); // E.g., -10% delta adds 20 points -> 70.

        // 5. Liquidity Modifier (Phase 20 Integration)
        // If it's a CardInventory, we can use the LiquidityService. 
        // If it's a TargetWatchlist, we might spoof or calculate it if standard fields exist.
        let liquidity = 50;
        if ('year' in asset) { // Simple check if it's CardInventory
            liquidity = asset.liquidityScore || LiquidityService.calculateLiquidityScore(asset as CardInventory);
        }

        // High liquidity = higher confidence in the arbitrage gap closing.
        // Low liquidity = lower confidence (might just be a stale comp).
        if (liquidity > 75) score += 10;
        else if (liquidity < 30) score -= 15;

        // Apply Flash Sale multiplier
        score *= flashSaleMultiplier;

        return {
            score: Math.max(0, Math.min(100, Math.round(score))),
            delta: Math.round(delta * 10) / 10
        };
    }

    /**
     * Scans a list of assets and returns actionable arbitrage signals.
     */
    static getArbitrageSignals(inventory: CardInventory[], targets: TargetWatchlist[]): ArbitrageSignal[] {
        const signals: ArbitrageSignal[] = [];

        // Analyze Targets First (Acquisition Opportunities)
        targets.filter(t => t.status === 'active').forEach(target => {
            const { score, delta } = this.evaluateOpportunity(target);

            if (score >= 80) {
                signals.push({
                    id: `arb-target-${target.id}`,
                    assetId: target.id,
                    assetName: target.player || target.cardDescription,
                    type: delta <= -15 ? 'Flash Sale' : 'Undervalued',
                    score,
                    delta,
                    confidence: 'High',
                    actionUrl: target.searchUrl
                });
            }
        });

        // Analyze Inventory (Rebalancing/Exit Opportunities)
        // Overvalued assets (low score, high positive delta)
        inventory.filter(c => c.status !== 'sold').forEach(card => {
            const { score, delta } = this.evaluateOpportunity(card);

            if (score <= 30 && delta > 20) {
                signals.push({
                    id: `arb-inv-${card.id}`,
                    assetId: card.id,
                    assetName: `${card.year} ${card.player}`,
                    type: 'Overvalued',
                    score,
                    delta,
                    confidence: 'Medium'
                });
            }
        });

        return signals.sort((a, b) => b.score - a.score);
    }
}
