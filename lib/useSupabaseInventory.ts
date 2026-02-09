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

    // Load data on mount or auth change
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (isAuthenticated && userId) {
                // 1. Check if we need to migrate local data first
                if (needsMigration()) {
                    setIsMigrating(true);
                    const migrationResult = await migrateToSupabase(userId);
                    if (migrationResult.success) {
                        console.log('Migration successful:', migrationResult);
                    }
                    setIsMigrating(false);
                }

                // 2. Fetch from Supabase
                const [cards, watchlist] = await Promise.all([
                    fetchCards(userId),
                    fetchTargets(userId)
                ]);
                setInventory(cards);
                setTargets(watchlist);
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
            await upsertCard(card, userId);
        }
    }, [isAuthenticated, userId]);

    const updateCard = useCallback(async (id: string, updates: Partial<CardInventory>) => {
        setInventory(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            // Sync to Supabase
            if (isAuthenticated && userId) {
                const card = updated.find(c => c.id === id);
                if (card) upsertCard(card, userId);
            }
            return updated;
        });
    }, [isAuthenticated, userId]);

    const removeCard = useCallback(async (id: string) => {
        setInventory(prev => prev.filter(c => c.id !== id));
        if (isAuthenticated) {
            await deleteCardFromDb(id);
        }
    }, [isAuthenticated]);

    // === Target Operations ===

    const addTarget = useCallback(async (target: TargetWatchlist) => {
        setTargets(prev => [target, ...prev]);
        if (isAuthenticated && userId) {
            await upsertTarget(target, userId);
        }
    }, [isAuthenticated, userId]);

    const updateTarget = useCallback(async (id: string, updates: Partial<TargetWatchlist>) => {
        setTargets(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            if (isAuthenticated && userId) {
                const target = updated.find(t => t.id === id);
                if (target) upsertTarget(target, userId);
            }
            return updated;
        });
    }, [isAuthenticated, userId]);

    const removeTarget = useCallback(async (id: string) => {
        setTargets(prev => prev.filter(t => t.id !== id));
        if (isAuthenticated) {
            await deleteTargetFromDb(id);
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
                await bulkUpsertCards(MOCK_CARDS, userId);
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

    return {
        inventory,
        setInventory,
        targets,
        setTargets,
        loading,
        isMigrating,
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
        totalCards: inventory.length
    };
}
