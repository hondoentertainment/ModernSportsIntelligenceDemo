
import React, { useEffect } from 'react';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import { initializeScheduler, stopScheduler } from '../lib/syncScheduler.ts';

const SyncSchedulerInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { inventory, targets } = useSupabaseInventory();

    useEffect(() => {
        if (inventory.length > 0) {
            console.log('Initializing Automated Sync Scheduler...');
            const scheduler = initializeScheduler(inventory, targets, {
                onProgress: (p) => {
                    if (p.status === 'complete') {
                        console.log('Automatic sync complete');
                    }
                },
                onComplete: () => {
                    // Optional: refresh any global state if needed
                }
            });

            return () => {
                console.log('Stopping Automated Sync Scheduler...');
                stopScheduler();
            };
        }
    }, [inventory, targets]);

    return <>{children}</>;
};

export default SyncSchedulerInitializer;
