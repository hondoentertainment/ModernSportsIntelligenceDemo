// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Target, Zap, Calendar, BarChart3, Activity, Shield, Eye, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  getPriceForecasts,
  getTopForecasts,
  getCatalysts,
  getUpcomingCatalysts,
  getModelPerformance,
  getSeasonalPatterns,
  getPlayerForecasts,
  getForecastAccuracy,
  getMarketRegime,
  getSignalColor,
  getSignalLabel,
  getCatalystIcon,
  formatCurrency,
  formatPercent,
  type PriceForecast,
  type PriceCatalyst,
  type ModelPerformance,
  type SeasonalPattern,
  type PlayerForecast,
  type ForecastAccuracy,
  type MarketRegime,
  type TrendSignal,
  type ModelType,
  type ForecastHorizon,
} from '../lib/analytics/predictivePriceEngineService';

const SIGNAL_OPTIONS: TrendSignal[] = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
const SPORT_OPTIONS = ['All', 'Basketball', 'Baseball', 'Football', 'Hockey'];
const HORIZON_OPTIONS: ForecastHorizon[] = ['7d', '30d', '90d', '6m', '1y'];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
};

const PredictivePriceEngine: React.FC = () => {
  const [forecasts, setForecasts] = useState<PriceForecast[]>([]);
  const [catalysts, setCatalysts] = useState<PriceCatalyst[]>([]);
  const [modelPerf, setModelPerf] = useState<ModelPerformance[]>([]);
  const [seasonal, setSeasonal] = useState<SeasonalPattern[]>([]);
  const [playerForecasts, setPlayerForecasts] = useState<PlayerForecast[]>([]);
  const [accuracy, setAccuracy] = useState<ForecastAccuracy[]>([]);
  const [regime, setRegime] = useState<MarketRegime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [signalFilter, setSignalFilter] = useState<TrendSignal | 'all'>('all');
  const [sportFilter, setSportFilter] = useState('All');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>('30d');
  const [selectedModel, setSelectedModel] = useState<ModelType>('composite');

  useEffect(() => {
    try {
      setForecasts(getPriceForecasts());
      setCatalysts(getUpcomingCatalysts());
      setModelPerf(getModelPerformance());
      setSeasonal(getSeasonalPatterns());
      setPlayerForecasts(getPlayerForecasts());
      setAccuracy(getForecastAccuracy('composite'));
      setRegime(getMarketRegime());
      setLoading(false);
    } catch {
      setError('Failed to load Predictive Price Engine data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      setAccuracy(getForecastAccuracy(selectedModel));
    } catch {
      // ignore
    }
  }, [selectedModel]);

  // Filtered forecasts
  const filteredForecasts = useMemo(() => {
    let result = forecasts;
    if (signalFilter !== 'all') {
      result = result.filter(f => f.signal === signalFilter);
    }
    if (sportFilter !== 'All') {
      const sportPlayers: Record<string, string> = {};
      playerForecasts.forEach(pf => { sportPlayers[pf.player] = pf.sport; });
      result = result.filter(f => sportPlayers[f.player] === sportFilter);
    }
    if (confidenceThreshold > 0) {
      result = result.filter(f => {
        const horizonForecast = f.forecasts.find(fc => fc.horizon === selectedHorizon);
        return horizonForecast && horizonForecast.confidence >= confidenceThreshold;
      });
    }
    return result;
  }, [forecasts, signalFilter, sportFilter, confidenceThreshold, selectedHorizon, playerForecasts]);

  // Signal distribution for pie chart
  const signalDistribution = useMemo(() => {
    const counts: Record<TrendSignal, number> = { strong_buy: 0, buy: 0, hold: 0, sell: 0, strong_sell: 0 };
    forecasts.forEach(f => { counts[f.signal]++; });
    return Object.entries(counts).map(([signal, count]) => ({
      name: getSignalLabel(signal as TrendSignal),
      value: count,
      color: getSignalColor(signal as TrendSignal),
    }));
  }, [forecasts]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const strongBuys = forecasts.filter(f => f.signal === 'strong_buy').length;
    const compositeModel = modelPerf.find(m => m.model === 'composite');
    const avgAccuracy = compositeModel ? compositeModel.accuracy30d : 0;
    const profitableRate = compositeModel
      ? Math.round((compositeModel.profitablePredictions / compositeModel.totalPredictions) * 100)
      : 0;
    const totalValue = forecasts.reduce((s, f) => s + f.currentPrice, 0);
    const avgSignalStrength = forecasts.length
      ? Math.round(forecasts.reduce((s, f) => s + f.signalStrength, 0) / forecasts.length)
      : 0;
    return { strongBuys, avgAccuracy, profitableRate, totalValue, avgSignalStrength, totalForecasts: forecasts.length };
  }, [forecasts, modelPerf]);

  // Model performance chart data
  const modelChartData = useMemo(() => {
    return modelPerf.map(m => ({
      model: m.model === 'time_series' ? 'Time Series' : m.model === 'ml_ensemble' ? 'ML Ensemble' : m.model === 'sentiment' ? 'Sentiment' : 'Composite',
      '7d': m.accuracy7d,
      '30d': m.accuracy30d,
      '90d': m.accuracy90d,
      MAPE: m.mape,
      Sharpe: m.sharpeRatio,
    }));
  }, [modelPerf]);

  // Seasonal chart data
  const seasonalChartData = useMemo(() => {
    return seasonal.map(s => ({
      month: s.month.slice(0, 3),
      return: s.avgReturn,
      winRate: s.winRate,
      volume: Math.round(s.volume / 1000),
    }));
  }, [seasonal]);

  // Radar data for model comparison
  const radarData = useMemo(() => {
    return [
      { metric: '7d Acc', ...Object.fromEntries(modelPerf.map(m => [m.model, m.accuracy7d])) },
      { metric: '30d Acc', ...Object.fromEntries(modelPerf.map(m => [m.model, m.accuracy30d])) },
      { metric: '90d Acc', ...Object.fromEntries(modelPerf.map(m => [m.model, m.accuracy90d])) },
      { metric: 'Sharpe', ...Object.fromEntries(modelPerf.map(m => [m.model, m.sharpeRatio * 40])) },
      { metric: 'Win Rate', ...Object.fromEntries(modelPerf.map(m => [m.model, (m.profitablePredictions / m.totalPredictions) * 100])) },
    ];
  }, [modelPerf]);

  const regimeColor = useMemo(() => {
    if (!regime) return 'text-slate-400';
    switch (regime.current) {
      case 'bull': return 'text-emerald-400';
      case 'bear': return 'text-red-400';
      case 'sideways': return 'text-amber-400';
      case 'volatile': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  }, [regime]);

  const regimeBg = useMemo(() => {
    if (!regime) return 'bg-slate-500/10 border-slate-700/50';
    switch (regime.current) {
      case 'bull': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'bear': return 'bg-red-500/10 border-red-500/30';
      case 'sideways': return 'bg-amber-500/10 border-amber-500/30';
      case 'volatile': return 'bg-purple-500/10 border-purple-500/30';
      default: return 'bg-slate-500/10 border-slate-700/50';
    }
  }, [regime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Predictive Price Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Brain size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Brain size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Predictive Price Engine</h1>
          <p className="text-sm text-slate-400">AI-powered multi-model forecasting with catalyst analysis and seasonal intelligence</p>
        </div>
      </div>

      {/* Market Regime Banner */}
      {regime && (
        <div className={`border rounded-xl p-4 ${regimeBg}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className={regimeColor} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Market Regime</p>
                <p className={`text-lg font-bold capitalize ${regimeColor}`}>{regime.current}</p>
              </div>
              <div className="ml-4">
                <p className="text-xs text-slate-500">Strength</p>
                <p className="text-sm font-bold text-white">{regime.strength}%</p>
              </div>
              <div className="ml-4">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-sm font-bold text-white">{regime.duration}</p>
              </div>
              <div className="ml-4 hidden md:block">
                <p className="text-xs text-slate-500">Avg Duration</p>
                <p className="text-sm font-bold text-white">{regime.historicalAvgDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Bull</p>
                <p className="text-sm font-bold text-emerald-400">{regime.transitionProbability.bull}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Bear</p>
                <p className="text-sm font-bold text-red-400">{regime.transitionProbability.bear}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase">Sideways</p>
                <p className="text-sm font-bold text-amber-400">{regime.transitionProbability.sideways}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Forecasts</p>
          <p className="text-2xl font-bold text-purple-400">{summaryStats.totalForecasts}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Strong Buys</p>
          <p className="text-2xl font-bold text-emerald-400">{summaryStats.strongBuys}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">30d Accuracy</p>
          <p className="text-2xl font-bold text-blue-400">{summaryStats.avgAccuracy}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Profitable</p>
          <p className="text-2xl font-bold text-cyan-400">{summaryStats.profitableRate}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Signal</p>
          <p className="text-2xl font-bold text-amber-400">{summaryStats.avgSignalStrength}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(summaryStats.totalValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={signalFilter}
            onChange={e => setSignalFilter(e.target.value as TrendSignal | 'all')}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Signals</option>
            {SIGNAL_OPTIONS.map(s => (
              <option key={s} value={s}>{getSignalLabel(s)}</option>
            ))}
          </select>
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {SPORT_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={selectedHorizon}
            onChange={e => setSelectedHorizon(e.target.value as ForecastHorizon)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            {HORIZON_OPTIONS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Min Confidence:</span>
            <input
              type="range"
              min={0}
              max={90}
              step={10}
              value={confidenceThreshold}
              onChange={e => setConfidenceThreshold(Number(e.target.value))}
              className="w-24 accent-purple-500"
            />
            <span className="text-xs text-white font-mono">{confidenceThreshold}%</span>
          </div>
        </div>
      </div>

      {/* Price Forecasts Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-purple-400" />
          Price Forecasts ({filteredForecasts.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Card</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Current</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">{selectedHorizon} Pred</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Change</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Range</th>
                <th className="text-center py-2 px-3 text-slate-500 font-medium">Confidence</th>
                <th className="text-center py-2 px-3 text-slate-500 font-medium">Signal</th>
                <th className="text-center py-2 px-3 text-slate-500 font-medium">Strength</th>
              </tr>
            </thead>
            <tbody>
              {filteredForecasts.map(f => {
                const horizonData = f.forecasts.find(fc => fc.horizon === selectedHorizon);
                if (!horizonData) return null;
                return (
                  <tr key={f.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="text-white font-medium truncate max-w-[280px]">{f.player}</p>
                      <p className="text-[10px] text-slate-500">{f.year} {f.set} {f.grade}</p>
                    </td>
                    <td className="text-right py-2.5 px-3 text-white font-mono">{formatCurrency(f.currentPrice)}</td>
                    <td className="text-right py-2.5 px-3 text-white font-mono font-bold">{formatCurrency(horizonData.predicted)}</td>
                    <td className={`text-right py-2.5 px-3 font-bold font-mono ${horizonData.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(horizonData.changePercent)}
                    </td>
                    <td className="text-right py-2.5 px-3 text-slate-400 text-xs font-mono">
                      {formatCurrency(horizonData.low)} - {formatCurrency(horizonData.high)}
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 bg-slate-700/30 rounded-full h-1.5">
                          <div
                            className={`rounded-full h-1.5 ${horizonData.confidence >= 80 ? 'bg-emerald-500' : horizonData.confidence >= 60 ? 'bg-blue-500' : horizonData.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${horizonData.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{horizonData.confidence}%</span>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: getSignalColor(f.signal) + '20', color: getSignalColor(f.signal) }}
                      >
                        {getSignalLabel(f.signal)}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="text-sm font-bold text-white">{f.signalStrength}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Distribution + Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Distribution Pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-cyan-400" />
            Signal Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={signalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {signalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Performance Comparison Bar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" />
            Model Accuracy Comparison
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="model" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="7d" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="30d" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="90d" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catalyst Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          Catalyst Timeline
        </h2>
        <div className="space-y-3">
          {catalysts.slice(0, 10).map(c => (
            <div key={c.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 flex items-start gap-4 hover:border-slate-600/50 transition-colors">
              <div className="text-2xl flex-shrink-0">{getCatalystIcon(c.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-white">{c.title}</p>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${c.impact >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {c.impact >= 0 ? '+' : ''}{c.impact}% impact
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{c.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {c.expectedDate}
                  </span>
                  <span>Probability: {c.probability}%</span>
                  <span>Players: {c.affectedPlayers.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Patterns + Forecast Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasonal Patterns Bar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            Seasonal Return Patterns
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="return" name="Avg Return %" radius={[2, 2, 0, 0]}>
                  {seasonalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Accuracy Line Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-cyan-400" />
            Forecast Accuracy
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value as ModelType)}
              className="ml-auto bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="composite">Composite</option>
              <option value="ml_ensemble">ML Ensemble</option>
              <option value="time_series">Time Series</option>
              <option value="sentiment">Sentiment</option>
            </select>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="predicted" stroke="#a78bfa" strokeWidth={2} dot={false} name="Predicted" />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Radar + Player Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Radar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Brain size={18} className="text-purple-400" />
            Model Comparison Radar
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} domain={[0, 100]} />
                <Radar name="Composite" dataKey="composite" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
                <Radar name="ML Ensemble" dataKey="ml_ensemble" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="Time Series" dataKey="time_series" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Radar name="Sentiment" dataKey="sentiment" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Player Forecasts */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Player Forecasts
          </h2>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {playerForecasts.map(pf => (
              <div key={pf.player} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{pf.player}</p>
                    <span className="text-[10px] text-slate-500">{pf.sport}</span>
                  </div>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: getSignalColor(pf.currentTrend) + '20', color: getSignalColor(pf.currentTrend) }}
                  >
                    {getSignalLabel(pf.currentTrend)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs mb-1">
                  <span className={`font-bold ${pf.priceChangeYTD >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    YTD: {formatPercent(pf.priceChangeYTD)}
                  </span>
                  <span className="text-slate-500">Catalysts: {pf.upcomingCatalysts}</span>
                  <span className={`${pf.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Impact: {formatPercent(pf.portfolioImpact)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{pf.forecastSummary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Detail Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-green-400" />
          Seasonal Intelligence
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Month</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Avg Return</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Win Rate</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Volume</th>
                <th className="text-center py-2 px-3 text-slate-500 font-medium">Best Sport</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {seasonal.map(s => (
                <tr key={s.month} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{s.month}</td>
                  <td className={`text-right py-2 px-3 font-bold ${s.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(s.avgReturn)}
                  </td>
                  <td className="text-right py-2 px-3 text-white">{s.winRate}%</td>
                  <td className="text-right py-2 px-3 text-slate-400">{s.volume.toLocaleString()}</td>
                  <td className="text-center py-2 px-3 text-slate-300">{s.bestSport}</td>
                  <td className="py-2 px-3 text-slate-400 text-xs max-w-[300px] truncate">{s.pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictivePriceEngine;
