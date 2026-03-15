import React, { useMemo } from 'react';
import { Globe, ChevronRight, TrendingUp, DollarSign } from 'lucide-react';
import {
  getArbitrageOpportunities,
  getMarketProfiles,
  getTopArbitrageToday,
  formatCurrency,
} from '../lib/internationalArbitrageService';

interface InternationalArbitrageWidgetProps {
  onOpenModal?: () => void;
}

export const InternationalArbitrageWidget: React.FC<InternationalArbitrageWidgetProps> = ({ onOpenModal }) => {
  const opportunities = useMemo(() => getArbitrageOpportunities(), []);
  const markets = useMemo(() => getMarketProfiles(), []);
  const topArbitrage = useMemo(() => getTopArbitrageToday(), []);

  const activeOpps = useMemo(() => opportunities.filter(o => o.active).length, [opportunities]);

  const bestSpread = useMemo(() => {
    if (opportunities.length === 0) return 0;
    return Math.max(...opportunities.map(o => o.spreadPercent));
  }, [opportunities]);

  const totalProfit = useMemo(() => {
    return opportunities.reduce((sum, o) => sum + o.potentialProfit, 0);
  }, [opportunities]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Globe size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">International Arbitrage</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Active Opps</p>
          <p className="text-lg font-bold text-emerald-400">{activeOpps}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Best Spread</p>
          <p className="text-lg font-bold text-white">{bestSpread.toFixed(1)}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Markets</p>
          <p className="text-lg font-bold text-cyan-400">{markets.length}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Potential Profit</p>
          <p className="text-lg font-bold text-brand-lime">{formatCurrency(totalProfit)}</p>
        </div>
      </div>

      {/* Top arbitrage opportunity */}
      {topArbitrage && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4">
          <Globe size={14} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Top Arbitrage</p>
            <p className="text-xs text-white font-medium truncate">{topArbitrage.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">{topArbitrage.buyMarket} &rarr; {topArbitrage.sellMarket}</p>
            <p className="text-sm font-bold text-emerald-400">+{formatCurrency(topArbitrage.netProfit)}</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Avg Spread: <span className="text-white font-bold">{opportunities.length > 0 ? (opportunities.reduce((s, o) => s + o.spreadPercent, 0) / opportunities.length).toFixed(1) : '0'}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Total Opps: <span className="text-emerald-400 font-bold">{opportunities.length}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default InternationalArbitrageWidget;
