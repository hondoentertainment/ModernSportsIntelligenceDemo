import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  HardDrive,
  Activity,
  Shield,
  Zap,
  Database,
  ArrowLeftRight,
  FileJson,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  OfflineStatus,
  SyncQueueItem,
  ConflictResolution,
  OfflineCapability,
  OfflineStorageStats,
  getOfflineStatus,
  getSyncQueue,
  processSyncQueue,
  clearSyncQueue,
  getStorageStats,
  getConflicts,
  resolveConflict,
  clearCache,
  exportOfflineData,
  importOfflineData,
  getOfflineCapabilities,
  getLastSyncTime,
  prefetchData,
  SyncProgress,
} from '../lib/utils/offlineService';
import { useOfflineStatus } from '../lib/utils/useOfflineStatus';

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPulse({ status }: { status: OfflineStatus }) {
  const colorMap: Record<OfflineStatus, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    syncing: 'bg-amber-500',
  };
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorMap[status]}`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colorMap[status]}`} />
    </span>
  );
}

function NetworkQuality() {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const conn = (navigator as unknown as Record<string, unknown>).connection as
      | { effectiveType?: string; downlink?: number }
      | undefined;
    if (conn) {
      const etype = conn.effectiveType;
      if (etype === '4g') setQuality('excellent');
      else if (etype === '3g') setQuality('good');
      else if (etype === '2g') setQuality('fair');
      else setQuality('poor');
    } else {
      setQuality(navigator.onLine ? 'good' : 'offline');
    }
  }, []);

  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    excellent: { icon: <SignalHigh size={18} />, label: 'Excellent', color: 'text-emerald-400' },
    good: { icon: <SignalMedium size={18} />, label: 'Good', color: 'text-lime-400' },
    fair: { icon: <SignalLow size={18} />, label: 'Fair', color: 'text-amber-400' },
    poor: { icon: <Signal size={18} />, label: 'Poor', color: 'text-red-400' },
    offline: { icon: <WifiOff size={18} />, label: 'Offline', color: 'text-red-500' },
  };

  const c = config[quality];
  return (
    <div className={`flex items-center gap-2 ${c.color}`}>
      {c.icon}
      <span className="text-sm font-medium">{c.label}</span>
    </div>
  );
}

function formatTime(ts: number | null): string {
  if (!ts) return 'Never';
  const d = new Date(ts);
  return d.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(ts: number | null): string {
  if (!ts) return 'Never';
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const OfflineManager: React.FC = () => {
  const { isOnline: online, status, syncQueue: liveQueue, isSyncing, triggerSync, pendingCount, failedCount } = useOfflineStatus();
  const [storageStats, setStorageStats] = useState<OfflineStorageStats>(getStorageStats());
  const [conflicts, setConflicts] = useState<ConflictResolution[]>(getConflicts());
  const [capabilities] = useState<OfflineCapability[]>(getOfflineCapabilities());
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('queue');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [prefetching, setPrefetching] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStats = useCallback(() => {
    setStorageStats(getStorageStats());
    setConflicts(getConflicts());
  }, []);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  const handleSync = async () => {
    const progress = await processSyncQueue();
    setSyncProgress(progress);
    refreshStats();
  };

  const handleClearQueue = () => {
    clearSyncQueue();
    refreshStats();
  };

  const handleClearCache = () => {
    clearCache();
    refreshStats();
  };

  const handleExport = () => {
    const data = exportOfflineData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msi-offline-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    try {
      importOfflineData(importText);
      setImportText('');
      setShowImport(false);
      refreshStats();
    } catch {
      // handle error silently
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleResolveConflict = (itemId: string, resolution: 'local' | 'server') => {
    const conflict = conflicts.find((c) => c.itemId === itemId);
    if (!conflict) return;
    resolveConflict(itemId, { ...conflict, resolution });
    setConflicts(getConflicts());
  };

  const handlePrefetch = async (scope: string) => {
    setPrefetching(scope);
    await prefetchData(scope);
    setPrefetching(null);
    refreshStats();
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Chart data
  const storageChartData = useMemo(() => [
    { name: 'Used', value: storageStats.usedBytes, fill: '#3b82f6' },
    { name: 'Available', value: storageStats.availableBytes, fill: '#334155' },
  ], [storageStats]);

  const scopeChartData = useMemo(() => {
    return Object.entries(storageStats.byScope).map(([scope, bytes]) => ({
      name: scope.charAt(0).toUpperCase() + scope.slice(1),
      bytes,
    }));
  }, [storageStats]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const lastSync = getLastSyncTime();
  const syncScopes = ['portfolio', 'market', 'analytics', 'notifications', 'search'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30">
            {online ? <Wifi size={24} className="text-blue-400" /> : <WifiOff size={24} className="text-red-400" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Offline Manager</h1>
            <p className="text-sm text-slate-400">PWA Cache, Sync Queue & Conflict Resolution</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NetworkQuality />
          <StatusPulse status={status} />
          <span className={`text-sm font-semibold capitalize ${
            status === 'online' ? 'text-emerald-400' : status === 'syncing' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Status', value: status.toUpperCase(), icon: <Activity size={18} />, color: online ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Pending Syncs', value: String(pendingCount), icon: <Clock size={18} />, color: pendingCount > 0 ? 'text-amber-400' : 'text-slate-400' },
          { label: 'Failed Items', value: String(failedCount), icon: <XCircle size={18} />, color: failedCount > 0 ? 'text-red-400' : 'text-slate-400' },
          { label: 'Last Sync', value: timeAgo(lastSync), icon: <RefreshCw size={18} />, color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              {stat.icon}
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sync Queue */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('queue')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database size={18} className="text-amber-400" />
            <span className="text-sm font-bold text-slate-100">Sync Queue</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">{pendingCount} pending</span>
            )}
          </div>
          {expandedSection === 'queue' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'queue' && (
          <div className="border-t border-slate-700 p-4 space-y-3">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={handleSync}
                disabled={isSyncing || !online}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleClearQueue}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-semibold transition-colors"
              >
                <Trash2 size={14} />
                Clear Queue
              </button>
            </div>

            {/* Sync progress bar */}
            {syncProgress && (
              <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Sync Progress</span>
                  <span>{syncProgress.completed}/{syncProgress.total} completed</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: syncProgress.total ? `${(syncProgress.completed / syncProgress.total) * 100}%` : '0%' }}
                  />
                </div>
                {syncProgress.failed > 0 && (
                  <p className="text-xs text-red-400 mt-1">{syncProgress.failed} items failed</p>
                )}
              </div>
            )}

            {/* Queue items */}
            {liveQueue.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500/50" />
                <p className="text-sm">Queue is empty &mdash; all synced</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {liveQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                        item.status === 'pending' ? 'bg-amber-400' : item.status === 'completed' ? 'bg-emerald-400' : item.status === 'processing' ? 'bg-blue-400 animate-pulse' : 'bg-red-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          <span className="uppercase text-xs font-bold text-slate-400">{item.action}</span>{' '}
                          {item.entity}
                        </p>
                        <p className="text-xs text-slate-500">{timeAgo(item.timestamp)} {item.retryCount > 0 && `· ${item.retryCount} retries`}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conflict Resolution */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('conflicts')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={18} className="text-red-400" />
            <span className="text-sm font-bold text-slate-100">Conflict Resolution</span>
            {conflicts.filter((c) => c.resolution === 'pending').length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded-full">
                {conflicts.filter((c) => c.resolution === 'pending').length} conflicts
              </span>
            )}
          </div>
          {expandedSection === 'conflicts' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'conflicts' && (
          <div className="border-t border-slate-700 p-4 space-y-4">
            {conflicts.filter((c) => c.resolution === 'pending').length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Shield size={24} className="mx-auto mb-2 text-emerald-500/50" />
                <p className="text-sm">No conflicts to resolve</p>
              </div>
            ) : (
              conflicts.filter((c) => c.resolution === 'pending').map((conflict) => (
                <div key={conflict.id} className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{conflict.entity} / {conflict.itemId}</p>
                      <p className="text-xs text-slate-500">Detected {timeAgo(conflict.detectedAt)} &middot; Fields: {conflict.fieldConflicts.join(', ')}</p>
                    </div>
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-400 mb-2">Local Version</p>
                      {Object.entries(conflict.localVersion).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs py-0.5">
                          <span className={`text-slate-400 ${conflict.fieldConflicts.includes(key) ? 'font-bold text-blue-300' : ''}`}>{key}:</span>
                          <span className="text-slate-200">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-purple-400 mb-2">Server Version</p>
                      {Object.entries(conflict.serverVersion).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-xs py-0.5">
                          <span className={`text-slate-400 ${conflict.fieldConflicts.includes(key) ? 'font-bold text-purple-300' : ''}`}>{key}:</span>
                          <span className="text-slate-200">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveConflict(conflict.itemId, 'local')}
                      className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-bold transition-colors"
                    >
                      Keep Local
                    </button>
                    <button
                      onClick={() => handleResolveConflict(conflict.itemId, 'server')}
                      className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-xs font-bold transition-colors"
                    >
                      Use Server
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Storage Usage */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('storage')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-slate-100">Offline Storage</span>
            <span className="text-xs text-slate-500">{formatBytes(storageStats.usedBytes)} / {formatBytes(storageStats.totalBytes)}</span>
          </div>
          {expandedSection === 'storage' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'storage' && (
          <div className="border-t border-slate-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div>
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Storage Allocation</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={storageChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {storageChartData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatBytes(value)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend
                      formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart by scope */}
              <div>
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Cache by Scope</p>
                {scopeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scopeChartData}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v: number) => formatBytes(v)} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => formatBytes(value)}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="bytes" radius={[4, 4, 0, 0]}>
                        {scopeChartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">No scoped data cached</div>
                )}
              </div>
            </div>

            {/* Storage stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Cache Entries', value: String(storageStats.cacheEntries) },
                { label: 'Queue Size', value: String(storageStats.syncQueueSize) },
                { label: 'Conflicts', value: String(storageStats.conflictCount) },
                { label: 'Oldest Cache', value: timeAgo(storageStats.oldestCache) },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-sm font-bold text-slate-200">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Cache actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleClearCache}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 size={14} />
                Clear All Cache
              </button>
              <button
                onClick={refreshStats}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                <RotateCcw size={14} />
                Refresh Stats
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Offline Capabilities Matrix */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('capabilities')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-lime-400" />
            <span className="text-sm font-bold text-slate-100">Offline Capabilities</span>
          </div>
          {expandedSection === 'capabilities' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'capabilities' && (
          <div className="border-t border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs font-bold text-slate-400 px-4 py-3">Feature</th>
                    <th className="text-center text-xs font-bold text-slate-400 px-4 py-3">Offline</th>
                    <th className="text-center text-xs font-bold text-slate-400 px-4 py-3">Mode</th>
                    <th className="text-left text-xs font-bold text-slate-400 px-4 py-3 hidden sm:table-cell">Last Cached</th>
                    <th className="text-left text-xs font-bold text-slate-400 px-4 py-3 hidden md:table-cell">Description</th>
                    <th className="text-center text-xs font-bold text-slate-400 px-4 py-3">Prefetch</th>
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((cap) => (
                    <tr key={cap.feature} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-slate-200 font-medium">{cap.feature}</td>
                      <td className="px-4 py-3 text-center">
                        {cap.availableOffline ? (
                          <CheckCircle2 size={16} className="mx-auto text-emerald-400" />
                        ) : (
                          <XCircle size={16} className="mx-auto text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cap.availableOffline ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            cap.readOnly ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {cap.readOnly ? 'Read Only' : 'Full'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{timeAgo(cap.lastCached)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{cap.description}</td>
                      <td className="px-4 py-3 text-center">
                        {cap.availableOffline && cap.cacheDuration > 0 && (
                          <button
                            onClick={() => handlePrefetch(cap.feature.toLowerCase().replace(/\s/g, '_'))}
                            disabled={prefetching !== null}
                            className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                          >
                            {prefetching === cap.feature.toLowerCase().replace(/\s/g, '_') ? (
                              <Loader2 size={14} className="animate-spin mx-auto" />
                            ) : (
                              <Download size={14} className="mx-auto" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Last Sync Timestamps */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('timestamps')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-cyan-400" />
            <span className="text-sm font-bold text-slate-100">Sync Timestamps</span>
          </div>
          {expandedSection === 'timestamps' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'timestamps' && (
          <div className="border-t border-slate-700 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {syncScopes.map((scope) => {
              const ts = getLastSyncTime(scope);
              return (
                <div key={scope} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 capitalize">{scope}</p>
                    <p className="text-sm font-medium text-slate-300">{ts ? formatTime(ts) : 'Never synced'}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${ts ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Export / Import */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('export')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileJson size={18} className="text-emerald-400" />
            <span className="text-sm font-bold text-slate-100">Data Export / Import</span>
          </div>
          {expandedSection === 'export' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {expandedSection === 'export' && (
          <div className="border-t border-slate-700 p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors"
              >
                <Download size={16} />
                Export Offline Data
              </button>
              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-bold transition-colors"
              >
                <Upload size={16} />
                Import Data
              </button>
            </div>

            {showImport && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600"
                  />
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Or paste JSON data here..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Import
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineManager;
