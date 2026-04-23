// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Tag,
  ListChecks,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  Clock,
  Search,
  BarChart3,
  ShoppingBag,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getActiveDeals,
  getWantList,
  getShowSummary,
  CardShowDeal,
  CardShowWantItem,
} from '../lib/utils/cardShowService';

// ---- Helpers ----

function getDealScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-lime-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
}

function getDealScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500/15 border-emerald-500/30';
  if (score >= 50) return 'bg-lime-500/15 border-lime-500/30';
  if (score >= 35) return 'bg-amber-500/15 border-amber-500/30';
  return 'bg-red-500/15 border-red-500/30';
}

function getDealLabel(score: number): string {
  if (score >= 75) return 'Great Deal';
  if (score >= 50) return 'Good Deal';
  if (score >= 35) return 'Fair Price';
  return 'Overpriced';
}

function getBarColor(score: number): string {
  if (score >= 75) return '#34d399';
  if (score >= 50) return '#84cc16';
  if (score >= 35) return '#fbbf24';
  return '#f87171';
}

function getPriorityColor(priority: string): string {
  if (priority === 'high') return 'text-red-400 bg-red-500/15';
  if (priority === 'medium') return 'text-amber-400 bg-amber-500/15';
  return 'text-slate-400 bg-slate-500/15';
}

function formatTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
}

// Quick price lookup data
const PRICE_DATABASE: Record<string, { marketValue: number; trend: 'up' | 'down' | 'flat'; recentSales: number[] }> = {
  'ohtani psa 10': { marketValue: 425, trend: 'up', recentSales: [410, 435, 420, 450, 400] },
  'trout psa 8': { marketValue: 710, trend: 'flat', recentSales: [700, 720, 695, 730, 710] },
  'wembanyama psa 10': { marketValue: 340, trend: 'down', recentSales: [380, 360, 340, 330, 345] },
  'doncic bgs 9.5': { marketValue: 580, trend: 'up', recentSales: [550, 560, 590, 600, 575] },
  'tatum psa 9': { marketValue: 240, trend: 'up', recentSales: [220, 230, 245, 250, 240] },
  'mahomes psa 10': { marketValue: 1200, trend: 'up', recentSales: [1150, 1180, 1220, 1250, 1190] },
  'edwards prizm silver': { marketValue: 135, trend: 'up', recentSales: [120, 125, 140, 145, 130] },
  'soto psa 10': { marketValue: 210, trend: 'up', recentSales: [190, 200, 215, 220, 205] },
};

// ---- Custom Tooltip ----

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium">{data.player}</p>
      <p className="text-slate-500">Score: <span className={getDealScoreColor(data.dealScore)}>{data.dealScore}</span></p>
    </div>
  );
};

// ---- Main Page ----

const CardShowMode: React.FC = () => {
  const [deals] = useState<CardShowDeal[]>(() => getActiveDeals());
  const [wantList, setWantList] = useState<CardShowWantItem[]>(() => getWantList());
  const [searchQuery, setSearchQuery] = useState('');
  const summary = useMemo(() => getShowSummary(), []);

  const foundCount = wantList.filter((w) => w.found).length;

  const toggleWantItem = useCallback((id: string) => {
    setWantList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: !item.found } : item))
    );
  }, []);

  const priceResult = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const match = Object.entries(PRICE_DATABASE).find(([key]) => q.includes(key) || key.includes(q));
    return match ? { key: match[0], ...match[1] } : null;
  }, [searchQuery]);

  const chartData = deals.map((d) => ({
    player: d.player.split(' ').pop(),
    dealScore: d.dealScore,
    savings: d.marketValue - d.askingPrice,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-lime-500/20">
          <MapPin size={24} className="text-lime-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Show Mode</h1>
          <p className="text-sm text-slate-400">
            Mobile-optimized deal tracking for shows and conventions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-lime-500/10 rounded-lg">
              <Tag size={16} className="text-lime-400" />
            </div>
            <span className="text-xs text-slate-500">Deals Found</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{summary.stats.totalDeals}</p>
          <p className="text-xs text-slate-600 mt-1">Avg score: {summary.stats.avgDealScore}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <DollarSign size={16} className="text-emerald-400" />
            </div>
            <span className="text-xs text-slate-500">Money Saved</span>
          </div>
          <p className={`text-2xl font-bold ${summary.stats.totalSaved >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${summary.stats.totalSaved >= 0 ? '+' : ''}{summary.stats.totalSaved.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            vs market value
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-500/10 rounded-lg">
              <ShoppingBag size={16} className="text-amber-400" />
            </div>
            <span className="text-xs text-slate-500">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">${summary.stats.totalSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">
            Market: ${summary.stats.totalMarketValue.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <ListChecks size={16} className="text-blue-400" />
            </div>
            <span className="text-xs text-slate-500">Want List</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {foundCount}<span className="text-lg text-slate-500">/{wantList.length}</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {Math.round((foundCount / wantList.length) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Best Deal Banner */}
      {summary.stats.bestDeal && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-lime-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <Award size={24} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-medium uppercase tracking-wide mb-1">Best Deal of the Show</p>
            <p className="text-lg font-bold text-slate-100">{summary.stats.bestDeal.player}</p>
            <p className="text-sm text-slate-400">{summary.stats.bestDeal.cardDescription}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold text-emerald-400">{summary.stats.bestDeal.dealScore}</p>
            <p className="text-xs text-emerald-400/70">
              ${summary.stats.bestDeal.marketValue - summary.stats.bestDeal.askingPrice} saved
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Price Lookup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Search size={18} className="text-lime-400" />
            <h2 className="text-base font-semibold text-slate-200">Quick Price Lookup</h2>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. 'Ohtani PSA 10' or 'Trout PSA 8'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
            />
          </div>

          {priceResult ? (
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300 capitalize">{priceResult.key}</h4>
                <div className="flex items-center gap-1.5">
                  {priceResult.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                  {priceResult.trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
                  <span className={`text-xs font-medium ${
                    priceResult.trend === 'up' ? 'text-emerald-400' : priceResult.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {priceResult.trend === 'up' ? 'Trending Up' : priceResult.trend === 'down' ? 'Trending Down' : 'Stable'}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100">${priceResult.marketValue}</p>
              <div className="flex gap-2 flex-wrap">
                {priceResult.recentSales.map((sale, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs font-medium text-slate-300">
                    ${sale}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-600">
                Strong buy under ${Math.round(priceResult.marketValue * 0.85)}
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-600">
              <DollarSign size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">{searchQuery.trim() ? 'No match found' : 'Search to check market prices instantly'}</p>
            </div>
          )}
        </div>

        {/* Deal Score Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-lime-400" />
            <h2 className="text-base font-semibold text-slate-200">Deal Scores</h2>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <XAxis
                  dataKey="player"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                <Bar dataKey="dealScore" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.dealScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deal Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Tag size={18} className="text-lime-400" />
          <h2 className="text-base font-semibold text-slate-200">Deal Tracker</h2>
          <span className="text-xs text-slate-600 ml-auto">{deals.length} deals</span>
        </div>

        <div className="space-y-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{deal.player}</p>
                  <p className="text-xs text-slate-500 truncate">{deal.cardDescription}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className={`text-2xl font-bold ${getDealScoreColor(deal.dealScore)}`}>
                    {deal.dealScore}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getDealScoreBg(deal.dealScore)} ${getDealScoreColor(deal.dealScore)}`}
                  >
                    {getDealLabel(deal.dealScore)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-400">
                  Ask: <span className="text-slate-200 font-medium">${deal.askingPrice}</span>
                </span>
                <span className="text-slate-400">
                  Market: <span className="text-slate-200 font-medium">${deal.marketValue}</span>
                </span>
                <span className={`font-medium ${deal.marketValue > deal.askingPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                  {deal.marketValue > deal.askingPrice ? '+' : ''}${deal.marketValue - deal.askingPrice}
                </span>
                <span className="text-slate-600 ml-auto flex items-center gap-1">
                  <Clock size={11} />
                  {formatTime(deal.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                <span>{deal.vendor}</span>
              </div>

              {deal.notes && (
                <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-700 pl-2">
                  {deal.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Want List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ListChecks size={18} className="text-lime-400" />
            <h2 className="text-base font-semibold text-slate-200">Want List</h2>
          </div>
          <span className="text-sm font-bold text-lime-400">
            {foundCount}/{wantList.length} found
          </span>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(foundCount / wantList.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {wantList.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleWantItem(item.id)}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all ${
                item.found
                  ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                  : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
              }`}
            >
              {item.found ? (
                <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle size={22} className="text-slate-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${item.found ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {item.player}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <p className={`text-xs truncate ${item.found ? 'text-slate-600' : 'text-slate-500'}`}>
                  {item.cardDescription}
                </p>
              </div>
              <span className="text-sm font-medium text-slate-400 flex-shrink-0">
                &le;${item.maxPrice}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardShowMode;
