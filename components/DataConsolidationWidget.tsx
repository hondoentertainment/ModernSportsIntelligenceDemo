// @ts-nocheck
import React, { useMemo } from 'react';
import { Database, ChevronRight, Repeat, AlertCircle, Zap } from 'lucide-react';
import {
  getConsolidationStats,
  getArbitrageOpportunities,
} from '../lib/utils/dataConsolidationService';

interface DataConsolidationWidgetProps {
  onOpenModal: () => void;
}

const DataConsolidationWidget: React.FC<DataConsolidationWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => getConsolidationStats(), []);
  const arbs = useMemo(() => getArbitrageOpportunities(), []);
  const topArb = arbs[0] ?? null;

  const syncAge = useMemo(() => {
    const ms = Date.now() - new Date(stats.lastSync).getTime();
    const mins = Math.floor(ms / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  }, [stats.lastSync]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5 hover:border-brand-lime/40 hover:bg-slate-900/80 transition-all duration-200 group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center">
            <Database size={18} className="text-brand-lime" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Market Data Hub</h3>
            <p className="text-[10px] text-slate-500 font-medium">Consolidated Tape</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-lime transition-colors" />
      </div>

      {/* Synced badge + freshness */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <Repeat size={10} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {stats.totalPlatforms} Platforms Synced
          </span>
        </span>
        <span className="text-[10px] text-slate-500 font-medium">{syncAge}</span>
      </div>

      {/* Arbitrage alert */}
      {topArb && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
              {stats.activeArbitrageOps} Active Arbitrage
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate">
            Top: <span className="font-semibold text-white">{topArb.player}</span>
            {' '}— Buy {topArb.buyPlatform} ${topArb.buyPrice.toLocaleString()}
            {' → '}Sell {topArb.sellPlatform} ${topArb.sellPrice.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
            Net profit: ${topArb.netProfit.toLocaleString()} ({topArb.spreadPercent.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Data freshness */}
      <div className="flex items-center gap-1.5">
        <AlertCircle size={10} className="text-slate-500" />
        <span className="text-[10px] text-slate-500 font-medium">
          {stats.dataPointsToday.toLocaleString()} data points today
        </span>
      </div>
    </button>
  );
};

export default DataConsolidationWidget;
