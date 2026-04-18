import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  RefreshCw, TrendingUp, TrendingDown, AlertTriangle, History,
  Target, Signal, Zap
} from 'lucide-react';
import {
  getConsensusStates, getFlipSignals, getFlipProbabilities,
  getConsensusHistory, getConsensusStats,
  type ConsensusState, type FlipSignal, type FlipProbability, type ConsensusHistory
} from '../lib/consensusFlipService.ts';

type TabId = 'predictions' | 'signals' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'predictions', label: 'Active Predictions', icon: <Target size={18} /> },
  { id: 'signals', label: 'Signal Analysis', icon: <Signal size={18} /> },
  { id: 'history', label: 'Flip History', icon: <History size={18} /> },
];

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function ConsensusFlipPredictor() {
  const [activeTab, setActiveTab] = useState<TabId>('predictions');
  const states = getConsensusStates();
  const signals = getFlipSignals();
  const probabilities = getFlipProbabilities();
  const history = getConsensusHistory();
  const stats = getConsensusStats();

  const consensusDistribution = [
    { name: 'Bullish', value: stats.bullish, color: '#10b981' },
    { name: 'Bearish', value: stats.bearish, color: '#ef4444' },
    { name: 'Neutral', value: stats.neutral, color: '#f59e0b' },
  ];

  const flipProbData = probabilities.map(fp => ({
    name: fp.cardName.length > 25 ? fp.cardName.slice(0, 25) + '...' : fp.cardName,
    probability: fp.flipProbability,
    confidence: 100 - fp.confidenceInterval,
    impact: fp.potentialImpact,
  }));

  const historyChartData = history.map(h => ({
    name: h.cardName.length > 20 ? h.cardName.slice(0, 20) + '...' : h.cardName,
    priceAtFlip: h.priceAtFlip,
    priceAfter: h.priceAfter30Days,
    accuracy: h.accuracyOfPrediction,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <RefreshCw className="text-cyan-400" size={32} />
            Consensus Flip Predictor
          </h1>
          <p className="text-gray-400">Predict when community consensus on a card or player will reverse</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Bullish</p>
            <p className="text-2xl font-bold text-green-400">{stats.bullish}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Bearish</p>
            <p className="text-2xl font-bold text-red-400">{stats.bearish}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Neutral</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.neutral}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Strength</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.avgStrength}%</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Signals</p>
            <p className="text-2xl font-bold text-purple-400">{stats.activeSignals}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Flip Prob</p>
            <p className="text-2xl font-bold text-orange-400">{stats.avgFlipProb}%</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
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
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Consensus Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={consensusDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {consensusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Flip Probability Rankings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={flipProbData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: '#9ca3af' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} width={180} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="probability" fill="#06b6d4" name="Flip Probability %" />
                    <Bar dataKey="impact" fill="#f59e0b" name="Potential Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {states.map(state => (
                <div key={state.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-cyan-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{state.category}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      state.currentConsensus === 'bullish' ? 'bg-green-900/50 text-green-400' :
                      state.currentConsensus === 'bearish' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {state.currentConsensus.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{state.playerName}</h4>
                  <p className="text-xs text-gray-500 mb-3">{state.cardName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Price:</span> <span className="text-white">${state.currentPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Target:</span> <span className="text-cyan-400">${state.consensusPrice.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Strength:</span> <span className="text-purple-400">{state.consensusStrength}%</span></div>
                    <div><span className="text-gray-500">Votes:</span> <span className="text-gray-300">{state.participantCount.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Active Flip Signals</h3>
              <div className="space-y-3">
                {signals.map(signal => (
                  <div key={signal.id} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      signal.strength > 70 ? 'bg-red-900/50' : signal.strength > 50 ? 'bg-yellow-900/50' : 'bg-blue-900/50'
                    }`}>
                      <AlertTriangle size={20} className={signal.strength > 70 ? 'text-red-400' : signal.strength > 50 ? 'text-yellow-400' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{signal.signalType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-sm text-gray-400">{signal.detectedDate}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{signal.description}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-cyan-400">Strength: {signal.strength}%</span>
                        <span className="text-green-400">Reliability: {signal.reliability}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Signal Strength by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={signals.map(s => ({
                  name: s.signalType.replace(/_/g, ' ').slice(0, 15),
                  strength: s.strength,
                  reliability: s.reliability,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="strength" fill="#06b6d4" name="Signal Strength" />
                  <Bar dataKey="reliability" fill="#10b981" name="Reliability" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Historical Flip Outcomes</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="priceAtFlip" fill="#8b5cf6" name="Price at Flip ($)" />
                  <Bar dataKey="priceAfter" fill="#10b981" name="Price After 30d ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map(h => (
                <div key={h.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <h4 className="font-semibold text-sm mb-2">{h.cardName}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs ${h.fromConsensus === 'bullish' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {h.fromConsensus}
                    </span>
                    <RefreshCw size={14} className="text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs ${h.toConsensus === 'bullish' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {h.toConsensus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Price at Flip:</span> <span className="text-white">${h.priceAtFlip.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">After 30d:</span> <span className={h.priceAfter30Days > h.priceAtFlip ? 'text-green-400' : 'text-red-400'}>${h.priceAfter30Days.toLocaleString()}</span></div>
                    <div><span className="text-gray-500">Accuracy:</span> <span className="text-cyan-400">{h.accuracyOfPrediction}%</span></div>
                    <div><span className="text-gray-500">Date:</span> <span className="text-gray-300">{h.flipDate}</span></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Trigger: {h.triggerEvent}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
