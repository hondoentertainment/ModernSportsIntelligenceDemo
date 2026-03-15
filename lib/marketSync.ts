
import { CardInventory, TargetWatchlist } from '../types.ts';
import { getEbayCardPrice, getWatchlistItemPrice } from './gemini.ts';
import { recordBatchSnapshots } from './priceHistory.ts';
import { showToast } from './toast.ts';

export interface SyncProgress {
    total: number;
    current: number;
    status: 'idle' | 'syncing' | 'complete' | 'error';
    lastSyncTime: string | null;
    errors: string[];
}

export interface SyncResult {
    success: boolean;
    updatedCount: number;
    failedCount: number;
    totalValue: number;
    duration: number;
}

const CONCURRENT_LIMIT = 3; // Process 3 cards at a time to avoid rate limits
const STORAGE_KEY = 'cardx_inventory';
const SYNC_META_KEY = 'cardx_sync_meta';
const HISTORY_KEY = 'cardx_sync_history';
const MAX_HISTORY = 30; // Keep 30 snapshots

export interface PortfolioSnapshot {
    timestamp: string;
    totalValue: number;
    assetCount: number;
}

/**
 * Throttled parallel execution - processes items in batches
 */
async function throttledParallel<T, R>(
    items: T[],
    fn: (_item: T) => Promise<R>,
    limit: number,
    onProgress?: (_current: number, _total: number) => void
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += limit) {
        const batch = items.slice(i, i + limit);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);

        if (onProgress) {
            onProgress(Math.min(i + limit, items.length), items.length);
        }
    }

    return results;
}

/**
 * Syncs a single card's market value using Gemini AI
 */
async function syncCardValue(card: CardInventory): Promise<CardInventory> {
    try {
        const analysis = await getEbayCardPrice(card);

        if (analysis) {
            return {
                ...card,
                currentValue: analysis.estimatedValue,
                lastValuationDate: analysis.lastUpdated,
                valuationConfidence: analysis.confidence
            };
        }

        return card;
    } catch (error) {
        console.warn(`Failed to sync card ${card.id}:`, error);
        return card;
    }
}

/**
 * Main portfolio sync function - updates all cards with live market data
 */
export async function syncPortfolio(
    inventory: CardInventory[],
    onProgress?: (_progress: SyncProgress) => void
): Promise<{ inventory: CardInventory[]; result: SyncResult }> {
    const startTime = Date.now();
    const errors: string[] = [];

    const progress: SyncProgress = {
        total: inventory.length,
        current: 0,
        status: 'syncing',
        lastSyncTime: null,
        errors: []
    };

    if (onProgress) onProgress(progress);

    const updatedInventory = await throttledParallel(
        inventory,
        async (card) => {
            const updated = await syncCardValue(card);
            if (updated.currentValue === card.currentValue && !updated.lastValuationDate) {
                errors.push(`Card ${card.id} (${card.player}) failed to update`);
            }
            return updated;
        },
        CONCURRENT_LIMIT,
        (current, _total) => {
            progress.current = current;
            if (onProgress) onProgress({ ...progress });
        }
    );

    const endTime = Date.now();
    const syncTime = new Date().toISOString();

    // Calculate totals
    const totalValue = updatedInventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const updatedCount = updatedInventory.filter(c => c.lastValuationDate === syncTime.split('T')[0] ||
        (c.lastValuationDate && new Date(c.lastValuationDate).getTime() > startTime - 60000)).length;

    // Record per-card price snapshots for historical tracking
    const snapshotData = updatedInventory
        .filter(c => c.currentValue && c.currentValue > 0)
        .map(c => ({ id: c.id, value: c.currentValue! }));
    recordBatchSnapshots(snapshotData);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInventory));
    localStorage.setItem(SYNC_META_KEY, JSON.stringify({
        lastSyncTime: syncTime,
        totalValue,
        assetCount: updatedInventory.length
    }));

    // Update history snapshots
    try {
        const history: PortfolioSnapshot[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        const newSnapshot: PortfolioSnapshot = {
            timestamp: syncTime,
            totalValue,
            assetCount: updatedInventory.length
        };

        // Add new snapshot and prune
        const updatedHistory = [newSnapshot, ...history].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
        console.warn('Failed to update sync history', e);
    }

    progress.status = 'complete';
    progress.lastSyncTime = syncTime;
    progress.errors = errors;
    if (onProgress) onProgress(progress);

    // Surface sync results to the user
    if (errors.length > 0) {
        showToast('warning', `Portfolio sync done — ${errors.length} card${errors.length > 1 ? 's' : ''} failed to update.`, { dedupeKey: 'sync_partial' });
    } else {
        showToast('success', `Portfolio synced — ${updatedCount} cards updated.`, { dedupeKey: 'sync_done' });
    }

    return {
        inventory: updatedInventory,
        result: {
            success: errors.length === 0,
            updatedCount,
            failedCount: errors.length,
            totalValue,
            duration: endTime - startTime
        }
    };
}

/**
 * Get the last sync metadata
 */
export function getSyncMeta(): { lastSyncTime: string | null; totalValue: number; assetCount: number } {
    try {
        const meta = localStorage.getItem(SYNC_META_KEY);
        if (meta) {
            return JSON.parse(meta);
        }
    } catch (e) {
        console.warn('Failed to parse sync meta', e);
    }
    return { lastSyncTime: null, totalValue: 0, assetCount: 0 };
}

/**
 * Check if a sync is stale (older than 24 hours)
 */
export function isSyncStale(): boolean {
    const meta = getSyncMeta();
    if (!meta.lastSyncTime) return true;

    const lastSync = new Date(meta.lastSyncTime).getTime();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    return (now - lastSync) > TWENTY_FOUR_HOURS;
}

/**
 * Result from syncing watchlist target prices
 */
export interface WatchlistSyncResult {
    updatedTargets: TargetWatchlist[];
    priceHits: TargetWatchlist[];
    failedCount: number;
    duration: number;
}

/**
 * Syncs live market data for all active watchlist targets.
 * Returns updated targets and any that have hit their price target.
 */
export async function syncWatchlistPrices(
    targets: TargetWatchlist[],
    onProgress?: (_current: number, _total: number) => void
): Promise<WatchlistSyncResult> {
    const startTime = Date.now();
    const activeTargets = targets.filter(t => t.status === 'active');
    let failedCount = 0;

    const updatedTargets = await throttledParallel(
        activeTargets,
        async (target) => {
            try {
                const analysis = await getWatchlistItemPrice(target);
                if (analysis) {
                    return {
                        ...target,
                        currentMarketPrice: analysis.estimatedValue,
                        searchUrl: analysis.searchUrl,
                    };
                }
                failedCount++;
                return target;
            } catch (e) {
                console.warn(`Failed to sync watchlist target ${target.id}:`, e);
                showToast('warning', `Watchlist update failed for "${target.player}".`, { dedupeKey: `wl_sync_${target.id}` });
                failedCount++;
                return target;
            }
        },
        CONCURRENT_LIMIT,
        onProgress
    );

    // Record price history snapshots for targets (prefixed with target_)
    const snapshotData = updatedTargets
        .filter(t => t.currentMarketPrice && t.currentMarketPrice > 0)
        .map(t => ({ id: `target_${t.id}`, value: t.currentMarketPrice! }));
    recordBatchSnapshots(snapshotData);

    // Identify targets that hit their price
    const priceHits = updatedTargets.filter(
        t => t.currentMarketPrice && t.currentMarketPrice <= t.targetPrice
    );

    // Merge updated targets back with non-active ones
    const finalTargets = targets.map(t => {
        const updated = updatedTargets.find(u => u.id === t.id);
        return updated || t;
    });

    return {
        updatedTargets: finalTargets,
        priceHits,
        failedCount,
        duration: Date.now() - startTime,
    };
}
