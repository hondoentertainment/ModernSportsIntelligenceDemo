import React, { useState } from 'react';
import {
  Zap, PlayCircle, Clock, TrendingDown, AlertTriangle, BarChart3,
  ArrowUpRight, BookOpen, RefreshCw, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  getCrashEvents, getCrashTimelines, getCrashMetrics, getRecoveryPaths,
  getWorstCrash, getTotalValueLost
} from '../lib/flashCrashReplayService.ts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];
const SEVERITY_COLORS: Record<string, string> = {
  catastrophic: '#ef4444',
  severe: '#f97316',
  moderate: '#f59e0b',
  minor: '#10b981',
};

export default function FlashCrashReplayEngine() {
  const [activeTab, setActiveTab] = useState<'library' | 'replay' | 'recovery'>('library');
  const [selectedCrashId, setSelectedCrashId] = useState('crash-3');
  const crashes = getCrashEvents();
  const worstCrash = getWorstCrash();
  const totalLost = getTotalValueLost();
  const selectedTimeline = getCrashTimelines(selectedCrashId);
  const selectedMetrics = getCrashMetrics(selectedCrashId);
  const selectedRecovery = getRecoveryPaths(selectedCrashId);
  const selectedCrash = crashes.find(c => c.id === selectedCrashId);

  const tabs = [
    { key: 'library' as const, label: 'Crash Library', icon: <BookOpen size={16} /> },
    { key: 'replay' as const, label: 'Replay Viewer', icon: <PlayCircle size={16} /> },
    { key: 'recovery' as const, label: 'Recovery Analysis', icon: <RefreshCw size={16} /> },
  ];

  const severityPieData = crashes.reduce((acc, c) => {
    const existing = acc.find(a => a.name === c.severity);
    if (existing) existing.value++;
    else acc.push({ name: c.severity, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <Zap size={28} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Flash Crash Replay Engine</h1>
            <p className="text-sm text-gray-400">Study historical hobby market crashes with play-by-play replay</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Crashes Studied</span>
              <BookOpen size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{crashes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Historical crash events in library</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Worst Decline</span>
              <TrendingDown size={18} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{worstCrash.peakDecline}%</p>
            <p className="text-xs text-gray-500 mt-1">{worstCrash.name}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Value Lost</span>
              <DollarSign size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">${(totalLost / 1000000000).toFixed(1)}B</p>
            <p className="text-xs text-gray-500 mt-1">Across all crash events</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg Recovery</span>
              <RefreshCw size={18} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">10 mo</p>
            <p className="text-xs text-gray-500 mt-1">Average time to recover</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Crash Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={severityPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}>
                      {severityPieData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Peak Decline by Event</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={crashes.map(c => ({ name: c.name.split(' ').slice(0, 2).join(' '), decline: Math.abs(c.peakDecline), value: c.totalValueLost / 1000000000 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Bar dataKey="decline" fill="#ef4444" radius={[4, 4, 0, 0]} name="Peak Decline %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {crashes.map(c => (
                <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors cursor-pointer" onClick={() => { setSelectedCrashId(c.id); setActiveTab('replay'); }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-200">{c.name}</span>
                      <span className="px-2 py-1 rounded-full text-xs" style={{ color: SEVERITY_COLORS[c.severity], backgroundColor: SEVERITY_COLORS[c.severity] + '20' }}>{c.severity}</span>
                    </div>
                    <span className="text-red-400 font-bold text-lg">{c.peakDecline}%</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{c.description}</p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>{c.startDate} to {c.endDate}</span>
                    <span>Recovery: {c.recoveryTime}</span>
                    <span>Value Lost: ${(c.totalValueLost / 1000000000).toFixed(1)}B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'replay' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle size={20} className="text-orange-400" />
                <select
                  className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={selectedCrashId}
                  onChange={e => setSelectedCrashId(e.target.value)}
                >
                  {crashes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {selectedCrash && (
                  <span className="text-sm text-gray-400">Peak: {selectedCrash.peakDecline}% | Recovery: {selectedCrash.recoveryTime}</span>
                )}
              </div>
            </div>

            {selectedTimeline.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Price Index Replay</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={selectedTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9ca3af" domain={[0, 120]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Area type="monotone" dataKey="priceIndex" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Price Index" strokeWidth={2} />
                    <Area type="monotone" dataKey="sentiment" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Sentiment" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedTimeline.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Event Timeline</h3>
                <div className="space-y-3">
                  {selectedTimeline.map((t, idx) => (
                    <div key={t.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-800/30">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">{idx + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-200">{t.label}</span>
                          <span className="text-sm text-gray-500">{t.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{t.event}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Price: <span className={t.priceIndex < 70 ? 'text-red-400' : 'text-gray-300'}>{t.priceIndex}</span></span>
                          <span>Volume: <span className="text-blue-400">{t.volumeIndex}</span></span>
                          <span>Sentiment: <span className={t.sentiment < 30 ? 'text-red-400' : 'text-green-400'}>{t.sentiment}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <select
                className="bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm"
                value={selectedCrashId}
                onChange={e => setSelectedCrashId(e.target.value)}
              >
                {crashes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {selectedRecovery.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Recovery Path</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={selectedRecovery}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" label={{ value: 'Months After Bottom', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" domain={[0, 120]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="priceRecovery" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Price Recovery %" />
                    <Line type="monotone" dataKey="volumeRecovery" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Volume Recovery %" />
                    <Line type="monotone" dataKey="sentimentRecovery" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Sentiment Recovery %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {selectedMetrics.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Crash Metrics Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="metric" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="preCrash" fill="#3b82f6" name="Pre-Crash" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="atBottom" fill="#ef4444" name="At Bottom" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="postRecovery" fill="#10b981" name="Post-Recovery" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
