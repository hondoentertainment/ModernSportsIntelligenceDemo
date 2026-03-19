import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Users,
  Brain,
  Target,
  Shield,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap,
  BarChart3,
  DollarSign,
} from 'lucide-react';
import {
  getCounterpartyProfiles,
  getNegotiationIntel,
  getFingerprintStats,
  getArchetypeColor,
  getArchetypeLabel,
  getBiasLabel,
  getBiasColor,
  type CounterpartyProfile,
  type CounterpartyArchetype,
} from '../lib/trading/counterpartyFingerprintService';

const CounterpartyFingerprint: React.FC = () => {
  const profiles = useMemo(() => getCounterpartyProfiles(), []);
  const allIntel = useMemo(() => getNegotiationIntel(), []);
  const stats = useMemo(() => getFingerprintStats(), []);
  const [selectedProfile, setSelectedProfile] = useState<CounterpartyProfile | null>(null);
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all');

  const filtered = archetypeFilter === 'all' ? profiles : profiles.filter(p => p.archetype === archetypeFilter);
  const archetypes = [...new Set(profiles.map(p => p.archetype))] as CounterpartyArchetype[];

  const selectedIntel = selectedProfile ? allIntel.find(i => i.counterpartyId === selectedProfile.id) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Fingerprint size={22} className="text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Counterparty Behavioral Fingerprinting</h1>
              <p className="text-slate-400 text-sm">
                Cognitive bias profiling and negotiation intelligence for every counterparty
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-rose-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Profiled</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.totalProfiled}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Avg Reliability</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.avgReliability}%</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Top Archetype</span>
            </div>
            <p className="text-white font-bold text-lg capitalize">{stats.mostCommonArchetype.replace(/-/g, ' ')}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-amber-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide">Deal Success</span>
            </div>
            <p className="text-white font-bold text-3xl">{stats.successRate}%</p>
          </div>
        </div>

        {/* Archetype Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setArchetypeFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              archetypeFilter === 'all' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            All
          </button>
          {archetypes.map(a => (
            <button
              key={a}
              onClick={() => setArchetypeFilter(a)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                archetypeFilter === a ? `${getArchetypeColor(a)} border border-current/50` : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {getArchetypeLabel(a)}
            </button>
          ))}
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(profile => {
            const isSelected = selectedProfile?.id === profile.id;
            return (
              <div
                key={profile.id}
                onClick={() => setSelectedProfile(isSelected ? null : profile)}
                className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-rose-500/50 ${
                  isSelected ? 'border-rose-500/70 ring-1 ring-rose-500/30' : 'border-slate-800'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">@{profile.handle}</h3>
                      <span className={`text-xs font-bold ${getArchetypeColor(profile.archetype)}`}>
                        {getArchetypeLabel(profile.archetype)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Shield size={14} className={profile.reliability >= 80 ? 'text-green-400' : profile.reliability >= 50 ? 'text-amber-400' : 'text-red-400'} />
                        <span className="text-white font-bold">{profile.reliability}%</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">reliability</p>
                    </div>
                  </div>

                  {/* Bias Bars */}
                  <div className="space-y-2 mb-3">
                    {profile.dominantBiases.slice(0, 3).map((b, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[10px] font-bold uppercase ${getBiasColor(b.bias)}`}>{getBiasLabel(b.bias)}</span>
                          <span className="text-slate-400 text-[10px]">{b.strength}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{ width: `${b.strength}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{profile.historicalTransactions} txns</span>
                    <span>Avg {profile.avgDaysOnMarket}d on market</span>
                    <span>Resp: {profile.responseTime}</span>
                  </div>
                </div>

                {isSelected && selectedIntel && (
                  <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                    <h4 className="text-rose-400 font-semibold text-xs uppercase tracking-wide mb-3">
                      <Zap size={14} className="inline mr-1" />
                      Negotiation Intelligence
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-500 text-[10px] uppercase">Opening Offer</p>
                        <p className="text-green-400 font-bold">{selectedIntel.suggestedOpeningOffer}% of ask</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-500 text-[10px] uppercase">Expected Counter</p>
                        <p className="text-amber-400 font-bold">{selectedIntel.expectedCounterOffer}% of ask</p>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                      <p className="text-slate-400 text-xs">
                        <Clock size={12} className="inline mr-1 text-rose-400" />
                        Optimal timing: <span className="text-white font-semibold">{selectedIntel.optimalTiming}</span>
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        <Target size={12} className="inline mr-1 text-rose-400" />
                        Best approach: <span className="text-white">{selectedIntel.bestApproach}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Avoid These Actions</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedIntel.avoidActions.map((a, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-[10px]">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 bg-slate-800/30 rounded-lg p-3">
                      <p className="text-slate-400 text-xs flex items-center gap-2">
                        <BarChart3 size={14} className="text-rose-400" />
                        Acceptance range: <span className="text-white font-semibold">{profile.predictedAcceptanceRange.low}% - {profile.predictedAcceptanceRange.high}%</span> of asking price
                        <span className="text-slate-600">|</span>
                        <span>{selectedIntel.confidence}% confidence</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CounterpartyFingerprint;
