import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Layers,
  Gamepad2,
} from 'lucide-react';
import {
  getCategories,
  getCategoryMarketData,
  getNonSportsItems,
  getUnifiedPortfolio,
  getCrossCategoryAnalysis,
  getCategoryTrends,
  getCategoryLeaders,
  type CollectibleCategory,
  type CategoryMarketData,
  type CrossCategoryPortfolio,
  type NonSportsItem,
  type CategoryTrend,
} from '../lib/utils/nonSportsExpansionService.ts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const NonSportsExpansion: React.FC = () => {
  const [portfolio, setPortfolio] = useState<CrossCategoryPortfolio | null>(null);
  const [marketData, setMarketData] = useState<CategoryMarketData[]>([]);
  const [items, setItems] = useState<NonSportsItem[]>([]);
  const [trendData, setTrendData] = useState<CategoryTrend[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CollectibleCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setPortfolio(getUnifiedPortfolio());
      setMarketData(getCategoryMarketData());
      setItems(getNonSportsItems());
      setTrendData(getCategoryTrends());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const categories = useMemo(() => getCategories(), []);
  const correlations = useMemo(() => getCrossCategoryAnalysis(), []);
  const leaders = useMemo(() => getCategoryLeaders(), []);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const chartData = useMemo(() => {
    const months = [...new Set(trendData.map(t => t.month))];
    return months.map(month => {
      const row: Record<string, unknown> = { month };
      trendData.filter(t => t.month === month).forEach(t => {
        row[t.label] = t.avgPrice;
      });
      return row;
    });
  }, [trendData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Non-Sports Expansion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Sparkles size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Non-Sports &amp; Multi-Hobby Expansion</h1>
          <p className="text-sm text-slate-400">
            Cross-category collectible portfolio tracking &mdash; Phase 126
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {portfolio && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
            <p className="text-3xl font-bold text-brand-lime">${portfolio.totalValue.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-1">{portfolio.itemCount} items</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Gain/Loss</p>
            <p className={`text-3xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {portfolio.totalGainLoss >= 0 ? '+' : ''}${portfolio.totalGainLoss.toLocaleString()}
            </p>
            <p className={`text-xs mt-1 ${portfolio.totalGainLossPercent >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {portfolio.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.totalGainLossPercent.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Categories</p>
            <p className="text-3xl font-bold text-blue-400">{portfolio.categoryCount}</p>
            <p className="text-xs text-slate-600 mt-1">diversified</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Cost Basis</p>
            <p className="text-3xl font-bold text-slate-300">${portfolio.totalCost.toLocaleString()}</p>
            <p className="text-xs text-slate-600 mt-1">invested</p>
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            !selectedCategory ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat.category ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Market Data & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Category Price Trends (6 Months)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                {categories.map(cat => (
                  <Area
                    key={cat.category}
                    type="monotone"
                    dataKey={cat.label}
                    stroke={cat.color}
                    fill={cat.color}
                    fillOpacity={0.08}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Gamepad2 size={18} className="text-amber-400" />
            Trending Categories
          </h2>
          <div className="space-y-3">
            {marketData.sort((a, b) => b.priceChange30d - a.priceChange30d).map(md => (
              <div key={md.category} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: md.color }} />
                    <span className="text-sm font-bold text-white">{md.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${md.priceChange30d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {md.priceChange30d >= 0 ? '+' : ''}{md.priceChange30d.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Vol 24h: ${(md.volume24h / 1_000_000).toFixed(1)}M</span>
                  <span>Listings: {(md.activeListings / 1_000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Category Correlations */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          Cross-Category Correlations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {correlations.slice(0, 9).map((corr, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{corr.labelA} &harr; {corr.labelB}</span>
                <span className={`text-sm font-bold ${
                  corr.correlation > 0.6 ? 'text-emerald-400' : corr.correlation > 0.3 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {corr.correlation.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2">
                <div
                  className={`h-full rounded-full ${
                    corr.correlation > 0.6 ? 'bg-emerald-500' : corr.correlation > 0.3 ? 'bg-amber-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${corr.correlation * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">{corr.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          Portfolio Holdings ({filteredItems.length} items)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.slice(0, 12).map(item => {
            const gain = item.currentValue - item.purchasePrice;
            const gainPct = item.purchasePrice > 0 ? (gain / item.purchasePrice) * 100 : 0;
            return (
              <div key={item.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">{item.condition} {item.graded ? `| ${item.grade}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">${item.currentValue.toLocaleString()}</p>
                    <p className={`text-[10px] ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Leaders */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand-lime" />
          Category Leaders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaders.map(leader => (
            <div key={leader.category} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: leader.color }} />
                <span className="text-sm font-bold text-white">{leader.label}</span>
                <span className={`ml-auto text-xs font-bold ${leader.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {leader.avgReturn >= 0 ? '+' : ''}{leader.avgReturn.toFixed(1)}% avg
                </span>
              </div>
              <div className="space-y-2">
                {leader.topItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate mr-2">{item.name.split(' ').slice(0, 5).join(' ')}</span>
                    <span className="text-slate-300 flex-shrink-0">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NonSportsExpansion;
