// Phase 115: Marketplace Aggregator Modal — 5-tab layout
import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingCart,
  Search,
  BarChart3,
  Package,
  Bookmark,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  Clock,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  Filter,
  Truck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  searchAllPlatforms,
  comparePrices,
  calculateNetCost,
  createPurchaseOrder,
  getSavedSearches,
  getPlatformHealth,
  getOrders,
  getPlatformLabel,
  getFeeStructure,
  MarketplacePlatform,
  PriceComparison,
  PlatformHealth,
} from '../lib/trading/marketplaceAggregatorService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface MarketplaceAggregatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'search' | 'compare' | 'orders' | 'saved' | 'platforms';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'search', label: 'Search', icon: <Search size={13} /> },
  { id: 'compare', label: 'Compare', icon: <BarChart3 size={13} /> },
  { id: 'orders', label: 'Orders', icon: <Package size={13} /> },
  { id: 'saved', label: 'Saved', icon: <Bookmark size={13} /> },
  { id: 'platforms', label: 'Platforms', icon: <Activity size={13} /> },
];

const PLATFORM_OPTIONS: { value: MarketplacePlatform; label: string }[] = [
  { value: 'ebay', label: 'eBay' },
  { value: 'comc', label: 'COMC' },
  { value: 'myslabs', label: 'MySlabs' },
  { value: 'starstock', label: 'StarStock' },
  { value: 'alt', label: 'ALT' },
  { value: 'pwcc', label: 'PWCC' },
  { value: 'goldin', label: 'Goldin' },
];

const PLATFORM_COLORS: Record<MarketplacePlatform, string> = {
  ebay: 'text-blue-400',
  comc: 'text-emerald-400',
  myslabs: 'text-rose-400',
  starstock: 'text-purple-400',
  alt: 'text-amber-400',
  pwcc: 'text-cyan-400',
  goldin: 'text-orange-400',
};

const PLATFORM_BG: Record<MarketplacePlatform, string> = {
  ebay: 'bg-blue-500/20 border-blue-500/30',
  comc: 'bg-emerald-500/20 border-emerald-500/30',
  myslabs: 'bg-rose-500/20 border-rose-500/30',
  starstock: 'bg-purple-500/20 border-purple-500/30',
  alt: 'bg-amber-500/20 border-amber-500/30',
  pwcc: 'bg-cyan-500/20 border-cyan-500/30',
  goldin: 'bg-orange-500/20 border-orange-500/30',
};

const STATUS_CONFIG: Record<PlatformHealth['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  online: { label: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', icon: <CheckCircle size={12} /> },
  degraded: { label: 'Degraded', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', icon: <AlertTriangle size={12} /> },
  offline: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: <XCircle size={12} /> },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  shipped: { label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────────

const DealScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
        {score}
      </span>
    </div>
  );
};

// ── Tab: Search ─────────────────────────────────────────────────────────────────

const SearchTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<MarketplacePlatform[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    return searchAllPlatforms(query || undefined, selectedPlatforms.length > 0 ? selectedPlatforms : undefined);
  }, [query, selectedPlatforms]);

  const togglePlatform = (p: MarketplacePlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleBuy = (listingId: string) => {
    setBuyingId(listingId);
    setTimeout(() => {
      try {
        createPurchaseOrder(listingId);
        setPurchased(prev => new Set(prev).add(listingId));
      } catch { /* noop */ }
      setBuyingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cards across all marketplaces..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
            showFilters ? 'bg-lime-500/20 border-lime-500/30 text-lime-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Filter size={13} />
          Filters
        </button>
      </div>

      {/* Platform filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-500 uppercase w-full mb-1">Filter by Platform</span>
          {PLATFORM_OPTIONS.map(p => (
            <button
              key={p.value}
              onClick={() => togglePlatform(p.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                selectedPlatforms.includes(p.value)
                  ? `${PLATFORM_BG[p.value]} ${PLATFORM_COLORS[p.value]}`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
          {selectedPlatforms.length > 0 && (
            <button
              onClick={() => setSelectedPlatforms([])}
              className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{results.length} listings found</p>
      </div>

      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {results.map(listing => {
          const netInfo = calculateNetCost(listing.platform, listing.askingPrice);
          const isBuying = buyingId === listing.id;
          const isPurchased = purchased.has(listing.id);
          return (
            <div
              key={listing.id}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{listing.player}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${PLATFORM_BG[listing.platform]} ${PLATFORM_COLORS[listing.platform]}`}>
                      {getPlatformLabel(listing.platform)}
                    </span>
                    {listing.bestOffer && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        BEST OFFER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{listing.cardDescription} &middot; {listing.grade}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-slate-500">Seller: {listing.sellerName}</span>
                    <span className="text-[10px] text-slate-500">{listing.sellerRating}% rating</span>
                    <span className="text-[10px] text-slate-500">{listing.watchers} watching</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${listing.askingPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Net ${netInfo.netCost.toLocaleString()}</p>
                  </div>
                  <DealScoreBar score={listing.dealScore} />
                  {isPurchased ? (
                    <span className="px-3 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle size={10} /> Purchased
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuy(listing.id); }}
                      disabled={isBuying}
                      className="px-3 py-1 text-[10px] font-bold text-white bg-lime-600 hover:bg-lime-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isBuying ? (
                        <><Clock size={10} className="animate-spin" /> Buying...</>
                      ) : (
                        <><Zap size={10} /> Buy Now</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {results.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No listings found. Try adjusting your search.</p>
        )}
      </div>
    </div>
  );
};

// ── Tab: Compare ────────────────────────────────────────────────────────────────

const CompareTab: React.FC = () => {
  const [searchPlayer, setSearchPlayer] = useState('');
  const allComparisons = useMemo(() => {
    // Show all comparisons by default using a broad search
    const players = ['Mahomes', 'Ohtani', 'Wembanyama', 'Doncic', 'James', 'Allen', 'Edwards', 'Soto'];
    const results: PriceComparison[] = [];
    const seen = new Set<string>();
    for (const p of players) {
      for (const comp of comparePrices(p)) {
        if (!seen.has(comp.cardKey)) {
          seen.add(comp.cardKey);
          results.push(comp);
        }
      }
    }
    return results.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }, []);

  const filtered = useMemo(() => {
    if (!searchPlayer) return allComparisons;
    const q = searchPlayer.toLowerCase();
    return allComparisons.filter(c =>
      c.player.toLowerCase().includes(q) || c.cardDescription.toLowerCase().includes(q)
    );
  }, [searchPlayer, allComparisons]);

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchPlayer}
          onChange={e => setSearchPlayer(e.target.value)}
          placeholder="Filter comparisons by player or card..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50"
        />
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Cards Compared</p>
            <p className="text-xl font-bold text-slate-200">{filtered.length}</p>
          </div>
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Max Savings</p>
            <p className="text-xl font-bold text-lime-400">
              ${Math.max(...filtered.map(f => f.potentialSavings)).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Total Savings</p>
            <p className="text-xl font-bold text-emerald-400">
              ${filtered.reduce((s, f) => s + f.potentialSavings, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Comparison cards */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map(comparison => {
          const isExpanded = expandedCard === comparison.cardKey;
          return (
            <div key={comparison.cardKey} className="bg-slate-800/70 rounded-xl border border-slate-700/50 overflow-hidden">
              <button
                onClick={() => setExpandedCard(isExpanded ? null : comparison.cardKey)}
                className="w-full text-left p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{comparison.player}</p>
                    <p className="text-xs text-slate-400 truncate">{comparison.cardDescription} &middot; {comparison.grade}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">{comparison.listings.length} platforms</span>
                      <span className={`text-[10px] font-bold ${PLATFORM_COLORS[comparison.bestPlatform]}`}>
                        Best: {getPlatformLabel(comparison.bestPlatform)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-lime-400">${comparison.bestNetCost.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400">Save ${comparison.potentialSavings.toLocaleString()}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 pt-0 border-t border-slate-700/50">
                  {/* Bar chart of net costs */}
                  <div className="mb-3">
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart
                        data={comparison.listings.map(l => ({
                          platform: getPlatformLabel(l.listing.platform),
                          netCost: l.netCost,
                          fill: l.listing.platform === comparison.bestPlatform ? '#84cc16' : '#64748b',
                        }))}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="platform" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Net Cost']}
                        />
                        <Bar dataKey="netCost" radius={[3, 3, 0, 0]}>
                          {comparison.listings.map((l, idx) => (
                            <rect key={idx} fill={l.listing.platform === comparison.bestPlatform ? '#84cc16' : '#64748b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Fee breakdown table */}
                  <div className="space-y-1.5">
                    {comparison.listings.map(entry => (
                      <div
                        key={entry.listing.id}
                        className={`rounded-lg p-2.5 text-xs border ${
                          entry.listing.platform === comparison.bestPlatform
                            ? 'bg-lime-500/10 border-lime-500/20'
                            : 'bg-slate-900/50 border-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-bold ${PLATFORM_COLORS[entry.listing.platform]}`}>
                            {getPlatformLabel(entry.listing.platform)}
                            {entry.listing.platform === comparison.bestPlatform && (
                              <span className="ml-1.5 text-[9px] text-lime-400 font-bold">(BEST)</span>
                            )}
                          </span>
                          <span className="font-bold text-white">${entry.netCost.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                          <span>Price: ${entry.feeBreakdown.subtotal.toFixed(2)}</span>
                          <span>Premium: ${entry.feeBreakdown.buyerPremium.toFixed(2)}</span>
                          <span>Shipping: ${entry.feeBreakdown.shipping.toFixed(2)}</span>
                          <span>Tax: ${entry.feeBreakdown.tax.toFixed(2)}</span>
                          <span>Processing: ${entry.feeBreakdown.processing.toFixed(2)}</span>
                          <span>Insurance: ${entry.feeBreakdown.insurance.toFixed(2)}</span>
                        </div>
                        {entry.savingsVsBest > 0 && (
                          <p className="text-[10px] text-red-400 mt-1">+${entry.savingsVsBest.toFixed(2)} vs best</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No comparisons available.</p>
        )}
      </div>
    </div>
  );
};

// ── Tab: Orders ─────────────────────────────────────────────────────────────────

const OrdersTab: React.FC = () => {
  const orders = useMemo(() => getOrders(), []);

  const totalSpent = useMemo(() => orders.reduce((s, o) => s + o.totalCost, 0), [orders]);
  const delivered = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Total Orders</p>
          <p className="text-xl font-bold text-slate-200">{orders.length}</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Total Spent</p>
          <p className="text-xl font-bold text-lime-400">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">Delivered</p>
          <p className="text-xl font-bold text-emerald-400">{delivered}</p>
        </div>
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase">In Transit</p>
          <p className="text-xl font-bold text-purple-400">{orders.filter(o => o.status === 'shipped').length}</p>
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {orders.map(order => {
          const statusCfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
          return (
            <div key={order.id} className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{order.player}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${PLATFORM_BG[order.platform]} ${PLATFORM_COLORS[order.platform]}`}>
                      {getPlatformLabel(order.platform)}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{order.cardDescription} &middot; {order.grade}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                    <span>Seller: {order.sellerName}</span>
                    <span>Ordered: {new Date(order.orderedAt).toLocaleDateString()}</span>
                    {order.trackingNumber && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <Truck size={9} /> {order.trackingNumber.slice(0, 12)}...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-bold text-white">${order.totalCost.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500">
                    Item ${order.purchasePrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Fees ${(order.totalCost - order.purchasePrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No orders yet. Start shopping from the Search tab!</p>
        )}
      </div>
    </div>
  );
};

// ── Tab: Saved Searches ─────────────────────────────────────────────────────────

const SavedTab: React.FC = () => {
  const savedSearches = useMemo(() => getSavedSearches(), []);
  const [alertToggles, setAlertToggles] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const s of savedSearches) m[s.id] = s.alertsEnabled;
    return m;
  });

  const toggleAlert = (id: string) => {
    setAlertToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{savedSearches.length} saved searches</p>
      </div>

      <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
        {savedSearches.map(search => (
          <div key={search.id} className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Search size={12} className="text-lime-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-white truncate">{search.query}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {search.platforms.map(p => (
                    <span key={p} className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${PLATFORM_BG[p]} ${PLATFORM_COLORS[p]}`}>
                      {getPlatformLabel(p)}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  {search.maxPrice && <span>Max: ${search.maxPrice.toLocaleString()}</span>}
                  <span>Min Score: {search.minDealScore}</span>
                  <span>{search.matchCount} matches</span>
                  <span>Checked {new Date(search.lastChecked).toLocaleTimeString()}</span>
                </div>
              </div>
              <button
                onClick={() => toggleAlert(search.id)}
                className={`p-2 rounded-lg transition-colors ${
                  alertToggles[search.id]
                    ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30'
                    : 'bg-slate-700 text-slate-500 hover:text-slate-300'
                }`}
                title={alertToggles[search.id] ? 'Alerts On' : 'Alerts Off'}
              >
                {alertToggles[search.id] ? <Bell size={14} /> : <BellOff size={14} />}
              </button>
            </div>
          </div>
        ))}
        {savedSearches.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No saved searches yet.</p>
        )}
      </div>
    </div>
  );
};

// ── Tab: Platforms ───────────────────────────────────────────────────────────────

const PlatformsTab: React.FC = () => {
  const health = useMemo(() => getPlatformHealth(), []);

  const radarData = useMemo(() => {
    return health.filter(h => h.status !== 'offline').map(h => ({
      platform: h.label,
      uptime: Math.round(h.uptime30d),
      speed: Math.max(0, 100 - Math.round(h.responseTimeMs / 30)),
      dealScore: Math.round(h.avgDealScore),
      listings: Math.min(100, Math.round(h.activeListings / 500)),
    }));
  }, [health]);

  return (
    <div className="space-y-4">
      {/* Radar chart */}
      {radarData.length > 0 && (
        <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
            <Activity size={12} className="text-lime-400" /> Platform Performance Overview
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="platform" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={[0, 100]} />
              <Radar name="Uptime" dataKey="uptime" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Speed" dataKey="speed" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={1.5} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {health.map(ph => {
          const statusCfg = STATUS_CONFIG[ph.status];
          const fees = getFeeStructure(ph.platform);
          return (
            <div key={ph.platform} className="bg-slate-800/70 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${ph.color}`}>{ph.label}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border ${statusCfg.bg} ${statusCfg.color}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Response</span>
                  <span className={ph.responseTimeMs < 300 ? 'text-emerald-400' : ph.responseTimeMs < 1000 ? 'text-amber-400' : 'text-red-400'}>
                    {ph.status === 'offline' ? 'N/A' : `${ph.responseTimeMs}ms`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uptime</span>
                  <span className={ph.uptime30d > 98 ? 'text-emerald-400' : ph.uptime30d > 95 ? 'text-amber-400' : 'text-red-400'}>
                    {ph.uptime30d.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Listings</span>
                  <span className="text-white">{ph.activeListings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Deal</span>
                  <span className={ph.avgDealScore > 50 ? 'text-emerald-400' : 'text-amber-400'}>{ph.avgDealScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Buyer Premium</span>
                  <span className="text-white">{(fees.buyerPremium * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Rate</span>
                  <span className="text-white">{(fees.salesTaxRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const MarketplaceAggregatorModal: React.FC<MarketplaceAggregatorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('search');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-lime-500/20">
                <ShoppingCart size={20} className="text-lime-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Marketplace Aggregator</h2>
                <p className="text-xs text-slate-400">Cross-Platform Search, Compare & One-Click Buy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'search' && <SearchTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'saved' && <SavedTab />}
          {activeTab === 'platforms' && <PlatformsTab />}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAggregatorModal;
