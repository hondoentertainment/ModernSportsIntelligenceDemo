import React, { useMemo, useState } from 'react';
import {
  X,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BarChart3,
  DollarSign,
  Star,
  Clock,
  ShieldAlert,
  Target,
  ArrowRight,
  Bell,
  Plus,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import {
  getHofCandidates,
  getHofComparables,
  getHofPricingModel,
  getHofStats,
  type HofCandidate,
  type HofComparable,
  type HofPricingModel,
  type HofSport,
} from '../lib/hofProbabilityService';

// ── Types ────────────────────────────────────────────────────────────────────────

interface HofProbabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'candidates' | 'comparisons' | 'pricing' | 'watchlist';

interface WatchlistEntry {
  playerId: string;
  playerName: string;
  alertThreshold: number;
  addedAt: string;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'candidates', label: 'Candidates', icon: <Users size={14} /> },
  { id: 'comparisons', label: 'Comparisons', icon: <BarChart3 size={14} /> },
  { id: 'pricing', label: 'Pricing Model', icon: <DollarSign size={14} /> },
  { id: 'watchlist', label: 'Watchlist', icon: <Star size={14} /> },
];

const SPORT_FILTERS: { id: HofSport | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Sports' },
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

// ── Component ────────────────────────────────────────────────────────────────────

export const HofProbabilityModal: React.FC<HofProbabilityModalProps> = ({ isOpen, onClose }) => {
  const candidates = useMemo(() => getHofCandidates(), []);
  const stats = useMemo(() => getHofStats(), []);

  const [activeTab, setActiveTab] = useState<TabId>('candidates');
  const [sportFilter, setSportFilter] = useState<HofSport | 'ALL'>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<HofCandidate>(candidates[0]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([
    { playerId: 'hof-001', playerName: 'Shohei Ohtani', alertThreshold: 90, addedAt: '2026-01-15' },
    { playerId: 'hof-004', playerName: 'Connor McDavid', alertThreshold: 85, addedAt: '2026-02-08' },
    { playerId: 'hof-003', playerName: 'Victor Wembanyama', alertThreshold: 75, addedAt: '2026-03-01' },
  ]);

  const filteredCandidates = useMemo(
    () =>
      sportFilter === 'ALL'
        ? candidates
        : candidates.filter((c) => c.sport === sportFilter),
    [candidates, sportFilter],
  );

  const comparables = useMemo(() => getHofComparables(selectedCandidate.id), [selectedCandidate]);
  const pricing = useMemo(() => getHofPricingModel(selectedCandidate.id), [selectedCandidate]);

  if (!isOpen) return null;

  const trendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp size={14} className="text-emerald-400" />;
    if (trend === 'declining') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const probabilityColor = (p: number) => {
    if (p >= 80) return 'text-emerald-400';
    if (p >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const probabilityBgColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const probabilityRingColor = (p: number) => {
    if (p >= 80) return '#10b981';
    if (p >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const addToWatchlist = (candidate: HofCandidate) => {
    if (watchlist.some((w) => w.playerId === candidate.id)) return;
    setWatchlist((prev) => [
      ...prev,
      {
        playerId: candidate.id,
        playerName: candidate.playerName,
        alertThreshold: Math.max(candidate.hofProbability - 10, 10),
        addedAt: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeFromWatchlist = (playerId: string) => {
    setWatchlist((prev) => prev.filter((w) => w.playerId !== playerId));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header with gradient */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Award size={10} />
                  HOF Engine
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Hall of Fame <span className="text-amber-400">Probability</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="px-8 pt-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users size={14} className="text-amber-400" />} label="Candidates" value={stats.totalCandidatesTracked.toString()} />
          <StatCard icon={<Target size={14} className="text-amber-400" />} label="Avg Probability" value={`${stats.avgProbability}%`} />
          <StatCard icon={<DollarSign size={14} className="text-emerald-400" />} label="HOF Exposure" value={`$${(stats.portfolioHofExposure / 1000).toFixed(1)}k`} />
          <StatCard icon={<ShieldAlert size={14} className="text-red-400" />} label="Premium at Risk" value={`$${(stats.premiumAtRisk / 1000).toFixed(1)}k`} />
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-1 border-b border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* ── Tab 1: Candidates ──────────────────────────────────── */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              {/* Sport filter */}
              <div className="flex gap-2 flex-wrap">
                {SPORT_FILTERS.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => setSportFilter(sf.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      sportFilter === sf.id
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>

              {/* Candidate cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setActiveTab('comparisons');
                    }}
                    className={`text-left p-5 bg-slate-800/50 border rounded-2xl transition-all hover:border-amber-500/40 group ${
                      selectedCandidate.id === candidate.id
                        ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                        : 'border-slate-700'
                    }`}
                  >
                    {/* Probability ring */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="#334155" strokeWidth="4" />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke={probabilityRingColor(candidate.hofProbability)}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(candidate.hofProbability / 100) * 175.93} 175.93`}
                          />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${probabilityColor(candidate.hofProbability)}`}>
                          {candidate.hofProbability}%
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${SPORT_COLORS[candidate.sport]}`}>
                          {candidate.sport}
                        </span>
                        <div className="flex items-center gap-1">
                          {trendIcon(candidate.trajectoryTrend)}
                          <span className="text-[10px] text-slate-500 capitalize">{candidate.trajectoryTrend}</span>
                        </div>
                      </div>
                    </div>

                    {/* Name / Team */}
                    <h4 className="text-base font-bold text-white truncate">{candidate.playerName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {candidate.team} &middot; {candidate.position} &middot; Age {candidate.currentAge}
                    </p>

                    {/* Career stat highlights */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(candidate.careerStats).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="text-[10px] px-2 py-0.5 bg-slate-700/60 rounded text-slate-300">
                          {key}: <span className="text-white font-bold">{typeof val === 'number' && val < 1 ? val.toFixed(3) : val}</span>
                        </span>
                      ))}
                    </div>

                    {/* Projected induction */}
                    {candidate.projectedInductionYear && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock size={10} />
                        Projected induction: <span className="text-amber-400 font-bold">{candidate.projectedInductionYear}</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-end">
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: Comparisons ─────────────────────────────────── */}
          {activeTab === 'comparisons' && (
            <div className="space-y-6">
              {/* Player selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  Compare
                </span>
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedCandidate.id === c.id
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {c.playerName.split(' ').pop()}
                  </button>
                ))}
              </div>

              {/* Side-by-side comparisons */}
              {comparables.map((comp) => (
                <div key={comp.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* Active player */}
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-bebas text-amber-400">
                          {selectedCandidate.playerName.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{selectedCandidate.playerName}</h4>
                      <p className="text-[10px] text-slate-400">{selectedCandidate.team}</p>
                      <span className={`inline-block mt-1 text-xs font-bold ${probabilityColor(selectedCandidate.hofProbability)}`}>
                        {selectedCandidate.hofProbability}% HOF
                      </span>
                    </div>

                    {/* VS / similarity */}
                    <div className="flex flex-col items-center justify-center gap-2 pt-4">
                      <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-400">{comp.similarityScore}%</span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider">Match</span>
                      <ArrowRight size={14} className="text-slate-600" />
                    </div>

                    {/* HOF member */}
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                        <Award size={20} className="text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{comp.hofMemberName}</h4>
                      <p className="text-[10px] text-slate-400">HOF {comp.inductionYear > 0 ? comp.inductionYear : 'N/A'}</p>
                      <span className="inline-block mt-1 text-xs font-bold text-emerald-400">Inducted</span>
                    </div>
                  </div>

                  {/* Stat comparison */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                      Career Stat Comparison
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(comp.careerStats).slice(0, 6).map((statKey) => {
                        const compVal = comp.careerStats[statKey];
                        const activeVal = selectedCandidate.careerStats[statKey];
                        return (
                          <div key={statKey} className="p-2 bg-slate-900/50 rounded-lg text-center">
                            <p className="text-[9px] text-slate-500 uppercase mb-1">{statKey}</p>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs font-bold text-amber-400">
                                {activeVal !== undefined ? (typeof activeVal === 'number' && activeVal < 1 ? activeVal.toFixed(3) : activeVal) : '--'}
                              </span>
                              <span className="text-[9px] text-slate-600">vs</span>
                              <span className="text-xs font-bold text-emerald-400">
                                {typeof compVal === 'number' && compVal < 1 ? compVal.toFixed(3) : compVal}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Radar chart placeholder */}
                  <div className="mt-4 p-6 bg-slate-900/50 border border-slate-700/30 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 size={28} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Stat Radar Chart</p>
                      <p className="text-[10px] text-slate-600">Visual comparison coming soon</p>
                    </div>
                  </div>

                  {/* Career timeline */}
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-slate-500 uppercase">Active Years</p>
                      <p className="text-xs font-bold text-white">{selectedCandidate.yearsActive} yrs</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-slate-500 uppercase">Current Age</p>
                      <p className="text-xs font-bold text-white">{selectedCandidate.currentAge}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div className="text-center flex-1">
                      <p className="text-[9px] text-slate-500 uppercase">Proj. Induction</p>
                      <p className="text-xs font-bold text-amber-400">
                        {selectedCandidate.projectedInductionYear ?? 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab 3: Pricing Model ───────────────────────────────── */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Player selector */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  Player
                </span>
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedCandidate.id === c.id
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {c.playerName.split(' ').pop()}
                  </button>
                ))}
              </div>

              {pricing && (
                <PricingCard candidate={selectedCandidate} pricing={pricing} />
              )}

              {/* All players pricing summary */}
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                  Portfolio Pricing Summary
                </p>
                <div className="space-y-2">
                  {candidates
                    .sort((a, b) => b.hofProbability - a.hofProbability)
                    .map((c) => {
                      const pm = getHofPricingModel(c.id);
                      if (!pm) return null;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCandidate(c)}
                          className="w-full text-left flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-all"
                        >
                          <span className={`text-sm font-bold w-12 text-right ${probabilityColor(c.hofProbability)}`}>
                            {c.hofProbability}%
                          </span>
                          <span className="text-sm text-white font-bold flex-1 truncate">{c.playerName}</span>
                          <span className="text-xs text-slate-400">${pm.currentCardValue.toLocaleString()}</span>
                          <ArrowRight size={12} className="text-slate-600" />
                          <span className="text-xs text-emerald-400 font-bold">${pm.projectedValueAtInduction.toLocaleString()}</span>
                          <span className="text-[10px] text-amber-400 font-bold">{pm.hofPremiumMultiplier}x</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 4: Watchlist ────────────────────────────────────── */}
          {activeTab === 'watchlist' && (
            <div className="space-y-6">
              {/* Add to watchlist */}
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
                  Add Players to Watchlist
                </p>
                <div className="flex gap-2 flex-wrap">
                  {candidates
                    .filter((c) => !watchlist.some((w) => w.playerId === c.id))
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addToWatchlist(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all"
                      >
                        <Plus size={12} />
                        {c.playerName}
                      </button>
                    ))}
                </div>
              </div>

              {/* Watchlist entries */}
              <div className="space-y-3">
                {watchlist.length === 0 && (
                  <div className="text-center py-12">
                    <Star size={32} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No players on watchlist</p>
                    <p className="text-xs text-slate-600 mt-1">Add players above to track their HOF probability</p>
                  </div>
                )}

                {watchlist.map((entry) => {
                  const candidate = candidates.find((c) => c.id === entry.playerId);
                  if (!candidate) return null;
                  const pm = getHofPricingModel(entry.playerId);

                  return (
                    <div
                      key={entry.playerId}
                      className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                            <span className="text-sm font-bebas text-amber-400">
                              {candidate.playerName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{candidate.playerName}</h4>
                            <p className="text-[10px] text-slate-400">
                              {candidate.team} &middot; {candidate.sport}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromWatchlist(entry.playerId)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="p-2.5 bg-slate-900/50 rounded-lg text-center">
                          <p className="text-[9px] text-slate-500 uppercase mb-0.5">HOF Prob</p>
                          <p className={`text-lg font-bold ${probabilityColor(candidate.hofProbability)}`}>
                            {candidate.hofProbability}%
                          </p>
                        </div>
                        <div className="p-2.5 bg-slate-900/50 rounded-lg text-center">
                          <p className="text-[9px] text-slate-500 uppercase mb-0.5">Card Value</p>
                          <p className="text-lg font-bold text-white">
                            ${pm ? pm.currentCardValue.toLocaleString() : '--'}
                          </p>
                        </div>
                        <div className="p-2.5 bg-slate-900/50 rounded-lg text-center">
                          <p className="text-[9px] text-slate-500 uppercase mb-0.5">Premium</p>
                          <p className="text-lg font-bold text-amber-400">
                            {pm ? `${pm.hofPremiumMultiplier}x` : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Alert threshold */}
                      <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <Bell size={12} className="text-amber-400 flex-shrink-0" />
                        <span className="text-[10px] text-slate-400">
                          Alert when probability drops below{' '}
                          <span className="text-amber-400 font-bold">{entry.alertThreshold}%</span>
                        </span>
                        <span className="ml-auto text-[9px] text-slate-600">
                          Added {entry.addedAt}
                        </span>
                      </div>

                      {/* Probability bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                          <span>0%</span>
                          <span>Current: {candidate.hofProbability}%</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full ${probabilityBgColor(candidate.hofProbability)}`}
                            style={{ width: `${candidate.hofProbability}%` }}
                          />
                          {/* Threshold marker */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                            style={{ left: `${entry.alertThreshold}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
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

const PricingCard: React.FC<{ candidate: HofCandidate; pricing: HofPricingModel }> = ({
  candidate,
  pricing,
}) => {
  const roi = ((pricing.projectedValueAtInduction - pricing.currentCardValue) / pricing.currentCardValue * 100).toFixed(0);
  const riskRatio = pricing.projectedValueAtInduction / pricing.projectedValueIfMiss;

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-5">
      {/* Player header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <span className="text-sm font-bebas text-amber-400">
            {candidate.playerName.split(' ').map((n) => n[0]).join('')}
          </span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">{candidate.playerName}</h4>
          <p className="text-xs text-slate-400">{candidate.team} &middot; {candidate.sport}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-amber-400">{candidate.hofProbability}%</p>
          <p className="text-[10px] text-slate-500 uppercase">HOF Probability</p>
        </div>
      </div>

      {/* Value projections */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/50 rounded-xl text-center">
          <p className="text-[9px] text-slate-500 uppercase mb-1">Current Value</p>
          <p className="text-xl font-bold text-white">${pricing.currentCardValue.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
          <p className="text-[9px] text-emerald-400 uppercase mb-1">If Inducted</p>
          <p className="text-xl font-bold text-emerald-400">${pricing.projectedValueAtInduction.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-xl text-center">
          <p className="text-[9px] text-slate-500 uppercase mb-1">Premium</p>
          <p className="text-xl font-bold text-amber-400">{pricing.hofPremiumMultiplier}x</p>
        </div>
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
          <p className="text-[9px] text-red-400 uppercase mb-1">If Miss</p>
          <p className="text-xl font-bold text-red-400">${pricing.projectedValueIfMiss.toLocaleString()}</p>
        </div>
      </div>

      {/* Risk / Reward bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-2">
          <span className="text-red-400 font-bold">Downside Risk</span>
          <span className="text-slate-500">Break-even: {pricing.breakEvenProbability}% probability</span>
          <span className="text-emerald-400 font-bold">Upside Reward</span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-400"
            style={{ width: `${pricing.breakEvenProbability}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            style={{ width: `${100 - pricing.breakEvenProbability}%` }}
          />
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase mb-0.5">Time Horizon</p>
          <p className="text-sm font-bold text-white flex items-center justify-center gap-1">
            <Clock size={12} className="text-amber-400" />
            {pricing.timeHorizon}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase mb-0.5">Projected ROI</p>
          <p className="text-sm font-bold text-emerald-400">+{roi}%</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase mb-0.5">Risk/Reward Ratio</p>
          <p className="text-sm font-bold text-amber-400">{riskRatio.toFixed(1)}:1</p>
        </div>
      </div>
    </div>
  );
};

export default HofProbabilityModal;
