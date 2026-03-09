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
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Achievements</h3>
        </div>
        <span className="text-xs text-slate-500">
          {summary.totalUnlocked} / {summary.totalAvailable}
        </span>
      </div>

      {/* Level Badge + XP Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
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
        </div>
      </div>

      {/* Completion Stat */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60 rounded-lg mb-4">
        <span className="text-xs text-slate-400">Completion</span>
        <span className="text-sm font-semibold text-white">{summary.completionPercent}%</span>
      </div>

      {/* Recently Unlocked */}
      {recentThree.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Recently Unlocked
          </p>
          <div className="space-y-1.5">
            {recentThree.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/50"
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
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Up Next
          </p>
          <div className="space-y-2">
            {summary.nextToUnlock.map((a) => (
              <div key={a.id} className="px-2.5 py-2 rounded-lg bg-slate-800/30">
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
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium"
        >
          View All Achievements
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default AchievementWidget;
