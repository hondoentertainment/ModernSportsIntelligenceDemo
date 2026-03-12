import React, { useMemo } from 'react';
import {
  Search,
  TrendingDown,
  ArrowRightLeft,
  ChevronRight,
  DollarSign,
  Zap,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  generateListings,
  findDeals,
  findArbitrage,
  getDealSummary,
  PLATFORM_COLORS,
  Platform,
} from '../lib/dealFinderService';

interface DealFinderWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

function getScoreBadge(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 80) return { label: 'Hot Deal', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' };
  if (score >= 60) return { label: 'Good Deal', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
  return { label: 'Overpriced', color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' };
}

export const DealFinderWidget: React.FC<DealFinderWidgetProps> = ({ cards, onClick }) => {
  const listings = useMemo(() => generateListings(cards), [cards]);
  const deals = useMemo(() => findDeals(listings, { minScore: 40 }), [listings]);
  const arbitrage = useMemo(() => findArbitrage(listings), [listings]);
  const summary = useMemo(() => getDealSummary(deals, arbitrage), [deals, arbitrage]);

  const topDeals = deals.slice(0, 5);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400">
            <Search size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Deal <span className="text-green-400">Finder</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Cross-platform arbitrage
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-green-400 bg-green-500/15 border border-green-500/30">
          <DollarSign size={14} />
          ${summary.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Zap size={14} />
          {summary.totalDeals} deal{summary.totalDeals !== 1 ? 's' : ''}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-purple-400">
          <ArrowRightLeft size={14} />
          {summary.arbitrageCount} arb{summary.arbitrageCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Top 5 Deals */}
      {topDeals.length > 0 && (
        <div className="space-y-2">
          {topDeals.map(deal => {
            const badge = getScoreBadge(deal.dealScore);
            const platColors = PLATFORM_COLORS[deal.listing.platform as Platform];
            return (
              <div
                key={deal.id}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/30 border border-transparent rounded-xl"
              >
                {/* Score Badge */}
                <span className={`w-10 text-center font-bebas text-lg tracking-wider ${
                  deal.dealScore >= 70 ? 'text-green-400' : deal.dealScore >= 50 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {deal.dealScore}
                </span>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {deal.listing.player}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {deal.listing.cardDescription}
                  </p>
                </div>

                {/* Platform Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${platColors.text} ${platColors.bg} border ${platColors.border}`}>
                  {deal.listing.platform}
                </span>

                {/* Savings */}
                {deal.savingsAmount > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-green-400">
                    <TrendingDown size={12} />
                    -${deal.savingsAmount.toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {topDeals.length === 0 && (
        <div className="text-center py-4 text-slate-500 text-xs">
          Add cards to find deals across marketplaces
        </div>
      )}
    </button>
  );
};

export default DealFinderWidget;
