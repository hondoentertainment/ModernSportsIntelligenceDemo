// @ts-nocheck
import React, { useMemo } from 'react';
import { GraduationCap, ChevronRight, Flame, Target } from 'lucide-react';
import {
  getUserProgress,
  getTrainingModules,
  getLevelProgress,
} from '../lib/utils/authTrainingService';

interface AuthTrainingWidgetProps {
  onOpenModal?: () => void;
}

const AuthTrainingWidget: React.FC<AuthTrainingWidgetProps> = ({ onOpenModal }) => {
  const progress = useMemo(() => getUserProgress(), []);
  const modules = useMemo(() => getTrainingModules(), []);
  const levelInfo = useMemo(() => getLevelProgress(), []);

  const totalModules = modules.length;
  const earnedBadges = progress.badges.filter(b => b.earnedDate !== null).length;

  const accuracyColor =
    progress.accuracy_score >= 85 ? 'text-emerald-400' :
    progress.accuracy_score >= 70 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Auth Training</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Accuracy</p>
          <p className={`text-lg font-bold ${accuracyColor}`}>{progress.accuracy_score}%</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Level</p>
          <p className="text-lg font-bold text-violet-400">{progress.level}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Streak</p>
          <p className="text-lg font-bold text-orange-400">{progress.streak}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">XP Progress</span>
          <span className="text-xs text-violet-400 font-medium">{progress.xp} / {progress.xp_to_next} XP</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-violet-500 h-1.5 rounded-full transition-all"
            style={{ width: `${levelInfo.pct}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Target className="w-3 h-3" />
          <span>{progress.modules_completed}/{totalModules} modules</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Flame className="w-3 h-3 text-orange-400" />
          <span>{earnedBadges} badges earned</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors bg-violet-500/10 border-violet-500/20 hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-violet-400">Continue Training</p>
              <p className="text-[10px] text-slate-400">{progress.total_challenges} challenges completed</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {progress.correct_answers} correct
          </div>
        </button>
      </div>
    </div>
  );
};

export default AuthTrainingWidget;
