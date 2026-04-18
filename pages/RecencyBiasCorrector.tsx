import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Target,
  Layers,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getRecencyBiases,
  getCorrectedForecasts,
  getTimeWeightings,
  getBiasCorrections,
  getRecencyBiasStats,
} from '../lib/recencyBiasService.ts';

const TABS = ['Active Corrections', 'Bias Score', 'Forecast Comparison'] as const;
type Tab = typeof TABS[number];

export default function RecencyBiasCorrector() {
  const [activeTab, setActiveTab] = useState<Tab>('Active Corrections');
  const biases = getRecencyBiases();
  const forecasts = getCorrectedForecasts();
  const weightings = getTimeWeightings();
  const corrections = getBiasCorrections();
  const stats = getRecencyBiasStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Clock size={22} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Recency Bias Corrector</h1>
              <p className="text-gray-400 text-sm">Weight older data appropriately against recent trend overweighting</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-orange-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Overvalued</span>
            </div>
            <p className="text-orange-400 font-bold text-3xl">{stats.overvaluedCards}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-blue-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Undervalued</span>
            </div>
            <p className="text-blue-400 font-bold text-3xl">{stats.undervaluedCards}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Bias</span>
            </div>
            <p className="text-yellow-400 font-bold text-3xl">${stats.avgBiasAmount}</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-400" />
              <span className="text-gray-400 text-xs uppercase tracking-wide">Accuracy Gain</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">+{stats.accuracyGain}%</p>
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
                  ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active Corrections Tab */}
        {activeTab === 'Active Corrections' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Recency Bias by Card</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={biases.slice(0, 8).map(b => ({
                  name: b.cardName.length > 20 ? b.cardName.slice(0, 20) + '...' : b.cardName,
                  recent: b.recentTrendValue,
                  corrected: b.correctedValue,
                  historical: b.historicalAvgValue,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${v}`, '']} />
                  <Legend />
                  <Bar dataKey="recent" name="Recent Trend" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="corrected" name="Corrected" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="historical" name="Historical Avg" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {biases.map(bias => (
                <div key={bias.id} className={`bg-gray-900 rounded-xl border p-5 ${bias.biasDirection === 'overvalued' ? 'border-orange-500/20' : 'border-blue-500/20'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{bias.cardName}</h4>
                      <p className="text-gray-500 text-xs">{bias.sport} | Recent: {bias.recentPeriod} | Historical: {bias.historicalPeriod}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      bias.biasDirection === 'overvalued' ? 'text-orange-400 bg-orange-500/15' : 'text-blue-400 bg-blue-500/15'
                    }`}>
                      {bias.biasDirection.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm mt-3">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Recent Trend</p>
                      <p className="text-red-400 font-bold">${bias.recentTrendValue.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 mt-3" />
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Corrected</p>
                      <p className="text-indigo-400 font-bold">${bias.correctedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Historical Avg</p>
                      <p className="text-green-400 font-bold">${bias.historicalAvgValue.toLocaleString()}</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-gray-500 text-[10px] uppercase">Bias Amount</p>
                      <p className="text-yellow-400 font-bold">${bias.biasAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bias Score Tab */}
        {activeTab === 'Bias Score' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Time Weighting: Naive vs Corrected</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weightings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="naiveWeight" name="Naive Weight" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="correctedWeight" name="Corrected Weight" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Bias Correction Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={corrections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgRecencyBias" name="Avg Recency Bias" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="accuracyImprovement" name="Accuracy Gain %" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="correctionsApplied" name="Corrections Applied" stroke="#818cf8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {weightings.map((w, i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{w.period}</h4>
                      <p className="text-gray-500 text-xs">{w.description}</p>
                    </div>
                    <span className="text-gray-400 text-xs">{w.dataPoints} data points</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase mb-1">Naive Weight</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${w.naiveWeight * 100}%` }} />
                        </div>
                        <span className="text-red-400 text-xs font-bold">{(w.naiveWeight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase mb-1">Corrected Weight</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${w.correctedWeight * 100}%` }} />
                        </div>
                        <span className="text-indigo-400 text-xs font-bold">{(w.correctedWeight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forecast Comparison Tab */}
        {activeTab === 'Forecast Comparison' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">Naive vs Corrected 6-Month Forecasts</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={forecasts.map(f => ({
                  name: f.cardName.length > 22 ? f.cardName.slice(0, 22) + '...' : f.cardName,
                  naive: f.naiveForecast,
                  corrected: f.correctedForecast,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={70} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: number) => [`$${v}`, '']} />
                  <Legend />
                  <Bar dataKey="naive" name="Naive Forecast" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="corrected" name="Corrected Forecast" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {forecasts.map((f, i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{f.cardName}</h4>
                    <span className="text-gray-400 text-xs">Confidence: {f.confidenceLevel}%</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm mt-2">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Naive Forecast</p>
                      <p className="text-red-400 font-bold">${f.naiveForecast.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 mt-3" />
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Corrected Forecast</p>
                      <p className="text-indigo-400 font-bold">${f.correctedForecast.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase">Difference</p>
                      <p className={`font-bold ${f.forecastDifference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {f.forecastDifference > 0 ? '+' : ''}${f.forecastDifference.toLocaleString()}
                      </p>
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
