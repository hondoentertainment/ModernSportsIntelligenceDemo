import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Trophy,
  Users,
  Radio,
  Copy,
  BarChart3,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  getLeaderboard,
  getMyFollowing,
  getTradeSignals,
  getMirrorPortfolio,
  getCommunityBenchmark,
  getTradeHistory,
  followCollector,
  CollectorCategory,
  Timeframe,
  FollowRelation,
  TradeSignal,
  CopyPortfolio,
  PerformanceMetrics,
  TradeHistory,
} from '../lib/copyTradingService';

interface CopyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'leaderboard' | 'following' | 'signals' | 'mirror' | 'performance';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  { id: 'following', label: 'Following', icon: <Users size={16} /> },
  { id: 'signals', label: 'Signals', icon: <Radio size={16} /> },
  { id: 'mirror', label: 'Mirror', icon: <Copy size={16} /> },
  { id: 'performance', label: 'My Stats', icon: <BarChart3 size={16} /> },
];

const CATEGORIES: CollectorCategory[] = ['Overall', 'Modern Basketball', 'Vintage Baseball', 'Modern Football', 'Pokemon'];
const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1yr', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

function formatROI(roi: number): string {
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function _formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---- Leaderboard Tab ----

const LeaderboardTab: React.FC<{
  category: CollectorCategory;
  timeframe: Timeframe;
  onCategoryChange: (_c: CollectorCategory) => void;
  onTimeframeChange: (_t: Timeframe) => void;
  searchQuery: string;
  onSearchChange: (_q: string) => void;
  sortBy: string;
  onSortChange: (_s: string) => void;
  onFollow: (_userId: string) => void;
}> = ({ category, timeframe, onCategoryChange, onTimeframeChange, searchQuery, onSearchChange, sortBy, onSortChange, onFollow }) => {
  const [showFilters, setShowFilters] = useState(false);
  const leaderboard = useMemo(() => getLeaderboard(category, timeframe), [category, timeframe]);

  const filtered = useMemo(() => {
    let results = [...leaderboard];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(e =>
        e.collector.displayName.toLowerCase().includes(q) ||
        e.collector.username.toLowerCase().includes(q) ||
        e.collector.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'roi') results.sort((a, b) => b.metrics.annualizedROI - a.metrics.annualizedROI);
    else if (sortBy === 'sharpe') results.sort((a, b) => b.metrics.sharpeRatio - a.metrics.sharpeRatio);
    else if (sortBy === 'followers') results.sort((a, b) => b.collector.followerCount - a.collector.followerCount);
    else if (sortBy === 'winrate') results.sort((a, b) => b.metrics.hitRate - a.metrics.hitRate);
    else if (sortBy === 'alpha') results.sort((a, b) => b.alphaScore - a.alphaScore);
    return results;
  }, [leaderboard, searchQuery, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search collectors..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            showFilters ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white bg-slate-800 border border-slate-700'
          }`}
        >
          <Filter size={12} />
          Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Category</label>
              <select
                value={category}
                onChange={e => onCategoryChange(e.target.value as CollectorCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={e => onTimeframeChange(e.target.value as Timeframe)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="alpha">Alpha Score</option>
                <option value="roi">ROI</option>
                <option value="sharpe">Sharpe Ratio</option>
                <option value="followers">Followers</option>
                <option value="winrate">Win Rate</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-2 px-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Collector</div>
        <div className="col-span-2 text-right">ROI</div>
        <div className="col-span-2 text-right">Sharpe</div>
        <div className="col-span-1 text-right">Win%</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        {filtered.map((entry) => {
          const rankDiff = entry.previousRank - entry.rank;
          return (
            <div
              key={entry.collector.id}
              className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-slate-600 transition-colors"
            >
              <div className="col-span-1 flex items-center gap-1">
                <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {entry.rank}
                </span>
                {rankDiff > 0 && <ArrowUp size={10} className="text-green-400" />}
                {rankDiff < 0 && <ArrowDown size={10} className="text-red-400" />}
              </div>
              <div className="col-span-4 flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{entry.collector.avatarUrl}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white truncate">{entry.collector.displayName}</p>
                    {entry.collector.verified && <Shield size={10} className="text-blue-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">{entry.collector.category}</p>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-xs font-bold ${entry.metrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatROI(entry.metrics.annualizedROI)}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs font-bold text-slate-300">{entry.metrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-xs text-slate-400">{(entry.metrics.hitRate * 100).toFixed(0)}%</span>
              </div>
              <div className="col-span-2 text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); onFollow(entry.collector.id); }}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    entry.collector.isFollowing
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 border border-slate-600'
                  }`}
                >
                  {entry.collector.isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
                  {entry.collector.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Following Tab ----

const FollowingTab: React.FC = () => {
  const following = useMemo(() => getMyFollowing(), []);

  if (following.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={40} className="mx-auto text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">You are not following any collectors yet.</p>
        <p className="text-xs text-slate-600 mt-1">Go to the Leaderboard tab to discover top performers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        {following.length} collector{following.length !== 1 ? 's' : ''} followed
      </p>
      {following.map((rel: FollowRelation) => {
        const trades = getTradeHistory(rel.leaderId).slice(0, 3);
        return (
          <div key={rel.id} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rel.leaderAvatar}</span>
                <div>
                  <p className="text-sm font-bold text-white">{rel.leaderName}</p>
                  <p className="text-[9px] text-slate-500">Followed {timeAgo(rel.followedAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${rel.roiSinceFollowed >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatROI(rel.roiSinceFollowed)}
                </p>
                <p className="text-[9px] text-slate-500">since followed</p>
              </div>
            </div>

            {/* Recent Trades */}
            {trades.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Recent Trades</p>
                {trades.map((trade: TradeHistory) => (
                  <div key={trade.id} className="flex items-center justify-between py-1.5 px-2 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`p-0.5 rounded ${trade.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {trade.action === 'buy' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      </div>
                      <span className="text-[10px] text-slate-300 truncate max-w-[180px]">{trade.cardName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">${trade.price.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-[9px] text-slate-600">
              <span className="flex items-center gap-1"><Clock size={9} /> {rel.signalDelay} delay</span>
              <span>{rel.tradesSinceFollowed} trades since follow</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Signals Tab ----

const SignalsTab: React.FC = () => {
  const signals = useMemo(() => getTradeSignals('current_user'), []);

  if (signals.length === 0) {
    return (
      <div className="text-center py-12">
        <Radio size={40} className="mx-auto text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">No trade signals yet.</p>
        <p className="text-xs text-slate-600 mt-1">Follow collectors to receive their trade signals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        {signals.length} signal{signals.length !== 1 ? 's' : ''}
      </p>
      {signals.map((signal: TradeSignal) => (
        <div key={signal.id} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${signal.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {signal.action === 'buy' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{signal.cardName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg">{signal.collectorAvatar}</span>
                  <span className="text-[10px] text-slate-500">{signal.collectorName}</span>
                  <span className="text-[9px] text-slate-600">{timeAgo(signal.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">${signal.price.toLocaleString()}</p>
              <p className={`text-[10px] font-bold uppercase ${signal.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                {signal.action} x{signal.quantity}
              </p>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-800/50 rounded-lg">
            <p className="text-[10px] text-slate-400 italic">&ldquo;{signal.reasoning}&rdquo;</p>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-600">
            <span className="flex items-center gap-1">
              <Target size={9} />
              Confidence: {(signal.confidence * 100).toFixed(0)}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-500 uppercase font-bold tracking-wider">
              {signal.cardCategory}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Mirror Tab ----

const MirrorTab: React.FC = () => {
  const leaderboard = useMemo(() => getLeaderboard(), []);
  const [selectedLeader, setSelectedLeader] = useState(leaderboard[0]?.collector.id ?? '');
  const [budget, setBudget] = useState(5000);
  const [portfolio, setPortfolio] = useState<CopyPortfolio | null>(null);
  const [mirrored, setMirrored] = useState(false);

  const handleGenerate = useCallback(() => {
    if (selectedLeader && budget > 0) {
      setPortfolio(getMirrorPortfolio(selectedLeader, budget));
      setMirrored(false);
    }
  }, [selectedLeader, budget]);

  const handleMirror = useCallback(() => {
    setMirrored(true);
  }, []);

  return (
    <div className="space-y-5">
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Configure Mirror Portfolio
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Select Leader
            </label>
            <select
              value={selectedLeader}
              onChange={e => setSelectedLeader(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              {leaderboard.map(entry => (
                <option key={entry.collector.id} value={entry.collector.id}>
                  {entry.collector.displayName} ({formatROI(entry.metrics.annualizedROI)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              min={100}
              step={500}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className="w-full py-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500/25 transition-colors"
        >
          Generate Mirror Portfolio
        </button>
      </div>

      {portfolio && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
              <p className="text-sm font-bold text-white">${portfolio.totalAllocated.toLocaleString()}</p>
              <p className="text-[9px] text-slate-500 uppercase">Allocated</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
              <p className="text-sm font-bold text-white">${portfolio.remainingCash.toLocaleString()}</p>
              <p className="text-[9px] text-slate-500 uppercase">Cash Left</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
              <p className="text-sm font-bold text-green-400">{formatROI(portfolio.expectedROI)}</p>
              <p className="text-[9px] text-slate-500 uppercase">Exp. ROI</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
              <p className={`text-sm font-bold ${
                portfolio.riskLevel === 'conservative' ? 'text-green-400' :
                portfolio.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {portfolio.riskLevel.charAt(0).toUpperCase() + portfolio.riskLevel.slice(1)}
              </p>
              <p className="text-[9px] text-slate-500 uppercase">Risk</p>
            </div>
          </div>

          {/* Allocations */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Portfolio Allocations
            </p>
            {portfolio.allocations.map((alloc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{alloc.cardName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-500">{alloc.leaderWeightPct.toFixed(1)}% weight</span>
                    <span className="text-[9px] text-slate-600">{alloc.estimatedShares} unit{alloc.estimatedShares !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs font-bold text-white">${alloc.targetAmount.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500">@ ${alloc.currentPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mirror Action */}
          <button
            onClick={handleMirror}
            disabled={mirrored}
            className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${
              mirrored
                ? 'bg-green-500/15 text-green-400 border border-green-500/30 cursor-default'
                : 'bg-amber-500 text-black hover:bg-amber-400'
            }`}
          >
            {mirrored ? 'Portfolio Mirrored Successfully' : 'Mirror This Portfolio'}
          </button>
        </div>
      )}
    </div>
  );
};

// ---- Performance Tab ----

const PerformanceTab: React.FC = () => {
  const benchmark = useMemo(() => getCommunityBenchmark(), []);
  const metrics: PerformanceMetrics = useMemo(() => ({
    userId: 'current_user',
    annualizedROI: benchmark.userROI,
    sharpeRatio: 1.42,
    sortinoRatio: 2.15,
    maxDrawdown: -14.3,
    hitRate: 0.62,
    avgGainPct: 28.5,
    avgLossPct: -12.8,
    winCount: 47,
    lossCount: 29,
    totalTrades: 76,
    profitFactor: 2.31,
    calmarRatio: 1.29,
    monthlyReturns: [
      { month: 'Jan', returnPct: 3.2 }, { month: 'Feb', returnPct: -1.5 },
      { month: 'Mar', returnPct: 5.8 }, { month: 'Apr', returnPct: 2.1 },
      { month: 'May', returnPct: -3.4 }, { month: 'Jun', returnPct: 4.6 },
      { month: 'Jul', returnPct: 1.9 }, { month: 'Aug', returnPct: -0.8 },
      { month: 'Sep', returnPct: 6.2 }, { month: 'Oct', returnPct: -2.1 },
      { month: 'Nov', returnPct: 3.8 }, { month: 'Dec', returnPct: 1.5 },
    ],
  }), [benchmark]);

  const maxReturn = Math.max(...metrics.monthlyReturns.map(m => Math.abs(m.returnPct)));

  return (
    <div className="space-y-5">
      {/* Rank & Benchmark */}
      <div className="p-5 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-black text-amber-400/70 uppercase tracking-widest">Community Ranking</p>
            <p className="text-3xl font-bebas tracking-widest text-white mt-1">
              #{benchmark.rank} <span className="text-lg text-amber-400">/ {benchmark.totalCollectors}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Percentile</p>
            <p className="text-3xl font-bebas tracking-widest text-amber-400">
              Top {100 - benchmark.percentile}%
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Your portfolio returned <span className="text-green-400 font-bold">{formatROI(benchmark.userROI)}</span> this year,
          beating <span className="text-amber-400 font-bold">{benchmark.percentile}%</span> of collectors.
          Median return: {formatROI(benchmark.medianROI)}.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Annual ROI', value: formatROI(metrics.annualizedROI), color: metrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), color: 'text-slate-200' },
          { label: 'Sortino Ratio', value: metrics.sortinoRatio.toFixed(2), color: 'text-slate-200' },
          { label: 'Max Drawdown', value: `${metrics.maxDrawdown.toFixed(1)}%`, color: 'text-red-400' },
          { label: 'Hit Rate', value: `${(metrics.hitRate * 100).toFixed(0)}%`, color: 'text-slate-200' },
          { label: 'Avg Win', value: formatROI(metrics.avgGainPct), color: 'text-green-400' },
          { label: 'Avg Loss', value: `${metrics.avgLossPct.toFixed(1)}%`, color: 'text-red-400' },
          { label: 'Profit Factor', value: metrics.profitFactor.toFixed(2), color: 'text-slate-200' },
        ].map((item) => (
          <div key={item.label} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[9px] text-slate-500 uppercase mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Returns Chart */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly Returns
        </p>
        <div className="flex items-end gap-1.5 h-24">
          {metrics.monthlyReturns.map(m => {
            const height = Math.max(4, (Math.abs(m.returnPct) / maxReturn) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold text-slate-500">{m.returnPct > 0 ? '+' : ''}{m.returnPct.toFixed(1)}%</span>
                <div
                  className={`w-full rounded-t-md ${m.returnPct >= 0 ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[8px] text-slate-600">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Rankings */}
      <div>
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Category Rankings
        </p>
        <div className="space-y-1.5">
          {benchmark.categoryRanks.map(cr => (
            <div key={cr.category} className="flex items-center justify-between p-2.5 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <span className="text-xs text-slate-300">{cr.category}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/60 rounded-full"
                    style={{ width: `${((cr.total - cr.rank) / cr.total) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">#{cr.rank}/{cr.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Win/Loss Record */}
      <div className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
        <div className="flex items-center gap-1.5 text-green-400">
          <TrendingUp size={14} />
          <span className="text-sm font-bold">{metrics.winCount}W</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <TrendingDown size={14} />
          <span className="text-sm font-bold">{metrics.lossCount}L</span>
        </div>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            style={{ width: `${(metrics.winCount / metrics.totalTrades) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-400">{metrics.totalTrades} trades</span>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const CopyTradingModal: React.FC<CopyTradingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('leaderboard');
  const [category, setCategory] = useState<CollectorCategory>('Overall');
  const [timeframe, setTimeframe] = useState<Timeframe>('1yr');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alpha');
  const [, setFollowVersion] = useState(0);

  const following = useMemo(() => getMyFollowing(), []);
  const signals = useMemo(() => getTradeSignals('current_user'), []);

  const handleFollow = useCallback((userId: string) => {
    followCollector(userId);
    setFollowVersion(v => v + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Copy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Trophy size={10} />
                  Alpha Network
                </span>
                {following.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Users size={10} />
                    {following.length} following
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Copy <span className="text-amber-400">Trading</span> Network
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
            let badge: number | null = null;
            if (tab.id === 'following') badge = following.length;
            if (tab.id === 'signals') badge = signals.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {badge !== null && badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              category={category}
              timeframe={timeframe}
              onCategoryChange={setCategory}
              onTimeframeChange={setTimeframe}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onFollow={handleFollow}
            />
          )}
          {activeTab === 'following' && <FollowingTab />}
          {activeTab === 'signals' && <SignalsTab />}
          {activeTab === 'mirror' && <MirrorTab />}
          {activeTab === 'performance' && <PerformanceTab />}
        </div>
      </div>
    </div>
  );
};

export default CopyTradingModal;
