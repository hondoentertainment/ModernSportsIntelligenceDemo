import React, { useState, useMemo } from 'react';
import {
  Hourglass,
  TrendingDown,
  TrendingUp,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowDown,
  ArrowRight,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getDecayModels,
  getMilestoneImpacts,
  getDecayCurvePoints,
  getDecayForecasts,
  getDecaySummary,
  type DecayModel,
  type MilestoneImpact,
  type DecayForecast,
} from '../lib/timeDecayService';

type TabId = 'models' | 'milestones' | 'curves' | 'forecasts';

const TABS: { id: TabId; label: string }[] = [
  { id: 'models', label: 'Models' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'curves', label: 'Curves' },
  { id: 'forecasts', label: 'Forecasts' },
];

const DECAY_TYPE_COLORS: Record<string, string> = {
  exponential: 'bg-red-500/20 text-red-400 border-red-500/30',
  linear: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  stepped: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  logarithmic: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
};

const SCENARIO_COLORS: Record<string, string> = {
  accelerating: 'bg-red-500/20 text-red-400 border-red-500/30',
  stable: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  decelerating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bottoming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const RELEVANCE_COLORS: Record<string, string> = {
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const CURVE_COLORS: Record<string, string> = {
  exponential: '#ef4444',
  linear: '#3b82f6',
  stepped: '#f59e0b',
  logarithmic: '#8b5cf6',
};

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

const TimeDecayModeler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('models');

  const models = useMemo(() => getDecayModels(), []);
  const milestones = useMemo(() => getMilestoneImpacts(), []);
  const curvePoints = useMemo(() => getDecayCurvePoints(), []);
  const forecasts = useMemo(() => getDecayForecasts(), []);
  const summary = useMemo(() => getDecaySummary(), []);

  // Transform curve points for LineChart (pivot by month)
  const curveChartData = useMemo(() => {
    const months = new Set(curvePoints.map(p => p.monthsFromPeak));
    return Array.from(months).sort((a, b) => a - b).map(month => {
      const row: Record<string, number> = { month };
      curvePoints.filter(p => p.monthsFromPeak === month).forEach(p => {
        row[p.category] = p.percentOfPeak;
      });
      return row;
    });
  }, [curvePoints]);

  // Milestone chart data
  const milestoneChartData = useMemo(() => {
    return milestones.map(m => ({
      name: m.milestone,
      premium: m.avgPremiumAtMilestone,
      decay: m.avgDecayAfter,
      duration: m.typicalDuration,
    }));
  }, [milestones]);

  // Forecast comparison chart data
  const forecastChartData = useMemo(() => {
    return forecasts.map(f => ({
      name: f.cardName.split(' ').slice(1, 3).join(' '),
      current: f.currentValue,
      '6mo': f.forecast6m,
      '1yr': f.forecast1y,
      '2yr': f.forecast2y,
    }));
  }, [forecasts]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Hourglass size={22} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Time Decay Modeler</h1>
              <p className="text-gray-400 text-sm">
                How card values decay from peak moments -- model, forecast, and plan for value erosion
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Decay Rate</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{summary.avgDecayRate}%</p>
            <p className="text-gray-500 text-xs mt-1">per year across all models</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-amber-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Fastest Decay</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{summary.fastestDecay.rate}%</p>
            <p className="text-gray-500 text-xs mt-1 truncate">{summary.fastestDecay.card.split(' ').slice(1, 3).join(' ')}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Slowest Decay</span>
            </div>
            <p className="text-emerald-400 font-bold text-3xl">{summary.slowestDecay.rate}%</p>
            <p className="text-gray-500 text-xs mt-1 truncate">{summary.slowestDecay.card.split(' ').slice(1, 3).join(' ')}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-violet-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Cards Near Floor</span>
            </div>
            <p className="text-violet-400 font-bold text-3xl">{summary.cardsNearFloor}</p>
            <p className="text-gray-500 text-xs mt-1">within 15% of floor value</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 rounded-xl border border-gray-800 p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'models' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Activity size={16} className="text-violet-400" />
                  Decay Models
                </h3>
                <p className="text-gray-500 text-xs mt-1">Cards modeled for value decay from peak events</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Card</th>
                      <th className="text-left px-3 py-3">Category</th>
                      <th className="text-right px-3 py-3">Peak</th>
                      <th className="text-right px-3 py-3">Current</th>
                      <th className="text-right px-3 py-3">Decay %/yr</th>
                      <th className="text-center px-3 py-3">Half-Life</th>
                      <th className="text-center px-3 py-3">Type</th>
                      <th className="text-right px-3 py-3">Floor</th>
                      <th className="text-right px-5 py-3">Yrs to Floor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map(model => {
                      const dropPct = Math.round(((model.peakValue - model.currentValue) / model.peakValue) * 100);
                      return (
                        <tr key={model.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-white font-medium text-xs">{model.cardName}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-gray-400 text-xs">{model.category}</span>
                          </td>
                          <td className="px-3 py-3 text-right text-white font-medium">{formatCurrency(model.peakValue)}</td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-red-400 font-medium">{formatCurrency(model.currentValue)}</span>
                            <span className="text-gray-600 text-xs ml-1">(-{dropPct}%)</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={`font-bold ${model.decayRate > 35 ? 'text-red-400' : model.decayRate > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {model.decayRate}%
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock size={12} className="text-gray-500" />
                              <span className="text-gray-300">{model.halfLife}d</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${DECAY_TYPE_COLORS[model.decayType]}`}>
                              {model.decayType}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right text-gray-400">{formatCurrency(model.floorValue)}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`font-medium ${model.yearsToFloor < 1 ? 'text-red-400' : model.yearsToFloor < 2 ? 'text-amber-400' : 'text-gray-300'}`}>
                              {model.yearsToFloor}y
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            {/* Milestone Premium BarChart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-400" />
                Milestone Premium vs Post-Decay
              </h3>
              <p className="text-gray-500 text-xs mb-4">Average premium at milestone event vs annual decay rate afterward</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milestoneChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="premium" name="Avg Premium %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="decay" name="Post-Decay %/yr" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Milestone Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map(milestone => (
                <div key={milestone.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{milestone.milestone}</h4>
                      <p className="text-gray-500 text-xs">{milestone.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${RELEVANCE_COLORS[milestone.currentRelevance]}`}>
                      {milestone.currentRelevance}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-emerald-400 font-bold text-lg">+{milestone.avgPremiumAtMilestone}%</p>
                      <p className="text-gray-500 text-[10px]">Premium</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-red-400 font-bold text-lg">-{milestone.avgDecayAfter}%</p>
                      <p className="text-gray-500 text-[10px]">Decay/yr</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <p className="text-blue-400 font-bold text-lg">{milestone.typicalDuration}mo</p>
                      <p className="text-gray-500 text-[10px]">Duration</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {milestone.examples.map((ex, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'curves' && (
          <div className="space-y-6">
            {/* Decay Curves LineChart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <TrendingDown size={16} className="text-violet-400" />
                Decay Curves by Type
              </h3>
              <p className="text-gray-500 text-xs mb-4">Percentage of peak value remaining over 24 months by decay model type</p>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      label={{ value: 'Months from Peak', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      label={{ value: '% of Peak Value', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="exponential" stroke={CURVE_COLORS.exponential} strokeWidth={2} dot={false} name="Exponential" />
                    <Line type="monotone" dataKey="linear" stroke={CURVE_COLORS.linear} strokeWidth={2} dot={false} name="Linear" />
                    <Line type="stepAfter" dataKey="stepped" stroke={CURVE_COLORS.stepped} strokeWidth={2} dot={false} name="Stepped" />
                    <Line type="monotone" dataKey="logarithmic" stroke={CURVE_COLORS.logarithmic} strokeWidth={2} dot={false} name="Logarithmic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Curve Type Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { type: 'exponential', label: 'Exponential', desc: 'Rapid initial drop that gradually slows. Common for rookie hype cards where excitement fades quickly.', icon: <ArrowDown size={16} />, endVal: '15%' },
                { type: 'linear', label: 'Linear', desc: 'Steady constant-rate decline. Typical for cards with gradually waning relevance like record holders.', icon: <ArrowRight size={16} />, endVal: '23%' },
                { type: 'stepped', label: 'Stepped', desc: 'Holds at plateaus then drops in stages. Championship cards often step down at season boundaries.', icon: <BarChart3 size={16} />, endVal: '28%' },
                { type: 'logarithmic', label: 'Logarithmic', desc: 'Sharp initial drop that flattens significantly. MVP and legacy cards find support levels quickly.', icon: <Target size={16} />, endVal: '35%' },
              ].map(curve => (
                <div key={curve.type} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CURVE_COLORS[curve.type] }} />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${DECAY_TYPE_COLORS[curve.type]}`}>
                      {curve.label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">{curve.desc}</p>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-white font-bold">{curve.endVal}</p>
                    <p className="text-gray-500 text-[10px]">at 24 months</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forecasts' && (
          <div className="space-y-6">
            {/* Forecast Comparison BarChart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-violet-400" />
                Value Forecast Comparison
              </h3>
              <p className="text-gray-500 text-xs mb-4">Current value vs projected values at 6 months, 1 year, and 2 years</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      formatter={(value: number) => [formatCurrency(value)]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="current" name="Current" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="6mo" name="6 Month" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="1yr" name="1 Year" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="2yr" name="2 Year" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forecasts.map(forecast => {
                const totalDecay = Math.round(((forecast.currentValue - forecast.forecast2y) / forecast.currentValue) * 100);
                return (
                  <div key={forecast.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">{forecast.cardName}</h4>
                        <p className="text-gray-500 text-xs">Confidence: {forecast.confidence}%</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ml-2 whitespace-nowrap ${SCENARIO_COLORS[forecast.decayScenario]}`}>
                        {forecast.decayScenario}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-white font-bold text-sm">{formatCurrency(forecast.currentValue)}</p>
                        <p className="text-gray-500 text-[10px]">Now</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-blue-400 font-bold text-sm">{formatCurrency(forecast.forecast3m)}</p>
                        <p className="text-gray-500 text-[10px]">3mo</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-amber-400 font-bold text-sm">{formatCurrency(forecast.forecast6m)}</p>
                        <p className="text-gray-500 text-[10px]">6mo</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-orange-400 font-bold text-sm">{formatCurrency(forecast.forecast1y)}</p>
                        <p className="text-gray-500 text-[10px]">1yr</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-red-400 font-bold text-sm">{formatCurrency(forecast.forecast2y)}</p>
                        <p className="text-gray-500 text-[10px]">2yr</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                      <span className="text-gray-500 text-xs">Projected 2yr decline</span>
                      <span className="text-red-400 font-bold text-sm">-{totalDecay}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeDecayModeler;
