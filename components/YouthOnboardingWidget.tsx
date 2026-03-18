import React, { useMemo } from 'react';
import { GraduationCap, ChevronRight, BookOpen, Star } from 'lucide-react';
import {
  getProgressTracker,
  getLearningModules,
  getAchievements,
} from '../lib/utils/youthOnboardingService';

interface YouthOnboardingWidgetProps {
  onOpenModal?: () => void;
}

const YouthOnboardingWidget: React.FC<YouthOnboardingWidgetProps> = ({ onOpenModal }) => {
  const progress = useMemo(() => getProgressTracker(), []);
  const modules = useMemo(() => getLearningModules(), []);
  const achievements = useMemo(() => getAchievements(), []);

  const nextModule = useMemo(() => {
    const incomplete = modules.filter(m => !m.completed).sort((a, b) => a.order - b.order);
    return incomplete[0] ?? null;
  }, [modules]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Collector Onboarding</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4-Stat Grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Level</p>
          <p className="text-lg font-bold text-emerald-400">{progress.level}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">XP Earned</p>
          <p className="text-lg font-bold text-amber-400">{progress.totalXp}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Modules</p>
          <p className="text-lg font-bold text-blue-400">{progress.modulesCompleted}/{progress.totalModules}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Achievements</p>
          <p className="text-lg font-bold text-purple-400">{unlockedCount}</p>
        </div>
      </div>

      {/* Highlight: Next Module */}
      {nextModule && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Next Module
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">+{nextModule.xpReward} XP</span>
          </div>
          <p className="text-xs font-medium text-white truncate">{nextModule.title}</p>
          <p className="text-[10px] text-slate-500">{nextModule.estimatedMinutes} min | {nextModule.level}</p>
        </div>
      )}

      {/* Bottom: Level Progress */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenModal}
          className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors bg-emerald-500/10 border-emerald-500/20 hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-400">
                {progress.levelName}
              </p>
              <p className="text-[10px] text-slate-400">
                {progress.xpToNextLevel} XP to next level | {progress.streak}d streak
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default YouthOnboardingWidget;
