import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, TrendingUp, BarChart3, ThumbsUp, MessageSquare, Star,
  Search, Filter, Send, Award, ArrowRightLeft, ShoppingCart, Eye,
  Clock, CheckCircle, XCircle, ChevronDown,
} from 'lucide-react';
import {
  getTradePosts,
  getTradeOffers,
  getTradingStats,
  getTopTraders,
  searchPosts,
  filterByType,
  filterBySport,
  getRecentActivity,
  formatCurrency,
  getStatusColor,
  getTypeLabel,
  getTypeBadgeColor,
  getUserReputation,
  makeOffer,
  respondToOffer,
  type TradePost,
  type TradeOffer,
  type UserReputation,
  type TradingStats,
  type TradeActivity,
  type PostType,
} from '../lib/social/communityTradingService';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const TABS = ['Trading Floor', 'My Trades', 'Offers', 'Leaderboard'] as const;
type Tab = typeof TABS[number];

const SPORT_FILTERS = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const TYPE_FILTERS: { label: string; value: PostType | 'all' }[] = [
  { label: 'All Types', value: 'all' },
  { label: 'Available', value: 'have' },
  { label: 'Looking For', value: 'want' },
  { label: 'Open to Trade', value: 'trade' },
];

const CommunityTrading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Trading Floor');
  const [posts, setPosts] = useState<TradePost[]>([]);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [topTraders, setTopTraders] = useState<UserReputation[]>([]);
  const [activity, setActivity] = useState<TradeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all');
  const [selectedPost, setSelectedPost] = useState<TradePost | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    try {
      setPosts(getTradePosts());
      setOffers(getTradeOffers());
      setStats(getTradingStats());
      setTopTraders(getTopTraders());
      setActivity(getRecentActivity());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (searchQuery) {
      result = searchPosts(searchQuery);
    }
    if (sportFilter !== 'All') {
      result = result.filter(p => p.sport === sportFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(p => p.type === typeFilter);
    }
    return result;
  }, [posts, searchQuery, sportFilter, typeFilter]);

  const myPosts = useMemo(() => {
    return posts.filter(p => p.userId === 'u-001');
  }, [posts]);

  const myOffers = useMemo(() => {
    return offers.filter(o => o.fromUser === 'CardKingMike' || o.toUser === 'CardKingMike');
  }, [offers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Community Trading Floor</h1>
              <p className="text-slate-400 text-sm">Buy, sell, and trade cards with the community</p>
            </div>
          </div>
          <button
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            onClick={() => setShowOfferModal(true)}
          >
            <Send className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Eye className="w-3 h-3" /> Active Posts
            </div>
            <div className="text-xl font-bold">{stats.totalActivePosts}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <CheckCircle className="w-3 h-3" /> Completed Today
            </div>
            <div className="text-xl font-bold">{stats.tradesCompletedToday}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" /> Avg Trade Value
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.avgTradeValue)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Award className="w-3 h-3" /> Top Trader
            </div>
            <div className="text-xl font-bold truncate">{stats.topTrader}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <BarChart3 className="w-3 h-3" /> Total Volume
            </div>
            <div className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 border-b border-slate-700">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Trading Floor Tab */}
        {activeTab === 'Trading Floor' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards, players, tags..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="relative">
                <select
                  value={sportFilter}
                  onChange={e => setSportFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-purple-500"
                >
                  {SPORT_FILTERS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as PostType | 'all')}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-purple-500"
                >
                  {TYPE_FILTERS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Trade Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const rep = getUserReputation(post.userId);
                return (
                  <div
                    key={post.id}
                    className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                          {post.username.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{post.username}</span>
                            {rep && (
                              <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                <Star className="w-3 h-3 fill-yellow-400" /> {rep.rating}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(post.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getTypeBadgeColor(post.type)}`}>
                          {getTypeLabel(post.type)}
                        </span>
                        <span className={`text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{post.cardName}</h3>
                    <p className="text-slate-400 text-sm mb-3">{post.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">{post.sport}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">{post.year}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">{post.condition}</span>
                      {post.tags.map(tag => (
                        <span key={tag} className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-400">#{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm transition-colors">
                          <ThumbsUp className="w-4 h-4" /> {post.likes}
                        </button>
                        <button className="flex items-center gap-1 text-slate-400 hover:text-blue-400 text-sm transition-colors">
                          <MessageSquare className="w-4 h-4" /> {post.comments}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold">{formatCurrency(post.estimatedValue)}</span>
                        {post.status === 'active' && (
                          <button
                            onClick={() => { setSelectedPost(post); setShowOfferModal(true); }}
                            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            Make Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Trades Tab */}
        {activeTab === 'My Trades' && (
          <div>
            <h2 className="text-lg font-bold mb-4">My Trade Posts</h2>
            {myPosts.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>You have no active trade posts. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPosts.map(post => (
                  <div key={post.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{post.cardName}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getTypeBadgeColor(post.type)}`}>
                          {getTypeLabel(post.type)}
                        </span>
                        <span className={`text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{post.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{post.sport} &middot; {post.condition}</span>
                      <span className="text-green-400 font-bold">{formatCurrency(post.estimatedValue)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'Offers' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Trade Offers</h2>
            <div className="space-y-4">
              {myOffers.map(offer => (
                <div key={offer.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{offer.fromUser}</span>
                      <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{offer.toUser}</span>
                    </div>
                    <span className={`text-xs font-medium capitalize ${getStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Offered Cards</div>
                      {offer.offeredCards.map((card, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span>{card.cardName}</span>
                          <span className="text-green-400">{formatCurrency(card.value)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Requested Cards</div>
                      {offer.requestedCards.map((card, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span>{card.cardName}</span>
                          <span className="text-green-400">{formatCurrency(card.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {offer.cashDifference > 0 && (
                    <div className="text-sm text-yellow-400 mb-2">
                      + {formatCurrency(offer.cashDifference)} cash difference
                    </div>
                  )}

                  <p className="text-slate-400 text-sm italic mb-3">&ldquo;{offer.message}&rdquo;</p>

                  {offer.status === 'pending' && offer.toUser === 'CardKingMike' && (
                    <div className="flex gap-2 pt-3 border-t border-slate-700">
                      <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Counter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'Leaderboard' && (
          <div>
            {/* Trade Activity Chart */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" /> Trade Volume Over Time
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                      formatter={(value: number) => [formatCurrency(value), 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trades Over Time Line Chart */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" /> Daily Trade Count
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="trades" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Traders */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" /> Top Traders
              </h2>
              <div className="space-y-3">
                {topTraders.map((trader, idx) => (
                  <div
                    key={trader.userId}
                    className="flex items-center gap-4 bg-slate-900 rounded-lg p-4 border border-slate-700"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-600' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trader.username}</span>
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400" /> {trader.rating}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trader.badges.map(badge => (
                          <span key={badge} className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{trader.completedTrades}</div>
                      <div className="text-xs text-slate-400">trades</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedPost ? `Make Offer on ${selectedPost.cardName}` : 'Create New Trade Post'}
            </h2>

            {selectedPost ? (
              <div>
                <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Requesting</div>
                  <div className="font-medium">{selectedPost.cardName}</div>
                  <div className="text-green-400 text-sm">{formatCurrency(selectedPost.estimatedValue)}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-1">Your Offered Cards</label>
                  <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-sm text-slate-400">
                    Select cards from your collection to offer...
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-1">Cash Difference ($)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="0"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-1">Message</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 h-20 resize-none"
                    placeholder="Add a message to your offer..."
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 mb-4">
                Post creation form would go here with card details, type selection, and images.
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => { setShowOfferModal(false); setSelectedPost(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowOfferModal(false); setSelectedPost(null); }}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {selectedPost ? 'Send Offer' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityTrading;
