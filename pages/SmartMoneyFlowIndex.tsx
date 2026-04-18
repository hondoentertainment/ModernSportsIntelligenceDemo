import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Banknote, ArrowUpDown, Layers, History, TrendingUp, TrendingDown,
  Zap, BarChart3
} from 'lucide-react';
import {
  getSmartMoneySignals, getFlowDirections, getSmartVsRetail,
  getFlowHistory, getSmartMoneyStats,
  type SmartMoneySignal, type FlowDirection, type SmartVsRetail as SVR
} from '../lib/smartMoneyFlowService.ts';

type TabId = 'flow-index' | 'smart-vs-retail' | 'sector-flow' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'flow-index', label: 'Flow Index', icon: <Banknote size={18} /> },
  { id: 'smart-vs-retail', label: 'Smart vs Retail', icon: <ArrowUpDown size={18} /> },
  { id: 'sector-flow', label: 'Sector Flow', icon: <Layers size={18} /> },
  { id: 'history', label: 'History', icon: <History size={18} /> },
];

export default function SmartMoneyFlowIndex() {
  const [activeTab, setActiveTab] = useState<TabId>('flow-index');
  const signals = getSmartMoneySignals();
  const flowDirections = getFlowDirections();
  const smartVsRetail = getSmartVsRetail();
  const flowHistory = getFlowHistory();
  const stats = getSmartMoneyStats();

  const divergentSignals = signals.filter(s => s.divergence);
  const alignedSignals = signals.filter(s => !s.divergence);

  const signalChartData = signals.slice(0, 10).map(s => ({
    name: s.playerName,
    smartMoney: s.smartMoneyVolume / 1000,
    retail: s.retailVolume / 1000,
    strength: s.signalStrength,
    priceChange: s.priceChange7d,
  }));

  const sectorChartData = flowDirections.map(f => ({
    name: f.sector,
    smartFlow: f.smartMoneyFlow / 1000,
    retailFlow: f.retailFlow / 1000,
    conviction: f.conviction,
    wow: f.weekOverWeek,
  }));

  const historyChartData = flowHistory.map(h => ({
    month: h.month,
    smartNet: h.smartNetFlow / 1000000,
    retailNet: h.retailNetFlow / 1000000,
    marketReturn: h.marketReturn,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Banknote className="text-green-400" size={32} />
            Smart Money Flow Index
          </h1>
          <p className="text-gray-400">Follow smart money vs retail collector flow into card positions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Divergent Signals</p>
            <p className="text-2xl font-bold text-red-400">{stats.divergentSignals}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Smart Inflow</p>
            <p className="text-2xl font-bold text-green-400">{stats.smartInflow}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Retail Inflow</p>
            <p className="text-2xl font-bold text-blue-400">{stats.retailInflow}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Avg Signal</p>
            <p className="text-2xl font-bold text-purple-400">{stats.avgSignalStrength}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Smart Volume</p>
            <p className="text-2xl font-bold text-yellow-400">${(stats.totalSmartVolume / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Retail Volume</p>
            <p className="text-2xl font-bold text-cyan-400">${(stats.totalRetailVolume / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'flow-index' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Smart Money vs Retail Volume ($K)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={signalChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="smartMoney" fill="#10b981" name="Smart Money ($K)" />
                  <Bar dataKey="retail" fill="#3b82f6" name="Retail ($K)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Divergent Signals ({divergentSignals.length})</h3>
                <div className="space-y-3">
                  {divergentSignals.slice(0, 5).map(s => (
                    <div key={s.id} className="p-3 bg-red-950/20 border border-red-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{s.playerName}</span>
                        <span className="text-yellow-400 text-sm font-bold">{s.signalStrength}</span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-400">Smart: {s.smartMoneyDirection}</span>
                        <span className="text-blue-400">Retail: {s.retailDirection}</span>
                        <span className={s.priceChange7d > 0 ? 'text-green-400' : 'text-red-400'}>{s.priceChange7d > 0 ? '+' : ''}{s.priceChange7d}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-green-400">Aligned Signals ({alignedSignals.length})</h3>
                <div className="space-y-3">
                  {alignedSignals.slice(0, 5).map(s => (
                    <div key={s.id} className="p-3 bg-green-950/20 border border-green-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{s.playerName}</span>
                        <span className="text-yellow-400 text-sm font-bold">{s.signalStrength}</span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-400">Smart: {s.smartMoneyDirection}</span>
                        <span className="text-blue-400">Retail: {s.retailDirection}</span>
                        <span className={s.priceChange7d > 0 ? 'text-green-400' : 'text-red-400'}>{s.priceChange7d > 0 ? '+' : ''}{s.priceChange7d}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'smart-vs-retail' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Smart Money vs Retail Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={smartVsRetail.map(s => ({
                  name: s.metric.length > 20 ? s.metric.slice(0, 20) + '...' : s.metric,
                  smartMoney: s.smartMoneyAvg,
                  retail: s.retailAvg,
                }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: '#9ca3af' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={170} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="smartMoney" fill="#10b981" name="Smart Money" />
                  <Bar dataKey="retail" fill="#3b82f6" name="Retail" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">Metric</th>
                      <th className="text-right py-3 px-2">Smart Money</th>
                      <th className="text-right py-3 px-2">Retail</th>
                      <th className="text-right py-3 px-2">Gap</th>
                      <th className="text-right py-3 px-2">Advantage</th>
                      <th className="text-right py-3 px-2">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smartVsRetail.map(s => (
                      <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-medium">{s.metric}</td>
                        <td className="py-3 px-2 text-right text-green-400">{s.smartMoneyAvg}</td>
                        <td className="py-3 px-2 text-right text-blue-400">{s.retailAvg}</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{s.gap}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-xs ${s.advantage === 'smart' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                            {s.advantage}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-purple-400">{s.historicalAccuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sector-flow' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Sector Money Flow ($K)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sectorChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="smartFlow" fill="#10b981" name="Smart Money ($K)" />
                  <Bar dataKey="retailFlow" fill="#3b82f6" name="Retail ($K)" />
                  <Bar dataKey="conviction" fill="#f59e0b" name="Conviction Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flowDirections.map(f => (
                <div key={f.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <h4 className="font-semibold mb-2">{f.sector}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Smart Flow:</span> <span className="text-green-400">${(f.smartMoneyFlow / 1000).toFixed(0)}K</span></div>
                    <div><span className="text-gray-500">Retail Flow:</span> <span className="text-blue-400">${(f.retailFlow / 1000).toFixed(0)}K</span></div>
                    <div><span className="text-gray-500">Trend:</span> <span className={
                      f.flowTrend === 'accelerating' ? 'text-green-400' :
                      f.flowTrend === 'decelerating' ? 'text-red-400' :
                      f.flowTrend === 'reversing' ? 'text-orange-400' :
                      'text-yellow-400'
                    }>{f.flowTrend}</span></div>
                    <div><span className="text-gray-500">WoW:</span> <span className={f.weekOverWeek > 0 ? 'text-green-400' : 'text-red-400'}>{f.weekOverWeek > 0 ? '+' : ''}{f.weekOverWeek}%</span></div>
                    <div><span className="text-gray-500">Conviction:</span> <span className="text-purple-400">{f.conviction}</span></div>
                    <div><span className="text-gray-500">Net Flow:</span> <span className="text-cyan-400">${(f.netFlow / 1000).toFixed(0)}K</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Smart vs Retail Net Flow ($M)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="smartNet" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Smart Money Net ($M)" />
                  <Area type="monotone" dataKey="retailNet" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Retail Net ($M)" />
                  <Line type="monotone" dataKey="marketReturn" stroke="#f59e0b" name="Market Return %" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Monthly Flow Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">Month</th>
                      <th className="text-right py-3 px-2">Smart In</th>
                      <th className="text-right py-3 px-2">Smart Out</th>
                      <th className="text-right py-3 px-2">Retail In</th>
                      <th className="text-right py-3 px-2">Retail Out</th>
                      <th className="text-right py-3 px-2">Market Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flowHistory.map(h => (
                      <tr key={h.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-medium">{h.month}</td>
                        <td className="py-3 px-2 text-right text-green-400">${(h.smartMoneyInflow / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-2 text-right text-red-400">${(h.smartMoneyOutflow / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-2 text-right text-blue-400">${(h.retailInflow / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-2 text-right text-orange-400">${(h.retailOutflow / 1000000).toFixed(1)}M</td>
                        <td className="py-3 px-2 text-right">
                          <span className={h.marketReturn > 0 ? 'text-green-400' : 'text-red-400'}>{h.marketReturn > 0 ? '+' : ''}{h.marketReturn}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
