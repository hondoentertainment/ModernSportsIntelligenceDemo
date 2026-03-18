import React, { useState, useMemo } from 'react';
import {
  Puzzle,
  Users,
  Trophy,
  BarChart3,
  CheckCircle2,
  XCircle,
  Search,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Target,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  getCollaborativeSets,
  getSetRegistryStats,
  getCompletionColor,
  getCompletionBgColor,
  getStatusColor,
  getStatusBadgeClasses,
  getRarityBadgeClasses,
  formatCurrency,
  formatFullCurrency,
  type CollaborativeSet,
  type SetContributor,
} from '../lib/utils/collaborativeSetRegistryService';

type DetailTab = 'checklist' | 'contributors' | 'gaps' | 'milestones';

const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
  { key: 'checklist', label: 'Card Checklist', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'contributors', label: 'Contributors', icon: <Users className="w-4 h-4" /> },
  { key: 'gaps', label: 'Gap Analysis', icon: <Target className="w-4 h-4" /> },
  { key: 'milestones', label: 'Milestones', icon: <Trophy className="w-4 h-4" /> },
];

function ProgressBar({ percent, size = 'md' }: { percent: number; size?: 'sm' | 'md' | 'lg' }) {
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';
  return (
    <div className={`w-full bg-slate-700 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${getCompletionBgColor(percent)}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-white font-bold text-3xl">{value}</p>
    </div>
  );
}

function CardChecklistTab({ set }: { set: CollaborativeSet }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwned, setFilterOwned] = useState<'all' | 'owned' | 'missing'>('all');

  const filteredCards = useMemo(() => {
    let cards = set.cards;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q)
      );
    }
    if (filterOwned === 'owned') cards = cards.filter((c) => c.ownedBy !== null);
    if (filterOwned === 'missing') cards = cards.filter((c) => c.ownedBy === null);
    return cards;
  }, [set.cards, searchQuery, filterOwned]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search cards by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'owned', 'missing'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterOwned(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                filterOwned === f
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {f === 'all' ? `All (${set.cards.length})` : f === 'owned' ? `Owned (${set.cards.filter((c) => c.ownedBy).length})` : `Missing (${set.cards.filter((c) => !c.ownedBy).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredCards.map((card) => (
          <div
            key={card.number}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              card.ownedBy
                ? 'bg-slate-800/50 border-slate-700/50'
                : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  card.ownedBy
                    ? 'bg-emerald-500/20'
                    : 'bg-red-500/20'
                }`}
              >
                {card.ownedBy ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-mono">#{card.number}</span>
                  <span className="text-white font-medium text-sm truncate">{card.name}</span>
                  {card.verified && (
                    <ShieldCheck size={14} className="text-blue-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {card.ownedBy ? (
                    <>
                      <span>Owned by <span className="text-slate-300">@{card.ownedBy}</span></span>
                      {card.grade && (
                        <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {card.grade}
                        </span>
                      )}
                      {card.condition === 'raw' && (
                        <span className="bg-slate-600/40 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">
                          Raw
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-red-400/80">
                      {card.contributionType === 'pledged' ? 'Pledged — awaiting delivery' : 'Missing — actively searching'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className={`text-sm font-semibold ${card.ownedBy ? 'text-emerald-400' : 'text-slate-400'}`}>
                {formatFullCurrency(card.estimatedValue)}
              </p>
            </div>
          </div>
        ))}
        {filteredCards.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Search size={32} className="mx-auto mb-3 opacity-50" />
            <p>No cards match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContributorsTab({ contributors }: { contributors: SetContributor[] }) {
  const sorted = useMemo(
    () => [...contributors].sort((a, b) => b.contributionScore - a.contributionScore),
    [contributors]
  );

  return (
    <div className="space-y-3">
      {sorted.map((c, idx) => (
        <div
          key={c.userId}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : idx === 1
                    ? 'bg-slate-400/20 text-slate-300'
                    : idx === 2
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                #{idx + 1}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">@{c.handle}</p>
                <p className="text-slate-500 text-xs">
                  Joined {new Date(c.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-500/15 px-2.5 py-1 rounded-lg">
              <Star size={14} className="text-purple-400" />
              <span className="text-purple-400 font-bold text-sm">{c.contributionScore}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-slate-900/60 rounded-lg p-2 text-center">
              <p className="text-emerald-400 font-bold text-lg">{c.cardsOwned}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide">Owned</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2 text-center">
              <p className="text-yellow-400 font-bold text-lg">{c.cardsSearching}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide">Searching</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2 text-center">
              <p className="text-blue-400 font-bold text-lg">{c.cardsPledged}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wide">Pledged</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {c.specialties.map((s) => (
              <span
                key={s}
                className="bg-slate-700/60 text-slate-400 text-[10px] px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GapAnalysisTab({ set }: { set: CollaborativeSet }) {
  const missingCards = useMemo(
    () => set.cards.filter((c) => c.ownedBy === null),
    [set.cards]
  );
  const totalGapCost = useMemo(
    () => missingCards.reduce((sum, c) => sum + c.estimatedValue, 0),
    [missingCards]
  );
  const sampleGapCost = useMemo(() => {
    const extrapolated = set.gapCount > 0
      ? (totalGapCost / Math.max(missingCards.length, 1)) * set.gapCount
      : 0;
    return extrapolated;
  }, [totalGapCost, missingCards.length, set.gapCount]);

  return (
    <div className="space-y-5">
      {/* Gap summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <AlertTriangle size={20} className="text-red-400 mx-auto mb-1" />
          <p className="text-red-400 font-bold text-2xl">{set.gapCount}</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">Cards Missing</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <DollarSign size={20} className="text-amber-400 mx-auto mb-1" />
          <p className="text-amber-400 font-bold text-2xl">{formatFullCurrency(Math.round(sampleGapCost))}</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">Est. Cost to Complete</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-emerald-400 font-bold text-2xl">{formatFullCurrency(set.estimatedSetValue)}</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">Complete Set Value</p>
        </div>
      </div>

      {missingCards.length > 0 ? (
        <>
          <h3 className="text-white font-semibold text-sm">
            Missing Cards ({missingCards.length} of {set.gapCount} shown)
          </h3>
          <div className="space-y-2">
            {missingCards.map((card) => (
              <div
                key={card.number}
                className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/15 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-xs">#{card.number}</span>
                      <span className="text-white font-medium text-sm">{card.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {card.contributionType === 'pledged' ? (
                        <span className="text-blue-400">Pledged by contributor</span>
                      ) : (
                        <span className="text-red-400/70">Actively searching</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-semibold text-sm">
                    {formatFullCurrency(card.estimatedValue)}
                  </p>
                  <p className="text-slate-600 text-[10px]">estimated</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <Trophy size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-400 font-bold text-lg">Set Complete!</p>
          <p className="text-slate-500 text-sm mt-1">
            All {set.totalCards} cards have been accounted for. Congratulations to the team!
          </p>
        </div>
      )}
    </div>
  );
}

function MilestonesTab({ set }: { set: CollaborativeSet }) {
  return (
    <div className="space-y-3">
      {set.milestones.map((m, idx) => {
        const reached = m.reachedDate !== null;
        const isCurrent =
          !reached &&
          (idx === 0 || set.milestones[idx - 1].reachedDate !== null);
        return (
          <div
            key={m.percent}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              reached
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : isCurrent
                ? 'bg-purple-500/5 border-purple-500/30 ring-1 ring-purple-500/20'
                : 'bg-slate-800/30 border-slate-700/30'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                reached
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isCurrent
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {m.percent}%
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm ${
                  reached ? 'text-emerald-400' : isCurrent ? 'text-purple-400' : 'text-slate-500'
                }`}
              >
                {m.percent === 100
                  ? 'Set Completion'
                  : `${m.percent}% Milestone`}
              </p>
              {reached ? (
                <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Reached on{' '}
                  {new Date(m.reachedDate!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              ) : isCurrent ? (
                <p className="text-purple-400/70 text-xs flex items-center gap-1 mt-0.5">
                  <ArrowRight size={12} />
                  Next target — {Math.round(set.totalCards * (m.percent / 100)) - set.ownedCards} cards to go
                </p>
              ) : (
                <p className="text-slate-600 text-xs mt-0.5">Pending</p>
              )}
            </div>
            {reached && (
              <Trophy size={18} className="text-emerald-500/50 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SetRegistry: React.FC = () => {
  const sets = useMemo(() => getCollaborativeSets(), []);
  const stats = useMemo(() => getSetRegistryStats(), []);
  const [selectedSetId, setSelectedSetId] = useState<string>(sets[0]?.id ?? '');
  const [detailTab, setDetailTab] = useState<DetailTab>('checklist');

  const selectedSet = useMemo(
    () => sets.find((s) => s.id === selectedSetId) ?? sets[0],
    [sets, selectedSetId]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Puzzle size={22} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Collaborative Set Registry</h1>
              <p className="text-slate-400 text-sm">
                Coordinate with fellow collectors to complete master sets — track ownership, analyze gaps, and score contributions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BarChart3} color="text-purple-400" label="Active Sets" value={stats.activeSets} />
          <StatCard icon={Trophy} color="text-emerald-400" label="Completed" value={stats.completedSets} />
          <StatCard icon={Users} color="text-blue-400" label="Contributors" value={stats.totalContributors} />
          <StatCard
            icon={TrendingUp}
            color="text-amber-400"
            label="Avg Completion"
            value={`${stats.avgCompletionRate}%`}
          />
        </div>

        {/* Set Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sets.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSetId(s.id);
                setDetailTab('checklist');
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                selectedSetId === s.id
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
              }`}
            >
              <span>{s.name}</span>
              <span
                className={`ml-2 text-xs font-bold ${getCompletionColor(s.completionPercent)}`}
              >
                {Math.round(s.completionPercent)}%
              </span>
            </button>
          ))}
        </div>

        {/* Selected Set Detail */}
        {selectedSet && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {/* Set header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-xl font-bold text-white">{selectedSet.name}</h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(
                        selectedSet.status
                      )}`}
                    >
                      {selectedSet.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeClasses(
                        selectedSet.rarity
                      )}`}
                    >
                      {selectedSet.rarity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{selectedSet.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{selectedSet.year} {selectedSet.brand}</span>
                    <span>{selectedSet.sport}</span>
                    <span>Created by <span className="text-slate-300">@{selectedSet.creatorHandle}</span></span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Set Value</p>
                  <p className="text-white font-bold text-2xl">{formatFullCurrency(selectedSet.estimatedSetValue)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {selectedSet.ownedCards} / {selectedSet.totalCards} cards
                  </span>
                  <span className={`font-bold ${getCompletionColor(selectedSet.completionPercent)}`}>
                    {selectedSet.completionPercent.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar percent={selectedSet.completionPercent} size="lg" />
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{selectedSet.gapCount} gaps remaining</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Last activity: {new Date(selectedSet.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail tabs */}
            <div className="border-b border-slate-800 px-6">
              <div className="flex gap-1 -mb-px overflow-x-auto">
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide border-b-2 transition-all whitespace-nowrap ${
                      detailTab === tab.key
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {detailTab === 'checklist' && <CardChecklistTab set={selectedSet} />}
              {detailTab === 'contributors' && (
                <ContributorsTab contributors={selectedSet.contributors} />
              )}
              {detailTab === 'gaps' && <GapAnalysisTab set={selectedSet} />}
              {detailTab === 'milestones' && <MilestonesTab set={selectedSet} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetRegistry;
