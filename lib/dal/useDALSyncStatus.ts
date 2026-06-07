/**
 * useDALSyncStatus — exposes the current DAL sync state to React components.
 *
 * Usage:
 *   const { syncing, hydrated, lastError } = useDALSyncStatus();
 *
 *   syncing   — true while any dirty keys are being flushed to Supabase
 *   hydrated  — true once the initial Supabase hydration has completed
 *   lastError — the most recent Supabase write error message, or null
 *
 * The hook re-renders only when one of these values changes, so it is safe to
 * use in frequently-rendering components (e.g. a save-indicator icon in a header).
 */

import { useEffect, useState } from 'react';
import { store } from './syncStore';

export interface DALSyncStatus {
  /** True while dirty keys are being written to the remote adapter. */
  syncing: boolean;
  /** True once the initial hydration from Supabase has completed. */
  hydrated: boolean;
  /** The most recent DAL write-error message, or null when all writes succeeded. */
  lastError: string | null;
}

export function useDALSyncStatus(): DALSyncStatus {
  const [status, setStatus] = useState<DALSyncStatus>(() => store.getSyncStatus());

  useEffect(() => {
    // Keep in sync with store changes
    const unsubscribe = store.onStatusChange(() => {
      setStatus(store.getSyncStatus());
    });
    // Snapshot on mount in case status changed between render and effect
    setStatus(store.getSyncStatus());
    return unsubscribe;
  }, []);

  return status;
}
