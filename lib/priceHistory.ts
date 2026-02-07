/**
 * Price History Service
 * Tracks per-card valuation snapshots for sparkline charts and historical analysis
 */

export interface PriceSnapshot {
    timestamp: string;
    value: number;
}

export type CardPriceHistory = Record<string, PriceSnapshot[]>;

const STORAGE_KEY = 'cardx_price_history';
const MAX_SNAPSHOTS = 30;

/**
 * Get all price history from localStorage
 */
function getAllHistory(): CardPriceHistory {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.warn('Failed to parse price history', e);
        return {};
    }
}

/**
 * Save all price history to localStorage
 */
function saveAllHistory(history: CardPriceHistory): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn('Failed to save price history', e);
    }
}

/**
 * Record a price snapshot for a card
 * Automatically prunes to MAX_SNAPSHOTS
 */
export function recordPriceSnapshot(cardId: string, value: number): void {
    if (!cardId || value === undefined || value === null) return;

    const history = getAllHistory();
    const cardHistory = history[cardId] || [];

    const snapshot: PriceSnapshot = {
        timestamp: new Date().toISOString(),
        value: Math.round(value * 100) / 100 // Round to cents
    };

    // Add new snapshot and prune old ones
    const updated = [snapshot, ...cardHistory].slice(0, MAX_SNAPSHOTS);
    history[cardId] = updated;

    saveAllHistory(history);
}

/**
 * Record multiple price snapshots at once (batch operation)
 */
export function recordBatchSnapshots(cards: { id: string; value: number }[]): void {
    const history = getAllHistory();
    const timestamp = new Date().toISOString();

    cards.forEach(({ id, value }) => {
        if (!id || value === undefined || value === null) return;

        const cardHistory = history[id] || [];
        const snapshot: PriceSnapshot = {
            timestamp,
            value: Math.round(value * 100) / 100
        };

        history[id] = [snapshot, ...cardHistory].slice(0, MAX_SNAPSHOTS);
    });

    saveAllHistory(history);
}

/**
 * Get price history for a specific card
 */
export function getCardHistory(cardId: string): PriceSnapshot[] {
    const history = getAllHistory();
    return history[cardId] || [];
}

/**
 * Get sparkline data (just the values) for a card
 * Returns values in chronological order (oldest first) for chart rendering
 */
export function getSparklineData(cardId: string, limit: number = 10): number[] {
    const snapshots = getCardHistory(cardId);
    return snapshots
        .slice(0, limit)
        .map(s => s.value)
        .reverse(); // Chronological order for charts
}

/**
 * Calculate trend direction based on price history
 */
export function getPriceTrend(cardId: string): 'up' | 'down' | 'stable' {
    const data = getSparklineData(cardId, 5);
    if (data.length < 2) return 'stable';

    const first = data[0];
    const last = data[data.length - 1];
    const changePercent = ((last - first) / first) * 100;

    if (changePercent > 2) return 'up';
    if (changePercent < -2) return 'down';
    return 'stable';
}

/**
 * Get portfolio NAV history by aggregating all card snapshots
 * Returns data points for the Dashboard growth chart
 */
export function getPortfolioNAVHistory(limit: number = 10): { name: string; val: number }[] {
    const history = getAllHistory();
    const cardIds = Object.keys(history);

    if (cardIds.length === 0) return [];

    // Get all unique timestamps across all cards
    const allTimestamps = new Set<string>();
    cardIds.forEach(id => {
        history[id].forEach(s => allTimestamps.add(s.timestamp.split('T')[0])); // Group by day
    });

    const sortedDates = Array.from(allTimestamps).sort().slice(-limit);

    // For each date, sum up the latest value for each card up to that date
    return sortedDates.map(date => {
        let totalValue = 0;

        cardIds.forEach(cardId => {
            const cardSnapshots = history[cardId];
            // Find the most recent snapshot on or before this date
            const relevantSnapshot = cardSnapshots.find(s => s.timestamp.split('T')[0] <= date);
            if (relevantSnapshot) {
                totalValue += relevantSnapshot.value;
            }
        });

        // Format date for display
        const d = new Date(date);
        const name = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return { name, val: Math.round(totalValue) };
    });
}

/**
 * Clear all price history (for testing/reset)
 */
export function clearPriceHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}
