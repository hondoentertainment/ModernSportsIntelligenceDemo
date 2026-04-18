import React, { useState } from 'react';
import {
  Bot, AlertTriangle, Radar, Fingerprint, Activity, BarChart3,
  Bell, Shield, Clock, Search, Eye
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  getListingPatterns, getBotSignatures, getHFActivity, getDetectionAlerts,
  getConfirmedBotCount, getActivePatternCount, getAvgBotProbability, getUnacknowledgedAlerts
} from '../lib/hfListingDetectorService.ts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function HighFrequencyListingDetector() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'signatures' | 'analysis'>('alerts');
  const patterns = getListingPatterns();
  const signatures = getBotSignatures();
  const activity = getHFActivity();
  const alerts = getDetectionAlerts();
  const confirmedBots = getConfirmedBotCount();
  const activePatterns = getActivePatternCount();
  const avgProbability = getAvgBotProbability();
  const unackAlerts = getUnacknowledgedAlerts();

  const tabs = [
    { key: 'alerts' as const, label: 'Active Alerts', icon: <Bell size={16} /> },
    { key: 'signatures' as const, label: 'Bot Signatures', icon: <Fingerprint size={16} /> },
    { key: 'analysis' as const, label: 'Pattern Analysis', icon: <BarChart3 size={16} /> },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed-bot': return 'text-red-400 bg-red-400/10';
      case 'flagged': return 'text-orange-400 bg-orange-400/10';
      case 'active': return 'text-yellow-400 bg-yellow-400/10';
      case 'cleared': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Bot size={28} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">High-Frequency Listing Detector</h1>
            <p className="text-sm text-gray-400">Bot-driven listing pattern detection across marketplaces</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Confirmed Bots</span>
              <Bot size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{confirmedBots}</p>
            <p className="text-xs text-gray-500 mt-1">Verified automated operations</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Patterns</span>
              <Radar size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{activePatterns}</p>
            <p className="text-xs text-gray-500 mt-1">Under investigation</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Bot Probability</span>
              <Activity size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{avgProbability}%</p>
            <p className="text-xs text-gray-500 mt-1">Across detected patterns</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending Alerts</span>
              <Bell size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{unackAlerts}</p>
            <p className="text-xs text-gray-500 mt-1">Need acknowledgement</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Listing Activity by Hour (Normal vs Suspicious)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="normalListings" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Normal Listings" />
                  <Area type="monotone" dataKey="suspiciousListings" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Suspicious" />
                  <Area type="monotone" dataKey="confirmedBots" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Confirmed Bots" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {alerts.map(a => (
                <div key={a.id} className={`bg-gray-900 border rounded-xl p-4 ${a.acknowledged ? 'border-gray-800' : 'border-yellow-600/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${severityColor(a.severity)}`}>{a.severity}</span>
                      <span className="text-sm text-gray-400">{a.venue}</span>
                      <span className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                    {!a.acknowledged && <span className="text-xs text-yellow-400 font-medium">NEW</span>}
                  </div>
                  <p className="text-sm text-gray-200">{a.message}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Detected Patterns</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left py-3 px-2">Pattern</th>
                      <th className="text-left py-3 px-2">Venue</th>
                      <th className="text-right py-3 px-2">Listings/Min</th>
                      <th className="text-right py-3 px-2">Bot Prob</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.map(p => (
                      <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2">
                          <p className="font-medium text-gray-200">{p.patternName}</p>
                          <p className="text-xs text-gray-500">{p.category}</p>
                        </td>
                        <td className="py-3 px-2 text-gray-400">{p.venue}</td>
                        <td className="py-3 px-2 text-right text-orange-400 font-mono">{p.listingsPerMinute}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={p.botProbability >= 85 ? 'text-red-400' : p.botProbability >= 65 ? 'text-orange-400' : 'text-yellow-400'}>{p.botProbability}%</span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusColor(p.status)}`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signatures' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Bot Signature Detection Rates</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signatures}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="signatureName" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="detectionRate" fill="#10b981" name="Detection Rate %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="falsePositiveRate" fill="#ef4444" name="False Positive %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signatures.map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint size={18} className="text-purple-400" />
                    <h4 className="font-semibold text-gray-200">{s.signatureName}</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{s.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Frequency</p>
                      <p className="text-gray-200">{s.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Timing</p>
                      <p className="text-gray-200">{s.timingPattern}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Detection Rate</p>
                      <p className="text-green-400 font-medium">{s.detectionRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">False Positive</p>
                      <p className="text-red-400 font-medium">{s.falsePositiveRate}%</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Identifiers: {s.identifiers.join(' | ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Bot Probability by Pattern</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patterns.sort((a, b) => b.botProbability - a.botProbability)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="patternName" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="botProbability" name="Bot Probability %" radius={[4, 4, 0, 0]}>
                      {patterns.map((p, idx) => (
                        <Cell key={idx} fill={p.botProbability >= 85 ? '#ef4444' : p.botProbability >= 70 ? '#f97316' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Listings per Minute vs Suspicion Score</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={patterns.sort((a, b) => a.listingsPerMinute - b.listingsPerMinute)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="patternName" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="listingsPerMinute" stroke="#f59e0b" strokeWidth={2} name="Listings/Min" />
                    <Line type="monotone" dataKey="suspicionScore" stroke="#ef4444" strokeWidth={2} name="Suspicion Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Bot vs Normal Activity Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Normal', value: activity.reduce((sum, a) => sum + a.normalListings, 0) },
                      { name: 'Suspicious', value: activity.reduce((sum, a) => sum + a.suspiciousListings, 0) },
                      { name: 'Confirmed Bot', value: activity.reduce((sum, a) => sum + a.confirmedBots, 0) },
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value.toLocaleString()}`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
