import React, { useMemo } from 'react';
import { BarChart3, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { CardInventory } from '../types';
import { generatePortfolioLiquidityReport } from '../lib/marketDepthService';

interface LiquidityHeatmapProps {
  inventory: CardInventory[];
  onCardClick?: (card: CardInventory) => void;
}

const LiquidityHeatmap: React.FC<LiquidityHeatmapProps> = ({ inventory, onCardClick }) => {
  const report = useMemo(() => generatePortfolioLiquidityReport(inventory), [inventory]);

  if (inventory.length === 0) return null;

  return (
    <div className="luminous-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/5 blur-[80px] rounded-full -mr-12 -mt-12 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green/10 rounded-2xl border border-brand-green/20">
            <BarChart3 size={22} className="text-brand-green" />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">Liquidity Intelligence</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Portfolio Market Depth & Exit Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal border border-slate-800 rounded-full">
          <Clock size={14} className="text-brand-muted" />
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            ~{report.avgDaysToLiquidate}d to liquidate
          </span>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Liquid Assets</p>
          <p className="text-xl font-mono font-bold text-brand-green">${report.liquidValue.toLocaleString()}</p>
          <p className="text-[10px] text-brand-muted">{report.liquidPct}% of portfolio</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Moderate</p>
          <p className="text-xl font-mono font-bold text-brand-orange">${report.moderateValue.toLocaleString()}</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Illiquid</p>
          <p className="text-xl font-mono font-bold text-brand-red">${report.illiquidValue.toLocaleString()}</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Score</p>
          <p className={`text-xl font-mono font-bold ${report.avgLiquidity >= 60 ? 'text-brand-green' : report.avgLiquidity >= 40 ? 'text-brand-orange' : 'text-brand-red'}`}>
            {report.avgLiquidity}/100
          </p>
        </div>
      </div>

      {/* Liquidity Heatmap Bar */}
      <div className="mb-8">
        <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Distribution Heatmap</h4>
        <div className="flex rounded-xl overflow-hidden h-8">
          {report.buckets.filter(b => b.count > 0).map((bucket) => {
            const pct = report.totalValue > 0 ? (bucket.value / report.totalValue) * 100 : 0;
            if (pct < 1) return null;
            return (
              <div
                key={bucket.label}
                className="relative group/bar transition-all hover:opacity-80"
                style={{ width: `${pct}%`, backgroundColor: bucket.color }}
                title={`${bucket.label}: ${bucket.count} cards, $${bucket.value.toLocaleString()}`}
              >
                {pct >= 10 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-black text-white/80 uppercase">{bucket.count}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {report.buckets.filter(b => b.count > 0).map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: bucket.color }} />
              <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                {bucket.label} ({bucket.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Stuck Inventory + Concentration Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stuck Inventory */}
        {report.stuckInventory.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-brand-orange" /> Stuck Inventory
            </h4>
            <div className="space-y-2">
              {report.stuckInventory.map((item) => (
                <div
                  key={item.card.id}
                  className="flex items-center gap-3 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/10 cursor-pointer hover:border-brand-orange/30 transition-all"
                  onClick={() => onCardClick?.(item.card)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.card.player}</p>
                    <p className="text-[10px] text-brand-muted truncate">{item.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-brand-orange">{item.daysStuck}d</p>
                    <p className="text-[9px] text-brand-muted">avg sell</p>
                  </div>
                  <ChevronRight size={14} className="text-brand-muted shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concentration Risk */}
        {report.concentrationRisk.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-brand-red" /> Illiquid Concentration Risk
            </h4>
            <div className="space-y-2">
              {report.concentrationRisk.map((item) => (
                <div
                  key={item.card.id}
                  className="flex items-center gap-3 p-3 bg-brand-red/5 rounded-xl border border-brand-red/10 cursor-pointer hover:border-brand-red/30 transition-all"
                  onClick={() => onCardClick?.(item.card)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.card.player}</p>
                    <p className="text-[10px] text-brand-muted">{item.pct}% of portfolio • Liquidity: {item.liquidity}/100</p>
                  </div>
                  <ChevronRight size={14} className="text-brand-muted shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityHeatmap;
