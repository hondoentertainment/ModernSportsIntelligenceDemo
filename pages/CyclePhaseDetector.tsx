import React, { useState } from 'react';
import {
  RefreshCcw, TrendingUp, TrendingDown, BarChart3, Activity,
  Layers, Compass, ArrowRightCircle, Target, Zap, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  getMarketCycles, getPhaseIndicators, getPhaseTransitions,
  getCycleComposites, getCycleSummary,
} from '../lib/cyclePhaseService.ts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
  { id: 'indicators', label: 'Indicators', icon: <Activity className="w-4 h-4" /> },
  { id: 'transitions', label: 'Transitions', icon: <ArrowRightCircle className="w-4 h-4" /> },
  { id: 'composites', label: 'Composites', icon: <BarChart3 className="w-4 h-4" /> },
] as const;

const PHASE_COLORS: Record<string, string> = {
  accumulation: '#8b5cf6',
  markup: '#10b981',
  distribution: '#f59e0b',
  markdown: '#ef4444',
};

const PHASE_BADGES: Record<string, string> = {
  accumulation: 'bg-violet-500/20 text-violet-400',
  markup: 'bg-emerald-500/20 text-emerald-400',
  distribution: 'bg-amber-500/20 text-amber-400',
  markdown: 'bg-red-500/20 text-red-400',
};

const SIGNAL_STYLES: Record<string, string> = {
  bullish: 'bg-emerald-500/20 text-emerald-400',
  bearish: 'bg-red-500/20 text-red-400',
  neutral: 'bg-blue-500/20 text-blue-400',
};

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function CyclePhaseDetector() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const cycles = getMarketCycles();
  const indicators = getPhaseIndicators();
  const transitions = getPhaseTransitions();
  const composites = getCycleComposites();
  const summary = getCycleSummary();

  const stats = [
    { label: 'Segments in Markup', value: summary.segmentsInMarkup, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Segments in Markdown', value: summary.segmentsInMarkdown, icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Avg Confidence', value: `${summary.avgConfidence}%`, icon: <Target className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Next Transition', value: summary.nearestTransition, icon: <Clock className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  // Pie chart data: count segments by phase
  const phaseCounts = ['accumulation', 'markup', 'distribution', 'markdown'].map(phase => ({
    name: phase.charAt(0).toUpperCase() + phase.slice(1),
    value: cycles.filter(c => c.currentPhase === phase).length,
  }));

  // Radar chart data for indicators
  const radarData = indicators.map(ind => ({
    name: ind.name.length > 16 ? ind.name.substring(0, 16) + '...' : ind.name,
    value: ind.value,
    threshold: ind.threshold,
  }));

  // Transition chart data
  const transitionChart = transitions.map(t => ({
    name: t.segment.substring(0, 12),
    priceChange: t.priceChangeAtTransition,
    volumeChange: t.volumeChangeAtTransition,
  }));

  // Composite chart data
  const compositeChart = composites.map(c => ({
    name: c.phase,
    avgReturn: c.avgReturn,
    avgDuration: c.avgDuration,
    avgVolume: c.avgVolume,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <RefreshCcw className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cycle Phase Detector</h1>
            <p className="text-sm text-gray-400">Identify market cycle phases across sports card segments and predict transitions</p>
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

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Segments by Phase</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={phaseCounts} cx="50%" cy="50%" outerRadius={110} innerRadius={60}
                      dataKey="value" nameKey="name" paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                      {phaseCounts.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cycle Length vs Confidence</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cycles.map(c => ({
                    name: c.segment.substring(0, 12),
                    cycleLength: c.avgCycleLengthDays,
                    confidence: c.confidence,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="cycleLength" name="Avg Cycle (days)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confidence" name="Confidence %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cycles.map(cycle => (
                <div key={cycle.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{cycle.segment}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PHASE_BADGES[cycle.currentPhase]}`}>
                      {cycle.currentPhase}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Phase Progress</span>
                      <span className="font-mono">{cycle.phaseProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${cycle.phaseProgress}%`,
                          backgroundColor: PHASE_COLORS[cycle.currentPhase],
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <div className="font-mono text-gray-300">{cycle.phaseDuration}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence</span>
                      <div className="font-mono text-violet-400">{cycle.confidence}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Phase</span>
                      <div className="font-mono text-blue-400 capitalize">{cycle.nextPhase}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Transition</span>
                      <div className="font-mono text-amber-400">{cycle.estimatedTransition}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Indicators */}
        {activeTab === 'indicators' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Indicator Radar: Value vs Threshold</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Value" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Threshold" dataKey="threshold" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Phase Indicators</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Indicator</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Category</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Value</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Threshold</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Weight</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Signal</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Description</th>
                  </tr></thead>
                  <tbody>
                    {indicators.map(ind => (
                      <tr key={ind.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 font-medium text-white text-xs">{ind.name}</td>
                        <td className="p-3 text-gray-400 text-xs">{ind.category}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${ind.value >= ind.threshold ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${ind.value}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs">{ind.value}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-400 text-xs">{ind.threshold}</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{ind.weight}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SIGNAL_STYLES[ind.signal]}`}>
                            {ind.signal}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs max-w-[200px] truncate">{ind.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicators.slice(0, 6).map((ind, i) => (
                <div key={ind.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{ind.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SIGNAL_STYLES[ind.signal]}`}>
                      {ind.signal}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{ind.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Value</span><div className="font-mono text-violet-400">{ind.value}</div></div>
                    <div><span className="text-gray-500">Threshold</span><div className="font-mono text-amber-400">{ind.threshold}</div></div>
                    <div><span className="text-gray-500">Weight</span><div className="font-mono text-blue-400">{ind.weight}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Transitions */}
        {activeTab === 'transitions' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Transition Price & Volume Changes</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transitionChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="priceChange" name="Price Change %" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {transitionChart.map((entry, i) => (
                      <Cell key={i} fill={entry.priceChange >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Bar dataKey="volumeChange" name="Volume Change %" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {transitionChart.map((entry, i) => (
                      <Cell key={i} fill={entry.volumeChange >= 0 ? '#06b6d4' : '#f59e0b'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline view */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Phase Transition Timeline</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-700" />
                <div className="space-y-4">
                  {transitions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                    <div key={t.id} className="relative flex items-start gap-4 pl-12">
                      <div className="absolute left-4 top-2 w-4 h-4 rounded-full border-2 border-gray-700 bg-gray-900 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          t.priceChangeAtTransition >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{t.segment}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PHASE_BADGES[t.fromPhase]}`}>
                              {t.fromPhase}
                            </span>
                            <ArrowRightCircle className="w-3 h-3 text-gray-500" />
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PHASE_BADGES[t.toPhase]}`}>
                              {t.toPhase}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">{t.date}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs mt-2">
                          <span className={`font-mono ${t.priceChangeAtTransition >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            Price: {t.priceChangeAtTransition > 0 ? '+' : ''}{t.priceChangeAtTransition}%
                          </span>
                          <span className={`font-mono ${t.volumeChangeAtTransition >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                            Volume: {t.volumeChangeAtTransition > 0 ? '+' : ''}{t.volumeChangeAtTransition}%
                          </span>
                          <span className="font-mono text-violet-400">Accuracy: {t.accuracy}%</span>
                          <span className="text-gray-500">Triggers: {t.triggerIndicators.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">All Transitions</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Segment</th>
                    <th className="text-left p-3 text-gray-500 font-medium">From</th>
                    <th className="text-left p-3 text-gray-500 font-medium">To</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Price Chg</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Vol Chg</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Accuracy</th>
                  </tr></thead>
                  <tbody>
                    {transitions.map(t => (
                      <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs font-medium">{t.segment}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PHASE_BADGES[t.fromPhase]}`}>{t.fromPhase}</span></td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PHASE_BADGES[t.toPhase]}`}>{t.toPhase}</span></td>
                        <td className="p-3 text-gray-400 font-mono text-xs">{t.date}</td>
                        <td className={`p-3 text-right font-mono text-xs ${t.priceChangeAtTransition >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.priceChangeAtTransition > 0 ? '+' : ''}{t.priceChangeAtTransition}%
                        </td>
                        <td className={`p-3 text-right font-mono text-xs ${t.volumeChangeAtTransition >= 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                          {t.volumeChangeAtTransition > 0 ? '+' : ''}{t.volumeChangeAtTransition}%
                        </td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{t.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Composites */}
        {activeTab === 'composites' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Average Return by Phase</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compositeChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="avgReturn" name="Avg Return %" radius={[4, 4, 0, 0]}>
                      {compositeChart.map((entry, i) => (
                        <Cell key={i} fill={entry.avgReturn >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Phase Duration & Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compositeChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="avgDuration" name="Avg Duration (days)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgVolume" name="Avg Volume Index" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {composites.map(comp => (
                <div key={comp.phase} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">{comp.phase}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PHASE_BADGES[comp.phase.toLowerCase()]}`}>
                      {comp.frequency}x observed
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 text-xs">Avg Duration</span>
                      <div className="font-mono text-lg text-blue-400">{comp.avgDuration}d</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Avg Return</span>
                      <div className={`font-mono text-lg ${comp.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.avgReturn > 0 ? '+' : ''}{comp.avgReturn}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Avg Volume</span>
                      <div className="font-mono text-lg text-violet-400">{comp.avgVolume}</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Best Strategy</span>
                    </div>
                    <p className="text-sm text-gray-300">{comp.bestStrategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
