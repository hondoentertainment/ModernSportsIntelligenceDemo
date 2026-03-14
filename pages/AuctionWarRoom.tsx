import React, { useState, useEffect, useMemo } from 'react';
import { Gavel, Clock, Eye, Trophy, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  getLiveAuctions,
  getWatchedLots,
  getAuctionAnalytics,
  getOptimalBidStrategy,
  getPostAuctionReport,
  getPlatformConfig,
  getStrategyConfig,
  getStatusConfig,
  formatCurrency,
  type LiveAuction,
  type WatchedLot,
  type AuctionAnalytics,
  type AuctionResult,
  type OptimalBidRecommendation,
} from '../lib/auctionWarRoomService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const AuctionWarRoom: React.FC = () => {
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [watched, setWatched] = useState<WatchedLot[]>([]);
  const [analytics, setAnalytics] = useState<AuctionAnalytics | null>(null);
  const [results, setResults] = useState<AuctionResult[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<OptimalBidRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAuctions(getLiveAuctions());
      setWatched(getWatchedLots());
      setAnalytics(getAuctionAnalytics());
      setResults(getPostAuctionReport());
      setLoading(false);
    } catch {
      setError('Failed to load Auction War Room data');
      setLoading(false);
    }
  }, []);

  const liveCount = useMemo(() => auctions.filter(a => a.status === 'live').length, [auctions]);
  const watchedCount = watched.length;
  const totalBidValue = useMemo(() =>
    watched.filter(w => w.maxAutoBid > 0).reduce((s, w) => s + w.maxAutoBid, 0), [watched]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Live Auction War Room...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Gavel size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Live Auction War Room</h1>
            <p className="text-sm text-slate-400">Multi-platform bid tracking, strategy &amp; post-auction analytics &mdash; Phase 118</p>
          </div>
        </div>
        {liveCount > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full animate-pulse">
            {liveCount} AUCTIONS LIVE
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Live Auctions</p>
          <p className="text-3xl font-bold text-emerald-400">{liveCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Watched</p>
          <p className="text-3xl font-bold text-blue-400">{watchedCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bid Exposure</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalBidValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-brand-lime">{analytics.winRate}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Won</p>
          <p className="text-3xl font-bold text-purple-400">{analytics.totalWins}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Savings</p>
          <p className="text-3xl font-bold text-emerald-400">{analytics.avgSavingsPercent}%</p>
        </div>
      </div>

      {/* Live Auction Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-red-400" />
          Live &amp; Upcoming Auctions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map(a => {
            const platform = getPlatformConfig(a.platform);
            const status = getStatusConfig(a.status);
            const strat = a.strategy ? getStrategyConfig(a.strategy) : null;
            return (
              <div
                key={a.id}
                className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => {
                  const s = getOptimalBidStrategy(a.id);
                  setSelectedStrategy(s);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${platform.bg} ${platform.text} ${platform.border} border`}>{platform.label}</span>
                  <div className="flex items-center gap-2">
                    {strat && <span className={`text-[10px] px-1.5 py-0.5 rounded ${strat.bg} ${strat.text}`}>{strat.label}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>{status.label}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate mb-1">{a.title}</p>
                <p className="text-[10px] text-slate-500 mb-3">{a.lotNumber}</p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-slate-500">Current Bid</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(a.currentBid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Time Left</p>
                    <p className={`text-sm font-bold ${a.status === 'live' ? 'text-red-400' : 'text-slate-400'}`}>{a.timeRemaining}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>Est: {formatCurrency(a.estimateLow)}&ndash;{formatCurrency(a.estimateHigh)}</span>
                  <span>{a.bidCount} bids</span>
                </div>
                {a.isWatched && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
                    <Eye size={10} /> Watching {a.myMaxBid ? `| Max: ${formatCurrency(a.myMaxBid)}` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bid Strategy Recommendation */}
      {selectedStrategy && (
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Optimal Bid Strategy: {selectedStrategy.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Recommended</p>
              <p className="text-lg font-bold text-amber-400 uppercase">{selectedStrategy.recommendedStrategy}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Max Bid</p>
              <p className="text-lg font-bold text-white">{formatCurrency(selectedStrategy.recommendedMax)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Snipe Window</p>
              <p className="text-lg font-bold text-red-400">{selectedStrategy.snipeWindow}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
              <p className="text-lg font-bold text-brand-lime">{selectedStrategy.confidence}%</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">{selectedStrategy.reasoning}</p>
          <div className="flex gap-6 mt-3 text-[10px] text-slate-500">
            <span>Historical Avg: {formatCurrency(selectedStrategy.historicalAvg)}</span>
            <span>Competitor Est: {formatCurrency(selectedStrategy.competitorEstimate)}</span>
            <span>Proxy Ceiling: {formatCurrency(selectedStrategy.proxyCeiling)}</span>
          </div>
        </div>
      )}

      {/* Analytics + Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Monthly Auction Spend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlySpend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Spent']}
                />
                <Area type="monotone" dataKey="spent" stroke="#84cc16" strokeWidth={2} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-purple-400" />
            Strategy Performance
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.strategyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="strategy" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="winRate" name="Win Rate %" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Post Auction Results */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Eye size={18} className="text-blue-400" />
          Recent Auction Results
        </h2>
        <div className="space-y-3">
          {results.slice(0, 8).map(r => {
            const platform = getPlatformConfig(r.platform);
            return (
              <div key={r.auctionId} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${platform.bg} ${platform.text} border ${platform.border} flex-shrink-0`}>{platform.label}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-500">{r.totalBids} bids | Est: {formatCurrency(r.estimateLow)}&ndash;{formatCurrency(r.estimateHigh)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(r.hammerPrice)}</p>
                    {r.won && r.overpayPercent !== 0 && (
                      <p className={`text-[10px] flex items-center gap-0.5 ${r.overpayPercent < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.overpayPercent < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {r.overpayPercent > 0 ? '+' : ''}{r.overpayPercent}%
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${r.won ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {r.won ? 'WON' : 'LOST'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuctionWarRoom;
