import React, { useState } from 'react';
import {
  Users, AlertTriangle, TrendingDown, DollarSign, Activity,
  Map, BarChart3, ShieldAlert, Lightbulb, History
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getCrowdingSignals, getThesisDensities, getExitRisks,
  getCrowdingHistory, getCrowdedCount, getContrarianCount,
  getAvgCrowdingLevel, getTotalCapitalAtRisk
} from '../lib/crowdingRiskService.ts';

const TABS = [
  { id: 'map', label: 'Crowding Map', icon: <Map className="w-4 h-4" /> },
  { id: 'density', label: 'Thesis Density', icon: <Users className="w-4 h-4" /> },
  { id: 'exit', label: 'Exit Risk', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'contrarian', label: 'Contrarian Plays', icon: <Lightbulb className="w-4 h-4" /> },
] as const;

const STATUS_STYLES: Record<string, string> = {
  crowded: 'bg-red-500/20 text-red-400',
  'moderately-crowded': 'bg-amber-500/20 text-amber-400',
  normal: 'bg-blue-500/20 text-blue-400',
  'contrarian-opportunity': 'bg-emerald-500/20 text-emerald-400',
};

const TREND_STYLES: Record<string, string> = {
  increasing: 'text-red-400',
  stable: 'text-gray-400',
  decreasing: 'text-emerald-400',
};

export default function CrowdingRiskMonitor() {
  const [activeTab, setActiveTab] = useState<string>('map');

  const signals = getCrowdingSignals();
  const densities = getThesisDensities();
  const exitRisks = getExitRisks();
  const history = getCrowdingHistory();

  const totalCap = getTotalCapitalAtRisk();

  const stats = [
    { label: 'Crowded Theses', value: getCrowdedCount(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Contrarian Plays', value: getContrarianCount(), icon: <Lightbulb className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Avg Crowding', value: `${getAvgCrowdingLevel()}/100`, icon: <Users className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Capital at Risk', value: `$${Math.round(totalCap / 1000000)}M`, icon: <DollarSign className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Users className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crowding Risk Monitor</h1>
            <p className="text-sm text-gray-400">Detect when too many collectors pile into the same thesis</p>
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
                activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}>{tab.icon}{tab.label}</button>
          ))}
        </div>

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Crowding Level by Thesis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={signals.sort((a, b) => b.crowdingLevel - a.crowdingLevel).map(s => ({
                  name: s.thesisName.length > 25 ? s.thesisName.substring(0, 25) + '...' : s.thesisName,
                  crowding: s.crowdingLevel,
                  exitRisk: s.exitRiskScore,
                }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="crowding" name="Crowding Level" radius={[0, 4, 4, 0]}>
                    {signals.sort((a, b) => b.crowdingLevel - a.crowdingLevel).map((s, i) => (
                      <Cell key={i} fill={s.crowdingLevel >= 75 ? '#ef4444' : s.crowdingLevel >= 50 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Crowding Trend (12 months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="avgCrowdingLevel" name="Avg Crowding" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="crowdedTheses" name="Crowded Theses" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="contrarianPlays" name="Contrarian Plays" stroke="#10b981" strokeWidth={2} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.slice(0, 6).map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white truncate mr-2">{s.thesisName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[s.status]}`}>{s.status.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${s.crowdingLevel >= 75 ? 'bg-red-500' : s.crowdingLevel >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${s.crowdingLevel}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Crowding</span><div className="font-mono text-white">{s.crowdingLevel}/100</div></div>
                    <div><span className="text-gray-500">Participants</span><div className="font-mono text-cyan-400">{(s.participantEstimate / 1000).toFixed(1)}K</div></div>
                    <div><span className="text-gray-500">Trend</span><div className={`font-mono ${TREND_STYLES[s.trend]}`}>{s.trend}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'density' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Social Mentions vs Density Score</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={densities.slice(0, 8).map(d => ({
                  name: d.thesisName.substring(0, 20),
                  density: d.densityScore,
                  mentions: Math.round(d.socialMentions / 100),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="density" name="Density Score" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mentions" name="Social Mentions (100s)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800"><h3 className="text-sm font-semibold text-gray-300">Thesis Density Detail</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-500 font-medium">Thesis</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Density</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Mentions</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Listing Growth</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Price Corr.</th>
                    <th className="text-right p-3 text-gray-500 font-medium">Vol. Conc.</th>
                    <th className="text-right p-3 text-gray-500 font-medium">New Entrants</th>
                  </tr></thead>
                  <tbody>
                    {densities.map(d => (
                      <tr key={d.thesisId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-3 text-white text-xs">{d.thesisName}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={d.densityScore >= 75 ? 'text-red-400' : d.densityScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}>{d.densityScore}</span></td>
                        <td className="p-3 text-right font-mono text-violet-400 text-xs">{d.socialMentions.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-xs"><span className={d.listingGrowth > 0 ? 'text-red-400' : 'text-emerald-400'}>{d.listingGrowth > 0 ? '+' : ''}{d.listingGrowth}%</span></td>
                        <td className="p-3 text-right font-mono text-cyan-400 text-xs">{d.priceCorrelation}</td>
                        <td className="p-3 text-right font-mono text-amber-400 text-xs">{d.volumeConcentration}</td>
                        <td className="p-3 text-right font-mono text-gray-300 text-xs">{d.newEntrants30d.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exit' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Exit Risk Assessment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exitRisks.map(e => ({
                  name: e.thesisName.substring(0, 22),
                  exitRisk: e.exitRiskScore,
                  slippage: e.estimatedSlippage,
                  cascadeRisk: e.cascadeRisk,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="exitRisk" name="Exit Risk Score" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cascadeRisk" name="Cascade Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exitRisks.map(e => (
                <div key={e.thesisId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{e.thesisName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.exitRiskScore >= 75 ? 'bg-red-500/20 text-red-400' : e.exitRiskScore >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-yellow-500/20 text-yellow-400'}`}>Risk: {e.exitRiskScore}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{e.scenario}</p>
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div><span className="text-gray-500">Slippage</span><div className="font-mono text-red-400">{e.estimatedSlippage}%</div></div>
                    <div><span className="text-gray-500">Cascade</span><div className="font-mono text-amber-400">{e.cascadeRisk}</div></div>
                    <div><span className="text-gray-500">Time to Exit</span><div className="font-mono text-gray-300">{e.timeToExit}</div></div>
                    <div><span className="text-gray-500">Max Drawdown</span><div className="font-mono text-red-400">-{e.worstCaseDrawdown}%</div></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">Mitigation:</span>
                    <ul className="mt-1 space-y-0.5">
                      {e.mitigationSteps.slice(0, 2).map((step, i) => (
                        <li key={i} className="text-gray-500">- {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contrarian' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Capital at Risk Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => `$${(v / 1000000).toFixed(0)}M`} />
                  <Area type="monotone" dataKey="capitalAtRisk" name="Capital at Risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.filter(s => s.status === 'contrarian-opportunity' || s.crowdingLevel < 50).map(s => (
                <div key={s.id} className="bg-gray-900 border border-emerald-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{s.thesisName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">Contrarian</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div><span className="text-gray-500">Crowding</span><div className="font-mono text-emerald-400">{s.crowdingLevel}/100</div></div>
                    <div><span className="text-gray-500">Exit Risk</span><div className="font-mono text-emerald-400">{s.exitRiskScore}</div></div>
                    <div><span className="text-gray-500">Trend</span><div className={`font-mono ${TREND_STYLES[s.trend]}`}>{s.trend}</div></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">Affected cards:</span>
                    <div className="mt-1">{s.affectedCards.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Crowding Events per Month</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="crowdingEvents" name="Crowding Events" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
