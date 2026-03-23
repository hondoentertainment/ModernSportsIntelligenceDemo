import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, Link2, AlertTriangle, Ghost, QrCode, Clock, CheckCircle, XCircle, ArrowRightLeft, Camera, X } from 'lucide-react';
import CameraFeed from '../components/CameraFeed.tsx';
import { isBarcodeDetectionSupported } from '../lib/utils/barcodeDetection.ts';
import {
  getConnections,
  getSyncedInventory,
  getSyncConflicts,
  getGhostListings,
  getSyncReport,
  getCrossplatformValue,
  getSyncHistory,
  getCostBasisByPlatform,
  syncNow,
  resolveConflict,
  bulkScanQR,
  type SyncConnection,
  type SyncedCard,
  type SyncConflict,
  type GhostListing,
  type SyncReport,
  type CrossPlatformValue,
  type SyncHistoryEntry,
  type PlatformCostBasis,
} from '../lib/core/inventorySyncService.ts';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  ebay: '#3b82f6',
  psa_registry: '#8b5cf6',
  comc: '#f59e0b',
  alt_vault: '#10b981',
  fanatics_collect: '#ef4444',
  myslabs: '#6b7280',
};

const STATUS_STYLES: Record<string, string> = {
  connected: 'bg-emerald-500/20 text-emerald-400',
  disconnected: 'bg-slate-700 text-slate-400',
  syncing: 'bg-blue-500/20 text-blue-400',
  error: 'bg-red-500/20 text-red-400',
};

const LISTING_STATUS_STYLES: Record<string, string> = {
  listed: 'bg-emerald-500/20 text-emerald-400',
  sold: 'bg-blue-500/20 text-blue-400',
  vaulted: 'bg-purple-500/20 text-purple-400',
  in_transit: 'bg-amber-500/20 text-amber-400',
  unlisted: 'bg-slate-700 text-slate-400',
};

const InventorySync: React.FC = () => {
  const [connections, setConnections] = useState<SyncConnection[]>([]);
  const [inventory, setInventory] = useState<SyncedCard[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [ghostListings, setGhostListings] = useState<GhostListing[]>([]);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [crossPlatformValue, setCrossPlatformValue] = useState<CrossPlatformValue[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);
  const [costBasis, setCostBasis] = useState<PlatformCostBasis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [scanCodes, setScanCodes] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const appendScannedCode = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setScanCodes((prev) => {
      const lines = prev
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.includes(v)) return prev;
      return prev.trim() ? `${prev.trim()}\n${v}` : v;
    });
  }, []);

  useEffect(() => {
    try {
      setConnections(getConnections());
      setInventory(getSyncedInventory());
      setConflicts(getSyncConflicts());
      setGhostListings(getGhostListings());
      setReport(getSyncReport());
      setCrossPlatformValue(getCrossplatformValue());
      setSyncHistory(getSyncHistory());
      setCostBasis(getCostBasisByPlatform());
      setLoading(false);
    } catch {
      setError('Failed to load inventory sync data');
      setLoading(false);
    }
  }, []);

  const filteredInventory = useMemo(() => {
    if (!platformFilter) return inventory;
    return inventory.filter((c) => c.platform === platformFilter);
  }, [inventory, platformFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Inventory Sync...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  const pieData = crossPlatformValue.filter((v) => v.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <RefreshCw size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Multi-Platform Inventory Sync</h1>
            <p className="text-sm text-slate-400">
              Universal collection manager &amp; cross-platform sync &mdash; Phase 137
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
          >
            <option value="">All Platforms</option>
            {connections.map((c) => (
              <option key={c.platform} value={c.platform}>{c.platformLabel}</option>
            ))}
          </select>
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase ${
            report?.sync_health === 'healthy' ? 'bg-emerald-500/20 text-emerald-300' :
            report?.sync_health === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {report?.sync_health}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Platforms Connected</p>
          <p className="text-3xl font-bold text-cyan-400">{report?.platforms_connected}</p>
          <p className="text-xs text-slate-600 mt-1">of 6 available</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Synced Items</p>
          <p className="text-3xl font-bold text-white">{report?.total_synced}</p>
          <p className="text-xs text-slate-600 mt-1">Across all platforms</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cross-Platform Value</p>
          <p className="text-3xl font-bold text-emerald-400">${((report?.total_value || 0) / 1000).toFixed(1)}k</p>
          <p className="text-xs text-emerald-400/70 mt-1">+${((report?.total_profit_loss || 0) / 1000).toFixed(1)}k P/L</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pending Conflicts</p>
          <p className="text-3xl font-bold text-amber-400">{report?.conflicts_pending}</p>
          <p className="text-xs text-red-400/70 mt-1">{ghostListings.length} ghost alert{ghostListings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Platform Connection Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Link2 size={18} className="text-cyan-400" />
          Platform Connections
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {connections.map((conn) => (
            <div key={conn.platform} className={`bg-slate-900/50 border rounded-xl p-4 ${
              conn.status === 'connected' ? 'border-emerald-500/30' :
              conn.status === 'syncing' ? 'border-blue-500/30' :
              conn.status === 'error' ? 'border-red-500/30' : 'border-slate-700/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{conn.platformLabel}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLES[conn.status]}`}>
                  {conn.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{conn.items_count} items &bull; {conn.sync_frequency}</p>
              {conn.api_key_masked && (
                <p className="text-[10px] text-slate-600 mb-2">Key: {conn.api_key_masked}</p>
              )}
              {conn.error_message && (
                <p className="text-[10px] text-red-400 mb-2">{conn.error_message}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {(conn.status === 'connected' || conn.status === 'error') && (
                  <button
                    onClick={() => syncNow(conn.platform)}
                    className="text-[10px] px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    Sync Now
                  </button>
                )}
                {conn.status === 'disconnected' && (
                  <button className="text-[10px] px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Inventory Table & Value Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-blue-400" />
            Unified Inventory ({filteredInventory.length} items)
          </h2>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredInventory.slice(0, 20).map((card) => (
              <div key={card.card_id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{card.card_name}</p>
                  <p className="text-[10px] text-slate-500">{card.player} &bull; {card.grade} &bull; {card.year}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLORS[card.platform]}20`, color: PLATFORM_COLORS[card.platform] }}>
                    {connections.find((c) => c.platform === card.platform)?.platformLabel || card.platform}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${card.price.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-400">+{Math.round(((card.price - card.cost_basis) / card.cost_basis) * 100)}% ROI</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${LISTING_STATUS_STYLES[card.listing_status]}`}>
                    {card.listing_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Platform Value Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Value Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="platformLabel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ platformLabel, percentage }) => `${platformLabel} ${percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {costBasis.map((cb) => (
              <div key={cb.platform} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{cb.platformLabel}</span>
                <span className={cb.roi_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}>{cb.roi_percent}% ROI</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Conflicts & Ghost Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Conflicts */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Sync Conflicts ({conflicts.length})
          </h2>
          <div className="space-y-3">
            {conflicts.map((c) => (
              <div key={c.id} className={`bg-slate-900/50 border rounded-xl p-4 ${
                c.severity === 'high' ? 'border-red-500/30' : c.severity === 'medium' ? 'border-amber-500/30' : 'border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{c.card_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    c.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    c.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                  }`}>{c.severity}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">
                  Field: <span className="text-slate-300">{c.field}</span> &bull;
                  Local: <span className="text-cyan-400">{c.local_value}</span> &bull;
                  Remote: <span className="text-amber-400">{c.remote_value}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resolveConflict(c.id, 'accept_local')}
                    className="text-[10px] px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    Keep Local
                  </button>
                  <button
                    onClick={() => resolveConflict(c.id, 'accept_remote')}
                    className="text-[10px] px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                  >
                    Accept Remote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ghost Listings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Ghost size={18} className="text-red-400" />
            Ghost Listing Alerts ({ghostListings.length})
          </h2>
          <div className="space-y-3">
            {ghostListings.map((g) => (
              <div key={g.id} className="bg-slate-900/50 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">{g.card_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    g.status === 'confirmed_theft' ? 'bg-red-500/20 text-red-400' :
                    g.status === 'investigating' ? 'bg-amber-500/20 text-amber-400' :
                    g.status === 'false_positive' ? 'bg-slate-700 text-slate-400' : 'bg-red-500/20 text-red-300'
                  }`}>{g.status.replace('_', ' ')}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-1">
                  Seller: <span className="text-red-300">{g.seller}</span> &bull;
                  Platform: {connections.find((c) => c.platform === g.found_platform)?.platformLabel}
                </p>
                <p className="text-[10px] text-slate-500 mb-1">
                  Listed at: <span className="text-white">${g.listed_price.toLocaleString()}</span> &bull;
                  Your cost: <span className="text-slate-300">${g.your_cost_basis.toLocaleString()}</span>
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-600">Confidence: {Math.round(g.confidence * 100)}%</span>
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${g.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync History & Bulk QR Scan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync History */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-slate-400" />
            Sync History
          </h2>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {syncHistory.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-2 bg-slate-900/50 border border-slate-700/30 rounded-lg">
                {entry.success ? (
                  <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-white">{entry.description}</p>
                  <p className="text-[10px] text-slate-600">
                    {connections.find((c) => c.platform === entry.platform)?.platformLabel} &bull;
                    {new Date(entry.timestamp).toLocaleString()} &bull;
                    {entry.items_affected} item{entry.items_affected !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk QR Scan */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-purple-400" />
            Bulk QR / Barcode Scan
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Enter PSA cert numbers, eBay item IDs, or barcode values (one per line) to quickly match against your synced inventory.
          </p>
          <textarea
            value={scanCodes}
            onChange={(e) => setScanCodes(e.target.value)}
            placeholder={'PSA-78341201\neb-394821\ncomc-881204'}
            className="w-full h-28 px-3 py-2 text-sm bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded-lg resize-none placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => {
              const codes = scanCodes.split('\n').filter((c) => c.trim());
              if (codes.length > 0) {
                const results = bulkScanQR(codes);
                alert(`Scanned ${codes.length} codes: ${results.filter((r) => r.matched).length} matched, ${results.filter((r) => !r.matched).length} unmatched`);
              }
            }}
            className="mt-3 w-full px-4 py-2 text-sm font-bold bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            Scan &amp; Match ({scanCodes.split('\n').filter((c) => c.trim()).length} codes)
          </button>
        </div>
      </div>

      {scannerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inventory-scan-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
              <span id="inventory-scan-title" className="text-sm font-bold text-white">
                Scan barcode or QR
              </span>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close scanner"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {!isBarcodeDetectionSupported() && (
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  Live barcode decode is not available in this browser. Use Chrome or Edge (including Android), or paste codes in the field
                  below.
                </p>
              )}
              <CameraFeed
                isActive={scannerOpen}
                onCapture={() => {}}
                onBarcodeDetected={isBarcodeDetectionSupported() ? appendScannedCode : undefined}
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Point at a PSA cert QR, product UPC, or other supported code. Values append to the bulk list; close when finished.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySync;
