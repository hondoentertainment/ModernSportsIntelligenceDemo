import React, { useMemo } from 'react';
import {
  Trophy,
  ChevronRight,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getMarketIndices, getAthleteCards, getInvestmentSignals } from '../lib/womensSportsIndexService';

interface WomensSportsIndexWidgetProps {
  onOpenModal?: () => void;
}

export const WomensSportsIndexWidget: React.FC<WomensSportsIndexWidgetProps> = ({ onOpenModal }) => {
  const indices = useMemo(() => getMarketIndices(), []);
  const athletes = useMemo(() => getAthleteCards(), []);
  const signals = useMemo(() => getInvestmentSignals(), []);

  const avgGrowth = useMemo(() => {
    if (indices.length === 0) return 0;
    return indices.reduce((sum, idx) => sum + idx.growth, 0) / indices.length;
  }, [indices]);

  const topPerformer = useMemo(() => {
    if (athletes.length === 0) return null;
    return athletes.reduce((best, a) => a.growth > best.growth ? a : best, athletes[0]);
  }, [athletes]);

  const leagueCount = useMemo(() => {
    const leagues = new Set(indices.map(i => i.league));
    return leagues.size;
  }, [indices]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-pink-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <Trophy size={16} className="text-pink-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Women&apos;s Sports Index</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-pink-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Avg Growth</p>
          <p className="text-lg font-bold text-pink-400">{avgGrowth.toFixed(1)}%</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Top Performer</p>
          <p className="text-lg font-bold text-white truncate">{topPerformer?.name || 'N/A'}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Leagues</p>
          <p className="text-lg font-bold text-emerald-400">{leagueCount}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Signals</p>
          <p className="text-lg font-bold text-violet-400">{signals.length}</p>
        </div>
      </div>

      {/* Hottest athlete card highlight */}
      {topPerformer && (
        <div className="flex items-center gap-3 p-3 bg-pink-500/5 border border-pink-500/20 rounded-xl mb-4">
          <TrendingUp size={14} className="text-pink-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Hottest Card</p>
            <p className="text-xs text-white font-medium truncate">{topPerformer.name}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-pink-400">+{topPerformer.growth.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Athletes: <span className="text-white font-bold">{athletes.length}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Active Signals: <span className="text-emerald-400 font-bold">{signals.filter(s => s.active).length}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default WomensSportsIndexWidget;
