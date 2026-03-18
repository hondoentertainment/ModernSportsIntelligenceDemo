import { logger } from '../logger';
import { getPlayerStats, searchMLBPlayers, MLBHittingStat, MLBStatGroup } from './mlbApi.ts';

export interface PlayerPerformance {
    id: number;
    fullName: string;
    primaryNumber?: string;
    stats: Array<{ label: string; value: string | number; change: string }>;
}

/**
 * High-level service to bridge inventory data with real-world sports metrics.
 */
export const StatsService = {
    /**
     * Fetches real season stats for a player and maps them to our application format.
     */
    async getPlayerPerformance(playerName: string): Promise<PlayerPerformance | null> {
        try {
            // 1. Resolve Player ID
            const players = await searchMLBPlayers(playerName);
            if (!players || players.length === 0) return null;

            const player = players[0];
            const stats: MLBStatGroup[] = await getPlayerStats(player.id);

            // 2. Parse stats (prioritizing hitting for MLB)
            const hittingStats = stats.find(s => s.group.displayName === 'hitting');
            if (!hittingStats || !hittingStats.splits || hittingStats.splits.length === 0) return null;

            const season = hittingStats.splits[0].stat as MLBHittingStat;

            return {
                id: player.id,
                fullName: player.fullName,
                primaryNumber: player.primaryNumber,
                stats: [
                    { label: 'AVG', value: season.avg ?? '.000', change: '+0.00' },
                    { label: 'HR', value: season.homeRuns ?? '0', change: '0' },
                    { label: 'RBI', value: season.rbi ?? '0', change: '0' },
                    { label: 'OPS', value: season.ops ?? '.000', change: '+0.00' }
                ]
            };
        } catch (error) {
            logger.error(`StatsService Error for ${playerName}:`, error);
            return null;
        }
    },

    /**
     * Resolves a real headshot URL for an MLB player.
     */
    async getPlayerHeadshot(playerName: string): Promise<string | null> {
        try {
            const players = await searchMLBPlayers(playerName);
            if (!players || players.length === 0) return null;

            const playerId = players[0].id;
            // Using the standard MLB headshot CDN
            return `https://img.mlbstatic.com/mlb-photos/person/${playerId}.jpg`;
        } catch (error) {
            logger.error(`Headshot Resolution Error for ${playerName}:`, error);
            return null;
        }
    },

    /**
     * Estimates capital gains tax liability for the portfolio.
     * Logic: 20% for Long Term (held > 1yr), 35% for Short Term (held < 1yr).
     */
    calculateEstimatedTax(inventory: any[]): { total: number, shortTerm: number, longTerm: number } {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        const now = new Date();
        const yearInMs = 365 * 24 * 60 * 60 * 1000;

        return activeCards.reduce((acc, card) => {
            const gain = Math.max(0, (card.currentValue || 0) - (card.purchasePrice || 0));
            if (gain === 0) return acc;

            // Use purchaseDate, fallback to dateAdded or now if missing
            const purchaseDateStr = card.purchaseDate || card.dateAdded || now.toISOString();
            const purchaseDate = new Date(purchaseDateStr);
            const holdingPeriod = now.getTime() - purchaseDate.getTime();
            const isLongTerm = holdingPeriod > yearInMs;

            const tax = isLongTerm ? gain * 0.20 : gain * 0.35;

            acc.total += tax;
            if (isLongTerm) acc.longTerm += tax;
            else acc.shortTerm += tax;

            return acc;
        }, { total: 0, shortTerm: 0, longTerm: 0 });
    },

    /**
     * Identifies "Optimized Sell-Through" candidates based on ROI.
     */
    getSellCandidates(inventory: any[]): any[] {
        const activeCards = inventory.filter(c => c.status !== 'sold');
        return activeCards.filter(card => {
            const cost = card.purchasePrice || 1;
            const roi = ((card.currentValue || 0) - cost) / cost;
            // Highlight assets with > 50% ROI for institutional take-profit
            return roi > 0.5;
        }).sort((a, b) => {
            const roiA = ((a.currentValue || 0) - (a.purchasePrice || 1)) / (a.purchasePrice || 1);
            const roiB = ((b.currentValue || 0) - (b.purchasePrice || 1)) / (b.purchasePrice || 1);
            return roiB - roiA;
        });
    }
};
