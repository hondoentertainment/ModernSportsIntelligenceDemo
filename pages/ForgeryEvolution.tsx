// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Activity,
  Target,
  Zap,
  Clock,
  Globe,
  AlertOctagon,
  ShieldAlert,
  Bug,
  Search,
} from 'lucide-react';
import {
  getForgeryVectors,
  getThreatAlerts,
  getForgeryStats,
  getEvolutionTimelines,
  getThreatColor,
  getTechniqueName,
  getDifficultyLabel,
  type ForgeryVector,
} from '../lib/core/forgeryEvolutionService';

const ForgeryEvolution: React.FC = () => {
  const vectors = useMemo(() => getForgeryVectors(), []);
  const alerts = useMemo(() => getThreatAlerts(), []);
  const stats = useMemo(() => getForgeryStats(), []);
  const timelines = useMemo(() => getEvolutionTimelines(), []);
  const [selectedVector, setSelectedVector] = useState<ForgeryVector | null>(null);
  const [activeTab, setActiveTab] = useState<'threats' | 'vectors' | 'timeline'>('threats');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield size={22} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Forgery Evolution Network</h1>
              <p className="text-slate-400 text-sm">
                Track how counterfeiting techniques evolve, spread, and target the hobby
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bug size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Vectors Tracked</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalVectorsTracked}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertOctagon size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Critical</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.criticalThreats}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Active Alerts</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{stats.activeThreatAlerts}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Detection Rate</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.detectionSuccessRate}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Market Exposure</span>
            </div>
            <p className="text-white font-bold text-2xl">${(stats.estimatedMarketExposure / 1_000_000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['threats', 'vectors', 'timeline'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {tab === 'threats' ? 'Active Threats' : tab === 'vectors' ? 'Forgery Vectors' : 'Evolution Timeline'}
            </button>
          ))}
        </div>

        {activeTab === 'threats' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-slate-900 rounded-xl border p-5 ${
                alert.threatLevel === 'critical' ? 'border-red-500/50 bg-red-500/5' :
                alert.threatLevel === 'high' ? 'border-orange-500/50' :
                alert.threatLevel === 'moderate' ? 'border-amber-500/50' : 'border-slate-800'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.threatLevel === 'critical' ? 'bg-red-500/20' : 'bg-amber-500/20'
                  }`}>
                    <AlertTriangle size={18} className={getThreatColor(alert.threatLevel)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.threatLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.threatLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alert.threatLevel}
                      </span>
                      <span className="text-slate-500 text-xs">{alert.detectedDate}</span>
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{alert.title}</h4>
                    <p className="text-slate-400 text-xs mb-2">{alert.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {alert.affectedCards.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{c}</span>
                      ))}
                    </div>
                    <p className="text-green-400 text-xs font-medium">
                      <Shield size={12} className="inline mr-1" />
                      {alert.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vectors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vectors.map(vector => (
              <div
                key={vector.id}
                onClick={() => setSelectedVector(selectedVector?.id === vector.id ? null : vector)}
                className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-red-500/50 ${
                  selectedVector?.id === vector.id ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        vector.prevalence === 'widespread' ? 'bg-red-500/20 text-red-400' :
                        vector.prevalence === 'common' ? 'bg-orange-500/20 text-orange-400' :
                        vector.prevalence === 'uncommon' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {vector.prevalence}
                      </span>
                      <h4 className="text-white font-semibold text-sm mt-1">{vector.name}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{vector.description}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-slate-500 text-[10px] uppercase">Difficulty</p>
                      <p className={`font-bold text-lg ${getDifficultyLabel(vector.detectionDifficulty).color}`}>
                        {vector.detectionDifficulty}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Technique</p>
                      <p className="text-white text-xs font-semibold">{getTechniqueName(vector.technique)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Evolution Rate</p>
                      <p className={`text-xs font-semibold ${
                        vector.evolutionRate === 'rapid' ? 'text-red-400' : vector.evolutionRate === 'moderate' ? 'text-amber-400' : 'text-green-400'
                      }`}>{vector.evolutionRate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Exposure</p>
                      <p className="text-white text-xs font-semibold">${(vector.financialExposure / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {vector.regions.map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        <Globe size={10} className="inline mr-0.5" />{r}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedVector?.id === vector.id && (
                  <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-red-400 font-semibold text-xs uppercase tracking-wide mb-2">Targeted Cards</h4>
                        <div className="space-y-1">
                          {vector.targetedCards.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded px-3 py-1.5">
                              <span className="text-white text-xs">{c.name}</span>
                              <span className="text-red-400 text-xs font-bold">{c.estimatedFakeRate}% fake rate</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-green-400 font-semibold text-xs uppercase tracking-wide mb-2">Detection</h4>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-slate-300 text-xs">{vector.detectionMethod}</p>
                          <p className="text-slate-500 text-xs mt-2">First detected: {vector.firstDetected}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {timelines.map((tl, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-red-400" />
                  {getTechniqueName(tl.technique)} Evolution
                </h4>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />
                  <div className="space-y-4">
                    {tl.events.map((event, j) => (
                      <div key={j} className="relative">
                        <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 ${
                          event.sophisticationLevel >= 8 ? 'bg-red-500 border-red-400' :
                          event.sophisticationLevel >= 5 ? 'bg-amber-500 border-amber-400' :
                          'bg-green-500 border-green-400'
                        }`} />
                        <div className="bg-slate-800/50 rounded-lg p-3 ml-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-500 text-xs">{event.date}</span>
                            <span className="text-slate-400 text-[10px]">
                              Sophistication: {event.sophisticationLevel}/10
                            </span>
                          </div>
                          <p className="text-white text-sm">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgeryEvolution;
