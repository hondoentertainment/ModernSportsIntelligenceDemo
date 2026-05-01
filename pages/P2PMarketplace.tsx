// P2P Marketplace — Full Page
// Route: /p2p-marketplace | Icon: ShoppingCart
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  Tag,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Send,
  X,
  Users,
  BarChart3,
  Package,
  Clock,
  Award,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getActiveListings,
  getMyListings,
  getOffers,
  getMyOffers,
  getTopSellers,
  getMarketplaceStats,
  getListingDealScore,
  getListingsByFilters,
  Listing,
  Offer,
  SellerProfile,
  Sport,
  CardGrade,
  CardCondition,
} from '../lib/trading/p2pMarketplaceService';
import { supabase, isDemoMode } from '../lib/supabase';

// ── Constants ───────────────────────────────────────────────────────────────────

const SPORTS: Sport[] = ['Basketball', 'Baseball', 'Football', 'Hockey', 'Soccer'];
const GRADES: CardGrade[] = ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'SGC 10', 'SGC 9.5', 'Raw'];
const CONDITIONS: CardCondition[] = ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair'];

const SPORT_ICON: Record<Sport, string> = {
  Basketball: '🏀', Baseball: '⚾', Football: '🏈', Hockey: '🏒', Soccer: '⚽',
};

type TabId = 'browse' | 'my-listings' | 'my-offers';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'deal-score' | 'most-viewed';

// ── Helpers ─────────────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function dealColor(score: number): string {
  if (score >= 65) return 'text-emerald-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-red-400';
}

function dealBg(score: number): string {
  if (score >= 65) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 45) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

function offerStatusBadge(status: string): { label: string; cls: string; icon: React.ReactNode } {
  switch (status) {
    case 'pending':   return { label: 'Pending',   cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',    icon: <Clock size={10} /> };
    case 'accepted':  return { label: 'Accepted',  cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={10} /> };
    case 'rejected':  return { label: 'Rejected',  cls: 'bg-red-500/20 text-red-400 border-red-500/30',          icon: <XCircle size={10} /> };
    case 'countered': return { label: 'Countered', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       icon: <ArrowUpDown size={10} /> };
    case 'expired':   return { label: 'Expired',   cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30',    icon: <AlertCircle size={10} /> };
    default:          return { label: status,       cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30',    icon: null };
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Deal Score Bar ──────────────────────────────────────────────────────────────

const DealScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const fill = score >= 65 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${dealColor(score)}`}>{score}</span>
    </div>
  );
};

// ── Quick Offer Overlay ─────────────────────────────────────────────────────────

const QuickOffer: React.FC<{ listing: Listing; onClose: () => void }> = ({ listing, onClose }) => {
  const [amount, setAmount] = useState(Math.round(listing.askingPrice * 0.9).toString());
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => { setSent(true); setTimeout(onClose, 1500); };

  if (sent) {
    return (
      <div className="p-4 text-center">
        <div className="text-emerald-400 text-lg mb-1">Offer Sent!</div>
        <p className="text-xs text-slate-400">The seller will be notified.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Make an Offer</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
      </div>
      <p className="text-xs text-slate-400">
        {listing.player} &middot; Asking <span className="text-slate-200 font-medium">{fmtPrice(listing.askingPrice)}</span>
      </p>
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Your Offer</label>
        <div className="relative mt-1">
          <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none" />
        </div>
      </div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none resize-none"
        placeholder="Add a message..." />
      <button onClick={handleSend}
        className="w-full flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors">
        <Send size={14} /> Send Offer
      </button>
    </div>
  );
};

// ── Listing Card ────────────────────────────────────────────────────────────────

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [showOffer, setShowOffer] = useState(false);
  const score = getListingDealScore(listing);
  const discount = listing.marketValue > 0
    ? Math.round(((listing.marketValue - listing.askingPrice) / listing.marketValue) * 100)
    : 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-lime-500/30 transition-all relative">
      {/* Image area */}
      <div className="h-36 bg-gradient-to-br from-slate-700/80 to-slate-800 flex items-center justify-center relative">
        <span className="text-5xl opacity-70">{SPORT_ICON[listing.sport]}</span>
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded border text-[10px] font-bold ${dealBg(score)} ${dealColor(score)}`}>
          Deal {score}
        </div>
        {discount > 0 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            {discount}% below MV
          </div>
        )}
        {listing.status !== 'active' && (
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            listing.status === 'sold' ? 'bg-red-500/80 text-white' : 'bg-amber-500/80 text-white'
          }`}>
            {listing.status}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 truncate">{listing.player}</h4>
          <p className="text-[11px] text-slate-400 truncate">{listing.cardDescription}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">{listing.grade}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">{listing.sport}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">{listing.year}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-100">{fmtPrice(listing.askingPrice)}</p>
            <p className="text-[10px] text-slate-500">MV: {fmtPrice(listing.marketValue)}</p>
          </div>
          <DealScoreBar score={score} />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-700/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5"><Eye size={10} /> {listing.views}</span>
            <span className="flex items-center gap-0.5"><Heart size={10} /> {listing.watchers}</span>
            <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {listing.offerCount}</span>
          </div>
          <span className="text-slate-400">{timeAgo(listing.createdAt)}</span>
        </div>

        {listing.status === 'active' && (
          <button onClick={() => setShowOffer(true)}
            className="w-full flex items-center justify-center gap-1.5 bg-lime-600/20 hover:bg-lime-600/40 text-lime-400 text-xs font-semibold py-1.5 rounded-lg border border-lime-500/30 transition-colors">
            <Tag size={12} /> Make Offer
          </button>
        )}
      </div>

      {/* Offer overlay */}
      {showOffer && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-xl z-10 flex items-center">
          <div className="w-full"><QuickOffer listing={listing} onClose={() => setShowOffer(false)} /></div>
        </div>
      )}
    </div>
  );
};

// ── Seller Card ─────────────────────────────────────────────────────────────────

const SellerCard: React.FC<{ seller: SellerProfile }> = ({ seller }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-lime-500/30 transition-all">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-2xl">{seller.avatar}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 truncate">
          {seller.username}
          {seller.verified && (
            <span className="px-1.5 py-0.5 rounded bg-lime-500/20 border border-lime-500/30 text-[9px] text-lime-400 font-bold">VERIFIED</span>
          )}
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="font-medium text-amber-400">{seller.rating}</span>
          <span>&middot; {seller.totalSales} sales</span>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-slate-900/50 rounded-lg p-2">
        <p className="text-[10px] text-slate-500">Volume</p>
        <p className="text-xs font-bold text-slate-200">{fmtPrice(seller.totalVolume)}</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-2">
        <p className="text-[10px] text-slate-500">Response</p>
        <p className="text-xs font-bold text-slate-200">{seller.responseTime}</p>
      </div>
      <div className="bg-slate-900/50 rounded-lg p-2">
        <p className="text-[10px] text-slate-500">Complete</p>
        <p className="text-xs font-bold text-emerald-400">{seller.completionRate}%</p>
      </div>
    </div>
  </div>
);

// ── Offer Row ───────────────────────────────────────────────────────────────────

const OfferRow: React.FC<{ offer: Offer }> = ({ offer }) => {
  const badge = offerStatusBadge(offer.status);
  return (
    <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{offer.listingTitle}</p>
        <p className="text-xs text-slate-400 mt-0.5">{offer.message}</p>
        <p className="text-[10px] text-slate-500 mt-1">From: {offer.buyer} &middot; {timeAgo(offer.createdAt)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-100">{fmtPrice(offer.amount)}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 ${badge.cls}`}>
          {badge.icon} {badge.label}
        </span>
      </div>
    </div>
  );
};

// ── Price Distribution Chart ────────────────────────────────────────────────────

const PriceDistChart: React.FC<{ listings: Listing[] }> = ({ listings }) => {
  const data = useMemo(() => {
    const buckets = [
      { range: '<$500', min: 0, max: 500, count: 0 },
      { range: '$500-1K', min: 500, max: 1000, count: 0 },
      { range: '$1K-2K', min: 1000, max: 2000, count: 0 },
      { range: '$2K-5K', min: 2000, max: 5000, count: 0 },
      { range: '$5K-10K', min: 5000, max: 10000, count: 0 },
      { range: '$10K+', min: 10000, max: Infinity, count: 0 },
    ];
    listings.forEach(l => {
      const b = buckets.find(b => l.askingPrice >= b.min && l.askingPrice < b.max);
      if (b) b.count++;
    });
    return buckets.map(b => ({ name: b.range, count: b.count }));
  }, [listings]);

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#84cc16' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#84cc16' : '#65a30d'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Filter Sidebar ──────────────────────────────────────────────────────────────

interface FilterState {
  sport: Sport | '';
  minPrice: string;
  maxPrice: string;
  grade: CardGrade | '';
  condition: CardCondition | '';
  search: string;
}

const FilterSidebar: React.FC<{ filters: FilterState; onChange: (_f: FilterState) => void }> = ({ filters, onChange }) => {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      <h3 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
        <Filter size={12} /> Filters
      </h3>

      {/* Search */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Search</label>
        <div className="relative mt-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={filters.search} onChange={e => update({ search: e.target.value })}
            placeholder="Player, card, seller..."
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-lime-500/50 focus:outline-none" />
        </div>
      </div>

      {/* Sport */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Sport</label>
        <div className="mt-1 space-y-1">
          <button onClick={() => update({ sport: '' })}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${!filters.sport ? 'bg-lime-600/20 text-lime-400 border border-lime-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            All Sports
          </button>
          {SPORTS.map(s => (
            <button key={s} onClick={() => update({ sport: s })}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${filters.sport === s ? 'bg-lime-600/20 text-lime-400 border border-lime-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {SPORT_ICON[s]} {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Price Range</label>
        <div className="flex items-center gap-2 mt-1">
          <input type="number" value={filters.minPrice} onChange={e => update({ minPrice: e.target.value })}
            placeholder="Min" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none" />
          <span className="text-slate-500 text-xs">-</span>
          <input type="number" value={filters.maxPrice} onChange={e => update({ maxPrice: e.target.value })}
            placeholder="Max" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none" />
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Grade</label>
        <select value={filters.grade} onChange={e => update({ grade: e.target.value as CardGrade | '' })}
          className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none">
          <option value="">All Grades</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Condition</label>
        <select value={filters.condition} onChange={e => update({ condition: e.target.value as CardCondition | '' })}
          className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none">
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Clear all */}
      {(filters.sport || filters.minPrice || filters.maxPrice || filters.grade || filters.condition || filters.search) && (
        <button onClick={() => onChange({ sport: '', minPrice: '', maxPrice: '', grade: '', condition: '', search: '' })}
          className="w-full text-xs text-slate-400 hover:text-lime-400 underline text-center py-1">
          Clear all filters
        </button>
      )}
    </div>
  );
};

// ── Realtime connection badge ────────────────────────────────────────────────────

const RealtimeBadge: React.FC<{ connected: boolean }> = ({ connected }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
    connected
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : 'bg-slate-700/50 border-slate-600/50 text-slate-500'
  }`}>
    {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
    {connected ? 'Live' : 'Local'}
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────────

const P2PMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('browse');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({
    sport: '', minPrice: '', maxPrice: '', grade: '', condition: '', search: '',
  });
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [listings, setListings] = useState<Listing[]>(() => getActiveListings());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const refreshListings = useCallback(() => {
    setListings(getActiveListings());
  }, []);

  // Subscribe to Supabase Realtime for live listing updates when not in demo mode.
  useEffect(() => {
    if (isDemoMode) return;

    const channel = supabase
      .channel('p2p_marketplace_listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_listings' }, () => {
        refreshListings();
      })
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setRealtimeConnected(false);
    };
  }, [refreshListings]);

  const stats = useMemo(() => getMarketplaceStats(), []);
  const allActive = listings;
  const topSellers = useMemo(() => getTopSellers(), []);
  const myListings = useMemo(() => getMyListings(), []);
  const allOffers = useMemo(() => getOffers(), []);
  const myOffers = useMemo(() => getMyOffers(), []);

  const filteredListings = useMemo(() => {
    let results = getListingsByFilters({
      sport: filters.sport || undefined,
      grade: filters.grade || undefined,
      condition: filters.condition || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      search: filters.search || undefined,
    });
    switch (sortBy) {
      case 'price-low': results.sort((a, b) => a.askingPrice - b.askingPrice); break;
      case 'price-high': results.sort((a, b) => b.askingPrice - a.askingPrice); break;
      case 'deal-score': results.sort((a, b) => getListingDealScore(b) - getListingDealScore(a)); break;
      case 'most-viewed': results.sort((a, b) => b.views - a.views); break;
      default: break;
    }
    return results;
  }, [filters, sortBy]);

  // Offers for my listings
  const incomingOffers = useMemo(() => {
    const myIds = new Set(myListings.map(l => l.id));
    return allOffers.filter(o => myIds.has(o.listingId));
  }, [myListings, allOffers]);

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: 'browse', label: 'Browse Marketplace' },
    { id: 'my-listings', label: 'My Listings', count: myListings.length },
    { id: 'my-offers', label: 'My Offers', count: incomingOffers.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-lime-500/20">
          <ShoppingCart size={24} className="text-lime-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100">P2P Marketplace</h1>
            <RealtimeBadge connected={realtimeConnected} />
          </div>
          <p className="text-sm text-slate-400">
            Peer-to-peer sports card trading with verified sellers, deal scoring, and instant offers
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Listings', value: stats.activeListings.toString(), icon: <Package size={14} className="text-lime-400" />, color: 'text-slate-200' },
          { label: 'Total Volume', value: fmtPrice(stats.totalVolume), icon: <DollarSign size={14} className="text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Avg Price', value: fmtPrice(stats.avgPrice), icon: <Tag size={14} className="text-blue-400" />, color: 'text-slate-200' },
          { label: 'Active Sellers', value: stats.totalSellers.toString(), icon: <Users size={14} className="text-amber-400" />, color: 'text-slate-200' },
          { label: 'Pending Offers', value: stats.totalOffers.toString(), icon: <MessageSquare size={14} className="text-purple-400" />, color: 'text-purple-400' },
          { label: 'Avg Deal Score', value: stats.avgDealScore.toString(), icon: <TrendingUp size={14} className="text-lime-400" />, color: dealColor(stats.avgDealScore) },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">{s.icon}<span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</span></div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-700/50 pb-0">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-lime-500 text-lime-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Browse tab */}
      {activeTab === 'browse' && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 sticky top-6">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>

            {/* Price distribution */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 mt-4">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <BarChart3 size={12} /> Price Distribution
              </h3>
              <PriceDistChart listings={allActive} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Sort bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{filteredListings.length} listings found</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="deal-score">Best Deals</option>
                <option value="most-viewed">Most Viewed</option>
              </select>
            </div>

            {/* Grid */}
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <ShoppingCart size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No listings match your filters</p>
                <button onClick={() => setFilters({ sport: '', minPrice: '', maxPrice: '', grade: '', condition: '', search: '' })}
                  className="mt-2 text-xs text-lime-400 hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}

            {/* Top Sellers */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> Top Sellers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {topSellers.slice(0, 8).map(s => <SellerCard key={s.id} seller={s} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Listings tab */}
      {activeTab === 'my-listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{myListings.length} listings</p>
          </div>
          {myListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Package size={40} className="mb-3 opacity-30" />
              <p className="text-sm">You have no listings yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {myListings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {/* Incoming offers on my listings */}
          {incomingOffers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <MessageSquare size={16} className="text-lime-400" /> Offers on My Listings ({incomingOffers.length})
              </h3>
              <div className="space-y-3">
                {incomingOffers.map(o => <OfferRow key={o.id} offer={o} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Offers tab */}
      {activeTab === 'my-offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{myOffers.length} offers made</p>
          </div>
          {myOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Send size={40} className="mb-3 opacity-30" />
              <p className="text-sm">You haven&apos;t made any offers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOffers.map(o => <OfferRow key={o.id} offer={o} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default P2PMarketplace;
