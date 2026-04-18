import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  BookOpen,
  Shield,
  Eye,
  Filter,
  BarChart3,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getBiasPatterns,
  getSourceDiversity,
  getConfirmationAlerts,
  getResearchAudits,
  getConfirmationBiasStats,
} from '../lib/confirmationBiasService.ts';

const TABS = ['Active Alerts', 'Source Analysis', 'Research Audit'] as const;
type Tab = typeof TABS[number];

const severityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  low: 'text-green-400 bg-green-500/15 border-green-500/30',
};

const biasTypeLabels: Record<string, string> = {
  'cherry-picking': 'Cherry Picking',
  'echo-chamber': 'Echo Chamber',
  'selective-recall': 'Selective Recall',
  'motivated-reasoning': 'Motivated Reasoning',
  'anchoring-search': 'Anchoring Search',
};

const CHART_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];

export default function ConfirmationBiasScanner() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Alerts');
  const patterns = getBiasPatterns();
  const sources = getSourceDiversity();
  const alerts = getConfirmationAlerts();
  const audits = getResearchAudits();
  const stats = getConfirmationBiasStats();

  const sourceChartData = sources.map(s => ({
    name: s.sourceType,
    usage: s.usage,
    reliability: s.reliability,
  }));

  const biasDistribution = [
    { name: 'Echo Chamber', value: patterns.filter(p => p.biasType === 'echo-chamber').length },
    { name: 'Cherry Picking', value: patterns.filter(p => p.biasType === 'cherry-picking').length },
    { name: 'Selective Recall', value: patterns.filter(p => p.biasType === 'selective-recall').length },
    { name: 'Motivated Reasoning', value: patterns.filter(p => p.biasType === 'motivated-reasoning').length },
    { name: 'Anchoring Search', value: patterns.filter(p => p.biasType === 'anchoring-search').length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Search size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Confirmation Bias Scanner</h1>
              <p className="text-gray-400 text-sm">Detect selective information consumption in your research</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-cyan-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Active Patterns</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activePatterns}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Diversity Score</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.avgDiversityScore}/100</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Critical Alerts</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Biased Sessions</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">{stats.biasedSessionRate}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Alerts Tab */}
        {activeTab === 'Active Alerts' && (
          <div className="space-y-6">
            {/* Alerts */}
            <div className="space-y-3">
              {alerts.filter(a => !a.acknowledged).map(alert => (
                <div key={alert.id} className={`bg-gray-900 rounded-xl border p-5 ${severityColors[alert.severity]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className={alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
                      <span className="text-white font-semibold text-sm">{alert.alertType}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${severityColors[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{alert.cardName}</p>
                  <p className="text-gray-400 text-sm mb-3">{alert.message}</p>
                  <div className="bg-cyan-500/10 rounded-lg px-3 py-2">
                    <p className="text-cyan-300 text-xs"><span className="font-semibold">Suggested:</span> {alert.suggestedAction}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bias Pattern Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Bias Type Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={biasDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {biasDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-white font-semibold mb-4">Pattern Severity</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={patterns.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="patternName" type="category" stroke="#9ca3af" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Bar dataKey="severity" name="Severity" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Patterns */}
            <div className="space-y-3">
              {patterns.filter(p => p.status === 'active').map(pattern => (
                <div key={pattern.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{pattern.patternName}</h4>
                      <p className="text-gray-500 text-xs">{pattern.cardOrCategory} | {biasTypeLabels[pattern.biasType]}</p>
                    </div>
                    <span className="text-cyan-400 font-bold">Severity: {pattern.severity}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{pattern.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Sources: <span className="text-white">{pattern.sourcesConsulted}</span></span>
                    <span>Agreeing: <span className="text-red-400">{pattern.sourcesAgreeing}</span></span>
                    <span>Diversity: <span className="text-yellow-400">{pattern.diversityScore}/100</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Analysis Tab */}
        {activeTab === 'Source Analysis' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Source Usage vs Reliability</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sourceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="usage" name="Usage %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reliability" name="Reliability %" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {sources.map((source, i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{source.sourceType}</h4>
                      <p className="text-gray-500 text-xs">{source.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      source.biasDirection === 'bullish' ? 'text-green-400 bg-green-500/15' :
                      source.biasDirection === 'bearish' ? 'text-red-400 bg-red-500/15' :
                      'text-gray-400 bg-gray-500/15'
                    }`}>
                      {source.biasDirection.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Usage</p>
                      <p className="text-white font-bold">{source.usage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Reliability</p>
                      <p className={`font-bold ${source.reliability >= 70 ? 'text-green-400' : source.reliability >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {source.reliability}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Avg Consult/Mo</p>
                      <p className="text-white font-bold">{source.avgConsultFreq}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Audit Tab */}
        {activeTab === 'Research Audit' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Source Balance Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={audits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="bullishSourcePct" name="Bullish %" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} stackId="1" />
                  <Area type="monotone" dataKey="neutralSourcePct" name="Neutral %" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} stackId="1" />
                  <Area type="monotone" dataKey="bearishSourcePct" name="Bearish %" stroke="#f87171" fill="#f87171" fillOpacity={0.2} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Diversity Score Improvement</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={audits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgDiversityScore" name="Diversity Score" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="improvementPct" name="Improvement %" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
