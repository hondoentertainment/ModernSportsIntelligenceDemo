import React, { useState } from 'react';
import {
  Timer, TrendingUp, TrendingDown, Gauge, BarChart3,
  Activity, History, Target, ArrowUpDown, Zap
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  getFactorTimings, getTimingSignals, getFactorExposures,
  getTimingHistory, getOverweightFactors, getAvgExpectedReturn,
  getAvgConfidence, getCumulativeAlpha
} from '../lib/factorTimingService.ts';

const TABS = [
  { id: 'dashboard', label: 'Timing Dashboard', icon: <Timer className="w-4 h-4" /> },
  { id: 'exposure', label: 'Factor Exposure', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'signals', label: 'Signal History', icon: <Activity className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
] as const;

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const SIGNAL_STYLES: Record<string, string> = {
  overweight: 'bg-emerald-500/20 text-emerald-400',
  neutral: 'bg-gray-500/20 text-gray-400',
  underweight: 'bg-red-500/20 text-red-400',
};

export default function FactorTimingEngine() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const factors = getFactorTimings();
  const signals = getTimingSignals();
  const exposures = getFactorExposures();
  const history = getTimingHistory();

  const stats = [
    { label: 'Overweight Factors', value: getOverweightFactors(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Expected Return', value: `${getAvgExpectedReturn()}%`, icon: <Target className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Avg Confidence', value: `${getAvgConfidence()}%`, icon: <Gauge className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Cumulative Alpha', value: `${getCumulativeAlpha()}%`, icon: <Zap className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const radarData = factors.map(f => ({
    factor: f.factorName.replace(' Factor', ''),
    strength: f.signalStrength,
    confidence: f.confidence,
    accuracy: f.historicalAccuracy,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <Timer className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Factor Timing Engine</h1>
            <p className="text-sm text-gray-400">Time exposure to market factors for optimal returns</p>
          </div>
        </div>

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

        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Factor Signal Strength</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={factors.map(f => ({
                    name: f.factorName.replace(' Factor', ''),
                    strength: f.signalStrength,
                    expected: f.expectedReturn,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="strength" name="Signal Strength" radius={[4, 4, 0, 0]}>
                      {factors.map((f, i) => (
                        <Cell key={i} fill={f.currentSignal === 'overweight' ? '#10b981' : f.currentSignal === 'underweight' ? '#ef4444' : '#6b7280'} />
                      ))}
                    </Bar>
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Factor Profile Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} />
                    <Radar name="Strength" dataKey="strength" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Radar name="Confidence" dataKey="confidence" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Radar name="Accuracy" dataKey="accuracy" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factors.map((f, i) => (
                <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{f.factorName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[f.currentSignal]}`}>{f.currentSignal}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{f.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Expected</span><div className={`font-mono ${f.expectedReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{f.expectedReturn > 0 ? '+' : ''}{f.expectedReturn}%</div></div>
                    <div><span className="text-gray-500">Confidence</span><div className="font-mono text-cyan-400">{f.confidence}%</div></div>
                    <div><span className="text-gray-500">Accuracy</span><div className="font-mono text-amber-400">{f.historicalAccuracy}%</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'exposure' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Current vs Target Exposure</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exposures.map(e => ({
                  factor: e.factorName.replace(' Factor', ''),
                  current: e.currentExposure,
                  target: e.targetExposure,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="current" name="Current Exposure %" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Exposure %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Rebalancing Actions</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Factor</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Current</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Target</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Delta</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Action</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Cost</th>
                  </tr></thead>
                  <tbody>
                    {exposures.map(e => (
                      <tr key={e.factorId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white">{e.factorName}</td>
                        <td className="p-3 text-right font-mono text-gray-400">{e.currentExposure}%</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{e.targetExposure}%</td>
                        <td className="p-3 text-right font-mono"><span className={e.delta > 0 ? 'text-emerald-400' : e.delta < 0 ? 'text-red-400' : 'text-gray-400'}>{e.delta > 0 ? '+' : ''}{e.delta}%</span></td>
                        <td className="p-3 text-xs text-gray-300">{e.rebalanceAction}</td>
                        <td className="p-3 text-right font-mono text-amber-400">${e.costToRebalance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Signal Outcomes</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signals.filter(s => s.realized).map(s => ({
                  signal: `${s.factorName} ${s.signalDate.substring(5)}`,
                  outcome: s.outcome || 0,
                  strength: s.strength / 10,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="signal" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="outcome" name="Outcome %" radius={[4, 4, 0, 0]}>
                    {signals.filter(s => s.realized).map((s, i) => (
                      <Cell key={i} fill={(s.outcome || 0) >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Signal Log</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Factor</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Direction</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Strength</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Outcome</th>
                    <th className="text-left p-3 text-gray-500 font-medium">Hold Period</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {signals.map(s => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-gray-300">{s.signalDate}</td>
                        <td className="p-3 text-white">{s.factorName}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SIGNAL_STYLES[s.direction]}`}>{s.direction}</span></td>
                        <td className="p-3 text-right font-mono text-violet-400">{s.strength}</td>
                        <td className="p-3 text-right font-mono">{s.outcome !== null ? <span className={s.outcome >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.outcome > 0 ? '+' : ''}{s.outcome}%</span> : <span className="text-gray-500">pending</span>}</td>
                        <td className="p-3 text-gray-400 text-xs">{s.holdPeriod}</td>
                        <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.realized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>{s.realized ? 'closed' : 'open'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Factor Returns vs Benchmark (24 months)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="totalReturn" name="Total Factor Return %" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="benchmark" name="Benchmark %" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Individual Factor Returns</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history.slice(-12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="scarcityReturn" name="Scarcity" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="narrativeReturn" name="Narrative" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="gradeReturn" name="Grade" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="vintageReturn" name="Vintage" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="seasonalReturn" name="Seasonal" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="momentumReturn" name="Momentum" stroke="#ec4899" strokeWidth={2} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
