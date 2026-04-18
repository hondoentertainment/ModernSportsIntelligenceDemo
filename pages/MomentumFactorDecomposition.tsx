import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Layers, TrendingUp, TrendingDown, Zap, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, PieChart as PieIcon
} from 'lucide-react';
import {
  getMomentumFactors, getFactorDecompositions, getMomentumHistory,
  getFactorWeightHistory
} from '../lib/momentumFactorService.ts';

const tabs = ['Factor Map', 'Decomposition', 'Weight History', 'Attribution'] as const;
type Tab = typeof tabs[number];

export default function MomentumFactorDecomposition() {
  const [activeTab, setActiveTab] = useState<Tab>('Factor Map');
  const [selectedCard, setSelectedCard] = useState(0);
  const factors = getMomentumFactors();
  const decompositions = getFactorDecompositions();
  const momentumHistory = getMomentumHistory();

  const totalWeight = factors.reduce((s, f) => s + f.currentWeight, 0);
  const topFactor = factors.reduce((top, f) => f.currentWeight > top.currentWeight ? f : top, factors[0]);
  const latestMomentum = momentumHistory[momentumHistory.length - 1];

  const trendIcons: Record<string, React.ReactNode> = {
    increasing: <ArrowUpRight size={12} className="text-emerald-400" />,
    decreasing: <ArrowDownRight size={12} className="text-red-400" />,
    stable: <Minus size={12} className="text-gray-400" />,
  };

  const stats = [
    { label: 'Total Momentum', value: `${latestMomentum.totalMomentum}%`, icon: TrendingUp, color: '#22c55e' },
    { label: 'Top Factor', value: topFactor.name, icon: Zap, color: topFactor.color },
    { label: 'Active Factors', value: factors.length.toString(), icon: Layers, color: '#3b82f6' },
    { label: 'Cards Analyzed', value: decompositions.length.toString(), icon: BarChart3, color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20">
            <Layers size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Momentum Factor Decomposition</h1>
            <p className="text-sm text-gray-400">Factor analysis decomposing card momentum into underlying drivers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Factor Map' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Factor Weights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={factors} dataKey="currentWeight" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, value }: { name: string; value: number }) => `${name}: ${(value * 100).toFixed(0)}%`}>
                      {factors.map((f, i) => (
                        <Cell key={i} fill={f.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {factors.map(f => (
                    <div key={f.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{f.name}</span>
                          {trendIcons[f.trend]}
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                          <div className="h-1.5 rounded-full" style={{ width: `${f.currentWeight * 100 / 0.25 * 100}%`, backgroundColor: f.color }} />
                        </div>
                      </div>
                      <span className="text-sm font-mono text-gray-300">{(f.currentWeight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Factor Characteristics</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={factors.map(f => ({
                  name: f.name,
                  weight: f.currentWeight * 100,
                  contribution: f.avgContribution,
                  volatility: f.volatility,
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Weight %" dataKey="weight" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Avg Contribution" dataKey="contribution" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Decomposition' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {decompositions.map((d, i) => (
                <button
                  key={d.cardId}
                  onClick={() => setSelectedCard(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedCard === i
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {d.player}
                </button>
              ))}
            </div>

            {decompositions[selectedCard] && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{decompositions[selectedCard].player}</h3>
                    <p className="text-xs text-gray-400">{decompositions[selectedCard].cardName} - {decompositions[selectedCard].sport}</p>
                  </div>
                  <div className={`text-2xl font-bold ${decompositions[selectedCard].totalMomentum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {decompositions[selectedCard].totalMomentum >= 0 ? '+' : ''}{decompositions[selectedCard].totalMomentum}%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={decompositions[selectedCard].factors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis type="category" dataKey="factorName" stroke="#9ca3af" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="contribution" name="Contribution %">
                      {decompositions[selectedCard].factors.map((f, i) => {
                        const factor = factors.find(mf => mf.id === f.factorId);
                        return <Cell key={i} fill={factor?.color || '#6b7280'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">All Cards - Total Momentum</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={decompositions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="totalMomentum" name="Total Momentum %">
                    {decompositions.map((d, i) => (
                      <Cell key={i} fill={d.totalMomentum >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Weight History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Factor Contribution Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={momentumHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  {factors.map(f => {
                    const key = f.name === 'Grade Inflation' ? 'gradeInflation' :
                      f.name === 'Market Sentiment' ? 'marketSentiment' :
                      f.name === 'Cross-Sport Spillover' ? 'crossSport' :
                      f.name === 'Rookie Hype Cycle' ? 'rookieHype' :
                      f.name.toLowerCase();
                    return (
                      <Area
                        key={f.id}
                        type="monotone"
                        dataKey={key}
                        name={f.name}
                        stackId="1"
                        stroke={f.color}
                        fill={f.color}
                        fillOpacity={0.6}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Total Momentum Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={momentumHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="totalMomentum" name="Total Momentum" stroke="#a855f7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Attribution' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Factor Attribution Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {factors.map(f => (
                  <div key={f.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                        <span className="font-medium text-sm">{f.name}</span>
                        {trendIcons[f.trend]}
                      </div>
                      <span className="text-sm font-bold" style={{ color: f.color }}>{(f.currentWeight * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{f.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span>Avg Contribution: <span className="text-emerald-400">{f.avgContribution}%</span></span>
                      <span>Volatility: <span className="text-amber-400">{f.volatility}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Factor Volatility Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgContribution" name="Avg Contribution %" fill="#22c55e" />
                  <Bar dataKey="volatility" name="Volatility %" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
