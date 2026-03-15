import React, { useMemo } from 'react';
import { GraduationCap, ChevronRight, BookOpen, Star } from 'lucide-react';
import {
  getProgressTracker,
  getLearningModules,
  getAchievements,
  getNextAchievement,
  getLevelConfig,
  formatCurrency,
} from '../lib/youthOnboardingService';

interface YouthOnboardingWidgetProps {
  onOpenModal?: () => void;
}

export const YouthOnboardingWidget: React.FC<YouthOnboardingWidgetProps> = ({ onOpenModal }) => {
  const tracker = useMemo(() => getProgressTracker(), []);
  const modules = useMemo(() => getLearningModules(), []);
  const achievements = useMemo(() => getAchievements(), []);
  const nextAchievement = useMemo(() => getNextAchievement(), []);
  const levelConfig = useMemo(() => getLevelConfig(tracker.currentLevel), [tracker]);

  const completedModules = useMemo(() => modules.filter(m => m.completed).length, [modules]);
  const unlockedAchievements = useMemo(() => achievements.filter(a => a.unlocked).length, [achievements]);

  const nextModule = useMemo(() => {
    return modules
      .filter(m => !m.completed)
      .sort((a, b) => a.order - b.order)[0] || null;
  }, [modules]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <GraduationCap size={16} className="text-amber-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Youth Onboarding</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Level</p>
          <p className="text-lg font-bold text-amber-400">{tracker.currentLevel}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">XP</p>
          <p className="text-lg font-bold text-white">{tracker.totalXp.toLocaleString()}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Modules</p>
          <p className="text-lg font-bold text-emerald-400">{completedModules}/{modules.length}</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Achievements</p>
          <p className="text-lg font-bold text-violet-400">{unlockedAchievements}</p>
        </div>
      </div>

      {/* Next recommended learning module */}
      {nextModule && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4">
          <BookOpen size={14} className="text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Next Module</p>
            <p className="text-xs text-white font-medium truncate">{nextModule.title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-amber-400">+{nextModule.xpReward} XP</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Streak: <span className="text-white font-bold">{tracker.streakDays} days</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap size={12} className="text-amber-400" />
          <span className="text-xs text-slate-400">
            Rank: <span className="text-amber-400 font-bold">{levelConfig.label}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default YouthOnboardingWidget;
