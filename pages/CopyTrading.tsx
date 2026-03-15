import React, { useState, useMemo, useCallback } from 'react';
import {
  Trophy,
  Users,
  Copy,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCheck,
  Shield,
  Target,
  TrendingUp,
  Radio,
  ArrowUp,
  ArrowDown,
  Zap,
  Eye,
} from 'lucide-react';
import {
  getLeaderboard,
  getMyFollowing,
  getTradeSignals,
  getMirrorPortfolio,
  getCommunityBenchmark,
  getTrendingCollectors,
  getCategoryLeaders,
  getCollectorProfile,
  getPerformanceMetrics,
  getTradeHistory,
  getAlphaScore,
  followCollector,
  CollectorCategory,
  Timeframe,
  TradeSignal,
  CopyPortfolio,
} from '../lib/copyTradingService';

const CATEGORIES: CollectorCategory[] = ['Overall', 'Modern Basketball', 'Vintage Baseball', 'Modern Football', 'Pokemon'];
const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1yr', label: '1Y' },
  { value: 'all', label: 'All' },
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
  return `${Math.floor(days / 30)}mo ago`;
}

const CopyTrading: React.FC = () => {
  const [category, setCategory] = useState<CollectorCategory>('Overall');
  const [timeframe, setTimeframe] = useState<Timeframe>('1yr');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alpha');
  const [selectedCollector, setSelectedCollector] = useState<string | null>(null);
  const [mirrorLeader, setMirrorLeader] = useState<string | null>(null);
  const [mirrorBudget, setMirrorBudget] = useState(5000);
  const [mirrorPortfolio, setMirrorPortfolio] = useState<CopyPortfolio | null>(null);
  const [mirrored, setMirrored] = useState(false);
  const [, setFollowVersion] = useState(0);

  const leaderboard = useMemo(() => getLeaderboard(category, timeframe), [category, timeframe]);
  const following = useMemo(() => getMyFollowing(), []);
  const signals = useMemo(() => getTradeSignals('current_user'), []);
  const benchmark = useMemo(() => getCommunityBenchmark(), []);
  const trending = useMemo(() => getTrendingCollectors(), []);
  const categoryLeaders = useMemo(() => getCategoryLeaders(), []);

  const filteredLeaderboard = useMemo(() => {
    let results = [...leaderboard];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(e =>
        e.collector.displayName.toLowerCase().includes(q) ||
        e.collector.username.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'roi') results.sort((a, b) => b.metrics.annualizedROI - a.metrics.annualizedROI);
    else if (sortBy === 'sharpe') results.sort((a, b) => b.metrics.sharpeRatio - a.metrics.sharpeRatio);
    else if (sortBy === 'followers') results.sort((a, b) => b.collector.followerCount - a.collector.followerCount);
    else if (sortBy === 'winrate') results.sort((a, b) => b.metrics.hitRate - a.metrics.hitRate);
    else if (sortBy === 'alpha') results.sort((a, b) => b.alphaScore - a.alphaScore);
    return results;
  }, [leaderboard, searchQuery, sortBy]);

  const collectorProfile = useMemo(() => {
    if (!selectedCollector) return null;
    return getCollectorProfile(selectedCollector);
  }, [selectedCollector]);

  const collectorMetrics = useMemo(() => {
    if (!selectedCollector) return null;
    return getPerformanceMetrics(selectedCollector);
  }, [selectedCollector]);

  const collectorAlpha = useMemo(() => {
    if (!selectedCollector) return null;
    return getAlphaScore(selectedCollector);
  }, [selectedCollector]);

  const collectorTrades = useMemo(() => {
    if (!selectedCollector) return [];
    return getTradeHistory(selectedCollector).slice(0, 8);
  }, [selectedCollector]);

  const handleFollow = useCallback((userId: string) => {
    followCollector(userId);
    setFollowVersion(v => v + 1);
  }, []);

  const handleGenerateMirror = useCallback(() => {
    if (mirrorLeader && mirrorBudget > 0) {
      setMirrorPortfolio(getMirrorPortfolio(mirrorLeader, mirrorBudget));
      setMirrored(false);
    }
  }, [mirrorLeader, mirrorBudget]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Copy size={24} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Copy Trading Network</h1>
          <p className="text-sm text-slate-400">Follow top collectors, mirror portfolios, and benchmark your performance</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-slate border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Your Rank</span>
          </div>
          <p className="text-2xl font-bebas tracking-widest text-white">#{benchmark.rank}</p>
          <p className="text-[10px] text-slate-500">of {benchmark.totalCollectors} collectors</p>
        </div>
        <div className="bg-brand-slate border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Your ROI</span>
          </div>
          <p className={`text-2xl font-bebas tracking-widest ${benchmark.userROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatROI(benchmark.userROI)}
          </p>
          <p className="text-[10px] text-slate-500">Top {100 - benchmark.percentile}% of collectors</p>
        </div>
        <div className="bg-brand-slate border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Following</span>
          </div>
          <p className="text-2xl font-bebas tracking-widest text-white">{following.length}</p>
          <p className="text-[10px] text-slate-500">collectors tracked</p>
        </div>
        <div className="bg-brand-slate border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Radio size={16} className="text-purple-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Signals</span>
          </div>
          <p className="text-2xl font-bebas tracking-widest text-white">{signals.length}</p>
          <p className="text-[10px] text-slate-500">active trade signals</p>
        </div>
      </div>

      {/* Category Leaders */}
      <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bebas tracking-widest text-white mb-4">
          Category <span className="text-amber-400">Leaders</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categoryLeaders.map(({ category: cat, leader }) => (
            <button
              key={cat}
              onClick={() => setSelectedCollector(leader.collector.id)}
              className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-amber-500/30 transition-colors text-left"
            >
              <p className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest mb-2">{cat}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{leader.collector.avatarUrl}</span>
                <div>
                  <p className="text-xs font-bold text-white">{leader.collector.displayName}</p>
                  <p className="text-[9px] text-slate-500">{leader.collector.followerCount.toLocaleString()} followers</p>
                </div>
              </div>
              <p className={`text-sm font-bold ${leader.metrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatROI(leader.metrics.annualizedROI)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard - Left 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bebas tracking-widest text-white">
                Alpha <span className="text-amber-400">Leaderboard</span>
              </h3>
              <div className="flex items-center gap-2">
                {TIMEFRAMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTimeframe(t.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      timeframe === t.value
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search collectors..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CollectorCategory)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="alpha">Alpha Score</option>
                <option value="roi">ROI</option>
                <option value="sharpe">Sharpe</option>
                <option value="followers">Followers</option>
                <option value="winrate">Win Rate</option>
              </select>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-1.5">
              {filteredLeaderboard.map((entry) => {
                const rankDiff = entry.previousRank - entry.rank;
                return (
                  <button
                    key={entry.collector.id}
                    onClick={() => setSelectedCollector(entry.collector.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      selectedCollector === entry.collector.id
                        ? 'bg-amber-500/10 border border-amber-500/30'
                        : 'bg-slate-800/30 border border-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center gap-0.5">
                      <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {entry.rank}
                      </span>
                      {rankDiff > 0 && <ArrowUp size={8} className="text-green-400" />}
                      {rankDiff < 0 && <ArrowDown size={8} className="text-red-400" />}
                    </div>

                    {/* Avatar */}
                    <span className="text-xl flex-shrink-0">{entry.collector.avatarUrl}</span>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-white truncate">{entry.collector.displayName}</p>
                        {entry.collector.verified && <Shield size={10} className="text-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[9px] text-slate-500">{entry.collector.category}</p>
                    </div>

                    {/* Alpha Score */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">{entry.alphaScore}</span>
                    </div>

                    {/* ROI */}
                    <div className="text-right flex-shrink-0 w-16">
                      <p className={`text-xs font-bold ${entry.metrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatROI(entry.metrics.annualizedROI)}
                      </p>
                      <p className="text-[9px] text-slate-600">ROI</p>
                    </div>

                    {/* Sharpe */}
                    <div className="text-right flex-shrink-0 w-12 hidden sm:block">
                      <p className="text-xs font-bold text-slate-300">{entry.metrics.sharpeRatio.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-600">Sharpe</p>
                    </div>

                    {/* Followers */}
                    <div className="text-right flex-shrink-0 w-14 hidden md:block">
                      <p className="text-xs text-slate-400">{entry.collector.followerCount.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600">followers</p>
                    </div>

                    {/* Follow Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFollow(entry.collector.id); }}
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                        entry.collector.isFollowing
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 border border-slate-600'
                      }`}
                    >
                      {entry.collector.isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
                      <span className="hidden sm:inline">{entry.collector.isFollowing ? 'Following' : 'Follow'}</span>
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Collector Profile Card */}
          {collectorProfile && collectorMetrics && collectorAlpha ? (
            <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{collectorProfile.avatarUrl}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{collectorProfile.displayName}</h4>
                    {collectorProfile.verified && <Shield size={12} className="text-blue-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500">@{collectorProfile.username}</p>
                </div>
              </div>

              <p className="text-xs text-slate-400">{collectorProfile.bio}</p>

              {/* Alpha Score Breakdown */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest">Alpha Score</span>
                  <span className="text-lg font-bold text-amber-400">{collectorAlpha.overall}</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Consistency', value: collectorAlpha.consistency },
                    { label: 'Risk Mgmt', value: collectorAlpha.riskManagement },
                    { label: 'Timing', value: collectorAlpha.timing },
                    { label: 'Diversification', value: collectorAlpha.diversification },
                    { label: 'Community Trust', value: collectorAlpha.communityTrust },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-24">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${item.value}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <p className={`text-sm font-bold ${collectorMetrics.annualizedROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatROI(collectorMetrics.annualizedROI)}
                  </p>
                  <p className="text-[8px] text-slate-500 uppercase">Annual ROI</p>
                </div>
                <div className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <p className="text-sm font-bold text-slate-200">{collectorMetrics.sharpeRatio.toFixed(2)}</p>
                  <p className="text-[8px] text-slate-500 uppercase">Sharpe</p>
                </div>
                <div className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <p className="text-sm font-bold text-slate-200">{(collectorMetrics.hitRate * 100).toFixed(0)}%</p>
                  <p className="text-[8px] text-slate-500 uppercase">Win Rate</p>
                </div>
                <div className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <p className="text-sm font-bold text-red-400">{collectorMetrics.maxDrawdown.toFixed(1)}%</p>
                  <p className="text-[8px] text-slate-500 uppercase">Max DD</p>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trades</span>
                  <span className="text-slate-300 font-bold">{collectorProfile.tradeCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Hold</span>
                  <span className="text-slate-300 font-bold">{collectorProfile.avgHoldPeriodDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Portfolio</span>
                  <span className="text-slate-300 font-bold">${collectorProfile.portfolioValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Best Pick</span>
                  <span className="text-green-400 font-bold">+{collectorProfile.bestPick.returnPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Worst Pick</span>
                  <span className="text-red-400 font-bold">{collectorProfile.worstPick.returnPct}%</span>
                </div>
              </div>

              {/* Recent Trades */}
              {collectorTrades.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Recent Trades</p>
                  <div className="space-y-1">
                    {collectorTrades.slice(0, 5).map(trade => (
                      <div key={trade.id} className="flex items-center justify-between py-1.5 px-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`p-0.5 rounded ${trade.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {trade.action === 'buy' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                          </div>
                          <span className="text-[9px] text-slate-400 truncate">{trade.cardName}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 flex-shrink-0 ml-2">${trade.price.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow + Mirror Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleFollow(collectorProfile.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    collectorProfile.isFollowing
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 border border-slate-600'
                  }`}
                >
                  {collectorProfile.isFollowing ? <UserCheck size={12} /> : <UserPlus size={12} />}
                  {collectorProfile.isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => { setMirrorLeader(collectorProfile.id); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-700 text-slate-300 hover:bg-blue-500/15 hover:text-blue-400 border border-slate-600 rounded-xl text-xs font-bold transition-colors"
                >
                  <Copy size={12} />
                  Mirror
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6 text-center">
              <Eye size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Select a collector</p>
              <p className="text-xs text-slate-600 mt-1">Click on any leaderboard entry to view their profile</p>
            </div>
          )}

          {/* Trending Collectors */}
          <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bebas tracking-widest text-white mb-3">
              Trending <span className="text-amber-400">Now</span>
            </h4>
            <div className="space-y-2">
              {trending.slice(0, 5).map((entry) => (
                <button
                  key={entry.collector.id}
                  onClick={() => setSelectedCollector(entry.collector.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-800/30 border border-slate-700/30 rounded-xl hover:border-slate-600 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{entry.collector.avatarUrl}</span>
                    <div>
                      <p className="text-[10px] font-bold text-white">{entry.collector.displayName}</p>
                      <p className="text-[8px] text-slate-500">{entry.collector.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-amber-400" />
                    <span className="text-[10px] font-bold text-green-400">{formatROI(entry.metrics.annualizedROI)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Signal Feed */}
      <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bebas tracking-widest text-white">
            Trade <span className="text-purple-400">Signal Feed</span>
          </h3>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Radio size={10} />
            {signals.length} signals
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {signals.slice(0, 6).map((signal: TradeSignal) => (
            <div key={signal.id} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${signal.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {signal.action === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{signal.collectorAvatar}</span>
                      <span className="text-[10px] font-bold text-slate-300">{signal.collectorName}</span>
                    </div>
                    <span className="text-[9px] text-slate-600">{timeAgo(signal.timestamp)}</span>
                  </div>
                </div>
                <p className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  signal.action === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {signal.action}
                </p>
              </div>
              <p className="text-xs font-bold text-white truncate">{signal.cardName}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">${signal.price.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                  <Target size={8} /> {(signal.confidence * 100).toFixed(0)}% conf
                </span>
              </div>
              <p className="text-[9px] text-slate-500 italic truncate">&ldquo;{signal.reasoning}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Mirror Tool */}
      <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bebas tracking-widest text-white mb-4">
          Portfolio <span className="text-blue-400">Mirror Tool</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Leader</label>
            <select
              value={mirrorLeader ?? ''}
              onChange={e => setMirrorLeader(e.target.value || null)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            >
              <option value="">Select a leader...</option>
              {leaderboard.slice(0, 15).map(entry => (
                <option key={entry.collector.id} value={entry.collector.id}>
                  {entry.collector.displayName} ({formatROI(entry.metrics.annualizedROI)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Budget ($)</label>
            <input
              type="number"
              value={mirrorBudget}
              onChange={e => setMirrorBudget(Number(e.target.value))}
              min={100}
              step={500}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateMirror}
              disabled={!mirrorLeader}
              className="w-full py-2.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Portfolio
            </button>
          </div>
        </div>

        {mirrorPortfolio && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                <p className="text-sm font-bold text-white">${mirrorPortfolio.totalAllocated.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 uppercase">Allocated</p>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                <p className="text-sm font-bold text-white">${mirrorPortfolio.remainingCash.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 uppercase">Cash Left</p>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                <p className="text-sm font-bold text-green-400">{formatROI(mirrorPortfolio.expectedROI)}</p>
                <p className="text-[9px] text-slate-500 uppercase">Exp. ROI</p>
              </div>
              <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                <p className={`text-sm font-bold ${
                  mirrorPortfolio.riskLevel === 'conservative' ? 'text-green-400' :
                  mirrorPortfolio.riskLevel === 'moderate' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {mirrorPortfolio.riskLevel.charAt(0).toUpperCase() + mirrorPortfolio.riskLevel.slice(1)}
                </p>
                <p className="text-[9px] text-slate-500 uppercase">Risk</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {mirrorPortfolio.allocations.map((alloc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{alloc.cardName}</p>
                    <p className="text-[9px] text-slate-500">{alloc.leaderWeightPct.toFixed(1)}% weight &middot; {alloc.estimatedShares} unit{alloc.estimatedShares !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-xs font-bold text-white">${alloc.targetAmount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500">@ ${alloc.currentPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMirrored(true)}
              disabled={mirrored}
              className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${
                mirrored
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30 cursor-default'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {mirrored ? 'Portfolio Mirrored Successfully' : 'Mirror This Portfolio'}
            </button>
          </div>
        )}
      </div>

      {/* Performance Analytics Dashboard */}
      <div className="bg-brand-slate border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bebas tracking-widest text-white mb-4">
          Performance <span className="text-green-400">Analytics</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Benchmark Comparison */}
          <div className="p-4 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest">Community Benchmark</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Your ROI</span>
                <span className="text-xs font-bold text-green-400">{formatROI(benchmark.userROI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Median Collector</span>
                <span className="text-xs font-bold text-slate-300">{formatROI(benchmark.medianROI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Top 25%</span>
                <span className="text-xs font-bold text-amber-400">{formatROI(benchmark.topQuartileROI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Bottom 25%</span>
                <span className="text-xs font-bold text-slate-500">{formatROI(benchmark.bottomQuartileROI)}</span>
              </div>
            </div>
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/40 via-amber-500/40 to-green-500/40 w-full rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-amber-400 shadow-lg"
                style={{ left: `${benchmark.percentile}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500 text-center">
              You outperform {benchmark.percentile}% of all collectors
            </p>
          </div>

          {/* Category Performance */}
          <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Category Rankings</p>
            <div className="space-y-2">
              {benchmark.categoryRanks.map(cr => {
                const pct = ((cr.total - cr.rank) / cr.total) * 100;
                return (
                  <div key={cr.category} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-400">{cr.category}</span>
                      <span className="text-[10px] font-bold text-slate-300">#{cr.rank} / {cr.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct > 75 ? 'bg-green-500/60' : pct > 50 ? 'bg-amber-500/60' : 'bg-red-500/60'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyTrading;
