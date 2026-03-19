import { CardInventory } from '../../types';

// ---- Types ----

export type AssetCategory =
  | 'cards'
  | 'memorabilia'
  | 'autographs'
  | 'sealed_wax'
  | 'sneakers'
  | 'watches'
  | 'sports_art'
  | 'wine';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface AlternativeAsset {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  lastValuationDate: string;
  condition: string;
  provenance?: string;
  imageUrl?: string;
  notes?: string;
  // Category-specific fields
  brand?: string;           // watches, sneakers
  model?: string;           // watches, sneakers
  size?: string;            // sneakers
  referenceNumber?: string; // watches
  artist?: string;          // sports_art
  medium?: string;          // sports_art
  vintage?: string;         // wine
  region?: string;          // wine
  rating?: number;          // wine
  player?: string;          // memorabilia, autographs
  sport?: string;           // memorabilia, autographs
  itemType?: string;        // memorabilia (jersey, helmet, bat, etc.)
  authenticated?: boolean;  // autographs, memorabilia
  authenticator?: string;   // autographs
  setName?: string;         // sealed_wax
  yearProduced?: number;    // sealed_wax
  productType?: string;     // sealed_wax (box, case, pack)
}

export interface CrossHobbyPortfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  cardAssets: CardPortfolioSummary;
  alternativeAssets: AlternativeAsset[];
  lastUpdated: string;
}

export interface CardPortfolioSummary {
  count: number;
  totalValue: number;
  totalCost: number;
}

export interface CategoryAllocation {
  category: AssetCategory;
  label: string;
  value: number;
  cost: number;
  count: number;
  percentage: number;
  gainLoss: number;
  gainLossPercent: number;
  color: string;
}

export interface CrossCategoryCorrelation {
  categoryA: AssetCategory;
  categoryB: AssetCategory;
  correlation: number;
  samplePeriod: string;
  confidence: number;
}

export interface DiversificationReport {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  herfindahlIndex: number;
  effectiveCategories: number;
  concentrationRisk: string;
  recommendations: DiversificationRecommendation[];
}

export interface DiversificationRecommendation {
  action: 'increase' | 'decrease' | 'add' | 'rebalance';
  category: AssetCategory;
  label: string;
  reason: string;
  targetAllocation: number;
  currentAllocation: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OptimalAllocation {
  category: AssetCategory;
  label: string;
  currentWeight: number;
  optimalWeight: number;
  delta: number;
  expectedReturn: number;
  riskContribution: number;
}

export interface CategoryPerformance {
  category: AssetCategory;
  label: string;
  return1m: number;
  return3m: number;
  return6m: number;
  return1y: number;
  return3y: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  color: string;
}

export interface RebalancingRecommendation {
  fromCategory: AssetCategory;
  fromLabel: string;
  toCategory: AssetCategory;
  toLabel: string;
  amount: number;
  reason: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AssetImportData {
  name: string;
  category: AssetCategory;
  description: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  condition: string;
  // optional category-specific
  brand?: string;
  model?: string;
  size?: string;
  referenceNumber?: string;
  artist?: string;
  medium?: string;
  vintage?: string;
  region?: string;
  rating?: number;
  player?: string;
  sport?: string;
  itemType?: string;
  authenticated?: boolean;
  authenticator?: string;
  setName?: string;
  yearProduced?: number;
  productType?: string;
  notes?: string;
}

// ---- Constants ----

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  cards: 'Trading Cards',
  memorabilia: 'Memorabilia',
  autographs: 'Autographs',
  sealed_wax: 'Sealed Wax',
  sneakers: 'Sneakers',
  watches: 'Watches',
  sports_art: 'Sports Art',
  wine: 'Fine Wine',
};

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  cards: '#84cc16',
  memorabilia: '#3b82f6',
  autographs: '#a855f7',
  sealed_wax: '#f59e0b',
  sneakers: '#ef4444',
  watches: '#06b6d4',
  sports_art: '#ec4899',
  wine: '#8b5cf6',
};

// ---- Mock Data: 30+ Alternative Assets ----

const MOCK_ALTERNATIVE_ASSETS: AlternativeAsset[] = [
  // Memorabilia (5)
  {
    id: 'mem-001', name: 'Michael Jordan Game-Worn Bulls Jersey (1997 Finals)', category: 'memorabilia',
    description: '1997 NBA Finals game-worn jersey with photomatch documentation',
    purchasePrice: 85000, purchaseDate: '2021-03-15', currentValue: 142000, lastValuationDate: '2025-12-01',
    condition: 'Game-worn', player: 'Michael Jordan', sport: 'Basketball', itemType: 'Jersey', authenticated: true,
  },
  {
    id: 'mem-002', name: 'Babe Ruth Signed Baseball (1932)', category: 'memorabilia',
    description: 'Official AL ball signed by Ruth with PSA/DNA full letter',
    purchasePrice: 42000, purchaseDate: '2020-08-10', currentValue: 58500, lastValuationDate: '2025-11-15',
    condition: 'VG-EX', player: 'Babe Ruth', sport: 'Baseball', itemType: 'Baseball', authenticated: true,
  },
  {
    id: 'mem-003', name: 'Tom Brady Super Bowl LI Helmet', category: 'memorabilia',
    description: 'Game-used helmet from the greatest comeback in Super Bowl history',
    purchasePrice: 62000, purchaseDate: '2022-01-20', currentValue: 78000, lastValuationDate: '2025-10-22',
    condition: 'Game-used', player: 'Tom Brady', sport: 'Football', itemType: 'Helmet', authenticated: true,
  },
  {
    id: 'mem-004', name: 'Wayne Gretzky Game-Used Hockey Stick (1985)', category: 'memorabilia',
    description: 'Signed Titan TPM game stick from record-breaking 1985 season',
    purchasePrice: 28000, purchaseDate: '2023-05-11', currentValue: 34500, lastValuationDate: '2025-12-05',
    condition: 'Game-used', player: 'Wayne Gretzky', sport: 'Hockey', itemType: 'Stick', authenticated: true,
  },
  {
    id: 'mem-005', name: 'Muhammad Ali Everlast Boxing Gloves (1975 Thrilla)', category: 'memorabilia',
    description: 'Fight-worn gloves from Thrilla in Manila with full provenance chain',
    purchasePrice: 120000, purchaseDate: '2019-11-05', currentValue: 195000, lastValuationDate: '2025-09-30',
    condition: 'Fight-worn', player: 'Muhammad Ali', sport: 'Boxing', itemType: 'Gloves', authenticated: true,
  },
  // Autographs (4)
  {
    id: 'auto-001', name: 'LeBron James Signed Rookie Photo (UDA)', category: 'autographs',
    description: '16x20 Cavaliers rookie photo, Upper Deck Authenticated',
    purchasePrice: 4500, purchaseDate: '2021-07-20', currentValue: 6200, lastValuationDate: '2025-11-10',
    condition: 'Mint', player: 'LeBron James', sport: 'Basketball', authenticated: true, authenticator: 'UDA',
  },
  {
    id: 'auto-002', name: 'Mickey Mantle Signed 8x10 (PSA/DNA)', category: 'autographs',
    description: 'Color 8x10 in Yankees uniform, PSA/DNA 9 auto grade',
    purchasePrice: 3200, purchaseDate: '2020-12-01', currentValue: 4800, lastValuationDate: '2025-10-15',
    condition: 'Near Mint', player: 'Mickey Mantle', sport: 'Baseball', authenticated: true, authenticator: 'PSA/DNA',
  },
  {
    id: 'auto-003', name: 'Kobe Bryant Signed Lakers Jersey (Panini)', category: 'autographs',
    description: 'Authentic Adidas Lakers jersey signed by Kobe, Panini COA',
    purchasePrice: 8500, purchaseDate: '2020-02-28', currentValue: 18500, lastValuationDate: '2025-12-01',
    condition: 'Mint', player: 'Kobe Bryant', sport: 'Basketball', authenticated: true, authenticator: 'Panini',
  },
  {
    id: 'auto-004', name: 'Derek Jeter Signed World Series Baseball', category: 'autographs',
    description: '2009 World Series baseball signed by Jeter, Steiner Sports COA',
    purchasePrice: 1800, purchaseDate: '2022-04-15', currentValue: 2400, lastValuationDate: '2025-11-20',
    condition: 'Near Mint', player: 'Derek Jeter', sport: 'Baseball', authenticated: true, authenticator: 'Steiner',
  },
  // Sealed Wax (4)
  {
    id: 'wax-001', name: '1986 Fleer Basketball Wax Box (BBCE Wrapped)', category: 'sealed_wax',
    description: 'BBCE authenticated sealed wax box, 36 packs, Jordan RC year',
    purchasePrice: 185000, purchaseDate: '2021-01-10', currentValue: 220000, lastValuationDate: '2025-12-01',
    condition: 'Sealed/BBCE', setName: '1986 Fleer Basketball', yearProduced: 1986, productType: 'box',
  },
  {
    id: 'wax-002', name: '2003 Topps Chrome Basketball Hobby Box', category: 'sealed_wax',
    description: 'Factory sealed hobby box, LeBron James rookie year',
    purchasePrice: 32000, purchaseDate: '2022-06-15', currentValue: 42000, lastValuationDate: '2025-11-30',
    condition: 'Factory Sealed', setName: '2003 Topps Chrome Basketball', yearProduced: 2003, productType: 'box',
  },
  {
    id: 'wax-003', name: '1993 SP Football Foil Box', category: 'sealed_wax',
    description: 'Factory sealed foil box, Derek Jeter SP rookie year equivalent for NFL',
    purchasePrice: 8500, purchaseDate: '2023-03-20', currentValue: 11200, lastValuationDate: '2025-10-10',
    condition: 'Factory Sealed', setName: '1993 SP Football', yearProduced: 1993, productType: 'box',
  },
  {
    id: 'wax-004', name: '2018 Panini Prizm Football Hobby Case', category: 'sealed_wax',
    description: '12-box hobby case, Josh Allen / Lamar Jackson rookie year',
    purchasePrice: 18000, purchaseDate: '2022-09-01', currentValue: 26500, lastValuationDate: '2025-11-25',
    condition: 'Factory Sealed', setName: '2018 Panini Prizm Football', yearProduced: 2018, productType: 'case',
  },
  // Sneakers (5)
  {
    id: 'snk-001', name: 'Air Jordan 1 OG "Chicago" (1985)', category: 'sneakers',
    description: 'Original 1985 release, size 10, very good condition',
    purchasePrice: 18000, purchaseDate: '2020-05-15', currentValue: 32000, lastValuationDate: '2025-12-01',
    condition: 'VG+', brand: 'Nike', model: 'Air Jordan 1 OG', size: '10',
  },
  {
    id: 'snk-002', name: 'Nike MAG "Back to the Future" (2016)', category: 'sneakers',
    description: 'Self-lacing Nike MAG, size 11, #328 of 89 pairs',
    purchasePrice: 48000, purchaseDate: '2021-10-20', currentValue: 65000, lastValuationDate: '2025-11-15',
    condition: 'DS (Deadstock)', brand: 'Nike', model: 'MAG', size: '11',
  },
  {
    id: 'snk-003', name: 'Travis Scott x Air Jordan 1 Low "Reverse Mocha"', category: 'sneakers',
    description: 'DS pair, size 10.5',
    purchasePrice: 1200, purchaseDate: '2023-07-20', currentValue: 1650, lastValuationDate: '2025-12-05',
    condition: 'DS', brand: 'Nike/Jordan', model: 'AJ1 Low x Travis Scott', size: '10.5',
  },
  {
    id: 'snk-004', name: 'Nike Dunk SB "Paris" (2003)', category: 'sneakers',
    description: 'Extremely rare Paris Dunk, size 9.5, VNDS',
    purchasePrice: 52000, purchaseDate: '2022-02-28', currentValue: 68000, lastValuationDate: '2025-10-30',
    condition: 'VNDS', brand: 'Nike', model: 'Dunk SB Low Paris', size: '9.5',
  },
  {
    id: 'snk-005', name: 'Adidas Yeezy 750 "OG Light Brown"', category: 'sneakers',
    description: 'First Yeezy 750 release, size 11, DS',
    purchasePrice: 2800, purchaseDate: '2021-04-10', currentValue: 3200, lastValuationDate: '2025-11-20',
    condition: 'DS', brand: 'Adidas', model: 'Yeezy 750', size: '11',
  },
  // Watches (5)
  {
    id: 'watch-001', name: 'Rolex Daytona "Paul Newman" 6239 (1968)', category: 'watches',
    description: 'Exotic dial Paul Newman Daytona, full set with box and papers',
    purchasePrice: 320000, purchaseDate: '2020-11-01', currentValue: 485000, lastValuationDate: '2025-12-01',
    condition: 'Excellent', brand: 'Rolex', model: 'Daytona', referenceNumber: '6239',
  },
  {
    id: 'watch-002', name: 'Patek Philippe Nautilus 5711/1A-010', category: 'watches',
    description: 'Blue dial Nautilus, final production year, full set',
    purchasePrice: 85000, purchaseDate: '2022-03-15', currentValue: 128000, lastValuationDate: '2025-11-20',
    condition: 'Excellent', brand: 'Patek Philippe', model: 'Nautilus', referenceNumber: '5711/1A-010',
  },
  {
    id: 'watch-003', name: 'Audemars Piguet Royal Oak "Jumbo" 15202ST', category: 'watches',
    description: 'Blue dial Jumbo Royal Oak, discontinued reference',
    purchasePrice: 72000, purchaseDate: '2021-08-20', currentValue: 95000, lastValuationDate: '2025-10-15',
    condition: 'Very Good', brand: 'Audemars Piguet', model: 'Royal Oak', referenceNumber: '15202ST',
  },
  {
    id: 'watch-004', name: 'Omega Speedmaster Professional "Moonwatch" (1969)', category: 'watches',
    description: 'Pre-moon caliber 321, same year as Apollo 11',
    purchasePrice: 38000, purchaseDate: '2023-01-10', currentValue: 52000, lastValuationDate: '2025-11-30',
    condition: 'Good+', brand: 'Omega', model: 'Speedmaster', referenceNumber: '145.012',
  },
  {
    id: 'watch-005', name: 'Cartier Tank Louis (1970s Yellow Gold)', category: 'watches',
    description: 'Vintage Tank Louis in 18k yellow gold, manual wind',
    purchasePrice: 15000, purchaseDate: '2022-09-05', currentValue: 19500, lastValuationDate: '2025-12-05',
    condition: 'Good', brand: 'Cartier', model: 'Tank Louis', referenceNumber: 'WGTA0010',
  },
  // Sports Art (4)
  {
    id: 'art-001', name: 'LeRoy Neiman "The Great Gretzky" Original Serigraph', category: 'sports_art',
    description: 'Signed and numbered serigraph, 208/300, framed',
    purchasePrice: 12000, purchaseDate: '2021-06-15', currentValue: 16500, lastValuationDate: '2025-11-01',
    condition: 'Excellent', artist: 'LeRoy Neiman', medium: 'Serigraph', player: 'Wayne Gretzky',
  },
  {
    id: 'art-002', name: 'Stephen Holland "Jordan — The Last Shot" Canvas', category: 'sports_art',
    description: 'Large-format giclee on canvas, signed by artist',
    purchasePrice: 8500, purchaseDate: '2022-02-01', currentValue: 11000, lastValuationDate: '2025-10-20',
    condition: 'Mint', artist: 'Stephen Holland', medium: 'Giclee on Canvas', player: 'Michael Jordan',
  },
  {
    id: 'art-003', name: 'Jolene Jessie "Serena Williams" Original Oil', category: 'sports_art',
    description: 'Original oil painting, 36x48, gallery provenance',
    purchasePrice: 5500, purchaseDate: '2023-04-10', currentValue: 7200, lastValuationDate: '2025-12-01',
    condition: 'Mint', artist: 'Jolene Jessie', medium: 'Oil on Canvas', player: 'Serena Williams',
  },
  {
    id: 'art-004', name: 'Shepard Fairey "Ali" Screen Print (AP)', category: 'sports_art',
    description: 'Artist proof screen print, signed/numbered, edition of 50 AP',
    purchasePrice: 6000, purchaseDate: '2020-09-22', currentValue: 9800, lastValuationDate: '2025-11-15',
    condition: 'Near Mint', artist: 'Shepard Fairey', medium: 'Screen Print', player: 'Muhammad Ali',
  },
  // Wine (4)
  {
    id: 'wine-001', name: '2005 Chateau Margaux (Case of 12)', category: 'wine',
    description: 'OWC, perfect provenance, stored at 55F',
    purchasePrice: 8400, purchaseDate: '2020-04-15', currentValue: 14200, lastValuationDate: '2025-12-01',
    condition: 'Pristine', vintage: '2005', region: 'Bordeaux', rating: 98,
  },
  {
    id: 'wine-002', name: '2010 Screaming Eagle Cabernet Sauvignon', category: 'wine',
    description: 'Single bottle, 100-point vintage, direct allocation',
    purchasePrice: 3800, purchaseDate: '2021-11-01', currentValue: 5600, lastValuationDate: '2025-11-20',
    condition: 'Pristine', vintage: '2010', region: 'Napa Valley', rating: 100,
  },
  {
    id: 'wine-003', name: '2015 Domaine de la Romanee-Conti (DRC) Romanee-Conti', category: 'wine',
    description: 'Single bottle, impeccable storage, original tissue',
    purchasePrice: 22000, purchaseDate: '2022-06-01', currentValue: 28500, lastValuationDate: '2025-10-30',
    condition: 'Pristine', vintage: '2015', region: 'Burgundy', rating: 99,
  },
  {
    id: 'wine-004', name: '2016 Penfolds Grange (3-pack)', category: 'wine',
    description: 'Three-bottle lot, Australian icon vintage',
    purchasePrice: 2400, purchaseDate: '2023-02-15', currentValue: 3100, lastValuationDate: '2025-11-10',
    condition: 'Excellent', vintage: '2016', region: 'South Australia', rating: 97,
  },
];

// ---- Helper Functions ----

function generateId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCategoryLabel(cat: AssetCategory): string {
  return CATEGORY_LABELS[cat];
}

function getCategoryColor(cat: AssetCategory): string {
  return CATEGORY_COLORS[cat];
}

// ---- Service Functions ----

/**
 * Combines card inventory with alternative hobby assets into a unified portfolio view.
 */
export function getUnifiedPortfolio(
  inventory: CardInventory[],
  alternativeAssets?: AlternativeAsset[]
): CrossHobbyPortfolio {
  const assets = alternativeAssets ?? MOCK_ALTERNATIVE_ASSETS;

  const cardTotal = inventory.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const cardCost = inventory.reduce((sum, c) => sum + c.purchasePrice, 0);

  const altTotal = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const altCost = assets.reduce((sum, a) => sum + a.purchasePrice, 0);

  const totalValue = cardTotal + altTotal;
  const totalCost = cardCost + altCost;

  return {
    totalValue,
    totalCost,
    totalGainLoss: totalValue - totalCost,
    totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    cardAssets: {
      count: inventory.length,
      totalValue: cardTotal,
      totalCost: cardCost,
    },
    alternativeAssets: assets,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Returns allocation breakdown by category with values and percentages.
 */
export function getCategoryAllocation(portfolio: CrossHobbyPortfolio): CategoryAllocation[] {
  const categoryMap = new Map<AssetCategory, { value: number; cost: number; count: number }>();

  // Cards
  categoryMap.set('cards', {
    value: portfolio.cardAssets.totalValue,
    cost: portfolio.cardAssets.totalCost,
    count: portfolio.cardAssets.count,
  });

  // Alternative assets by category
  for (const asset of portfolio.alternativeAssets) {
    const existing = categoryMap.get(asset.category) ?? { value: 0, cost: 0, count: 0 };
    existing.value += asset.currentValue;
    existing.cost += asset.purchasePrice;
    existing.count += 1;
    categoryMap.set(asset.category, existing);
  }

  const totalValue = portfolio.totalValue;

  const allocations: CategoryAllocation[] = [];
  for (const [category, data] of categoryMap.entries()) {
    if (data.value === 0 && data.count === 0) continue;
    allocations.push({
      category,
      label: getCategoryLabel(category),
      value: data.value,
      cost: data.cost,
      count: data.count,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      gainLoss: data.value - data.cost,
      gainLossPercent: data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0,
      color: getCategoryColor(category),
    });
  }

  return allocations.sort((a, b) => b.value - a.value);
}

/**
 * Correlation matrix between asset categories.
 * Uses realistic simulated correlations reflecting real-world hobby market dynamics.
 */
export function getCrossCategoryCorrelation(): CrossCategoryCorrelation[] {
  const categories: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];

  // Realistic correlation matrix (upper triangle)
  const correlationData: Record<string, number> = {
    'cards|memorabilia': 0.78,
    'cards|autographs': 0.72,
    'cards|sealed_wax': 0.85,
    'cards|sneakers': 0.35,
    'cards|watches': 0.18,
    'cards|sports_art': 0.55,
    'cards|wine': 0.08,
    'memorabilia|autographs': 0.82,
    'memorabilia|sealed_wax': 0.65,
    'memorabilia|sneakers': 0.28,
    'memorabilia|watches': 0.15,
    'memorabilia|sports_art': 0.62,
    'memorabilia|wine': 0.05,
    'autographs|sealed_wax': 0.58,
    'autographs|sneakers': 0.22,
    'autographs|watches': 0.12,
    'autographs|sports_art': 0.48,
    'autographs|wine': 0.03,
    'sealed_wax|sneakers': 0.30,
    'sealed_wax|watches': 0.14,
    'sealed_wax|sports_art': 0.42,
    'sealed_wax|wine': 0.06,
    'sneakers|watches': 0.42,
    'sneakers|sports_art': 0.18,
    'sneakers|wine': 0.10,
    'watches|sports_art': 0.25,
    'watches|wine': 0.38,
    'sports_art|wine': 0.22,
  };

  const results: CrossCategoryCorrelation[] = [];

  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      if (i === j) {
        results.push({
          categoryA: categories[i],
          categoryB: categories[j],
          correlation: 1.0,
          samplePeriod: '3Y',
          confidence: 1.0,
        });
      } else {
        const key = i < j
          ? `${categories[i]}|${categories[j]}`
          : `${categories[j]}|${categories[i]}`;
        const corr = correlationData[key] ?? 0;
        results.push({
          categoryA: categories[i],
          categoryB: categories[j],
          correlation: corr,
          samplePeriod: '3Y',
          confidence: 0.75 + Math.random() * 0.2,
        });
      }
    }
  }

  return results;
}

/**
 * Diversification score (0-100) with recommendations to reduce concentration.
 */
export function getDiversificationReport(portfolio: CrossHobbyPortfolio): DiversificationReport {
  const allocations = getCategoryAllocation(portfolio);
  const weights = allocations.map((a) => a.percentage / 100);

  // Herfindahl-Hirschman Index
  const hhi = weights.reduce((sum, w) => sum + w * w, 0);
  const effectiveN = hhi > 0 ? 1 / hhi : 0;

  // Score: perfectly diversified across 8 categories = 100
  const maxCategories = 8;
  const idealHHI = 1 / maxCategories;
  const rawScore = Math.max(0, Math.min(100, ((idealHHI / Math.max(hhi, 0.001)) * 100)));
  const score = Math.round(Math.min(rawScore, 100));

  let grade: DiversificationReport['grade'];
  if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'F';

  let concentrationRisk: string;
  if (score >= 70) concentrationRisk = 'Low — portfolio is well-diversified across hobby categories';
  else if (score >= 45) concentrationRisk = 'Moderate — some concentration in a few categories';
  else concentrationRisk = 'High — portfolio heavily concentrated in one or two categories';

  // Generate recommendations
  const recommendations: DiversificationRecommendation[] = [];

  // Find overweight categories
  const idealWeight = 100 / maxCategories;
  for (const alloc of allocations) {
    if (alloc.percentage > idealWeight * 2) {
      recommendations.push({
        action: 'decrease',
        category: alloc.category,
        label: alloc.label,
        reason: `${alloc.label} represents ${alloc.percentage.toFixed(1)}% of portfolio, well above ideal ${idealWeight.toFixed(0)}%`,
        targetAllocation: idealWeight * 1.5,
        currentAllocation: alloc.percentage,
        priority: alloc.percentage > idealWeight * 3 ? 'high' : 'medium',
      });
    }
  }

  // Find missing categories
  const presentCategories = new Set(allocations.map((a) => a.category));
  const allCategories: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];
  for (const cat of allCategories) {
    if (!presentCategories.has(cat)) {
      recommendations.push({
        action: 'add',
        category: cat,
        label: getCategoryLabel(cat),
        reason: `No exposure to ${getCategoryLabel(cat)} — adding this category would reduce correlation risk`,
        targetAllocation: idealWeight,
        currentAllocation: 0,
        priority: 'medium',
      });
    }
  }

  // Find underweight categories
  for (const alloc of allocations) {
    if (alloc.percentage > 0 && alloc.percentage < idealWeight * 0.3) {
      recommendations.push({
        action: 'increase',
        category: alloc.category,
        label: alloc.label,
        reason: `${alloc.label} is underweight at ${alloc.percentage.toFixed(1)}%, consider increasing to improve diversification`,
        targetAllocation: idealWeight,
        currentAllocation: alloc.percentage,
        priority: 'low',
      });
    }
  }

  return {
    score,
    grade,
    herfindahlIndex: hhi,
    effectiveCategories: Math.round(effectiveN * 10) / 10,
    concentrationRisk,
    recommendations: recommendations.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    }),
  };
}

/**
 * Markowitz-style optimal allocation across all hobby categories.
 */
export function getOptimalCrossHobbyAllocation(
  budget: number,
  riskTolerance: RiskTolerance
): OptimalAllocation[] {
  // Expected returns and risk by category (annualized, simulated)
  const categoryStats: Record<AssetCategory, { expectedReturn: number; volatility: number }> = {
    cards: { expectedReturn: 12.5, volatility: 28.0 },
    memorabilia: { expectedReturn: 9.8, volatility: 22.0 },
    autographs: { expectedReturn: 7.5, volatility: 18.0 },
    sealed_wax: { expectedReturn: 15.2, volatility: 35.0 },
    sneakers: { expectedReturn: 11.0, volatility: 32.0 },
    watches: { expectedReturn: 8.5, volatility: 15.0 },
    sports_art: { expectedReturn: 6.0, volatility: 20.0 },
    wine: { expectedReturn: 7.0, volatility: 10.0 },
  };

  // Risk-tolerance-adjusted optimal weights
  const optimalWeights: Record<RiskTolerance, Record<AssetCategory, number>> = {
    conservative: {
      cards: 0.12, memorabilia: 0.10, autographs: 0.10, sealed_wax: 0.05,
      sneakers: 0.05, watches: 0.25, sports_art: 0.08, wine: 0.25,
    },
    moderate: {
      cards: 0.22, memorabilia: 0.15, autographs: 0.10, sealed_wax: 0.12,
      sneakers: 0.10, watches: 0.15, sports_art: 0.06, wine: 0.10,
    },
    aggressive: {
      cards: 0.30, memorabilia: 0.12, autographs: 0.08, sealed_wax: 0.20,
      sneakers: 0.15, watches: 0.05, sports_art: 0.05, wine: 0.05,
    },
  };

  const weights = optimalWeights[riskTolerance];
  const categories: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];

  return categories.map((cat) => {
    const stats = categoryStats[cat];
    const optW = weights[cat];
    return {
      category: cat,
      label: getCategoryLabel(cat),
      currentWeight: 0, // Caller should overlay current portfolio
      optimalWeight: optW * 100,
      delta: optW * 100, // Without current context
      expectedReturn: stats.expectedReturn,
      riskContribution: stats.volatility * optW,
    };
  });
}

/**
 * Add a non-card asset with category-specific fields.
 */
export function importAlternativeAsset(data: AssetImportData): AlternativeAsset {
  const asset: AlternativeAsset = {
    id: generateId(),
    name: data.name,
    category: data.category,
    description: data.description,
    purchasePrice: data.purchasePrice,
    purchaseDate: data.purchaseDate,
    currentValue: data.currentValue,
    lastValuationDate: new Date().toISOString().split('T')[0],
    condition: data.condition,
    notes: data.notes,
    brand: data.brand,
    model: data.model,
    size: data.size,
    referenceNumber: data.referenceNumber,
    artist: data.artist,
    medium: data.medium,
    vintage: data.vintage,
    region: data.region,
    rating: data.rating,
    player: data.player,
    sport: data.sport,
    itemType: data.itemType,
    authenticated: data.authenticated,
    authenticator: data.authenticator,
    setName: data.setName,
    yearProduced: data.yearProduced,
    productType: data.productType,
  };

  return asset;
}

/**
 * Returns per-category performance for comparison.
 */
export function getCategoryPerformance(
  _timeframe: '1m' | '3m' | '6m' | '1y' | '3y' = '1y'
): CategoryPerformance[] {
  return [
    {
      category: 'cards', label: 'Trading Cards', color: CATEGORY_COLORS.cards,
      return1m: 2.1, return3m: 5.8, return6m: 8.4, return1y: 12.5, return3y: 38.2,
      volatility: 28.0, sharpeRatio: 0.45, maxDrawdown: -18.5,
    },
    {
      category: 'memorabilia', label: 'Memorabilia', color: CATEGORY_COLORS.memorabilia,
      return1m: 1.4, return3m: 3.2, return6m: 5.6, return1y: 9.8, return3y: 31.5,
      volatility: 22.0, sharpeRatio: 0.42, maxDrawdown: -14.2,
    },
    {
      category: 'autographs', label: 'Autographs', color: CATEGORY_COLORS.autographs,
      return1m: 0.8, return3m: 2.5, return6m: 4.1, return1y: 7.5, return3y: 22.8,
      volatility: 18.0, sharpeRatio: 0.38, maxDrawdown: -11.0,
    },
    {
      category: 'sealed_wax', label: 'Sealed Wax', color: CATEGORY_COLORS.sealed_wax,
      return1m: 3.2, return3m: 7.8, return6m: 11.2, return1y: 15.2, return3y: 52.0,
      volatility: 35.0, sharpeRatio: 0.43, maxDrawdown: -25.0,
    },
    {
      category: 'sneakers', label: 'Sneakers', color: CATEGORY_COLORS.sneakers,
      return1m: 1.8, return3m: 4.5, return6m: 6.8, return1y: 11.0, return3y: 28.5,
      volatility: 32.0, sharpeRatio: 0.34, maxDrawdown: -22.0,
    },
    {
      category: 'watches', label: 'Watches', color: CATEGORY_COLORS.watches,
      return1m: 0.9, return3m: 2.8, return6m: 4.5, return1y: 8.5, return3y: 26.0,
      volatility: 15.0, sharpeRatio: 0.55, maxDrawdown: -8.5,
    },
    {
      category: 'sports_art', label: 'Sports Art', color: CATEGORY_COLORS.sports_art,
      return1m: 0.5, return3m: 1.8, return6m: 3.2, return1y: 6.0, return3y: 18.5,
      volatility: 20.0, sharpeRatio: 0.28, maxDrawdown: -12.0,
    },
    {
      category: 'wine', label: 'Fine Wine', color: CATEGORY_COLORS.wine,
      return1m: 0.6, return3m: 2.0, return6m: 3.8, return1y: 7.0, return3y: 21.0,
      volatility: 10.0, sharpeRatio: 0.65, maxDrawdown: -6.0,
    },
  ];
}

/**
 * Cross-category rebalancing suggestions.
 */
export function getRebalancingRecommendations(portfolio: CrossHobbyPortfolio): RebalancingRecommendation[] {
  const allocations = getCategoryAllocation(portfolio);
  const performance = getCategoryPerformance();
  const idealWeight = 100 / 8;

  const recommendations: RebalancingRecommendation[] = [];

  // Find the most overweight and underweight
  const sorted = [...allocations].sort((a, b) => b.percentage - a.percentage);
  const overweight = sorted.filter((a) => a.percentage > idealWeight * 1.5);
  const underweight = sorted.filter((a) => a.percentage < idealWeight * 0.5).reverse();

  // Also consider categories not in portfolio
  const presentCats = new Set(allocations.map((a) => a.category));
  const allCats: AssetCategory[] = ['cards', 'memorabilia', 'autographs', 'sealed_wax', 'sneakers', 'watches', 'sports_art', 'wine'];
  const missing = allCats.filter((c) => !presentCats.has(c));

  for (const over of overweight) {
    // Pair with underweight categories
    for (const under of underweight) {
      const perf = performance.find((p) => p.category === under.category);
      const amount = Math.round((over.percentage - idealWeight) / 100 * portfolio.totalValue * 0.3);
      if (amount > 500) {
        recommendations.push({
          fromCategory: over.category,
          fromLabel: over.label,
          toCategory: under.category,
          toLabel: under.label,
          amount,
          reason: `${over.label} is overweight at ${over.percentage.toFixed(1)}%; ${under.label} is underweight with ${perf ? `${perf.sharpeRatio.toFixed(2)} Sharpe ratio` : 'growth potential'}`,
          expectedImpact: `Reduces concentration risk and improves risk-adjusted returns`,
          priority: over.percentage > idealWeight * 3 ? 'high' : 'medium',
        });
      }
    }

    // Pair with missing categories
    for (const miss of missing) {
      const perf = performance.find((p) => p.category === miss);
      const amount = Math.round((over.percentage - idealWeight) / 100 * portfolio.totalValue * 0.2);
      if (amount > 500) {
        recommendations.push({
          fromCategory: over.category,
          fromLabel: over.label,
          toCategory: miss,
          toLabel: getCategoryLabel(miss),
          amount,
          reason: `Adding ${getCategoryLabel(miss)} exposure reduces correlation risk (currently ${perf ? `${perf.return1y.toFixed(1)}% 1Y return` : 'no exposure'})`,
          expectedImpact: `Adds new uncorrelated return stream`,
          priority: 'medium',
        });
      }
    }
  }

  return recommendations.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  }).slice(0, 8);
}

/**
 * Get mock alternative assets for demo purposes.
 */
export function getMockAlternativeAssets(): AlternativeAsset[] {
  return [...MOCK_ALTERNATIVE_ASSETS];
}

/**
 * Get all category labels.
 */
export function getAllCategoryLabels(): Record<AssetCategory, string> {
  return { ...CATEGORY_LABELS };
}

/**
 * Get all category colors.
 */
export function getAllCategoryColors(): Record<AssetCategory, string> {
  return { ...CATEGORY_COLORS };
}
