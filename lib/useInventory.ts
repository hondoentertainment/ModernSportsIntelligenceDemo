
import { useState, useEffect, useCallback } from 'react';
import { CardInventory, TargetWatchlist } from '../types.ts';
import { MOCK_CARDS } from '../constants.tsx';

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
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only use saved data if it has items
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
            // Otherwise initialize with empty array for first-time onboarding experience
            return [];
        } catch (e) {
            console.warn('Failed to parse inventory from localStorage', e);
            return [];
        }
    });

    const [targets, setTargets] = useState<TargetWatchlist[]>(() => {
        try {
            const saved = localStorage.getItem(TARGETS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Failed to parse targets', e);
            return [];
        }
    });

    const [syncMeta, setSyncMeta] = useState<SyncMeta>(() => {
        try {
            const meta = localStorage.getItem(SYNC_META_KEY);
            if (meta) {
                return JSON.parse(meta);
            }
        } catch (e) {
            console.warn('Failed to parse sync meta', e);
        }
        return { lastSyncTime: null, totalValue: 0, assetCount: 0 };
    });

    // Persist inventory changes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));

        // Update sync meta
        const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
        const meta: SyncMeta = {
            lastSyncTime: syncMeta.lastSyncTime,
            totalValue,
            assetCount: inventory.length
        };
        localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
        setSyncMeta(meta);
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
                    console.warn('Failed to parse storage event', err);
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
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setInventory(parsed);
                }
            }
        } catch (e) {
            console.warn('Failed to refresh inventory from storage', e);
        }
    }, []);

    // Force initialize with MOCK_CARDS if empty
    const initializeFullInventory = useCallback(() => {
        if (inventory.length === 0 || inventory.length < MOCK_CARDS.length) {
            setInventory(MOCK_CARDS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CARDS));
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

