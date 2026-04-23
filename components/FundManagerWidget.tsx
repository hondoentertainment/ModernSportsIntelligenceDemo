// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Landmark,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  getTotalAUM,
  getTopFundIRR,
  getActiveSyndicatesCount,
} from '../lib/utils/fundManagerService';

interface FundManagerWidgetProps {
  onClick?: () => void;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export const FundManagerWidget: React.FC<FundManagerWidgetProps> = ({ onClick }) => {
  const totalAUM = useMemo(() => getTotalAUM(), []);
  const topIRR = useMemo(() => getTopFundIRR(), []);
  const activeSyndicates = useMemo(() => getActiveSyndicatesCount(), []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-400">
            <Landmark size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Fund & Syndicate <span className="text-lime-400">Manager</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              LP/GP structures & waterfall distributions
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-lime-400 transition-colors"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Total AUM
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {formatCurrency(totalAUM)}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Top Fund IRR
          </p>
          <p className="text-2xl font-bebas tracking-wider text-lime-400">
            {topIRR.irr.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Active Syndicates
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {activeSyndicates}
          </p>
        </div>
      </div>

      {/* Top Fund Teaser */}
      <div className="flex items-center gap-2 px-4 py-3 bg-lime-500/5 border border-lime-500/20 rounded-2xl">
        <TrendingUp size={16} className="text-lime-400 shrink-0" />
        <p className="text-xs text-slate-300 truncate">
          <span className="text-lime-400 font-semibold">Top performer:</span>{' '}
          {topIRR.fundName} at {topIRR.irr.toFixed(1)}% IRR
        </p>
      </div>

      {/* Syndicate badge */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/40 border border-slate-700 rounded-2xl">
        <Users size={16} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-400">
          {activeSyndicates} syndicates actively raising or deploying capital
        </p>
      </div>
    </button>
  );
};

export default FundManagerWidget;
