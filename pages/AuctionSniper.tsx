// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Crosshair, AlertTriangle, Clock, Bell, TrendingUp, BarChart3, Eye, Target, Zap, DollarSign } from 'lucide-react';
import {
  getLiveAuctions,
  getBidRecommendations,
  getSniperAlerts,
  getEndingSoon,
  getAuctionsByPlatform,
  getPlatformDistribution,
  getBidStrategyGuide,
  getWatchedAuctions,
  getHistoricalBidPatterns,
  getAuctionSummary,
  formatCurrency,
  formatTimeRemaining,
  type LiveAuction,
  type BidRecommendation,
  type SniperAlert,
  type EndingSoonAuction,
  type AuctionByPlatform,
  type PlatformDistribution,
  type BidStrategyGuide,
  type WatchedAuction,
  type HistoricalBidPattern,
  type AuctionSummary,
} from '../lib/trading/auctionSniperService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];

const AuctionSniper: React.FC = () => {
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);
  const [recommendations, setRecommendations] = useState<BidRecommendation[]>([]);
  const [alerts, setAlerts] = useState<SniperAlert[]>([]);
  const [endingSoon, setEndingSoon] = useState<EndingSoonAuction[]>([]);
  const [byPlatform, setByPlatform] = useState<AuctionByPlatform[]>([]);
  const [platformDist, setPlatformDist] = useState<PlatformDistribution[]>([]);
  const [strategies, setStrategies] = useState<BidStrategyGuide[]>([]);
  const [watched, setWatched] = useState<WatchedAuction[]>([]);
  const [bidPatterns, setBidPatterns] = useState<HistoricalBidPattern[]>([]);
  const [summary, setSummary] = useState<AuctionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAuctions(getLiveAuctions());
      setRecommendations(getBidRecommendations());
      setAlerts(getSniperAlerts());
      setEndingSoon(getEndingSoon());
      setByPlatform(getAuctionsByPlatform());
      setPlatformDist(getPlatformDistribution());
      setStrategies(getBidStrategyGuide());
      setWatched(getWatchedAuctions());
      setBidPatterns(getHistoricalBidPatterns());
      setSummary(getAuctionSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Auction Sniper data');
      setLoading(false);
    }
  }, []);

  const totalAuctions = useMemo(() => summary?.totalActive ?? 0, [summary]);
  const totalBids = useMemo(() => summary?.totalBidsPlaced ?? 0, [summary]);
  const winRate = useMemo(() => summary?.winRate ?? 0, [summary]);
  const avgSavings = useMemo(() => summary?.avgSavings ?? 0, [summary]);
  const sniperWins = useMemo(() => summary?.sniperWins ?? 0, [summary]);
  const alertCount = useMemo(() => alerts.length, [alerts]);

  const platformChartData = useMemo(() =>
    byPlatform.map(p => ({
      platform: p.platform,
      auctions: p.count,
      avgPrice: p.avgPrice,
    })), [byPlatform]);

  const platformPieData = useMemo(() =>
    platformDist.map(p => ({
      name: p.platform,
      value: p.count,
    })), [platformDist]);

  const patternChartData = useMemo(() =>
    bidPatterns.map(p => ({
      time: p.timeLabel,
      avgBids: p.avgBids,
      avgPrice: p.avgPrice,
    })), [bidPatterns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Auction Sniper...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Crosshair size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Real-Time Auction Sniper &amp; Alert System</h1>
            <p className="text-sm text-slate-400">Monitor, bid &amp; snipe auctions across all platforms &mdash; Phase 158</p>
          </div>
        </div>
        {alertCount > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full animate-pulse">
            {alertCount} ACTIVE ALERTS
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Auctions</p>
          <p className="text-3xl font-bold text-emerald-400">{totalAuctions}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Bids</p>
          <p className="text-3xl font-bold text-blue-400">{totalBids}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-amber-400">{winRate}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Savings</p>
          <p className="text-3xl font-bold text-purple-400">{avgSavings}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sniper Wins</p>
          <p className="text-3xl font-bold text-red-400">{sniperWins}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Alerts Active</p>
          <p className="text-3xl font-bold text-brand-lime">{alertCount}</p>
        </div>
      </div>

      {/* Live Auctions Grid */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Crosshair size={18} className="text-emerald-400" />
          Live Auctions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.slice(0, 9).map((a, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{a.platform}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center gap-1">
                  <Clock size={8} /> {formatTimeRemaining(a.timeRemaining)}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate mb-1">{a.title}</p>
              <p className="text-[10px] text-slate-500 mb-3 truncate">{a.seller}</p>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] text-slate-500">Current Bid</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(a.currentBid)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Est. Value</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(a.estimatedValue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>{a.bidCount} bids</span>
                <span className={`font-bold ${a.currentBid < a.estimatedValue * 0.8 ? 'text-emerald-400' : a.currentBid < a.estimatedValue ? 'text-amber-400' : 'text-red-400'}`}>
                  {((a.currentBid / a.estimatedValue) * 100).toFixed(0)}% of value
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auctions by Platform Chart + Platform Distribution Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Auctions by Platform
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="platform" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="auctions" name="Active Auctions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-blue-400" />
            Auction Platform Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformPieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {platformPieData.map((entry, idx) => (
              <span key={entry.name} className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bid Recommendations Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-amber-400" />
          Bid Recommendations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Auction</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Platform</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Current Bid</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Max Bid</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Est. Value</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Confidence</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r, idx) => (
                <tr key={idx} className="border-b border-slate-700/20">
                  <td className="py-3 pr-3">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{r.auctionTitle}</p>
                    <p className="text-[10px] text-slate-500">{r.timeRemaining}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{r.platform}</span>
                  </td>
                  <td className="py-3 pr-3 text-sm text-right text-slate-300">{formatCurrency(r.currentBid)}</td>
                  <td className="py-3 pr-3 text-sm text-right font-bold text-amber-400">{formatCurrency(r.recommendedMaxBid)}</td>
                  <td className="py-3 pr-3 text-sm text-right text-emerald-400">{formatCurrency(r.estimatedValue)}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`text-sm font-bold ${r.confidence >= 80 ? 'text-emerald-400' : r.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {r.confidence}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.action === 'bid' ? 'bg-emerald-500/10 text-emerald-400' : r.action === 'watch' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.action.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sniper Alerts Panel */}
      <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-emerald-400" />
          Sniper Alerts
        </h2>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Zap size={16} className={`flex-shrink-0 ${alert.priority === 'high' ? 'text-red-400' : alert.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{alert.auctionTitle}</p>
                  <p className="text-[10px] text-slate-500">{alert.platform} &middot; {alert.triggerReason}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="text-sm font-bold text-white">{formatCurrency(alert.currentPrice)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${alert.priority === 'high' ? 'bg-red-500/10 text-red-400' : alert.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {alert.priority.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ending Soon Queue */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-red-400" />
          Ending Soon Queue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {endingSoon.map((a, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 animate-pulse flex items-center gap-1">
                  <Clock size={8} /> {formatTimeRemaining(a.timeRemaining)}
                </span>
                <span className="text-[10px] text-slate-500">{a.platform}</span>
              </div>
              <p className="text-sm font-bold text-white truncate mb-2">{a.title}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500">Current Bid</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(a.currentBid)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Bids</p>
                  <p className="text-sm font-bold text-amber-400">{a.bidCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bid Strategy Guide + Watched Auctions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-purple-400" />
            Bid Strategy Guide
          </h2>
          <div className="space-y-3">
            {strategies.map((s, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-400' : s.riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                    {s.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{s.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Win Rate</p>
                    <p className="text-sm font-bold text-emerald-400">{s.avgWinRate}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-500">Avg Savings</p>
                    <p className="text-sm font-bold text-amber-400">{s.avgSavings}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-cyan-400" />
            Watched Auctions
          </h2>
          <div className="space-y-3">
            {watched.map((w, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{w.title}</p>
                    <p className="text-[10px] text-slate-500">{w.platform} &middot; {formatTimeRemaining(w.timeRemaining)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(w.currentBid)}</p>
                    <p className="text-[10px] text-slate-500">Max: {formatCurrency(w.maxBid)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${w.status === 'winning' ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'outbid' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {w.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Bid Patterns LineChart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Historical Bid Patterns
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={patternChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="avgBids" name="Avg Bids" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgPrice" name="Avg Price" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auction Performance Summary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-brand-lime" />
          Auction Performance Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Total Won</p>
            <p className="text-2xl font-bold text-emerald-400">{sniperWins}</p>
            <p className="text-[10px] text-slate-500 mt-2">{winRate}% win rate across all platforms</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Money Saved</p>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary?.totalSaved ?? 0)}</p>
            <p className="text-[10px] text-slate-500 mt-2">Avg {avgSavings}% below market value</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Active Watches</p>
            <p className="text-2xl font-bold text-blue-400">{watched.length}</p>
            <p className="text-[10px] text-slate-500 mt-2">{endingSoon.length} ending within the hour</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionSniper;
