import React, { useState, useMemo } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  ShieldAlert,
  Target,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  getHofCandidates,
  getHofStats,
  getHofPricingModel,
  type HofCandidate,
  type HofSport,
} from '../lib/hofProbabilityService';

const SPORT_FILTERS: { id: HofSport | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'MLB', label: 'MLB' },
  { id: 'NBA', label: 'NBA' },
  { id: 'NFL', label: 'NFL' },
  { id: 'NHL', label: 'NHL' },
];

const SPORT_COLORS: Record<HofSport, string> = {
  MLB: 'bg-red-500/15 text-red-400 border-red-500/30',
  NBA: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  NFL: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  NHL: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
};

const HofProbability: React.FC = () => {
  const candidates = useMemo(() => getHofCandidates(), []);
  const stats = useMemo(() => getHofStats(), []);
  const [sportFilter, setSportFilter] = useState<HofSport | 'ALL'>('ALL');

  const filtered = useMemo(
    () =>
      sportFilter === 'ALL'
        ? [...candidates].sort((a, b) => b.hofProbability - a.hofProbability)
        : candidates.filter((c) => c.sport === sportFilter).sort((a, b) => b.hofProbability - a.hofProbability),
    [candidates, sportFilter],
  );

  const probabilityColor = (p: number) => {
    if (p >= 80) return 'text-emerald-400';
    if (p >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const probabilityBg = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const trendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp size={14} className="text-emerald-400" />;
    if (trend === 'declining') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Award size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Hall of Fame Probability Engine</h1>
            <p className="text-sm text-slate-400">
              Career trajectory analysis with HOF premium pricing models
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PageStatCard
          icon={<Users size={16} className="text-amber-400" />}
          label="Candidates"
          value={stats.totalCandidatesTracked.toString()}
        />
        <PageStatCard
          icon={<Target size={16} className="text-amber-400" />}
          label="Avg Probability"
          value={`${stats.avgProbability}%`}
        />
        <PageStatCard
          icon={<DollarSign size={16} className="text-emerald-400" />}
          label="HOF Exposure"
          value={`$${(stats.portfolioHofExposure / 1000).toFixed(1)}k`}
        />
        <PageStatCard
          icon={<ShieldAlert size={16} className="text-red-400" />}
          label="Premium at Risk"
          value={`$${(stats.premiumAtRisk / 1000).toFixed(1)}k`}
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Filter by Sport
        </span>
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
          {SPORT_FILTERS.map((sf) => (
            <button
              key={sf.id}
              onClick={() => setSportFilter(sf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sportFilter === sf.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((candidate) => {
          const pm = getHofPricingModel(candidate.id);
          return (
            <div
              key={candidate.id}
              className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-sm font-bebas text-amber-400">
                      {candidate.playerName.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{candidate.playerName}</h3>
                    <p className="text-[10px] text-slate-400">
                      {candidate.team} &middot; {candidate.position}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${SPORT_COLORS[candidate.sport]}`}>
                  {candidate.sport}
                </span>
              </div>

              {/* Probability + trend */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-3xl font-bold ${probabilityColor(candidate.hofProbability)}`}>
                  {candidate.hofProbability}%
                </span>
                <div className="flex items-center gap-1">
                  {trendIcon(candidate.trajectoryTrend)}
                  <span className="text-[10px] text-slate-500 capitalize">{candidate.trajectoryTrend}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${probabilityBg(candidate.hofProbability)}`}
                  style={{ width: `${candidate.hofProbability}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(candidate.careerStats).slice(0, 3).map(([key, val]) => (
                  <span key={key} className="text-[10px] px-2 py-0.5 bg-slate-700/60 rounded text-slate-300">
                    {key}: <span className="text-white font-bold">{typeof val === 'number' && val < 1 ? val.toFixed(3) : val}</span>
                  </span>
                ))}
              </div>

              {/* Pricing summary */}
              {pm && (
                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Value</p>
                    <p className="text-xs font-bold text-white">${pm.currentCardValue.toLocaleString()}</p>
                  </div>
                  <ArrowRight size={12} className="text-slate-600" />
                  <div className="text-center">
                    <p className="text-[9px] text-emerald-400 uppercase">If HOF</p>
                    <p className="text-xs font-bold text-emerald-400">${pm.projectedValueAtInduction.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Premium</p>
                    <p className="text-xs font-bold text-amber-400">{pm.hofPremiumMultiplier}x</p>
                  </div>
                </div>
              )}

              {/* Projected induction */}
              {candidate.projectedInductionYear && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Clock size={10} />
                  Projected: <span className="text-amber-400 font-bold">{candidate.projectedInductionYear}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PageStatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-lg font-bebas tracking-wider text-white">{value}</p>
    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
  </div>
);

export default HofProbability;
