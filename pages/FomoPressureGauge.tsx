import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  ThermometerSun,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  getFomoSignals,
  getPressureReadings,
  getFomoTriggers,
  getFomoHistory,
  getFomoStats,
} from '../lib/fomoPressureService.ts';

const TABS = ['Live Pressure', 'Trend History', 'Trigger Analysis'] as const;
type Tab = typeof TABS[number];

function intensityColor(intensity: number): string {
  if (intensity >= 90) return 'text-red-400';
  if (intensity >= 75) return 'text-orange-400';
  if (intensity >= 60) return 'text-yellow-400';
  return 'text-green-400';
}

function intensityBg(intensity: number): string {
  if (intensity >= 90) return 'bg-red-500/15 border-red-500/30';
  if (intensity >= 75) return 'bg-orange-500/15 border-orange-500/30';
  if (intensity >= 60) return 'bg-yellow-500/15 border-yellow-500/30';
  return 'bg-green-500/15 border-green-500/30';
}

export default function FomoPressureGauge() {
  const [activeTab, setActiveTab] = useState<Tab>('Live Pressure');
  const signals = getFomoSignals();
  const readings = getPressureReadings();
  const triggers = getFomoTriggers();
  const history = getFomoHistory();
  const stats = getFomoStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Flame size={22} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FOMO Pressure Gauge</h1>
              <p className="text-gray-400 text-sm">Real-time fear-of-missing-out intensity scoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-red-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Active Signals</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeSignals}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Extreme</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">{stats.extremeSignals}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Intensity</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">{stats.avgIntensity}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Saved by Waiting</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">${stats.totalSaved.toLocaleString()}</p>
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
                  ? 'bg-gray-800 text-red-400 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Live Pressure Tab */}
        {activeTab === 'Live Pressure' && (
          <div className="space-y-6">
            {/* Pressure Over Time Chart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">FOMO Pressure Timeline (Today)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={readings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="timestamp" stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.split('T')[1]?.slice(0, 5) || v} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="overallPressure" name="Overall" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="basketballPressure" name="Basketball" stroke="#fb923c" fill="#fb923c" fillOpacity={0.1} strokeWidth={1.5} />
                  <Area type="monotone" dataKey="footballPressure" name="Football" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={1.5} />
                  <Area type="monotone" dataKey="baseballPressure" name="Baseball" stroke="#4ade80" fill="#4ade80" fillOpacity={0.1} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Active FOMO Signals */}
            <div className="space-y-3">
              {signals.filter(s => s.status === 'active').map(signal => (
                <div key={signal.id} className={`bg-gray-900 rounded-xl border p-5 ${intensityBg(signal.intensity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{signal.cardName}</h4>
                      <p className="text-gray-500 text-xs">{signal.sport} | Trigger: {signal.triggerType}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${intensityColor(signal.intensity)}`}>{signal.intensity}</p>
                      <p className="text-gray-500 text-[10px] uppercase">Intensity</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mb-2">
                    <span>Price 24h: <span className="text-red-400">+{signal.priceChange24h}%</span></span>
                    <span>Volume: <span className="text-orange-400">+{signal.volumeSpike}%</span></span>
                    <span>Social: <span className="text-blue-400">{signal.socialMentions.toLocaleString()}</span></span>
                  </div>
                  <p className="text-sm text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2 mt-2">{signal.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend History Tab */}
        {activeTab === 'Trend History' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Monthly FOMO Activity</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="totalSignals" name="Total Signals" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avgIntensity" name="Avg Intensity" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="regretRate" name="Regret Rate %" stroke="#facc15" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Savings from Resisting FOMO</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Savings']} />
                  <Bar dataKey="savingsFromIgnoring" name="Savings ($)" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trigger Analysis Tab */}
        {activeTab === 'Trigger Analysis' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Trigger Intensity vs False Positive Rate</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={triggers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="triggerName" type="category" stroke="#9ca3af" tick={{ fontSize: 11 }} width={150} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgIntensity" name="Avg Intensity" fill="#f87171" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="falsePositiveRate" name="False Positive %" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {triggers.map(trigger => (
                <div key={trigger.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{trigger.triggerName}</h4>
                    <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded">{trigger.category}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{trigger.description}</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 uppercase">Frequency</p>
                      <p className="text-white font-bold">{trigger.frequency}/mo</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase">Duration</p>
                      <p className="text-white font-bold">{trigger.avgDuration}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 uppercase">False +</p>
                      <p className={`font-bold ${trigger.falsePositiveRate > 60 ? 'text-red-400' : 'text-yellow-400'}`}>{trigger.falsePositiveRate}%</p>
                    </div>
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
