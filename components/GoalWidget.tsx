import React, { useMemo } from 'react';
import {
  Target,
  ChevronRight,
  TrendingUp,
  Clock,
  Flag,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getGoalSummary,
  formatGoalValue,
  getTrackingColor,
  getTrackingLabel,
  GoalSummary,
} from '../lib/utils/goalPlannerService';

interface GoalWidgetProps {
  inventory: CardInventory[];
  onClick?: () => void;
}

function daysRemainingLabel(targetDate: string): string {
  const diff = Math.round(
    (new Date(targetDate).getTime() - Date.now()) / 86400000
  );
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Due today';
  if (diff === 1) return '1 day left';
  if (diff < 30) return `${diff} days left`;
  const months = Math.round(diff / 30);
  return months === 1 ? '1 month left' : `${months} months left`;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({ inventory, onClick }) => {
  const summary: GoalSummary = useMemo(
    () => getGoalSummary(inventory),
    [inventory]
  );

  const primary = summary.primaryGoal;
  const trackingColors = primary ? getTrackingColor(primary.trackingStatus) : null;
  const trackingLabel = primary ? getTrackingLabel(primary.trackingStatus) : '';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Target size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Collection <span className="text-emerald-400">Goals</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Goal planner & progress
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Primary Goal Progress */}
      {primary ? (
        <>
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {primary.title}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${trackingColors?.text} ${trackingColors?.bg} ${trackingColors?.border}`}
              >
                {trackingLabel}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400">
                  {formatGoalValue(primary.type, primary.currentValue)}
                </span>
                <span className="text-xs font-mono text-white">
                  {formatGoalValue(primary.type, primary.targetValue)}
                </span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${primary.progress}%`,
                    background:
                      primary.trackingStatus === 'ahead'
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : primary.trackingStatus === 'on_track'
                        ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] font-bold text-slate-500">
                  {primary.progress}% complete
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock size={10} />
                  {daysRemainingLabel(primary.targetDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl">
              <span className="text-lg font-bold text-white">{summary.activeGoals}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Active</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl">
              <span className="text-lg font-bold text-emerald-400">{summary.aheadCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Ahead</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-800/50 rounded-2xl">
              <span className="text-lg font-bold text-red-400">{summary.behindCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Behind</span>
            </div>
          </div>

          {/* Next milestone */}
          {summary.nextMilestone && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
              <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">Next:</span>
              <span className="text-xs text-emerald-400 font-bold truncate">
                {summary.nextMilestone.label}
              </span>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">
                {summary.nextMilestone.targetDate}
              </span>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-center space-y-2">
          <Target size={32} className="mx-auto text-slate-600" />
          <p className="text-sm text-slate-400">No goals set yet</p>
          <p className="text-xs text-slate-500">
            Tap to create your first collection goal
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">
        {primary ? 'View all goals & gap analysis' : 'Set your first goal'}
        <ChevronRight size={14} />
      </div>
    </button>
  );
};

export default GoalWidget;
