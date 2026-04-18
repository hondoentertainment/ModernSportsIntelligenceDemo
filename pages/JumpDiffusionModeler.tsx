import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  Zap, TrendingUp, TrendingDown, Activity, AlertTriangle,
  BarChart3, ArrowUp, ArrowDown, Target, Cpu
} from 'lucide-react';
import {
  getJumpEvents, getDiffusionParameters, getJumpDiffusionModels,
  getModelFitData, getPositiveJumps, getNegativeJumps
} from '../lib/jumpDiffusionService.ts';

const tabs = ['Jump Events', 'Model Parameters', 'Simulation', 'Model Fit'] as const;
type Tab = typeof tabs[number];

const causeColors: Record<string, string> = {
  injury: '#ef4444',
  trade: '#3b82f6',
  award: '#22c55e',
  scandal: '#dc2626',
  'breakout-game': '#f59e0b',
  'grading-event': '#a855f7',
  'media-viral': '#06b6d4',
  'market-crash': '#ef4444',
};

export default function JumpDiffusionModeler() {
  const [activeTab, setActiveTab] = useState<Tab>('Jump Events');
  const [selectedModel, setSelectedModel] = useState(0);
  const jumpEvents = getJumpEvents();
  const diffParams = getDiffusionParameters();
  const models = getJumpDiffusionModels();
  const modelFit = getModelFitData();
  const positiveJumps = getPositiveJumps();
  const negativeJumps = getNegativeJumps();

  const avgJumpSize = Math.round(jumpEvents.reduce((s, e) => s + Math.abs(e.jumpPercent), 0) / jumpEvents.length * 10) / 10;
  const permanentJumps = jumpEvents.filter(e => e.permanent).length;

  const stats = [
    { label: 'Total Jump Events', value: jumpEvents.length.toString(), icon: Zap, color: '#f59e0b' },
    { label: 'Positive Jumps', value: positiveJumps.length.toString(), icon: ArrowUp, color: '#22c55e' },
    { label: 'Negative Jumps', value: negativeJumps.length.toString(), icon: ArrowDown, color: '#ef4444' },
    { label: 'Avg Jump Size', value: `${avgJumpSize}%`, icon: Activity, color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20">
            <Zap size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Jump Diffusion Modeler</h1>
            <p className="text-sm text-gray-400">Model sudden price jumps vs gradual drift for card valuations</p>
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
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Jump Events' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Jump Magnitudes by Event</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={jumpEvents.sort((a, b) => Math.abs(b.jumpPercent) - Math.abs(a.jumpPercent))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Jump Size']}
                  />
                  <Bar dataKey="jumpPercent" name="Jump %">
                    {jumpEvents.sort((a, b) => Math.abs(b.jumpPercent) - Math.abs(a.jumpPercent)).map((e, i) => (
                      <Cell key={i} fill={e.jumpPercent >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Event Timeline</h3>
              <div className="space-y-3">
                {jumpEvents.sort((a, b) => b.date.localeCompare(a.date)).map(event => (
                  <div key={event.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {event.jumpPercent >= 0 ? <ArrowUp size={16} className="text-emerald-400" /> : <ArrowDown size={16} className="text-red-400" />}
                        <span className="font-medium text-sm">{event.player}</span>
                        <span className="text-xs text-gray-400">{event.cardName}</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: causeColors[event.cause] + '22', color: causeColors[event.cause] }}>
                          {event.cause.replace('-', ' ')}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${event.jumpPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {event.jumpPercent >= 0 ? '+' : ''}{event.jumpPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{event.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-gray-500">{event.date}</span>
                      <span className="text-gray-400">${event.priceBeforeJump.toLocaleString()} → ${event.priceAfterJump.toLocaleString()}</span>
                      <span className={event.permanent ? 'text-amber-400' : 'text-blue-400'}>
                        {event.permanent ? 'Permanent' : `Recovery: ${event.recoveryDays}d`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Model Parameters' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Diffusion Parameters</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={diffParams}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="drift" name="Drift" fill="#22c55e" />
                  <Bar dataKey="diffusion" name="Diffusion" fill="#3b82f6" />
                  <Bar dataKey="jumpIntensity" name="Jump Intensity" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Model Quality (R-squared)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={diffParams}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" domain={[0.7, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="r2Fit" name="R-squared">
                    {diffParams.map((d, i) => (
                      <Cell key={i} fill={d.r2Fit > 0.88 ? '#22c55e' : d.r2Fit > 0.84 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diffParams.map(dp => (
                <div key={dp.cardId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-1">{dp.player}</h4>
                  <p className="text-xs text-gray-400 mb-3">{dp.cardName}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-400">Drift (mu)</span><span className={dp.drift >= 0 ? 'text-emerald-400' : 'text-red-400'}>{dp.drift.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Diffusion (sigma)</span><span className="text-blue-400">{dp.diffusion.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Jump Intensity (lambda)</span><span className="text-amber-400">{dp.jumpIntensity.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Avg Jump Size</span><span className="text-purple-400">{dp.avgJumpSize.toFixed(4)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">R-squared</span><span className="text-emerald-400">{dp.r2Fit.toFixed(3)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Simulation' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {models.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedModel === i
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {m.player}
                </button>
              ))}
            </div>

            {models[selectedModel] && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{models[selectedModel].player}</h3>
                    <p className="text-xs text-gray-400">{models[selectedModel].cardName} - {models[selectedModel].sport}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">${models[selectedModel].currentPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{(models[selectedModel].modelConfidence * 100).toFixed(0)}% confidence</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">30d Projection</div>
                    <div className="text-lg font-bold text-blue-400">${models[selectedModel].projectedPrice30d.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">90d Projection</div>
                    <div className="text-lg font-bold text-purple-400">${models[selectedModel].projectedPrice90d.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Jump Prob (30d)</div>
                    <div className="text-lg font-bold text-amber-400">{(models[selectedModel].jumpProbability30d * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Avg Jump Size</div>
                    <div className={`text-lg font-bold ${models[selectedModel].avgJumpMagnitude >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{models[selectedModel].avgJumpMagnitude >= 0 ? '+' : ''}{models[selectedModel].avgJumpMagnitude}%</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={models}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="player" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="drift" name="Drift" fill="#22c55e" />
                    <Bar dataKey="volatility" name="Volatility" fill="#3b82f6" />
                    <Bar dataKey="jumpProbability30d" name="Jump Prob 30d" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Model Fit' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Actual vs Model Price (Wembanyama)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={modelFit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="actualPrice" name="Actual Price" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="modelPrice" name="Model Price" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Component Decomposition</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={modelFit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="driftComponent" name="Drift" stackId="a" fill="#22c55e" />
                  <Bar dataKey="diffusionComponent" name="Diffusion" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="jumpComponent" name="Jump" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Residuals</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={modelFit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="residual" name="Residual" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
