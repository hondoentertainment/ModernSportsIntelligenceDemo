import React, { useState, useMemo } from 'react';
import {
  X, Link2, Unlink, RefreshCw, CheckCircle2, AlertTriangle,
  Loader2, ExternalLink, ShieldCheck,
} from 'lucide-react';
import {
  getConnections,
  connectMarketplace,
  disconnectMarketplace,
  type MarketplaceConnection,
  type MarketplacePlatform,
} from '../lib/marketplaceIntegrationService';

interface MarketplaceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
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

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  connected: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
  disconnected: { dot: 'bg-slate-500', text: 'text-slate-400' },
  connecting: { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400' },
  error: { dot: 'bg-red-500', text: 'text-red-400' },
  expired: { dot: 'bg-orange-500', text: 'text-orange-400' },
};

const MarketplaceIntegrationModal: React.FC<MarketplaceIntegrationModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [connections, setConnections] = useState<MarketplaceConnection[]>(() => getConnections());
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [successPlatform, setSuccessPlatform] = useState<string | null>(null);

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  const handleConnect = async (platform: MarketplacePlatform) => {
    setConnectingPlatform(platform);
    setSuccessPlatform(null);
    try {
      const conn = await connectMarketplace(platform);
      setConnections((prev) => prev.map((c) => (c.platform === platform ? conn : c)));
      setSuccessPlatform(platform);
      setTimeout(() => setSuccessPlatform(null), 3000);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = (platform: string) => {
    disconnectMarketplace(platform);
    setConnections((prev) =>
      prev.map((c) =>
        c.platform === platform
          ? { ...c, status: 'disconnected' as const, username: '', lastSync: '' }
          : c
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Link2 size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Connect Marketplace</h2>
              <p className="text-xs text-slate-400">{connectedCount} of {connections.length} connected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Security note */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2 mb-4">
            <ShieldCheck size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-300/80">
              Connections use OAuth 2.0. We never store your marketplace password. Tokens can be revoked at any time.
            </p>
          </div>

          {connections.map((conn) => {
            const st = STATUS_STYLES[conn.status] || STATUS_STYLES.disconnected;
            const isConnecting = connectingPlatform === conn.platform;
            const justConnected = successPlatform === conn.platform;

            return (
              <div
                key={conn.id}
                className={`p-4 rounded-xl border transition-colors ${
                  justConnected
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: conn.logoColor + '20', color: conn.logoColor }}
                    >
                      {conn.platformLabel.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{conn.platformLabel}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                        <span className={`text-xs capitalize ${st.text}`}>
                          {isConnecting ? 'Authenticating...' : justConnected ? 'Connected!' : conn.status}
                        </span>
                        {conn.status === 'connected' && conn.username && (
                          <span className="text-xs text-slate-500 ml-1">@{conn.username}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {conn.status === 'connected' ? (
                      <button
                        onClick={() => handleDisconnect(conn.platform)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Unlink size={12} />
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(conn.platform as MarketplacePlatform)}
                        disabled={isConnecting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Connecting...
                          </>
                        ) : justConnected ? (
                          <>
                            <CheckCircle2 size={12} />
                            Connected!
                          </>
                        ) : (
                          <>
                            <Link2 size={12} />
                            Connect
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {conn.status === 'connected' && (
                  <div className="mt-3 flex gap-4 text-[11px] text-slate-400">
                    <span>{conn.itemsImported.toLocaleString()} items</span>
                    <span>{conn.totalSales} sales</span>
                    <span>Last sync: {timeAgo(conn.lastSync)}</span>
                  </div>
                )}

                {conn.status === 'error' && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400">
                    <AlertTriangle size={11} />
                    Token expired — reconnect to restore sync
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          {onNavigate && (
            <button
              onClick={() => {
                onClose();
                onNavigate();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              <ExternalLink size={14} />
              Open Full Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceIntegrationModal;
