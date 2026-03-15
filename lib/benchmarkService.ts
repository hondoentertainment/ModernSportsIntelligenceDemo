import { CardInventory, Sport } from '../types';

// ---- Types ----

export type LeaderboardCategory =
  | 'roi'
  | 'portfolio_value'
  | 'diversification'
  | 'grading_score'
  | 'trading_activity'
  | 'achievement_points';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  value: number;
  isUser: boolean;
}

export interface PercentileRanking {
  category: LeaderboardCategory;
  userValue: number;
  percentile: number;
  rank: number;
  totalParticipants: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  reward: number;
  daysRemaining: number;
}

export interface ChallengeProgress {
  challengeId: string;
  title: string;
  current: number;
  requirement: number;
  reward: number;
  daysRemaining: number;
  completed: boolean;
  percentComplete: number;
}

export interface CommunityProfile {
  id: string;
  displayName: string;
  portfolioValue: number;
  totalROI: number;
  cardCount: number;
  diversificationScore: number;
  gradingScore: number;
  tradeCount: number;
  achievementPoints: number;
}

// ---- Constants ----

const SNAPSHOT_KEY = 'msi_benchmark_snapshots';
const CHALLENGE_KEY = 'msi_challenge_progress';
const COMMUNITY_SIZE = 500;

export const CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  roi: 'Total ROI',
  portfolio_value: 'Portfolio Value',
  diversification: 'Diversification',
  grading_score: 'Grading Score',
  trading_activity: 'Trading Activity',
  achievement_points: 'Achievement Points',
};

// CATEGORY_LABELS already exported above

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededGaussian(seed: number, offset: number): number {
  // Box-Muller approximation using two seeded randoms
  const u1 = Math.max(0.0001, seededRandom(seed, offset));
  const u2 = seededRandom(seed, offset + 1);
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function seededPareto(seed: number, offset: number, alpha: number, xMin: number): number {
  const u = Math.max(0.0001, seededRandom(seed, offset));
  return xMin / Math.pow(u, 1.0 / alpha);
}

function monthSeed(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// ---- localStorage helpers ----

interface RankingSnapshot {
  date: string;
  rankings: Record<LeaderboardCategory, number>;
}

function loadSnapshots(): RankingSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RankingSnapshot[];
  } catch {
    return [];
  }
}

function saveSnapshot(rankings: Record<LeaderboardCategory, number>): void {
  try {
    const snapshots = loadSnapshots();
    const today = new Date().toISOString().slice(0, 10);
    // Only save one snapshot per day
    const existing = snapshots.findIndex(s => s.date === today);
    if (existing >= 0) {
      snapshots[existing] = { date: today, rankings };
    } else {
      snapshots.push({ date: today, rankings });
    }
    // Keep last 30 snapshots
    const trimmed = snapshots.slice(-30);
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded
  }
}

function loadChallengeProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function saveChallengeProgress(progress: Record<string, number>): void {
  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(progress));
  } catch {
    // quota exceeded
  }
}

// ---- Community Profile Generation ----

let cachedProfiles: CommunityProfile[] | null = null;
let cachedSeed: number | null = null;

export function generateCommunityProfiles(seed?: number): CommunityProfile[] {
  const effectiveSeed = seed ?? monthSeed();

  if (cachedProfiles && cachedSeed === effectiveSeed) {
    return cachedProfiles;
  }

  const profiles: CommunityProfile[] = [];

  for (let i = 0; i < COMMUNITY_SIZE; i++) {
    const profileSeed = effectiveSeed * 1000 + i;

    // Pareto distribution for portfolio value: most collectors small, few whales
    const portfolioValue = Math.round(
      seededPareto(profileSeed, 1, 1.8, 500) * 100
    ) / 100;

    // Card count correlates loosely with portfolio value
    const baseCards = Math.max(5, Math.round(portfolioValue / 80));
    const cardCount = Math.round(
      baseCards * seededRange(profileSeed, 2, 0.5, 2.0)
    );

    // ROI: gaussian centered around 12%, std 25%
    const totalROI = Math.round(
      (12 + seededGaussian(profileSeed, 3) * 25) * 100
    ) / 100;

    // Diversification score: how many sports + spread
    const diversificationScore = Math.round(
      Math.min(100, Math.max(5, seededRange(profileSeed, 4, 15, 85) +
        seededGaussian(profileSeed, 5) * 15))
    );

    // Grading score: percentage graded * quality factor
    const gradingScore = Math.round(
      Math.min(100, Math.max(0, seededRange(profileSeed, 6, 10, 75) +
        seededGaussian(profileSeed, 7) * 12))
    );

    // Trade count
    const tradeCount = Math.max(0, Math.round(
      seededPareto(profileSeed, 8, 2.2, 1) * seededRange(profileSeed, 9, 0.5, 3)
    ));

    // Achievement points: correlated with activity
    const achievementPoints = Math.round(
      Math.max(0, (cardCount * 2 + tradeCount * 5 + gradingScore * 3) *
        seededRange(profileSeed, 10, 0.3, 1.5))
    );

    profiles.push({
      id: `collector_${String(i).padStart(3, '0')}`,
      displayName: `Collector_${String(i + 1).padStart(3, '0')}`,
      portfolioValue: Math.max(100, portfolioValue),
      totalROI: Math.max(-80, Math.min(200, totalROI)),
      cardCount: Math.max(1, cardCount),
      diversificationScore,
      gradingScore,
      tradeCount,
      achievementPoints,
    });
  }

  cachedProfiles = profiles;
  cachedSeed = effectiveSeed;
  return profiles;
}

// ---- User Metrics ----

export function calculateUserMetrics(
  inventory: CardInventory[]
): Record<LeaderboardCategory, number> {
  if (inventory.length === 0) {
    return {
      roi: 0,
      portfolio_value: 0,
      diversification: 0,
      grading_score: 0,
      trading_activity: 0,
      achievement_points: 0,
    };
  }

  // Portfolio value: sum of current values
  const portfolioValue = inventory.reduce((sum, card) => {
    return sum + (card.currentValue ?? card.purchasePrice);
  }, 0);

  // Total ROI
  const totalCost = inventory.reduce((sum, card) => sum + card.purchasePrice, 0);
  const roi = totalCost > 0 ? ((portfolioValue - totalCost) / totalCost) * 100 : 0;

  // Diversification: count unique sports, manufacturers, years, sets
  const uniqueSports = new Set(inventory.map(c => c.sport)).size;
  const uniqueManufacturers = new Set(inventory.map(c => c.manufacturer)).size;
  const uniqueDecades = new Set(inventory.map(c => Math.floor(c.year / 10))).size;
  const uniqueSets = new Set(inventory.map(c => c.set)).size;
  const totalSports = 5; // known sports count
  const sportSpread = (uniqueSports / totalSports) * 40;
  const manufacturerSpread = Math.min(30, (uniqueManufacturers / 8) * 30);
  const decadeSpread = Math.min(15, (uniqueDecades / 5) * 15);
  const setSpread = Math.min(15, (uniqueSets / 10) * 15);
  const diversification = Math.min(100, Math.round(sportSpread + manufacturerSpread + decadeSpread + setSpread));

  // Grading score: % graded * average grade quality
  const gradedCards = inventory.filter(c => c.isGraded);
  const gradedRatio = inventory.length > 0 ? gradedCards.length / inventory.length : 0;
  let avgGradeQuality = 0;
  if (gradedCards.length > 0) {
    const gradeValues = gradedCards.map(c => {
      const g = parseFloat(c.grade ?? '0');
      return isNaN(g) ? 5 : g;
    });
    avgGradeQuality = gradeValues.reduce((s, v) => s + v, 0) / gradeValues.length;
  }
  const gradingScore = Math.round(Math.min(100, gradedRatio * 50 + (avgGradeQuality / 10) * 50));

  // Trading activity: sold cards count + purchase frequency
  const soldCards = inventory.filter(c => c.status === 'sold').length;
  const purchaseDates = inventory.map(c => new Date(c.purchaseDate).getTime()).sort();
  let purchaseFrequency = 0;
  if (purchaseDates.length >= 2) {
    const rangeMs = purchaseDates[purchaseDates.length - 1] - purchaseDates[0];
    const rangeDays = Math.max(1, rangeMs / (1000 * 60 * 60 * 24));
    purchaseFrequency = (inventory.length / rangeDays) * 30; // cards per month
  }
  const tradingActivity = Math.round(soldCards * 5 + purchaseFrequency * 10);

  // Achievement points: composite of all activity
  const achievementPoints = Math.round(
    inventory.length * 2 +
    soldCards * 10 +
    gradedCards.length * 5 +
    uniqueSports * 20 +
    (roi > 0 ? roi * 2 : 0) +
    diversification * 1.5
  );

  return {
    roi: Math.round(roi * 100) / 100,
    portfolio_value: Math.round(portfolioValue * 100) / 100,
    diversification,
    grading_score: gradingScore,
    trading_activity: tradingActivity,
    achievement_points: achievementPoints,
  };
}

// ---- Percentile Ranking ----

export function getPercentileRanking(inventory: CardInventory[]): PercentileRanking[] {
  const profiles = generateCommunityProfiles();
  const userMetrics = calculateUserMetrics(inventory);
  const snapshots = loadSnapshots();

  // Save current snapshot
  const currentPercentiles: Record<LeaderboardCategory, number> = {} as Record<LeaderboardCategory, number>;

  const categories: LeaderboardCategory[] = [
    'roi', 'portfolio_value', 'diversification',
    'grading_score', 'trading_activity', 'achievement_points',
  ];

  const profileValueGetters: Record<LeaderboardCategory, (_p: CommunityProfile) => number> = {
    roi: p => p.totalROI,
    portfolio_value: p => p.portfolioValue,
    diversification: p => p.diversificationScore,
    grading_score: p => p.gradingScore,
    trading_activity: p => p.tradeCount,
    achievement_points: p => p.achievementPoints,
  };

  const rankings: PercentileRanking[] = categories.map(category => {
    const userValue = userMetrics[category];
    const communityValues = profiles.map(p => profileValueGetters[category](p));
    const belowCount = communityValues.filter(v => v < userValue).length;
    const percentile = Math.round((belowCount / (communityValues.length + 1)) * 100);
    const allValues = [...communityValues, userValue].sort((a, b) => b - a);
    const rank = allValues.indexOf(userValue) + 1;

    currentPercentiles[category] = percentile;

    // Determine trend from snapshots
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (snapshots.length >= 2) {
      const prev = snapshots[snapshots.length - 2];
      const prevPercentile = prev.rankings[category] ?? percentile;
      if (percentile > prevPercentile + 2) trend = 'up';
      else if (percentile < prevPercentile - 2) trend = 'down';
    } else {
      // Deterministic trend based on user metrics
      const seed = dateSeed();
      const trendVal = seededRandom(seed, categories.indexOf(category) * 7);
      if (trendVal > 0.6) trend = 'up';
      else if (trendVal < 0.3) trend = 'down';
    }

    return {
      category,
      userValue: Math.round(userValue * 100) / 100,
      percentile,
      rank,
      totalParticipants: communityValues.length + 1,
      trend,
    };
  });

  saveSnapshot(currentPercentiles);
  return rankings;
}

// ---- Leaderboards ----

export function getLeaderboard(
  category: LeaderboardCategory,
  limit: number = 20
): LeaderboardEntry[] {
  const profiles = generateCommunityProfiles();

  const valueGetters: Record<LeaderboardCategory, (_p: CommunityProfile) => number> = {
    roi: p => p.totalROI,
    portfolio_value: p => p.portfolioValue,
    diversification: p => p.diversificationScore,
    grading_score: p => p.gradingScore,
    trading_activity: p => p.tradeCount,
    achievement_points: p => p.achievementPoints,
  };

  const getter = valueGetters[category];
  const sorted = [...profiles].sort((a, b) => getter(b) - getter(a));
  const entries: LeaderboardEntry[] = sorted.slice(0, limit).map((p, i) => ({
    rank: i + 1,
    displayName: p.displayName,
    value: Math.round(getter(p) * 100) / 100,
    isUser: false,
  }));

  return entries;
}

export function getLeaderboardWithUser(
  category: LeaderboardCategory,
  inventory: CardInventory[],
  limit: number = 20
): LeaderboardEntry[] {
  const profiles = generateCommunityProfiles();
  const userMetrics = calculateUserMetrics(inventory);

  const valueGetters: Record<LeaderboardCategory, (_p: CommunityProfile) => number> = {
    roi: p => p.totalROI,
    portfolio_value: p => p.portfolioValue,
    diversification: p => p.diversificationScore,
    grading_score: p => p.gradingScore,
    trading_activity: p => p.tradeCount,
    achievement_points: p => p.achievementPoints,
  };

  const getter = valueGetters[category];
  const userValue = userMetrics[category];

  // Combine user with community
  const allEntries: { name: string; value: number; isUser: boolean }[] = profiles.map(p => ({
    name: p.displayName,
    value: getter(p),
    isUser: false,
  }));
  allEntries.push({ name: 'You', value: userValue, isUser: true });

  allEntries.sort((a, b) => b.value - a.value);

  // Get top entries
  const topEntries = allEntries.slice(0, limit);

  // If user isn't in top, append them
  const userInTop = topEntries.some(e => e.isUser);
  const userIdx = allEntries.findIndex(e => e.isUser);

  const result: LeaderboardEntry[] = topEntries.map((e, i) => ({
    rank: i + 1,
    displayName: e.name,
    value: Math.round(e.value * 100) / 100,
    isUser: e.isUser,
  }));

  if (!userInTop && userIdx >= 0) {
    result.push({
      rank: userIdx + 1,
      displayName: 'You',
      value: Math.round(userValue * 100) / 100,
      isUser: true,
    });
  }

  return result;
}

// ---- Sport Leaderboards ----

export function getSportLeaderboard(
  sport: Sport,
  inventory: CardInventory[]
): LeaderboardEntry[] {
  const profiles = generateCommunityProfiles();
  const seed = monthSeed();

  const sportIndex: Record<Sport, number> = {
    Baseball: 0,
    Basketball: 1,
    Football: 2,
    Hockey: 3,
    Soccer: 4,
  };

  const si = sportIndex[sport];

  // Generate sport-specific values for community
  const communityEntries: { name: string; value: number }[] = profiles
    .filter((_, i) => {
      // ~60% of collectors have cards in any given sport
      return seededRandom(seed + i, 200 + si) < 0.6;
    })
    .map((p, i) => {
      const sportValue = Math.round(
        p.portfolioValue * seededRange(seed + i, 300 + si, 0.05, 0.5) * 100
      ) / 100;
      return { name: p.displayName, value: sportValue };
    });

  // User's sport value
  const sportCards = inventory.filter(c => c.sport === sport);
  const userSportValue = sportCards.reduce(
    (sum, c) => sum + (c.currentValue ?? c.purchasePrice),
    0
  );

  const allEntries = [
    ...communityEntries,
    { name: 'You', value: userSportValue },
  ].sort((a, b) => b.value - a.value);

  const top20 = allEntries.slice(0, 20);
  const userInTop = top20.some(e => e.name === 'You');
  const userIdx = allEntries.findIndex(e => e.name === 'You');

  const result: LeaderboardEntry[] = top20.map((e, i) => ({
    rank: i + 1,
    displayName: e.name,
    value: Math.round(e.value * 100) / 100,
    isUser: e.name === 'You',
  }));

  if (!userInTop && userIdx >= 0) {
    result.push({
      rank: userIdx + 1,
      displayName: 'You',
      value: Math.round(userSportValue * 100) / 100,
      isUser: true,
    });
  }

  return result;
}

// ---- Monthly Challenges ----

const CHALLENGE_TEMPLATES = [
  { title: 'Profit Taker', description: 'Sell 3 cards at greater than 20% profit', requirement: 3, reward: 150 },
  { title: 'Sport Explorer', description: 'Add 5 cards from a sport not in your collection', requirement: 5, reward: 200 },
  { title: 'Grade Getter', description: 'Grade 2 ungraded cards', requirement: 2, reward: 100 },
  { title: 'Volume Trader', description: 'Buy or sell 10 cards this month', requirement: 10, reward: 250 },
  { title: 'Vintage Hunter', description: 'Acquire 3 cards from before 2000', requirement: 3, reward: 175 },
  { title: 'High Roller', description: 'Add a card worth over $500 to your collection', requirement: 1, reward: 300 },
  { title: 'Diversifier', description: 'Own cards from at least 4 different sports', requirement: 4, reward: 200 },
  { title: 'Set Builder', description: 'Add 5 cards from the same set', requirement: 5, reward: 175 },
  { title: 'Autograph Seeker', description: 'Acquire 2 autographed cards', requirement: 2, reward: 225 },
  { title: 'Bargain Hunter', description: 'Buy 5 cards for under $20 each', requirement: 5, reward: 125 },
  { title: 'Premium Collector', description: 'Reach a portfolio value of $5,000', requirement: 5000, reward: 500 },
  { title: 'Grading Master', description: 'Have 5 cards graded PSA 9 or higher', requirement: 5, reward: 350 },
];

export function getMonthlyChallenge(): MonthlyChallenge[] {
  const seed = monthSeed();
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - now.getDate();

  // Pick 3 deterministic challenges for this month
  const indices: number[] = [];
  let offset = 0;
  while (indices.length < 3) {
    const idx = Math.floor(seededRange(seed, 500 + offset, 0, CHALLENGE_TEMPLATES.length));
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
    offset++;
  }

  return indices.map((templateIdx, i) => {
    const template = CHALLENGE_TEMPLATES[templateIdx];
    return {
      id: `challenge_${seed}_${i}`,
      title: template.title,
      description: template.description,
      requirement: template.requirement,
      reward: template.reward,
      daysRemaining,
    };
  });
}

// ---- Challenge Progress ----

export function evaluateChallengeProgress(
  challenges: MonthlyChallenge[],
  inventory: CardInventory[]
): ChallengeProgress[] {
  const stored = loadChallengeProgress();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  // Compute progress for each challenge based on inventory analysis
  const progressResults: ChallengeProgress[] = challenges.map(challenge => {
    let current = 0;

    // Match challenge by title to determine how to evaluate
    if (challenge.title === 'Profit Taker') {
      current = inventory.filter(c =>
        c.status === 'sold' &&
        c.salePrice &&
        c.saleDate &&
        c.saleDate >= monthStart &&
        ((c.salePrice - c.purchasePrice) / c.purchasePrice) > 0.20
      ).length;
    } else if (challenge.title === 'Sport Explorer') {
      const existingSports = new Set(
        inventory.filter(c => c.purchaseDate < monthStart).map(c => c.sport)
      );
      current = inventory.filter(c =>
        c.purchaseDate >= monthStart && !existingSports.has(c.sport)
      ).length;
    } else if (challenge.title === 'Grade Getter') {
      current = inventory.filter(c =>
        c.isGraded && c.purchaseDate >= monthStart
      ).length;
    } else if (challenge.title === 'Volume Trader') {
      const bought = inventory.filter(c => c.purchaseDate >= monthStart).length;
      const sold = inventory.filter(c =>
        c.status === 'sold' && c.saleDate && c.saleDate >= monthStart
      ).length;
      current = bought + sold;
    } else if (challenge.title === 'Vintage Hunter') {
      current = inventory.filter(c =>
        c.year < 2000 && c.purchaseDate >= monthStart
      ).length;
    } else if (challenge.title === 'High Roller') {
      current = inventory.filter(c =>
        (c.currentValue ?? c.purchasePrice) > 500 && c.purchaseDate >= monthStart
      ).length;
      current = Math.min(current, challenge.requirement);
    } else if (challenge.title === 'Diversifier') {
      current = new Set(inventory.map(c => c.sport)).size;
    } else if (challenge.title === 'Set Builder') {
      const setCounts: Record<string, number> = {};
      inventory.forEach(c => {
        setCounts[c.set] = (setCounts[c.set] || 0) + 1;
      });
      current = Math.max(0, ...Object.values(setCounts));
    } else if (challenge.title === 'Autograph Seeker') {
      current = inventory.filter(c =>
        c.isAutographed && c.purchaseDate >= monthStart
      ).length;
    } else if (challenge.title === 'Bargain Hunter') {
      current = inventory.filter(c =>
        c.purchasePrice < 20 && c.purchaseDate >= monthStart
      ).length;
    } else if (challenge.title === 'Premium Collector') {
      current = Math.round(inventory.reduce(
        (sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0
      ));
    } else if (challenge.title === 'Grading Master') {
      current = inventory.filter(c => {
        if (!c.isGraded || !c.grade) return false;
        const g = parseFloat(c.grade);
        return !isNaN(g) && g >= 9;
      }).length;
    } else {
      // Fallback: use stored progress
      current = stored[challenge.id] ?? 0;
    }

    const completed = current >= challenge.requirement;
    const percentComplete = Math.min(100, Math.round((current / challenge.requirement) * 100));

    return {
      challengeId: challenge.id,
      title: challenge.title,
      current,
      requirement: challenge.requirement,
      reward: challenge.reward,
      daysRemaining: challenge.daysRemaining,
      completed,
      percentComplete,
    };
  });

  // Persist progress
  const progressMap: Record<string, number> = {};
  progressResults.forEach(p => {
    progressMap[p.challengeId] = p.current;
  });
  saveChallengeProgress(progressMap);

  return progressResults;
}

// ---- Community Stats ----

export function getCommunityStats(): {
  avgPortfolioValue: number;
  avgCardCount: number;
  avgROI: number;
  totalCollectors: number;
} {
  const profiles = generateCommunityProfiles();

  const totalPortfolio = profiles.reduce((s, p) => s + p.portfolioValue, 0);
  const totalCards = profiles.reduce((s, p) => s + p.cardCount, 0);
  const totalROI = profiles.reduce((s, p) => s + p.totalROI, 0);

  return {
    avgPortfolioValue: Math.round((totalPortfolio / profiles.length) * 100) / 100,
    avgCardCount: Math.round(totalCards / profiles.length),
    avgROI: Math.round((totalROI / profiles.length) * 100) / 100,
    totalCollectors: profiles.length + 1, // +1 for user
  };
}
