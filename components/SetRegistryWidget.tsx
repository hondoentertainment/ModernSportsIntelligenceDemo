import React, { useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Star,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  loadEnrollments,
  getSetProgress,
  SetProgress,
} from '../lib/setRegistryService';

interface SetRegistryWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const SetRegistryWidget: React.FC<SetRegistryWidgetProps> = ({ cards, onClick }) => {
  const enrollments = useMemo(() => loadEnrollments(), [cards]);

  const progressList = useMemo<SetProgress[]>(() => {
    return enrollments.map(e => getSetProgress(e));
  }, [enrollments]);

  // Sort by completion descending, take top 3
  const topSets = useMemo(() => {
    return [...progressList]
      .sort((a, b) => b.completionPercent - a.completionPercent)
      .slice(0, 3);
  }, [progressList]);

  // Nearest to complete
  const nearestComplete = useMemo(() => {
    if (progressList.length === 0) return null;
    return [...progressList]
      .filter(p => p.completionPercent < 100)
      .sort((a, b) => b.completionPercent - a.completionPercent)[0] ?? null;
  }, [progressList]);

  // Recently matched cards count
  const recentMatches = useMemo(() => {
    return progressList.reduce((sum, p) => sum + p.recentMatchCount, 0);
  }, [progressList]);

  const totalEnrolled = enrollments.length;
  const completedSets = progressList.filter(p => p.completionPercent >= 100).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Set <span className="text-blue-400">Registry</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Completion tracking & checklists
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30">
          <BookOpen size={14} />
          {totalEnrolled} Set{totalEnrolled !== 1 ? 's' : ''}
        </div>
        <div className="h-5 w-px bg-slate-700" />
        {completedSets > 0 && (
          <>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
              <CheckCircle2 size={14} />
              {completedSets} Complete
            </div>
            <div className="h-5 w-px bg-slate-700" />
          </>
        )}
        {recentMatches > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Clock size={14} />
            {recentMatches} recent match{recentMatches !== 1 ? 'es' : ''}
          </div>
        )}
        {totalEnrolled === 0 && (
          <span className="text-xs text-slate-500">Browse sets to get started</span>
        )}
      </div>

      {/* Nearest to Complete */}
      {nearestComplete && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
          <Star size={14} className="text-brand-lime flex-shrink-0" />
          <span className="text-xs text-slate-400">Nearest complete:</span>
          <span className="text-xs text-brand-lime font-bold truncate">
            {nearestComplete.setName}
          </span>
          <span className="ml-auto text-xs font-mono text-white">
            {nearestComplete.completionPercent}%
          </span>
        </div>
      )}

      {/* Top 3 Sets Progress */}
      {topSets.length > 0 && (
        <div className="space-y-3">
          {topSets.map(sp => (
            <div key={sp.setId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[60%]">
                  {sp.setName}
                </span>
                <span className="text-slate-500 font-mono">
                  {sp.ownedCount}/{sp.totalCards}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sp.completionPercent >= 100
                      ? 'bg-green-500'
                      : sp.completionPercent >= 75
                        ? 'bg-brand-lime'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, sp.completionPercent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalEnrolled === 0 && (
        <div className="text-center py-2 text-xs text-slate-500">
          Enroll in sets to track your progress toward completion
        </div>
      )}
    </button>
  );
};

export default SetRegistryWidget;
