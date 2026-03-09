import React, { useMemo } from 'react';
import { Zap, TrendingUp, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { CardInventory } from '../types';
import { generatePortfolioQuotes, getLiquidityPoolStats, InstantBuyQuote } from '../lib/instantBuyService';

interface LiquidityPoolWidgetProps {
  inventory: CardInventory[];
  onInstantBuy: (card: CardInventory) => void;
}

const LiquidityPoolWidget: React.FC<LiquidityPoolWidgetProps> = ({ inventory, onInstantBuy }) => {
  const quotes = useMemo(() => generatePortfolioQuotes(inventory).slice(0, 5), [inventory]);
  const stats = useMemo(() => getLiquidityPoolStats(), []);

  const totalInstantValue = useMemo(
    () => quotes.reduce((sum, q) => sum + q.netPayout, 0),
    [quotes]
  );

  const bestQuote = quotes[0];

  if (inventory.length === 0) return null;

  return (
    <div className="luminous-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-lime/5 blur-[80px] rounded-full -mr-12 -mt-12 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-lime/10 rounded-2xl border border-brand-lime/20">
            <Zap size={22} className="text-brand-lime" />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">Liquidity Pool</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">MSI House • Instant Liquidation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal border border-slate-800 rounded-full">
          <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Pool Active</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-brand-lime" />
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Pool Capital</span>
          </div>
          <p className="text-xl font-mono font-bold text-white">${(stats.totalPoolValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-brand-teal" />
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Instant Value</span>
          </div>
          <p className="text-xl font-mono font-bold text-brand-lime">${totalInstantValue.toLocaleString()}</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-brand-green" />
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Transactions</span>
          </div>
          <p className="text-xl font-mono font-bold text-white">{stats.totalTransactions}</p>
        </div>
      </div>

      {/* Top Quotes */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Best Instant Offers</h4>
        {quotes.map((q) => {
          const card = inventory.find(c => c.id === q.cardId);
          if (!card) return null;
          return (
            <div
              key={q.cardId}
              className="flex items-center gap-4 p-4 bg-brand-charcoal/30 rounded-2xl border border-slate-800 hover:border-brand-lime/30 transition-all cursor-pointer group/item"
              onClick={() => onInstantBuy(card)}
            >
              {card.image ? (
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                  <img src={card.image} alt={card.player} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-14 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-slate-600 text-xs font-bold">
                  {card.player.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{card.player}</p>
                <p className="text-[10px] text-brand-muted">{card.year} {card.manufacturer}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono font-bold text-brand-lime">${q.netPayout.toLocaleString()}</p>
                <p className="text-[9px] text-brand-muted">-{q.discountPercent}% of FMV</p>
              </div>
              <ArrowRight size={14} className="text-brand-muted group-hover/item:text-brand-lime transition-colors shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiquidityPoolWidget;
