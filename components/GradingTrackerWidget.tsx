import React, { useMemo } from 'react';
import { ClipboardCheck, ChevronRight, Clock, Package, DollarSign } from 'lucide-react';
import {
  getActiveSubmissions,
  getNextExpectedReturn,
  getAverageTurnaround,
  getTotalGradingSpend,
  getStatusLabel,
  getCompanyLabel,
  getStatusProgress,
} from '../lib/gradingTrackerService';

interface GradingTrackerWidgetProps {
  onOpenModal?: () => void;
}

export const GradingTrackerWidget: React.FC<GradingTrackerWidgetProps> = ({ onOpenModal }) => {
  const activeSubmissions = useMemo(() => getActiveSubmissions(), []);
  const nextReturn = useMemo(() => getNextExpectedReturn(), []);
  const avgTurnaround = useMemo(() => getAverageTurnaround(), []);
  const totalSpend = useMemo(() => getTotalGradingSpend(), []);

  const formatCurrency = (val: number): string => {
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  const daysUntilReturn = useMemo(() => {
    if (!nextReturn) return null;
    const now = new Date();
    const returnDate = new Date(nextReturn.estimatedReturnDate);
    return Math.max(0, Math.ceil((returnDate.getTime() - now.getTime()) / 86400000));
  }, [nextReturn]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <ClipboardCheck size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Grading Tracker</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Active Submissions Count */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Submissions</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{activeSubmissions.length}</span>
          <span className="text-sm text-slate-400">cards in pipeline</span>
        </div>
      </div>

      {/* Next Expected Return */}
      {nextReturn && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1.5">
            <Package size={12} className="text-lime-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Next Return</span>
          </div>
          <div className="text-xs font-medium text-white truncate mb-1">
            {nextReturn.cardName}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              {getCompanyLabel(nextReturn.company)} — {getStatusLabel(nextReturn.status)}
            </span>
            <span className="text-xs font-bold text-lime-400">
              {daysUntilReturn !== null ? `${daysUntilReturn}d` : '—'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-500 rounded-full transition-all"
              style={{ width: `${getStatusProgress(nextReturn.status)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-cyan-400" />
          <span className="text-[10px] text-slate-400">Avg</span>
          <span className="text-xs font-bold text-cyan-400">{avgTurnaround}d</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-amber-400" />
          <span className="text-[10px] text-slate-400">Spent</span>
          <span className="text-xs font-bold text-amber-400">{formatCurrency(totalSpend)}</span>
        </div>
      </div>
    </button>
  );
};

export default GradingTrackerWidget;
