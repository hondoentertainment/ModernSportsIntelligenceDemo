import React, { useState, useEffect, useMemo } from 'react';
import {
  Link2, Unlink, RefreshCw, ArrowDownCircle, ArrowUpCircle,
  TrendingUp, DollarSign, BarChart3, ShoppingCart, Clock,
  AlertTriangle, CheckCircle2, Loader2, Search, ExternalLink,
  Zap, Eye, Package, PieChart as PieChartIcon, Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
  getConnections,
  connectMarketplace,
  disconnectMarketplace,
  getSyncStatus,
  importPurchases,
  getRecentImports,
  getMarketplaceListings,
  getRecentSales,
  getCrossMarketplacePricing,
  getMarketplaceAnalytics,
  getSellThroughRates,
  getMarketplaceFees,
  syncInventory,
  type MarketplaceConnection,
  type MarketplacePlatform,
  type ImportBatch,
  type SyncStatus,
  type MarketplaceListing,
  type MarketplaceSale,
  type CrossMarketplacePrice,
  type MarketplaceAnalytics,
  type SellThroughRate,
  type MarketplaceFee,
} from '../lib/trading/marketplaceIntegrationService';

type TabId = 'connections' | 'imports' | 'listings' | 'pricing' | 'fees' | 'analytics';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'connections', label: 'Connections', icon: <Link2 size={16} /> },
  { id: 'imports', label: 'Import History', icon: <ArrowDownCircle size={16} /> },
  { id: 'listings', label: 'Listings', icon: <Package size={16} /> },
  { id: 'pricing', label: 'Price Compare', icon: <DollarSign size={16} /> },
  { id: 'fees', label: 'Fee Analysis', icon: <BarChart3 size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
];

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  connected: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  disconnected: { dot: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10' },
  connecting: { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  error: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
  expired: { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10' },
};

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

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MarketplaceIntegrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('connections');
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [sales, setSales] = useState<MarketplaceSale[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [crossPrices, setCrossPrices] = useState<CrossMarketplacePrice[]>([]);
  const [analytics, setAnalytics] = useState<MarketplaceAnalytics | null>(null);
  const [sellThrough, setSellThrough] = useState<SellThroughRate[]>([]);
  const [fees, setFees] = useState<MarketplaceFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [importingPlatform, setImportingPlatform] = useState<string | null>(null);
  const [priceSearch, setPriceSearch] = useState('');
  const [listingFilter, setListingFilter] = useState<string>('all');

  useEffect(() => {
    try {
      setConnections(getConnections());
      setImports(getRecentImports());
      setListings(getMarketplaceListings());
      setSales(getRecentSales());
      setSyncStatuses(getSyncStatus());
      setCrossPrices(getCrossMarketplacePricing(''));
      setAnalytics(getMarketplaceAnalytics());
      setSellThrough(getSellThroughRates('ebay'));
      setFees(getMarketplaceFees());
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConnect = async (platform: MarketplacePlatform) => {
    setConnectingPlatform(platform);
    try {
      const conn = await connectMarketplace(platform);
      setConnections((prev) => prev.map((c) => (c.platform === platform ? conn : c)));
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = (platform: string) => {
    disconnectMarketplace(platform);
    setConnections((prev) =>
      prev.map((c) =>
        c.platform === platform ? { ...c, status: 'disconnected' as const, username: '', lastSync: '' } : c
      )
    );
  };

  const handleSync = async (platform: string) => {
    setSyncingPlatform(platform);
    try {
      const result = await syncInventory(platform);
      setSyncStatuses((prev) => {
        const existing = prev.findIndex((s) => s.platform === platform);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = result;
          return copy;
        }
        return [...prev, result];
      });
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleImport = async (platform: string) => {
    setImportingPlatform(platform);
    try {
      const batch = await importPurchases(platform);
      setImports((prev) => [batch, ...prev]);
    } finally {
      setImportingPlatform(null);
    }
  };

  const handlePriceSearch = () => {
    setCrossPrices(getCrossMarketplacePricing(priceSearch));
  };

  const filteredListings = useMemo(() => {
    if (listingFilter === 'all') return listings;
    return listings.filter((l) => l.platform === listingFilter);
  }, [listings, listingFilter]);

  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Link2 size={24} className="text-blue-400" />
                </div>
                Marketplace Integrations
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {connectedCount} of {connections.length} platforms connected
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <Activity size={12} className="inline mr-1" />
                Live Sync Active
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* === CONNECTIONS TAB === */}
        {activeTab === 'connections' && (
          <>
            {/* Connection Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {connections.map((conn) => {
                const st = STATUS_STYLES[conn.status] || STATUS_STYLES.disconnected;
                const isConnecting = connectingPlatform === conn.platform;
                const isSyncing = syncingPlatform === conn.platform;

                return (
                  <div
                    key={conn.id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors"
                  >
                    {/* Platform header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: conn.logoColor + '20', color: conn.logoColor }}
                        >
                          {conn.platformLabel.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{conn.platformLabel}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span className={`text-xs capitalize ${st.text}`}>
                              {isConnecting ? 'Connecting...' : conn.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connection info */}
                    {conn.status === 'connected' && (
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Username</span>
                          <span className="text-slate-200">@{conn.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Items</span>
                          <span className="text-slate-200">{conn.itemsImported.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Revenue</span>
                          <span className="text-emerald-400">{fmtCurrency(conn.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Sync</span>
                          <span className="text-slate-200">{timeAgo(conn.lastSync)}</span>
                        </div>
                      </div>
                    )}

                    {conn.status === 'error' && (
                      <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Token expired - reconnect required
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {conn.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => handleSync(conn.platform)}
                            disabled={isSyncing}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            {isSyncing ? 'Syncing...' : 'Sync'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(conn.platform)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Unlink size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(conn.platform as MarketplacePlatform)}
                          disabled={isConnecting}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Authenticating...
                            </>
                          ) : (
                            <>
                              <Link2 size={14} />
                              Connect {conn.platformLabel}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sync Status Section */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-400" />
                Sync Status
              </h2>
              <div className="space-y-3">
                {syncStatuses.map((ss) => (
                  <div key={ss.platform} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-900/50">
                    <div className="flex items-center gap-3 sm:w-40">
                      <span className="font-medium text-white text-sm">{ss.platformLabel}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ss.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : ss.status === 'syncing'
                            ? 'bg-amber-500/10 text-amber-400'
                            : ss.status === 'error'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {ss.status}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            ss.status === 'error' ? 'bg-red-500' : ss.status === 'syncing' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ss.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 sm:w-48 text-right">
                      {ss.itemsSynced.toLocaleString()} items &middot; Last: {timeAgo(ss.lastSync)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sales Feed */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-400" />
                Recent Sales (Auto-Imported)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="pb-3 pr-4">Card</th>
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4 text-right">Sale Price</th>
                      <th className="pb-3 pr-4 text-right">Fees</th>
                      <th className="pb-3 pr-4 text-right">Net</th>
                      <th className="pb-3 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-700/20">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="text-white font-medium">{sale.title}</p>
                            <p className="text-xs text-slate-400">{timeAgo(sale.soldAt)} &middot; {sale.buyerUsername}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                            {sale.platformLabel}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-white">{fmtCurrency(sale.salePrice)}</td>
                        <td className="py-3 pr-4 text-right text-red-400">-{fmtCurrency(sale.fees)}</td>
                        <td className="py-3 pr-4 text-right text-slate-200">{fmtCurrency(sale.netProceeds)}</td>
                        <td className={`py-3 text-right font-medium ${sale.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sale.profit >= 0 ? '+' : ''}{fmtCurrency(sale.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* === IMPORT HISTORY TAB === */}
        {activeTab === 'imports' && (
          <div className="space-y-4">
            {/* Import trigger buttons */}
            <div className="flex flex-wrap gap-2">
              {connections
                .filter((c) => c.status === 'connected')
                .map((c) => (
                  <button
                    key={c.platform}
                    onClick={() => handleImport(c.platform)}
                    disabled={importingPlatform === c.platform}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:border-blue-500/50 hover:text-blue-400 disabled:opacity-50 transition-colors"
                  >
                    {importingPlatform === c.platform ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowDownCircle size={14} />
                    )}
                    Import from {c.platformLabel}
                  </button>
                ))}
            </div>

            {/* Import history table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Import History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4 text-right">Total</th>
                      <th className="pb-3 pr-4 text-right">Imported</th>
                      <th className="pb-3 pr-4 text-right">Failed</th>
                      <th className="pb-3 pr-4 text-right">Duplicates</th>
                      <th className="pb-3">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {imports.map((imp) => (
                      <tr key={imp.id} className="hover:bg-slate-700/20">
                        <td className="py-3 pr-4 font-medium text-white">{imp.platformLabel}</td>
                        <td className="py-3 pr-4 capitalize text-slate-300">{imp.importType}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              imp.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : imp.status === 'in_progress'
                                ? 'bg-amber-500/10 text-amber-400'
                                : imp.status === 'failed'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {imp.status === 'completed' && <CheckCircle2 size={12} />}
                            {imp.status === 'in_progress' && <Loader2 size={12} className="animate-spin" />}
                            {imp.status === 'failed' && <AlertTriangle size={12} />}
                            {imp.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-200">{imp.totalItems}</td>
                        <td className="py-3 pr-4 text-right text-emerald-400">{imp.importedItems}</td>
                        <td className="py-3 pr-4 text-right text-red-400">{imp.failedItems || '-'}</td>
                        <td className="py-3 pr-4 text-right text-slate-400">{imp.duplicateItems || '-'}</td>
                        <td className="py-3 text-slate-400 text-xs">{timeAgo(imp.startedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {imports.some((i) => i.errorMessage) && (
                <div className="mt-4 space-y-2">
                  {imports
                    .filter((i) => i.errorMessage)
                    .map((i) => (
                      <div key={i.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>{i.platformLabel}:</strong> {i.errorMessage}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === LISTINGS TAB === */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={listingFilter}
                onChange={(e) => setListingFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="all">All Platforms</option>
                {connections
                  .filter((c) => c.status === 'connected')
                  .map((c) => (
                    <option key={c.platform} value={c.platform}>
                      {c.platformLabel}
                    </option>
                  ))}
              </select>
              <div className="text-sm text-slate-400 flex items-center gap-1">
                <Package size={14} />
                {filteredListings.length} listings
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-colors"
                >
                  <div className="h-40 bg-slate-700/50 flex items-center justify-center">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {listing.platformLabel}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          listing.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : listing.status === 'sold'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white leading-tight line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{fmtCurrency(listing.listPrice)}</span>
                      {listing.currentBid && (
                        <span className="text-xs text-amber-400">
                          Bid: {fmtCurrency(listing.currentBid)} ({listing.bidCount})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={12} /> {listing.watchers} watchers
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {listing.grade} &middot; {listing.externalId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PRICE COMPARE TAB === */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={priceSearch}
                  onChange={(e) => setPriceSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePriceSearch()}
                  placeholder="Search cards across marketplaces..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <button
                onClick={handlePriceSearch}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Compare
              </button>
            </div>

            <div className="space-y-4">
              {crossPrices.map((cp) => (
                <div key={cp.cardTitle} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{cp.cardTitle}</h3>
                      <p className="text-xs text-slate-400">
                        {cp.player} &middot; {cp.year} &middot; {cp.grade}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-emerald-400 font-medium">Best: {fmtCurrency(cp.bestPrice)}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-red-400">Spread: {cp.spreadPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {cp.prices.map((p) => {
                      const isBest = p.price === cp.bestPrice;
                      const isWorst = p.price === cp.worstPrice;
                      return (
                        <div
                          key={p.platform}
                          className={`p-3 rounded-xl border ${
                            isBest
                              ? 'border-emerald-500/30 bg-emerald-500/5'
                              : isWorst
                              ? 'border-red-500/20 bg-red-500/5'
                              : 'border-slate-700 bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-300">{p.platformLabel}</span>
                            {isBest && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                BEST
                              </span>
                            )}
                          </div>
                          <p className={`text-lg font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                            {fmtCurrency(p.price)}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">Updated {timeAgo(p.lastUpdated)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === FEE ANALYSIS TAB === */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Fee comparison bar chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                Fee Comparison by Platform (% of sale)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fees} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                    <YAxis dataKey="platformLabel" type="category" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      itemStyle={{ color: '#94a3b8' }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    <Bar dataKey="finalValueFee" name="Final Value Fee" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="paymentProcessing" name="Payment Processing" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="listingFee" name="Listing Fee" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fee details table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Fee Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4 text-right">Listing</th>
                      <th className="pb-3 pr-4 text-right">FVF %</th>
                      <th className="pb-3 pr-4 text-right">Processing %</th>
                      <th className="pb-3 pr-4 text-right">Shipping</th>
                      <th className="pb-3 pr-4 text-right">Total Est.</th>
                      <th className="pb-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {fees.map((f) => (
                      <tr key={f.platform} className="hover:bg-slate-700/20">
                        <td className="py-3 pr-4 font-medium text-white flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                          {f.platformLabel}
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-200">
                          {f.listingFee > 0 ? `$${f.listingFee.toFixed(2)}` : 'Free'}
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-200">{f.finalValueFee}%</td>
                        <td className="py-3 pr-4 text-right text-slate-200">
                          {f.paymentProcessing > 0 ? `${f.paymentProcessing}%` : 'Incl.'}
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-200">
                          {f.shippingLabel > 0 ? `$${f.shippingLabel.toFixed(2)}` : 'Incl.'}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-amber-400">{f.totalEstimated.toFixed(1)}%</td>
                        <td className="py-3 text-xs text-slate-400 max-w-xs truncate">{f.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sell-Through Rates */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowUpCircle size={18} className="text-emerald-400" />
                Sell-Through Rates by Category
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4 text-right">Listed</th>
                      <th className="pb-3 pr-4 text-right">Sold</th>
                      <th className="pb-3 pr-4 text-right">Rate</th>
                      <th className="pb-3 pr-4 text-right">Avg Days</th>
                      <th className="pb-3 text-right">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {sellThrough.map((st) => (
                      <tr key={st.category} className="hover:bg-slate-700/20">
                        <td className="py-3 pr-4 font-medium text-white">{st.category}</td>
                        <td className="py-3 pr-4 text-right text-slate-200">{st.listed}</td>
                        <td className="py-3 pr-4 text-right text-slate-200">{st.sold}</td>
                        <td className="py-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  st.rate >= 70 ? 'bg-emerald-500' : st.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${st.rate}%` }}
                              />
                            </div>
                            <span
                              className={`font-medium ${
                                st.rate >= 70 ? 'text-emerald-400' : st.rate >= 50 ? 'text-amber-400' : 'text-red-400'
                              }`}
                            >
                              {st.rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right text-slate-200">{st.avgDaysToSell}</td>
                        <td className="py-3 text-right text-slate-200">{fmtCurrency(st.avgPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === ANALYTICS TAB === */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Revenue', value: fmtCurrency(analytics.totalRevenue), color: 'text-emerald-400' },
                { label: 'Total Sales', value: analytics.totalSales.toLocaleString(), color: 'text-blue-400' },
                { label: 'Active Listings', value: analytics.totalListings.toLocaleString(), color: 'text-amber-400' },
                { label: 'Avg Sale Price', value: fmtCurrency(analytics.avgSalePrice), color: 'text-purple-400' },
                { label: 'Total Fees', value: fmtCurrency(analytics.totalFees), color: 'text-red-400' },
                { label: 'Net Profit', value: fmtCurrency(analytics.netProfit), color: 'text-emerald-400' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue by marketplace pie chart + monthly sales area chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-blue-400" />
                  Revenue by Marketplace
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.revenueByPlatform}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="revenue"
                        nameKey="label"
                        paddingAngle={3}
                      >
                        {analytics.revenueByPlatform.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number) => [fmtCurrency(value), 'Revenue']}
                      />
                      <Legend
                        wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  Monthly Sales Trend
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlySales}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? fmtCurrency(value) : value,
                          name === 'revenue' ? 'Revenue' : 'Sales',
                        ]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top selling cards */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Top Selling Cards
              </h2>
              <div className="space-y-3">
                {analytics.topSellingCards.map((card, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-700/30 transition-colors">
                    <span className="text-2xl font-bold text-slate-600 w-8 text-center">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{card.title}</p>
                      <p className="text-xs text-slate-400">{card.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{fmtCurrency(card.price)}</p>
                      <p className="text-xs text-emerald-400">+{fmtCurrency(card.profit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceIntegrations;
