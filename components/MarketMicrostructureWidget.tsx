import React, { useMemo } from 'react';
import {
  BarChart3,
  ChevronRight,
  AlertTriangle,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  getMicrostructureStats,
  getAllMarketDepths,
  detectAnomalies,
} from '../lib/analytics/marketMicrostructureService';

interface MarketMicrostructureWidgetProps {
  onClick?: () => void;
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export const MarketMicrostructureWidget: React.FC<MarketMicrostructureWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getMicrostructureStats(), []);
  const depths = useMemo(() => getAllMarketDepths(), []);
  const anomalies = useMemo(() => detectAnomalies(), []);

  // Pick the first card with interesting depth for the mini order book
  const featured = depths[0];
  const topBids = featured?.bids.slice(0, 3) ?? [];
  const topAsks = featured?.asks.slice(0, 3) ?? [];

  // Max quantity for bar width scaling
  const maxQty = Math.max(
    ...topBids.map((o) => o.quantity),
    ...topAsks.map((o) => o.quantity),
    1,
  );

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400">
            <BarChart3 size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Market <span className="text-cyan-400">Microstructure</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Level 2 order flow analytics
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* 3-col stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Monitored</span>
          </div>
          <p className="text-lg font-bebas tracking-wider text-cyan-400">
            {stats.totalCardsMonitored}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">cards</p>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Avg Spread</span>
          </div>
          <p className="text-lg font-bebas tracking-wider text-white">
            {stats.avgSpread.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-500 font-mono">bid-ask</p>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Signals</span>
          </div>
          <p className="text-lg font-bebas tracking-wider text-amber-400">
            {stats.activeSignals}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">active</p>
        </div>
      </div>

      {/* Mini Order Book */}
      {featured && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 truncate">
            {featured.cardName}
          </p>

          {/* Bids (green) */}
          {topBids.map((bid) => (
            <div key={bid.id} className="flex items-center gap-2">
              <span className="text-[10px] text-green-400 font-mono w-16 text-right">
                {formatCurrency(bid.price)}
              </span>
              <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500/40 rounded-full"
                  style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono w-6 text-right">
                {bid.quantity}
              </span>
            </div>
          ))}

          {/* Spread line */}
          <div className="flex items-center gap-2 py-1">
            <span className="text-[10px] text-cyan-400 font-mono w-16 text-right">
              spread
            </span>
            <div className="flex-1 border-t border-dashed border-cyan-500/30" />
            <span className="text-[10px] text-cyan-400 font-mono">
              {featured.spreadPercent.toFixed(1)}%
            </span>
          </div>

          {/* Asks (red) */}
          {topAsks.map((ask) => (
            <div key={ask.id} className="flex items-center gap-2">
              <span className="text-[10px] text-red-400 font-mono w-16 text-right">
                {formatCurrency(ask.price)}
              </span>
              <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500/40 rounded-full"
                  style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono w-6 text-right">
                {ask.quantity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Anomaly badge */}
      {anomalies.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
            {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
          {stats.institutionalFlowPercent.toFixed(0)}% institutional flow
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:text-brand-lime transition-colors">
          Open Depth View
        </span>
      </div>
    </button>
  );
};

export default MarketMicrostructureWidget;
