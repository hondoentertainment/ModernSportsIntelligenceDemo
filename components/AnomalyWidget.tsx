import React, { useMemo } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRightLeft,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  MarketAnomaly,
  AnomalyType,
  AnomalySeverity,
  detectAnomalies,
  findArbitrageOpportunities,
  getAnomalySummary,
} from '../lib/anomalyDetectionService';

interface AnomalyWidgetProps {
  inventory: CardInventory[];
  onAnomalyClick?: (_anomaly: MarketAnomaly) => void;
}

const severityDot: Record<AnomalySeverity, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
};

const typeBadge: Record<AnomalyType, { label: string; color: string; bg: string; border: string }> = {
  spike: { label: 'Spike', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  crash: { label: 'Crash', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  arbitrage: { label: 'Arbitrage', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  mispricing: { label: 'Mispricing', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  volume_surge: { label: 'Volume', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  stale_price: { label: 'Stale', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const trendConfig = {
  increasing: { icon: <TrendingUp size={14} />, text: 'Increasing', color: 'text-red-400' },
  decreasing: { icon: <TrendingDown size={14} />, text: 'Decreasing', color: 'text-green-400' },
  stable: { icon: <Minus size={14} />, text: 'Stable', color: 'text-slate-400' },
};

export const AnomalyWidget: React.FC<AnomalyWidgetProps> = ({ inventory, onAnomalyClick }) => {
  const summary = useMemo(() => getAnomalySummary(inventory), [inventory]);
  const anomalies = useMemo(() => detectAnomalies(inventory), [inventory]);
  const arbitrage = useMemo(() => findArbitrageOpportunities(inventory), [inventory]);

  const topAnomalies = useMemo(() => {
    return [...anomalies]
      .filter(a => !a.isAcknowledged)
      .sort((a, b) => {
        const sevOrder: Record<AnomalySeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
        return Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent);
      })
      .slice(0, 5);
  }, [anomalies]);

  const topArbitrage = useMemo(() => arbitrage.slice(0, 3), [arbitrage]);

  const trend = trendConfig[summary.trendDirection];

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Market <span className="text-red-400">Anomalies</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Price anomaly detection engine
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${trend.color} bg-slate-800`}>
          {trend.icon}
          {trend.text}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Active:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{summary.totalActive}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        {summary.criticalCount > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 font-mono">{summary.criticalCount}</span>
          </div>
        )}
        {summary.highCount > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-mono">{summary.highCount}</span>
          </div>
        )}
        {summary.mediumCount > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-400 font-mono">{summary.mediumCount}</span>
          </div>
        )}
        {summary.lowCount > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-400 font-mono">{summary.lowCount}</span>
          </div>
        )}
        <div className="ml-auto text-xs text-slate-400">
          Avg deviation: <span className="font-mono text-white">{summary.avgDeviation.toFixed(1)}%</span>
        </div>
      </div>

      {/* Top Anomalies */}
      {topAnomalies.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Most Severe</p>
          <div className="space-y-1.5">
            {topAnomalies.map(a => {
              const badge = typeBadge[a.type];
              return (
                <button
                  key={a.id}
                  onClick={() => onAnomalyClick?.(a)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-left transition-all group"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[a.severity]}`} />
                  <span className="text-sm text-white font-medium truncate flex-1 group-hover:text-brand-lime transition-colors">
                    {a.player}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.color} ${badge.bg} border ${badge.border}`}>
                    {badge.label}
                  </span>
                  <span className={`font-mono text-xs w-16 text-right ${
                    a.deviationPercent > 0 ? 'text-green-400' : a.deviationPercent < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {a.deviationPercent > 0 ? '+' : ''}{a.deviationPercent.toFixed(1)}%
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest w-14 text-right ${
                    a.severity === 'critical' ? 'text-red-400' :
                    a.severity === 'high' ? 'text-amber-400' :
                    a.severity === 'medium' ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {a.severity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Arbitrage Opportunities */}
      {topArbitrage.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Arbitrage Opportunities</p>
            <span className="text-xs text-purple-400 font-mono">
              ${summary.totalArbitrageValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
            </span>
          </div>
          <div className="space-y-1.5">
            {topArbitrage.map(arb => (
              <div
                key={arb.id}
                className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl text-xs"
              >
                <ArrowRightLeft size={14} className="text-purple-400 flex-shrink-0" />
                <span className="text-white font-medium truncate flex-1">{arb.player}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-mono text-green-400">${arb.buyPrice.toFixed(2)}</span>
                  <span className="text-slate-600">&rarr;</span>
                  <span className="font-mono text-purple-400">${arb.sellPrice.toFixed(2)}</span>
                </div>
                <span className="font-mono text-brand-lime font-bold w-16 text-right">
                  +${arb.spread.toFixed(2)}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  arb.riskLevel === 'low' ? 'text-green-400 bg-green-500/10' :
                  arb.riskLevel === 'medium' ? 'text-amber-400 bg-amber-500/10' :
                  'text-red-400 bg-red-500/10'
                }`}>
                  {arb.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {topAnomalies.length === 0 && topArbitrage.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <ShieldAlert size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No anomalies detected</p>
          <p className="text-xs text-slate-600 mt-1">Add more cards to your inventory for anomaly detection</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(AnomalyWidget);
