import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  X,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { useOfflineStatus } from '../lib/useOfflineStatus';

interface OfflineIndicatorProps {
  compact?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ compact = false }) => {
  const { isOnline, status, isSyncing, pendingCount, failedCount, triggerSync, syncProgress } = useOfflineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  // Re-show banner when status changes
  useEffect(() => {
    if (prevOnline !== isOnline) {
      setDismissed(false);
      setPrevOnline(isOnline);
    }
  }, [isOnline, prevOnline]);

  // Compact mode: persistent inline indicator
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {!isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
        </span>
        {!isOnline && (
          <span className="text-xs font-medium text-red-400">Offline</span>
        )}
        {pendingCount > 0 && (
          <span className="text-xs text-amber-400 font-medium">{pendingCount} queued</span>
        )}
        {isSyncing && (
          <Loader2 size={12} className="text-blue-400 animate-spin" />
        )}
      </div>
    );
  }

  // Don't render full banner if online and no pending/failed items
  if (isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing) {
    return null;
  }

  if (dismissed) return null;

  // Determine banner style
  const isOffline = !isOnline;
  const bgColor = isOffline
    ? 'bg-red-900/90 border-red-700'
    : isSyncing
    ? 'bg-blue-900/90 border-blue-700'
    : 'bg-amber-900/90 border-amber-700';
  const textColor = isOffline ? 'text-red-100' : isSyncing ? 'text-blue-100' : 'text-amber-100';

  return (
    <div className={`${bgColor} border-b px-4 py-2.5 flex items-center justify-between gap-3 z-50`}>
      <div className="flex items-center gap-3 min-w-0">
        {isOffline ? (
          <WifiOff size={18} className="text-red-300 flex-shrink-0" />
        ) : isSyncing ? (
          <Loader2 size={18} className="text-blue-300 animate-spin flex-shrink-0" />
        ) : (
          <CloudOff size={18} className="text-amber-300 flex-shrink-0" />
        )}

        <div className="min-w-0">
          <p className={`text-sm font-semibold ${textColor}`}>
            {isOffline
              ? 'You are offline'
              : isSyncing
              ? 'Syncing data...'
              : `${pendingCount} action${pendingCount !== 1 ? 's' : ''} queued`}
          </p>
          <p className={`text-xs ${isOffline ? 'text-red-300' : isSyncing ? 'text-blue-300' : 'text-amber-300'}`}>
            {isOffline
              ? 'Changes will be saved locally and synced when you reconnect.'
              : isSyncing && syncProgress
              ? `${syncProgress.completed}/${syncProgress.total} items synced`
              : failedCount > 0
              ? `${failedCount} failed item${failedCount !== 1 ? 's' : ''} need attention`
              : 'Items will sync automatically when possible.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!isOffline && pendingCount > 0 && !isSyncing && (
          <button
            onClick={() => triggerSync()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
          >
            <RefreshCw size={12} />
            Sync Now
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={14} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;
