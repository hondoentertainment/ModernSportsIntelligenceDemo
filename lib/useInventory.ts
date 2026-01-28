
import { useState, useEffect, useCallback } from 'react';
import { CardInventory } from '../types.ts';
import { MOCK_CARDS } from '../constants.tsx';

const STORAGE_KEY = 'cardx_inventory';
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
            // Otherwise initialize with full MOCK_CARDS
            return MOCK_CARDS;
        } catch (e) {
            console.warn('Failed to parse inventory from localStorage', e);
            return MOCK_CARDS;
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

        // Update sync meta
        const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
        const meta: SyncMeta = {
            lastSyncTime: syncMeta.lastSyncTime,
            totalValue,
            assetCount: inventory.length
        };
        localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
        setSyncMeta(meta);
    }, [inventory]);

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

    return {
        inventory,
        setInventory,
        syncMeta,
        setSyncMeta,
        updateCard,
        addCard,
        deleteCard,
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
    const totalCost = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);

    return {
        totalValue,
        totalCost,
        cardCount: inventory.length,
        profit: totalValue - totalCost,
        roi: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    };
}
