import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Flame,
  Gauge,
  Globe,
  Layers,
  Radio,
  Shield,
  Signal,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  getAllProfiles,
  getAllPlayerIds,
  getSentimentSurface,
  getVolatilityTimeSeries,
  getPlayerSentimentProfile,
  getSentimentSignals,
  calculateSVI,
  getEmotionHeatMap,
  getSocialMomentum,
  getVolRegimeHistory,
  compareSentimentVsPrice,
  getTopMovers,
  formatCurrency,
  formatPercent,
  type PlayerSentimentProfile,
  type SentimentSignal,
  type SentimentSurface,
  type VolatilityDataPoint,
  type SocialMomentumIndex,
  type VolRegimeHistoryEntry,
  type SentimentVsPricePoint,
  type TopMover,
  type VolRegime,
  type SignalType,
  type EmotionVector,
} from '../lib/sentimentVolatilityService.ts';

// ── Constants ───────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'surface' | 'signals' | 'emotions' | 'momentum' | 'regime';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'SVI Dashboard', icon: <Gauge size={16} /> },
  { id: 'surface', label: 'Volatility Surface', icon: <Layers size={16} /> },
  { id: 'signals', label: 'Sentiment Signals', icon: <Signal size={16} /> },
  { id: 'emotions', label: 'Emotion Heat Map', icon: <Flame size={16} /> },
  { id: 'momentum', label: 'Social Momentum', icon: <Globe size={16} /> },
  { id: 'regime', label: 'Regime History', icon: <Radio size={16} /> },
];

const REGIME_COLORS: Record<VolRegime, string> = {
  low: '#22c55e',
  normal: '#3b82f6',
  elevated: '#f59e0b',
  extreme: '#ef4444',
};

const REGIME_BG: Record<VolRegime, string> = {
  low: 'bg-emerald-500/20 text-emerald-300',
  normal: 'bg-blue-500/20 text-blue-300',
  elevated: 'bg-amber-500/20 text-amber-300',
  extreme: 'bg-red-500/20 text-red-300',
};

const SIGNAL_COLORS: Record<SignalType, string> = {
  'buy-fear': '#22c55e',
  'sell-euphoria': '#ef4444',
  'hold-neutral': '#64748b',
  'caution-rising': '#f59e0b',
  'opportunity-dip': '#3b82f6',
};

const SIGNAL_BG: Record<SignalType, string> = {
  'buy-fear': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'sell-euphoria': 'bg-red-500/20 text-red-300 border-red-500/30',
  'hold-neutral': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'caution-rising': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'opportunity-dip': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const SIGNAL_LABELS: Record<SignalType, string> = {
  'buy-fear': 'BUY (Fear)',
  'sell-euphoria': 'SELL (Euphoria)',
  'hold-neutral': 'HOLD',
  'caution-rising': 'CAUTION',
  'opportunity-dip': 'OPPORTUNITY',
};

const EMOTION_KEYS: (keyof EmotionVector)[] = ['fear', 'greed', 'excitement', 'anxiety', 'apathy', 'euphoria', 'anger', 'hope'];

const EMOTION_COLORS: Record<keyof EmotionVector, string> = {
  fear: '#ef4444',
  greed: '#f59e0b',
  excitement: '#a855f7',
  anxiety: '#f97316',
  apathy: '#64748b',
  euphoria: '#22c55e',
  anger: '#dc2626',
  hope: '#3b82f6',
};

// ── Tooltip styling ─────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
};

// ── Component ───────────────────────────────────────────────────────────────

const SentimentVolatilityIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('sv-001');

  // Data state
  const [profiles, setProfiles] = useState<PlayerSentimentProfile[]>([]);
  const [signals, setSignals] = useState<SentimentSignal[]>([]);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [emotionHeatMap, setEmotionHeatMap] = useState<{ playerId: string; playerName: string; sport: string; emotions: EmotionVector }[]>([]);
  const [socialMomentum, setSocialMomentum] = useState<SocialMomentumIndex[]>([]);

  const playerList = useMemo(() => getAllPlayerIds(), []);

  useEffect(() => {
    try {
      setProfiles(getAllProfiles());
      setSignals(getSentimentSignals());
      setTopMovers(getTopMovers(10));
      setEmotionHeatMap(getEmotionHeatMap());
      setSocialMomentum(getSocialMomentum());
      setLoading(false);
    } catch {
      setError('Failed to load Sentiment Volatility data');
      setLoading(false);
    }
  }, []);

  // Per-player derived data
  const selectedProfile = useMemo(() => profiles.find(p => p.playerId === selectedPlayerId) ?? profiles[0], [profiles, selectedPlayerId]);
  const volTimeSeries = useMemo(() => getVolatilityTimeSeries(selectedPlayerId, 168), [selectedPlayerId]);
  const surface = useMemo(() => getSentimentSurface(selectedPlayerId), [selectedPlayerId]);
  const regimeHistory = useMemo(() => getVolRegimeHistory(selectedPlayerId), [selectedPlayerId]);
  const sentimentVsPrice = useMemo(() => compareSentimentVsPrice(selectedPlayerId, 168), [selectedPlayerId]);

  // Chart-ready data
  const volChartData = useMemo(() =>
    volTimeSeries.filter((_, i) => i % 4 === 0).map(p => ({
      time: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      svi: p.sviValue,
      sentiment: p.sentimentScore,
      price: p.priceAtTime,
      volume: p.volume,
      regime: p.regime,
    })),
    [volTimeSeries]
  );

  const comparisonData = useMemo(() =>
    sentimentVsPrice.filter((_, i) => i % 4 === 0).map(p => ({
      time: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: p.sentiment,
      price: p.price,
      divergence: p.divergence,
    })),
    [sentimentVsPrice]
  );

  const surfaceHeatData = useMemo(() => {
    const rows: { expiry: string; strike: number; vol: number }[] = [];
    surface.expiries.forEach((exp, ei) => {
      surface.strikes.forEach((strike, si) => {
        rows.push({ expiry: exp, strike, vol: surface.surface[ei][si] });
      });
    });
    return rows;
  }, [surface]);

  const radarData = useMemo(() => {
    if (!selectedProfile) return [];
    return EMOTION_KEYS.map(key => ({
      emotion: key.charAt(0).toUpperCase() + key.slice(1),
      value: selectedProfile.emotionVector[key],
    }));
  }, [selectedProfile]);

  const regimeChartData = useMemo(() =>
    regimeHistory.map(r => ({
      time: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      svi: r.sviValue,
      regime: r.regime,
      trigger: r.trigger,
      duration: r.duration,
      fill: REGIME_COLORS[r.regime],
    })),
    [regimeHistory]
  );

  // ── Loading / Error ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Sentiment Volatility Index...</p>
        </div>
      </div>
    );
  }

  if (error || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'No data available'}</p>
      </div>
    );
  }

  // ── Render Helpers ────────────────────────────────────────────────────────

  const PlayerSelector = () => (
    <select
      value={selectedPlayerId}
      onChange={e => setSelectedPlayerId(e.target.value)}
      className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
    >
      {playerList.map(p => (
        <option key={p.id} value={p.id}>{p.name} ({p.sport})</option>
      ))}
    </select>
  );

  // ── Tab: Dashboard ────────────────────────────────────────────────────────

  const renderDashboard = () => {
    const avgSVI = profiles.reduce((s, p) => s + p.currentSVI, 0) / profiles.length;
    const extremeCount = profiles.filter(p => p.regime === 'extreme').length;
    const buySignals = signals.filter(s => s.type === 'buy-fear' && s.isActive).length;
    const sellSignals = signals.filter(s => s.type === 'sell-euphoria' && s.isActive).length;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market SVI</p>
            <p className="text-3xl font-bold text-cyan-400">{avgSVI.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Extreme Regimes</p>
            <p className="text-3xl font-bold text-red-400">{extremeCount}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Buy Signals</p>
            <p className="text-3xl font-bold text-emerald-400">{buySignals}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sell Signals</p>
            <p className="text-3xl font-bold text-red-400">{sellSignals}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Players Tracked</p>
            <p className="text-3xl font-bold text-blue-400">{profiles.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Scenarios</p>
            <p className="text-3xl font-bold text-amber-400">{profiles.filter(p => p.activeScenario).length}</p>
          </div>
        </div>

        {/* SVI Time Series + Player Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                SVI Time Series (7d)
              </h2>
              <PlayerSelector />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={volChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(volChartData.length / 7)} />
                  <YAxis yAxisId="svi" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                  <YAxis yAxisId="sentiment" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} domain={[-100, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area yAxisId="svi" type="monotone" dataKey="svi" fill="#06b6d4" fillOpacity={0.15} stroke="#06b6d4" strokeWidth={2} name="SVI" />
                  <Line yAxisId="sentiment" type="monotone" dataKey="sentiment" stroke="#a855f7" strokeWidth={1.5} dot={false} name="Sentiment" />
                  <ReferenceLine yAxisId="svi" y={65} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Extreme', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine yAxisId="svi" y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Elevated', fill: '#f59e0b', fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Player Profile Card */}
          {selectedProfile && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-3">{selectedProfile.playerName}</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sport / Team</span>
                  <span className="text-slate-200">{selectedProfile.sport} / {selectedProfile.team}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current SVI</span>
                  <span className="text-cyan-300 font-bold">{selectedProfile.currentSVI.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Regime</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${REGIME_BG[selectedProfile.regime]}`}>
                    {selectedProfile.regime.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Sentiment</span>
                  <span className={selectedProfile.currentSentiment >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {selectedProfile.currentSentiment > 0 ? '+' : ''}{selectedProfile.currentSentiment.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Trend</span>
                  <span className="flex items-center gap-1 text-slate-200">
                    {selectedProfile.sentimentTrend === 'rising' && <TrendingUp size={14} className="text-emerald-400" />}
                    {selectedProfile.sentimentTrend === 'falling' && <TrendingDown size={14} className="text-red-400" />}
                    {selectedProfile.sentimentTrend.charAt(0).toUpperCase() + selectedProfile.sentimentTrend.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Card Price</span>
                  <span className="text-slate-200">{formatCurrency(selectedProfile.cardPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">24h Change</span>
                  <span className={selectedProfile.priceChange24h >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {formatPercent(selectedProfile.priceChange24h)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price Correlation</span>
                  <span className="text-purple-300">{selectedProfile.priceCorrelation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Scenario</span>
                  <span className="text-amber-300 text-xs text-right max-w-[140px]">{selectedProfile.scenarioLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">30d SVI Range</span>
                  <span className="text-slate-200">{selectedProfile.minSVI30d} - {selectedProfile.maxSVI30d}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Movers + Sentiment vs Price */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movers */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Top SVI Movers (24h)
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {topMovers.map((m, i) => (
                <div key={m.playerId} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{m.playerName}</p>
                      <p className="text-xs text-slate-500">{m.sport} &middot; {m.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${m.sviChange >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {m.sviChange >= 0 ? '+' : ''}{m.sviChange.toFixed(1)} SVI
                      </p>
                      <p className={`text-xs ${m.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatPercent(m.priceChange)} price
                      </p>
                    </div>
                    {m.direction === 'up' ? <TrendingUp size={16} className="text-red-400" /> : <TrendingDown size={16} className="text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment vs Price */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              Sentiment vs Price (7d)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval={Math.floor(comparisonData.length / 7)} />
                  <YAxis yAxisId="price" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `$${v}`} />
                  <YAxis yAxisId="sent" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} domain={[-100, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="price" type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} name="Price" />
                  <Area yAxisId="sent" type="monotone" dataKey="sentiment" fill="#a855f7" fillOpacity={0.1} stroke="#a855f7" strokeWidth={1.5} name="Sentiment" />
                  <Bar yAxisId="sent" dataKey="divergence" name="Divergence" opacity={0.4}>
                    {comparisonData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.divergence >= 0 ? '#3b82f6' : '#f59e0b'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Tab: Volatility Surface ───────────────────────────────────────────────

  const renderSurface = () => {
    // Build data for heat map visualization as grouped bars per expiry
    const surfaceByExpiry = surface.expiries.map((exp, ei) => {
      const row: Record<string, string | number> = { expiry: exp };
      surface.strikes.forEach((strike, si) => {
        row[`s${strike}`] = surface.surface[ei][si];
      });
      return row;
    });

    const volColor = (val: number) => {
      if (val < 20) return '#22c55e';
      if (val < 40) return '#3b82f6';
      if (val < 60) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            Sentiment Volatility Surface
          </h2>
          <PlayerSelector />
        </div>

        {/* Surface Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Spot Sentiment</p>
            <p className="text-2xl font-bold text-cyan-400">{surface.currentSpot.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ATM Vol</p>
            <p className="text-2xl font-bold text-purple-400">{surface.atmVol.toFixed(1)}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Skew</p>
            <p className={`text-2xl font-bold ${surface.skew > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {surface.skew > 0 ? '+' : ''}{surface.skew.toFixed(1)}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Term Slope</p>
            <p className={`text-2xl font-bold ${surface.term > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
              {surface.term > 0 ? '+' : ''}{surface.term.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Heat Map Grid */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Implied Volatility Surface (Sentiment Strike x Time Horizon)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 pb-2 pr-3">Expiry</th>
                  {surface.strikes.map(s => (
                    <th key={s} className="text-center text-slate-500 pb-2 px-1 min-w-[48px]">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surface.expiries.map((exp, ei) => (
                  <tr key={exp}>
                    <td className="text-slate-400 font-medium py-1 pr-3">{exp}</td>
                    {surface.strikes.map((strike, si) => {
                      const val = surface.surface[ei][si];
                      return (
                        <td key={`${ei}-${si}`} className="text-center py-1 px-1">
                          <span
                            className="inline-block w-full rounded px-1 py-0.5 font-mono font-bold"
                            style={{
                              backgroundColor: volColor(val) + '30',
                              color: volColor(val),
                            }}
                          >
                            {val.toFixed(0)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} /> Low (&lt;20)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} /> Normal (20-40)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} /> Elevated (40-60)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} /> Extreme (&gt;60)</span>
          </div>
        </div>

        {/* Term Structure Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Vol Term Structure (ATM Slice)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surfaceByExpiry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="expiry" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="s0" name="ATM Vol" radius={[4, 4, 0, 0]}>
                  {surfaceByExpiry.map((entry, idx) => (
                    <Cell key={idx} fill={volColor(entry.s0 as number)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // ── Tab: Signals ──────────────────────────────────────────────────────────

  const renderSignals = () => {
    const activeSignals = signals.filter(s => s.isActive);
    const buyFearSignals = activeSignals.filter(s => s.type === 'buy-fear');
    const sellEuphoriaSignals = activeSignals.filter(s => s.type === 'sell-euphoria');

    const scatterData = activeSignals.map(s => ({
      x: s.sentimentAtSignal,
      y: s.sviAtSignal,
      z: s.strength,
      name: s.playerName,
      type: s.type,
      fill: SIGNAL_COLORS[s.type],
    }));

    return (
      <div className="space-y-6">
        {/* Signal Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['buy-fear', 'sell-euphoria', 'opportunity-dip', 'caution-rising', 'hold-neutral'] as SignalType[]).map(type => {
            const count = activeSignals.filter(s => s.type === type).length;
            return (
              <div key={type} className={`rounded-xl p-4 text-center border ${SIGNAL_BG[type]}`}>
                <p className="text-xs uppercase tracking-wider mb-1 opacity-70">{SIGNAL_LABELS[type]}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Scatter: Sentiment vs SVI colored by signal */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Signal Map (Sentiment x SVI)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="x" type="number" domain={[-100, 100]} name="Sentiment" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Sentiment', position: 'bottom', fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="y" type="number" domain={[0, 100]} name="SVI" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'SVI', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [value.toFixed(1), name]}
                  labelFormatter={() => ''}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    return (
                      <div style={tooltipStyle} className="p-2">
                        <p className="font-bold text-slate-200">{d.name}</p>
                        <p className="text-slate-400">Sentiment: {d.x.toFixed(1)}</p>
                        <p className="text-slate-400">SVI: {d.y.toFixed(1)}</p>
                        <p style={{ color: d.fill }} className="font-semibold">{SIGNAL_LABELS[d.type as SignalType]}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} opacity={0.8} />
                  ))}
                </Scatter>
                <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signal List */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Active Signals ({activeSignals.length})</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {activeSignals.map(s => (
              <div key={s.id} className={`border rounded-lg p-4 ${SIGNAL_BG[s.type]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{s.playerName}</span>
                    <span className="text-xs opacity-60">{s.sport}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20">
                    {SIGNAL_LABELS[s.type]} &middot; {s.strength}
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-2">{s.triggerReason}</p>
                <div className="flex items-center gap-4 text-xs opacity-60">
                  <span>Confidence: {(s.confidence * 100).toFixed(0)}%</span>
                  <span>Expected: {formatPercent(s.expectedPriceMove)}</span>
                  <span>Horizon: {s.timeHorizon}</span>
                  <span>Price: {formatCurrency(s.priceAtSignal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Tab: Emotion Heat Map ─────────────────────────────────────────────────

  const renderEmotions = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            Emotion Heat Map
          </h2>
          <PlayerSelector />
        </div>

        {/* Selected Player Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">
              {selectedProfile?.playerName} - Emotion Radar
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                  <Radar name="Emotion" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotion Bars */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Emotion Breakdown</h3>
            <div className="space-y-3">
              {selectedProfile && EMOTION_KEYS.map(key => {
                const val = selectedProfile.emotionVector[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 capitalize">{key}</span>
                    <div className="flex-1 bg-slate-900 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${val}%`, backgroundColor: EMOTION_COLORS[key] }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-8 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full Heat Map Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">All Players Emotion Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 pb-2 pr-3 sticky left-0 bg-slate-800/90">Player</th>
                  {EMOTION_KEYS.map(k => (
                    <th key={k} className="text-center text-slate-500 pb-2 px-2 capitalize">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emotionHeatMap.map(row => (
                  <tr key={row.playerId} className="border-t border-slate-800">
                    <td className="text-slate-300 font-medium py-1.5 pr-3 sticky left-0 bg-slate-800/90 whitespace-nowrap">
                      {row.playerName}
                      <span className="text-slate-600 ml-1">({row.sport.slice(0, 3)})</span>
                    </td>
                    {EMOTION_KEYS.map(k => {
                      const val = row.emotions[k];
                      const intensity = val / 100;
                      return (
                        <td key={k} className="text-center py-1.5 px-2">
                          <span
                            className="inline-block w-full rounded px-1 py-0.5 font-mono font-bold"
                            style={{
                              backgroundColor: EMOTION_COLORS[k] + Math.round(intensity * 60 + 15).toString(16).padStart(2, '0'),
                              color: intensity > 0.5 ? '#fff' : EMOTION_COLORS[k],
                            }}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── Tab: Social Momentum ──────────────────────────────────────────────────

  const renderMomentum = () => {
    const momentumBarData = socialMomentum.slice(0, 15).map(m => ({
      name: m.playerName.split(' ').pop(),
      momentum: m.momentum,
      viral: m.viralScore,
      fill: m.momentum >= 0 ? '#22c55e' : '#ef4444',
    }));

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Globe size={18} className="text-blue-400" />
          Social Momentum Index
        </h2>

        {/* Momentum Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Momentum Score (24h Change)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={momentumBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} domain={[-60, 60]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine x={0} stroke="#475569" />
                <Bar dataKey="momentum" name="Momentum" radius={[0, 4, 4, 0]}>
                  {momentumBarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Momentum Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialMomentum.slice(0, 12).map(m => (
            <div key={m.playerId} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-200">{m.playerName}</p>
                  <p className="text-xs text-slate-500">{m.sport} &middot; {m.topPlatform}</p>
                </div>
                <span className={`text-lg font-bold ${m.momentum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.momentum >= 0 ? '+' : ''}{m.momentum}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div>
                  <p className="text-slate-500">Volume 24h</p>
                  <p className="text-slate-300 font-medium">{(m.volume24h / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-slate-500">Vol Change</p>
                  <p className={m.volumeChange >= 0 ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'}>
                    {m.volumeChange >= 0 ? '+' : ''}{m.volumeChange}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Viral</p>
                  <p className="text-purple-300 font-medium">{m.viralScore}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {m.trendingHashtags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>Engagement: {(m.engagementRate * 100).toFixed(1)}%</span>
                <span>&middot;</span>
                <span>Accel: {m.acceleration > 0 ? '+' : ''}{m.acceleration.toFixed(1)}/h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Tab: Regime History ───────────────────────────────────────────────────

  const renderRegime = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Radio size={18} className="text-amber-400" />
            Volatility Regime History
          </h2>
          <PlayerSelector />
        </div>

        {/* Regime Distribution */}
        <div className="grid grid-cols-4 gap-4">
          {(['low', 'normal', 'elevated', 'extreme'] as VolRegime[]).map(regime => {
            const entries = regimeHistory.filter(r => r.regime === regime);
            const totalHours = entries.reduce((s, r) => s + r.duration, 0);
            const pct = regimeHistory.length > 0 ? Math.round((entries.length / regimeHistory.length) * 100) : 0;
            return (
              <div key={regime} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{regime}</p>
                <p className="text-2xl font-bold" style={{ color: REGIME_COLORS[regime] }}>{pct}%</p>
                <p className="text-xs text-slate-500">{totalHours}h total</p>
              </div>
            );
          })}
        </div>

        {/* Regime Timeline Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">SVI with Regime Zones</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regimeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    return (
                      <div style={tooltipStyle} className="p-2">
                        <p className="text-slate-200 font-bold">{d.time}</p>
                        <p className="text-slate-400">SVI: {d.svi.toFixed(1)}</p>
                        <p style={{ color: REGIME_COLORS[d.regime as VolRegime] }} className="font-semibold capitalize">{d.regime}</p>
                        <p className="text-slate-500 text-xs">{d.trigger}</p>
                        <p className="text-slate-500 text-xs">Duration: {d.duration}h</p>
                      </div>
                    );
                  }}
                />
                <Area type="stepAfter" dataKey="svi" stroke="#06b6d4" strokeWidth={2} fillOpacity={0}>
                  {regimeChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Area>
                <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Extreme', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Elevated', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', fill: '#22c55e', fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regime History Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Regime Transitions</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {regimeHistory.slice().reverse().map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: REGIME_COLORS[r.regime] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200 capitalize">{r.regime} Regime</p>
                    <p className="text-xs text-slate-500">{r.trigger}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">{new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-xs text-slate-500">{r.duration}h duration &middot; SVI {r.sviValue.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Main Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Activity size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Sentiment Volatility Index</h1>
            <p className="text-sm text-slate-400">
              Social sentiment surfaces, emotion vectors &amp; contrarian signal engine
            </p>
          </div>
        </div>
        {selectedProfile && (
          <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${REGIME_BG[selectedProfile.regime]}`}>
            {selectedProfile.regime.toUpperCase()} VOL
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'surface' && renderSurface()}
      {activeTab === 'signals' && renderSignals()}
      {activeTab === 'emotions' && renderEmotions()}
      {activeTab === 'momentum' && renderMomentum()}
      {activeTab === 'regime' && renderRegime()}
    </div>
  );
};

export default SentimentVolatilityIndex;
