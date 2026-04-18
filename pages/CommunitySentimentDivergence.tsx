import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  GitPullRequest, AlertTriangle, TrendingUp, TrendingDown, History,
  Bell, Activity, ArrowUpDown
} from 'lucide-react';
import {
  getDivergenceSignals, getSentimentVsPrice, getDivergenceHistory,
  getDivergenceAlerts, getDivergenceStats,
  type DivergenceSignal, type SentimentVsPrice as SVP, type DivergenceAlert
} from '../lib/communityDivergenceService.ts';

type TabId = 'active' | 'sentiment-price' | 'alert-history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'active', label: 'Active Divergences', icon: <Activity size={18} /> },
  { id: 'sentiment-price', label: 'Sentiment vs Price', icon: <ArrowUpDown size={18} /> },
  { id: 'alert-history', label: 'Alert History', icon: <History size={18} /> },
];

export default function CommunitySentimentDivergence() {
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const divergences = getDivergenceSignals();
  const sentimentData = getSentimentVsPrice();
  const historyData = getDivergenceHistory();
  const alerts = getDivergenceAlerts();
  const stats = getDivergenceStats();

  const activeDiv = divergences.filter(d => d.status === 'active');

  const divergenceChartData = activeDiv.map(d => ({
    name: d.playerName,
    sentiment: d.sentimentScore,
    priceTrend: d.priceTrend,
    gap: d.divergenceGap,
    confidence: d.confidence,
  }));

  const lukaData = sentimentData.filter(s => s.cardName.includes('Luka'));
  const troutData = sentimentData.filter(s => s.cardName.includes('Trout'));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GitPullRequest className="text-emerald-400" size={32} />
            Community Sentiment Divergence
          </h1>
          <p className="text-gray-400">Detect when community sentiment diverges from actual price action</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Signals</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.activeSignals}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Bullish Div</p>
            <p className="text-2xl font-bold text-green-400">{stats.bullishDiv}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Bearish Div</p>
            <p className="text-2xl font-bold text-red-400">{stats.bearishDiv}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Gap</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgGap}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Critical Alerts</p>
            <p className="text-2xl font-bold text-orange-400">{stats.criticalAlerts}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Confidence</p>
            <p className="text-2xl font-bold text-blue-400">{stats.avgConfidence}%</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'active' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Active Divergence Map</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={divergenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="sentiment" fill="#10b981" name="Sentiment Score" />
                  <Bar dataKey="gap" fill="#f59e0b" name="Divergence Gap" />
                  <Bar dataKey="confidence" fill="#3b82f6" name="Confidence" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDiv.map(d => (
                <div key={d.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{d.playerName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      d.divergenceType === 'bullish_divergence' ? 'bg-green-900/50 text-green-400' :
                      d.divergenceType === 'bearish_divergence' ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {d.divergenceType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{d.cardName}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Sentiment:</span>
                      <span className="text-emerald-400 font-bold">{d.sentimentScore}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Price:</span>
                      {d.priceDirection === 'up' ? <TrendingUp size={14} className="text-green-400" /> : d.priceDirection === 'down' ? <TrendingDown size={14} className="text-red-400" /> : <span className="text-gray-400">~</span>}
                      <span className={d.priceTrend > 0 ? 'text-green-400' : 'text-red-400'}>{d.priceTrend > 0 ? '+' : ''}{d.priceTrend}%</span>
                    </div>
                    <div><span className="text-gray-500">Gap:</span> <span className="text-yellow-400 font-bold">{d.divergenceGap}</span></div>
                    <div><span className="text-gray-500">Confidence:</span> <span className="text-blue-400">{d.confidence}%</span></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${d.sentimentScore}%` }} />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${d.priceTrend > 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(d.priceTrend) * 3, 100)}%` }} />
                    </div>
                  </div>
                  <div className="mt-1 flex text-xs text-gray-500">
                    <span className="flex-1">Sentiment</span>
                    <span className="flex-1">Price</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sentiment-price' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Luka Doncic - Sentiment vs Price Change</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lukaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Line yAxisId="left" dataKey="sentimentScore" stroke="#10b981" name="Sentiment Score" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" dataKey="priceChange" stroke="#8b5cf6" name="Price Change %" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" dataKey="correlation" stroke="#f59e0b" name="Correlation" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Mike Trout - Sentiment vs Price Change</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={troutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="sentimentScore" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Sentiment Score" />
                  <Area type="monotone" dataKey="priceChange" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Price Change %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Historical Divergence Resolutions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historyData.map(h => ({
                  name: h.cardName.length > 18 ? h.cardName.slice(0, 18) + '...' : h.cardName,
                  gap: h.gapAtPeak,
                  profit: h.profitOpportunity,
                  duration: h.durationDays / 3,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="gap" fill="#f59e0b" name="Peak Gap" />
                  <Bar dataKey="profit" fill="#10b981" name="Profit Opportunity %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'alert-history' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-950/30 border-red-800' :
                    alert.severity === 'high' ? 'bg-orange-950/30 border-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-950/30 border-yellow-800' :
                    'bg-blue-950/30 border-blue-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className={
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'high' ? 'text-orange-400' :
                        alert.severity === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      } />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{alert.cardName}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            alert.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                            alert.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                            alert.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-blue-900/50 text-blue-400'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-xs text-emerald-400"><Bell size={12} className="inline mr-1" /> {alert.actionSuggestion}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{alert.alertType.replace(/_/g, ' ')} - {new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyData.map(h => (
                <div key={h.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h4 className="font-semibold text-sm mb-2">{h.cardName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Type:</span> <span className={h.divergenceType.includes('bullish') ? 'text-green-400' : 'text-red-400'}>{h.divergenceType.replace(/_/g, ' ')}</span></div>
                    <div><span className="text-gray-500">Peak Gap:</span> <span className="text-yellow-400">{h.gapAtPeak}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="text-blue-400">{h.durationDays}d</span></div>
                    <div><span className="text-gray-500">Profit Opp:</span> <span className={h.profitOpportunity > 0 ? 'text-green-400' : 'text-red-400'}>{h.profitOpportunity > 0 ? '+' : ''}{h.profitOpportunity}%</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Resolution:</span> <span className="text-emerald-400">{h.resolution.replace(/_/g, ' ')}</span></div>
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
