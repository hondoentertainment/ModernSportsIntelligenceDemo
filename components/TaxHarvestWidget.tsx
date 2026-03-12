import React, { useMemo } from 'react';
import {
  Scissors,
  ChevronRight,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { CardInventory } from '../types';
import { getTaxHarvestSummary, TaxHarvestSummary } from '../lib/taxHarvestService';

interface TaxHarvestWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const TaxHarvestWidget: React.FC<TaxHarvestWidgetProps> = ({ cards, onClick }) => {
  const summary: TaxHarvestSummary = useMemo(() => getTaxHarvestSummary(cards), [cards]);

  const topRec = summary.topRecommendation;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
            <Scissors size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Tax-Loss <span className="text-rose-400">Harvester</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Optimize your tax position
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary.washSaleRestrictions > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
              <ShieldAlert size={12} />
              {summary.washSaleRestrictions}
            </span>
          )}
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingDown size={13} className="text-red-400" />
          <span className="text-slate-400 font-medium">Losses:</span>
          <span className="font-bebas text-lg text-red-400 tracking-wider">
            ${summary.totalHarvestable.toLocaleString()}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <DollarSign size={13} className="text-green-400" />
          <span className="text-slate-400 font-medium">Savings:</span>
          <span className="font-bebas text-lg text-green-400 tracking-wider">
            ${summary.estimatedSavings.toLocaleString()}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs ml-auto">
          <span className="text-slate-400 font-medium">Cards:</span>
          <span className="font-mono font-bold text-white">{summary.cardsWithLosses}</span>
        </div>
      </div>

      {/* Approaching Long-Term */}
      {summary.cardsApproachingLongTerm > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs">
          <Clock size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 font-medium">
            {summary.cardsApproachingLongTerm} card{summary.cardsApproachingLongTerm !== 1 ? 's' : ''} approaching 1-year threshold
          </span>
          <span className="ml-auto text-amber-400/60 text-[10px] font-mono">
            Act soon
          </span>
        </div>
      )}

      {/* Top Recommendation */}
      {topRec && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Top Harvest</p>
          <div className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl">
            <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-white text-xs font-medium truncate block">
                {topRec.player} - {topRec.set} {topRec.year}
              </span>
              <span className="text-[10px] text-slate-400">
                {topRec.holdingClass} | -{topRec.lossAmount.toLocaleString()} loss
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-green-400 font-mono font-bold text-sm block">
                +${topRec.taxBenefit.toFixed(0)}
              </span>
              <span className="text-[9px] text-slate-500">tax benefit</span>
            </div>
          </div>
        </div>
      )}

      {/* Wash Sale Warning */}
      {summary.washSaleRestrictions > 0 && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
          <ShieldAlert size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-slate-400">Wash sale restrictions:</span>
          <span className="text-amber-400 font-mono font-bold">{summary.washSaleRestrictions} active</span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500 group-hover:text-rose-400 transition-colors">
        <Scissors size={13} />
        <span className="font-medium">View full tax-loss harvesting suite</span>
        <ChevronRight size={13} />
      </div>
    </button>
  );
};

export default TaxHarvestWidget;
