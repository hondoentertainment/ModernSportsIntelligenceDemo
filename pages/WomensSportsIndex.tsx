import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, AlertTriangle, TrendingUp, TrendingDown, Target, Activity, Globe, BarChart3, Clock, Shield, Zap, Star, Users } from 'lucide-react';
import {
  getMarketIndices,
  getAthleteCards,
  getGrowthMetrics,
  getTopPerformers,
  getEmergingMarkets,
  getInvestmentSignals,
  getHistoricalMilestones,
  getLeagueProfiles,
  getMarketComparison,
  getCollectorDemographics,
  getMarketCapByLeague,
  getSportConfig,
  formatCurrency,
  type MarketIndex,
  type AthleteCard,
  type GrowthMetric,
  type EmergingMarket,
  type InvestmentSignal,
  type HistoricalMilestone,
  type LeagueProfile,
  type MarketComparison,
  type CollectorDemographic,
} from '../lib/womensSportsIndexService.ts';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const WomensSportsIndex: React.FC = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [athletes, setAthletes] = useState<AthleteCard[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [emergingMarkets, setEmergingMarkets] = useState<EmergingMarket[]>([]);
  const [signals, setSignals] = useState<InvestmentSignal[]>([]);
  const [milestones, setMilestones] = useState<HistoricalMilestone[]>([]);
  const [leagueProfiles, setLeagueProfiles] = useState<LeagueProfile[]>([]);
  const [comparisons, setComparisons] = useState<MarketComparison[]>([]);
  const [demographics, setDemographics] = useState<CollectorDemographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIndices(getMarketIndices());
      setAthletes(getAthleteCards());
      setGrowthMetrics(getGrowthMetrics());
      setEmergingMarkets(getEmergingMarkets());
      setSignals(getInvestmentSignals());
      setMilestones(getHistoricalMilestones());
      setLeagueProfiles(getLeagueProfiles());
      setComparisons(getMarketComparison());
      setDemographics(getCollectorDemographics());
      setLoading(false);
    } catch {
      setError('Failed to load Women\'s Sports Index data');
      setLoading(false);
    }
  }, []);

  const topPerformers = useMemo(() => getTopPerformers(15), []);
  const marketCapData = useMemo(() => getMarketCapByLeague(), []);

  const totalMarketCap = useMemo(() => indices.reduce((s, i) => s + i.marketCap, 0), [indices]);
  const avgGrowth = useMemo(() => {
    if (indices.length === 0) return 0;
    return indices.reduce((s, i) => s + i.yoyGrowth, 0) / indices.length;
  }, [indices]);
  const totalListings = useMemo(() => indices.reduce((s, i) => s + i.totalListings, 0), [indices]);
  const buySignals = useMemo(() => signals.filter(s => s.type === 'buy').length, [signals]);

  // Index timeline data for LineChart
  const indexTimeline = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const baseValues: Record<string, number[]> = {
      WNBA: [820, 880, 950, 1050, 1180, 1300, 1420, 1520, 1600, 1680, 1740, 1790, 1810, 1830, 1845],
      NWSL: [180, 210, 250, 300, 370, 440, 520, 590, 660, 730, 800, 860, 890, 910, 920],
      WTA: [680, 720, 760, 810, 860, 920, 980, 1040, 1100, 1150, 1200, 1250, 1280, 1300, 1320],
      LPGA: [350, 370, 395, 420, 460, 500, 540, 580, 620, 660, 700, 740, 760, 770, 780],
      Olympics: [1050, 1100, 1150, 1250, 1380, 1500, 1650, 1800, 1900, 1980, 2050, 2100, 2120, 2140, 2150],
    };
    return months.map((m, i) => ({
      month: i < 12 ? `${m} '25` : `${m} '26`,
      WNBA: baseValues.WNBA[i],
      NWSL: baseValues.NWSL[i],
      WTA: baseValues.WTA[i],
      LPGA: baseValues.LPGA[i],
      Olympics: baseValues.Olympics[i],
    }));
  }, []);

  // Market cap growth for AreaChart
  const marketCapTimeline = useMemo(() => {
    return [
      { month: "Jan '25", cap: 62 },
      { month: "Mar '25", cap: 74 },
      { month: "May '25", cap: 88 },
      { month: "Jul '25", cap: 102 },
      { month: "Sep '25", cap: 115 },
      { month: "Nov '25", cap: 128 },
      { month: "Jan '26", cap: 138 },
      { month: "Mar '26", cap: totalMarketCap / 1_000_000 },
    ];
  }, [totalMarketCap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Women&apos;s Sports Index...</p>
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
            <Trophy size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Women&apos;s Sports &amp; Emerging Market Index</h1>
            <p className="text-sm text-slate-400">Live market tracking across 8 leagues with investment signals &mdash; Phase 140</p>
          </div>
        </div>
        <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-emerald-500/20 text-emerald-300">
          {indices.length} LEAGUES TRACKED
        </span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Market Cap</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalMarketCap)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg YoY Growth</p>
          <p className="text-3xl font-bold text-brand-lime">+{avgGrowth.toFixed(0)}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Athletes Tracked</p>
          <p className="text-3xl font-bold text-violet-400">{athletes.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Listings</p>
          <p className="text-2xl font-bold text-blue-400">{totalListings.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buy Signals</p>
          <p className="text-3xl font-bold text-amber-400">{buySignals}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Leagues</p>
          <p className="text-3xl font-bold text-pink-400">{indices.length}</p>
        </div>
      </div>

      {/* League Index Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map(idx => {
          const sc = getSportConfig(idx.sport);
          return (
            <div key={idx.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: idx.color }} />
                  <span className={`text-sm font-bold ${sc.text}`}>{idx.sportLabel}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${idx.trending === 'up' ? 'bg-emerald-500/20 text-emerald-400' : idx.trending === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {idx.trending === 'up' ? 'BULLISH' : idx.trending === 'down' ? 'BEARISH' : 'STABLE'}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{idx.indexValue.toLocaleString()}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp size={10} /> +{idx.changePercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">30d</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-700/50 pt-3">
                <div>
                  <p className="text-[10px] text-slate-500">Market Cap</p>
                  <p className="text-xs font-bold text-white">{formatCurrency(idx.marketCap)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">YoY Growth</p>
                  <p className="text-xs font-bold text-emerald-400">+{idx.yoyGrowth}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-League Index Timeline (LineChart) + Market Cap Growth (AreaChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Index Timeline */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            Multi-League Index Timeline
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indexTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="WNBA" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="NWSL" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="WTA" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="LPGA" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Olympics" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {['WNBA', 'NWSL', 'WTA', 'LPGA', 'Olympics'].map((league, i) => {
              const colors = ['#f97316', '#10b981', '#a855f7', '#ec4899', '#eab308'];
              return (
                <div key={league} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                  <span className="text-[10px] text-slate-400">{league}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Cap Growth */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-lime" />
            Total Market Cap Growth
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketCapTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Market Cap']}
                />
                <Area type="monotone" dataKey="cap" stroke="#84cc16" fill="#84cc16" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Combined market capitalization across all tracked women&apos;s sports leagues</p>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Top Performers by Price Growth
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">#</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Athlete</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Sport</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Card</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Value</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Change</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">ATH</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Vol 30d</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((card, i) => {
                const sc = getSportConfig(card.sport);
                return (
                  <tr key={card.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-xs">{i + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{card.name}</span>
                        {card.isRookie && <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-400 rounded font-bold">RC</span>}
                        {card.graded && card.grade && <span className="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">{card.grade}</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 max-w-[160px] truncate">{card.cardDescription}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{formatCurrency(card.currentValue)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${card.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {card.changePercent >= 0 ? '+' : ''}{card.changePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs text-slate-400">{formatCurrency(card.allTimeHigh)}</td>
                    <td className="py-2.5 px-3 text-right text-xs text-slate-400">{card.volume30d}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emerging Markets + Investment Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emerging Markets */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-cyan-400" />
            Emerging Markets
          </h2>
          <div className="space-y-3">
            {emergingMarkets.map(em => {
              const sc = getSportConfig(em.sport);
              return (
                <div key={em.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sc.bg} ${sc.text}`}>{em.sportLabel}</span>
                      <span className="text-sm font-bold text-white">{em.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${em.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-400' : em.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {em.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-sm font-bold text-violet-400">{em.opportunityScore}/100</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{em.catalyst}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Market Size: <span className="text-white font-bold">{formatCurrency(em.marketSize)}</span></span>
                    <span className="text-emerald-400 font-bold">+{em.growthRate}% YoY</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {em.keyAthletes.map(a => (
                      <span key={a} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded">{a}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Investment Signals */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Investment Signals
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {signals.map(sig => {
              const sc = getSportConfig(sig.sport);
              const signalConfig = sig.type === 'buy'
                ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'BUY' }
                : sig.type === 'sell'
                ? { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'SELL' }
                : { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'HOLD' };
              return (
                <div key={sig.id} className={`p-4 rounded-xl border ${signalConfig.bg} ${signalConfig.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black ${signalConfig.bg} ${signalConfig.text} border ${signalConfig.border}`}>{signalConfig.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-slate-500" />
                      <span className="text-[10px] text-slate-400">{sig.confidence}% confidence</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{sig.athlete} &mdash; {sig.card}</p>
                  <p className="text-xs text-slate-400 mb-2">{sig.rationale}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Current: <span className="text-white font-bold">{formatCurrency(sig.currentValue)}</span></span>
                    <span className={`font-bold ${signalConfig.text}`}>Target: {formatCurrency(sig.targetValue)}</span>
                    <span className="text-slate-500">{sig.timeframe}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Demographics BarChart + Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collector Demographics */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Users size={18} className="text-pink-400" />
            Collector Demographics
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [name === 'percentage' ? `${value}%` : `$${value}`, name === 'percentage' ? 'Share' : 'Avg Spend']}
                />
                <Bar dataKey="percentage" name="Share" radius={[4, 4, 0, 0]}>
                  {demographics.map((d, idx) => (
                    <Cell key={idx} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-1.5">
            {demographics.map(d => {
              const sc = getSportConfig(d.topSport);
              return (
                <div key={d.id} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-400">{d.segment}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Avg: <span className="text-white font-bold">${d.avgSpend}</span></span>
                    <span className={`px-1 py-0.5 rounded ${sc.bg} ${sc.text} font-bold`}>{sc.label}</span>
                    <span className="text-emerald-400 font-bold">+{d.growthRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            Growth Metrics
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {growthMetrics.map(gm => {
              const sc = getSportConfig(gm.sport);
              return (
                <div key={gm.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${sc.bg} ${sc.text}`}>{gm.sportLabel}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{gm.metric}</p>
                      <p className="text-[10px] text-slate-500">{gm.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {gm.unit === 'USD' ? formatCurrency(gm.currentValue) : gm.currentValue.toLocaleString()} {gm.unit !== 'USD' ? gm.unit : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${gm.changePercent >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      +{gm.changePercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Milestones Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-violet-400" />
          Historical Milestones
        </h2>
        <div className="space-y-3">
          {milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ms => {
            const sc = getSportConfig(ms.sport);
            return (
              <div key={ms.id} className="flex items-start gap-4 p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${ms.impactScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' : ms.impactScore >= 80 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {ms.impactScore}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1">impact</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    <span className="text-[10px] text-slate-500">{ms.date}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{ms.title}</p>
                  <p className="text-xs text-slate-400">{ms.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-emerald-400">+{ms.priceImpact}%</p>
                  <p className="text-[10px] text-slate-500">price impact</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Comparison Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-cyan-400" />
          Market Comparison &mdash; Women&apos;s vs Men&apos;s
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map(mc => (
            <div key={mc.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">{mc.sport}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${mc.gapTrend === 'narrowing' ? 'bg-emerald-500/20 text-emerald-400' : mc.gapTrend === 'widening' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {mc.gapTrend === 'narrowing' ? 'GAP CLOSING' : mc.gapTrend === 'widening' ? 'GAP WIDENING' : 'STABLE'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">{mc.athleteWomens}</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(mc.womensValue)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">{mc.athleteMens}</p>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(mc.mensValue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] border-t border-slate-700/50 pt-2">
                <span className="text-slate-500">Value Gap: <span className="text-white font-bold">{mc.valueGap.toFixed(1)}%</span></span>
                <span className={`font-bold flex items-center gap-0.5 ${mc.gapChangePercent < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {mc.gapChangePercent < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                  {Math.abs(mc.gapChangePercent).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* League Profiles */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          League Profiles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leagueProfiles.map(lp => {
            const sc = getSportConfig(lp.sport);
            return (
              <div key={lp.id} className="p-4 rounded-xl border bg-slate-900/50 border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lp.color }} />
                  <span className={`text-sm font-bold ${sc.text}`}>{lp.sportLabel}</span>
                </div>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Founded</span>
                    <span className="text-white font-bold">{lp.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Teams</span>
                    <span className="text-white font-bold">{lp.teams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Attendance</span>
                    <span className="text-white font-bold">{lp.avgAttendance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TV Deal</span>
                    <span className="text-white font-bold truncate ml-2">{lp.tvDeal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Card Market</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(lp.cardMarketSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Media Growth</span>
                    <span className="text-brand-lime font-bold">+{lp.mediaGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Top Player</span>
                    <span className="text-amber-400 font-bold truncate ml-2">{lp.topPlayer}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Cap by League BarChart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-violet-400" />
          Market Cap by League
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketCapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [formatCurrency(value), 'Market Cap']}
              />
              <Bar dataKey="marketCap" name="Market Cap" radius={[4, 4, 0, 0]}>
                {marketCapData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WomensSportsIndex;
