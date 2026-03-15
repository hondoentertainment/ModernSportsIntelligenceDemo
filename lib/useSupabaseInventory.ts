import { useState, useEffect, useCallback } from 'react';
import { CardInventory, TargetWatchlist } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode } from './supabase';
import {
  fetchCards,
  fetchTargets,
  upsertCard,
  deleteCard as deleteCardFromDb,
  upsertTarget,
  deleteTarget as deleteTargetFromDb,
  bulkUpsertCards,
    fetchCards,
    fetchTargets,
    upsertCard,
    deleteCard as deleteCardFromDb,
    upsertTarget,
    deleteTarget as deleteTargetFromDb,
    bulkUpsertCards,
    bulkUpsertTargets,
} from './supabaseData';
import { MOCK_CARDS } from '../constants';
import { migrateToSupabase, needsMigration } from './migration';
import { logAuditEvent } from './auditLog';
import { enqueueJob, processAllJobs } from './jobQueue';
import { incrementCounter, recordMetric } from './telemetryService';

const STORAGE_KEY = 'cardx_inventory';
const TARGETS_KEY = 'cardx_targets';
const SYNC_META_KEY = 'cardx_sync_meta';

export interface SyncMeta {
    lastSyncTime: string | null;
    totalValue: number;
    assetCount: number;
}

export type InventorySyncStatus =
    | 'loading'
    | 'migrating'
    | 'local'
    | 'synced'
    | 'retrying'
    | 'offline'
    | 'error';

function readLocalRows<T>(key: string): T[] {
    try {
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn(`Failed to read ${key} from localStorage`, error);
        return [];
    }
}

function readLocalMeta(): SyncMeta | null {
    try {
        const savedMeta = localStorage.getItem(SYNC_META_KEY);
        if (!savedMeta) return null;
        const parsedMeta: unknown = JSON.parse(savedMeta);
        if (
            parsedMeta !== null &&
            typeof parsedMeta === 'object' &&
            'totalValue' in parsedMeta &&
            'assetCount' in parsedMeta &&
            typeof (parsedMeta as Record<string, unknown>).totalValue === 'number' &&
            typeof (parsedMeta as Record<string, unknown>).assetCount === 'number'
        ) {
            return parsedMeta as SyncMeta;
        }
        console.warn('Discarding malformed syncMeta from localStorage');
        return null;
    } catch (error) {
        console.warn('Failed to load sync metadata from localStorage', error);
        return null;
    }
}

function calculateSyncMeta(inventory: CardInventory[], lastSyncTime: string | null): SyncMeta {
    return {
        lastSyncTime,
        totalValue: inventory.reduce((sum, card) => sum + (card.currentValue || 0), 0),
        assetCount: inventory.length,
    };
}

/**
 * Supabase-aware inventory hook
 * - Uses Supabase for authenticated users
 * - Falls back to localStorage for demo/guest mode
 * - Automatically migrates local data to cloud on first login
 * - Tracks explicit sync states and rolls back optimistic writes on cloud failure
 */
export function useSupabaseInventory() {
    const { user } = useAuth();
    const userId = user?.id || null;
    const isAuthenticated = !!userId && !isDemoMode;

    const [inventory, setInventory] = useState<CardInventory[]>([]);
    const [targets, setTargets] = useState<TargetWatchlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);
    const [syncMeta, setSyncMeta] = useState<SyncMeta>({
        lastSyncTime: null,
        totalValue: 0,
        assetCount: 0,
    });
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<InventorySyncStatus>('loading');

    const markCloudHealthy = useCallback(() => {
        setLastSyncError(null);
        setSyncStatus('synced');
        setSyncMeta(prev => ({
            ...prev,
            lastSyncTime: new Date().toISOString(),
        }));
    }, []);

    const markCloudFailure = useCallback((message: string, offlineFallback = false) => {
        setLastSyncError(message);
        setSyncStatus(offlineFallback ? 'offline' : 'error');
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setLastSyncError(null);
            setSyncStatus('loading');

            if (isAuthenticated && userId) {
                if (needsMigration()) {
                    setIsMigrating(true);
                    setSyncStatus('migrating');
                    try {
                        const migrationResult = await migrateToSupabase(userId);
                        if (!migrationResult.success) {
                            markCloudFailure(migrationResult.errors.join(', '));
                        }
                    } catch (error) {
                        console.error('Migration error:', error);
                        markCloudFailure('System error during migration');
                    } finally {
                        setIsMigrating(false);
                    }
                }

                try {
                    const [cards, watchlist] = await Promise.all([
                        fetchCards(userId),
                        fetchTargets(userId),
                    ]);
                    setInventory(cards);
                    setTargets(watchlist);
                } catch  {
                    setLastSyncError('Failed to fetch data from cloud');
                }
            } else {
                // Load from localStorage (demo mode)
                try {
                    const savedInventory = localStorage.getItem(STORAGE_KEY);
                    const savedTargets = localStorage.getItem(TARGETS_KEY);
                    const savedMeta = localStorage.getItem(SYNC_META_KEY);

                    if (savedInventory) {
                        const parsed = JSON.parse(savedInventory);
                        if (Array.isArray(parsed)) setInventory(parsed);
                    setSyncMeta(calculateSyncMeta(cards, new Date().toISOString()));
                    setSyncStatus('synced');
                } catch (error) {
                    console.error('Failed to fetch data from cloud:', error);
                    const cachedInventory = readLocalRows<CardInventory>(STORAGE_KEY);
                    const cachedTargets = readLocalRows<TargetWatchlist>(TARGETS_KEY);
                    const cachedMeta = readLocalMeta();
                    setInventory(cachedInventory);
                    setTargets(cachedTargets);
                    if (cachedMeta) {
                        setSyncMeta(cachedMeta);
                    } else {
                        setSyncMeta(calculateSyncMeta(cachedInventory, null));
                    }
                    markCloudFailure('Failed to fetch data from cloud. Showing cached local data.', true);
                }
            } else {
                setInventory(readLocalRows<CardInventory>(STORAGE_KEY));
                setTargets(readLocalRows<TargetWatchlist>(TARGETS_KEY));
                setSyncMeta(readLocalMeta() || calculateSyncMeta([], null));
                setSyncStatus('local');
            }

            setLoading(false);
        };

        void loadData();
    }, [userId, isAuthenticated, markCloudFailure]);

    useEffect(() => {
        const nextMeta = calculateSyncMeta(inventory, syncMeta.lastSyncTime);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
        localStorage.setItem(SYNC_META_KEY, JSON.stringify(nextMeta));
        setSyncMeta(nextMeta);
    }, [inventory, targets, syncMeta.lastSyncTime]);

    const runCloudMutation = useCallback(async (
        action: () => Promise<boolean>,
        onFailure: () => void,
        failureMessage: string,
    ) => {
        if (!isAuthenticated || !userId) {
            setSyncStatus('local');
            return true;
        }

        setSyncStatus('retrying');
        setLastSyncError(null);

        const success = await action();
        if (!success) {
            onFailure();
            markCloudFailure(failureMessage);
            return false;
        }

        markCloudHealthy();
        return true;
    }, [isAuthenticated, userId, markCloudFailure, markCloudHealthy]);

    const addCard = useCallback(async (card: CardInventory) => {
        setInventory(prev => [card, ...prev]);
        await runCloudMutation(
            () => upsertCard(card, userId!),
            () => setInventory(prev => prev.filter(existing => existing.id !== card.id)),
            'Failed to save card to cloud. Local change has been rolled back.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'card.add',
            entityType: 'card',
            entityId: card.id,
            metadata: {
                player: card.player,
                year: card.year,
                set: card.set,
            },
        });
    }, [runCloudMutation, userId]);

    const updateCard = useCallback(async (id: string, updates: Partial<CardInventory>) => {
        const previousCard = inventory.find(card => card.id === id);
        if (!previousCard) return;

        const nextCard = { ...previousCard, ...updates };
        setInventory(prev => prev.map(card => card.id === id ? nextCard : card));

        await runCloudMutation(
            () => upsertCard(nextCard, userId!),
            () => setInventory(prev => prev.map(card => card.id === id ? previousCard : card)),
            'Failed to update card in cloud. Local change has been rolled back.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'card.update',
            entityType: 'card',
            entityId: id,
            metadata: { changedKeys: Object.keys(updates) },
        });
    }, [inventory, runCloudMutation, userId]);

    const removeCard = useCallback(async (id: string) => {
        const removedCard = inventory.find(card => card.id === id);
        if (!removedCard) return;

        setInventory(prev => prev.filter(card => card.id !== id));

        await runCloudMutation(
            () => deleteCardFromDb(id),
            () => setInventory(prev => [removedCard, ...prev]),
            'Failed to delete card from cloud. Local change has been restored.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'card.delete',
            entityType: 'card',
            entityId: id,
        });
    }, [inventory, runCloudMutation, userId]);

    const addTarget = useCallback(async (target: TargetWatchlist) => {
        setTargets(prev => [target, ...prev]);

        await runCloudMutation(
            () => upsertTarget(target, userId!),
            () => setTargets(prev => prev.filter(existing => existing.id !== target.id)),
            'Failed to save target to cloud. Local change has been rolled back.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'target.add',
            entityType: 'target',
            entityId: target.id,
            metadata: {
                player: target.player,
                description: target.cardDescription,
            },
        });
    }, [runCloudMutation, userId]);

    const updateTarget = useCallback(async (id: string, updates: Partial<TargetWatchlist>) => {
        const previousTarget = targets.find(target => target.id === id);
        if (!previousTarget) return;

        const nextTarget = { ...previousTarget, ...updates };
        setTargets(prev => prev.map(target => target.id === id ? nextTarget : target));

        await runCloudMutation(
            () => upsertTarget(nextTarget, userId!),
            () => setTargets(prev => prev.map(target => target.id === id ? previousTarget : target)),
            'Failed to update target in cloud. Local change has been rolled back.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'target.update',
            entityType: 'target',
            entityId: id,
            metadata: { changedKeys: Object.keys(updates) },
        });
    }, [targets, runCloudMutation, userId]);

    const removeTarget = useCallback(async (id: string) => {
        const removedTarget = targets.find(target => target.id === id);
        if (!removedTarget) return;

        setTargets(prev => prev.filter(target => target.id !== id));

        await runCloudMutation(
            () => deleteTargetFromDb(id),
            () => setTargets(prev => [removedTarget, ...prev]),
            'Failed to delete target from cloud. Local change has been restored.',
        );

        await logAuditEvent({
            userId: userId || undefined,
            category: 'portfolio',
            action: 'target.delete',
            entityType: 'target',
            entityId: id,
        });
    }, [targets, runCloudMutation, userId]);

    const markAcquired = useCallback((id: string) => {
        void updateTarget(id, { status: 'acquired' });
    }, [updateTarget]);

    const initializeFullInventory = useCallback(async () => {
        if (inventory.length > 0 && inventory.length >= MOCK_CARDS.length) return;

        const previousInventory = inventory;
        setInventory(MOCK_CARDS);

        if (isAuthenticated && userId) {
            const success = await runCloudMutation(
                () => bulkUpsertCards(MOCK_CARDS, userId),
                () => setInventory(previousInventory),
                'Failed to initialize cloud inventory. Local change has been rolled back.',
            );
            if (!success) return;
        } else {
            setSyncStatus('local');
        }
    }, [inventory, isAuthenticated, runCloudMutation, userId]);

    const refreshFromStorage = useCallback(() => {
        setInventory(readLocalRows<CardInventory>(STORAGE_KEY));
        setTargets(readLocalRows<TargetWatchlist>(TARGETS_KEY));
        const cachedMeta = readLocalMeta();
        if (cachedMeta) {
            setSyncMeta(cachedMeta);
        }
        if (!isAuthenticated) {
            setSyncStatus('local');
        }
    }, [isAuthenticated]);

    const persistSyncToCloud = useCallback(async (cards: CardInventory[], updatedTargets?: TargetWatchlist[]) => {
        if (!isAuthenticated || !userId) {
            setSyncStatus('local');
            return;
        }

        setSyncStatus('retrying');
        setLastSyncError(null);

        const syncJob = enqueueJob('cloud_sync', { cards, updatedTargets, userId });
        const started = performance.now();

        try {
            await processAllJobs({
                cloud_sync: async (job) => {
                    const payload = job.payload as { cards: CardInventory[]; updatedTargets?: TargetWatchlist[]; userId: string };
                    const cardsSynced = await bulkUpsertCards(payload.cards, payload.userId);
                    if (!cardsSynced) throw new Error('Failed to sync cards to cloud');

                    if (payload.updatedTargets && payload.updatedTargets.length > 0) {
                        const targetsSynced = await bulkUpsertTargets(payload.updatedTargets, payload.userId);
                        if (!targetsSynced) throw new Error('Failed to sync targets to cloud');
                    }
                },
            });

            recordMetric('sync.cloud.duration_ms', performance.now() - started, { source: 'persistSyncToCloud' });
            incrementCounter('sync.cloud.success');
            markCloudHealthy();

            await logAuditEvent({
                userId,
                category: 'system',
                action: 'cloud.sync.completed',
                entityType: 'sync_job',
                entityId: syncJob.id,
                metadata: {
                    cards: cards.length,
                    targets: updatedTargets?.length || 0,
                },
            });
        } catch (error) {
            console.error('Cloud sync failed:', error);
            markCloudFailure('Cloud sync failed. Local cache remains available.', true);
        }
    }, [isAuthenticated, markCloudFailure, markCloudHealthy, userId]);

    return {
        inventory,
        setInventory,
        targets,
        setTargets,
        loading,
        isMigrating,
        syncStatus,
        lastSyncError,
        syncMeta,
        setSyncMeta,
        isCloudSynced: isAuthenticated && syncStatus === 'synced',
        addCard,
        updateCard,
        deleteCard: removeCard,
        addTarget,
        updateTarget,
        deleteTarget: removeTarget,
        markAcquired,
        refreshFromStorage,
        initializeFullInventory,
        persistSyncToCloud,
        totalCards: inventory.length,
    };
}



