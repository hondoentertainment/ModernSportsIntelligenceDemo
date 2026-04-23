// @ts-nocheck
// Achievement & Badges System Service
// Manages collector achievements, XP levels, seasonal challenges, and leaderboards

import { store } from '../dal/syncStore';

export type AchievementCategory = 'collection' | 'trading' | 'grading' | 'social' | 'financial' | 'milestone';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  target: number;
  progressPercent: number;
}

export interface CollectorLevel {
  level: number;
  title: string;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  progressPercent: number;
  perks: string[];
}

export interface SeasonalChallenge {
  id: string;
  name: string;
  description: string;
  season: string;
  startDate: string;
  endDate: string;
  tasks: { name: string; completed: boolean; xpReward: number }[];
  completionPercent: number;
  reward: string;
  active: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalXP: number;
  achievementCount: number;
  rank: number;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  rarest: { name: string; percentUnlocked: number };
}

const STORAGE_PREFIX = 'msi_achievements';

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-card', name: 'First Pull', description: 'Add your first card to the collection', category: 'collection', tier: 'bronze', xpReward: 50, icon: '🃏', unlocked: true, unlockedDate: '2025-12-01', progress: 1, target: 1, progressPercent: 100 },
  { id: 'ten-cards', name: 'Starter Set', description: 'Collect 10 cards', category: 'collection', tier: 'bronze', xpReward: 100, icon: '📦', unlocked: true, unlockedDate: '2025-12-05', progress: 10, target: 10, progressPercent: 100 },
  { id: 'fifty-cards', name: 'Serious Collector', description: 'Collect 50 cards', category: 'collection', tier: 'silver', xpReward: 250, icon: '🗃️', unlocked: true, unlockedDate: '2026-01-10', progress: 50, target: 50, progressPercent: 100 },
  { id: 'hundred-cards', name: 'Centurion', description: 'Collect 100 cards', category: 'collection', tier: 'gold', xpReward: 500, icon: '🏛️', unlocked: false, progress: 72, target: 100, progressPercent: 72 },
  { id: 'five-hundred-cards', name: 'Vault Keeper', description: 'Collect 500 cards', category: 'collection', tier: 'platinum', xpReward: 1500, icon: '🏦', unlocked: false, progress: 72, target: 500, progressPercent: 14.4 },
  { id: 'first-trade', name: 'Deal Maker', description: 'Complete your first trade', category: 'trading', tier: 'bronze', xpReward: 75, icon: '🤝', unlocked: true, unlockedDate: '2025-12-10', progress: 1, target: 1, progressPercent: 100 },
  { id: 'ten-trades', name: 'Trader', description: 'Complete 10 trades', category: 'trading', tier: 'silver', xpReward: 200, icon: '📊', unlocked: true, unlockedDate: '2026-01-15', progress: 10, target: 10, progressPercent: 100 },
  { id: 'fifty-trades', name: 'Market Mover', description: 'Complete 50 trades', category: 'trading', tier: 'gold', xpReward: 500, icon: '📈', unlocked: false, progress: 23, target: 50, progressPercent: 46 },
  { id: 'profit-100', name: 'In The Green', description: 'Earn $100 in profit', category: 'financial', tier: 'bronze', xpReward: 100, icon: '💵', unlocked: true, unlockedDate: '2026-01-20', progress: 100, target: 100, progressPercent: 100 },
  { id: 'profit-1000', name: 'Big Earner', description: 'Earn $1,000 in profit', category: 'financial', tier: 'silver', xpReward: 300, icon: '💰', unlocked: false, progress: 480, target: 1000, progressPercent: 48 },
  { id: 'profit-10000', name: 'Mogul', description: 'Earn $10,000 in profit', category: 'financial', tier: 'gold', xpReward: 750, icon: '🤑', unlocked: false, progress: 480, target: 10000, progressPercent: 4.8 },
  { id: 'profit-100000', name: 'Tycoon', description: 'Earn $100,000 in profit', category: 'financial', tier: 'diamond', xpReward: 5000, icon: '💎', unlocked: false, progress: 480, target: 100000, progressPercent: 0.48 },
  { id: 'first-grade', name: 'First Slab', description: 'Grade your first card', category: 'grading', tier: 'bronze', xpReward: 75, icon: '🔍', unlocked: true, unlockedDate: '2026-01-05', progress: 1, target: 1, progressPercent: 100 },
  { id: 'psa-10', name: 'Gem Mint', description: 'Receive a PSA 10 grade', category: 'grading', tier: 'gold', xpReward: 500, icon: '💯', unlocked: true, unlockedDate: '2026-02-01', progress: 1, target: 1, progressPercent: 100 },
  { id: 'ten-graded', name: 'Grade Guru', description: 'Grade 10 cards', category: 'grading', tier: 'silver', xpReward: 250, icon: '📋', unlocked: false, progress: 5, target: 10, progressPercent: 50 },
  { id: 'first-friend', name: 'Social Butterfly', description: 'Add your first friend', category: 'social', tier: 'bronze', xpReward: 50, icon: '🦋', unlocked: true, unlockedDate: '2025-12-15', progress: 1, target: 1, progressPercent: 100 },
  { id: 'ten-friends', name: 'Networker', description: 'Add 10 friends', category: 'social', tier: 'silver', xpReward: 200, icon: '🌐', unlocked: false, progress: 4, target: 10, progressPercent: 40 },
  { id: 'share-collection', name: 'Show Off', description: 'Share your collection publicly', category: 'social', tier: 'bronze', xpReward: 75, icon: '📢', unlocked: false, progress: 0, target: 1, progressPercent: 0 },
  { id: 'seven-day-streak', name: 'Weekly Warrior', description: 'Log in 7 days in a row', category: 'milestone', tier: 'bronze', xpReward: 100, icon: '🔥', unlocked: true, unlockedDate: '2026-01-07', progress: 7, target: 7, progressPercent: 100 },
  { id: 'thirty-day-streak', name: 'Monthly Master', description: 'Log in 30 days in a row', category: 'milestone', tier: 'silver', xpReward: 300, icon: '📅', unlocked: false, progress: 18, target: 30, progressPercent: 60 },
  { id: 'all-sports', name: 'Renaissance Collector', description: 'Collect cards from 5 different sports', category: 'milestone', tier: 'gold', xpReward: 400, icon: '🏆', unlocked: false, progress: 3, target: 5, progressPercent: 60 },
  { id: 'diamond-hands', name: 'Diamond Hands', description: 'Hold a card for over 1 year', category: 'milestone', tier: 'platinum', xpReward: 1000, icon: '✊', unlocked: false, progress: 280, target: 365, progressPercent: 76.71 },
  { id: 'early-adopter', name: 'Early Adopter', description: 'Join during the beta period', category: 'milestone', tier: 'diamond', xpReward: 2000, icon: '⭐', unlocked: true, unlockedDate: '2025-11-15', progress: 1, target: 1, progressPercent: 100 },
];

const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie',
  2: 'Novice',
  3: 'Hobbyist',
  4: 'Enthusiast',
  5: 'Collector',
  6: 'Expert',
  7: 'Veteran',
  8: 'Master',
  9: 'Elite',
  10: 'Legend',
};

function xpForLevel(level: number): number {
  return level * 500;
}

function computeLevel(totalXP: number): CollectorLevel {
  let xpRemaining = totalXP;
  let level = 1;
  while (xpRemaining >= xpForLevel(level) && level < 100) {
    xpRemaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  const pct = Math.min(100, Math.round((xpRemaining / needed) * 100));
  const maxTitle = Math.min(level, 10);
  const title = LEVEL_TITLES[maxTitle] || 'Legend';
  const perks: string[] = [];
  if (level >= 2) perks.push('Custom profile badge');
  if (level >= 3) perks.push('Access to trade chat');
  if (level >= 5) perks.push('Priority grading queue');
  if (level >= 7) perks.push('Exclusive market insights');
  if (level >= 10) perks.push('VIP collector events');
  return { level, title, currentXP: xpRemaining, xpToNext: needed - xpRemaining, totalXP, progressPercent: pct, perks };
}

const DEFAULT_SEASONAL: SeasonalChallenge[] = [
  {
    id: 'spring-2026',
    name: 'Spring Training Challenge',
    description: 'Complete baseball-themed tasks to earn bonus XP',
    season: 'Spring 2026',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    tasks: [
      { name: 'Add 5 baseball cards', completed: true, xpReward: 100 },
      { name: 'Grade a rookie card', completed: false, xpReward: 150 },
      { name: 'Complete a trade with a friend', completed: false, xpReward: 125 },
      { name: 'Reach $500 portfolio value', completed: true, xpReward: 200 },
    ],
    completionPercent: 50,
    reward: 'Exclusive Spring Training Badge',
    active: true,
  },
  {
    id: 'winter-2025',
    name: 'Winter Wonderland',
    description: 'Holiday collecting challenge',
    season: 'Winter 2025',
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    tasks: [
      { name: 'Add a vintage card (pre-1990)', completed: true, xpReward: 150 },
      { name: 'Share collection with a friend', completed: true, xpReward: 100 },
      { name: 'Earn $50 in profit', completed: true, xpReward: 125 },
    ],
    completionPercent: 100,
    reward: 'Snowflake Collector Badge',
    active: false,
  },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { userId: 'u1', username: 'CardKing99', avatar: '👑', level: 10, totalXP: 28500, achievementCount: 18, rank: 1 },
  { userId: 'u2', username: 'MintCondition', avatar: '💎', level: 9, totalXP: 24200, achievementCount: 16, rank: 2 },
  { userId: 'u3', username: 'SlabMaster', avatar: '🔥', level: 8, totalXP: 19800, achievementCount: 15, rank: 3 },
  { userId: 'u4', username: 'RookieHunter', avatar: '🎯', level: 7, totalXP: 16400, achievementCount: 14, rank: 4 },
  { userId: 'u5', username: 'VintageVibes', avatar: '📜', level: 7, totalXP: 15100, achievementCount: 13, rank: 5 },
  { userId: 'current', username: 'You', avatar: '⭐', level: 5, totalXP: 4400, achievementCount: 10, rank: 6 },
  { userId: 'u6', username: 'GradedGems', avatar: '💯', level: 5, totalXP: 11200, achievementCount: 11, rank: 7 },
  { userId: 'u7', username: 'TradeWizard', avatar: '🧙', level: 4, totalXP: 8900, achievementCount: 9, rank: 8 },
  { userId: 'u8', username: 'PackRipper', avatar: '📦', level: 3, totalXP: 5200, achievementCount: 7, rank: 9 },
  { userId: 'u9', username: 'NewCollector', avatar: '🌱', level: 1, totalXP: 800, achievementCount: 3, rank: 10 },
];

export function getAchievements(): Achievement[] {
  return loadFromStorage<Achievement[]>('list', DEFAULT_ACHIEVEMENTS);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return getAchievements().filter(a => a.category === category);
}

export function getUnlockedAchievements(): Achievement[] {
  return getAchievements().filter(a => a.unlocked);
}

export function getLockedAchievements(): Achievement[] {
  return getAchievements().filter(a => !a.unlocked);
}

export function unlockAchievement(id: string): Achievement | null {
  const achievements = getAchievements();
  const idx = achievements.findIndex(a => a.id === id);
  if (idx === -1) return null;
  const achievement = achievements[idx];
  if (achievement.unlocked) return achievement;
  achievement.unlocked = true;
  achievement.unlockedDate = new Date().toISOString().split('T')[0];
  achievement.progress = achievement.target;
  achievement.progressPercent = 100;
  saveToStorage('list', achievements);
  return achievement;
}

export function getCollectorLevel(): CollectorLevel {
  const achievements = getAchievements();
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);
  return computeLevel(totalXP);
}

export function getSeasonalChallenges(): SeasonalChallenge[] {
  return loadFromStorage<SeasonalChallenge[]>('seasonal', DEFAULT_SEASONAL);
}

export function completeTask(challengeId: string, taskIndex: number): SeasonalChallenge | null {
  const challenges = getSeasonalChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) return null;
  if (taskIndex < 0 || taskIndex >= challenge.tasks.length) return null;
  challenge.tasks[taskIndex].completed = true;
  const completedCount = challenge.tasks.filter(t => t.completed).length;
  challenge.completionPercent = Math.round((completedCount / challenge.tasks.length) * 100);
  saveToStorage('seasonal', challenges);
  return challenge;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return loadFromStorage<LeaderboardEntry[]>('leaderboard', DEFAULT_LEADERBOARD);
}

export function getAchievementStats(): AchievementStats {
  const achievements = getAchievements();
  const unlocked = achievements.filter(a => a.unlocked);
  const totalXP = unlocked.reduce((sum, a) => sum + a.xpReward, 0);
  const level = computeLevel(totalXP);
  const rarest = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => a.progressPercent - b.progressPercent)[0];
  return {
    totalAchievements: achievements.length,
    unlockedCount: unlocked.length,
    totalXP,
    currentLevel: level.level,
    currentStreak: 18,
    longestStreak: 24,
    rarest: rarest
      ? { name: rarest.name, percentUnlocked: 4.2 }
      : { name: 'None', percentUnlocked: 0 },
  };
}

export function getRecentUnlocks(limit: number): Achievement[] {
  return getAchievements()
    .filter(a => a.unlocked && a.unlockedDate)
    .sort((a, b) => (b.unlockedDate! > a.unlockedDate! ? 1 : -1))
    .slice(0, limit);
}

export function getNextAchievements(limit: number): Achievement[] {
  return getAchievements()
    .filter(a => !a.unlocked)
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, limit);
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K XP`;
  return `${xp} XP`;
}

export function getTierColor(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    case 'diamond': return '#B9F2FF';
  }
}

export function getTierLabel(tier: AchievementTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getCategoryColor(category: AchievementCategory): string {
  switch (category) {
    case 'collection': return '#3B82F6';
    case 'trading': return '#10B981';
    case 'grading': return '#F59E0B';
    case 'social': return '#8B5CF6';
    case 'financial': return '#EF4444';
    case 'milestone': return '#EC4899';
  }
}

export function getCategoryLabel(category: AchievementCategory): string {
  switch (category) {
    case 'collection': return 'Collection';
    case 'trading': return 'Trading';
    case 'grading': return 'Grading';
    case 'social': return 'Social';
    case 'financial': return 'Financial';
    case 'milestone': return 'Milestone';
  }
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return '#10B981';
  if (percent >= 75) return '#3B82F6';
  if (percent >= 50) return '#F59E0B';
  if (percent >= 25) return '#F97316';
  return '#EF4444';
}
