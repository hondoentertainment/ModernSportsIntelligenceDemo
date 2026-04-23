// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  BookOpen,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  DollarSign,
  Award,
  ArrowLeft,
  Plus,
  Trash2,
  BarChart3,
  Filter,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  SetEnrollment,
  ParallelType,
  getAvailableSets,
  getSetById,
  getSetCardList,
  enrollInSet,
  getSetProgress,
  getMissingCardsForEnrollment,
  getParallelProgress,
  getSetValueAnalysis,
  getMasterSetScore,
  loadEnrollments,
  removeEnrollment,
} from '../lib/core/setRegistryService';

interface SetRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'browse' | 'mysets' | 'detail';
type MissingSortMode = 'cheapest' | 'rarest';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'browse', label: 'Browse Sets', icon: <Search size={16} /> },
  { id: 'mysets', label: 'My Sets', icon: <BookOpen size={16} /> },
  { id: 'detail', label: 'Set Detail', icon: <CheckCircle2 size={16} /> },
];

const SPORTS: (Sport | 'All')[] = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const PARALLEL_LABELS: Record<ParallelType, string> = {
  base: 'Base',
  refractor: 'Insert / Refractor',
  auto: 'Autograph',
  numbered: 'Numbered',
  '1of1': '1/1',
};

const PARALLEL_TYPES: ParallelType[] = ['base', 'refractor', 'auto', 'numbered', '1of1'];

// ---- Browse Tab ----

const BrowseTab: React.FC<{
  cards: CardInventory[];
  enrolledSetIds: Set<string>;
  onEnroll: (_setId: string) => void;
  onViewDetail: (_setId: string) => void;
}> = ({ _cards, enrolledSetIds, onEnroll, onViewDetail }) => {
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');
  const [showSportDropdown, setShowSportDropdown] = useState(false);

  const sets = useMemo(() => {
    if (sportFilter === 'All') return getAvailableSets();
    return getAvailableSets(sportFilter);
  }, [sportFilter]);

  return (
    <div className="space-y-4">
      {/* Sport Filter */}
      <div className="relative">
        <button
          onClick={() => setShowSportDropdown(!showSportDropdown)}
          className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors w-full sm:w-64"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-400" />
            <span>{sportFilter === 'All' ? 'All Sports' : sportFilter}</span>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
        {showSportDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => {
                  setSportFilter(sport);
                  setShowSportDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                  sport === sportFilter ? 'text-brand-lime bg-slate-700/50' : 'text-white'
                }`}
              >
                {sport === 'All' ? 'All Sports' : sport}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Set Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sets.map(set => {
          const isEnrolled = enrolledSetIds.has(set.id);
          return (
            <div
              key={set.id}
              className={`p-5 rounded-2xl border space-y-3 ${
                isEnrolled
                  ? 'bg-blue-500/5 border-blue-500/20'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {/* Set Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{set.name}</h4>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-0.5">
                    {set.sport} &bull; {set.manufacturer} &bull; {set.year}
                  </p>
                </div>
                {isEnrolled && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md flex-shrink-0 ml-2">
                    Enrolled
                  </span>
                )}
              </div>

              {/* Card Counts */}
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-md">
                  {set.cardCount} base
                </span>
                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-md">
                  {set.insertCount} inserts
                </span>
                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-md">
                  {set.autoCount} autos
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2">{set.description}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {!isEnrolled ? (
                  <button
                    onClick={() => onEnroll(set.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-500/25 transition-colors"
                  >
                    <Plus size={12} />
                    Enroll
                  </button>
                ) : (
                  <button
                    onClick={() => onViewDetail(set.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-lime/15 border border-brand-lime/30 text-brand-lime text-xs font-bold rounded-lg hover:bg-brand-lime/25 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    View Progress
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sets.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No sets found for the selected sport.
        </div>
      )}
    </div>
  );
};

// ---- My Sets Tab ----

const MySetsTab: React.FC<{
  enrollments: SetEnrollment[];
  onViewDetail: (_setId: string) => void;
  onRemove: (_enrollmentId: string) => void;
}> = ({ enrollments, onViewDetail, onRemove }) => {
  const progressData = useMemo(() => {
    return enrollments.map(e => ({
      enrollment: e,
      progress: getSetProgress(e),
    }));
  }, [enrollments]);

  if (progressData.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <BookOpen size={40} className="mx-auto text-slate-600" />
        <p className="text-slate-400 text-sm">No sets enrolled yet.</p>
        <p className="text-slate-600 text-xs">Browse available sets to start tracking your collection progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Enrolled Sets
        </p>
        <span className="text-xs text-slate-400">
          {progressData.length} set{progressData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {progressData
        .sort((a, b) => b.progress.completionPercent - a.progress.completionPercent)
        .map(({ enrollment, progress }) => (
        <div
          key={enrollment.id}
          className={`p-5 rounded-2xl border space-y-3 ${
            progress.completionPercent >= 100
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-slate-800/50 border-slate-700'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{progress.setName}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-lg font-bebas tracking-wider ${
                progress.completionPercent >= 100 ? 'text-green-400' : 'text-white'
              }`}>
                {progress.completionPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {progress.ownedCount} / {progress.totalCards} cards
              </span>
              <span className="text-slate-500">
                {progress.missingCount} missing
              </span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  progress.completionPercent >= 100
                    ? 'bg-green-500'
                    : progress.completionPercent >= 75
                      ? 'bg-brand-lime'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, progress.completionPercent)}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Est. ${progress.estimatedCostToComplete.toLocaleString(undefined, { maximumFractionDigits: 0 })} to complete
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemove(enrollment.id)}
                className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                title="Remove enrollment"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => onViewDetail(enrollment.setId)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-500/25 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Set Detail Tab ----

const SetDetailTab: React.FC<{
  setId: string;
  enrollment: SetEnrollment;
  onBack: () => void;
}> = ({ setId, enrollment, onBack }) => {
  const [activeParallel, setActiveParallel] = useState<ParallelType | 'all'>('all');
  const [missingSortMode, setMissingSortMode] = useState<MissingSortMode>('cheapest');
  const [showChecklist, setShowChecklist] = useState(true);

  const set = useMemo(() => getSetById(setId), [setId]);
  const setCards = useMemo(() => getSetCardList(setId), [setId]);
  const progress = useMemo(() => getSetProgress(enrollment), [enrollment]);
  const missingCards = useMemo(() => getMissingCardsForEnrollment(enrollment), [enrollment]);
  const valueAnalysis = useMemo(() => getSetValueAnalysis(enrollment), [enrollment]);
  const masterScore = useMemo(() => getMasterSetScore(enrollment), [enrollment]);

  const parallelProgressData = useMemo(() => {
    return PARALLEL_TYPES.map(pt => ({
      type: pt,
      label: PARALLEL_LABELS[pt],
      ...getParallelProgress(enrollment, pt),
    }));
  }, [enrollment]);

  const sortedMissing = useMemo(() => {
    const sorted = [...missingCards];
    if (missingSortMode === 'cheapest') {
      sorted.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    } else {
      sorted.sort((a, b) => b.rarity - a.rarity);
    }
    return sorted;
  }, [missingCards, missingSortMode]);

  const filteredCards = useMemo(() => {
    if (activeParallel === 'all') return setCards;
    return setCards.filter(sc => sc.parallelType === activeParallel);
  }, [setCards, activeParallel]);

  const filteredMissing = useMemo(() => {
    if (activeParallel === 'all') return sortedMissing;
    return sortedMissing.filter(mc => mc.parallelType === activeParallel);
  }, [sortedMissing, activeParallel]);

  if (!set) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Set not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button + Set Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{set.name}</h3>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {set.sport} &bull; {set.manufacturer} &bull; {set.year}
          </p>
        </div>
        <span className={`text-2xl font-bebas tracking-wider ${
          progress.completionPercent >= 100 ? 'text-green-400' : 'text-blue-400'
        }`}>
          {progress.completionPercent}%
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {progress.ownedCount} / {progress.totalCards} cards owned
          </span>
          <span className="text-slate-500">
            {progress.missingCount} missing
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progress.completionPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, progress.completionPercent)}%` }}
          />
        </div>
      </div>

      {/* Value Analysis + Master Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Value Analysis */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Value Analysis</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Owned Value</span>
              <span className="font-mono text-white">
                ${valueAnalysis.totalOwnedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Complete Set Value</span>
              <span className="font-mono text-white">
                ${valueAnalysis.estimatedCompleteSetValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Set Premium</span>
              <span className="font-mono text-green-400">+{valueAnalysis.setPremiumPercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cost to Complete</span>
              <span className="font-mono text-amber-400">
                ${progress.estimatedCostToComplete.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Master Set Score */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Master Score</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bebas tracking-wider text-amber-400">
              {masterScore.totalScore}
            </span>
            <span className="text-xs text-slate-500">
              / {masterScore.maxPossibleScore} ({masterScore.percentOfMax}%)
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { label: 'Base (1x)', score: masterScore.baseScore, color: 'bg-slate-500' },
              { label: 'Insert (2x)', score: masterScore.insertScore, color: 'bg-blue-500' },
              { label: 'Auto (5x)', score: masterScore.autoScore, color: 'bg-purple-500' },
              { label: 'Numbered (10x)', score: masterScore.numberedScore, color: 'bg-amber-500' },
              { label: '1/1 (50x)', score: masterScore.oneOfOneScore, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-20 text-slate-500">{item.label}</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${masterScore.maxPossibleScore > 0 ? (item.score / masterScore.maxPossibleScore) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-slate-400">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parallel Sub-tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveParallel('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeParallel === 'all'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Cards
        </button>
        {parallelProgressData
          .filter(pp => pp.total > 0)
          .map(pp => (
          <button
            key={pp.type}
            onClick={() => setActiveParallel(pp.type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeParallel === pp.type
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {pp.label} ({pp.owned}/{pp.total})
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowChecklist(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            showChecklist
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 size={12} />
          Checklist
        </button>
        <button
          onClick={() => setShowChecklist(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            !showChecklist
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <XCircle size={12} />
          Missing Only
        </button>
        {!showChecklist && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Sort:</span>
            <button
              onClick={() => setMissingSortMode('cheapest')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                missingSortMode === 'cheapest'
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Cheapest
            </button>
            <button
              onClick={() => setMissingSortMode('rarest')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                missingSortMode === 'rarest'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              Rarest
            </button>
          </div>
        )}
      </div>

      {/* Card List */}
      {showChecklist ? (
        <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
          {filteredCards.map(sc => {
            const isOwned = enrollment.ownedCardNumbers.includes(sc.cardNumber);
            return (
              <div
                key={sc.cardNumber}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isOwned
                    ? 'bg-green-500/5 border border-green-500/15'
                    : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/60'
                }`}
              >
                {isOwned ? (
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-400/50 flex-shrink-0" />
                )}
                <span className="w-12 text-xs font-mono text-slate-500 flex-shrink-0">
                  #{sc.cardNumber}
                </span>
                <span className={`flex-1 text-xs truncate ${isOwned ? 'text-white' : 'text-slate-400'}`}>
                  {sc.player}
                </span>
                <span className="text-[10px] text-slate-600 flex-shrink-0">
                  {sc.team}
                </span>
                {!isOwned && (
                  <span className="text-xs font-mono text-amber-400/70 flex-shrink-0">
                    ~${sc.estimatedValue.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
          {filteredMissing.map(mc => (
            <div
              key={mc.cardNumber}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/30 border border-transparent hover:bg-slate-800/60 text-sm transition-colors"
            >
              <XCircle size={16} className="text-red-400/50 flex-shrink-0" />
              <span className="w-12 text-xs font-mono text-slate-500 flex-shrink-0">
                #{mc.cardNumber}
              </span>
              <span className="flex-1 text-xs text-slate-400 truncate">
                {mc.player}
              </span>
              <span className="text-[10px] text-slate-600 flex-shrink-0">
                {mc.team}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Rarity dots */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(5, Math.ceil(mc.rarity / 2)) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        mc.rarity >= 8 ? 'bg-purple-400' : mc.rarity >= 5 ? 'bg-blue-400' : 'bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-amber-400">
                  ${mc.estimatedPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {filteredMissing.length === 0 && (
            <div className="text-center py-8 text-green-400 text-sm font-bold">
              All cards collected for this category!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const SetRegistryModal: React.FC<SetRegistryModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('browse');
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<SetEnrollment[]>(() => loadEnrollments());

  const enrolledSetIds = useMemo(() => {
    return new Set(enrollments.map(e => e.setId));
  }, [enrollments]);

  const handleEnroll = useCallback((setId: string) => {
    const _enrollment = enrollInSet(setId, cards);
    const updated = loadEnrollments();
    setEnrollments(updated);
    setSelectedSetId(setId);
    setActiveTab('detail');
  }, [cards]);

  const handleViewDetail = useCallback((setId: string) => {
    setSelectedSetId(setId);
    setActiveTab('detail');
  }, []);

  const handleRemove = useCallback((enrollmentId: string) => {
    removeEnrollment(enrollmentId);
    const updated = loadEnrollments();
    setEnrollments(updated);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSetId(null);
    setActiveTab('mysets');
  }, []);

  const selectedEnrollment = useMemo(() => {
    if (!selectedSetId) return null;
    return enrollments.find(e => e.setId === selectedSetId) ?? null;
  }, [selectedSetId, enrollments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <BarChart3 size={10} />
                  {enrollments.length} enrolled
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Set <span className="text-blue-400">Registry</span> & Checklists
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => {
            // Hide detail tab when no set is selected
            if (tab.id === 'detail' && !selectedSetId) return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'browse' && (
            <BrowseTab
              cards={cards}
              enrolledSetIds={enrolledSetIds}
              onEnroll={handleEnroll}
              onViewDetail={handleViewDetail}
            />
          )}
          {activeTab === 'mysets' && (
            <MySetsTab
              enrollments={enrollments}
              onViewDetail={handleViewDetail}
              onRemove={handleRemove}
            />
          )}
          {activeTab === 'detail' && selectedSetId && selectedEnrollment && (
            <SetDetailTab
              setId={selectedSetId}
              enrollment={selectedEnrollment}
              onBack={handleBack}
            />
          )}
          {activeTab === 'detail' && (!selectedSetId || !selectedEnrollment) && (
            <div className="text-center py-12 text-slate-500 text-sm">
              Select a set from My Sets to view its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetRegistryModal;
