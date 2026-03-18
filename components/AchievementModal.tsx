import React, { useMemo, useState, useCallback } from 'react';
import { X, Trophy, Star, ArrowUpDown } from 'lucide-react';
import { CardInventory } from '../types';
import {
  Achievement,
  AchievementCategoryType,
  AchievementTier,
  evaluateAchievements,
  getAchievementSummary,
  getAchievementCategories,
  getRecentlyUnlocked,
  markAsSeen,
  TIER_COLORS,
} from '../lib/utils/achievementService';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

type SortMode = 'progress' | 'category';
type FilterCategory = 'all' | AchievementCategoryType;

const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

const CATEGORY_TABS: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'collection', label: 'Collection' },
  { id: 'trading', label: 'Trading' },
  { id: 'grading', label: 'Grading' },
  { id: 'diversification', label: 'Diversification' },
  { id: 'value', label: 'Value' },
];

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose, inventory }) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [sortMode, setSortMode] = useState<SortMode>('progress');

  const achievements = useMemo(() => evaluateAchievements(inventory), [inventory]);
  const summary = useMemo(() => getAchievementSummary(inventory), [inventory]);
  const categories = useMemo(() => getAchievementCategories(achievements), [achievements]);
  const recentlyUnlocked = useMemo(() => getRecentlyUnlocked(inventory), [inventory]);

  // Mark recently unlocked as seen when modal opens
  useMemo(() => {
    if (isOpen) {
      recentlyUnlocked.forEach((a) => markAsSeen(a.id));
    }
  }, [isOpen, recentlyUnlocked]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'all' ? achievements : achievements.filter((a) => a.category === activeCategory);

    if (sortMode === 'progress') {
      list = [...list].sort((a, b) => {
        // Unlocked last, closest-to-unlock first
        if (a.isUnlocked && !b.isUnlocked) return 1;
        if (!a.isUnlocked && b.isUnlocked) return -1;
        if (a.isUnlocked && b.isUnlocked) return 0;
        return b.progress - a.progress;
      });
    } else {
      list = [...list].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return b.progress - a.progress;
      });
    }

    return list;
  }, [achievements, activeCategory, sortMode]);

  const toggleSort = useCallback(() => {
    setSortMode((prev) => (prev === 'progress' ? 'category' : 'progress'));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Achievements</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Level Bar */}
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${tierColorForLevel(summary.level)}, ${tierColorForLevel(summary.level)}88)`,
                color: summary.level >= 20 ? '#000' : '#fff',
              }}
            >
              {summary.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-300">
                  Level {summary.level}
                </span>
                <span className="text-xs text-slate-500">
                  {summary.pointsEarned} XP
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.levelProgress}%`,
                    background: `linear-gradient(90deg, ${tierColorForLevel(summary.level)}, ${tierColorForLevel(summary.level)}cc)`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">
                  {summary.totalUnlocked} / {summary.totalAvailable} Achievements ({summary.completionPercent}%)
                </span>
                <span className="text-xs text-slate-500">
                  {summary.levelProgress}% to next level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Unlocked */}
        {recentlyUnlocked.length > 0 && (
          <div className="px-6 py-3 bg-yellow-500/5 border-b border-yellow-500/20">
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">
              Recently Unlocked
            </p>
            <div className="flex gap-2 flex-wrap">
              {recentlyUnlocked.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                >
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-sm font-medium text-yellow-300">{a.name}</span>
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: TIER_COLORS[a.tier] + '22',
                      color: TIER_COLORS[a.tier],
                    }}
                  >
                    {TIER_LABELS[a.tier]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs + Sort */}
        <div className="px-6 py-3 border-b border-slate-700 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const cat = tab.id !== 'all' ? categories.find((c) => c.id === tab.id) : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                  {cat && (
                    <span className="ml-1 opacity-70">
                      {cat.unlockedCount}/{cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={toggleSort}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowUpDown size={12} />
            {sortMode === 'progress' ? 'By Progress' : 'By Category'}
          </button>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No achievements in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Achievement Card ----

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const { icon, name, description, tier, progress, isUnlocked, currentCount, requirement } = achievement;
  const color = TIER_COLORS[tier];

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isUnlocked
          ? 'bg-slate-800/80 border-slate-600'
          : 'bg-slate-800/30 border-slate-700/50 opacity-60'
      }`}
      style={
        isUnlocked
          ? { boxShadow: `0 0 20px ${color}22, 0 0 4px ${color}44` }
          : undefined
      }
    >
      {/* Tier badge */}
      <span
        className="absolute top-2 right-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: color + '22',
          color,
        }}
      >
        {TIER_LABELS[tier]}
      </span>

      {/* Icon + Name */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">
            {currentCount} / {requirement}
          </span>
          {isUnlocked && (
            <span className="text-[10px] font-medium text-green-400 flex items-center gap-0.5">
              <Star size={10} /> Unlocked
            </span>
          )}
          {!isUnlocked && (
            <span className="text-[10px] text-slate-500">{progress}%</span>
          )}
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: isUnlocked ? '#22c55e' : color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ---- Helpers ----

function tierColorForLevel(level: number): string {
  if (level >= 40) return TIER_COLORS.diamond;
  if (level >= 30) return TIER_COLORS.platinum;
  if (level >= 20) return TIER_COLORS.gold;
  if (level >= 10) return TIER_COLORS.silver;
  return TIER_COLORS.bronze;
}

export default AchievementModal;
