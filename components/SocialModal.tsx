// @ts-nocheck
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  X,
  Users,
  MessageCircle,
  ArrowRightLeft,
  Search,
  Send,
  Paperclip,
  Star,
  ChevronLeft,
  UserPlus,
  UserMinus,
  Activity,
  Shield,
  Tag,
  Globe,
  Heart,
} from 'lucide-react';
import { CardInventory, Sport } from '../types';
import {
  getCollectorProfiles,
  getActivityFeed,
  getTradeMatches,
  getThreads,
  getThread,
  sendMessage,
  startThread,
  followCollector,
  unfollowCollector,
  getFollowing,
  CollectorProfile,
  TradeMatch,
  ActivityFeedItem,
  ChatThread,
  DirectMessage,
} from '../lib/social/socialService';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'feed' | 'messages' | 'trades' | 'discover';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Feed', icon: <Activity size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
  { id: 'trades', label: 'Trades', icon: <ArrowRightLeft size={16} /> },
  { id: 'discover', label: 'Discover', icon: <Users size={16} /> },
];

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Rookie: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  Veteran: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  'All-Star': { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'Hall of Fame': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  Whale: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const ACTIVITY_ICONS: Record<string, string> = {
  listing: '📋',
  trade: '🔄',
  achievement: '🏆',
  grading: '📊',
  purchase: '💰',
  price_milestone: '📈',
  follow: '👤',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---- Feed Tab ----

const FeedTab: React.FC<{ cards: CardInventory[] }> = () => {
  const [scope, setScope] = useState<'global' | 'following'>('global');
  const feed = useMemo(() => getActivityFeed(scope), [scope]);

  return (
    <div className="space-y-4">
      {/* Scope Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setScope('global')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            scope === 'global'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe size={14} />
          Global
        </button>
        <button
          onClick={() => setScope('following')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            scope === 'following'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Heart size={14} />
          Following
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {feed.map((item: ActivityFeedItem) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
              style={{ backgroundColor: item.avatarColor }}
            >
              {item.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-300">
                  <span className="font-bold text-white">{item.collectorName}</span>{' '}
                  {item.description.startsWith(item.collectorName)
                    ? item.description.slice(item.collectorName.length).trim()
                    : item.description}
                </p>
                <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
              {item.metadata?.sport && (
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-700/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded">
                  {item.metadata.sport}
                </span>
              )}
            </div>
            <span className="text-lg flex-shrink-0">{ACTIVITY_ICONS[item.type] || '📌'}</span>
          </div>
        ))}

        {feed.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            {scope === 'following'
              ? 'Follow collectors to see their activity here.'
              : 'No activity yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Messages Tab ----

const MY_USER_ID = 'user_me';

const MessagesTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [threads, setThreads] = useState<ChatThread[]>(() => getThreads());
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardInventory | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openThreadId) {
      const data = getThread(openThreadId);
      setMessages(data.messages);
      // Refresh threads to update unread counts
      setThreads(getThreads());
    }
  }, [openThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !openThreadId) return;

    const attachment = selectedCard
      ? {
          id: selectedCard.id,
          player: selectedCard.player,
          year: selectedCard.year,
          set: selectedCard.set,
          currentValue: selectedCard.currentValue ?? selectedCard.purchasePrice,
          sport: selectedCard.sport,
        }
      : undefined;

    const newMsg = sendMessage(openThreadId, inputText.trim(), attachment);
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setSelectedCard(null);
    setShowCardPicker(false);
    setThreads(getThreads());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentThread = threads.find(t => t.id === openThreadId);

  // Thread list view
  if (!openThreadId) {
    return (
      <div className="space-y-2">
        {threads.map((thread: ChatThread) => {
          const otherName = thread.participantNames.find(n => n !== 'You') ?? 'Unknown';
          return (
            <button
              key={thread.id}
              onClick={() => setOpenThreadId(thread.id)}
              className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                {otherName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{otherName}</span>
                  <span className="text-[10px] text-slate-600">{timeAgo(thread.lastMessageTime)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{thread.lastMessage || 'No messages yet'}</p>
              </div>
              {thread.unreadCount > 0 && (
                <span className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {thread.unreadCount}
                </span>
              )}
            </button>
          );
        })}

        {threads.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No conversations yet. Discover collectors to start chatting!
          </div>
        )}
      </div>
    );
  }

  // Open thread view
  return (
    <div className="flex flex-col h-[55vh]">
      {/* Thread Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-4">
        <button
          onClick={() => { setOpenThreadId(null); setMessages([]); }}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
          {(currentThread?.participantNames.find(n => n !== 'You') ?? '??').split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <span className="text-sm font-bold text-white">
          {currentThread?.participantNames.find(n => n !== 'You') ?? 'Unknown'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
        {messages.map((msg: DirectMessage) => {
          const isMe = msg.senderId === MY_USER_ID;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] space-y-1`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-slate-700 text-slate-200 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
                {/* Card Attachment */}
                {msg.cardAttachment && (
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl">
                      <Tag size={12} className="text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {msg.cardAttachment.player} ({msg.cardAttachment.year})
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {msg.cardAttachment.set} &middot; ${msg.cardAttachment.currentValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <p className={`text-[10px] text-slate-600 ${isMe ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Card Preview */}
      {selectedCard && (
        <div className="flex items-center gap-2 px-3 py-2 mt-2 bg-slate-800 border border-slate-600 rounded-xl">
          <Tag size={12} className="text-amber-400" />
          <span className="text-xs text-white font-medium truncate flex-1">
            {selectedCard.player} ({selectedCard.year}) - {selectedCard.set}
          </span>
          <button
            onClick={() => setSelectedCard(null)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Card Picker */}
      {showCardPicker && (
        <div className="mt-2 max-h-32 overflow-y-auto bg-slate-800 border border-slate-600 rounded-xl p-2 space-y-1 no-scrollbar">
          {cards.slice(0, 20).map(card => (
            <button
              key={card.id}
              onClick={() => {
                setSelectedCard(card);
                setShowCardPicker(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="text-xs text-white font-medium truncate">
                {card.player} ({card.year})
              </span>
              <span className="text-[10px] text-slate-500 ml-auto flex-shrink-0">
                ${(card.currentValue ?? card.purchasePrice).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
        <button
          onClick={() => setShowCardPicker(!showCardPicker)}
          className={`p-2.5 rounded-xl transition-colors ${
            showCardPicker
              ? 'bg-blue-500/15 text-blue-400'
              : 'hover:bg-slate-800 text-slate-500 hover:text-white'
          }`}
          title="Attach a card"
        >
          <Paperclip size={16} />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-600 text-white rounded-xl transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// ---- Trade Matches Tab ----

const TradesTab: React.FC<{ cards: CardInventory[]; onOpenThread: (_collectorId: string) => void }> = ({ cards, onOpenThread }) => {
  const matches = useMemo(() => getTradeMatches(cards), [cards]);

  return (
    <div className="space-y-3">
      {matches.length > 0 && (
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
          {matches.length} potential trade partner{matches.length !== 1 ? 's' : ''} found
        </p>
      )}

      {matches.map((match: TradeMatch) => {
        const tierStyle = TIER_COLORS[match.tier] || TIER_COLORS.Rookie;
        return (
          <div
            key={match.collectorId}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4"
          >
            {/* Collector Header */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: match.avatarColor }}
              >
                {match.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{match.collectorName}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tierStyle.text} ${tierStyle.bg} border ${tierStyle.border}`}>
                    {match.tier}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < Math.round(match.reputation) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500">{match.reputation.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bebas tracking-wider text-blue-400">{match.matchScore}%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Match</p>
              </div>
            </div>

            {/* Match Score Bar */}
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  match.matchScore >= 70 ? 'bg-green-500' : match.matchScore >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${match.matchScore}%` }}
              />
            </div>

            {/* What They Have */}
            {match.theyHaveYouWant.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                  They have (you want)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.theyHaveYouWant.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium rounded-lg"
                    >
                      {item.player}
                      <span className="text-green-400/60">${item.value.toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What You Have */}
            {match.youHaveTheyWant.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  You have (they want)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.youHaveTheyWant.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium rounded-lg"
                    >
                      {item.player}
                      <span className="text-amber-400/60">${item.value.toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread(match.collectorId);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              <MessageCircle size={14} />
              Propose Trade
            </button>
          </div>
        );
      })}

      {matches.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No trade matches found. Add more cards to your collection to find potential trades.
        </div>
      )}
    </div>
  );
};

// ---- Discover Tab ----

const SPORTS_FILTER: (Sport | 'All')[] = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const DiscoverTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');
  const [following, setFollowing] = useState<string[]>(() => getFollowing());

  const profiles = useMemo(() => {
    return getCollectorProfiles({
      search: searchQuery || undefined,
      sport: sportFilter !== 'All' ? sportFilter : undefined,
    });
  }, [searchQuery, sportFilter]);

  const handleFollow = (id: string) => {
    if (following.includes(id)) {
      unfollowCollector(id);
      setFollowing(prev => prev.filter(f => f !== id));
    } else {
      followCollector(id);
      setFollowing(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search collectors..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Sport Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {SPORTS_FILTER.map(sport => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              sportFilter === sport
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Collector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {profiles.map((profile: CollectorProfile) => {
          const isFollowing = following.includes(profile.id);
          const tierStyle = TIER_COLORS[profile.tier] || TIER_COLORS.Rookie;
          return (
            <div
              key={profile.id}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: profile.avatarColor }}
                  >
                    {profile.initials}
                  </div>
                  {profile.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{profile.displayName}</span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${tierStyle.text} ${tierStyle.bg} border ${tierStyle.border}`}>
                    {profile.tier}
                  </span>
                </div>
                <button
                  onClick={() => handleFollow(profile.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    isFollowing
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
                  }`}
                  title={isFollowing ? 'Unfollow' : 'Follow'}
                >
                  {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-400 line-clamp-2">{profile.bio}</p>

              {/* Stats */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield size={10} />
                  ${profile.totalValue.toLocaleString()}
                </span>
                <span>{profile.cardCount} cards</span>
                <span className="flex items-center gap-0.5">
                  <Star size={10} className="text-amber-400" />
                  {profile.tradeReputation.toFixed(1)}
                </span>
              </div>

              {/* Top Sport */}
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded">
                  {profile.topSport}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No collectors found matching your search.
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const SocialModal: React.FC<SocialModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('feed');

  const handleOpenThread = (collectorId: string) => {
    startThread(collectorId);
    setActiveTab('messages');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Users size={10} />
                  Collector Network
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Social <span className="text-blue-400">Hub</span> & Messaging
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
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
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
          {activeTab === 'feed' && <FeedTab cards={cards} />}
          {activeTab === 'messages' && <MessagesTab cards={cards} />}
          {activeTab === 'trades' && <TradesTab cards={cards} onOpenThread={handleOpenThread} />}
          {activeTab === 'discover' && <DiscoverTab />}
        </div>
      </div>
    </div>
  );
};

export default SocialModal;
