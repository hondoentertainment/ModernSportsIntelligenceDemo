import React, { useState, useMemo } from 'react';
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  AlertTriangle,
  Eye,
  Clock,
  Activity,
  Share2,
  Globe,
  BarChart3,
} from 'lucide-react';
import {
  getNarratives,
  getPropagationStats,
  getPhaseColor,
  getPhaseLabel,
  getChannelColor,
  formatR0,
  type Narrative,
  type NarrativePhase,
} from '../lib/analytics/memeticPropagationService';

const PHASE_ORDER: NarrativePhase[] = ['emergence', 'exponential-growth', 'peak-saturation', 'decay', 'endemic'];

const MemeticPropagation: React.FC = () => {
  const narratives = useMemo(() => getNarratives(), []);
  const stats = useMemo(() => getPropagationStats(), []);
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<NarrativePhase | 'all'>('all');

  const filtered = phaseFilter === 'all' ? narratives : narratives.filter(n => n.currentPhase === phaseFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Radio size={22} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Memetic Propagation Tracker</h1>
              <p className="text-slate-400 text-sm">
                SIR epidemiological models applied to card market narrative contagions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-violet-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Active</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.activeNarratives}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Emerging</span>
            </div>
            <p className="text-green-400 font-bold text-3xl">{stats.emergingNarratives}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">At Peak</span>
            </div>
            <p className="text-amber-400 font-bold text-3xl">{stats.peakNarratives}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-red-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Decaying</span>
            </div>
            <p className="text-red-400 font-bold text-3xl">{stats.decayingNarratives}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg R₀</span>
            </div>
            <p className="text-white font-bold text-3xl">{formatR0(stats.avgR0)}</p>
          </div>
        </div>

        {/* Phase Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setPhaseFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              phaseFilter === 'all' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            All Phases
          </button>
          {PHASE_ORDER.map(p => (
            <button
              key={p}
              onClick={() => setPhaseFilter(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                phaseFilter === p ? `${getPhaseColor(p)} border border-current/50` : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {getPhaseLabel(p)}
            </button>
          ))}
        </div>

        {/* Narrative Cards */}
        <div className="space-y-4">
          {filtered.map(narrative => (
            <div
              key={narrative.id}
              onClick={() => setSelectedNarrative(selectedNarrative?.id === narrative.id ? null : narrative)}
              className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-violet-500/50 ${
                selectedNarrative?.id === narrative.id ? 'border-violet-500/70 ring-1 ring-violet-500/30' : 'border-slate-800'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${getPhaseColor(narrative.currentPhase)}`}>
                        {getPhaseLabel(narrative.currentPhase)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500 text-xs">R₀ = {formatR0(narrative.r0)}</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">"{narrative.title}"</h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Patient Zero: <span className="text-slate-300">@{narrative.patientZero.handle}</span> on {narrative.patientZero.platform} ({narrative.patientZero.date})
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-2xl font-bold ${narrative.priceImpactPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {narrative.priceImpactPercent >= 0 ? '+' : ''}{narrative.priceImpactPercent}%
                    </p>
                    <p className="text-slate-500 text-xs">price impact</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye size={14} className="text-slate-400" />
                    <span className="text-slate-400 text-xs">{(narrative.exposures / 1000).toFixed(0)}K exposures</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-slate-400 text-xs">{narrative.daysToFullPricing}d to full pricing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 size={14} className="text-slate-400" />
                    <span className="text-slate-400 text-xs">{narrative.confidence}% confidence</span>
                  </div>
                </div>

                {/* Channel Propagation Bar */}
                <div className="flex gap-1">
                  {narrative.infectedChannels.map(ch => (
                    <span key={ch} className={`px-2 py-0.5 rounded text-[10px] font-bold ${getChannelColor(ch)}`}>
                      {ch}
                    </span>
                  ))}
                  {narrative.susceptibleChannels.map(ch => (
                    <span key={ch} className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 bg-slate-800 border border-slate-700">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {selectedNarrative?.id === narrative.id && (
                <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Amplifiers */}
                    <div>
                      <h4 className="text-violet-400 font-semibold text-xs uppercase tracking-wide mb-3">
                        <Share2 size={14} className="inline mr-1" />
                        Top Amplifiers
                      </h4>
                      <div className="space-y-2">
                        {narrative.topAmplifiers.map((amp, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                            <div>
                              <span className="text-white text-sm font-medium">@{amp.handle}</span>
                              <span className={`ml-2 text-[10px] font-bold ${getChannelColor(amp.platform)}`}>{amp.platform}</span>
                            </div>
                            <span className="text-slate-400 text-xs">{(amp.reach / 1000).toFixed(0)}K reach</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Affected Cards */}
                    <div>
                      <h4 className="text-violet-400 font-semibold text-xs uppercase tracking-wide mb-3">
                        <TrendingUp size={14} className="inline mr-1" />
                        Affected Cards
                      </h4>
                      <div className="space-y-2">
                        {narrative.affectedCards.map((card, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                            <span className="text-white text-sm">{card.name}</span>
                            <span className={`text-sm font-bold ${card.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {card.priceChange >= 0 ? '+' : ''}{card.priceChange}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span>Peak projected: <span className="text-white font-semibold">{narrative.peakDate}</span> — Decay begins: <span className="text-white font-semibold">{narrative.decayDate}</span></span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemeticPropagation;
