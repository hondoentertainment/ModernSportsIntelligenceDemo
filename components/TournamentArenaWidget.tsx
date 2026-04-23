// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Trophy,
  ChevronRight,
  Users,
  Clock,
  Award,
} from 'lucide-react';
import {
  getActiveTournaments,
  getMyEntries,
  getTournamentHistory,
  getUpcomingTournaments,
} from '../lib/utils/tournamentArenaService';

interface TournamentArenaWidgetProps {
  onOpenModal?: () => void;
}

const TournamentArenaWidget: React.FC<TournamentArenaWidgetProps> = ({ onOpenModal }) => {
  const activeTournaments = useMemo(() => getActiveTournaments(), []);
  const myEntries = useMemo(() => getMyEntries(), []);
  const history = useMemo(() => getTournamentHistory(), []);
  const upcoming = useMemo(() => getUpcomingTournaments(), []);

  const bestRank = myEntries.length > 0 ? Math.min(...myEntries.map(e => e.rank)) : null;
  const nextTournament = upcoming[0];

  // Countdown helper
  const getCountdown = (dateStr: string): string => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    if (diff <= 0) return 'Starting soon';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div
      onClick={onOpenModal}
      className="bg-brand-slate rounded-[2.5rem] p-8 hover:border-brand-lime/30 border border-slate-700/50 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-lime/10">
            <Trophy size={18} className="text-brand-lime" />
          </div>
          <h3 className="font-bebas text-lg tracking-wider text-slate-100 uppercase">
            Tournament Arena
          </h3>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Active Tournaments */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={10} className="text-brand-lime" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Active Tournaments
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {activeTournaments.length} live tournaments with {myEntries.length} active entries.
          {bestRank && ` Best current rank: #${bestRank}.`}
        </p>
      </div>

      {/* Next Tournament */}
      {nextTournament && (
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 mb-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={10} className="text-sky-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Next Tournament
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 mb-0.5">{nextTournament.name}</p>
          <p className="text-[10px] text-slate-500 truncate">
            Starts in {getCountdown(nextTournament.start_date)} &middot;{' '}
            {nextTournament.entry_fee === 0 ? 'Free Entry' : `$${nextTournament.entry_fee} entry`}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Award size={10} className="text-amber-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Winnings
            </span>
          </div>
          <span className="text-lg font-black text-brand-lime">
            ${history.total_winnings.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy size={10} className="text-purple-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Best Finish
            </span>
          </div>
          <span className="text-lg font-black text-amber-400">
            #{history.best_finish}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TournamentArenaWidget;
