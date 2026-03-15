import React, { useMemo, useState } from 'react';
import {
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Target,
  Award,
  Users,
  BarChart3,
  Star,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  LeaderboardCategory,
  PercentileRanking,
  ChallengeProgress,
  getPercentileRanking,
  getLeaderboardWithUser,
  getSportLeaderboard,
  getMonthlyChallenge,
  evaluateChallengeProgress,
  getCommunityStats,
  generateCommunityProfiles,
  CATEGORY_LABELS,
} from '../lib/benchmarkService';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

type TabId = 'rankings' | 'leaderboards' | 'challenges' | 'community';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'rankings', label: 'Rankings', icon: <Crown size={16} /> },
  { id: 'leaderboards', label: 'Leaderboards', icon: <Trophy size={16} /> },
  { id: 'challenges', label: 'Challenges', icon: <Target size={16} /> },
  { id: 'community', label: 'Community', icon: <Users size={16} /> },
];

const ALL_CATEGORIES: LeaderboardCategory[] = [
  'roi', 'portfolio_value', 'diversification',
  'grading_score', 'trading_activity', 'achievement_points',
];

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const categoryIcons: Record<LeaderboardCategory, React.ReactNode> = {
  roi: <TrendingUp size={18} />,
  portfolio_value: <BarChart3 size={18} />,
  diversification: <Star size={18} />,
  grading_score: <Shield size={18} />,
  trading_activity: <Activity size={18} />,
  achievement_points: <Award size={18} />,
};

const categoryColors: Record<LeaderboardCategory, { text: string; bg: string; border: string; bar: string }> = {
  roi: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', bar: 'bg-green-500' },
  portfolio_value: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', bar: 'bg-blue-500' },
  diversification: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', bar: 'bg-purple-500' },
  grading_score: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  trading_activity: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
  achievement_points: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', bar: 'bg-pink-500' },
};

const trendIcons: Record<string, React.ReactNode> = {
  up: <TrendingUp size={14} />,
  down: <TrendingDown size={14} />,
  stable: <Minus size={14} />,
};

const trendColors: Record<string, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-slate-400',
};

function formatValue(category: LeaderboardCategory, value: number): string {
  switch (category) {
    case 'portfolio_value':
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'roi':
      return `${value.toFixed(1)}%`;
    case 'diversification':
    case 'grading_score':
      return `${value}/100`;
    default:
      return value.toLocaleString();
  }
}

// ---- Rankings Tab ----

const RankingsTab: React.FC<{ rankings: PercentileRanking[] }> = ({ rankings }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rankings.map(ranking => {
        const colors = categoryColors[ranking.category];
        return (
          <div
            key={ranking.category}
            className={`p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3`}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                  {categoryIcons[ranking.category]}
                </div>
                <span className="text-sm font-bold text-white">
                  {CATEGORY_LABELS[ranking.category]}
                </span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${trendColors[ranking.trend]}`}>
                {trendIcons[ranking.trend]}
                {ranking.trend === 'up' ? 'Up' : ranking.trend === 'down' ? 'Down' : 'Stable'}
              </div>
            </div>

            {/* User Value */}
            <div className="text-2xl font-bebas tracking-wider text-white">
              {formatValue(ranking.category, ranking.userValue)}
            </div>

            {/* Percentile Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${colors.text}`}>
                  Top {Math.max(1, 100 - ranking.percentile)}%
                </span>
                <span className="text-slate-500 font-mono">
                  #{ranking.rank} / {ranking.totalParticipants}
                </span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${ranking.percentile}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Leaderboards Tab ----

const LeaderboardsTab: React.FC<{
  inventory: CardInventory[];
}> = ({ inventory }) => {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('portfolio_value');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const entries = useMemo(() => {
    if (selectedSport) {
      return getSportLeaderboard(selectedSport, inventory);
    }
    return getLeaderboardWithUser(selectedCategory, inventory);
  }, [selectedCategory, selectedSport, inventory]);

  const colors = categoryColors[selectedCategory];

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={colors.text}>{categoryIcons[selectedCategory]}</span>
              <span>{CATEGORY_LABELS[selectedCategory]}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {showCategoryDropdown && (
            <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSport(null);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                    cat === selectedCategory && !selectedSport ? 'text-brand-lime bg-slate-700/50' : 'text-white'
                  }`}
                >
                  <span className={categoryColors[cat].text}>{categoryIcons[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sport Sub-tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedSport(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            !selectedSport
              ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Sports
        </button>
        {SPORTS.map(sport => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedSport === sport
                ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-1">
        {entries.map((entry, i) => {
          const isTop3 = entry.rank <= 3;
          const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];
          return (
            <div
              key={`${entry.displayName}-${i}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                entry.isUser
                  ? 'bg-brand-lime/10 border border-brand-lime/25'
                  : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/60'
              }`}
            >
              {/* Rank */}
              <span className={`w-8 text-center font-bebas text-lg tracking-wider ${
                isTop3 ? medalColors[entry.rank - 1] : 'text-slate-500'
              }`}>
                {entry.rank}
              </span>

              {/* Medal Icon for Top 3 */}
              {isTop3 ? (
                <Crown size={14} className={medalColors[entry.rank - 1]} />
              ) : (
                <span className="w-[14px]" />
              )}

              {/* Name */}
              <span className={`flex-1 font-medium truncate ${
                entry.isUser ? 'text-brand-lime' : 'text-white'
              }`}>
                {entry.displayName}
                {entry.isUser && (
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-brand-lime/60">
                    (you)
                  </span>
                )}
              </span>

              {/* Value */}
              <span className={`font-mono text-right ${
                entry.isUser ? 'text-brand-lime' : 'text-slate-300'
              }`}>
                {selectedSport
                  ? `$${entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : formatValue(selectedCategory, entry.value)
                }
              </span>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No entries to display
        </div>
      )}
    </div>
  );
};

// ---- Challenges Tab ----

const ChallengesTab: React.FC<{
  progress: ChallengeProgress[];
}> = ({ progress }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Monthly Challenges
        </p>
        <span className="text-xs text-slate-400">
          {progress.filter(p => p.completed).length} / {progress.length} completed
        </span>
      </div>

      {progress.map(ch => {
        const isComplete = ch.completed;
        return (
          <div
            key={ch.challengeId}
            className={`p-5 rounded-2xl border space-y-3 ${
              isComplete
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 size={18} className="text-green-400" />
                ) : (
                  <Target size={18} className="text-amber-400" />
                )}
                <span className={`text-sm font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
                  {ch.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Award size={12} />
                  {ch.reward} pts
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {ch.current} / {ch.requirement}
                </span>
                <span className={`font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>
                  {ch.percentComplete}%
                </span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${ch.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Days Remaining */}
            {!isComplete && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                {ch.daysRemaining} day{ch.daysRemaining !== 1 ? 's' : ''} remaining
              </div>
            )}

            {isComplete && (
              <div className="text-xs text-green-400/70 font-medium">
                Challenge completed! {ch.reward} achievement points earned.
              </div>
            )}
          </div>
        );
      })}

      {progress.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No active challenges this month
        </div>
      )}
    </div>
  );
};

// ---- Community Tab ----

const CommunityTab: React.FC<{
  inventory: CardInventory[];
}> = ({ inventory }) => {
  const stats = useMemo(() => getCommunityStats(), []);
  const profiles = useMemo(() => generateCommunityProfiles(), []);

  // Build distribution histogram for portfolio values
  const histogram = useMemo(() => {
    const values = profiles.map(p => p.portfolioValue);
    const userValue = inventory.reduce(
      (sum, c) => sum + (c.currentValue ?? c.purchasePrice),
      0
    );

    // Create buckets
    const buckets = [
      { label: '$0-500', min: 0, max: 500 },
      { label: '$500-1K', min: 500, max: 1000 },
      { label: '$1K-2.5K', min: 1000, max: 2500 },
      { label: '$2.5K-5K', min: 2500, max: 5000 },
      { label: '$5K-10K', min: 5000, max: 10000 },
      { label: '$10K-25K', min: 10000, max: 25000 },
      { label: '$25K-50K', min: 25000, max: 50000 },
      { label: '$50K+', min: 50000, max: Infinity },
    ];

    const counts = buckets.map(b => ({
      ...b,
      count: values.filter(v => v >= b.min && v < b.max).length,
      isUserBucket: userValue >= b.min && userValue < b.max,
    }));

    const maxCount = Math.max(1, ...counts.map(c => c.count));
    return counts.map(c => ({ ...c, barWidth: Math.round((c.count / maxCount) * 100) }));
  }, [profiles, inventory]);

  // ROI distribution
  const roiHistogram = useMemo(() => {
    const rois = profiles.map(p => p.totalROI);
    const userROI = (() => {
      const totalCost = inventory.reduce((s, c) => s + c.purchasePrice, 0);
      const totalValue = inventory.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);
      return totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    })();

    const buckets = [
      { label: '<-20%', min: -Infinity, max: -20 },
      { label: '-20-0%', min: -20, max: 0 },
      { label: '0-10%', min: 0, max: 10 },
      { label: '10-25%', min: 10, max: 25 },
      { label: '25-50%', min: 25, max: 50 },
      { label: '50%+', min: 50, max: Infinity },
    ];

    const counts = buckets.map(b => ({
      ...b,
      count: rois.filter(v => v >= b.min && v < b.max).length,
      isUserBucket: userROI >= b.min && userROI < b.max,
    }));

    const maxCount = Math.max(1, ...counts.map(c => c.count));
    return counts.map(c => ({ ...c, barWidth: Math.round((c.count / maxCount) * 100) }));
  }, [profiles, inventory]);

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Collectors
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {stats.totalCollectors.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg Value
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${stats.avgPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg Cards
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {stats.avgCardCount}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg ROI
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${stats.avgROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.avgROI >= 0 ? '+' : ''}{stats.avgROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Portfolio Value Distribution */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Portfolio Value Distribution
        </p>
        <div className="space-y-2">
          {histogram.map((bucket, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-right text-slate-500 font-mono text-[11px] flex-shrink-0">
                {bucket.label}
              </span>
              <div className="flex-1 h-4 bg-slate-700/50 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    bucket.isUserBucket ? 'bg-brand-lime' : 'bg-blue-500/60'
                  }`}
                  style={{ width: `${bucket.barWidth}%` }}
                />
              </div>
              <span className={`w-8 text-right font-mono ${
                bucket.isUserBucket ? 'text-brand-lime font-bold' : 'text-slate-500'
              }`}>
                {bucket.count}
              </span>
              {bucket.isUserBucket && (
                <span className="text-[9px] font-black text-brand-lime uppercase tracking-widest">
                  You
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ROI Distribution */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          ROI Distribution
        </p>
        <div className="space-y-2">
          {roiHistogram.map((bucket, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-right text-slate-500 font-mono text-[11px] flex-shrink-0">
                {bucket.label}
              </span>
              <div className="flex-1 h-4 bg-slate-700/50 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    bucket.isUserBucket
                      ? 'bg-brand-lime'
                      : bucket.min >= 0
                        ? 'bg-green-500/60'
                        : 'bg-red-500/60'
                  }`}
                  style={{ width: `${bucket.barWidth}%` }}
                />
              </div>
              <span className={`w-8 text-right font-mono ${
                bucket.isUserBucket ? 'text-brand-lime font-bold' : 'text-slate-500'
              }`}>
                {bucket.count}
              </span>
              {bucket.isUserBucket && (
                <span className="text-[9px] font-black text-brand-lime uppercase tracking-widest">
                  You
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
  inventory,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('rankings');

  const rankings = useMemo(() => getPercentileRanking(inventory), [inventory]);
  const challenges = useMemo(() => getMonthlyChallenge(), []);
  const progress = useMemo(
    () => evaluateChallengeProgress(challenges, inventory),
    [challenges, inventory]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Trophy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Users size={10} />
                  {(rankings[0]?.totalParticipants ?? 501).toLocaleString()} collectors
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Community <span className="text-amber-400">Benchmarks</span> & Leaderboards
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
          {TABS.map(tab => (
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
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'rankings' && <RankingsTab rankings={rankings} />}
          {activeTab === 'leaderboards' && <LeaderboardsTab inventory={inventory} />}
          {activeTab === 'challenges' && <ChallengesTab progress={progress} />}
          {activeTab === 'community' && <CommunityTab inventory={inventory} />}
        </div>
      </div>
    </div>
  );
};

export default BenchmarkModal;
