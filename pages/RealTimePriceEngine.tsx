import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Search, Bell, BarChart3, Activity, Eye, RefreshCw, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import {
  getRecentSales,
  getPriceComposites,
  getMarketDepth,
  getPriceAlerts,
  getMarketSummary,
  getVolumeBySource,
  getPriceTrends,
  searchComps,
  formatCurrency,
  formatDate,
  getSourceColor,
  getSaleTypeLabel,
  getDirectionColor,
  type RecentSale,
  type PriceComposite,
  type MarketDepth as MarketDepthType,
  type PriceAlert,
  type MarketSummary,
  type VolumeBySource as VolumeBySourceType,
  type PriceTrend,
  type TimeRange,
} from '../lib/analytics/realTimePriceEngineService';

// ── Source Badge ──────────────────────────────────────────────────────────

const SourceBadge: React.FC<{ source: string }> = ({ source }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
    style={{ backgroundColor: `${getSourceColor(source as any)}20`, color: getSourceColor(source as any) }}
  >
    {source.toUpperCase()}
  </span>
);

// ── Grade Pill ───────────────────────────────────────────────────────────

const GradePill: React.FC<{ grade: string }> = ({ grade }) => {
  const isPSA10 = grade.includes('10');
  const bgClass = isPSA10
    ? 'bg-emerald-500/10 text-emerald-400'
    : 'bg-blue-500/10 text-blue-400';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${bgClass}`}>
      {grade}
    </span>
  );
};

// ── Direction Arrow ──────────────────────────────────────────────────────

const DirectionArrow: React.FC<{ price: number; prev: number }> = ({ price, prev }) => {
  const diff = price - prev;
  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : '0.0';
  if (diff > 0) {
    return (
      <span className="inline-flex items-center text-emerald-400 text-xs font-medium">
        <TrendingUp className="w-3 h-3 mr-0.5" />+{pct}%
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center text-red-400 text-xs font-medium">
        <TrendingDown className="w-3 h-3 mr-0.5" />{pct}%
      </span>
    );
  }
  return <span className="text-slate-400 text-xs">0.0%</span>;
};

// ── Priority Badge ───────────────────────────────────────────────────────

const PriorityBadge: React.FC<{ priority: 'high' | 'medium' | 'low' }> = ({ priority }) => {
  const styles: Record<string, string> = {
    high: 'bg-red-500/10 text-red-400',
    medium: 'bg-amber-500/10 text-amber-400',
    low: 'bg-slate-500/10 text-slate-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// ── Main Component ───────────────────────────────────────────────────────

const RealTimePriceEngine: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedCardId, setSelectedCardId] = useState<string>('comp-001');

  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [composites, setComposites] = useState<PriceComposite[]>([]);
  const [marketDepth, setMarketDepth] = useState<MarketDepthType | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeBySourceType[]>([]);
  const [trendData, setTrendData] = useState<PriceTrend[]>([]);

  // ── Load data ──────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      setRecentSales(getRecentSales(timeRange));
      setComposites(getPriceComposites());
      setAlerts(getPriceAlerts());
      setSummary(getMarketSummary());
      setVolumeData(getVolumeBySource());
      setMarketDepth(getMarketDepth(selectedCardId));
      setTrendData(getPriceTrends(selectedCardId));
      setLoading(false);
    } catch (err) {
      setError('Failed to load price engine data. Please try again.');
      setLoading(false);
    }
  }, [timeRange, selectedCardId]);

  // ── Search filtering ───────────────────────────────────────────────────

  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return recentSales;
    return searchComps(searchQuery);
  }, [recentSales, searchQuery]);

  const filteredComposites = useMemo(() => {
    if (!searchQuery.trim()) return composites;
    const q = searchQuery.toLowerCase();
    return composites.filter(
      (c) =>
        c.player.toLowerCase().includes(q) ||
        c.cardName.toLowerCase().includes(q)
    );
  }, [composites, searchQuery]);

  const unreadAlertCount = useMemo(
    () => alerts.filter((a) => !a.isRead).length,
    [alerts]
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRecentSales(getRecentSales(timeRange));
      setComposites(getPriceComposites());
      setAlerts(getPriceAlerts());
      setSummary(getMarketSummary());
      setVolumeData(getVolumeBySource());
      setMarketDepth(getMarketDepth(selectedCardId));
      setTrendData(getPriceTrends(selectedCardId));
      setLoading(false);
    }, 400);
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-brand-lime animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading price engine data...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Pie chart colors ───────────────────────────────────────────────────

  const pieColors = volumeData.map((v) => getSourceColor(v.source));

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-lime" />
            Real-Time Price Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            eBay Comp Aggregator -- Cross-marketplace pricing intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cards, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-lime w-64"
            />
          </div>
          {/* Time Range Filter */}
          <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
            {(['24h', '7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-brand-lime text-slate-900'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Comps Tracked
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {summary.totalCompsTracked.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Sales Today
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {summary.totalSalesToday}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Vol: {formatCurrency(summary.marketVolume24h)}
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Mover
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {summary.topMover.player}
            </div>
            <div className="text-xs text-emerald-400">
              +{summary.topMover.change.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Activity className="w-3.5 h-3.5" />
              Sentiment
            </div>
            <div
              className={`text-lg font-bold ${
                summary.marketSentiment === 'bullish'
                  ? 'text-emerald-400'
                  : summary.marketSentiment === 'bearish'
                  ? 'text-red-400'
                  : 'text-slate-300'
              }`}
            >
              {summary.marketSentiment.charAt(0).toUpperCase() +
                summary.marketSentiment.slice(1)}
            </div>
            <div className="text-xs text-slate-400">
              Score: {summary.sentimentScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Sales Feed + Composites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Feed */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              Recent Sales Feed
            </h2>
            <span className="text-xs text-slate-400">{filteredSales.length} comps</span>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/50 sticky top-0 z-10">
                <tr className="text-slate-400">
                  <th className="text-left px-3 py-2 font-medium">Card</th>
                  <th className="text-left px-3 py-2 font-medium">Grade</th>
                  <th className="text-right px-3 py-2 font-medium">Price</th>
                  <th className="text-right px-3 py-2 font-medium">Change</th>
                  <th className="text-left px-3 py-2 font-medium">Source</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-3 py-2">
                      <div className="text-slate-100 font-medium truncate max-w-[180px]">
                        {sale.player}
                      </div>
                      <div className="text-slate-500 truncate max-w-[180px]">
                        {sale.set} ({sale.year})
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <GradePill grade={sale.grade} />
                    </td>
                    <td className="px-3 py-2 text-right text-slate-100 font-medium">
                      {formatCurrency(sale.salePrice)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DirectionArrow price={sale.salePrice} prev={sale.previousComp} />
                    </td>
                    <td className="px-3 py-2">
                      <SourceBadge source={sale.source} />
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {formatDate(sale.soldDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No sales match your search.
              </div>
            )}
          </div>
        </div>

        {/* Price Composites Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Price Composites
            </h2>
            <span className="text-xs text-slate-400">{filteredComposites.length} cards</span>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/50 sticky top-0 z-10">
                <tr className="text-slate-400">
                  <th className="text-left px-3 py-2 font-medium">Card</th>
                  <th className="text-right px-3 py-2 font-medium">FMV</th>
                  <th className="text-right px-3 py-2 font-medium">Range</th>
                  <th className="text-right px-3 py-2 font-medium">30d</th>
                  <th className="text-right px-3 py-2 font-medium">Conf.</th>
                  <th className="text-center px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredComposites.map((comp) => (
                  <tr
                    key={comp.cardId}
                    className={`hover:bg-slate-700/20 transition-colors cursor-pointer ${
                      selectedCardId === comp.cardId ? 'bg-slate-700/30' : ''
                    }`}
                    onClick={() => setSelectedCardId(comp.cardId)}
                  >
                    <td className="px-3 py-2">
                      <div className="text-slate-100 font-medium truncate max-w-[160px]">
                        {comp.player}
                      </div>
                      <div className="text-slate-500 truncate max-w-[160px]">
                        {comp.grade} -- {comp.salesCount} sales
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-100 font-semibold">
                      {formatCurrency(comp.fairMarketValue)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">
                      {formatCurrency(comp.low)}-{formatCurrency(comp.high)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-medium ${
                          comp.direction === 'up'
                            ? 'text-emerald-400'
                            : comp.direction === 'down'
                            ? 'text-red-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {comp.direction === 'up' ? '+' : ''}
                        {comp.change30d.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div
                          className="h-1.5 rounded-full bg-slate-700"
                          style={{ width: '40px' }}
                        >
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${comp.confidenceScore}%`,
                              backgroundColor:
                                comp.confidenceScore >= 90
                                  ? '#10b981'
                                  : comp.confidenceScore >= 75
                                  ? '#f59e0b'
                                  : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-slate-400 w-7 text-right">
                          {comp.confidenceScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardId(comp.cardId);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Row: Price Trend + Volume by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Trend Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Price Trend
            </h2>
            <span className="text-xs text-slate-400">
              {composites.find((c) => c.cardId === selectedCardId)?.player || 'Select a card'}
            </span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => formatCurrency(val)}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number) => [formatCurrency(value), 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
              Select a card to view price trends
            </div>
          )}
        </div>

        {/* Volume by Source Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-purple-400" />
            Volume by Source
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={volumeData}
                dataKey="marketShare"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
                stroke="none"
              >
                {volumeData.map((entry, index) => (
                  <Cell key={entry.source} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [`${value}%`, name.toUpperCase()]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {volumeData.slice(0, 5).map((v) => (
              <div key={v.source} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getSourceColor(v.source) }}
                  />
                  <span className="text-slate-300">{v.source.toUpperCase()}</span>
                </div>
                <span className="text-slate-400">{v.marketShare}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Market Depth + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Depth Panel */}
        {marketDepth && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Market Depth
              </h2>
              <span className="text-xs text-slate-400">
                {composites.find((c) => c.cardId === selectedCardId)?.player || selectedCardId}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Active Listings</div>
                <div className="text-slate-100 font-bold text-lg">{marketDepth.activeListings}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Bid/Ask Spread</div>
                <div className="text-slate-100 font-bold text-lg">{marketDepth.spreadPercent.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Avg Days on Market</div>
                <div className="text-slate-100 font-bold text-lg">{marketDepth.avgDaysOnMarket}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Sell-Through Rate</div>
                <div className="text-emerald-400 font-bold text-lg">{marketDepth.sellThroughRate}%</div>
              </div>
            </div>
            {/* Listings by Price Bar Chart */}
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={marketDepth.listingsByPrice}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="priceRange"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>
                Lowest Ask: <span className="text-slate-100 font-medium">{formatCurrency(marketDepth.lowestAsk)}</span>
              </span>
              <span>
                Highest Bid: <span className="text-slate-100 font-medium">{formatCurrency(marketDepth.highestBid)}</span>
              </span>
              <span>
                Spread: <span className="text-slate-100 font-medium">{formatCurrency(marketDepth.spread)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Price Alerts
              {unreadAlertCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                  {unreadAlertCount}
                </span>
              )}
            </h2>
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-700/30">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`px-4 py-3 hover:bg-slate-700/20 transition-colors ${
                  !alert.isRead ? 'border-l-2 border-l-amber-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={alert.priority} />
                    <span className="text-slate-100 text-xs font-medium">
                      {alert.player}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">{formatDate(alert.timestamp)}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="text-slate-500">
                    Current: <span className="text-slate-300">{formatCurrency(alert.currentPrice)}</span>
                  </span>
                  <span className="text-slate-500">
                    Target: <span className="text-slate-300">{formatCurrency(alert.targetPrice)}</span>
                  </span>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No active alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hot Cards Row */}
      {summary && summary.hotCards.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-brand-lime" />
            Hot Cards by Volume
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {summary.hotCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30"
              >
                <div className="text-slate-100 text-xs font-medium truncate">
                  {card.cardName}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-emerald-400 text-sm font-bold">
                    {formatCurrency(card.avgPrice)}
                  </span>
                  <span className="text-slate-400 text-xs">{card.sales} sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimePriceEngine;
