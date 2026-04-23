// @ts-nocheck
// P2P Marketplace Widget — Compact dashboard card
import React, { useMemo } from 'react';
import {
  ShoppingCart,
  ChevronRight,
  Tag,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import {
  getActiveListings,
  getOffers,
  getMarketplaceStats,
  getListingDealScore,
} from '../lib/trading/p2pMarketplaceService';

interface P2PMarketplaceWidgetProps {
  onOpenModal: () => void;
}

// ── Deal score pill ─────────────────────────────────────────────────────────────

const DealPill: React.FC<{ score: number }> = ({ score }) => {
  const cls = score >= 65
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : score >= 45
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {score}
    </span>
  );
};

// ── Format currency ─────────────────────────────────────────────────────────────

function fmtPrice(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

// ── Widget ──────────────────────────────────────────────────────────────────────

const P2PMarketplaceWidget: React.FC<P2PMarketplaceWidgetProps> = ({ onOpenModal }) => {
  const listings = useMemo(() => getActiveListings(), []);
  const stats = useMemo(() => getMarketplaceStats(), []);
  const offers = useMemo(() => getOffers().filter(o => o.status === 'pending'), []);

  // Top 3 hot listings by views
  const hotListings = useMemo(() =>
    [...listings].sort((a, b) => b.views - a.views).slice(0, 3),
  [listings]);

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-lime-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <ShoppingCart size={16} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">P2P Marketplace</h3>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Listings</p>
          <p className="text-lg font-bold text-slate-200">{stats.activeListings}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <MessageSquare size={8} className="text-lime-400" /> Offers
          </p>
          <p className="text-lg font-bold text-lime-400">{offers.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Price</p>
          <p className="text-lg font-bold text-slate-200">{fmtPrice(stats.avgPrice)}</p>
        </div>
      </div>

      {/* Hot listings */}
      <div className="space-y-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <TrendingUp size={10} className="text-lime-400" /> Hot Listings
        </p>
        {hotListings.map((listing) => {
          const score = getListingDealScore(listing);
          return (
            <div key={listing.id} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/40">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{listing.player}</p>
                <p className="text-[10px] text-slate-500 truncate">{listing.grade} &middot; {listing.sport}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs font-bold text-slate-200">{fmtPrice(listing.askingPrice)}</span>
                <DealPill score={score} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Tag size={10} />
          <span>{stats.totalVolume >= 1000 ? `$${(stats.totalVolume / 1000).toFixed(0)}K` : `$${stats.totalVolume}`} total volume</span>
        </div>
        <span className="text-[10px] text-lime-400 font-medium group-hover:underline">View All</span>
      </div>
    </div>
  );
};

export default P2PMarketplaceWidget;
