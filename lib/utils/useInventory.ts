import { logger } from '../logger';
import { useState, useEffect, useCallback } from 'react';
import { CardInventory, TargetWatchlist } from '../../types.ts';
import { MOCK_CARDS } from '../../constants.tsx';
import { store } from '../dal/syncStore';

const STORAGE_KEY = 'cardx_inventory';
const TARGETS_KEY = 'cardx_targets';
const SYNC_META_KEY = 'cardx_sync_meta';

export interface SyncMeta {
    lastSyncTime: string | null;
    totalValue: number;
    assetCount: number;
}

/**
 * Shared inventory hook - ensures Dashboard and Collection use the same data source
 */
export function useInventory() {
    const [inventory, setInventory] = useState<CardInventory[]>(() => {
        const parsed = store.get<CardInventory[]>(STORAGE_KEY, []);
        // Only use saved data if it has items
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        // Otherwise initialize with empty array for first-time onboarding experience
        return [];
    });

    const [targets, setTargets] = useState<TargetWatchlist[]>(() => {
        return store.get<TargetWatchlist[]>(TARGETS_KEY, []);
    });

    const [syncMeta, setSyncMeta] = useState<SyncMeta>(() => {
        return store.get<SyncMeta>(SYNC_META_KEY, { lastSyncTime: null, totalValue: 0, assetCount: 0 });
    });

    // Persist via syncStore (localStorage fast path + Supabase flush when signed in)
    useEffect(() => {
        store.set(STORAGE_KEY, inventory);
        store.set(TARGETS_KEY, targets);

        // Update sync meta
        const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
        const meta: SyncMeta = {
            lastSyncTime: syncMeta.lastSyncTime,
            totalValue,
            assetCount: inventory.length
        };
        store.set(SYNC_META_KEY, meta);
        setSyncMeta(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory, targets]);

    // Listen for storage events from other tabs/components
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const newInventory = JSON.parse(e.newValue);
                    if (Array.isArray(newInventory)) {
                        setInventory(newInventory);
                    }
                } catch (err) {
                    logger.warn('Failed to parse storage event', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateCard = useCallback((id: string, updates: Partial<CardInventory>) => {
        setInventory(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const addCard = useCallback((card: CardInventory) => {
        setInventory(prev => [card, ...prev]);
    }, []);

    const deleteCard = useCallback((id: string) => {
        setInventory(prev => prev.filter(c => c.id !== id));
    }, []);

    const refreshFromStorage = useCallback(() => {
        const parsed = store.get<CardInventory[]>(STORAGE_KEY, []);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setInventory(parsed);
        }
    }, []);

    // Force initialize with MOCK_CARDS if empty
    const initializeFullInventory = useCallback(() => {
        if (inventory.length === 0 || inventory.length < MOCK_CARDS.length) {
            setInventory(MOCK_CARDS);
            store.set(STORAGE_KEY, MOCK_CARDS);
        }
    }, [inventory.length]);

    const addTarget = useCallback((target: TargetWatchlist) => {
        setTargets(prev => [target, ...prev]);
    }, []);

    const updateTarget = useCallback((id: string, updates: Partial<TargetWatchlist>) => {
        setTargets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    return {
        inventory,
        setInventory,
        targets,
        setTargets,
        syncMeta,
        setSyncMeta,
        updateCard,
        addCard,
        deleteCard,
        addTarget,
        updateTarget,
        refreshFromStorage,
        initializeFullInventory,
        totalCards: inventory.length
    };
}

/**
 * Calculate inventory statistics
 */
export function calculateStats(inventory: CardInventory[]) {
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const grossCost = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const totalFees = inventory.reduce((sum, c) => sum + (c.gradingFees || 0) + (c.shippingFees || 0), 0);
    const totalCost = grossCost + totalFees;

    return {
        totalValue,
        totalCost,
        grossCost,
        totalFees,
        cardCount: inventory.length,
        profit: totalValue - totalCost,
        roi: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    };
}

// Re-export Supabase-aware hook for gradual migration
export { useSupabaseInventory } from './useSupabaseInventory';

