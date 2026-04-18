import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell
} from 'recharts';
import {
  ShieldAlert, AlertTriangle, Eye, BarChart3, Bell, Users,
  AlertCircle, Info
} from 'lucide-react';
import {
  getEchoChambers, getChamberRisks, getInformationDiversity,
  getChamberAlerts, getEchoChamberStats,
  type EchoChamber, type ChamberRisk, type InformationDiversity, type ChamberAlert
} from '../lib/echoChamberService.ts';

type TabId = 'active-chambers' | 'risk' | 'diversity';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'active-chambers', label: 'Active Chambers', icon: <Eye size={18} /> },
  { id: 'risk', label: 'Risk Assessment', icon: <AlertTriangle size={18} /> },
  { id: 'diversity', label: 'Information Diversity', icon: <BarChart3 size={18} /> },
];

const BIAS_COLORS: Record<string, string> = {
  extreme_bullish: '#10b981',
  extreme_bearish: '#ef4444',
  cult_following: '#8b5cf6',
  contrarian_extreme: '#f59e0b',
};

const RISK_COLORS: Record<string, string> = {
  price_manipulation: '#ef4444',
  information_asymmetry: '#f59e0b',
  groupthink: '#8b5cf6',
  pump_and_dump: '#ec4899',
  confirmation_bias: '#3b82f6',
};

const PIE_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];

export default function EchoChamberDetector() {
  const [activeTab, setActiveTab] = useState<TabId>('active-chambers');
  const chambers = getEchoChambers();
  const risks = getChamberRisks();
  const diversity = getInformationDiversity();
  const alerts = getChamberAlerts();
  const stats = getEchoChamberStats();

  const chamberChartData = chambers.map(c => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
    risk: c.riskScore,
    insularity: c.insularity,
    members: c.memberCount / 1000,
    leader: c.leaderInfluence,
  }));

  const riskByType = Object.entries(
    risks.reduce<Record<string, number>>((acc, r) => {
      const label = r.riskType.replace(/_/g, ' ');
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const diversityChartData = diversity.map(d => ({
    name: d.community.length > 15 ? d.community.slice(0, 15) + '...' : d.community,
    diversity: d.diversityScore,
    factCheck: d.factCheckRate,
    dissent: d.dissenterRatio,
    trend: d.improvementTrend,
  }));

  const healthData = diversity.map(d => ({
    name: d.community.length > 12 ? d.community.slice(0, 12) + '...' : d.community,
    diversity: d.diversityScore,
    sources: d.sourceCount / 5,
    dissent: d.dissenterRatio,
    factCheck: d.factCheckRate,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ShieldAlert className="text-red-400" size={32} />
            Echo Chamber Detector
          </h1>
          <p className="text-gray-400">Identify dangerous information echo chambers in collecting communities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Chambers</p>
            <p className="text-2xl font-bold text-red-400">{stats.totalChambers}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active/Growing</p>
            <p className="text-2xl font-bold text-orange-400">{stats.activeChambers}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Risk</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgRisk}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Affected Members</p>
            <p className="text-2xl font-bold text-purple-400">{(stats.totalAffected / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Critical Alerts</p>
            <p className="text-2xl font-bold text-red-400">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Diversity</p>
            <p className="text-2xl font-bold text-green-400">{stats.avgDiversity}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'active-chambers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Chamber Risk vs Insularity</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chamberChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="risk" fill="#ef4444" name="Risk Score" />
                    <Bar dataKey="insularity" fill="#f59e0b" name="Insularity" />
                    <Bar dataKey="leader" fill="#8b5cf6" name="Leader Influence" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-950/30 border-red-800' :
                      alert.severity === 'high' ? 'bg-orange-950/30 border-orange-800' :
                      'bg-yellow-950/30 border-yellow-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{alert.chamberName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          alert.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-1">{alert.message}</p>
                      <p className="text-xs text-green-400"><Info size={10} className="inline mr-1" />{alert.recommendedAction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chambers.map(c => (
                <div key={c.id} className={`bg-gray-900 rounded-xl p-4 border ${
                  c.riskScore >= 80 ? 'border-red-700' :
                  c.riskScore >= 60 ? 'border-orange-700' :
                  'border-gray-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BIAS_COLORS[c.biasDirection] }} />
                      <h4 className="font-bold">{c.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        c.status === 'growing' ? 'bg-red-900/50 text-red-400' :
                        c.status === 'active' ? 'bg-yellow-900/50 text-yellow-400' :
                        c.status === 'declining' ? 'bg-green-900/50 text-green-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{c.dominantNarrative}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Platform:</span> <span className="text-white">{c.platform}</span></div>
                    <div><span className="text-gray-500">Members:</span> <span className="text-blue-400">{c.memberCount.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Risk:</span> <span className={c.riskScore >= 80 ? 'text-red-400 font-bold' : c.riskScore >= 60 ? 'text-orange-400' : 'text-yellow-400'}>{c.riskScore}</span></div>
                    <div><span className="text-gray-500">Insularity:</span> <span className="text-purple-400">{c.insularity}%</span></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.affectedCards.map((card, i) => (
                      <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded">{card}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Risk Type Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={riskByType} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {riskByType.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Risk Severity by Chamber</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={risks.map(r => ({
                    name: chambers.find(c => c.id === r.chamberId)?.name.slice(0, 12) || r.chamberId,
                    severity: r.severity,
                    likelihood: r.likelihood,
                    loss: r.potentialLoss / 100000,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="severity" fill="#ef4444" name="Severity" />
                    <Bar dataKey="likelihood" fill="#f59e0b" name="Likelihood %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risks.map(r => {
                const chamber = chambers.find(c => c.id === r.chamberId);
                return (
                  <div key={r.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{chamber?.name || 'Unknown'}</h4>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${RISK_COLORS[r.riskType]}20`, color: RISK_COLORS[r.riskType] }}>
                        {r.riskType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div><span className="text-gray-500">Severity:</span> <span className="text-red-400 font-bold">{r.severity}</span></div>
                      <div><span className="text-gray-500">Likelihood:</span> <span className="text-orange-400">{r.likelihood}%</span></div>
                      <div><span className="text-gray-500">Loss:</span> <span className="text-yellow-400">${(r.potentialLoss / 1000000).toFixed(1)}M</span></div>
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-xs text-green-400"><AlertCircle size={12} className="inline mr-1" />{r.mitigationStrategy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'diversity' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Information Diversity Scores</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={diversityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="diversity" fill="#10b981" name="Diversity Score" />
                  <Bar dataKey="factCheck" fill="#3b82f6" name="Fact Check Rate %" />
                  <Bar dataKey="dissent" fill="#f59e0b" name="Dissenter Ratio %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Community Health Radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={healthData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Diversity" dataKey="diversity" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="Sources" dataKey="sources" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="Fact Checking" dataKey="factCheck" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diversity.map(d => (
                <div key={d.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{d.community}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      d.healthRating === 'healthy' ? 'bg-green-900/50 text-green-400' :
                      d.healthRating === 'moderate' ? 'bg-yellow-900/50 text-yellow-400' :
                      d.healthRating === 'concerning' ? 'bg-orange-900/50 text-orange-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {d.healthRating.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div><span className="text-gray-500">Diversity:</span> <span className="text-green-400">{d.diversityScore}</span></div>
                    <div><span className="text-gray-500">Sources:</span> <span className="text-blue-400">{d.sourceCount}</span></div>
                    <div><span className="text-gray-500">Dissent:</span> <span className="text-yellow-400">{d.dissenterRatio}%</span></div>
                    <div><span className="text-gray-500">Fact Check:</span> <span className="text-purple-400">{d.factCheckRate}%</span></div>
                    <div><span className="text-gray-500">Trend:</span> <span className={d.improvementTrend > 0 ? 'text-green-400' : 'text-red-400'}>{d.improvementTrend > 0 ? '+' : ''}{d.improvementTrend}%</span></div>
                    <div><span className="text-gray-500">Platform:</span> <span className="text-gray-300">{d.platform}</span></div>
                  </div>
                  <p className="text-xs text-gray-400 italic">Bearish response: {d.avgResponseToBearishView}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
