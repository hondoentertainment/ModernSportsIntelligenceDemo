// @ts-nocheck
import React, { useMemo } from 'react';
import { Skull, ChevronRight, DollarSign, ArrowRightLeft } from 'lucide-react';
import {
  getHealthScore,
  getCapitalEfficiency,
  getOpportunityCost,
  getSwapRecommendations,
  scanPortfolio,
  formatCurrency,
} from '../lib/analytics/deadMoneyDetectorService';

interface DeadMoneyDetectorWidgetProps {
  onOpenModal?: () => void;
}

export const DeadMoneyDetectorWidget: React.FC<DeadMoneyDetectorWidgetProps> = ({ onOpenModal }) => {
  const health = useMemo(() => getHealthScore(), []);
  const efficiency = useMemo(() => getCapitalEfficiency(), []);
  const oppCost = useMemo(() => getOpportunityCost(365), []);
  const swaps = useMemo(() => getSwapRecommendations(), []);
  const assets = useMemo(() => scanPortfolio(), []);

  const deadCount = useMemo(() => assets.filter(a => a.deadMoneyScore >= 60).length, [assets]);
  const topSwap = useMemo(() => swaps[0] ?? null, [swaps]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900 rounded-2xl overflow-hidden p-8 hover:border-red-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Skull size={16} className="text-red-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Dead Money Detector</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Dead Cards</p>
          <p className="text-lg font-bold text-red-400">{deadCount}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Dead Money %</p>
          <p className="text-lg font-bold text-amber-400">{health.deadMoneyPercentage}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Opp Cost</p>
          <p className="text-lg font-bold text-amber-400">{formatCurrency(oppCost.totalCost)}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Health</p>
          <p className="text-lg font-bold text-white">{health.score}<span className="text-xs text-slate-500">/100</span></p>
        </div>
      </div>

      {/* Top swap highlight */}
      {topSwap && (
        <div className="flex items-center gap-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl mb-4">
          <ArrowRightLeft size={14} className="text-violet-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Top Swap</p>
            <p className="text-xs text-white font-medium truncate">{topSwap.fromAsset.player} → {topSwap.toAsset.player}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500">Expected</p>
            <p className="text-sm font-bold text-emerald-400">+{formatCurrency(topSwap.expectedGain)}</p>
          </div>
        </div>
      )}

      {/* Bottom: dead capital + efficiency */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-red-400" />
          <span className="text-xs text-slate-400">Dead Capital: <span className="text-red-400 font-bold">{formatCurrency(efficiency.deadCapital)}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">
            Efficiency: <span className="text-emerald-400 font-bold">{efficiency.efficiencyRatio}%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default DeadMoneyDetectorWidget;
