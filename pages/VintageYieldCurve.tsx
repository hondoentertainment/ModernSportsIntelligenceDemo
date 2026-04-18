import React, { useState } from 'react';
import {
  TrendingUp, BarChart3, Activity, Layers, ArrowUpRight,
  ArrowDownRight, Minus, AlertTriangle, Info
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getYieldCurves, getYieldSpreads, getCurveShifts, getYieldSummary,
  YieldCurve, YieldSpread, CurveShift
} from '../lib/vintageYieldService.ts';

const TABS = [
  { id: 'curves', label: 'Curves', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'spreads', label: 'Spreads', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'shifts', label: 'Shifts', icon: <Activity className="w-4 h-4" /> },
  { id: 'analysis', label: 'Analysis', icon: <Layers className="w-4 h-4" /> },
] as const;

const CURVE_COLORS: Record<string, string> = {
  'Vintage Baseball': '#8b5cf6',
  'Modern Chrome': '#06b6d4',
  'Prospect Pipeline': '#f59e0b',
};

const SHAPE_STYLES: Record<string, string> = {
  'normal': 'bg-emerald-500/20 text-emerald-400',
  'inverted': 'bg-red-500/20 text-red-400',
  'flat': 'bg-gray-500/20 text-gray-400',
  'humped': 'bg-amber-500/20 text-amber-400',
};

const SIGNAL_STYLES: Record<string, string> = {
  'bullish': 'bg-emerald-500/20 text-emerald-400',
  'bearish': 'bg-red-500/20 text-red-400',
  'neutral': 'bg-gray-500/20 text-gray-400',
};

const SHIFT_STYLES: Record<string, string> = {
  'parallel': 'bg-blue-500/20 text-blue-400',
  'steepening': 'bg-emerald-500/20 text-emerald-400',
  'flattening': 'bg-amber-500/20 text-amber-400',
  'twist': 'bg-violet-500/20 text-violet-400',
};

const SHIFT_LABELS: Record<string, string> = {
  'parallel': 'Parallel',
  'steepening': 'Steepening',
  'flattening': 'Flattening',
  'twist': 'Twist',
};

export default function VintageYieldCurve() {
  const [activeTab, setActiveTab] = useState<string>('curves');

  const curves = getYieldCurves();
  const spreads = getYieldSpreads();
  const shifts = getCurveShifts();
  const summary = getYieldSummary();

  const stats = [
    { label: 'Avg Steepness', value: summary.avgSteepness.toFixed(2), icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Inverted Curves', value: summary.invertedCurves, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Widest Spread', value: `${summary.widestSpread}%`, icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Recent Shifts', value: summary.recentShiftCount, icon: <Activity className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  // Build unified curve chart data: each row is a tenor, each curve is a separate series
  const tenors = ['1m', '3m', '6m', '1y', '2y', '3y', '5y', '10y'];
  const curveChartData = tenors.map(tenor => {
    const row: Record<string, string | number> = { tenor };
    curves.forEach(curve => {
      const point = curve.points.find(p => p.tenor === tenor);
      if (point) {
        row[curve.name] = point.currentYield;
      }
    });
    return row;
  });

  // Spread chart data for z-scores
  const spreadChartData = spreads.map(s => ({
    name: s.name,
    zScore: s.zScore,
    spread: s.currentSpread,
    signal: s.signal,
  }));

  // Shift chart data by date
  const shiftChartData = [...shifts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      date: s.date.substring(5), // MM-DD
      magnitude: s.magnitude,
      impact: s.portfolioImpact,
      type: s.shiftType,
      fullDate: s.date,
    }));

  // Radar chart data comparing curve metrics
  const radarData = [
    { metric: 'Steepness', ...Object.fromEntries(curves.map(c => [c.name, Math.abs(c.steepness) * 10])) },
    { metric: 'Curvature', ...Object.fromEntries(curves.map(c => [c.name, c.curvature * 20])) },
    { metric: 'Short Yield', ...Object.fromEntries(curves.map(c => [c.name, c.points[0].currentYield * 3])) },
    { metric: 'Mid Yield', ...Object.fromEntries(curves.map(c => [c.name, Math.max(0, c.points[3].currentYield * 2)])) },
    { metric: 'Long Yield', ...Object.fromEntries(curves.map(c => [c.name, Math.max(0, c.points[7].currentYield)])) },
    { metric: 'Volatility', ...Object.fromEntries(curves.map(c => [c.name, Math.abs(c.points.reduce((s, p) => s + Math.abs(p.change), 0)) * 3])) },
  ];

  const SPREAD_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Vintage Yield Curve</h1>
            <p className="text-sm text-gray-400">Card market return curves, spread analysis, and structural shift detection</p>
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

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {/* Tab: Curves */}
        {activeTab === 'curves' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Yield Curves by Tenor</h3>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={curveChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="tenor" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  {curves.map(curve => (
                    <Line
                      key={curve.id}
                      type="monotone"
                      dataKey={curve.name}
                      stroke={CURVE_COLORS[curve.name]}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: CURVE_COLORS[curve.name] }}
                      name={curve.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {curves.map(curve => (
                <div key={curve.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CURVE_COLORS[curve.name] }} />
                      <span className="text-sm font-semibold text-white">{curve.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${SHAPE_STYLES[curve.shape]}`}>
                      {curve.shape.charAt(0).toUpperCase() + curve.shape.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">{curve.category}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Steepness</div>
                      <div className={`text-sm font-medium ${curve.steepness >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {curve.steepness > 0 ? '+' : ''}{curve.steepness.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Curvature</div>
                      <div className="text-sm font-medium text-gray-300">{curve.curvature.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">10y Yield</div>
                      <div className={`text-sm font-medium ${curve.points[7].currentYield >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {curve.points[7].currentYield > 0 ? '+' : ''}{curve.points[7].currentYield}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Short: {curve.points[0].currentYield}%</span>
                      <span className="text-gray-600">-</span>
                      <span className="text-gray-500">Mid: {curve.points[3].currentYield}%</span>
                      <span className="text-gray-600">-</span>
                      <span className="text-gray-500">Long: {curve.points[7].currentYield}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Spreads */}
        {activeTab === 'spreads' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Spread Z-Scores</h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={spreadChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      value.toFixed(2),
                      name === 'zScore' ? 'Z-Score' : 'Spread %'
                    ]}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="zScore" name="Z-Score" radius={[4, 4, 0, 0]}>
                    {spreadChartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.zScore > 1 ? '#10b981' : entry.zScore < -1 ? '#ef4444' : '#6b7280'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spreads.map((s, i) => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-semibold text-white">{s.name}</span>
                      <div className="text-xs text-gray-500 mt-0.5">{s.longTenor} vs {s.shortTenor}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${SIGNAL_STYLES[s.signal]}`}>
                      {s.signal.charAt(0).toUpperCase() + s.signal.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Current</div>
                      <div className={`text-lg font-bold ${s.currentSpread >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.currentSpread > 0 ? '+' : ''}{s.currentSpread}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Hist Avg</div>
                      <div className="text-sm font-medium text-gray-300">{s.historicalAvg}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Z-Score</div>
                      <div className={`text-sm font-bold ${
                        s.zScore > 1 ? 'text-emerald-400' : s.zScore < -1 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {s.zScore > 0 ? '+' : ''}{s.zScore.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50">
                    <Info className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Shifts */}
        {activeTab === 'shifts' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Curve Shift Magnitude Over Time</h3>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={shiftChartData}>
                  <defs>
                    <linearGradient id="shiftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value}`,
                      name === 'magnitude' ? 'Magnitude' : 'Portfolio Impact %'
                    ]}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Area type="monotone" dataKey="magnitude" stroke="#8b5cf6" fill="url(#shiftGrad)" strokeWidth={2} name="Magnitude" dot={{ r: 4 }} />
                  <Area type="monotone" dataKey="impact" stroke="#06b6d4" fill="url(#impactGrad)" strokeWidth={2} name="Portfolio Impact %" dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shifts.map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{s.date}</span>
                      <span className="text-xs text-gray-500">{s.id}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${SHIFT_STYLES[s.shiftType]}`}>
                      {SHIFT_LABELS[s.shiftType]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">{s.driver}</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Magnitude</div>
                      <div className="text-sm font-bold text-white">{s.magnitude.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Impact</div>
                      <div className={`text-sm font-bold ${s.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.portfolioImpact > 0 ? '+' : ''}{s.portfolioImpact}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Tenors</div>
                      <div className="text-xs text-gray-300">{s.affectedTenors.join(', ')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Analysis */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Curve Metric Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.75rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  {curves.map(curve => (
                    <Radar
                      key={curve.id}
                      name={curve.name}
                      dataKey={curve.name}
                      stroke={CURVE_COLORS[curve.name]}
                      fill={CURVE_COLORS[curve.name]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Vintage Baseball', color: 'bg-violet-500', desc: 'Classic normal curve with strong long-term appreciation. Pre-war cards offer the most predictable yield profile.', ret: '+10.5%', risk: 'Low', riskColor: 'text-blue-400', rec: 'Accumulate', recColor: 'text-emerald-400' },
                { name: 'Modern Chrome', color: 'bg-cyan-500', desc: 'Humped curve peaks at 1-year then declines. Timing exits is critical; holding beyond 2 years erodes returns.', ret: '+22.0%', risk: 'Medium', riskColor: 'text-amber-400', rec: 'Time Exits', recColor: 'text-amber-400' },
                { name: 'Prospect Pipeline', color: 'bg-amber-500', desc: 'Inverted curve warns of unsustainable speculative demand. Long-term holders face negative returns as prospects bust.', ret: '+12.5%', risk: 'High', riskColor: 'text-red-400', rec: 'Quick Flip Only', recColor: 'text-red-400' },
              ].map((card, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${card.color}`} />
                    <h4 className="text-sm font-semibold text-white">{card.name}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">{card.desc}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">1y Implied Return</span>
                      <span className="text-emerald-400 font-medium">{card.ret}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Risk Profile</span>
                      <span className={`${card.riskColor} font-medium`}>{card.risk}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Recommendation</span>
                      <span className={`${card.recColor} font-medium`}>{card.rec}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Market Structure Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <div className="text-xs text-gray-500 mb-1">Bullish Spreads</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {spreads.filter(s => s.signal === 'bullish').length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">of {spreads.length} total</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <div className="text-xs text-gray-500 mb-1">Avg Shift Magnitude</div>
                  <div className="text-xl font-bold text-violet-400">
                    {(shifts.reduce((s, c) => s + c.magnitude, 0) / shifts.length).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">across {shifts.length} events</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <div className="text-xs text-gray-500 mb-1">Net Portfolio Impact</div>
                  <div className={`text-xl font-bold ${
                    shifts.reduce((s, c) => s + c.portfolioImpact, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {shifts.reduce((s, c) => s + c.portfolioImpact, 0) > 0 ? '+' : ''}
                    {shifts.reduce((s, c) => s + c.portfolioImpact, 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">cumulative</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <div className="text-xs text-gray-500 mb-1">Curve Health</div>
                  <div className={`text-xl font-bold ${
                    summary.invertedCurves === 0 ? 'text-emerald-400' :
                    summary.invertedCurves === 1 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {summary.invertedCurves === 0 ? 'Strong' :
                     summary.invertedCurves === 1 ? 'Caution' : 'Warning'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{summary.invertedCurves} inverted</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
