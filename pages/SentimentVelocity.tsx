import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Activity, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Zap, Clock, Target, BarChart3, ArrowUpRight, ArrowDownRight,
  ChevronRight, Radio, Waves, GitBranch, Eye, RefreshCw,
  Twitter, Globe, Youtube, MessageSquare, Newspaper, X,
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
  BarChart, PieChart, Pie,
} from 'recharts';
import {
  getVelocityDashboard,
  getInflectionPoints,
  getSentimentHistory,
  getVelocityAlerts,
  getMarketSentimentMap,
  getDivergences,
  getSentimentWaves,
  getMomentumShifts,
  getSourceBreakdown,
  getAccuracyMetrics,
  type SentimentVelocity as SVelocity,
  type InflectionPoint,
  type VelocityAlert,
  type DivergenceAlert,
  type SentimentWave,
  type MomentumShift,
  type SentimentSource,
} from '../lib/sentimentVelocityService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const velColor = (v: number) => {
  if (v >= 3) return 'text-emerald-400';
  if (v >= 1) return 'text-emerald-300';
  if (v > -1) return 'text-slate-300';
  if (v > -3) return 'text-red-300';
  return 'text-red-400';
};

const velBg = (v: number) => {
  if (v >= 3) return 'bg-emerald-500/20 border-emerald-500/30';
  if (v >= 1) return 'bg-emerald-500/10 border-emerald-500/20';
  if (v > -1) return 'bg-slate-500/20 border-slate-500/30';
  if (v > -3) return 'bg-red-500/10 border-red-500/20';
  return 'bg-red-500/20 border-red-500/30';
};

const accIcon = (v: SVelocity) => {
  if (v.isAccelerating) return <Zap size={12} className="text-amber-400" />;
  if (v.isDecelerating) return <Activity size={12} className="text-blue-400" />;
  return <Minus size={12} className="text-slate-500" />;
};

const severityStyle: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const inflectionIcon = (type: string) => {
  switch (type) {
    case 'peak': return <TrendingDown size={14} className="text-red-400" />;
    case 'trough': return <TrendingUp size={14} className="text-emerald-400" />;
    case 'acceleration': return <Zap size={14} className="text-amber-400" />;
    case 'deceleration': return <Activity size={14} className="text-blue-400" />;
    default: return <Minus size={14} className="text-slate-400" />;
  }
};

const sourceIcon = (name: string) => {
  switch (name) {
    case 'twitter': return <Twitter size={14} className="text-sky-400" />;
    case 'reddit': return <ArrowUpRight size={14} className="text-orange-400" />;
    case 'youtube': return <Youtube size={14} className="text-red-400" />;
    case 'forums': return <MessageSquare size={14} className="text-purple-400" />;
    case 'news': return <Newspaper size={14} className="text-emerald-400" />;
    default: return <Globe size={14} className="text-slate-400" />;
  }
};

const formatCountdown = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

type TabKey = 'dashboard' | 'inflections' | 'divergences' | 'waves' | 'accuracy';

// ── Component ────────────────────────────────────────────────────────────────

const SentimentVelocity: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState<VelocityAlert[]>([]);
  const [sportFilter, setSportFilter] = useState('All');

  const velocities = useMemo(() => getVelocityDashboard(), []);
  const inflections = useMemo(() => getInflectionPoints(), []);
  const marketMap = useMemo(() => getMarketSentimentMap(), []);
  const divergences = useMemo(() => getDivergences(), []);
  const waves = useMemo(() => getSentimentWaves(), []);
  const shifts = useMemo(() => getMomentumShifts(), []);
  const accuracy = useMemo(() => getAccuracyMetrics(), []);
  const alerts = useMemo(() => getVelocityAlerts(), []);

  const filteredVelocities = useMemo(
    () => sportFilter === 'All' ? velocities : velocities.filter(v => v.sport === sportFilter),
    [velocities, sportFilter],
  );

  // Simulate live alerts
  useEffect(() => {
    setLiveAlerts(alerts.slice(0, 3));
    const interval = setInterval(() => {
      setLiveAlerts(prev => {
        const next = alerts[Math.floor(Math.random() * alerts.length)];
        const updated = { ...next, id: `live-${Date.now()}`, timestamp: new Date().toISOString() };
        return [updated, ...prev].slice(0, 6);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [alerts]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const selectedVelocity = useMemo(
    () => selectedPlayer ? velocities.find(v => v.playerId === selectedPlayer) : null,
    [selectedPlayer, velocities],
  );

  const selectedHistory = useMemo(
    () => selectedPlayer ? getSentimentHistory(selectedPlayer, 48) : [],
    [selectedPlayer],
  );

  const selectedSources = useMemo(
    () => selectedPlayer ? getSourceBreakdown(selectedPlayer) : [],
    [selectedPlayer],
  );

  const chartData = useMemo(() => {
    if (!selectedHistory.length) return [];
    return selectedHistory.filter((_, i) => i % 2 === 0).map((r, idx) => {
      const prev = idx > 0 ? selectedHistory[(idx - 1) * 2] : r;
      const vel = r.sentimentScore - prev.sentimentScore;
      return {
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentiment: r.sentimentScore,
        velocity: Math.round(vel * 10) / 10,
        volume: r.volume,
      };
    });
  }, [selectedHistory]);

  const handlePlayerClick = useCallback((id: string) => {
    setSelectedPlayer(prev => prev === id ? null : id);
  }, []);

  const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Velocity Dashboard', icon: <Activity size={14} /> },
    { key: 'inflections', label: 'Inflection Radar', icon: <Target size={14} /> },
    { key: 'divergences', label: 'Divergences', icon: <GitBranch size={14} /> },
    { key: 'waves', label: 'Wave Analysis', icon: <Waves size={14} /> },
    { key: 'accuracy', label: 'Accuracy', icon: <BarChart3 size={14} /> },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl" />)}
        </div>
        <div className="h-96 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap size={22} className="text-amber-400" />
            </div>
            Sentiment Velocity Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Second-derivative sentiment analysis — catch inflection points before prices move
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Radio size={10} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {velocities.length} players tracked
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Market Velocity</div>
          <div className={`text-xl font-black ${velColor(marketMap.overallVelocity)}`}>
            {marketMap.overallVelocity > 0 ? '+' : ''}{marketMap.overallVelocity}/hr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Accel: {marketMap.overallAcceleration > 0 ? '+' : ''}{marketMap.overallAcceleration}/hr²</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Inflections</div>
          <div className="text-xl font-black text-amber-400">{inflections.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Next in {formatCountdown(Math.min(...inflections.map(i => i.countdown)))}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bullish / Bearish</div>
          <div className="text-xl font-black">
            <span className="text-emerald-400">{marketMap.bullishCount}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-red-400">{marketMap.bearishCount}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{marketMap.neutralCount} neutral</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prediction Accuracy</div>
          <div className="text-xl font-black text-blue-400">{Math.round(accuracy.avgPrecision * 100)}%</div>
          <div className="text-[10px] text-slate-500 mt-1">{accuracy.inflectionsCaught} inflections caught</div>
        </div>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === t.key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SPORTS.map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                sportFilter === s
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Main Panel */}
        <div className="lg:col-span-2 space-y-4">
          {tab === 'dashboard' && (
            <>
              {/* Velocity Table */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <h2 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Activity size={14} className="text-amber-400" />
                    Player Velocity Rankings
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-700/30">
                        <th className="text-left px-4 py-2">Player</th>
                        <th className="text-right px-3 py-2">Sentiment</th>
                        <th className="text-right px-3 py-2">Velocity</th>
                        <th className="text-right px-3 py-2">Accel</th>
                        <th className="text-right px-3 py-2 hidden sm:table-cell">Dir. Change</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">Inflection</th>
                        <th className="text-right px-4 py-2 hidden md:table-cell">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVelocities
                        .sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity))
                        .map(v => (
                          <tr
                            key={v.playerId}
                            onClick={() => handlePlayerClick(v.playerId)}
                            className={`border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/40 ${
                              selectedPlayer === v.playerId ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : ''
                            }`}
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-bold text-slate-200">{v.playerName}</div>
                              <div className="text-[10px] text-slate-500">{v.sport}</div>
                            </td>
                            <td className="text-right px-3 py-2.5">
                              <span className={`font-mono font-bold ${v.currentSentiment >= 50 ? 'text-emerald-400' : v.currentSentiment >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                                {v.currentSentiment}
                              </span>
                            </td>
                            <td className="text-right px-3 py-2.5">
                              <div className={`flex items-center justify-end gap-1 font-mono font-bold ${velColor(v.velocity)}`}>
                                {v.velocity > 0 ? <TrendingUp size={12} /> : v.velocity < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                                {v.velocity > 0 ? '+' : ''}{v.velocity.toFixed(1)}/hr
                              </div>
                            </td>
                            <td className="text-right px-3 py-2.5">
                              <div className="flex items-center justify-end gap-1">
                                {accIcon(v)}
                                <span className={`font-mono text-[11px] ${v.acceleration > 0 ? 'text-amber-400' : v.acceleration < 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                                  {v.acceleration > 0 ? '+' : ''}{v.acceleration.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td className="text-right px-3 py-2.5 hidden sm:table-cell">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                v.directionChangeProbability > 0.6
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-700/50 text-slate-400'
                              }`}>
                                {Math.round(v.directionChangeProbability * 100)}%
                              </span>
                            </td>
                            <td className="text-right px-3 py-2.5 hidden md:table-cell">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {v.timeToInflection < 48 ? formatCountdown(v.timeToInflection) : '--'}
                              </span>
                            </td>
                            <td className="text-right px-4 py-2.5 hidden md:table-cell">
                              <div className="font-mono text-slate-300">${v.currentPrice.toLocaleString()}</div>
                              <div className={`text-[10px] font-mono ${v.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {v.priceChange24h >= 0 ? '+' : ''}{v.priceChange24h}%
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Heat Map */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                  <Eye size={14} className="text-amber-400" />
                  Market Velocity Heat Map
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {marketMap.sectors.map(sec => (
                    <div
                      key={sec.sport}
                      className={`rounded-lg p-3 border transition-all ${
                        sec.avgVelocity > 1
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : sec.avgVelocity < -1
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-slate-800/50 border-slate-700/30'
                      }`}
                    >
                      <div className="text-[10px] font-black text-slate-400 uppercase">{sec.sport}</div>
                      <div className={`text-lg font-black ${velColor(sec.avgVelocity)}`}>
                        {sec.avgVelocity > 0 ? '+' : ''}{sec.avgVelocity}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Sent: {sec.avgSentiment} | {sec.playerCount} players
                      </div>
                      <div className={`text-[10px] font-bold mt-1 ${
                        sec.trend === 'accelerating' ? 'text-emerald-400' :
                        sec.trend === 'decelerating' ? 'text-red-400' : 'text-slate-500'
                      }`}>
                        {sec.trend}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Momentum Shifts Timeline */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                  <RefreshCw size={14} className="text-purple-400" />
                  Recent Momentum Shifts
                </h3>
                <div className="space-y-2">
                  {shifts.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.from === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                          s.from === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600/30 text-slate-400'
                        }`}>{s.from}</span>
                        <ChevronRight size={10} className="text-slate-600" />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.to === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                          s.to === 'bearish' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600/30 text-slate-400'
                        }`}>{s.to}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{s.playerName}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        mag: {s.magnitude.toFixed(1)}
                      </div>
                      <div className={`text-[10px] font-mono ${s.priceChangeAfter >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.priceChangeAfter >= 0 ? '+' : ''}{s.priceChangeAfter}%
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'inflections' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                  <Target size={14} className="text-amber-400" />
                  Predicted Inflection Points
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inflections.sort((a, b) => a.countdown - b.countdown).map(ip => (
                    <div
                      key={ip.id}
                      className={`p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${
                        ip.type === 'peak' || ip.type === 'deceleration'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                      onClick={() => handlePlayerClick(ip.playerId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {inflectionIcon(ip.type)}
                          <span className="text-xs font-bold text-slate-200">{ip.playerName}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          ip.type === 'peak' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          ip.type === 'trough' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          ip.type === 'acceleration' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {ip.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2">
                        <span>{ip.priorTrend} → {ip.expectedNewTrend}</span>
                        <span>conf: {Math.round(ip.confidence * 100)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-amber-400" />
                          <span className="text-xs font-black text-amber-400">{formatCountdown(ip.countdown)}</span>
                        </div>
                        <div className={`text-xs font-mono font-bold ${ip.expectedPriceImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {ip.expectedPriceImpact >= 0 ? '+' : ''}{ip.expectedPriceImpact}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${ip.countdown < 3 ? 'bg-amber-400' : 'bg-slate-500'}`}
                          style={{ width: `${Math.max(5, 100 - (ip.countdown / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'divergences' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                  <GitBranch size={14} className="text-purple-400" />
                  Sentiment vs Price Divergences
                </h3>
                <div className="space-y-3">
                  {divergences.map(d => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-purple-500/30 transition-all cursor-pointer"
                      onClick={() => handlePlayerClick(d.playerId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-200">{d.playerName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.divergenceScore > 70 ? 'bg-red-500/20 text-red-400' :
                          d.divergenceScore > 40 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-600/30 text-slate-400'
                        }`}>
                          Score: {d.divergenceScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Sentiment:</span>
                          <span className={d.sentimentDirection === 'bullish' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {d.sentimentDirection === 'bullish' ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />}
                            {' '}{d.sentimentDirection}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">Price:</span>
                          <span className={d.priceDirection === 'up' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {d.priceDirection === 'up' ? <ArrowUpRight size={12} className="inline" /> : <ArrowDownRight size={12} className="inline" />}
                            {' '}{d.priceDirection}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                        <span>Duration: {d.duration}h</span>
                        <span>Confidence: {Math.round(d.confidence * 100)}%</span>
                        <span className="text-amber-400 font-bold">Expected: {d.expectedResolution.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'waves' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                  <Waves size={14} className="text-blue-400" />
                  Sentiment Wave Analysis
                </h3>
                <div className="space-y-3">
                  {waves.map(w => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-blue-500/30 transition-all cursor-pointer"
                      onClick={() => handlePlayerClick(w.playerId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-200">{w.playerName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            w.waveType === 'impulse' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {w.waveType}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold ${
                          w.currentPosition === 'ascending' ? 'text-emerald-400' :
                          w.currentPosition === 'peak' ? 'text-amber-400' :
                          w.currentPosition === 'descending' ? 'text-red-400' :
                          'text-blue-400'
                        }`}>
                          {w.currentPosition}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 mb-2">
                        <div>Amplitude: <span className="text-slate-200 font-bold">{w.amplitude}</span></div>
                        <div>Period: <span className="text-slate-200 font-bold">{w.period}h</span></div>
                        <div>Phase: <span className="text-slate-200 font-bold">{w.phase}°</span></div>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            w.currentPosition === 'ascending' ? 'bg-emerald-400' :
                            w.currentPosition === 'peak' ? 'bg-amber-400' :
                            w.currentPosition === 'descending' ? 'bg-red-400' :
                            'bg-blue-400'
                          }`}
                          style={{ width: `${w.completionPercent}%` }}
                        />
                      </div>
                      <div className="text-right text-[10px] text-slate-500 mt-1">{w.completionPercent}% complete</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'accuracy' && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-400" />
                  Prediction Accuracy Tracker
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-blue-400">{Math.round(accuracy.avgPrecision * 100)}%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Avg Precision</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-emerald-400">{accuracy.inflectionsCaught}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Inflections Caught</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-amber-400">{accuracy.avgLeadTime}h</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Avg Lead Time</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-black text-purple-400">{accuracy.totalPredictions}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Predictions</div>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { label: 'Peak', correct: 34, missed: 12 },
                      { label: 'Trough', correct: 41, missed: 8 },
                      { label: 'Accel', correct: 38, missed: 15 },
                      { label: 'Decel', correct: 29, missed: 10 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="correct" fill="#34d399" radius={[4, 4, 0, 0]} name="Correct" />
                      <Bar dataKey="missed" fill="#f87171" radius={[4, 4, 0, 0]} name="Missed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Player Deep Dive */}
          {selectedPlayer && selectedVelocity ? (
            <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Eye size={14} className="text-amber-400" />
                  {selectedVelocity.playerName}
                </h3>
                <button onClick={() => setSelectedPlayer(null)} className="text-slate-500 hover:text-slate-300">
                  <X size={14} />
                </button>
              </div>

              {/* Velocity Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Sentiment</div>
                  <div className={`text-lg font-black ${selectedVelocity.currentSentiment >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedVelocity.currentSentiment}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Velocity</div>
                  <div className={`text-lg font-black ${velColor(selectedVelocity.velocity)}`}>
                    {selectedVelocity.velocity > 0 ? '+' : ''}{selectedVelocity.velocity.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Acceleration</div>
                  <div className={`text-lg font-black ${selectedVelocity.acceleration > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                    {selectedVelocity.acceleration > 0 ? '+' : ''}{selectedVelocity.acceleration.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Inflection</div>
                  <div className="text-lg font-black text-amber-400">
                    {selectedVelocity.timeToInflection < 48 ? formatCountdown(selectedVelocity.timeToInflection) : '--'}
                  </div>
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="h-48 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} interval={Math.floor(chartData.length / 5)} />
                      <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 9 }} domain={[-100, 100]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Area yAxisId="left" dataKey="sentiment" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} name="Sentiment" />
                      <Line yAxisId="right" dataKey="velocity" stroke="#f59e0b" strokeWidth={2} dot={false} name="Velocity" />
                      <ReferenceLine yAxisId="left" y={0} stroke="#475569" strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Source Breakdown */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Source Breakdown</div>
                <div className="space-y-1.5">
                  {selectedSources.map(src => (
                    <div key={src.name} className="flex items-center gap-2">
                      {sourceIcon(src.name)}
                      <span className="text-[10px] text-slate-400 w-14 capitalize">{src.name}</span>
                      <div className="flex-1 bg-slate-800/50 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${src.score >= 50 ? 'bg-emerald-400' : src.score >= 0 ? 'bg-slate-400' : 'bg-red-400'}`}
                          style={{ width: `${(src.score + 100) / 2}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono font-bold w-8 text-right ${src.score >= 50 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {src.score}
                      </span>
                      <span className={`text-[10px] font-mono w-12 text-right ${velColor(src.velocity)}`}>
                        {src.velocity > 0 ? '+' : ''}{src.velocity.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                <div className="bg-slate-800/30 rounded p-2">
                  <span className="text-slate-500">Price Corr:</span>
                  <span className="text-slate-200 font-bold ml-1">{selectedVelocity.priceCorrelation.toFixed(2)}</span>
                </div>
                <div className="bg-slate-800/30 rounded p-2">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="text-slate-200 font-bold ml-1">{Math.round(selectedVelocity.historicalAccuracy * 100)}%</span>
                </div>
                <div className="bg-slate-800/30 rounded p-2">
                  <span className="text-slate-500">Dir Change:</span>
                  <span className="text-amber-400 font-bold ml-1">{Math.round(selectedVelocity.directionChangeProbability * 100)}%</span>
                </div>
                <div className="bg-slate-800/30 rounded p-2">
                  <span className="text-slate-500">State:</span>
                  <span className={`font-bold ml-1 ${selectedVelocity.isAccelerating ? 'text-amber-400' : selectedVelocity.isDecelerating ? 'text-blue-400' : 'text-slate-400'}`}>
                    {selectedVelocity.isAccelerating ? 'Accelerating' : selectedVelocity.isDecelerating ? 'Decelerating' : 'Steady'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <Eye size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Click a player to view velocity profile</p>
            </div>
          )}

          {/* Live Alerts Feed */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                Live Velocity Alerts
              </h3>
              <div className="flex items-center gap-1">
                <Radio size={8} className="text-red-400 animate-pulse" />
                <span className="text-[10px] text-red-400 font-bold">LIVE</span>
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {liveAlerts.map((a, idx) => (
                <div
                  key={`${a.id}-${idx}`}
                  className={`p-2 rounded-lg border text-xs ${severityStyle[a.severity]} cursor-pointer transition-all hover:scale-[1.01]`}
                  onClick={() => handlePlayerClick(a.playerId)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{a.playerName}</span>
                    <span className="text-[10px] opacity-70">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-relaxed">{a.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
                    <span>vel: {a.velocity > 0 ? '+' : ''}{a.velocity}</span>
                    <span>acc: {a.acceleration > 0 ? '+' : ''}{a.acceleration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentVelocity;
