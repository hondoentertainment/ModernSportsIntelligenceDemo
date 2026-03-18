import React, { useState, useMemo } from 'react';
import { Link2, RefreshCw, ChevronRight, CheckCircle2, AlertTriangle, Loader2, Clock } from 'lucide-react';
import {
  getConnections,
  getSyncStatus,
  syncInventory,
  type MarketplaceConnection,
  type SyncStatus,
} from '../lib/trading/marketplaceIntegrationService';

interface MarketplaceIntegrationWidgetProps {
  onClick?: () => void;
}

function timeAgo(iso: string): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const MarketplaceIntegrationWidget: React.FC<MarketplaceIntegrationWidgetProps> = ({ onClick }) => {
  const connections = useMemo(() => getConnections(), []);
  const syncStatuses = useMemo(() => getSyncStatus(), []);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);

  const connectedCount = connections.filter((c) => c.status === 'connected').length;
  const errorCount = connections.filter((c) => c.status === 'error').length;
  const totalItems = connections.reduce((sum, c) => sum + c.itemsImported, 0);

  // Most recent sync across all platforms
  const lastSyncTime = useMemo(() => {
    const times = syncStatuses
      .map((s) => s.lastSync)
      .filter(Boolean)
      .map((t) => new Date(t).getTime());
    if (times.length === 0) return 'Never';
    return timeAgo(new Date(Math.max(...times)).toISOString());
  }, [syncStatuses]);

  const handleQuickSync = async (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncingPlatform(platform);
    try {
      await syncInventory(platform);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const connectedPlatforms = connections.filter((c) => c.status === 'connected');

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 cursor-pointer hover:border-blue-500/30 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Link2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Marketplace Integrations</h3>
            <p className="text-[11px] text-slate-400">
              {connectedCount} connected &middot; Last sync {lastSyncTime}
            </p>
          </div>
        </div>
        {onClick && (
          <button className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors">
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-center">
          <p className="text-lg font-bold text-white">{connectedCount}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Connected</p>
        </div>
        <div className="p-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-center">
          <p className="text-lg font-bold text-white">{totalItems.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Items</p>
        </div>
        <div className="p-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-center">
          <p className={`text-lg font-bold ${errorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {errorCount > 0 ? errorCount : 'OK'}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
            {errorCount > 0 ? 'Errors' : 'Health'}
          </p>
        </div>
      </div>

      {/* Quick sync buttons per connected platform */}
      <div className="space-y-1.5">
        {connectedPlatforms.slice(0, 3).map((conn) => {
          const isSyncing = syncingPlatform === conn.platform;
          const syncInfo = syncStatuses.find((s) => s.platform === conn.platform);

          return (
            <div key={conn.platform} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: conn.logoColor + '20', color: conn.logoColor }}
                >
                  {conn.platformLabel.slice(0, 2)}
                </span>
                <div>
                  <p className="text-xs font-medium text-white">{conn.platformLabel}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={9} />
                    {syncInfo ? timeAgo(syncInfo.lastSync) : 'No sync'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleQuickSync(conn.platform, e)}
                disabled={isSyncing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-colors"
                title={`Sync ${conn.platformLabel}`}
              >
                {isSyncing ? (
                  <Loader2 size={14} className="animate-spin text-blue-400" />
                ) : (
                  <RefreshCw size={14} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error indicator */}
      {errorCount > 0 && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-[11px] text-red-400">
            {errorCount} connection{errorCount > 1 ? 's' : ''} need attention
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplaceIntegrationWidget;
