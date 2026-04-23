// @ts-nocheck
import React, { useMemo } from 'react';
import { Calculator, ChevronRight, TrendingDown, Leaf, DollarSign } from 'lucide-react';
import {
  getTransactions,
  getCapitalGains,
  getTaxOwed,
  getHarvestOpportunities,
  formatCurrency,
} from '../lib/utils/taxCalculatorService';

interface TaxCalculatorWidgetProps {
  onOpenModal?: () => void;
}

export const TaxCalculatorWidget: React.FC<TaxCalculatorWidgetProps> = ({ onOpenModal }) => {
  const transactions = useMemo(() => getTransactions(), []);
  const capitalGains = useMemo(() => getCapitalGains(), []);
  const taxOwed = useMemo(() => getTaxOwed(), []);
  const harvestOpps = useMemo(() => getHarvestOpportunities(), []);

  const largestGain = useMemo(() => {
    if (capitalGains.items.length === 0) return null;
    return capitalGains.items.reduce((best, g) => g.gainAmount > best.gainAmount ? g : best, capitalGains.items[0]);
  }, [capitalGains]);

  const bestHarvest = useMemo(() => {
    if (harvestOpps.length === 0) return null;
    return harvestOpps.reduce((best, h) => h.savingsAmount > best.savingsAmount ? h : best, harvestOpps[0]);
  }, [harvestOpps]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-orange-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Calculator size={16} className="text-orange-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Tax Calculator</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Transactions</p>
          <p className="text-lg font-bold text-orange-400">{transactions.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Capital Gains</p>
          <p className="text-lg font-bold text-white">{formatCurrency(capitalGains.totalGains)}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Tax Owed</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(taxOwed.totalOwed)}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Harvest Opps</p>
          <p className="text-lg font-bold text-emerald-400">{harvestOpps.length}</p>
        </div>
      </div>

      {/* Best harvest opportunity highlight */}
      {bestHarvest && (
        <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl mb-4">
          <Leaf size={14} className="text-orange-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Top Harvest Opp</p>
            <p className="text-xs text-white font-medium truncate">{bestHarvest.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Savings</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(bestHarvest.savingsAmount)}</p>
          </div>
        </div>
      )}

      {/* Bottom: largest gain + effective rate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingDown size={12} className="text-orange-400" />
          <span className="text-xs text-slate-400">Largest: <span className="text-white font-bold">{largestGain ? formatCurrency(largestGain.gainAmount) : '$0'}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-red-400" />
          <span className="text-xs text-slate-400">
            Rate: <span className="text-red-400 font-bold">{taxOwed.effectiveRate.toFixed(1)}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default TaxCalculatorWidget;
