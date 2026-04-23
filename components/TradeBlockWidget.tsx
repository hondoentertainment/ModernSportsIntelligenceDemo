// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Repeat,
  Tag,
  Bell,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getTradeBlock,
  getTradeStats,
  getTradeHistory,
  generateSimulatedOffers,
} from '../lib/trading/tradeBlockService';

interface TradeBlockWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

export const TradeBlockWidget: React.FC<TradeBlockWidgetProps> = ({ inventory, onClick }) => {
  const _stats = useMemo(() => getTradeStats(inventory), [inventory]);

  const listings = useMemo(() => getTradeBlock(), []);

  const totalBlockValue = useMemo(() => {
    return listings.reduce((sum, l) => {
      const card = inventory.find(c => c.id === l.cardId);
      const value = card?.currentValue ?? card?.purchasePrice ?? l.askPrice;
      return sum + value;
    }, 0);
  }, [listings, inventory]);

  const recentHistory = useMemo(() => {
    const history = getTradeHistory();
    return history.slice(0, 3).map(h => {
      const card = inventory.find(c => c.id === h.cardId);
      return {
        ...h,
        player: card?.player ?? (h.player || 'Unknown'),
        sport: card?.sport ?? h.sport,
        roi: card && card.purchasePrice > 0
          ? ((h.finalPrice - card.purchasePrice) / card.purchasePrice) * 100
          : h.roi,
      };
    });
  }, [inventory]);

  // Generate simulated offers so pendingOffers count is populated
  useMemo(() => {
    if (listings.length > 0) {
      generateSimulatedOffers(listings, inventory);
    }
  }, [listings, inventory]);

  // Recompute stats after offer generation
  const liveStats = useMemo(() => getTradeStats(inventory), [inventory]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Repeat size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Trade <span className="text-emerald-400">Block</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Offer management system
            </p>
          </div>
        </div>
        {liveStats.pendingOffers > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <Bell size={12} />
            {liveStats.pendingOffers} pending
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Tag size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Listed:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{liveStats.activeListings}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Value:</span>
          <span className="font-mono text-white">
            ${totalBlockValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">ROI:</span>
          <span className={`font-mono ${liveStats.avgTradeROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {liveStats.avgTradeROI > 0 ? '+' : ''}{liveStats.avgTradeROI.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      {recentHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recent Trades</p>
          <div className="space-y-1.5">
            {recentHistory.map(trade => (
              <div
                key={trade.id}
                className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
              >
                <Clock size={12} className="text-slate-500 flex-shrink-0" />
                <span className="text-white font-medium truncate flex-1">
                  {trade.player}
                </span>
                <span className="font-mono text-slate-400">
                  ${trade.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono text-xs w-16 text-right ${
                  trade.roi >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.roi > 0 ? '+' : ''}{trade.roi.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for listings */}
      {liveStats.activeListings === 0 && recentHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Repeat size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No cards on trade block</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to add cards and manage trades
          </p>
        </div>
      )}

      {/* Footer hint */}
      {(liveStats.activeListings > 0 || recentHistory.length > 0) && (
        <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
          Click to manage trade block
        </p>
      )}
    </button>
  );
};

export default TradeBlockWidget;
