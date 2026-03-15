import React from 'react';
import {
  X,
  WifiOff,
  Wifi,
  RefreshCw,
  Clock,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  HardDrive,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { useOfflineStatus } from '../lib/useOfflineStatus';
import {
  getLastSyncTime,
  getStorageStats,
  getSyncQueue,
  getConflicts,
  getOfflineCapabilities,
} from '../lib/offlineService';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({ isOpen, onClose }) => {
  const { isOnline, status, isSyncing, pendingCount, failedCount, triggerSync, syncProgress } = useOfflineStatus();
  const lastSync = getLastSyncTime();
  const stats = getStorageStats();
  const queue = getSyncQueue();
  const conflicts = getConflicts().filter((c) => c.resolution === 'pending');
  const capabilities = getOfflineCapabilities();

  if (!isOpen) return null;

  const offlineReady = capabilities.filter((c) => c.availableOffline).length;
  const totalFeatures = capabilities.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {isOnline ? <Wifi size={20} className="text-emerald-400" /> : <WifiOff size={20} className="text-red-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Offline Status</h2>
              <p className="text-xs text-slate-500">Quick overview of offline capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Connection Status */}
          <div className={`rounded-xl p-4 border ${
            isOnline ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-red-900/20 border-red-700/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    isOnline ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                </span>
                <div>
                  <p className={`text-sm font-bold ${isOnline ? 'text-emerald-300' : 'text-red-300'}`}>
                    {isOnline ? 'Connected' : 'Offline Mode'}
                  </p>
                  <p className={`text-xs ${isOnline ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                    {isOnline ? 'All features available' : 'Limited to cached data'}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                status === 'syncing' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {status}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <Database size={16} className="mx-auto text-amber-400 mb-1" />
              <p className="text-lg font-bold text-slate-100">{pendingCount}</p>
              <p className="text-xs text-slate-500">Queued</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <ArrowLeftRight size={16} className="mx-auto text-red-400 mb-1" />
              <p className="text-lg font-bold text-slate-100">{conflicts.length}</p>
              <p className="text-xs text-slate-500">Conflicts</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
              <Shield size={16} className="mx-auto text-emerald-400 mb-1" />
              <p className="text-lg font-bold text-slate-100">{offlineReady}/{totalFeatures}</p>
              <p className="text-xs text-slate-500">Offline Ready</p>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-300">Storage Usage</span>
              </div>
              <span className="text-xs text-slate-500">
                {formatBytes(stats.usedBytes)} / {formatBytes(stats.totalBytes)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.usedBytes / stats.totalBytes) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {stats.cacheEntries} cache entries &middot; {stats.syncQueueSize} in queue
            </p>
          </div>

          {/* Sync Queue Preview */}
          {queue.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Pending Actions</p>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {queue.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        item.status === 'pending' ? 'bg-amber-400' : item.status === 'failed' ? 'bg-red-400' : 'bg-emerald-400'
                      }`} />
                      <span className="text-xs text-slate-300 truncate">
                        <span className="uppercase font-bold text-slate-500">{item.action}</span> {item.entity}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">{timeAgo(item.timestamp)}</span>
                  </div>
                ))}
                {queue.length > 5 && (
                  <p className="text-xs text-slate-500 text-center pt-1">+{queue.length - 5} more items</p>
                )}
              </div>
            </div>
          )}

          {/* Last Sync */}
          <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-slate-300">Last Sync</span>
            </div>
            <span className="text-xs text-slate-400">{lastSync ? timeAgo(lastSync) : 'Never synced'}</span>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing || !isOnline || pendingCount === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors"
          >
            {isSyncing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Syncing... {syncProgress ? `(${syncProgress.completed}/${syncProgress.total})` : ''}
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                {pendingCount > 0 ? `Sync ${pendingCount} Item${pendingCount !== 1 ? 's' : ''}` : 'Nothing to Sync'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineManagerModal;
