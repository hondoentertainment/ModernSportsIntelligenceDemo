import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Brain, Target, BarChart3, Award, User, TrendingUp,
  CheckCircle, Users, Zap
} from 'lucide-react';
import {
  getCrowdPredictions, getAggregationResults, getParticipantWeights,
  getPredictionAccuracy, getCollectiveIntelligenceStats,
  type CrowdPrediction, type AggregationResult, type ParticipantWeight
} from '../lib/collectiveIntelligenceService.ts';

type TabId = 'predictions' | 'aggregation' | 'accuracy' | 'my-predictions';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'predictions', label: 'Predictions', icon: <Target size={18} /> },
  { id: 'aggregation', label: 'Aggregation Results', icon: <BarChart3 size={18} /> },
  { id: 'accuracy', label: 'Accuracy Leaderboard', icon: <Award size={18} /> },
  { id: 'my-predictions', label: 'My Predictions', icon: <User size={18} /> },
];

const TIER_COLORS: Record<string, string> = {
  platinum: '#a78bfa',
  gold: '#f59e0b',
  silver: '#9ca3af',
  bronze: '#cd7f32',
  novice: '#6b7280',
};

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function CollectiveIntelligenceAggregator() {
  const [activeTab, setActiveTab] = useState<TabId>('predictions');
  const predictions = getCrowdPredictions();
  const aggregations = getAggregationResults();
  const participants = getParticipantWeights();
  const accuracy = getPredictionAccuracy();
  const stats = getCollectiveIntelligenceStats();

  const openPredictions = predictions.filter(p => p.status === 'open');
  const closedPredictions = predictions.filter(p => p.status === 'closed');

  const directionData = [
    { name: 'Bullish (Up)', value: predictions.filter(p => p.crowdDirection === 'up').length, color: '#10b981' },
    { name: 'Bearish (Down)', value: predictions.filter(p => p.crowdDirection === 'down').length, color: '#ef4444' },
    { name: 'Flat', value: predictions.filter(p => p.crowdDirection === 'flat').length, color: '#f59e0b' },
  ];

  const predictionChartData = openPredictions.slice(0, 8).map(p => ({
    name: p.playerName,
    current: p.currentPrice > 1000 ? p.currentPrice / 100 : p.currentPrice,
    predicted: p.crowdPredictedPrice > 1000 ? p.crowdPredictedPrice / 100 : p.crowdPredictedPrice,
    confidence: p.confidenceLevel,
    participants: p.participantCount / 100,
  }));

  const accuracyChartData = accuracy.map(a => ({
    name: a.timeframe,
    within5: a.accurateWithin5Pct,
    within10: a.accurateWithin10Pct,
    within20: a.accurateWithin20Pct,
    avgError: a.avgError,
    crowdVsExpert: a.crowdVsExpertWinRate,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="text-violet-400" size={32} />
            Collective Intelligence Aggregator
          </h1>
          <p className="text-gray-400">Wisdom of crowds aggregation for card price predictions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Open Predictions</p>
            <p className="text-2xl font-bold text-violet-400">{stats.openPredictions}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Total Participants</p>
            <p className="text-2xl font-bold text-blue-400">{(stats.totalParticipants / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Avg Confidence</p>
            <p className="text-2xl font-bold text-green-400">{stats.avgConfidence}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Bullish %</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.bullishPct}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Avg Accuracy (10%)</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.avgAccuracy}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-gray-400 text-sm">Top Predictor</p>
            <p className="text-2xl font-bold text-purple-400 text-sm">{stats.topPredictor}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Current vs Predicted Prices</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={predictionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="current" fill="#3b82f6" name="Current Price" />
                    <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted Price" />
                    <Bar dataKey="confidence" fill="#10b981" name="Confidence %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4">Crowd Direction</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={directionData} cx="50%" cy="50%" outerRadius={110} innerRadius={55} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {directionData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openPredictions.map(p => (
                <div key={p.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-violet-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{p.category}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      p.crowdDirection === 'up' ? 'bg-green-900/50 text-green-400' :
                      p.crowdDirection === 'down' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {p.crowdDirection === 'up' ? 'BULLISH' : p.crowdDirection === 'down' ? 'BEARISH' : 'FLAT'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{p.playerName}</h4>
                  <p className="text-xs text-gray-500 mb-3">{p.cardName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Current:</span> <span className="text-white">${p.currentPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Predicted:</span> <span className="text-violet-400">${p.crowdPredictedPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Confidence:</span> <span className="text-green-400">{p.confidenceLevel}%</span></div>
                    <div><span className="text-gray-500">Voters:</span> <span className="text-blue-400">{p.participantCount.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Target: {p.targetDate}</span>
                    <span>Spread: ${p.spread.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'aggregation' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Aggregation Method Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={aggregations.filter(a => a.actualPrice !== null).map(a => ({
                  name: `${a.cardName.slice(0, 15)} (${a.method.replace(/_/g, ' ').slice(0, 8)})`,
                  predicted: a.predictedPrice,
                  actual: a.actualPrice,
                  accuracy: a.accuracy,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted ($)" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual ($)" />
                  <Bar dataKey="accuracy" fill="#f59e0b" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aggregations.map(a => (
                <div key={a.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{a.cardName}</h4>
                    <span className="bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded text-xs">{a.method.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Predicted:</span> <span className="text-violet-400">${a.predictedPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Actual:</span> <span className="text-white">{a.actualPrice ? `$${a.actualPrice.toLocaleString()}` : 'Pending'}</span></div>
                    <div><span className="text-gray-500">Accuracy:</span> <span className={a.accuracy && a.accuracy >= 85 ? 'text-green-400' : a.accuracy ? 'text-yellow-400' : 'text-gray-500'}>{a.accuracy ? `${a.accuracy}%` : 'TBD'}</span></div>
                    <div><span className="text-gray-500">Voters:</span> <span className="text-blue-400">{a.participantCount.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Band: ${a.confidenceBand.low.toLocaleString()} - ${a.confidenceBand.high.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Prediction Accuracy Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={accuracyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Line dataKey="within5" stroke="#10b981" name="Within 5%" strokeWidth={2} dot={{ r: 4 }} />
                  <Line dataKey="within10" stroke="#3b82f6" name="Within 10%" strokeWidth={2} dot={{ r: 4 }} />
                  <Line dataKey="within20" stroke="#8b5cf6" name="Within 20%" strokeWidth={2} dot={{ r: 4 }} />
                  <Line dataKey="crowdVsExpert" stroke="#f59e0b" name="Crowd vs Expert Win %" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Top Predictor Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">Rank</th>
                      <th className="text-left py-3 px-2">Username</th>
                      <th className="text-left py-3 px-2">Tier</th>
                      <th className="text-right py-3 px-2">Accuracy</th>
                      <th className="text-right py-3 px-2">Win Rate</th>
                      <th className="text-right py-3 px-2">Avg Error</th>
                      <th className="text-right py-3 px-2">Weight</th>
                      <th className="text-right py-3 px-2">Streak</th>
                      <th className="text-left py-3 px-2">Specialty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.sort((a, b) => b.accuracyScore - a.accuracyScore).map((p, i) => (
                      <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            i === 0 ? 'bg-yellow-900/50 text-yellow-400' :
                            i === 1 ? 'bg-gray-700 text-gray-300' :
                            i === 2 ? 'bg-orange-900/50 text-orange-400' :
                            'bg-slate-800 text-gray-500'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-medium">{p.username}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: `${TIER_COLORS[p.tier]}20`, color: TIER_COLORS[p.tier] }}>
                            {p.tier}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-green-400">{p.accuracyScore}</td>
                        <td className="py-3 px-2 text-right text-blue-400">{p.winRate}%</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{p.avgError}%</td>
                        <td className="py-3 px-2 text-right text-purple-400">{p.weight}x</td>
                        <td className="py-3 px-2 text-right">
                          {p.streak > 0 ? <span className="text-green-400">{p.streak}</span> : <span className="text-gray-500">0</span>}
                        </td>
                        <td className="py-3 px-2 text-gray-400">{p.specialty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Quarterly Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-slate-700">
                      <th className="text-left py-3 px-2">Period</th>
                      <th className="text-right py-3 px-2">Predictions</th>
                      <th className="text-right py-3 px-2">Within 5%</th>
                      <th className="text-right py-3 px-2">Within 10%</th>
                      <th className="text-right py-3 px-2">Within 20%</th>
                      <th className="text-right py-3 px-2">Avg Error</th>
                      <th className="text-left py-3 px-2">Best Category</th>
                      <th className="text-right py-3 px-2">Crowd vs Expert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accuracy.map(a => (
                      <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-medium">{a.timeframe}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{a.totalPredictions.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-green-400">{a.accurateWithin5Pct}%</td>
                        <td className="py-3 px-2 text-right text-blue-400">{a.accurateWithin10Pct}%</td>
                        <td className="py-3 px-2 text-right text-purple-400">{a.accurateWithin20Pct}%</td>
                        <td className="py-3 px-2 text-right text-yellow-400">{a.avgError}%</td>
                        <td className="py-3 px-2 text-cyan-400">{a.bestCategory}</td>
                        <td className="py-3 px-2 text-right text-green-400">{a.crowdVsExpertWinRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-predictions' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 rounded-xl p-6 border border-violet-800">
              <h3 className="text-xl font-bold mb-2">Your Prediction Profile</h3>
              <p className="text-gray-300 mb-4">Track your prediction accuracy and compare with the crowd</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div><p className="text-gray-400 text-sm">Total Predictions</p><p className="text-2xl font-bold text-violet-400">28</p></div>
                <div><p className="text-gray-400 text-sm">Accuracy Score</p><p className="text-2xl font-bold text-green-400">74</p></div>
                <div><p className="text-gray-400 text-sm">Win Rate</p><p className="text-2xl font-bold text-blue-400">64%</p></div>
                <div><p className="text-gray-400 text-sm">Current Streak</p><p className="text-2xl font-bold text-yellow-400">4</p></div>
                <div><p className="text-gray-400 text-sm">Tier</p><p className="text-2xl font-bold text-purple-400">Gold</p></div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Your Active Predictions</h3>
              <div className="space-y-3">
                {openPredictions.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{p.cardName}</p>
                      <p className="text-xs text-gray-400">Target: {p.targetDate}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Your Prediction</p>
                        <p className="text-violet-400 font-bold">${Math.round(p.crowdPredictedPrice * 0.95).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Crowd Avg</p>
                        <p className="text-blue-400">${p.crowdPredictedPrice.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        p.crowdDirection === 'up' ? 'bg-green-900/50 text-green-400' :
                        p.crowdDirection === 'down' ? 'bg-red-900/50 text-red-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {p.crowdDirection.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-semibold mb-4">Your Accuracy History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { month: 'Nov', accuracy: 68, crowdAvg: 62 },
                  { month: 'Dec', accuracy: 72, crowdAvg: 65 },
                  { month: 'Jan', accuracy: 65, crowdAvg: 64 },
                  { month: 'Feb', accuracy: 78, crowdAvg: 68 },
                  { month: 'Mar', accuracy: 74, crowdAvg: 70 },
                  { month: 'Apr', accuracy: 80, crowdAvg: 71 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Your Accuracy %" />
                  <Area type="monotone" dataKey="crowdAvg" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Crowd Average %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
