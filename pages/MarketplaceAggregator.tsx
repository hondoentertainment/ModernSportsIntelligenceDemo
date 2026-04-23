// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Activity,
  TrendingDown,
  Search,
  Package,
} from 'lucide-react';
import {
  searchAllPlatforms,
  comparePrices,
  getPlatformHealth,
  getAllListings,
  getOrders,
  getBestDeal,
  getPlatformLabel,
  type MarketplaceListing,
  type PriceComparison,
  type PlatformHealth,
  type PurchaseOrder,
} from '../lib/trading/marketplaceAggregatorService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  online: 'text-emerald-400',
  degraded: 'text-amber-400',
  offline: 'text-red-400',
};

const STATUS_DOT: Record<string, string> = {
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
};

const ORDER_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-500/20 text-slate-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const MarketplaceAggregator: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [_comparisons, _setComparisons] = useState<PriceComparison[]>([]);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [bestDeal, setBestDeal] = useState<MarketplaceListing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setListings(getAllListings());
      setPlatformHealth(getPlatformHealth());
      setOrders(getOrders());
      setBestDeal(getBestDeal());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    return searchAllPlatforms(searchQuery.trim());
  }, [listings, searchQuery]);

  const activeComparisons = useMemo(() => {
    const players = [...new Set(listings.map(l => l.player))];
    const allComps: PriceComparison[] = [];
    for (const player of players) {
      allComps.push(...comparePrices(player));
    }
    return allComps.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }, [listings]);

  const onlinePlatforms = useMemo(
    () => platformHealth.filter(p => p.status === 'online').length,
    [platformHealth]
  );

  const totalSavingsOpportunity = useMemo(
    () => activeComparisons.reduce((sum, c) => sum + c.potentialSavings, 0),
    [activeComparisons]
  );

  const dealScoreChartData = useMemo(() => {
    return platformHealth.map(p => ({
      name: p.label,
      score: p.avgDealScore,
      color: p.color.replace('text-', ''),
    }));
  }, [platformHealth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Marketplace Aggregator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <ShoppingCart size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Marketplace Aggregator</h1>
            <p className="text-sm text-slate-400">
              Cross-platform price comparison &amp; one-click buy &mdash; Phase 115
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${onlinePlatforms === platformHealth.length ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {onlinePlatforms}/{platformHealth.length} Platforms Online
          </span>
        </div>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Listings</p>
          <p className="text-3xl font-bold text-white">{listings.length}</p>
          <p className="text-xs text-slate-600 mt-1">across all platforms</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price Comparisons</p>
          <p className="text-3xl font-bold text-purple-400">{activeComparisons.length}</p>
          <p className="text-xs text-slate-600 mt-1">multi-platform cards</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-emerald-400">${totalSavingsOpportunity.toFixed(0)}</p>
          <p className="text-xs text-slate-600 mt-1">via best-platform routing</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Best Deal</p>
          {bestDeal ? (
            <>
              <p className="text-lg font-bold text-white truncate">{bestDeal.player}</p>
              <p className="text-xs text-brand-lime mt-1">Score: {bestDeal.dealScore}/100</p>
            </>
          ) : (
            <p className="text-lg text-slate-500">N/A</p>
          )}
        </div>
      </div>

      {/* ─── Platform Health ──────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          Platform Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {platformHealth.map(p => (
            <div key={p.platform} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`} />
                <span className={`text-sm font-bold ${p.color}`}>{p.label}</span>
              </div>
              <p className={`text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</p>
              <p className="text-[10px] text-slate-600 mt-1">
                {p.responseTimeMs > 0 ? `${p.responseTimeMs}ms` : 'N/A'} | {p.uptime30d.toFixed(1)}% uptime
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{p.activeListings.toLocaleString()} listings</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search & Listings ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Search size={18} className="text-slate-400" />
              Cross-Platform Listings
            </h2>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search player, card, or grade..."
              className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-lime/50"
            />
          </div>
          <div className="space-y-3">
            {filteredListings.slice(0, 10).map(listing => (
              <div key={listing.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                      {getPlatformLabel(listing.platform)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{listing.player}</p>
                      <p className="text-[10px] text-slate-500">{listing.cardDescription} | {listing.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${listing.askingPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">+${listing.shippingCost.toFixed(2)} ship</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">FMV: ${listing.fmvEstimate.toLocaleString()}</span>
                    <span className={`font-bold ${listing.dealScore >= 60 ? 'text-emerald-400' : listing.dealScore >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                      Deal: {listing.dealScore}/100
                    </span>
                    <span className="text-slate-500">Seller: {listing.sellerRating}%</span>
                    {listing.bestOffer && <span className="text-blue-400">Best Offer</span>}
                  </div>
                  <span className="text-slate-600">{listing.watchers} watching</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Avg Deal Score by Platform ────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <TrendingDown size={18} className="text-rose-400" />
            Avg Deal Score by Platform
          </h2>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dealScoreChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={70} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`${value.toFixed(1)}`, 'Deal Score']}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {dealScoreChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#84cc16' : '#22d3ee'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Fee-Adjusted Price Comparisons ───────────────────── */}
      {activeComparisons.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-emerald-400" />
            Fee-Adjusted Price Comparisons
          </h2>
          <div className="space-y-4">
            {activeComparisons.slice(0, 5).map(comp => (
              <div key={comp.cardKey} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">{comp.player}</p>
                    <p className="text-[10px] text-slate-500">{comp.cardDescription} | {comp.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-bold">Save up to ${comp.potentialSavings.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">Best: {getPlatformLabel(comp.bestPlatform)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {comp.listings.map((item, idx) => (
                    <div key={item.listing.id} className={`p-2 rounded-lg border text-center ${
                      idx === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700/30'
                    }`}>
                      <p className="text-[10px] text-slate-500 uppercase">{getPlatformLabel(item.listing.platform)}</p>
                      <p className={`text-sm font-bold ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        ${item.netCost.toFixed(2)}
                      </p>
                      {idx > 0 && (
                        <p className="text-[10px] text-red-400/70">+${item.savingsVsBest.toFixed(2)}</p>
                      )}
                      {idx === 0 && <p className="text-[10px] text-emerald-400">Best Price</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Orders ────────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Package size={18} className="text-slate-400" />
          Recent Orders
        </h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{order.player}</p>
                  <p className="text-[10px] text-slate-500 truncate">{order.cardDescription} | {order.grade}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs font-bold text-slate-300 uppercase">{getPlatformLabel(order.platform)}</span>
                <span className="text-sm font-bold text-white">${order.totalCost.toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${ORDER_STATUS_BADGE[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAggregator;
