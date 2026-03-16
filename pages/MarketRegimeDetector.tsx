import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Shield,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  getCurrentRegime,
  getRegimeHistory,
  getTransitionProbabilities,
  getRegimeStrategy,
  getAllRegimeStrategies,
  getRegimeIndicators,
  getVolumeBreadth,
  getRegimeConfidence,
  getRegimeSignals,
  predictNextRegime,
  getOptimalActions,
  getRegimeComparison,
  REGIME_COLORS,
  REGIME_LABELS,
  ALL_REGIMES,
  type MarketRegime,
  type RegimeHistory,
  type TransitionMatrix,
  type RegimeStrategy,
  type RegimeIndicator,
  type VolumeProfile,
  type BreadthIndicator,
  type RegimeConfidence as RegimeConfidenceType,
  type RegimeSignal,
  type RegimePrediction,
  type RegimeComparison,
} from '../lib/marketRegimeService.ts';

type TabId = 'current' | 'history' | 'matrix' | 'strategy' | 'indicators' | 'predictions';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'current', label: 'Current Regime', icon: <Activity size={16} /> },
  { id: 'history', label: 'Regime History', icon: <BarChart3 size={16} /> },
  { id: 'matrix', label: 'Transition Matrix', icon: <Compass size={16} /> },
  { id: 'strategy', label: 'Strategy Guide', icon: <Shield size={16} /> },
  { id: 'indicators', label: 'Indicators', icon: <Target size={16} /> },
  { id: 'predictions', label: 'Predictions', icon: <TrendingUp size={16} /> },
];

const ACTION_COLORS: Record<string, string> = {
  accumulate: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  hold: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  trim: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  sell: 'text-red-400 bg-red-500/20 border-red-500/30',
  hedge: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
};

const RISK_COLORS: Record<string, string> = {
  very_low: 'text-emerald-400',
  low: 'text-green-400',
  moderate: 'text-amber-400',
  high: 'text-orange-400',
  very_high: 'text-red-400',
};

const MarketRegimeDetector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('current');
  const [selectedStrategy, setSelectedStrategy] = useState<MarketRegime>('bull');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [currentRegime, setCurrentRegime] = useState<ReturnType<typeof getCurrentRegime> | null>(null);
  const [history, setHistory] = useState<RegimeHistory[]>([]);
  const [transitions, setTransitions] = useState<TransitionMatrix[]>([]);
  const [confidence, setConfidence] = useState<RegimeConfidenceType | null>(null);
  const [signals, setSignals] = useState<RegimeSignal[]>([]);
  const [predictions, setPredictions] = useState<RegimePrediction[]>([]);
  const [comparisons, setComparisons] = useState<RegimeComparison[]>([]);
  const [volumeProfiles, setVolumeProfiles] = useState<VolumeProfile[]>([]);
  const [breadthIndicators, setBreadthIndicators] = useState<BreadthIndicator[]>([]);
  const [indicators, setIndicators] = useState<RegimeIndicator[]>([]);
  const [strategies, setStrategies] = useState<RegimeStrategy[]>([]);
  const [optimalActions, setOptimalActions] = useState<ReturnType<typeof getOptimalActions>>([]);

  useEffect(() => {
    try {
      setCurrentRegime(getCurrentRegime());
      setHistory(getRegimeHistory());
      setTransitions(getTransitionProbabilities());
      setConfidence(getRegimeConfidence());
      setSignals(getRegimeSignals());
      setPredictions(predictNextRegime());
      setComparisons(getRegimeComparison());
      const vb = getVolumeBreadth();
      setVolumeProfiles(vb.volumeProfiles);
      setBreadthIndicators(vb.breadthIndicators);
      setIndicators(getRegimeIndicators());
      setStrategies(getAllRegimeStrategies());
      setOptimalActions(getOptimalActions());
      setLoading(false);
    } catch {
      setError('Failed to load Market Regime data');
      setLoading(false);
    }
  }, []);

  // Build transition matrix grid data
  const matrixGrid = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};
    ALL_REGIMES.forEach(from => {
      grid[from] = {};
      ALL_REGIMES.forEach(to => { grid[from][to] = 0; });
    });
    transitions.forEach(t => { grid[t.from][t.to] = t.probability; });
    return grid;
  }, [transitions]);

  // Radar chart data for indicators
  const radarData = useMemo(() => {
    return indicators.map(ind => ({
      name: ind.name.length > 16 ? ind.name.slice(0, 14) + '...' : ind.name,
      fullName: ind.name,
      value: ind.value,
      avg: ind.historicalAvg,
    }));
  }, [indicators]);

  // Regime distribution pie data
  const regimeDistribution = useMemo(() => {
    const counts: Record<MarketRegime, number> = {} as Record<MarketRegime, number>;
    ALL_REGIMES.forEach(r => { counts[r] = 0; });
    history.forEach(h => { counts[h.regime]++; });
    return ALL_REGIMES.filter(r => counts[r] > 0).map(r => ({
      name: REGIME_LABELS[r],
      value: counts[r],
      color: REGIME_COLORS[r],
    }));
  }, [history]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Market Regime Detector...</p>
        </div>
      </div>
    );
  }

  if (error || !currentRegime || !confidence) {
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
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Activity size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Market Regime Detector</h1>
            <p className="text-sm text-slate-400">Hidden Markov regime classification, transition probabilities &amp; strategic guidance</p>
          </div>
        </div>
      </div>

      {/* Large Regime Status Indicator */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Regime badge */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center border-2"
              style={{ backgroundColor: currentRegime.color + '20', borderColor: currentRegime.color + '60' }}
            >
              <span className="text-4xl font-black" style={{ color: currentRegime.color }}>
                {currentRegime.label.split(' ')[0][0]}{currentRegime.label.split(' ').length > 1 ? currentRegime.label.split(' ')[1]?.[0] ?? '' : ''}
              </span>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{currentRegime.label}</p>
              <p className="text-xs text-slate-400">{currentRegime.description.slice(0, 80)}...</p>
            </div>
          </div>

          {/* Confidence meter */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-300">Regime Confidence</span>
              <span className="text-2xl font-black" style={{ color: currentRegime.color }}>{confidence.confidence}%</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${confidence.confidence}%`, backgroundColor: currentRegime.color }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-500">Index Value</p>
                <p className="text-lg font-bold text-white">{currentRegime.indexValue.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Monthly Return</p>
                <p className={`text-lg font-bold ${currentRegime.monthlyReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentRegime.monthlyReturn >= 0 ? '+' : ''}{currentRegime.monthlyReturn}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Volatility</p>
                <p className="text-lg font-bold text-amber-400">{currentRegime.volatility}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Model Agreement</p>
                <p className="text-lg font-bold text-cyan-400">{confidence.modelAgreement}%</p>
              </div>
            </div>
          </div>

          {/* Secondary regime */}
          <div className="flex flex-col items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Secondary Signal</p>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: REGIME_COLORS[confidence.secondaryRegime] + '20', borderColor: REGIME_COLORS[confidence.secondaryRegime] + '40' }}
            >
              <span className="text-sm font-bold" style={{ color: REGIME_COLORS[confidence.secondaryRegime] }}>
                {REGIME_LABELS[confidence.secondaryRegime].slice(0, 3).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-bold text-white">{REGIME_LABELS[confidence.secondaryRegime]}</p>
            <p className="text-xs text-slate-400">{confidence.secondaryConfidence}% prob</p>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Signals Aligned</p>
            <p className="text-lg font-bold text-emerald-400">{confidence.signalsAligned}/{confidence.signalsTotal}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Regime Duration</p>
            <p className="text-lg font-bold text-blue-400">{confidence.regimeDuration} mo</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Stability Score</p>
            <p className="text-lg font-bold text-purple-400">{confidence.stabilityScore}/100</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Last Change</p>
            <p className="text-lg font-bold text-slate-300">{confidence.lastRegimeChange}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Optimal Actions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              Optimal Actions for Current Regime
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimalActions.map((oa, idx) => (
                <div key={idx} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${ACTION_COLORS[oa.action]}`}>
                      {oa.action.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      oa.urgency === 'immediate' ? 'bg-red-500/20 text-red-400' :
                      oa.urgency === 'soon' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {oa.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{oa.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regime Comparison Radar + Distribution Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Compass size={18} className="text-purple-400" />
                Indicator Radar
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                    <Radar name="Current" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                    <Radar name="Historical Avg" dataKey="avg" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                Regime Distribution (60 mo)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regimeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#475569' }}
                    >
                      {regimeDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => [`${value} months`, 'Duration']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Regime Comparison Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" />
              Regime Performance Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Regime</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Avg Return</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Volatility</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Sharpe</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Avg Duration</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-medium">Frequency</th>
                    <th className="text-left py-2 px-3 text-slate-400 font-medium">Best Category</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.filter(c => c.frequency > 0).map(c => (
                    <tr key={c.regime} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[c.regime] }} />
                          <span className="font-bold text-white">{REGIME_LABELS[c.regime]}</span>
                        </div>
                      </td>
                      <td className={`py-2 px-3 text-right font-bold ${c.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {c.avgReturn >= 0 ? '+' : ''}{c.avgReturn}%
                      </td>
                      <td className="py-2 px-3 text-right text-amber-400">{c.avgVolatility}%</td>
                      <td className={`py-2 px-3 text-right font-bold ${c.sharpeRatio >= 0.5 ? 'text-emerald-400' : c.sharpeRatio >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                        {c.sharpeRatio}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">{c.avgDuration} mo</td>
                      <td className="py-2 px-3 text-right text-slate-300">{c.frequency}x</td>
                      <td className="py-2 px-3 text-slate-300">{c.bestPerformer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Regime Timeline with color bands */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" />
              60-Month Regime Timeline
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} interval={5} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(label: string) => `Month: ${label}`}
                    formatter={(value: number, name: string) => {
                      if (name === 'Index Value') return [value.toLocaleString(), name];
                      return [`${value}%`, name];
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="indexValue" name="Index Value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} />
                  <Bar yAxisId="right" dataKey="monthlyReturn" name="Monthly Return" radius={[2, 2, 0, 0]}>
                    {history.map((entry, idx) => (
                      <Cell key={idx} fill={entry.monthlyReturn >= 0 ? '#22c55e80' : '#ef444480'} />
                    ))}
                  </Bar>
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regime Color Bands */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Regime Color Bands</h2>
            <div className="flex gap-0.5 h-10 rounded-lg overflow-hidden">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 relative group cursor-pointer"
                  style={{ backgroundColor: REGIME_COLORS[h.regime] }}
                  title={`${h.month}: ${REGIME_LABELS[h.regime]} (${h.confidence}%)`}
                >
                  {h.isTransition && (
                    <div className="absolute inset-0 border-l-2 border-white/60" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {ALL_REGIMES.map(r => (
                <div key={r} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[r] }} />
                  <span className="text-xs text-slate-400">{REGIME_LABELS[r]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volatility Timeline */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-red-400" />
              Volatility Over Time
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} interval={5} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}%`, 'Volatility']}
                  />
                  <Area type="monotone" dataKey="volatility" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'High Vol', fill: '#ef4444', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transition Points */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Compass size={18} className="text-blue-400" />
              Regime Transition Points
            </h2>
            <div className="space-y-2">
              {history.filter(h => h.isTransition).map((h, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <span className="text-sm font-bold text-slate-400 w-20">{h.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[h.transitionFrom!] }} />
                    <span className="text-xs text-slate-400">{REGIME_LABELS[h.transitionFrom!]}</span>
                    <span className="text-slate-600">→</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[h.regime] }} />
                    <span className="text-xs font-bold text-white">{REGIME_LABELS[h.regime]}</span>
                  </div>
                  <span className="text-xs text-slate-500 ml-auto">Confidence: {h.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Transition Probability Matrix Grid */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Compass size={18} className="text-purple-400" />
              Transition Probability Matrix
            </h2>
            <p className="text-xs text-slate-400 mb-4">Probability of transitioning from row regime to column regime. Rows sum to ~100%.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="py-2 px-2 text-left text-slate-500 font-medium">From \ To</th>
                    {ALL_REGIMES.map(r => (
                      <th key={r} className="py-2 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[r] }} />
                          <span className="text-slate-400 font-medium">{REGIME_LABELS[r].slice(0, 5)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_REGIMES.map(from => (
                    <tr key={from} className="border-t border-slate-700/30">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGIME_COLORS[from] }} />
                          <span className="font-bold text-white">{REGIME_LABELS[from].slice(0, 8)}</span>
                        </div>
                      </td>
                      {ALL_REGIMES.map(to => {
                        const prob = matrixGrid[from][to];
                        const intensity = prob > 0 ? Math.min(1, prob * 2) : 0;
                        return (
                          <td key={to} className="py-2 px-2 text-center">
                            {prob > 0 ? (
                              <div
                                className="inline-flex items-center justify-center w-12 h-8 rounded text-xs font-bold"
                                style={{
                                  backgroundColor: from === to
                                    ? `rgba(100, 116, 139, ${intensity * 0.5})`
                                    : `rgba(34, 211, 238, ${intensity * 0.4})`,
                                  color: prob >= 0.25 ? '#fff' : '#94a3b8',
                                }}
                              >
                                {Math.round(prob * 100)}%
                              </div>
                            ) : (
                              <span className="text-slate-700">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Transition Paths */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Most Likely Transition Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transitions
                .filter(t => t.from !== t.to)
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 8)
                .map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 w-6">#{idx + 1}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGIME_COLORS[t.from] }} />
                        <span className="text-xs text-slate-300">{REGIME_LABELS[t.from]}</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGIME_COLORS[t.to] }} />
                        <span className="text-xs font-bold text-white">{REGIME_LABELS[t.to]}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-400">{Math.round(t.probability * 100)}%</p>
                      <p className="text-[10px] text-slate-500">{t.avgTransitionTime} mo avg</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Transition Probability Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">From Current Regime: Transition Probabilities</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transitions
                    .filter(t => t.from === currentRegime.regime && t.to !== currentRegime.regime)
                    .sort((a, b) => b.probability - a.probability)
                    .map(t => ({ name: REGIME_LABELS[t.to], probability: Math.round(t.probability * 100), color: REGIME_COLORS[t.to] }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`${value}%`, 'Probability']}
                  />
                  <Bar dataKey="probability" name="Transition Probability" radius={[4, 4, 0, 0]}>
                    {transitions
                      .filter(t => t.from === currentRegime.regime && t.to !== currentRegime.regime)
                      .sort((a, b) => b.probability - a.probability)
                      .map((t, idx) => (
                        <Cell key={idx} fill={REGIME_COLORS[t.to]} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Strategy selector */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              Regime Strategy Guide
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {ALL_REGIMES.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedStrategy(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    selectedStrategy === r
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-slate-900/50 text-slate-400 border-slate-700/30 hover:text-slate-300'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGIME_COLORS[r] }} />
                  {REGIME_LABELS[r]}
                </button>
              ))}
            </div>

            {(() => {
              const strat = strategies.find(s => s.regime === selectedStrategy);
              if (!strat) return null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center border-2"
                      style={{ backgroundColor: strat.color + '20', borderColor: strat.color + '60' }}
                    >
                      <span className="text-lg font-black" style={{ color: strat.color }}>
                        {strat.label.split(' ')[0][0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{strat.label}</h3>
                      <p className="text-sm text-slate-400">{strat.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Primary Action</p>
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${ACTION_COLORS[strat.primaryAction]}`}>
                        {strat.primaryAction.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Secondary Action</p>
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${ACTION_COLORS[strat.secondaryAction]}`}>
                        {strat.secondaryAction.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Level</p>
                      <span className={`text-sm font-bold ${RISK_COLORS[strat.riskLevel]}`}>
                        {strat.riskLevel.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Expected Return</p>
                      <span className="text-sm font-bold text-cyan-400">{strat.expectedReturn}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Allocation Shift</p>
                    <p className="text-sm text-slate-200">{strat.allocationShift}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-1">
                        <TrendingUp size={12} /> Key Rules
                      </p>
                      <ul className="space-y-1.5">
                        {strat.keyRules.map((rule, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">+</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-slate-900/50 border border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1">
                        <TrendingDown size={12} /> Avoid
                      </p>
                      <ul className="space-y-1.5">
                        {strat.avoidActions.map((action, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">-</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'indicators' && (
        <div className="space-y-6">
          {/* Regime Indicators */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              Regime Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {indicators.map((ind, idx) => (
                <div key={idx} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        ind.signal === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                        ind.signal === 'bearish' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{ind.signal.toUpperCase()}</span>
                      <span className="text-sm font-bold text-white">{ind.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {ind.trend === 'rising' ? <TrendingUp size={12} className="text-emerald-400" /> :
                       ind.trend === 'falling' ? <TrendingDown size={12} className="text-red-400" /> :
                       <Activity size={12} className="text-slate-400" />}
                      <span className="text-lg font-bold text-white">{Math.round(ind.value)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ind.value)}%`,
                        backgroundColor: ind.signal === 'bullish' ? '#22c55e' : ind.signal === 'bearish' ? '#ef4444' : '#6b7280',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">{ind.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-600">Weight: {(ind.weight * 100).toFixed(0)}%</span>
                    <span className="text-[10px] text-slate-600">Hist Avg: {ind.historicalAvg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signals */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-purple-400" />
              Regime Signals
            </h2>
            <div className="space-y-2">
              {signals.map(sig => (
                <div key={sig.id} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                  <div className={`w-2.5 h-2.5 rounded-full ${sig.triggered ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{sig.name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-700 text-slate-400">{sig.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Value: {typeof sig.value === 'number' ? sig.value.toFixed(2) : sig.value} | Threshold: {sig.threshold} ({sig.direction})
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-cyan-400">{sig.strength}%</p>
                    <p className="text-[10px] text-slate-500">{sig.lastTriggered}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume & Breadth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" />
                Volume Profile (12 mo)
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeProfiles}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="buyVolume" name="Buy Volume" stackId="vol" fill="#22c55e80" />
                    <Bar dataKey="sellVolume" name="Sell Volume" stackId="vol" fill="#ef444480" radius={[2, 2, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                Breadth Indicators
              </h2>
              <div className="space-y-3">
                {breadthIndicators.map((bi, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{bi.name}</span>
                        <span className="text-xs font-bold" style={{ color: bi.color }}>{bi.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${bi.percentile}%`, backgroundColor: bi.color }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{bi.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Predictions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              Regime Transition Predictions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((pred, idx) => {
                const strat = strategies.find(s => s.regime === pred.regime);
                return (
                  <div key={idx} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: REGIME_COLORS[pred.regime] + '30' }}>
                          <span className="text-xs font-bold" style={{ color: REGIME_COLORS[pred.regime] }}>
                            {REGIME_LABELS[pred.regime].slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{REGIME_LABELS[pred.regime]}</p>
                          <p className="text-[10px] text-slate-500">{pred.timeframe}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black" style={{ color: REGIME_COLORS[pred.regime] }}>
                          {Math.round(pred.probability * 100)}%
                        </p>
                        <p className="text-[10px] text-slate-500">conf: {pred.confidence}%</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pred.probability * 100}%`, backgroundColor: REGIME_COLORS[pred.regime] }}
                      />
                    </div>
                    <div className="space-y-1">
                      {pred.keyDrivers.map((driver, dIdx) => (
                        <p key={dIdx} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                          <span className="text-slate-600 mt-0.5">*</span>
                          {driver}
                        </p>
                      ))}
                    </div>
                    {strat && (
                      <div className="mt-3 pt-2 border-t border-slate-700/30 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Recommended:</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${ACTION_COLORS[strat.primaryAction]}`}>
                          {strat.primaryAction.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prediction Probability Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Transition Probability Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={predictions.map(p => ({
                    name: REGIME_LABELS[p.regime],
                    probability: Math.round(p.probability * 100),
                    confidence: p.confidence,
                    color: REGIME_COLORS[p.regime],
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Bar dataKey="probability" name="Probability" radius={[0, 4, 4, 0]}>
                    {predictions.map((p, idx) => (
                      <Cell key={idx} fill={REGIME_COLORS[p.regime]} />
                    ))}
                  </Bar>
                  <Bar dataKey="confidence" name="Confidence" radius={[0, 4, 4, 0]} fillOpacity={0.4}>
                    {predictions.map((p, idx) => (
                      <Cell key={idx} fill={REGIME_COLORS[p.regime]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Net Flow Line Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingDown size={18} className="text-amber-400" />
              Net Market Flow (12 mo)
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeProfiles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [value.toLocaleString(), 'Net Flow']}
                  />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Line type="monotone" dataKey="netFlow" name="Net Flow" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketRegimeDetector;
