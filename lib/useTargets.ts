
import { useState, useEffect, useCallback } from 'react';
import { TargetWatchlist } from '../types.ts';

const STORAGE_KEY = 'cardx_targets';

/**
 * Shared hook for managing acquisition targets/watchlist
 */
export function useTargets() {
    const [targets, setTargets] = useState<TargetWatchlist[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to parse targets from localStorage', e);
        }
        return [];
    });

    // Persist changes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
    }, [targets]);

    const addTarget = useCallback((target: Omit<TargetWatchlist, 'id' | 'createdAt' | 'status'>) => {
        const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11);

        const newTarget: TargetWatchlist = {
            ...target,
            id,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        setTargets(prev => [newTarget, ...prev]);
        return newTarget;
    }, []);

    const updateTarget = useCallback((id: string, updates: Partial<TargetWatchlist>) => {
        setTargets(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));
    }, []);

    const deleteTarget = useCallback((id: string) => {
        setTargets(prev => prev.filter(t => t.id !== id));
    }, []);

    const markAcquired = useCallback((id: string) => {
        updateTarget(id, { status: 'acquired' });
    }, [updateTarget]);

    const getActiveTargets = useCallback(() => {
        return targets.filter(t => t.status === 'active');
    }, [targets]);

    const getTargetsByPriority = useCallback((priority: 'High' | 'Medium' | 'Low') => {
        return targets.filter(t => t.priority === priority && t.status === 'active');
    }, [targets]);

    // Check if any targets have met their price threshold
    const checkTargetAlerts = useCallback((marketPrices: Record<string, number>) => {
        const alerts: TargetWatchlist[] = [];

        targets.forEach(target => {
            if (target.status === 'active') {
                const key = `${target.player}-${target.cardDescription}`.toLowerCase();
                const currentPrice = marketPrices[key];

                if (currentPrice && currentPrice <= target.targetPrice) {
                    alerts.push({ ...target, currentMarketPrice: currentPrice });
                }
            }
        });

        return alerts;
    }, [targets]);

    return {
        targets,
        setTargets,
        addTarget,
        updateTarget,
        deleteTarget,
        markAcquired,
        getActiveTargets,
        getTargetsByPriority,
        checkTargetAlerts,
        totalTargets: targets.length,
        activeTargets: targets.filter(t => t.status === 'active').length
    };
}
