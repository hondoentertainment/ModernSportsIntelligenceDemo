// @ts-nocheck
// P2P Marketplace Modal — Listing grid with filters and quick offer interface
import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingCart,
  Search,
  Filter,
  Tag,
  Eye,
  Heart,
  MessageSquare,
  Star,
  DollarSign,
  Send,
  ChevronDown,
  Shield,
} from 'lucide-react';
import {
  getListingDealScore,
  getListingsByFilters,
  getTopSellers,
  getListingsWithDealRoomOptions,
  getCombinedMarketStats,
  Listing,
  Sport,
  CardGrade,
} from '../lib/trading/p2pMarketplaceService';

// ── Types ───────────────────────────────────────────────────────────────────────

interface P2PMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const SPORTS: Sport[] = ['Basketball', 'Baseball', 'Football', 'Hockey', 'Soccer'];
const GRADES: CardGrade[] = ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'SGC 10', 'SGC 9.5', 'Raw'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'deal-score', label: 'Best Deals' },
  { value: 'most-viewed', label: 'Most Viewed' },
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

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

const SPORT_ICON: Record<Sport, string> = {
  Basketball: '🏀', Baseball: '⚾', Football: '🏈', Hockey: '🏒', Soccer: '⚽',
};

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

// ── Quick Offer Popover ─────────────────────────────────────────────────────────

const QuickOffer: React.FC<{ listing: Listing; onClose: () => void }> = ({ listing, onClose }) => {
  const [amount, setAmount] = useState(Math.round(listing.askingPrice * 0.9).toString());
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(onClose, 1500);
  };

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
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X size={14} />
        </button>
      </div>
      <div className="text-xs text-slate-400">
        {listing.player} &middot; Asking <span className="text-slate-200 font-medium">{fmtPrice(listing.askingPrice)}</span>
      </div>
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Your Offer</label>
        <div className="relative mt-1">
          <DollarSign size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-slate-500 uppercase tracking-wider">Message (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={2}
          className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none resize-none"
          placeholder="Add a message to the seller..."
        />
      </div>
      <button
        onClick={handleSend}
        className="w-full flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
      >
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
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-lime-500/30 transition-all group relative">
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-br from-slate-700/80 to-slate-800 flex items-center justify-center relative">
        <span className="text-4xl">{SPORT_ICON[listing.sport]}</span>
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded border text-[10px] font-bold ${dealBg(score)} ${dealColor(score)}`}>
          Deal {score}
        </div>
        {discount > 0 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
            {discount}% below MV
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 truncate">{listing.player}</h4>
          <p className="text-[11px] text-slate-400 truncate">{listing.cardDescription}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">{listing.grade}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">{listing.sport}</span>
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
          <span className="text-slate-400">{listing.seller}</span>
        </div>

        {/* Quick Offer Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowOffer(true); }}
          className="w-full flex items-center justify-center gap-1.5 bg-lime-600/20 hover:bg-lime-600/40 text-lime-400 text-xs font-semibold py-1.5 rounded-lg border border-lime-500/30 transition-colors"
        >
          <Tag size={12} /> Make Offer
        </button>
      </div>

      {/* Quick Offer Overlay */}
      {showOffer && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-xl z-10 flex items-center">
          <div className="w-full">
            <QuickOffer listing={listing} onClose={() => setShowOffer(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Modal ───────────────────────────────────────────────────────────────────────

const P2PMarketplaceModal: React.FC<P2PMarketplaceModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | ''>('');
  const [gradeFilter, setGradeFilter] = useState<CardGrade | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredListings = useMemo(() => {
    let results = getListingsByFilters({
      sport: sportFilter || undefined,
      grade: gradeFilter || undefined,
      search: search || undefined,
    });

    switch (sortBy) {
      case 'price-low': results.sort((a, b) => a.askingPrice - b.askingPrice); break;
      case 'price-high': results.sort((a, b) => b.askingPrice - a.askingPrice); break;
      case 'deal-score': results.sort((a, b) => getListingDealScore(b) - getListingDealScore(a)); break;
      case 'most-viewed': results.sort((a, b) => b.views - a.views); break;
      default: break; // newest — already sorted by service
    }
    return results;
  }, [search, sportFilter, gradeFilter, sortBy]);

  const topSellers = useMemo(() => getTopSellers().slice(0, 4), []);
  const dealRoomListings = useMemo(() => getListingsWithDealRoomOptions(), []);
  const _combinedStats = useMemo(() => getCombinedMarketStats(), []);
  const dealRoomEligible = useMemo(() => dealRoomListings.filter(l => l.eligibleForDealRoom), [dealRoomListings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <ShoppingCart size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">P2P Marketplace</h2>
              <p className="text-xs text-slate-400">{filteredListings.length} active listings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search & Filters bar */}
        <div className="p-4 border-b border-slate-700/50 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search players, cards, sellers..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-lime-500/50 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-lime-500/50 focus:outline-none"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Toggle filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                showFilters ? 'bg-lime-600/20 border-lime-500/30 text-lime-400' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <Filter size={14} /> Filters <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Sport */}
              <select
                value={sportFilter}
                onChange={e => setSportFilter(e.target.value as Sport | '')}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none"
              >
                <option value="">All Sports</option>
                {SPORTS.map(s => <option key={s} value={s}>{SPORT_ICON[s]} {s}</option>)}
              </select>

              {/* Grade */}
              <select
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value as CardGrade | '')}
                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-lime-500/50 focus:outline-none"
              >
                <option value="">All Grades</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              {/* Clear */}
              {(sportFilter || gradeFilter || search) && (
                <button
                  onClick={() => { setSportFilter(''); setGradeFilter(''); setSearch(''); }}
                  className="text-xs text-slate-400 hover:text-lime-400 underline"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Top Sellers row */}
          <div className="mb-4">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Star size={12} className="text-amber-400" /> Top Sellers
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {topSellers.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 min-w-[180px]">
                  <span className="text-xl">{s.avatar}</span>
                  <div>
                    <p className="text-xs font-medium text-slate-200 flex items-center gap-1">
                      {s.username}
                      {s.verified && <span className="text-lime-400 text-[10px]">✓</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      <Star size={8} className="inline text-amber-400" /> {s.rating} &middot; {s.totalSales} sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Room Eligible (Phase 85 Cross-reference) */}
          {dealRoomEligible.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield size={12} className="text-purple-400" /> Deal Room Eligible ({dealRoomEligible.length})
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dealRoomEligible.slice(0, 4).map(drl => (
                  <div key={drl.listing.id} className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-2 min-w-[200px]">
                    <div>
                      <p className="text-xs font-medium text-slate-200">{drl.listing.player}</p>
                      <p className="text-[10px] text-slate-500">{fmtPrice(drl.listing.askingPrice)}</p>
                      <p className="text-[10px] text-purple-400">{drl.dealRoomReason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listing grid */}
          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShoppingCart size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No listings match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default P2PMarketplaceModal;
