// ─── React Hook: Offline Status ──────────────────────────────────────────────
// Provides real-time online/offline status, sync queue state, and auto-sync.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  OfflineStatus,
  SyncQueueItem,
  SyncProgress,
  getOfflineStatus,
  isOnline as checkOnline,
  getSyncQueue,
  processSyncQueue,
  onStatusChange,
} from './offlineService';

export interface UseOfflineStatusReturn {
  isOnline: boolean;
  status: OfflineStatus;
  lastOnline: number | null;
  syncQueue: SyncQueueItem[];
  syncProgress: SyncProgress | null;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
  pendingCount: number;
  failedCount: number;
}

export function useOfflineStatus(): UseOfflineStatusReturn {
  const [status, setStatus] = useState<OfflineStatus>(getOfflineStatus());
  const [online, setOnline] = useState<boolean>(checkOnline());
  const [lastOnline, setLastOnline] = useState<number | null>(checkOnline() ? Date.now() : null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(getSyncQueue());
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  // Refresh the sync queue periodically
  const refreshQueue = useCallback(() => {
    setSyncQueue(getSyncQueue());
  }, []);

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    if (syncingRef.current || !checkOnline()) return;
    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const progress = await processSyncQueue();
      setSyncProgress(progress);
      refreshQueue();
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshQueue]);

  // Listen for status changes
  useEffect(() => {
    const unsubscribe = onStatusChange((newStatus) => {
      setStatus(newStatus);
      const nowOnline = newStatus !== 'offline';
      setOnline(nowOnline);
      if (nowOnline) {
        setLastOnline(Date.now());
      }
    });
    return unsubscribe;
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setLastOnline(Date.now());
      setStatus('online');
      // Auto-sync after a short delay
      setTimeout(() => {
        triggerSync();
      }, 1000);
    };

    const handleOffline = () => {
      setOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Periodically refresh queue state
  useEffect(() => {
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, [refreshQueue]);

  const pendingCount = syncQueue.filter((i) => i.status === 'pending').length;
  const failedCount = syncQueue.filter((i) => i.status === 'failed').length;

  return {
    isOnline: online,
    status,
    lastOnline,
    syncQueue,
    syncProgress,
    isSyncing,
    triggerSync,
    pendingCount,
    failedCount,
  };
}

export default useOfflineStatus;
