
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
            console.error(`StatsService Error for ${playerName}:`, error);
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
            console.error(`Headshot Resolution Error for ${playerName}:`, error);
            return null;
        }
    }
};
