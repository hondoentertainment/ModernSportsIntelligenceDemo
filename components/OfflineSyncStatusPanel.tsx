import React, { useMemo } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useOfflineStatus } from '../lib/utils/useOfflineStatus';
import { formatOfflineSyncLine, OFFLINE_SYNC_DISCLOSURE, summarizeSyncQueue } from '../lib/utils/offlineSyncStatus';

interface Props {
  compact?: boolean;
}

const OfflineSyncStatusPanel: React.FC<Props> = ({ compact }) => {
  const { isOnline, isSyncing, pendingCount, failedCount, triggerSync, retryFailed, syncQueue } = useOfflineStatus();
  const summary = useMemo(() => summarizeSyncQueue(syncQueue), [syncQueue]);

  if (isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing && compact) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-slate-800/70 bg-slate-950/40 p-3'
          : 'rounded-2xl border border-slate-800 bg-slate-900/60 p-4'
      }
      aria-label="Offline sync status"
    >
      <div className="mb-2 flex items-center gap-2">
        <WifiOff size={14} className="text-amber-300" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Offline queue</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-400">{OFFLINE_SYNC_DISCLOSURE}</p>
      <p className="mt-2 font-mono text-xs text-slate-200">{formatOfflineSyncLine(summary)}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
        {isOnline ? 'Uplink available' : 'Device offline'} · {isSyncing ? 'syncing' : 'idle'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void triggerSync()}
          disabled={!isOnline || isSyncing || pendingCount + failedCount === 0}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-brand-teal px-3 py-2 text-[10px] font-black uppercase tracking-widest text-brand-charcoal disabled:opacity-40"
        >
          <RefreshCw size={12} aria-hidden />
          Retry sync
        </button>
        {failedCount > 0 && (
          <button
            type="button"
            onClick={() => void retryFailed()}
            disabled={!isOnline || isSyncing}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-400/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-200 disabled:opacity-40"
          >
            Requeue failed
          </button>
        )}
      </div>
    </section>
  );
};

export default OfflineSyncStatusPanel;
