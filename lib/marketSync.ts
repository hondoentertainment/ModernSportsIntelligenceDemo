
import { CardInventory, PricingAnalysis } from "../types.ts";
import { getEbayCardPrice } from "./gemini.ts";

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

/**
 * Throttled parallel execution - processes items in batches
 */
async function throttledParallel<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    limit: number,
    onProgress?: (current: number, total: number) => void
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
    onProgress?: (progress: SyncProgress) => void
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
        (current, total) => {
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

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInventory));
    localStorage.setItem(SYNC_META_KEY, JSON.stringify({
        lastSyncTime: syncTime,
        totalValue,
        assetCount: updatedInventory.length
    }));

    progress.status = 'complete';
    progress.lastSyncTime = syncTime;
    progress.errors = errors;
    if (onProgress) onProgress(progress);

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
