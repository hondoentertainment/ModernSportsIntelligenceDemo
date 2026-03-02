import { useState, useEffect, useCallback } from 'react';
import { CardInventory, TargetWatchlist } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode } from './supabase';
import { fetchCards, fetchTargets, upsertCard, deleteCard as deleteCardFromDb, upsertTarget, deleteTarget as deleteTargetFromDb, bulkUpsertCards } from './supabaseData';
import { MOCK_CARDS } from '../constants';
import { migrateToSupabase, needsMigration } from './migration';

const STORAGE_KEY = 'cardx_inventory';
const TARGETS_KEY = 'cardx_targets';
const SYNC_META_KEY = 'cardx_sync_meta';

export interface SyncMeta {
    lastSyncTime: string | null;
    totalValue: number;
    assetCount: number;
}

/**
 * Supabase-aware inventory hook
 * - Uses Supabase for authenticated users
 * - Falls back to localStorage for demo/guest mode
 * - Automatically migrates local data to cloud on first login
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
        assetCount: 0
    });
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);

    const syncStatus = loading ? 'loading' : isMigrating ? 'migrating' : (isAuthenticated ? 'synced' : 'local');

    // Load data on mount or auth change
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (isAuthenticated && userId) {
                // 1. Check if we need to migrate local data first
                if (needsMigration()) {
                    setIsMigrating(true);
                    try {
                        const migrationResult = await migrateToSupabase(userId);
                        if (migrationResult.success) {
                            if (import.meta.env.DEV) console.warn('Migration successful:', migrationResult);
                        } else {
                            setLastSyncError(migrationResult.errors.join(', '));
                        }
                    } catch (e) {
                        setLastSyncError('System error during migration');
                        console.error('Migration error:', e);
                    }
                    setIsMigrating(false);
                }

                // 2. Fetch from Supabase
                try {
                    const [cards, watchlist] = await Promise.all([
                        fetchCards(userId),
                        fetchTargets(userId)
                    ]);
                    setInventory(cards);
                    setTargets(watchlist);
                } catch (e) {
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
                    }
                    if (savedTargets) {
                        const parsed = JSON.parse(savedTargets);
                        if (Array.isArray(parsed)) setTargets(parsed);
                    }
                    if (savedMeta) {
                        setSyncMeta(JSON.parse(savedMeta));
                    }
                } catch (e) {
                    console.warn('Failed to load from localStorage', e);
                }
            }

            setLoading(false);
        };

        loadData();
    }, [userId, isAuthenticated]);

    // Sync to localStorage whenever inventory/targets change (for demo mode)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
            localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));

            const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
            const meta: SyncMeta = {
                lastSyncTime: syncMeta.lastSyncTime,
                totalValue,
                assetCount: inventory.length
            };
            localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
            setSyncMeta(meta);
        }
    }, [inventory, targets, isAuthenticated, syncMeta.lastSyncTime]);

    // === Card Operations ===

    const addCard = useCallback(async (card: CardInventory) => {
        setInventory(prev => [card, ...prev]);
        if (isAuthenticated && userId) {
            const success = await upsertCard(card, userId);
            if (!success) setLastSyncError('Failed to save card to cloud');
        }
    }, [isAuthenticated, userId]);

    const updateCard = useCallback(async (id: string, updates: Partial<CardInventory>) => {
        setInventory(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            // Sync to Supabase
            if (isAuthenticated && userId) {
                const card = updated.find(c => c.id === id);
                if (card) {
                    upsertCard(card, userId).then(success => {
                        if (!success) setLastSyncError('Failed to update card in cloud');
                    });
                }
            }
            return updated;
        });
    }, [isAuthenticated, userId]);

    const removeCard = useCallback(async (id: string) => {
        setInventory(prev => prev.filter(c => c.id !== id));
        if (isAuthenticated) {
            const success = await deleteCardFromDb(id);
            if (!success) setLastSyncError('Failed to delete card from cloud');
        }
    }, [isAuthenticated]);

    // === Target Operations ===

    const addTarget = useCallback(async (target: TargetWatchlist) => {
        setTargets(prev => [target, ...prev]);
        if (isAuthenticated && userId) {
            const success = await upsertTarget(target, userId);
            if (!success) setLastSyncError('Failed to save target to cloud');
        }
    }, [isAuthenticated, userId]);

    const updateTarget = useCallback(async (id: string, updates: Partial<TargetWatchlist>) => {
        setTargets(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            if (isAuthenticated && userId) {
                const target = updated.find(t => t.id === id);
                if (target) {
                    upsertTarget(target, userId).then(success => {
                        if (!success) setLastSyncError('Failed to update target in cloud');
                    });
                }
            }
            return updated;
        });
    }, [isAuthenticated, userId]);

    const removeTarget = useCallback(async (id: string) => {
        setTargets(prev => prev.filter(t => t.id !== id));
        if (isAuthenticated) {
            const success = await deleteTargetFromDb(id);
            if (!success) setLastSyncError('Failed to delete target from cloud');
        }
    }, [isAuthenticated]);

    const markAcquired = useCallback((id: string) => {
        updateTarget(id, { status: 'acquired' });
    }, [updateTarget]);

    // === Bulk Operations ===

    const initializeFullInventory = useCallback(async () => {
        if (inventory.length === 0 || inventory.length < MOCK_CARDS.length) {
            setInventory(MOCK_CARDS);
            if (isAuthenticated && userId) {
                const success = await bulkUpsertCards(MOCK_CARDS, userId);
                if (!success) setLastSyncError('Failed to initialize cloud inventory');
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CARDS));
            }
        }
    }, [inventory.length, isAuthenticated, userId]);

    const refreshFromStorage = useCallback(() => {
        if (!isAuthenticated) {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setInventory(parsed);
                }
            } catch (e) {
                console.warn('Failed to refresh from storage', e);
            }
        }
    }, [isAuthenticated]);

    const persistSyncToCloud = useCallback(async (cards: CardInventory[], updatedTargets?: TargetWatchlist[]) => {
        if (isAuthenticated && userId) {
            const success = await bulkUpsertCards(cards, userId);
            if (!success) setLastSyncError('Failed to sync cards to cloud');

            if (updatedTargets && updatedTargets.length > 0) {
                const { bulkUpsertTargets } = await import('./supabaseData');
                const targetSuccess = await bulkUpsertTargets(updatedTargets, userId);
                if (!targetSuccess) setLastSyncError('Failed to sync targets to cloud');
            }
        }
    }, [isAuthenticated, userId]);

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
        isCloudSynced: isAuthenticated,
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
        totalCards: inventory.length
    };
}
