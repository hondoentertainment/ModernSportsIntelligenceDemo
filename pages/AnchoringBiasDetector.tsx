import React, { useState } from 'react';
import {
  Anchor,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  History,
  Settings,
  DollarSign,
  Target,
  Shield,
  ArrowRight,
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
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import {
  getAnchorEvents,
  getBiasScores,
  getCorrections,
  getAnchorHistory,
  getAnchorStats,
} from '../lib/anchoringBiasService.ts';

const TABS = ['Active Anchors', 'Bias History', 'Corrections', 'Settings'] as const;
type Tab = typeof TABS[number];

const severityColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/15 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  low: 'text-green-400 bg-green-500/15 border-green-500/30',
};

const CHART_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];

export default function AnchoringBiasDetector() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Anchors');
  const events = getAnchorEvents();
  const scores = getBiasScores();
  const corrections = getCorrections();
  const history = getAnchorHistory();
  const stats = getAnchorStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Anchor size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Anchoring Bias Detector</h1>
              <p className="text-gray-400 text-sm">Detect anchor prices distorting your card valuations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Anchor size={16} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Active Anchors</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeAnchors}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Critical</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.criticalAnchors}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Distortion</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.avgDistortion}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Savings</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">${stats.totalSavings.toLocaleString()}</p>
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
                  ? 'bg-gray-800 text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Anchors Tab */}
        {activeTab === 'Active Anchors' && (
          <div className="space-y-6">
            {/* Bias Scores by Category Chart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Bias Score by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={scores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="biasScore" name="Bias Score" radius={[4, 4, 0, 0]}>
                    {scores.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Anchor Events List */}
            <div className="space-y-3">
              {events.filter(e => e.status === 'active' || e.status === 'monitoring').map(event => (
                <div key={event.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{event.cardName}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{event.sport} | Source: {event.anchorSource}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${severityColor[event.severity]}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Anchor Price</p>
                      <p className="text-red-400 font-bold">${event.anchorPrice.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-600 mt-3" />
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Market Price</p>
                      <p className="text-green-400 font-bold">${event.currentMarketPrice.toLocaleString()}</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-gray-500 text-[10px] uppercase">Distortion</p>
                      <p className="text-orange-400 font-bold text-lg">{event.distortionPercent}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bias History Tab */}
        {activeTab === 'Bias History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Anchor Distortion Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="activeAnchors" name="Active Anchors" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="corrected" name="Corrected" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avgDistortion" name="Avg Distortion %" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Portfolio Impact from Anchoring</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${Math.abs(v).toLocaleString()}`, 'Impact']} />
                  <Bar dataKey="portfolioImpact" name="Portfolio Impact ($)" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Corrections Tab */}
        {activeTab === 'Corrections' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-green-500/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-green-400" />
                <h3 className="text-white font-semibold">Completed Corrections</h3>
              </div>
              <div className="space-y-4">
                {corrections.map(c => (
                  <div key={c.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">{c.cardName}</h4>
                      <span className="text-green-400 text-xs font-bold">${c.savingsRealized.toLocaleString()} saved</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3">Method: {c.method} | Corrected: {c.correctionDate}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Original Anchor</p>
                        <p className="text-red-400 font-bold line-through">${c.originalAnchor}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-600 mt-3" />
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Corrected Value</p>
                        <p className="text-green-400 font-bold">${c.correctedValue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase">Market Consensus</p>
                        <p className="text-blue-400 font-bold">${c.marketConsensus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'Settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={18} className="text-gray-400" />
                <h3 className="text-white font-semibold">Detection Settings</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Minimum Distortion Threshold', value: '25%', desc: 'Only flag anchors with distortion above this level' },
                  { label: 'Lookback Period', value: '24 months', desc: 'How far back to check for anchor-setting events' },
                  { label: 'Auto-Correction Mode', value: 'Suggest Only', desc: 'Whether corrections are applied automatically or suggested' },
                  { label: 'Alert Frequency', value: 'Real-time', desc: 'How often to check for new anchoring patterns' },
                  { label: 'Severity Weighting', value: 'Dollar-weighted', desc: 'Weight severity by dollar impact vs percentage distortion' },
                ].map((setting, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-medium">{setting.label}</h4>
                      <p className="text-gray-500 text-xs mt-0.5">{setting.desc}</p>
                    </div>
                    <span className="text-orange-400 font-semibold text-sm bg-orange-500/10 px-3 py-1.5 rounded-lg">{setting.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
