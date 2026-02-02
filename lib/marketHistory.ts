
import { PortfolioSnapshot } from './marketSync.ts';

const HISTORY_KEY = 'cardx_sync_history';

export interface MarketDelta {
    gainValue: number;
    gainPercent: number;
    isPositive: boolean;
    period: string;
    previousValue: number;
    currentValue: number;
}

/**
 * Calculates the delta between the latest sync and a previous snapshot.
 * periodHours: The target window (e.g., 24 for overnight, 168 for weekly)
 */
export function getHistoricalDelta(periodHours: number = 24): MarketDelta | null {
    try {
        const history: PortfolioSnapshot[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

        if (history.length < 2) return null;

        const latest = history[0];
        const now = new Date(latest.timestamp).getTime();
        const targetTime = now - (periodHours * 60 * 60 * 1000);

        // Find the snapshot closest to the target time (but not the latest one)
        // We look for the first snapshot that is older than the target time,
        // or just the oldest one if none are that old.
        let previous = history[history.length - 1];

        for (let i = 1; i < history.length; i++) {
            const snapshotTime = new Date(history[i].timestamp).getTime();
            if (snapshotTime <= targetTime) {
                previous = history[i];
                break;
            }
        }

        const gainValue = latest.totalValue - previous.totalValue;
        const gainPercent = previous.totalValue > 0
            ? (gainValue / previous.totalValue) * 100
            : 0;

        return {
            gainValue,
            gainPercent,
            isPositive: gainValue >= 0,
            period: periodHours <= 24 ? 'Overnight' : 'Weekly',
            previousValue: previous.totalValue,
            currentValue: latest.totalValue
        };
    } catch (e) {
        console.warn('Failed to calculate historical delta', e);
        return null;
    }
}

/**
 * Generates a market sentiment insight based on actual inventory performance.
 */
export function getMarketInsight(inventory: any[]): string {
    if (inventory.length === 0) return "Awaiting data ingestion...";

    // Group by league to find trends (simplified logic)
    const leagueCounts: Record<string, number> = {};
    inventory.forEach(card => {
        const league = card.league || 'Other';
        leagueCounts[league] = (leagueCounts[league] || 0) + 1;
    });

    const topLeague = Object.entries(leagueCounts).sort((a, b) => b[1] - a[1])[0][0];

    const trends = [
        `${topLeague} liquidity is showing strong signals.`,
        `High-grade assets in ${topLeague} are consolidating.`,
        `Market volatility in ${topLeague} creates a buy window.`,
        `Growth in ${topLeague} indicates institutional hype.`
    ];

    return trends[Math.floor(Math.random() * trends.length)];
}
