import React, { useMemo } from 'react';
import {
  Wrench, TrendingUp, ChevronRight, Zap, Target,
} from 'lucide-react';
import {
  getPressingStats,
  type PressingStats,
} from '../lib/pressingRoiService';

interface PressingRoiWidgetProps {
  onClick?: () => void;
}

const PressingRoiWidget: React.FC<PressingRoiWidgetProps> = ({ onClick }) => {
  const stats = useMemo<PressingStats>(() => getPressingStats(), []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-700/50 rounded-[2.5rem] p-6 hover:border-orange-500/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Wrench size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="font-bebas text-lg text-white tracking-wide">Pressing ROI Simulator</h3>
            <p className="text-[10px] text-slate-500 uppercase">Grade Improvement Engine</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
      </div>

      {/* Success rate indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
            style={{ width: `${(stats.avgSuccessRate * 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-emerald-400">
          {(stats.avgSuccessRate * 100).toFixed(0)}% avg success
        </span>
      </div>

      {/* Best candidate highlight */}
      {stats.bestCandidate && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-orange-400" />
            <span className="text-[10px] font-bold text-orange-400 uppercase">Best Pressing Candidate</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{stats.bestCandidate.player}</p>
              <p className="text-[10px] text-slate-400">
                {stats.bestCandidate.currentGrade} &middot; {stats.bestCandidate.cardDescription}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-400">{stats.bestCandidate.candidateScore}/100</p>
              <p className="text-[10px] text-slate-500">candidate score</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Eligible</p>
          <p className="text-sm font-bold text-orange-400">{stats.eligibleForPressing}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Pot. Gain</p>
          <p className="text-sm font-bold text-emerald-400">
            ${Math.round(stats.totalPotentialGain).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Avg ROI</p>
          <p className="text-sm font-bold text-slate-200">{stats.avgROI.toFixed(0)}%</p>
        </div>
      </div>
    </button>
  );
};

export default PressingRoiWidget;
