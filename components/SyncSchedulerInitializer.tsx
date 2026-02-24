
import React, { useEffect } from 'react';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useMigration } from '../contexts/MigrationContext.tsx';
import { initializeScheduler, stopScheduler } from '../lib/syncScheduler.ts';
import { initPriceHistory, teardownPriceHistory, isPriceHistoryInitialized } from '../lib/priceHistory.ts';
import { bulkUpsertCards, bulkUpsertTargets } from '../lib/supabaseData.ts';
import { isDemoMode } from '../lib/supabase.ts';
import { showToast } from '../lib/toast.ts';
import type { CardInventory, TargetWatchlist } from '../types.ts';

const SyncSchedulerInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { inventory, targets, setInventory, setTargets, setSyncMeta, persistSyncToCloud } = useSupabaseInventory();
    const { user } = useAuth();
    const { isMigrating } = useMigration();

    // Hydrate price history from Supabase on login
    useEffect(() => {
        if (user?.id && !isPriceHistoryInitialized()) {
            initPriceHistory(user.id);
        }

        return () => {
            // Tear down on unmount (sign-out causes ProtectedRoute to unmount this)
            teardownPriceHistory();
        };
    }, [user?.id]);

    useEffect(() => {
        if (inventory.length > 0 && !isMigrating) {
            console.log('Initializing Automated Sync Scheduler...');
            const scheduler = initializeScheduler(inventory, targets, {
                onProgress: (p) => {
                    if (p.status === 'complete') {
                        console.log('Automatic sync complete');
                    }
                },
                onComplete: async (result) => {
                    const { inventory: updatedInventory, targets: updatedTargets, portfolio, watchlist } = result;
                    setInventory(updatedInventory);
                    setTargets(updatedTargets);

                    const totalValue = updatedInventory.reduce((sum, c) => sum + (c.currentValue ?? 0), 0);
                    setSyncMeta({
                        lastSyncTime: new Date().toISOString(),
                        totalValue,
                        assetCount: updatedInventory.length,
                    });

                    if (user?.id && !isDemoMode) {
                        await persistSyncToCloud(updatedInventory as CardInventory[], updatedTargets as TargetWatchlist[]);
                    }

                    if (watchlist.priceHits.length > 0) {
                        for (const hit of watchlist.priceHits) {
                            showToast('success', `${hit.player} hit target — $${hit.currentMarketPrice} ≤ $${hit.targetPrice}`, { dedupeKey: `price_hit_${hit.id}` });
                        }
                    }
                },
            });

            return () => {
                console.log('Stopping Automated Sync Scheduler...');
                stopScheduler();
            };
        }
    }, [inventory, targets, isMigrating, user?.id, setInventory, setTargets, setSyncMeta]);

    return <>{children}</>;
};

export default SyncSchedulerInitializer;
