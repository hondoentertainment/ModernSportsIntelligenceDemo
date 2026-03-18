import { CardInventory, Sport } from '../types';
import { store } from './dal/syncStore';

// ---- Types ----

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AchievementCategoryType = 'collection' | 'trading' | 'grading' | 'diversification' | 'value';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategoryType;
  tier: AchievementTier;
  progress: number; // 0-100
  isUnlocked: boolean;
  unlockedAt: string | null;
  requirement: number;
  currentCount: number;
}

export interface AchievementCategory {
  id: AchievementCategoryType;
  label: string;
  icon: string;
  description: string;
  count: number;
  unlockedCount: number;
}

export interface AchievementSummary {
  totalUnlocked: number;
  totalAvailable: number;
  completionPercent: number;
  recentUnlocks: Achievement[];
  nextToUnlock: Achievement[];
  pointsEarned: number;
  level: number;
  levelProgress: number;
}

// ---- Constants ----

const TIER_POINTS: Record<AchievementTier, number> = {
  bronze: 10,
  silver: 25,
  gold: 50,
  platinum: 100,
  diamond: 250,
};

const SEEN_KEY = 'achievement_seen_ids';

// ---- Achievement Definitions ----

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategoryType;
  tier: AchievementTier;
  requirement: number;
  evaluate: (_inventory: CardInventory[]) => number;
}

const ALL_SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const achievementDefs: AchievementDef[] = [
  // ---- Collection ----
  {
    id: 'first_card',
    name: 'First Card',
    description: 'Add your first card to the collection',
    icon: '🃏',
    category: 'collection',
    tier: 'bronze',
    requirement: 1,
    evaluate: (inv) => inv.length,
  },
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    description: 'Build a collection of 10 cards',
    icon: '📦',
    category: 'collection',
    tier: 'bronze',
    requirement: 10,
    evaluate: (inv) => inv.length,
  },
  {
    id: 'serious_collector',
    name: 'Serious Collector',
    description: 'Amass 50 cards in your collection',
    icon: '🏆',
    category: 'collection',
    tier: 'silver',
    requirement: 50,
    evaluate: (inv) => inv.length,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Own 100 cards — a true centurion',
    icon: '💯',
    category: 'collection',
    tier: 'gold',
    requirement: 100,
    evaluate: (inv) => inv.length,
  },
  {
    id: 'vault_master',
    name: 'Vault Master',
    description: 'Reach an incredible 500 cards',
    icon: '🏛️',
    category: 'collection',
    tier: 'diamond',
    requirement: 500,
    evaluate: (inv) => inv.length,
  },
  {
    id: 'autograph_hunter',
    name: 'Autograph Hunter',
    description: 'Collect 5 autographed cards',
    icon: '✍️',
    category: 'collection',
    tier: 'silver',
    requirement: 5,
    evaluate: (inv) => inv.filter((c) => c.isAutographed).length,
  },
  {
    id: 'vintage_vibes',
    name: 'Vintage Vibes',
    description: 'Own 10 cards from before 2000',
    icon: '📜',
    category: 'collection',
    tier: 'gold',
    requirement: 10,
    evaluate: (inv) => inv.filter((c) => c.year < 2000).length,
  },
  {
    id: 'modern_era',
    name: 'Modern Era',
    description: 'Own 25 cards from 2020 or later',
    icon: '🚀',
    category: 'collection',
    tier: 'silver',
    requirement: 25,
    evaluate: (inv) => inv.filter((c) => c.year >= 2020).length,
  },

  // ---- Trading ----
  {
    id: 'first_sale',
    name: 'First Sale',
    description: 'Complete your first card sale',
    icon: '💰',
    category: 'trading',
    tier: 'bronze',
    requirement: 1,
    evaluate: (inv) => inv.filter((c) => c.status === 'sold').length,
  },
  {
    id: 'market_mover',
    name: 'Market Mover',
    description: 'Sell 5 cards',
    icon: '📈',
    category: 'trading',
    tier: 'silver',
    requirement: 5,
    evaluate: (inv) => inv.filter((c) => c.status === 'sold').length,
  },
  {
    id: 'profit_machine',
    name: 'Profit Machine',
    description: 'Make 10 profitable sales',
    icon: '🤑',
    category: 'trading',
    tier: 'gold',
    requirement: 10,
    evaluate: (inv) =>
      inv.filter(
        (c) => c.status === 'sold' && c.salePrice != null && c.salePrice > c.purchasePrice
      ).length,
  },
  {
    id: 'day_trader',
    name: 'Day Trader',
    description: 'Sell a card within 7 days of purchase',
    icon: '⚡',
    category: 'trading',
    tier: 'silver',
    requirement: 1,
    evaluate: (inv) =>
      inv.filter((c) => {
        if (c.status !== 'sold' || !c.saleDate) return false;
        const purchase = new Date(c.purchaseDate).getTime();
        const sale = new Date(c.saleDate).getTime();
        return sale - purchase <= 7 * 24 * 60 * 60 * 1000;
      }).length,
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Hold a card for over 1 year',
    icon: '💎',
    category: 'trading',
    tier: 'gold',
    requirement: 1,
    evaluate: (inv) => {
      const now = Date.now();
      return inv.filter((c) => {
        const purchase = new Date(c.purchaseDate).getTime();
        return now - purchase >= 365 * 24 * 60 * 60 * 1000;
      }).length;
    },
  },
  {
    id: 'bulk_seller',
    name: 'Bulk Seller',
    description: 'Sell 25 cards total',
    icon: '🏪',
    category: 'trading',
    tier: 'gold',
    requirement: 25,
    evaluate: (inv) => inv.filter((c) => c.status === 'sold').length,
  },
  {
    id: 'flipper',
    name: 'Flipper',
    description: 'Sell 5 cards within 30 days of purchase',
    icon: '🔄',
    category: 'trading',
    tier: 'platinum',
    requirement: 5,
    evaluate: (inv) =>
      inv.filter((c) => {
        if (c.status !== 'sold' || !c.saleDate) return false;
        const purchase = new Date(c.purchaseDate).getTime();
        const sale = new Date(c.saleDate).getTime();
        return sale - purchase <= 30 * 24 * 60 * 60 * 1000;
      }).length,
  },

  // ---- Grading ----
  {
    id: 'grade_getter',
    name: 'Grade Getter',
    description: 'Own your first graded card',
    icon: '🎓',
    category: 'grading',
    tier: 'bronze',
    requirement: 1,
    evaluate: (inv) => inv.filter((c) => c.isGraded).length,
  },
  {
    id: 'perfect_10',
    name: 'Perfect 10',
    description: 'Own a PSA 10 graded card',
    icon: '🔟',
    category: 'grading',
    tier: 'gold',
    requirement: 1,
    evaluate: (inv) =>
      inv.filter((c) => c.isGraded && c.gradingCompany === 'PSA' && c.grade === '10').length,
  },
  {
    id: 'multi_grader',
    name: 'Multi-Grader',
    description: 'Own cards graded by PSA, BGS, and SGC',
    icon: '🏅',
    category: 'grading',
    tier: 'platinum',
    requirement: 3,
    evaluate: (inv) => {
      const companies = new Set(inv.filter((c) => c.isGraded && c.gradingCompany).map((c) => c.gradingCompany));
      const target = ['PSA', 'BGS', 'SGC'];
      return target.filter((t) => companies.has(t as any)).length;
    },
  },
  {
    id: 'gem_mint_collection',
    name: 'Gem Mint Collection',
    description: 'Own 5 gem mint (9.5+) graded cards',
    icon: '💠',
    category: 'grading',
    tier: 'platinum',
    requirement: 5,
    evaluate: (inv) =>
      inv.filter((c) => {
        if (!c.isGraded || !c.grade) return false;
        const num = parseFloat(c.grade);
        return !isNaN(num) && num >= 9.5;
      }).length,
  },
  {
    id: 'slab_army',
    name: 'Slab Army',
    description: 'Own 20 graded cards',
    icon: '🧱',
    category: 'grading',
    tier: 'gold',
    requirement: 20,
    evaluate: (inv) => inv.filter((c) => c.isGraded).length,
  },
  {
    id: 'grade_enthusiast',
    name: 'Grade Enthusiast',
    description: 'Own 10 graded cards',
    icon: '📊',
    category: 'grading',
    tier: 'silver',
    requirement: 10,
    evaluate: (inv) => inv.filter((c) => c.isGraded).length,
  },

  // ---- Diversification ----
  {
    id: 'multi_sport',
    name: 'Multi-Sport',
    description: 'Own cards from 3 or more sports',
    icon: '🎯',
    category: 'diversification',
    tier: 'silver',
    requirement: 3,
    evaluate: (inv) => new Set(inv.map((c) => c.sport)).size,
  },
  {
    id: 'league_leader',
    name: 'League Leader',
    description: 'Own cards from all available leagues',
    icon: '🌐',
    category: 'diversification',
    tier: 'gold',
    requirement: 5,
    evaluate: (inv) => new Set(inv.map((c) => c.league)).size,
  },
  {
    id: 'full_roster',
    name: 'Full Roster',
    description: 'Own cards from all 5 sports',
    icon: '🏅',
    category: 'diversification',
    tier: 'platinum',
    requirement: 5,
    evaluate: (inv) => {
      const sports = new Set(inv.map((c) => c.sport));
      return ALL_SPORTS.filter((s) => sports.has(s)).length;
    },
  },
  {
    id: 'manufacturer_mix',
    name: 'Manufacturer Mix',
    description: 'Own cards from 5 different manufacturers',
    icon: '🏭',
    category: 'diversification',
    tier: 'silver',
    requirement: 5,
    evaluate: (inv) => new Set(inv.map((c) => c.manufacturer)).size,
  },
  {
    id: 'decade_spanning',
    name: 'Decade Spanning',
    description: 'Own cards from 4 different decades',
    icon: '📅',
    category: 'diversification',
    tier: 'gold',
    requirement: 4,
    evaluate: (inv) => new Set(inv.map((c) => Math.floor(c.year / 10) * 10)).size,
  },
  {
    id: 'set_builder',
    name: 'Set Builder',
    description: 'Own cards from 10 different sets',
    icon: '🗂️',
    category: 'diversification',
    tier: 'gold',
    requirement: 10,
    evaluate: (inv) => new Set(inv.map((c) => c.set)).size,
  },

  // ---- Value ----
  {
    id: 'thousand_dollar_club',
    name: 'Thousand Dollar Club',
    description: 'Reach a portfolio value of $1,000',
    icon: '💵',
    category: 'value',
    tier: 'silver',
    requirement: 1000,
    evaluate: (inv) =>
      inv.reduce((sum, c) => sum + (c.status !== 'sold' ? (c.currentValue ?? c.purchasePrice) : 0), 0),
  },
  {
    id: 'five_figure_club',
    name: 'Five Figure Club',
    description: 'Reach a portfolio value of $10,000',
    icon: '💰',
    category: 'value',
    tier: 'gold',
    requirement: 10000,
    evaluate: (inv) =>
      inv.reduce((sum, c) => sum + (c.status !== 'sold' ? (c.currentValue ?? c.purchasePrice) : 0), 0),
  },
  {
    id: 'six_figure_club',
    name: 'Six Figure Club',
    description: 'Reach a portfolio value of $100,000',
    icon: '🏦',
    category: 'value',
    tier: 'diamond',
    requirement: 100000,
    evaluate: (inv) =>
      inv.reduce((sum, c) => sum + (c.status !== 'sold' ? (c.currentValue ?? c.purchasePrice) : 0), 0),
  },
  {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Purchase a single card for over $500',
    icon: '🎰',
    category: 'value',
    tier: 'gold',
    requirement: 1,
    evaluate: (inv) => inv.filter((c) => c.purchasePrice > 500).length,
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Own a card bought for under $5 now worth over $50',
    icon: '🪙',
    category: 'value',
    tier: 'platinum',
    requirement: 1,
    evaluate: (inv) =>
      inv.filter(
        (c) =>
          c.purchasePrice < 5 && (c.currentValue ?? 0) > 50 && c.status !== 'sold'
      ).length,
  },
  {
    id: 'total_invested_5k',
    name: 'Invested 5K',
    description: 'Invest a total of $5,000 across all purchases',
    icon: '📊',
    category: 'value',
    tier: 'silver',
    requirement: 5000,
    evaluate: (inv) => inv.reduce((sum, c) => sum + c.purchasePrice, 0),
  },
  {
    id: 'profit_master',
    name: 'Profit Master',
    description: 'Earn $1,000+ total profit from sales',
    icon: '👑',
    category: 'value',
    tier: 'platinum',
    requirement: 1000,
    evaluate: (inv) =>
      inv
        .filter((c) => c.status === 'sold' && c.salePrice != null)
        .reduce((sum, c) => sum + ((c.salePrice ?? 0) - c.purchasePrice), 0),
  },
  {
    id: 'value_surge',
    name: 'Value Surge',
    description: 'Own a card that has doubled in value',
    icon: '📈',
    category: 'value',
    tier: 'gold',
    requirement: 1,
    evaluate: (inv) =>
      inv.filter(
        (c) =>
          c.status !== 'sold' &&
          c.currentValue != null &&
          c.currentValue >= c.purchasePrice * 2
      ).length,
  },
];

// ---- Core Functions ----

export function evaluateAchievements(inventory: CardInventory[]): Achievement[] {
  return achievementDefs.map((def) => {
    const currentCount = Math.max(0, def.evaluate(inventory));
    const progress = Math.min(100, Math.round((currentCount / def.requirement) * 100));
    const isUnlocked = currentCount >= def.requirement;

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      tier: def.tier,
      progress,
      isUnlocked,
      unlockedAt: isUnlocked ? getUnlockTimestamp(def.id) : null,
      requirement: def.requirement,
      currentCount,
    };
  });
}

export function getAchievementSummary(inventory: CardInventory[]): AchievementSummary {
  const achievements = evaluateAchievements(inventory);
  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);

  const pointsEarned = unlocked.reduce((sum, a) => sum + TIER_POINTS[a.tier], 0);
  const { level, levelProgress } = calculateLevel(pointsEarned);

  // Recent unlocks: sorted by unlockedAt desc, take 5
  const recentUnlocks = [...unlocked]
    .sort((a, b) => {
      const ta = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const tb = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 5);

  // Next to unlock: sorted by progress desc, take 3
  const nextToUnlock = [...locked].sort((a, b) => b.progress - a.progress).slice(0, 3);

  return {
    totalUnlocked: unlocked.length,
    totalAvailable: achievements.length,
    completionPercent: achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0,
    recentUnlocks,
    nextToUnlock,
    pointsEarned,
    level,
    levelProgress,
  };
}

export function getAchievementCategories(achievements: Achievement[]): AchievementCategory[] {
  const categories: { id: AchievementCategoryType; label: string; icon: string; description: string }[] = [
    { id: 'collection', label: 'Collection', icon: '🃏', description: 'Build your card collection' },
    { id: 'trading', label: 'Trading', icon: '💰', description: 'Buy and sell cards' },
    { id: 'grading', label: 'Grading', icon: '🎓', description: 'Grade your cards professionally' },
    { id: 'diversification', label: 'Diversification', icon: '🌐', description: 'Diversify across sports and eras' },
    { id: 'value', label: 'Value', icon: '💎', description: 'Grow your portfolio value' },
  ];

  return categories.map((cat) => {
    const catAchievements = achievements.filter((a) => a.category === cat.id);
    return {
      ...cat,
      count: catAchievements.length,
      unlockedCount: catAchievements.filter((a) => a.isUnlocked).length,
    };
  });
}

export function getRecentlyUnlocked(inventory: CardInventory[]): Achievement[] {
  const achievements = evaluateAchievements(inventory);
  const seenIds = getSeenIds();
  return achievements.filter((a) => a.isUnlocked && !seenIds.has(a.id));
}

export function markAsSeen(achievementId: string): void {
  const seenIds = getSeenIds();
  seenIds.add(achievementId);
  store.set(SEEN_KEY, [...seenIds]);
}

export function calculateLevel(totalPoints: number): { level: number; levelProgress: number } {
  // Level = floor(sqrt(points / 10)), capped at 50
  const rawLevel = Math.floor(Math.sqrt(totalPoints / 10));
  const level = Math.min(50, Math.max(1, rawLevel || 1));

  // Points needed for current level and next level
  const pointsForCurrentLevel = level * level * 10;
  const pointsForNextLevel = (level + 1) * (level + 1) * 10;
  const range = pointsForNextLevel - pointsForCurrentLevel;
  const earned = totalPoints - pointsForCurrentLevel;
  const levelProgress = level >= 50 ? 100 : Math.min(100, Math.max(0, Math.round((earned / range) * 100)));

  return { level, levelProgress };
}

// ---- Helpers ----

function getSeenIds(): Set<string> {
  const parsed = store.get<string[]>(SEEN_KEY, []);
  return new Set(parsed);
}

function getUnlockTimestamp(achievementId: string): string {
  const key = `achievement_unlock_${achievementId}`;
  const stored = store.get<string | null>(key, null);
  if (stored) return stored;
  // First time we see this as unlocked — record now
  const now = new Date().toISOString();
  store.set(key, now);
  return now;
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};
