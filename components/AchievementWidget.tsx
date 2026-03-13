import React, { useMemo } from 'react';
import { Trophy, ChevronRight, Star, Lock } from 'lucide-react';
import { CardInventory } from '../types';
import {
  getAchievementSummary,
  TIER_COLORS,
  AchievementTier,
} from '../lib/achievementService';

interface AchievementWidgetProps {
  inventory: CardInventory[];
  onViewAll?: () => void;
}

const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

function tierColorForLevel(level: number): string {
  if (level >= 40) return TIER_COLORS.diamond;
  if (level >= 30) return TIER_COLORS.platinum;
  if (level >= 20) return TIER_COLORS.gold;
  if (level >= 10) return TIER_COLORS.silver;
  return TIER_COLORS.bronze;
}

const AchievementWidget: React.FC<AchievementWidgetProps> = ({ inventory, onViewAll }) => {
  const summary = useMemo(() => getAchievementSummary(inventory), [inventory]);
  const levelColor = tierColorForLevel(summary.level);
  const recentThree = summary.recentUnlocks.slice(0, 3);

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400">
            <Trophy size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Player <span className="text-yellow-400">Achievements</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              {summary.totalUnlocked} / {summary.totalAvailable} unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Level Badge + XP Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            background: `linear-gradient(135deg, ${levelColor}, ${levelColor}88)`,
            color: summary.level >= 20 ? '#000' : '#fff',
          }}
        >
          {summary.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-300">Level {summary.level}</span>
            <span className="text-[10px] text-slate-500">{summary.pointsEarned} XP</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${summary.levelProgress}%`,
                background: `linear-gradient(90deg, ${levelColor}, ${levelColor}cc)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-500">Completion</span>
            <span className="text-[10px] font-bold text-white">{summary.completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Recently Unlocked */}
      {recentThree.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Recently Unlocked
          </p>
          <div className="space-y-1.5">
            {recentThree.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
              >
                <span className="text-base">{a.icon}</span>
                <span className="text-xs font-medium text-white flex-1 truncate">{a.name}</span>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: TIER_COLORS[a.tier] + '22',
                    color: TIER_COLORS[a.tier],
                  }}
                >
                  {TIER_LABELS[a.tier]}
                </span>
                <Star size={10} className="text-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next to Unlock */}
      {summary.nextToUnlock.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Up Next
          </p>
          <div className="space-y-2">
            {summary.nextToUnlock.map((a) => (
              <div key={a.id} className="px-3 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base opacity-50">{a.icon}</span>
                  <span className="text-xs font-medium text-slate-300 flex-1 truncate">
                    {a.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {a.currentCount}/{a.requirement}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${a.progress}%`,
                      backgroundColor: TIER_COLORS[a.tier],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View All Button */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full text-center text-xs text-brand-lime/70 hover:text-brand-lime font-bold uppercase tracking-widest py-2 transition-colors"
        >
          View All Achievements
        </button>
      )}
    </div>
  );
};

export default AchievementWidget;
