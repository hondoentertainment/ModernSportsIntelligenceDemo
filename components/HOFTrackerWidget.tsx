import React from 'react';
import { Award, ChevronRight, TrendingUp, Star } from 'lucide-react';
import { getHOFCandidates, getHOFStats } from '../lib/utils/hofTrackerService';

interface HOFTrackerWidgetProps {
  onOpenModal: () => void;
}

const HOFTrackerWidget: React.FC<HOFTrackerWidgetProps> = ({ onOpenModal }) => {
  const stats = getHOFStats();
  const candidates = getHOFCandidates();
  const topCandidate = candidates[0];

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-amber-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Award size={16} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">HOF Tracker</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
      </div>

      <div className="space-y-2">
        {/* Top Candidate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Star size={12} />
            <span>{topCandidate.player}</span>
          </div>
          <span className="text-sm font-bold text-amber-400">{topCandidate.hofProbability}%</span>
        </div>

        {/* Next Ballot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Award size={12} />
            <span>Next Ballot</span>
          </div>
          <span className="text-sm font-medium text-slate-300">{stats.nextBallotDate}</span>
        </div>

        {/* Portfolio Exposure */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={12} />
            <span>HOF Exposure</span>
          </div>
          <span className="text-sm font-medium text-emerald-400">{stats.avgProjectedMultiplier}x avg</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-700/30">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-amber-500/15 text-amber-400 border-amber-500/30">
          <Award size={9} />
          {stats.highProbability} High Probability
        </span>
      </div>
    </div>
  );
};

export default HOFTrackerWidget;
