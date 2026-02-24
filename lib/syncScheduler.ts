/**
 * Automated Market Sync Scheduler
 * Enables automatic portfolio valuation updates at configurable intervals
 */

import { CardInventory, TargetWatchlist } from '../types.ts';
import { syncPortfolio, SyncProgress, SyncResult, isSyncStale, getSyncMeta, syncWatchlistPrices, WatchlistSyncResult } from './marketSync';

export type SyncInterval = 'manual' | 'hourly' | 'daily' | 'weekly';

export interface SyncSchedule {
    interval: SyncInterval;
    lastSync: string | null;
    nextSync: string | null;
    enabled: boolean;
}

export interface SyncSchedulerConfig {
    interval: SyncInterval;
    notifyOnComplete: boolean;
    notifyOnPriceChange: number; // Percentage threshold
    syncOnAppStart: boolean;
}

const DEFAULT_CONFIG: SyncSchedulerConfig = {
    interval: 'daily',
    notifyOnComplete: true,
    notifyOnPriceChange: 10, // 10% change threshold
    syncOnAppStart: true,
};

const SCHEDULE_KEY = 'cardx_sync_schedule';
const CONFIG_KEY = 'cardx_sync_config';

/**
 * Get sync configuration from localStorage
 */
export function getSyncConfig(): SyncSchedulerConfig {
    try {
        const saved = localStorage.getItem(CONFIG_KEY);
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch (e) {
        console.warn('Failed to parse sync config:', e);
        return DEFAULT_CONFIG;
    }
}

/**
 * Save sync configuration to localStorage
 */
export function setSyncConfig(config: Partial<SyncSchedulerConfig>): void {
    const current = getSyncConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
}

/**
 * Get current sync schedule
 */
export function getSyncSchedule(): SyncSchedule {
    try {
        const saved = localStorage.getItem(SCHEDULE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to parse sync schedule:', e);
    }

    // Calculate from last sync
    const meta = getSyncMeta();
    const config = getSyncConfig();

    return {
        interval: config.interval,
        lastSync: meta.lastSyncTime,
        nextSync: calculateNextSync(config.interval, meta.lastSyncTime),
        enabled: config.interval !== 'manual',
    };
}

/**
 * Save sync schedule
 */
function setSyncSchedule(schedule: SyncSchedule): void {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

/**
 * Calculate next sync time based on interval
 */
function calculateNextSync(interval: SyncInterval, lastSync: string | null): string | null {
    if (!lastSync) return null;

    const last = new Date(lastSync).getTime();
    const now = Date.now();

    const intervals = {
        manual: Infinity,
        hourly: 60 * 60 * 1000, // 1 hour
        daily: 24 * 60 * 60 * 1000, // 24 hours
        weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const nextTime = last + intervals[interval];

    // If next time is in the past, sync now
    if (nextTime <= now) {
        return new Date().toISOString();
    }

    return new Date(nextTime).toISOString();
}

/**
 * Check if a sync is due
 */
export function isSyncDue(): boolean {
    const schedule = getSyncSchedule();
    if (!schedule.enabled || !schedule.nextSync) return false;

    const next = new Date(schedule.nextSync).getTime();
    const now = Date.now();

    return next <= now;
}

/**
 * Get time until next sync
 */
export function getTimeUntilNextSync(): {
    due: boolean;
    timeLeft: string | null;
    minutesLeft: number;
} {
    const schedule = getSyncSchedule();

    if (!schedule.enabled || !schedule.nextSync) {
        return { due: false, timeLeft: null, minutesLeft: Infinity };
    }

    const next = new Date(schedule.nextSync).getTime();
    const now = Date.now();
    const minutesLeft = Math.max(0, Math.floor((next - now) / (60 * 1000)));

    const due = minutesLeft === 0;

    let timeLeft: string | null = null;
    if (minutesLeft < 60) {
        timeLeft = `${minutesLeft} min`;
    } else if (minutesLeft < 1440) {
        timeLeft = `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`;
    } else {
        const days = Math.floor(minutesLeft / 1440);
        const hours = Math.floor((minutesLeft % 1440) / 60);
        timeLeft = `${days}d ${hours}h`;
    }

    return { due, timeLeft, minutesLeft };
}

/**
 * Sync Scheduler Class
 * Manages automatic sync intervals
 */
export class SyncScheduler {
    private intervalId: number | null = null;
    private config: SyncSchedulerConfig;
    private inventory: CardInventory[] = [];
    private targets: TargetWatchlist[] = [];
    private onProgress?: (progress: SyncProgress) => void;
    private onComplete?: (result: SyncCompleteResult) => void;

    constructor(
        config?: Partial<SyncSchedulerConfig>,
        callbacks?: {
            onProgress?: (progress: SyncProgress) => void;
            onComplete?: (result: SyncCompleteResult) => void;
        }
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.onProgress = callbacks?.onProgress;
        this.onComplete = callbacks?.onComplete;
    }

    setCallbacks(callbacks?: { onProgress?: (progress: SyncProgress) => void; onComplete?: (result: SyncCompleteResult) => void }) {
        if (callbacks?.onProgress) this.onProgress = callbacks.onProgress;
        if (callbacks?.onComplete) this.onComplete = callbacks.onComplete;
    }

    /**
     * Start the scheduler
     */
    start(inventory: CardInventory[], targets: TargetWatchlist[]): void {
        this.stop(); // Clear any existing interval
        this.inventory = inventory;
        this.targets = targets;

        if (this.config.interval === 'manual') {
            console.log('Sync scheduler: Manual mode, not starting automatic sync');
            return;
        }

        // Sync on app start if configured
        if (this.config.syncOnAppStart && isSyncStale()) {
            this.performSync();
        }

        // Set up periodic sync heartbeat (watchdog)
        // Check every 60 seconds if a sync is due. This is more robust than a single long interval.
        this.intervalId = window.setInterval(() => {
            if (isSyncDue()) {
                this.performSync();
            }
        }, 60 * 1000); // 1 minute heartbeat

        console.log(`Sync scheduler: Started watchdog with 60s heartbeat (${this.config.interval} check)`);
    }

    /**
     * Update the data used for syncing without restarting the interval
     */
    updateData(inventory: CardInventory[], targets: TargetWatchlist[]): void {
        this.inventory = inventory;
        this.targets = targets;
    }

    /**
     * Stop the scheduler
     */
    stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Sync scheduler: Stopped');
        }
    }

    /**
     * Perform a sync
     */
    private async performSync(): Promise<void> {
        try {
            console.log('Sync scheduler: Performing sync...');

            // Sync portfolio
            const { inventory: updatedInventory, result: portfolioResult } = await syncPortfolio(
                this.inventory,
                this.onProgress
            );

            // Sync watchlist
            const watchlistResult = await syncWatchlistPrices(
                this.targets,
                (current, total) => {
                    if (this.onProgress) {
                        this.onProgress({
                            total: total,
                            current: current,
                            status: 'syncing',
                            lastSyncTime: null,
                            errors: [],
                        });
                    }
                }
            );

            // Merge updated targets (watchlistResult.updatedTargets is the full list)
            const updatedTargets = watchlistResult.updatedTargets;

            // Update schedule
            const schedule = getSyncSchedule();
            schedule.lastSync = new Date().toISOString();
            schedule.nextSync = calculateNextSync(this.config.interval, schedule.lastSync);
            setSyncSchedule(schedule);

            // Update internal state for next sync cycle
            this.inventory = updatedInventory;
            this.targets = updatedTargets;

            // Notify on complete (includes data for cloud persistence)
            if (this.onComplete) {
                this.onComplete({
                    portfolio: portfolioResult,
                    watchlist: watchlistResult,
                    inventory: updatedInventory,
                    targets: updatedTargets,
                });
            }

            // Target price alerts: notify when watchlist items hit their target
            if (watchlistResult.priceHits.length > 0 && 'Notification' in window) {
                for (const hit of watchlistResult.priceHits) {
                    const msg = `${hit.player}: $${hit.currentMarketPrice} ≤ $${hit.targetPrice} target`;
                    this.showNotification('Target Price Hit', msg);
                }
            }

            // Browser notification if enabled
            if (this.config.notifyOnComplete && 'Notification' in window) {
                this.showNotification('Sync Complete', 'Portfolio valuations updated');
            }

        } catch (error) {
            console.error('Sync scheduler: Sync failed:', error);
        }
    }

    /**
     * Show browser notification
     */
    private showNotification(title: string, body: string): void {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
            });
        }
    }

    /**
     * Request notification permission
     */
    async requestNotificationPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<SyncSchedulerConfig>): void {
        this.config = { ...this.config, ...config };
        setSyncConfig(config);
    }
}

/**
 * Create a singleton scheduler instance
 */
let schedulerInstance: SyncScheduler | null = null;

export function getScheduler(): SyncScheduler {
    if (!schedulerInstance) {
        const config = getSyncConfig();
        schedulerInstance = new SyncScheduler(config);
    }
    return schedulerInstance;
}

export interface SyncCompleteResult {
    portfolio: SyncResult;
    watchlist: WatchlistSyncResult;
    inventory: CardInventory[];
    targets: TargetWatchlist[];
}

/**
 * Initialize scheduler with inventory and targets
 */
export function initializeScheduler(
    inventory: CardInventory[],
    targets: TargetWatchlist[],
    callbacks?: {
        onProgress?: (progress: SyncProgress) => void;
        onComplete?: (result: SyncCompleteResult) => void;
    }
): SyncScheduler {
    const scheduler = getScheduler();
    scheduler.updateConfig(getSyncConfig());
    scheduler.start(inventory, targets);
    scheduler.setCallbacks(callbacks);
    return scheduler;
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
    if (schedulerInstance) {
        schedulerInstance.stop();
    }
}
