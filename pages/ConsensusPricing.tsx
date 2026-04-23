// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, Star, MessageCircle, ThumbsUp, ThumbsDown, Award, BarChart3, Target, Eye, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import {
  getConsensusPrices,
  getCommunityExperts,
  getTopExperts,
  getSentimentPolls,
  getActivePolls,
  getPriceVotes,
  getTrendingCards,
  getConsensusSummary,
  castVote,
  getSentimentColor,
  getSentimentLabel,
  getTierColor,
  getTierLabel,
  formatCurrency,
  formatNumber,
  type ConsensusPrice,
  type CommunityExpert,
  type SentimentPoll,
  type PriceVote,
  type TrendingCard,
  type ConsensusSummary,
  type VoteType,
  type SentimentLevel,
} from '../lib/analytics/consensusPricingService';

const VOTE_COLORS = ['#10b981', '#f87171', '#3b82f6'];

const SentimentBadge: React.FC<{ sentiment: SentimentLevel }> = ({ sentiment }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ backgroundColor: getSentimentColor(sentiment) + '22', color: getSentimentColor(sentiment) }}
  >
    {sentiment.includes('bullish') ? <TrendingUp size={12} /> : sentiment.includes('bearish') ? <TrendingDown size={12} /> : <BarChart3 size={12} />}
    {getSentimentLabel(sentiment)}
  </span>
);

const ConfidenceMeter: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#3b82f6' : value >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">Confidence</span>
        <span style={{ color }} className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const ConsensusPricing: React.FC = () => {
  const [prices, setPrices] = useState<ConsensusPrice[]>([]);
  const [experts, setExperts] = useState<CommunityExpert[]>([]);
  const [topExperts, setTopExperts] = useState<CommunityExpert[]>([]);
  const [polls, setPolls] = useState<SentimentPoll[]>([]);
  const [activePolls, setActivePolls] = useState<SentimentPoll[]>([]);
  const [votes, setVotes] = useState<PriceVote[]>([]);
  const [trending, setTrending] = useState<TrendingCard[]>([]);
  const [summary, setSummary] = useState<ConsensusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPrices(getConsensusPrices());
      setExperts(getCommunityExperts());
      setTopExperts(getTopExperts());
      setPolls(getSentimentPolls());
      setActivePolls(getActivePolls());
      setVotes(getPriceVotes());
      setTrending(getTrendingCards());
      setSummary(getConsensusSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Consensus Pricing data');
      setLoading(false);
    }
  }, []);

  const filteredPrices = useMemo(() => {
    if (sentimentFilter === 'all') return prices;
    return prices.filter(p => p.sentiment === sentimentFilter);
  }, [prices, sentimentFilter]);

  const chartData = useMemo(() => {
    if (prices.length === 0) return [];
    const first = prices[0];
    return first.priceHistory.map(h => ({
      date: h.date.slice(5),
      community: h.communityPrice,
      market: h.marketPrice,
    }));
  }, [prices]);

  const cardVotes = useMemo(() => {
    if (!selectedCard) return votes.slice(0, 10);
    return votes.filter(v => v.cardId === selectedCard);
  }, [votes, selectedCard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Consensus Pricing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <BarChart3 size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <Users size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Social Proof &amp; Community Consensus Pricing</h1>
          <p className="text-sm text-slate-400">Community-driven price discovery, expert leaderboards &amp; sentiment analysis</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Tracked</p>
          <p className="text-2xl font-bold text-emerald-400">{summary?.totalCardsTracked ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Voters</p>
          <p className="text-2xl font-bold text-blue-400">{formatNumber(summary?.activeVoters ?? 0)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Community Accuracy</p>
          <p className="text-2xl font-bold text-amber-400">{summary?.avgCommunityAccuracy ?? 0}%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trending Sentiment</p>
          <div className="mt-1">{summary && <SentimentBadge sentiment={summary.trendingSentiment} />}</div>
        </div>
      </div>

      {/* Community vs Market Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-400" />
          Community vs Market Price Tracking
        </h2>
        <p className="text-xs text-slate-500 mb-4">Showing price history for: {prices[0]?.cardName ?? 'N/A'}</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'community' ? 'Community Price' : 'Market Price']}
            />
            <Line type="monotone" dataKey="community" stroke="#10b981" strokeWidth={2} dot={false} name="community" />
            <Line type="monotone" dataKey="market" stroke="#3b82f6" strokeWidth={2} dot={false} name="market" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-center mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Community Price</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Market Price</span>
        </div>
      </div>

      {/* Sentiment Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        <span className="text-xs text-slate-500">Filter by sentiment:</span>
        {['all', 'very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'].map(s => (
          <button
            key={s}
            onClick={() => setSentimentFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sentimentFilter === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            {s === 'all' ? 'All' : getSentimentLabel(s as SentimentLevel)}
          </button>
        ))}
      </div>

      {/* Consensus Price Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-blue-400" />
          Consensus Price Cards ({filteredPrices.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPrices.map(card => {
            const voteData = [
              { name: 'Fair', value: card.voteBreakdown.fair },
              { name: 'Overvalued', value: card.voteBreakdown.overvalued },
              { name: 'Undervalued', value: card.voteBreakdown.undervalued },
            ];
            const priceDiff = ((card.communityPrice - card.lastSalePrice) / card.lastSalePrice * 100).toFixed(1);
            const isPositive = card.communityPrice >= card.lastSalePrice;

            return (
              <div
                key={card.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{card.cardName}</h3>
                    <p className="text-xs text-slate-500">{card.player} &middot; {card.grade}</p>
                  </div>
                  <SentimentBadge sentiment={card.sentiment} />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Community</p>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(card.communityPrice)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Market</p>
                    <p className="text-sm font-bold text-blue-400">{formatCurrency(card.lastSalePrice)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Spread</p>
                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{priceDiff}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={voteData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
                          {voteData.map((_, i) => (
                            <Cell key={i} fill={VOTE_COLORS[i]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Fair</span>
                      <span className="text-slate-400">{Math.round(card.voteBreakdown.fair / card.totalVotes * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Overvalued</span>
                      <span className="text-slate-400">{Math.round(card.voteBreakdown.overvalued / card.totalVotes * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">Undervalued</span>
                      <span className="text-slate-400">{Math.round(card.voteBreakdown.undervalued / card.totalVotes * 100)}%</span>
                    </div>
                  </div>
                </div>

                <ConfidenceMeter value={card.communityConfidence} />

                <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye size={11} /> {formatNumber(card.totalVotes)} votes</span>
                  <span>Expert: {formatCurrency(card.expertConsensus)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Experts Leaderboard */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          Top Experts Leaderboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topExperts.map((expert, idx) => (
            <div key={expert.id} className="bg-slate-900/50 border border-slate-700/40 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: getTierColor(expert.tier) + '22', color: getTierColor(expert.tier), border: `2px solid ${getTierColor(expert.tier)}` }}
                  >
                    {expert.displayName.charAt(0)}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-amber-400">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-200 truncate">{expert.displayName}</h3>
                  <p className="text-xs text-slate-500">@{expert.username}</p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: getTierColor(expert.tier) + '22', color: getTierColor(expert.tier) }}
                  >
                    {getTierLabel(expert.tier)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">Accuracy</p>
                  <p className="text-sm font-bold text-emerald-400">{expert.accuracy}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Return</p>
                  <p className="text-sm font-bold text-blue-400">{expert.avgReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Followers</p>
                  <p className="text-sm font-bold text-purple-400">{formatNumber(expert.followers)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {expert.specialties.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs">{s}</span>
                ))}
              </div>

              <div className="space-y-1">
                {expert.recentPicks.slice(0, 2).map((pick, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      pick.outcome === 'correct' ? 'bg-emerald-400' : pick.outcome === 'incorrect' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-slate-400 truncate">{pick.cardName}: {pick.prediction}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Polls */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-purple-400" />
          Active Sentiment Polls ({activePolls.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePolls.map(poll => (
            <div key={poll.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-1">{poll.question}</h3>
              {poll.player && <p className="text-xs text-slate-500 mb-3">{poll.player}</p>}

              <div className="space-y-2 mb-3">
                {poll.options.map((opt, i) => {
                  const barColors = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-300">{opt.label}</span>
                        <span className="text-slate-400">{opt.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${opt.percentage}%`, backgroundColor: barColors[i % barColors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>{formatNumber(poll.totalVotes)} total votes</span>
                <span>Expires: {new Date(poll.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Cards */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-orange-400" />
          Trending Cards
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Card</th>
                <th className="text-right py-2 px-2">Mentions</th>
                <th className="text-right py-2 px-2">Sentiment</th>
                <th className="text-right py-2 px-2">Price Change</th>
                <th className="text-right py-2 px-2">Buzz</th>
                <th className="text-left py-2 pl-2 hidden lg:table-cell">Top Reason</th>
              </tr>
            </thead>
            <tbody>
              {trending.map((card, idx) => (
                <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2 pr-2">
                    <p className="font-medium text-slate-200 truncate max-w-[200px]">{card.cardName}</p>
                    <p className="text-slate-500">{card.player}</p>
                  </td>
                  <td className="text-right py-2 px-2 text-slate-300">{formatNumber(card.mentions)}</td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-semibold ${card.sentimentChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.sentimentChange >= 0 ? '+' : ''}{card.sentimentChange}%
                    </span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-semibold ${card.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.priceChange >= 0 ? '+' : ''}{card.priceChange}%
                    </span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: `${card.communityBuzz}%` }} />
                      </div>
                      <span className="text-slate-400 w-6 text-right">{card.communityBuzz}</span>
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-slate-400 truncate max-w-[250px] hidden lg:table-cell">{card.topReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Votes Feed */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            Recent Price Votes
          </h2>
          {selectedCard && (
            <button
              onClick={() => setSelectedCard(null)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Show all votes
            </button>
          )}
        </div>
        <div className="space-y-3">
          {cardVotes.map(vote => {
            const cardInfo = prices.find(p => p.id === vote.cardId);
            return (
              <div key={vote.id} className="flex items-start gap-3 bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
                <div className="flex-shrink-0">
                  {vote.vote === 'fair_price' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ThumbsUp size={14} className="text-emerald-400" />
                    </div>
                  ) : vote.vote === 'overvalued' ? (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <ThumbsDown size={14} className="text-red-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp size={14} className="text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-200">{vote.username}</span>
                    {vote.expertTier && (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: getTierColor(vote.expertTier) + '22', color: getTierColor(vote.expertTier) }}
                      >
                        {getTierLabel(vote.expertTier)}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${
                      vote.vote === 'fair_price' ? 'text-emerald-400' : vote.vote === 'overvalued' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {vote.vote === 'fair_price' ? 'Fair Price' : vote.vote === 'overvalued' ? 'Overvalued' : 'Undervalued'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    {cardInfo?.cardName ?? 'Unknown Card'} &mdash; Est. {formatCurrency(vote.priceEstimate)}
                  </p>
                  <p className="text-xs text-slate-400">{vote.reasoning}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><ThumbsUp size={10} /> {vote.upvotes}</span>
                    <span>{new Date(vote.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Debated Cards */}
      {summary && summary.mostDebated.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-red-400" />
            Most Debated Cards
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.mostDebated} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v: number) => v + '%'} />
              <YAxis type="category" dataKey="cardName" stroke="#64748b" fontSize={10} width={180} tick={{ fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [value.toFixed(1) + '%', 'Price Spread']}
              />
              <Bar dataKey="voteSpread" fill="#f87171" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ConsensusPricing;
