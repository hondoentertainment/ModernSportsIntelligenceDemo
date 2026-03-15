import React, { useMemo } from 'react';
import {
  CalendarDays,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Bell,
  Clock,
  Leaf,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  SeasonPhase,
  getSeasonalSummary,
  getAllSportProfiles,
  getSeasonalWindows,
  getSeasonalAlerts,
} from '../lib/seasonalStrategyService';

interface SeasonalWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const phaseConfig: Record<SeasonPhase, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  peak: { label: 'Peak', color: 'text-green-400', bg: 'bg-green-500/10', icon: <TrendingUp size={12} /> },
  rising: { label: 'Rising', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <TrendingUp size={12} /> },
  falling: { label: 'Falling', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <TrendingDown size={12} /> },
  trough: { label: 'Trough', color: 'text-red-400', bg: 'bg-red-500/10', icon: <TrendingDown size={12} /> },
};

const sportEmoji: Record<string, string> = {
  Baseball: '\u26be',
  Basketball: '\ud83c\udfc0',
  Football: '\ud83c\udfc8',
  Hockey: '\ud83c\udfd2',
  Soccer: '\u26bd',
};

export const SeasonalWidget: React.FC<SeasonalWidgetProps> = ({ cards, onClick }) => {
  const summary = useMemo(() => getSeasonalSummary(cards), [cards]);
  const profiles = useMemo(() => getAllSportProfiles(), []);
  const windows = useMemo(() => getSeasonalWindows().filter(w => w.isActive), []);
  const alerts = useMemo(() => getSeasonalAlerts(cards).filter(a => !a.isRead), [cards]);

  const topWindows = useMemo(() => {
    return [...windows]
      .sort((a, b) => b.historicalAvgReturn - a.historicalAvgReturn)
      .slice(0, 3);
  }, [windows]);

  const nextEvent = useMemo(() => {
    const events = profiles.map(p => p.nextEvent).filter(Boolean);
    return events.sort((a, b) => a.daysUntil - b.daysUntil)[0] || null;
  }, [profiles]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
            <CalendarDays size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Seasonal <span className="text-teal-400">Strategy</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Buy & sell window engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
              <Bell size={12} />
              {alerts.length}
            </span>
          )}
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <ShoppingCart size={13} className="text-green-400" />
          <span className="text-slate-400 font-medium">Buy:</span>
          <span className="font-bebas text-lg text-green-400 tracking-wider">{summary.activeBuyWindows}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <DollarSign size={13} className="text-amber-400" />
          <span className="text-slate-400 font-medium">Sell:</span>
          <span className="font-bebas text-lg text-amber-400 tracking-wider">{summary.activeSellWindows}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs ml-auto">
          <span className="text-slate-400 font-medium">Alignment:</span>
          <span className={`font-mono font-bold ${
            summary.portfolioAlignmentScore >= 70 ? 'text-green-400' :
            summary.portfolioAlignmentScore >= 40 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {summary.portfolioAlignmentScore}%
          </span>
        </div>
      </div>

      {/* Current Phase per Sport */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Season Phase</p>
        <div className="grid grid-cols-5 gap-1.5">
          {profiles.map(p => {
            const pc = phaseConfig[p.currentPhase];
            return (
              <div
                key={p.sport}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl ${pc.bg} border border-slate-700/50`}
              >
                <span className="text-base">{sportEmoji[p.sport]}</span>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${pc.color}`}>
                  {pc.icon}
                  {pc.label}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{p.currentIndex}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Windows */}
      {topWindows.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Windows</p>
          <div className="space-y-1.5">
            {topWindows.map(w => (
              <div
                key={w.id}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                  w.type === 'buy'
                    ? 'bg-green-500/5 border-green-500/15'
                    : 'bg-amber-500/5 border-amber-500/15'
                }`}
              >
                {w.type === 'buy' ? (
                  <ShoppingCart size={14} className="text-green-400 flex-shrink-0" />
                ) : (
                  <DollarSign size={14} className="text-amber-400 flex-shrink-0" />
                )}
                <span className="text-white font-medium truncate flex-1">{w.sport}: {w.label}</span>
                <span className={`font-mono font-bold ${w.type === 'buy' ? 'text-green-400' : 'text-amber-400'}`}>
                  +{w.historicalAvgReturn}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Event */}
      {nextEvent && (
        <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
          <Clock size={14} className="text-teal-400 flex-shrink-0" />
          <span className="text-slate-400">Next:</span>
          <span className="text-white font-medium truncate flex-1">{nextEvent.label}</span>
          <span className="text-teal-400 font-mono">{nextEvent.daysUntil}d</span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500 group-hover:text-teal-400 transition-colors">
        <Leaf size={13} />
        <span className="font-medium">View full seasonal calendar & analysis</span>
        <ChevronRight size={13} />
      </div>
    </button>
  );
};

export default SeasonalWidget;
