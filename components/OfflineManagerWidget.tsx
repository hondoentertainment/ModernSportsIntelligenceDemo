import React from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Clock,
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useOfflineStatus } from '../lib/utils/useOfflineStatus';
import { getLastSyncTime, getStorageStats } from '../lib/utils/offlineService';

interface OfflineManagerWidgetProps {
  onViewDetails?: () => void;
}

function timeAgo(ts: number | null): string {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const OfflineManagerWidget: React.FC<OfflineManagerWidgetProps> = ({ onViewDetails }) => {
  const { isOnline, status, isSyncing, pendingCount, failedCount, triggerSync } = useOfflineStatus();
  const lastSync = getLastSyncTime();
  const stats = getStorageStats();

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {isOnline ? <Wifi size={18} className="text-emerald-400" /> : <WifiOff size={18} className="text-red-400" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Offline Status</h3>
            <p className="text-xs text-slate-500">PWA Cache & Sync</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {!isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status === 'online' ? 'bg-emerald-400' : status === 'syncing' ? 'bg-amber-400' : 'bg-red-400'
            }`} />
          </span>
          <span className={`text-xs font-semibold capitalize ${
            status === 'online' ? 'text-emerald-400' : status === 'syncing' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Database size={12} />
            <span className="text-xs">Queued</span>
          </div>
          <p className={`text-lg font-bold ${pendingCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {pendingCount}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Clock size={12} />
            <span className="text-xs">Last Sync</span>
          </div>
          <p className="text-sm font-bold text-slate-300">{timeAgo(lastSync)}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <AlertCircle size={12} />
            <span className="text-xs">Failed</span>
          </div>
          <p className={`text-lg font-bold ${failedCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
            {failedCount}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Database size={12} />
            <span className="text-xs">Cached</span>
          </div>
          <p className="text-sm font-bold text-slate-300">{formatBytes(stats.usedBytes)}</p>
        </div>
      </div>

      {/* Storage Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Storage</span>
          <span>{Math.round((stats.usedBytes / stats.totalBytes) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (stats.usedBytes / stats.totalBytes) * 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => triggerSync()}
          disabled={isSyncing || !isOnline || pendingCount === 0}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors"
        >
          {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineManagerWidget;
