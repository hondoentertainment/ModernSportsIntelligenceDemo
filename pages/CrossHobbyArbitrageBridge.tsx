// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ArrowRightLeft,
  Target,
  BarChart3,
  Layers,
  Star,
  DollarSign,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Cell,
} from 'recharts';
import {
  getCrossHobbyComparisons,
  getArbitrageSignals,
  getHobbyCorrelations,
  getCrossHobbyTrends,
  formatCurrency,
  HOBBY_LABELS,
  type CrossHobbyComparison,
  type ArbitrageSignal,
  type HobbyCorrelation,
  type CrossHobbyTrend,
  type CrossHobbyItem,
} from '../lib/trading/crossHobbyArbitrageService.ts';

const HOBBY_COLORS: Record<string, string> = {
  'sports-card': '#10b981',
  coin: '#f59e0b',
  stamp: '#a78bfa',
  comic: '#f87171',
  memorabilia: '#60a5fa',
  'fine-art': '#fb923c',
  'game-worn': '#34d399',
};

const TREND_COLORS: Record<string, string> = {
  sportsCards: '#10b981',
  coins: '#f59e0b',
  stamps: '#a78bfa',
  comics: '#f87171',
  memorabilia: '#60a5fa',
};

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee'];

const relativeValueColor = (score: number): string => {
  if (score >= 120) return 'text-red-400';
  if (score >= 105) return 'text-amber-400';
  if (score <= 75) return 'text-emerald-400';
  if (score <= 90) return 'text-blue-400';
  return 'text-slate-300';
};

const relativeValueLabel = (score: number): string => {
  if (score >= 120) return 'Overpriced';
  if (score >= 105) return 'Slightly High';
  if (score <= 75) return 'Underpriced';
  if (score <= 90) return 'Good Value';
  return 'Fair Value';
};

const liquidityBadge = (l: CrossHobbyItem['liquidity']) => {
  const map = { low: 'bg-red-500/10 text-red-400', medium: 'bg-amber-500/10 text-amber-400', high: 'bg-emerald-500/10 text-emerald-400' };
  return map[l];
};

const scarcityBadge = (s: CrossHobbyItem['scarcity']) => {
  const map = { common: 'text-slate-500', scarce: 'text-blue-400', rare: 'text-purple-400', unique: 'text-amber-400' };
  return map[s];
};

const CrossHobbyArbitrageBridge: React.FC = () => {
  const [comparisons, setComparisons] = useState<CrossHobbyComparison[]>([]);
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [correlations, setCorrelations] = useState<HobbyCorrelation[]>([]);
  const [trends, setTrends] = useState<CrossHobbyTrend[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('Michael Jordan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const comps = getCrossHobbyComparisons();
      setComparisons(comps);
      setSignals(getArbitrageSignals());
      setCorrelations(getHobbyCorrelations());
      setTrends(getCrossHobbyTrends());
      if (comps.length > 0) setSelectedSubject(comps[0].subject);
      setLoading(false);
    } catch {
      setError('Failed to load Cross-Hobby Arbitrage data');
      setLoading(false);
    }
  }, []);

  const activeComparison = useMemo(
    () => comparisons.find(c => c.subject === selectedSubject) ?? null,
    [comparisons, selectedSubject]
  );

  const radarData = useMemo(() => {
    if (!activeComparison) return [];
    return activeComparison.items.map(item => ({
      hobby: HOBBY_LABELS[item.hobby],
      score: item.relativeValueScore,
      fullMark: 160,
    }));
  }, [activeComparison]);

  const subjectSignals = useMemo(
    () => signals.filter(s => s.subject === selectedSubject),
    [signals, selectedSubject]
  );

  const cagrData = useMemo(() => {
    if (!activeComparison) return [];
    return activeComparison.items
      .map(item => ({
        name: HOBBY_LABELS[item.hobby],
        cagr: item.fiveYrCagr,
        hobby: item.hobby,
      }))
      .sort((a, b) => b.cagr - a.cagr);
  }, [activeComparison]);

  // Trend data: show last 12 months for readability
  const trendSlice = useMemo(() => trends.slice(-12), [trends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Cross-Hobby Arbitrage Bridge...</p>
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <ArrowRightLeft size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cross-Hobby Collectibles Arbitrage Bridge</h1>
          <p className="text-sm text-slate-400">Systematic price comparison across sports cards, coins, stamps, comics, memorabilia &amp; fine art</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Subjects Tracked</p>
          <p className="text-3xl font-bold text-emerald-400">{comparisons.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Arbitrage Signals</p>
          <p className="text-3xl font-bold text-amber-400">{signals.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hobby Categories</p>
          <p className="text-3xl font-bold text-blue-400">7</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Max Opportunity</p>
          <p className="text-3xl font-bold text-purple-400">
            {Math.max(...signals.map(s => s.potentialGain))}%
          </p>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Select Subject
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {comparisons.map(comp => (
            <button
              key={comp.subject}
              onClick={() => setSelectedSubject(comp.subject)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedSubject === comp.subject
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600'
              }`}
            >
              <p className={`text-sm font-bold mb-1 ${selectedSubject === comp.subject ? 'text-emerald-300' : 'text-white'}`}>
                {comp.subject}
              </p>
              <p className="text-[10px] text-slate-500 mb-2">{comp.items.length} collectible types</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold ${comp.arbitrageOpportunity >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  +{comp.arbitrageOpportunity}% opp.
                </span>
                <ChevronRight size={12} className="text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeComparison && (
        <>
          {/* Comparison Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
              <Layers size={18} className="text-blue-400" />
              {activeComparison.subject} — Cross-Hobby Comparison
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Relative Value Score: 100 = fairly priced. Below 100 = underpriced. Above 100 = overpriced.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Hobby</th>
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Item</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Value</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">5yr CAGR</th>
                    <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Liquidity</th>
                    <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-4">Scarcity</th>
                    <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Rel. Value</th>
                  </tr>
                </thead>
                <tbody>
                  {activeComparison.items.map(item => (
                    <tr key={item.id} className="border-b border-slate-700/20 hover:bg-slate-700/10 transition-colors">
                      <td className="py-3 pr-4">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                          style={{ backgroundColor: `${HOBBY_COLORS[item.hobby]}30`, color: HOBBY_COLORS[item.hobby] }}
                        >
                          {HOBBY_LABELS[item.hobby]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 max-w-[200px]">
                        <p className="text-sm font-medium text-white truncate">{item.itemName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.description.slice(0, 60)}...</p>
                      </td>
                      <td className="py-3 pr-4 text-right text-sm font-bold text-white">{formatCurrency(item.currentValue)}</td>
                      <td className="py-3 pr-4 text-right">
                        <span className={`text-sm font-bold ${item.fiveYrCagr >= 12 ? 'text-emerald-400' : item.fiveYrCagr >= 6 ? 'text-amber-400' : 'text-slate-400'}`}>
                          +{item.fiveYrCagr}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${liquidityBadge(item.liquidity)}`}>
                          {item.liquidity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`text-[10px] font-medium ${scarcityBadge(item.scarcity)}`}>
                          {item.scarcity.charAt(0).toUpperCase() + item.scarcity.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-base font-black ${relativeValueColor(item.relativeValueScore)}`}>
                            {item.relativeValueScore}
                          </span>
                          <span className={`text-[9px] font-bold ${relativeValueColor(item.relativeValueScore)}`}>
                            {relativeValueLabel(item.relativeValueScore)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700/30 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Most Underpriced: </span>
                <span className="text-emerald-400 font-bold">{activeComparison.mostUnderpriced}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Most Overpriced: </span>
                <span className="text-red-400 font-bold">{activeComparison.mostOverpriced}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Max Arbitrage: </span>
                <span className="text-amber-400 font-bold">+{activeComparison.arbitrageOpportunity}%</span>
              </div>
            </div>
          </div>

          {/* Radar Chart + CAGR Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Target size={18} className="text-purple-400" />
                Relative Value Radar
              </h2>
              <p className="text-xs text-slate-500 mb-4">100 = fair value. Outer = overpriced. Inner = underpriced opportunity.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="hobby" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Radar
                      name="Relative Value"
                      dataKey="score"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: number) => [`${v} (${relativeValueLabel(v)})`, 'Relative Value Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                5-Year CAGR by Hobby
              </h2>
              <p className="text-xs text-slate-500 mb-4">Annualized return comparison for {activeComparison.subject} collectibles.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cagrData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: number) => [`${v}%`, '5yr CAGR']}
                    />
                    <Bar dataKey="cagr" name="5yr CAGR" radius={[4, 4, 0, 0]}>
                      {cagrData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={HOBBY_COLORS[entry.hobby] ?? CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Arbitrage Signals */}
          <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-amber-400" />
              Arbitrage Signals — {activeComparison.subject}
              {subjectSignals.length === 0 && <span className="text-sm text-slate-500 font-normal ml-2">Viewing all signals below</span>}
            </h2>
            <div className="space-y-3">
              {(subjectSignals.length > 0 ? subjectSignals : signals.slice(0, 4)).map(sig => (
                <div key={sig.id} className="bg-slate-900/50 border border-amber-500/10 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          BUY {sig.buyHobby}
                        </span>
                        <ArrowRightLeft size={10} className="text-slate-600" />
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">
                          SELL {sig.sellHobby}
                        </span>
                        <span className="text-[10px] text-slate-500">· {sig.subject}</span>
                      </div>
                      <p className="text-sm text-slate-300 truncate">
                        <span className="text-emerald-400 font-medium">{sig.buyItem}</span>
                        <span className="text-slate-600 mx-1">vs.</span>
                        <span className="text-red-400 font-medium">{sig.sellItem}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xl font-black text-amber-400">+{sig.potentialGain}%</p>
                      <p className="text-[10px] text-slate-500">potential gain</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{sig.rationale}</p>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-500"><Clock size={10} /> {sig.timeHorizon}</span>
                    <span className={`font-bold ${sig.confidence >= 70 ? 'text-emerald-400' : sig.confidence >= 55 ? 'text-amber-400' : 'text-red-400'}`}>
                      {sig.confidence}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cross-Hobby Price Trend Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Cross-Hobby Price Trends (24 Months)
        </h2>
        <p className="text-xs text-slate-500 mb-4">Index: 100 = Jan 2020 baseline. Showing Jan 2024 — Dec 2025.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendSlice}>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="sportsCards" name="Sports Cards" stroke={TREND_COLORS.sportsCards} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="memorabilia" name="Memorabilia" stroke={TREND_COLORS.memorabilia} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="comics" name="Comics" stroke={TREND_COLORS.comics} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="coins" name="Coins" stroke={TREND_COLORS.coins} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stamps" name="Stamps" stroke={TREND_COLORS.stamps} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          {Object.entries(TREND_COLORS).map(([key, color]) => (
            <span key={key} className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </span>
          ))}
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          Correlation Matrix
        </h2>
        <p className="text-xs text-slate-500 mb-4">How much do collectible categories move together? (-1 = inverse, 0 = no link, 1 = perfect sync)</p>
        <div className="space-y-2">
          {correlations.map((corr, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/50 border border-slate-700/20 rounded-xl">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold whitespace-nowrap">{corr.hobby1}</span>
                <span className="text-slate-600 text-xs">↔</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold whitespace-nowrap">{corr.hobby2}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-24 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${corr.correlation >= 0.7 ? 'bg-emerald-500' : corr.correlation >= 0.4 ? 'bg-amber-500' : 'bg-slate-500'}`}
                    style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-black w-12 text-right ${corr.correlation >= 0.7 ? 'text-emerald-400' : corr.correlation >= 0.4 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {corr.correlation.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden lg:block flex-1 min-w-0 truncate">{corr.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Sports Cards? */}
      <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
          <Info size={18} className="text-emerald-400" />
          Why Sports Cards Lead the Pack
        </h2>
        <p className="text-xs text-slate-500 mb-4">CAGR comparison against alternative collectible categories (10-year average, all subjects combined)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Sports Cards', cagr: 18.2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Memorabilia', cagr: 10.6, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Comics', cagr: 11.4, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'Game-Worn', cagr: 13.8, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
            { label: 'Fine Art', cagr: 6.1, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Coins', cagr: 4.3, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Stamps', cagr: 2.7, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { label: 'S&P 500', cagr: 10.5, color: 'text-slate-300', bg: 'bg-slate-700/30 border-slate-600/30' },
          ].map((item, idx) => (
            <div key={idx} className={`border rounded-xl p-3 text-center ${item.bg}`}>
              <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
              <p className={`text-2xl font-black ${item.color}`}>{item.cagr}%</p>
              <p className="text-[9px] text-slate-600 mt-0.5">10yr CAGR</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { icon: <DollarSign size={14} />, text: 'Sports cards offer the highest liquidity of any collectible category — active daily markets on eBay, COMC, and PWCC.' },
            { icon: <TrendingUp size={14} />, text: 'Population reports and grading standards create transparent, verifiable scarcity that stamps and comics lack.' },
            { icon: <Target size={14} />, text: 'Cross-hobby arbitrage opportunities arise because sports card price discovery is faster and more efficient than adjacent markets.' },
          ].map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="text-emerald-400 flex-shrink-0 mt-0.5">{point.icon}</span>
              <p>{point.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossHobbyArbitrageBridge;
