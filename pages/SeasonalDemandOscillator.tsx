import React, { useState } from 'react';
import {
  Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  Waves, Target, Zap, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import {
  getSeasonalPatterns, getDemandPhases, getSeasonalForecasts,
  getSeasonalAnomalies, getSeasonalSummary
} from '../lib/seasonalDemandService.ts';

const TABS = [
  { id: 'oscillation', label: 'Oscillation', icon: <Waves className="w-4 h-4" /> },
  { id: 'phases', label: 'Phases', icon: <Zap className="w-4 h-4" /> },
  { id: 'forecasts', label: 'Forecasts', icon: <Target className="w-4 h-4" /> },
  { id: 'anomalies', label: 'Anomalies', icon: <AlertTriangle className="w-4 h-4" /> },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  approaching: 'bg-blue-500/20 text-blue-400',
  passed: 'bg-gray-500/20 text-gray-400',
};

const REC_STYLES: Record<string, string> = {
  accumulate: 'bg-emerald-500/20 text-emerald-400',
  hold: 'bg-blue-500/20 text-blue-400',
  distribute: 'bg-red-500/20 text-red-400',
};

export default function SeasonalDemandOscillator() {
  const [activeTab, setActiveTab] = useState<string>('oscillation');

  const patterns = getSeasonalPatterns();
  const phases = getDemandPhases();
  const forecasts = getSeasonalForecasts();
  const anomalies = getSeasonalAnomalies();
  const summary = getSeasonalSummary();

  const stats = [
    { label: 'Avg Demand Index', value: summary.avgDemandIndex, icon: <Activity className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Active Phases', value: summary.activePhasesCount, icon: <Zap className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Anomalies Detected', value: summary.anomalyCount, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Forecast Confidence', value: `${Math.round(summary.topForecastConfidence * 100)}%`, icon: <Target className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const oscillationData = patterns.map(p => ({
    month: p.month.substring(0, 3),
    demandIndex: p.demandIndex,
    historicalAvg: p.historicalAvg,
    priceChange: p.avgPriceChange,
  }));

  const phaseChartData = phases.map(p => ({
    name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
    intensity: p.intensity,
    expectedReturn: p.expectedReturn,
    fullName: p.name,
  }));

  const forecastChartData = forecasts.map(f => ({
    segment: f.segment.length > 14 ? f.segment.substring(0, 14) + '...' : f.segment,
    current: f.currentDemand,
    forecast: f.forecastDemand,
    fullSegment: f.segment,
  }));

  const anomalyChartData = anomalies.map(a => ({
    name: a.segment.length > 14 ? a.segment.substring(0, 14) + '...' : a.segment,
    deviation: a.deviation,
    expected: a.expectedDemand,
    actual: a.actualDemand,
    fullSegment: a.segment,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <Activity className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Seasonal Demand Oscillator</h1>
            <p className="text-sm text-gray-400">Cyclical demand patterns, phase transitions, and seasonal forecasts</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}><span className={stat.color}>{stat.icon}</span></div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab: Oscillation */}
        {activeTab === 'oscillation' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">12-Month Demand Oscillation</h3>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={oscillationData}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis domain={[30, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="demandIndex" name="Demand Index" stroke="#8b5cf6" strokeWidth={2} fill="url(#demandGrad)" />
                  <Line type="monotone" dataKey="historicalAvg" name="Historical Avg" stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map(p => (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white text-sm">{p.month}</h4>
                    <span className={`text-xs font-mono font-bold ${p.avgPriceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {p.avgPriceChange >= 0 ? '+' : ''}{p.avgPriceChange}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Demand Index</div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${p.demandIndex >= 70 ? 'bg-emerald-500' : p.demandIndex >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${p.demandIndex}%` }} />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{p.demandIndex}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">Top: <span className="text-gray-300">{p.topCategory}</span> | Vol: <span className="text-gray-300">{p.volumeMultiplier}x</span></div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.peakDrivers.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Phases */}
        {activeTab === 'phases' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Phase Intensity & Expected Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={phaseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar yAxisId="left" dataKey="intensity" name="Intensity (1-10)" radius={[4, 4, 0, 0]}>
                    {phaseChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.intensity >= 8 ? '#10b981' : entry.intensity >= 5 ? '#3b82f6' : '#6b7280'} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="expectedReturn" name="Expected Return %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {phases.map(phase => (
                <div key={phase.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${phase.status === 'active' ? 'text-emerald-400' : phase.status === 'approaching' ? 'text-blue-400' : 'text-gray-500'}`} />
                      <h4 className="font-semibold text-white">{phase.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[phase.status]}`}>{phase.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">{phase.description}</p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Window</div>
                      <div className="text-xs text-gray-200 font-medium">{phase.startMonth} - {phase.endMonth}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Intensity</div>
                      <div className="text-xs text-gray-200 font-medium">{phase.intensity}/10</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">Exp. Return</div>
                      <div className={`text-xs font-medium ${phase.expectedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {phase.expectedReturn >= 0 ? '+' : ''}{phase.expectedReturn}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {phase.affectedSegments.map((seg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-medium">{seg}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Forecasts */}
        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Current vs. Forecast Demand by Segment</h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="segment" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis domain={[30, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="current" name="Current Demand" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  <Line type="monotone" dataKey="forecast" name="Forecast Demand" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4 }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forecasts.map(f => {
                const delta = f.forecastDemand - f.currentDemand;
                const isUp = delta >= 0;
                return (
                  <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white text-sm">{f.segment}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${REC_STYLES[f.recommendation]}`}>{f.recommendation}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Current</div>
                        <div className="text-sm font-bold text-white">{f.currentDemand}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Forecast</div>
                        <div className={`text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{f.forecastDemand}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Delta</div>
                        <div className="flex items-center gap-1">
                          {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                          <span className={`text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{isUp ? '+' : ''}{delta}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                        <div className="text-sm font-bold text-cyan-400">{Math.round(f.confidence * 100)}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                      <span>Peak: <span className="text-gray-300">{f.peakMonth}</span></span>
                      <span>Trough: <span className="text-gray-300">{f.troughMonth}</span></span>
                      <span>Cycle: <span className="text-gray-300">{f.cycleLengthMonths}mo</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Anomalies */}
        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Demand Deviations by Segment</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={anomalyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="#374151" />
                  <Bar dataKey="deviation" name="Deviation %" radius={[4, 4, 0, 0]}>
                    {anomalyChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.deviation >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Anomaly Log</h3></div>
              <div className="divide-y divide-gray-800/50">
                {anomalies.map(a => (
                  <div key={a.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {a.resolved
                          ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                        <div>
                          <span className="text-sm font-medium text-white">{a.segment}</span>
                          <span className="text-xs text-gray-500 ml-2">{a.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500">Expected / Actual</div>
                          <div className="text-xs font-mono">
                            <span className="text-gray-400">{a.expectedDemand}</span>
                            <span className="text-gray-600 mx-1">/</span>
                            <span className="text-white">{a.actualDemand}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.deviation >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {a.deviation >= 0 ? '+' : ''}{a.deviation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 ml-6 leading-relaxed">{a.cause}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
