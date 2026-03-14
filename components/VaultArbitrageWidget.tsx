import React, { useMemo } from 'react';
import {
  ArrowRightLeft, TrendingUp, ChevronRight, Zap, DollarSign,
} from 'lucide-react';
import {
  getVaultSummary,
  getArbitrageOpportunities,
  getPlatformLabel,
  type VaultSummary,
  type ArbitrageOpportunity,
} from '../lib/vaultArbitrageService';

interface VaultArbitrageWidgetProps {
  onClick?: () => void;
}

const VaultArbitrageWidget: React.FC<VaultArbitrageWidgetProps> = ({ onClick }) => {
  const summary = useMemo<VaultSummary>(() => getVaultSummary(), []);
  const opportunities = useMemo<ArbitrageOpportunity[]>(() => getArbitrageOpportunities(), []);

  const topOpp = summary.topOpportunity;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-700/50 rounded-[2.5rem] p-6 hover:border-cyan-500/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <ArrowRightLeft size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bebas text-lg text-white tracking-wide">Vault Arbitrage</h3>
            <p className="text-[10px] text-slate-500 uppercase">Cross-Platform Migration</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
      </div>

      {/* Platform breakdown mini row */}
      <div className="flex items-center gap-2 mb-4">
        {summary.platformBreakdown.slice(0, 4).map(pb => (
          <div
            key={pb.platform}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800/70 rounded-lg border border-slate-700/40"
          >
            <span className="text-[10px] font-semibold text-slate-300">{pb.label}</span>
            <span className="text-[10px] text-slate-500">{pb.count}</span>
          </div>
        ))}
        {summary.platformBreakdown.length > 4 && (
          <span className="text-[10px] text-slate-500">+{summary.platformBreakdown.length - 4}</span>
        )}
      </div>

      {/* Top opportunity highlight */}
      {topOpp && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Top Arbitrage Opportunity</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{topOpp.card.player}</p>
              <p className="text-[10px] text-slate-400">
                {getPlatformLabel(topOpp.currentPlatform)} &rarr; {getPlatformLabel(topOpp.recommendedPlatform)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cyan-400">+${topOpp.netGainAfterTransfer.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-400">+{topOpp.gainPercent}% gain</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Vaulted</p>
          <p className="text-sm font-bold text-slate-200">{summary.totalCards}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Opportunities</p>
          <p className="text-sm font-bold text-cyan-400">{opportunities.length}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Total Gain</p>
          <p className="text-sm font-bold text-emerald-400">
            ${Math.round(summary.totalArbitrageOpportunity).toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
};

export default VaultArbitrageWidget;
