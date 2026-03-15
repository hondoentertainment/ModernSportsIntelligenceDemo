/**
 * Price History Service
 * Tracks per-card valuation snapshots for sparkline charts and historical analysis.
 *
 * Architecture: Write-through cache
 * - localStorage serves as the fast synchronous read cache
 * - Supabase is the durable cloud store for authenticated users
 * - On init: Supabase data is merged into localStorage
 * - On write: localStorage is updated immediately, Supabase asynchronously
 * - All read APIs remain synchronous (no breaking changes for consumers)
 */

import { isDemoMode } from './supabase';
import {
    fetchAllPriceHistory,
    insertPriceSnapshot,
    insertBatchPriceSnapshots,
    prunePriceHistory,
} from './supabaseData';

export interface PriceSnapshot {
    timestamp: string;
    value: number;
    source?: string;
    valuationMethod?: string;
    confidence?: number;
    metadata?: Record<string, unknown>;
}

export type CardPriceHistory = Record<string, PriceSnapshot[]>;

const STORAGE_KEY = 'cardx_price_history';
const MAX_SNAPSHOTS = 30;

// Module-level state for the current user (set via initPriceHistory)
let _currentUserId: string | null = null;
let _initialized = false;

/**
 * Get all price history from localStorage (fast synchronous read)
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
 * Persist a snapshot to Supabase in the background (fire-and-forget).
 * Errors are logged but don't block the caller.
 */
function persistToCloud(cardId: string, snapshot: PriceSnapshot): void {
    if (!_currentUserId || isDemoMode) return;
    insertPriceSnapshot(_currentUserId, { cardId, ...snapshot }).catch(err => {
        console.warn('[PriceHistory] Cloud persist failed for', cardId, err);
    });
}

/**
 * Persist a batch of snapshots to Supabase in the background.
 */
function persistBatchToCloud(snapshots: Array<{ cardId: string } & PriceSnapshot>): void {
    if (!_currentUserId || isDemoMode || snapshots.length === 0) return;
    insertBatchPriceSnapshots(_currentUserId, snapshots).catch(err => {
        console.warn('[PriceHistory] Cloud batch persist failed:', err);
    });
}

// ─── Initialization & Teardown ──────────────────────────────────────────────

/**
 * Initialize the price history service for the current user.
 * Hydrates localStorage from Supabase so subsequent reads are fast and complete.
 * Call once after authentication (e.g., in SyncSchedulerInitializer).
 */
export async function initPriceHistory(userId: string): Promise<void> {
    _currentUserId = userId;

    if (isDemoMode) {
        _initialized = true;
        return;
    }

    try {
        // Fetch cloud history
        const cloudHistory = await fetchAllPriceHistory(userId);
        const localHistory = getAllHistory();

        // Merge: cloud data is authoritative, but preserve any local-only snapshots
        // (e.g., recorded while offline) by merging timestamps
        const merged: CardPriceHistory = { ...cloudHistory };

        for (const [cardId, localSnapshots] of Object.entries(localHistory)) {
            if (!merged[cardId]) {
                merged[cardId] = localSnapshots;
                continue;
            }

            // Merge local snapshots that don't exist in cloud (by timestamp match)
            const cloudTimestamps = new Set(merged[cardId].map(s => s.timestamp));
            const uniqueLocal = localSnapshots.filter(s => !cloudTimestamps.has(s.timestamp));

            if (uniqueLocal.length > 0) {
                merged[cardId] = [...merged[cardId], ...uniqueLocal]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, MAX_SNAPSHOTS);

                // Push the unique local snapshots to cloud
                const toSync = uniqueLocal.map(s => ({
                    cardId,
                    value: s.value,
                    timestamp: s.timestamp,
                }));
                persistBatchToCloud(toSync);
            }
        }

        // Update localStorage with the merged result
        saveAllHistory(merged);
        _initialized = true;

        if (import.meta.env.DEV) console.warn(`[PriceHistory] Initialized for user ${userId.slice(0, 8)}... — ${Object.keys(merged).length} cards hydrated`);
    } catch (e) {
        console.warn('[PriceHistory] Initialization failed, falling back to localStorage', e);
        _initialized = true;
    }
}

/**
 * Tear down the price history service (call on sign-out).
 * Optionally prunes old cloud data.
 */
export async function teardownPriceHistory(): Promise<void> {
    if (_currentUserId && !isDemoMode) {
        // Best-effort prune of old cloud snapshots
        prunePriceHistory(_currentUserId, MAX_SNAPSHOTS).catch(() => { });
    }
    _currentUserId = null;
    _initialized = false;
}

/**
 * Check if price history has been initialized for the current session.
 */
export function isPriceHistoryInitialized(): boolean {
    return _initialized;
}

// ─── Write Operations ───────────────────────────────────────────────────────

/**
 * Record a price snapshot for a card.
 * Writes to localStorage immediately and Supabase asynchronously.
 */
export function recordPriceSnapshot(cardId: string, value: number, provenance: Omit<PriceSnapshot, 'timestamp' | 'value'> = {}): void {
    if (!cardId || value === undefined || value === null) return;

    const history = getAllHistory();
    const cardHistory = history[cardId] || [];
    const timestamp = new Date().toISOString();

    const snapshot: PriceSnapshot = {
        timestamp,
        value: Math.round(value * 100) / 100,
        ...provenance,
    };

    // Update local cache
    const updated = [snapshot, ...cardHistory].slice(0, MAX_SNAPSHOTS);
    history[cardId] = updated;
    saveAllHistory(history);

    // Persist to cloud
    persistToCloud(cardId, snapshot);
}

/**
 * Record multiple price snapshots at once (batch operation).
 * Writes to localStorage immediately and Supabase asynchronously.
 */
export function recordBatchSnapshots(cards: Array<{
    id: string;
    value: number;
    timestamp?: string;
    source?: string;
    valuationMethod?: string;
    confidence?: number;
    metadata?: Record<string, unknown>;
}>): void {
    const history = getAllHistory();
    const defaultTimestamp = new Date().toISOString();
    const cloudBatch: Array<{ cardId: string } & PriceSnapshot> = [];

    cards.forEach(({ id, value, timestamp, source, valuationMethod, confidence, metadata }) => {
        if (!id || value === undefined || value === null) return;

        const cardHistory = history[id] || [];
        const roundedValue = Math.round(value * 100) / 100;
        const snapshot: PriceSnapshot = {
            timestamp: timestamp || defaultTimestamp,
            value: roundedValue,
            source,
            valuationMethod,
            confidence,
            metadata,
        };

        history[id] = [snapshot, ...cardHistory].slice(0, MAX_SNAPSHOTS);
        cloudBatch.push({ cardId: id, ...snapshot });
    });

    // Update local cache
    saveAllHistory(history);

    // Persist batch to cloud
    persistBatchToCloud(cloudBatch);
}

// ─── Read Operations (all synchronous — unchanged API) ──────────────────────

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
        .reverse();
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
        history[id].forEach(s => allTimestamps.add(s.timestamp.split('T')[0]));
    });

    const sortedDates = Array.from(allTimestamps).sort().slice(-limit);

    // For each date, sum up the latest value for each card up to that date
    return sortedDates.map(date => {
        let totalValue = 0;

        cardIds.forEach(cardId => {
            const cardSnapshots = history[cardId];
            const relevantSnapshot = cardSnapshots.find(s => s.timestamp.split('T')[0] <= date);
            if (relevantSnapshot) {
                totalValue += relevantSnapshot.value;
            }
        });

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
