import React, { useState, useEffect, useMemo } from 'react';
import { Users, AlertTriangle, TrendingUp, BarChart3, ThumbsUp, Trophy, Target, MessageSquare, Flame, Star } from 'lucide-react';
import {
  getTopTraders,
  getTradePicks,
  getSentimentDistribution,
  getTraderPerformance,
  getCommunityPolls,
  getTradingChallenges,
  getMarketConsensus,
  getStreakRecords,
  getSocialTradingSummary,
  formatCurrency,
  formatTimeAgo,
  type TopTrader,
  type TradePick,
  type SentimentEntry,
  type TraderPerformancePoint,
  type CommunityPoll,
  type TradingChallenge,
  type MarketConsensusItem,
  type StreakRecord,
  type SocialTradingSummary,
} from '../lib/socialTradingService';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const SENTIMENT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

const SocialTrading: React.FC = () => {
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [tradePicks, setTradePicks] = useState<TradePick[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentEntry[]>([]);
  const [traderPerformance, setTraderPerformance] = useState<TraderPerformancePoint[]>([]);
  const [polls, setPolls] = useState<CommunityPoll[]>([]);
  const [challenges, setChallenges] = useState<TradingChallenge[]>([]);
  const [consensus, setConsensus] = useState<MarketConsensusItem[]>([]);
  const [streakRecords, setStreakRecords] = useState<StreakRecord[]>([]);
  const [summary, setSummary] = useState<SocialTradingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<string>('all');

  useEffect(() => {
    try {
      setTopTraders(getTopTraders());
      setTradePicks(getTradePicks());
      setSentimentData(getSentimentDistribution());
      setTraderPerformance(getTraderPerformance());
      setPolls(getCommunityPolls());
      setChallenges(getTradingChallenges());
      setConsensus(getMarketConsensus());
      setStreakRecords(getStreakRecords());
      setSummary(getSocialTradingSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Social Trading data');
      setLoading(false);
    }
  }, []);

  const filteredPicks = useMemo(() => {
    if (feedFilter === 'all') return tradePicks;
    return tradePicks.filter(p => p.type === feedFilter);
  }, [tradePicks, feedFilter]);

  const sortedTraders = useMemo(() => {
    return [...topTraders].sort((a, b) => b.totalProfit - a.totalProfit);
  }, [topTraders]);

  const activePolls = useMemo(() => {
    return polls.filter(p => p.status === 'active');
  }, [polls]);

  const closedPolls = useMemo(() => {
    return polls.filter(p => p.status === 'closed');
  }, [polls]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Social Trading &amp; Community Picks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-pink-500/20">
          <Users size={24} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Social Trading &amp; Community Picks</h1>
          <p className="text-sm text-slate-400">Trader leaderboards, community sentiment &amp; social intelligence &mdash; Phase 153</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Traders</p>
          <p className="text-2xl font-bold text-pink-400">{summary?.activeTraders ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Picks</p>
          <p className="text-2xl font-bold text-blue-400">{summary?.totalPicks ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{summary?.avgWinRate ?? 0}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Profit</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary?.totalCommunityProfit ?? 0)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Polls</p>
          <p className="text-2xl font-bold text-purple-400">{summary?.activePolls ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Challenges</p>
          <p className="text-2xl font-bold text-cyan-400">{summary?.activeChallenges ?? 0}</p>
        </div>
      </div>

      {/* Top Traders Leaderboard */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          Top Traders Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Rank</th>
                <th className="text-left py-2 px-2">Trader</th>
                <th className="text-right py-2 px-2">Picks</th>
                <th className="text-right py-2 px-2">Win Rate</th>
                <th className="text-right py-2 px-2">Avg Return</th>
                <th className="text-right py-2 px-2">Total Profit</th>
                <th className="text-right py-2 px-2">Followers</th>
                <th className="text-right py-2 px-2">Streak</th>
                <th className="text-right py-2 pl-2">Reputation</th>
              </tr>
            </thead>
            <tbody>
              {sortedTraders.slice(0, 15).map((trader, i) => (
                <tr key={trader.id} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2">
                    <span className={`text-xs font-bold ${i < 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-medium">{trader.username}</span>
                      {trader.verified && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Verified</span>}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{trader.totalPicks}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${trader.winRate >= 70 ? 'text-emerald-400' : trader.winRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {trader.winRate}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={`${trader.avgReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trader.avgReturn > 0 ? '+' : ''}{trader.avgReturn}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-bold">{formatCurrency(trader.totalProfit)}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{trader.followers.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`${trader.currentStreak > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trader.currentStreak > 0 ? '+' : ''}{trader.currentStreak}
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <span className={`font-bold ${trader.reputationScore >= 90 ? 'text-amber-400' : trader.reputationScore >= 70 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {trader.reputationScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Picks Feed + Sentiment Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Picks Feed */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare size={18} className="text-pink-400" />
              Trade Picks Feed
            </h2>
            <select
              value={feedFilter}
              onChange={e => setFeedFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Picks</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="hold">Hold</option>
            </select>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPicks.slice(0, 12).map((pick, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{pick.traderName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      pick.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' :
                      pick.type === 'sell' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pick.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{formatTimeAgo(pick.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-300 mb-1 font-medium">{pick.cardName}</p>
                <p className="text-[10px] text-slate-400 mb-2">{pick.reasoning}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <ThumbsUp size={10} className="text-emerald-400" /> {pick.upvotes}
                    </span>
                    <span className="text-[10px] text-slate-500">Target: {formatCurrency(pick.targetPrice)}</span>
                  </div>
                  {pick.result !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pick.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                      pick.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {pick.result === 'win' ? 'HIT' : pick.result === 'loss' ? 'MISS' : 'PENDING'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Pie Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Community Sentiment
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((_, idx) => (
                    <Cell key={idx} fill={SENTIMENT_COLORS[idx % SENTIMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {sentimentData.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[i % SENTIMENT_COLORS.length] }} />
                  <span className="text-slate-300">{entry.label}</span>
                </div>
                <span className="text-slate-400">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trader Performance Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Trader Performance Comparison
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={traderPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="traderName" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="wins" fill="#10b981" name="Wins" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" fill="#ef4444" name="Losses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Community Polls + Trading Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Polls */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-purple-400" />
            Community Polls
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activePolls.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Active</p>
                {activePolls.map((poll, i) => (
                  <div key={i} className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 mb-3">
                    <p className="text-sm font-bold text-slate-200 mb-2">{poll.question}</p>
                    <div className="space-y-2">
                      {poll.options.map((opt, j) => {
                        const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
                        const pct = Math.round(opt.votes / totalVotes * 100);
                        return (
                          <div key={j}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-300">{opt.label}</span>
                              <span className="text-[10px] text-slate-400">{pct}% ({opt.votes} votes)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Ends: {poll.endDate}</p>
                  </div>
                ))}
              </div>
            )}
            {closedPolls.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Recent Results</p>
                {closedPolls.slice(0, 3).map((poll, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 mb-3">
                    <p className="text-sm font-bold text-slate-200 mb-2">{poll.question}</p>
                    <div className="space-y-1">
                      {poll.options.sort((a, b) => b.votes - a.votes).map((opt, j) => {
                        const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
                        const pct = Math.round(opt.votes / totalVotes * 100);
                        return (
                          <div key={j} className="flex items-center justify-between text-[10px]">
                            <span className={j === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{opt.label}</span>
                            <span className="text-slate-500">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trading Challenges */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            Trading Challenges
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {challenges.map((challenge, i) => (
              <div key={i} className={`bg-slate-900/50 border rounded-xl p-4 ${
                challenge.status === 'active' ? 'border-emerald-500/30' :
                challenge.status === 'upcoming' ? 'border-amber-500/30' :
                'border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">{challenge.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    challenge.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    challenge.status === 'upcoming' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {challenge.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{challenge.description}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Participants</span><span className="text-slate-300">{challenge.participants}</span></div>
                  <div className="flex justify-between"><span>Prize Pool</span><span className="text-emerald-400 font-bold">{formatCurrency(challenge.prizePool)}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="text-slate-300">{challenge.duration}</span></div>
                  {challenge.leader && (
                    <div className="flex justify-between"><span>Current Leader</span><span className="text-amber-400">{challenge.leader}</span></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Consensus */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-400" />
          Market Consensus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consensus.map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">{item.cardName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  item.consensus === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                  item.consensus === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {item.consensus.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-slate-500">
                <div className="flex justify-between"><span>Current Price</span><span className="text-slate-300">{formatCurrency(item.currentPrice)}</span></div>
                <div className="flex justify-between"><span>Target Price</span><span className="text-emerald-400">{formatCurrency(item.targetPrice)}</span></div>
                <div className="flex justify-between"><span>Confidence</span><span className={`font-bold ${item.confidence >= 80 ? 'text-emerald-400' : item.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{item.confidence}%</span></div>
                <div className="flex justify-between"><span>Contributors</span><span className="text-slate-300">{item.contributors}</span></div>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">Bullish vs Bearish</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-700/50">
                  <div className="bg-emerald-500" style={{ width: `${item.bullishPercent}%` }} />
                  <div className="bg-red-500" style={{ width: `${100 - item.bullishPercent}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-emerald-400">{item.bullishPercent}% Bull</span>
                  <span className="text-[9px] text-red-400">{100 - item.bullishPercent}% Bear</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Records */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Streak Records
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Rank</th>
                <th className="text-left py-2 px-2">Trader</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">Streak</th>
                <th className="text-right py-2 px-2">Profit During</th>
                <th className="text-left py-2 px-2">Start Date</th>
                <th className="text-left py-2 pl-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {streakRecords.sort((a, b) => b.streakLength - a.streakLength).map((record, i) => (
                <tr key={i} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2">
                    <span className={`text-xs font-bold ${i < 3 ? 'text-amber-400' : 'text-slate-400'}`}>#{i + 1}</span>
                  </td>
                  <td className="py-2 px-2 text-slate-200 font-medium">{record.traderName}</td>
                  <td className="py-2 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      record.type === 'win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.type === 'win' ? 'WIN' : 'LOSS'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300 font-bold">{record.streakLength}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`font-bold ${record.profitDuring >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {record.profitDuring > 0 ? '+' : ''}{formatCurrency(record.profitDuring)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-500">{record.startDate}</td>
                  <td className="py-2 pl-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      record.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {record.active ? 'ACTIVE' : 'ENDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SocialTrading;
