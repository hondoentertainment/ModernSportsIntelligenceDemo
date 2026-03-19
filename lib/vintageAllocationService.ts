// ---- Types ----

export type AllocationCategory = 'vintage' | 'classic' | 'modern' | 'ultra_modern';

export interface AllocationItem {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  category: AllocationCategory;
  currentValue: number;
  purchasePrice: number;
  annualReturn: number;
  riskScore: number; // 1-10
  liquidity: 'high' | 'medium' | 'low';
  grade: string;
  imageUrl: string;
}

export interface AllocationTarget {
  category: AllocationCategory;
  targetPercent: number;
  actualPercent: number;
  deviation: number;
  items: AllocationItem[];
}

export interface RiskReturnProfile {
  category: AllocationCategory;
  avgReturn: number;
  avgRisk: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export interface RebalanceAction {
  action: 'buy' | 'sell' | 'hold';
  category: AllocationCategory;
  amount: number;
  reason: string;
}

export interface AllocationStats {
  totalValue: number;
  vintagePercent: number;
  classicPercent: number;
  modernPercent: number;
  ultraModernPercent: number;
  overallReturn: number;
  riskScore: number;
  diversificationScore: number; // 1-100
}

export interface HistoricalReturn {
  year: number;
  vintage: number;
  classic: number;
  modern: number;
  ultra_modern: number;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_vintage_allocation';
const ITEMS_KEY = `${STORAGE_PREFIX}_items`;
const TARGETS_KEY = `${STORAGE_PREFIX}_targets`;

// ---- Default targets ----

const DEFAULT_TARGETS: Record<AllocationCategory, number> = {
  vintage: 25,
  classic: 30,
  modern: 30,
  ultra_modern: 15,
};

// ---- Mock Data ----

function categorizeYear(year: number): AllocationCategory {
  if (year < 1980) return 'vintage';
  if (year < 2000) return 'classic';
  if (year < 2016) return 'modern';
  return 'ultra_modern';
}

const DEFAULT_ITEMS: AllocationItem[] = [
  {
    id: 'va-001',
    cardName: '1952 Topps #311',
    player: 'Mickey Mantle',
    sport: 'Baseball',
    year: 1952,
    set: 'Topps',
    category: 'vintage',
    currentValue: 125000,
    purchasePrice: 85000,
    annualReturn: 12.4,
    riskScore: 3,
    liquidity: 'high',
    grade: 'PSA 6',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-002',
    cardName: '1969 Topps #260',
    player: 'Reggie Jackson RC',
    sport: 'Baseball',
    year: 1969,
    set: 'Topps',
    category: 'vintage',
    currentValue: 18500,
    purchasePrice: 12000,
    annualReturn: 9.2,
    riskScore: 4,
    liquidity: 'medium',
    grade: 'PSA 7',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-003',
    cardName: '1979 O-Pee-Chee #18',
    player: 'Wayne Gretzky RC',
    sport: 'Hockey',
    year: 1979,
    set: 'O-Pee-Chee',
    category: 'vintage',
    currentValue: 95000,
    purchasePrice: 60000,
    annualReturn: 11.8,
    riskScore: 3,
    liquidity: 'high',
    grade: 'PSA 8',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-004',
    cardName: '1986 Fleer #57',
    player: 'Michael Jordan RC',
    sport: 'Basketball',
    year: 1986,
    set: 'Fleer',
    category: 'classic',
    currentValue: 45000,
    purchasePrice: 28000,
    annualReturn: 14.5,
    riskScore: 4,
    liquidity: 'high',
    grade: 'PSA 9',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-005',
    cardName: '1989 Upper Deck #1',
    player: 'Ken Griffey Jr RC',
    sport: 'Baseball',
    year: 1989,
    set: 'Upper Deck',
    category: 'classic',
    currentValue: 3200,
    purchasePrice: 1800,
    annualReturn: 8.7,
    riskScore: 5,
    liquidity: 'high',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-006',
    cardName: '1996 Topps Chrome #138',
    player: 'Kobe Bryant RC',
    sport: 'Basketball',
    year: 1996,
    set: 'Topps Chrome',
    category: 'classic',
    currentValue: 32000,
    purchasePrice: 15000,
    annualReturn: 16.2,
    riskScore: 5,
    liquidity: 'high',
    grade: 'PSA 9',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-007',
    cardName: '2003 Topps Chrome #111',
    player: 'LeBron James RC',
    sport: 'Basketball',
    year: 2003,
    set: 'Topps Chrome',
    category: 'modern',
    currentValue: 52000,
    purchasePrice: 22000,
    annualReturn: 18.3,
    riskScore: 5,
    liquidity: 'high',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-008',
    cardName: '2011 Topps Update #US175',
    player: 'Mike Trout RC',
    sport: 'Baseball',
    year: 2011,
    set: 'Topps Update',
    category: 'modern',
    currentValue: 38000,
    purchasePrice: 18000,
    annualReturn: 15.1,
    riskScore: 6,
    liquidity: 'high',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-009',
    cardName: '2014 Bowman Chrome #BCP25',
    player: 'Mookie Betts',
    sport: 'Baseball',
    year: 2014,
    set: 'Bowman Chrome',
    category: 'modern',
    currentValue: 4800,
    purchasePrice: 2500,
    annualReturn: 10.2,
    riskScore: 6,
    liquidity: 'medium',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-010',
    cardName: '2018 Panini Prizm #280',
    player: 'Luka Doncic RC',
    sport: 'Basketball',
    year: 2018,
    set: 'Panini Prizm',
    category: 'ultra_modern',
    currentValue: 8500,
    purchasePrice: 3200,
    annualReturn: 22.1,
    riskScore: 8,
    liquidity: 'high',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-011',
    cardName: '2020 Panini Prizm #258',
    player: 'Justin Herbert RC',
    sport: 'Football',
    year: 2020,
    set: 'Panini Prizm',
    category: 'ultra_modern',
    currentValue: 2400,
    purchasePrice: 1100,
    annualReturn: 19.5,
    riskScore: 9,
    liquidity: 'medium',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-012',
    cardName: '2022 Topps Chrome #1',
    player: 'Julio Rodriguez RC',
    sport: 'Baseball',
    year: 2022,
    set: 'Topps Chrome',
    category: 'ultra_modern',
    currentValue: 1800,
    purchasePrice: 950,
    annualReturn: 24.7,
    riskScore: 9,
    liquidity: 'medium',
    grade: 'PSA 10',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
  {
    id: 'va-013',
    cardName: '1993 SP Foil #279',
    player: 'Derek Jeter RC',
    sport: 'Baseball',
    year: 1993,
    set: 'SP',
    category: 'classic',
    currentValue: 22000,
    purchasePrice: 9500,
    annualReturn: 13.1,
    riskScore: 4,
    liquidity: 'high',
    grade: 'PSA 9',
    imageUrl: 'https://images.unsplash.com/photo-1612404459571-cbfb3e05e243?w=200',
  },
];

// ---- Persistence helpers ----

function loadItems(): AllocationItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [...DEFAULT_ITEMS];
}

function saveItems(items: AllocationItem[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

function loadTargets(): Record<AllocationCategory, number> {
  try {
    const raw = localStorage.getItem(TARGETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { ...DEFAULT_TARGETS };
}

function saveTargets(targets: Record<AllocationCategory, number>): void {
  localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
}

// ---- Exported Functions ----

export function getAllocationItems(): AllocationItem[] {
  return loadItems();
}

export function getAllocationTargets(): AllocationTarget[] {
  const items = loadItems();
  const targets = loadTargets();
  const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
  const categories: AllocationCategory[] = ['vintage', 'classic', 'modern', 'ultra_modern'];

  return categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    const catValue = catItems.reduce((s, i) => s + i.currentValue, 0);
    const actualPercent = totalValue > 0 ? (catValue / totalValue) * 100 : 0;
    const targetPercent = targets[cat];
    return {
      category: cat,
      targetPercent,
      actualPercent: Math.round(actualPercent * 100) / 100,
      deviation: Math.round((actualPercent - targetPercent) * 100) / 100,
      items: catItems,
    };
  });
}

export function getRiskReturnProfiles(): RiskReturnProfile[] {
  const items = loadItems();
  const categories: AllocationCategory[] = ['vintage', 'classic', 'modern', 'ultra_modern'];

  return categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length === 0) {
      return { category: cat, avgReturn: 0, avgRisk: 0, sharpeRatio: 0, maxDrawdown: 0, volatility: 0 };
    }
    const avgReturn = catItems.reduce((s, i) => s + i.annualReturn, 0) / catItems.length;
    const avgRisk = catItems.reduce((s, i) => s + i.riskScore, 0) / catItems.length;
    const riskFreeRate = 4.5;
    const volatility = avgRisk * 3.2; // simplified volatility proxy
    const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
    const maxDrawdown = -(avgRisk * 4.5); // simplified drawdown estimate

    return {
      category: cat,
      avgReturn: Math.round(avgReturn * 100) / 100,
      avgRisk: Math.round(avgRisk * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
    };
  });
}

export function getRebalanceActions(): RebalanceAction[] {
  const targets = getAllocationTargets();
  const actions: RebalanceAction[] = [];

  for (const t of targets) {
    const diff = t.actualPercent - t.targetPercent;
    if (Math.abs(diff) < 1) {
      actions.push({
        action: 'hold',
        category: t.category,
        amount: 0,
        reason: `${getCategoryLabel(t.category)} allocation is within 1% of target.`,
      });
    } else if (diff > 0) {
      const items = loadItems();
      const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
      const sellAmount = (diff / 100) * totalValue;
      actions.push({
        action: 'sell',
        category: t.category,
        amount: Math.round(sellAmount * 100) / 100,
        reason: `${getCategoryLabel(t.category)} is overweight by ${Math.abs(diff).toFixed(1)}%. Consider selling ${formatCurrency(sellAmount)} to realign.`,
      });
    } else {
      const items = loadItems();
      const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
      const buyAmount = (Math.abs(diff) / 100) * totalValue;
      actions.push({
        action: 'buy',
        category: t.category,
        amount: Math.round(buyAmount * 100) / 100,
        reason: `${getCategoryLabel(t.category)} is underweight by ${Math.abs(diff).toFixed(1)}%. Consider buying ${formatCurrency(buyAmount)} to realign.`,
      });
    }
  }

  return actions;
}

export function getAllocationStats(): AllocationStats {
  const items = loadItems();
  const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
  const totalCost = items.reduce((s, i) => s + i.purchasePrice, 0);

  const byCategory = (cat: AllocationCategory) => {
    const catValue = items.filter((i) => i.category === cat).reduce((s, i) => s + i.currentValue, 0);
    return totalValue > 0 ? Math.round((catValue / totalValue) * 10000) / 100 : 0;
  };

  const overallReturn = totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 10000) / 100 : 0;
  const avgRisk = items.length > 0
    ? Math.round((items.reduce((s, i) => s + i.riskScore, 0) / items.length) * 100) / 100
    : 0;

  return {
    totalValue,
    vintagePercent: byCategory('vintage'),
    classicPercent: byCategory('classic'),
    modernPercent: byCategory('modern'),
    ultraModernPercent: byCategory('ultra_modern'),
    overallReturn,
    riskScore: avgRisk,
    diversificationScore: getDiversificationScore(),
  };
}

export function setTargetAllocation(category: AllocationCategory, pct: number): void {
  const targets = loadTargets();
  targets[category] = Math.max(0, Math.min(100, pct));
  saveTargets(targets);
}

export function getHistoricalReturns(category?: AllocationCategory): HistoricalReturn[] {
  // Generate deterministic historical return data
  const baseReturns: Record<AllocationCategory, number[]> = {
    vintage: [8.2, 10.1, 6.5, 12.3, 9.8, 7.4, 11.2, 14.5, -2.1, 8.9, 10.5],
    classic: [6.1, 8.5, 5.2, 14.8, 11.3, 9.1, 7.8, 12.1, -5.3, 10.2, 13.4],
    modern: [12.5, 15.2, 8.3, 18.1, 14.7, -3.2, 11.4, 20.3, -8.1, 16.5, 19.2],
    ultra_modern: [25.3, 32.1, -12.5, 28.4, 18.9, -8.7, 22.5, 35.2, -15.3, 28.1, 30.5],
  };

  const startYear = 2015;
  const result: HistoricalReturn[] = [];

  for (let i = 0; i < baseReturns.vintage.length; i++) {
    result.push({
      year: startYear + i,
      vintage: baseReturns.vintage[i],
      classic: baseReturns.classic[i],
      modern: baseReturns.modern[i],
      ultra_modern: baseReturns.ultra_modern[i],
    });
  }

  return result;
}

export function getPortfolioRisk(): number {
  const items = loadItems();
  if (items.length === 0) return 0;
  const weightedRisk = items.reduce((s, i) => s + i.riskScore * i.currentValue, 0);
  const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
  return totalValue > 0 ? Math.round((weightedRisk / totalValue) * 100) / 100 : 0;
}

export function getDiversificationScore(): number {
  const items = loadItems();
  if (items.length === 0) return 0;

  const totalValue = items.reduce((s, i) => s + i.currentValue, 0);
  const categories: AllocationCategory[] = ['vintage', 'classic', 'modern', 'ultra_modern'];

  // Calculate how evenly spread the allocation is using entropy-like measure
  const percentages = categories.map((cat) => {
    const catValue = items.filter((i) => i.category === cat).reduce((s, i) => s + i.currentValue, 0);
    return totalValue > 0 ? catValue / totalValue : 0;
  });

  // Count how many categories are represented
  const activeCats = percentages.filter((p) => p > 0).length;
  if (activeCats <= 1) return Math.round((activeCats / 4) * 25);

  // Calculate normalized entropy (0 to 1)
  const entropy = -percentages
    .filter((p) => p > 0)
    .reduce((s, p) => s + p * Math.log(p), 0);
  const maxEntropy = Math.log(4); // max when evenly distributed
  const normalizedEntropy = entropy / maxEntropy;

  // Also factor in sport diversity
  const sports = new Set(items.map((i) => i.sport));
  const sportBonus = Math.min(sports.size * 5, 20);

  return Math.min(100, Math.round(normalizedEntropy * 80 + sportBonus));
}

export function getOptimalAllocation(riskTolerance: 'conservative' | 'moderate' | 'aggressive'): Record<AllocationCategory, number> {
  switch (riskTolerance) {
    case 'conservative':
      return { vintage: 40, classic: 35, modern: 20, ultra_modern: 5 };
    case 'moderate':
      return { vintage: 25, classic: 30, modern: 30, ultra_modern: 15 };
    case 'aggressive':
      return { vintage: 10, classic: 20, modern: 35, ultra_modern: 35 };
  }
}

// ---- Formatting & display helpers ----

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

export function getCategoryColor(cat: AllocationCategory): string {
  switch (cat) {
    case 'vintage': return '#f59e0b';
    case 'classic': return '#3b82f6';
    case 'modern': return '#10b981';
    case 'ultra_modern': return '#8b5cf6';
  }
}

export function getCategoryLabel(cat: AllocationCategory): string {
  switch (cat) {
    case 'vintage': return 'Vintage (Pre-1980)';
    case 'classic': return 'Classic (1980-1999)';
    case 'modern': return 'Modern (2000-2015)';
    case 'ultra_modern': return 'Ultra Modern (2016+)';
  }
}

export function getRiskColor(score: number): string {
  if (score <= 3) return '#10b981';
  if (score <= 6) return '#f59e0b';
  return '#ef4444';
}

export function getLiquidityColor(liq: 'high' | 'medium' | 'low'): string {
  switch (liq) {
    case 'high': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
  }
}
