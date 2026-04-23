// @ts-nocheck
// ---- Types ----

export type CollectibleCategory =
  | 'pokemon'
  | 'magic_the_gathering'
  | 'yugioh'
  | 'gpk'
  | 'marvel'
  | 'star_wars'
  | 'entertainment';

export interface NonSportsItem {
  id: string;
  name: string;
  category: CollectibleCategory;
  description: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  lastValuationDate: string;
  condition: string;
  graded: boolean;
  grade?: string;
  gradingCompany?: string;
  certNumber?: string;
  year?: number;
  setName?: string;
  rarity?: string;
  imageUrl?: string;
  notes?: string;
}

export interface CategoryMarketData {
  category: CollectibleCategory;
  label: string;
  totalMarketCap: number;
  volume24h: number;
  avgPrice: number;
  medianPrice: number;
  priceChange7d: number;
  priceChange30d: number;
  priceChange90d: number;
  activeListings: number;
  totalSales30d: number;
  topItem: string;
  topItemValue: number;
  color: string;
}

export interface CrossCategoryPortfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  categoryCount: number;
  itemCount: number;
  items: NonSportsItem[];
  lastUpdated: string;
}

export interface CategoryTrend {
  category: CollectibleCategory;
  label: string;
  month: string;
  avgPrice: number;
  volume: number;
  salesCount: number;
  color: string;
}

export interface UnifiedHolding {
  category: CollectibleCategory;
  label: string;
  itemCount: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  color: string;
}

interface CategoryCorrelation {
  categoryA: CollectibleCategory;
  categoryB: CollectibleCategory;
  labelA: string;
  labelB: string;
  correlation: number;
  samplePeriod: string;
  insight: string;
}

interface CategoryLeader {
  category: CollectibleCategory;
  label: string;
  topItems: { name: string; value: number; change30d: number }[];
  avgReturn: number;
  totalVolume: number;
  color: string;
}

// ---- Constants ----

const CATEGORY_LABELS: Record<CollectibleCategory, string> = {
  pokemon: 'Pokemon',
  magic_the_gathering: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
  gpk: 'Garbage Pail Kids',
  marvel: 'Marvel',
  star_wars: 'Star Wars',
  entertainment: 'Entertainment',
};

const CATEGORY_COLORS: Record<CollectibleCategory, string> = {
  pokemon: '#f59e0b',
  magic_the_gathering: '#8b5cf6',
  yugioh: '#ef4444',
  gpk: '#22c55e',
  marvel: '#3b82f6',
  star_wars: '#06b6d4',
  entertainment: '#ec4899',
};

// ---- Mock Data: 24 Non-Sports Items ----

const MOCK_ITEMS: NonSportsItem[] = [
  // Pokemon (5)
  {
    id: 'pkmn-001', name: '1999 Pokemon Base Set Charizard Holo #4', category: 'pokemon',
    description: 'PSA 10 Gem Mint 1st Edition Base Set Charizard, the holy grail of modern collectibles',
    purchasePrice: 185000, purchaseDate: '2021-08-15', currentValue: 265000, lastValuationDate: '2026-02-20',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '10234567',
    year: 1999, setName: 'Base Set 1st Edition', rarity: 'Holo Rare',
  },
  {
    id: 'pkmn-002', name: '2006 Pokemon EX Dragon Frontiers Charizard Star #100', category: 'pokemon',
    description: 'Gold Star Charizard, BGS 9.5 Gem Mint, extremely scarce pull',
    purchasePrice: 22000, purchaseDate: '2022-03-10', currentValue: 34500, lastValuationDate: '2026-02-18',
    condition: 'Gem Mint', graded: true, grade: 'BGS 9.5', gradingCompany: 'BGS', certNumber: '0045678912',
    year: 2006, setName: 'EX Dragon Frontiers', rarity: 'Gold Star',
  },
  {
    id: 'pkmn-003', name: '1999 Pokemon Base Set Pikachu Yellow Cheeks #58', category: 'pokemon',
    description: 'PSA 10 1st Edition Yellow Cheeks error variant, iconic piece',
    purchasePrice: 5500, purchaseDate: '2023-01-20', currentValue: 7800, lastValuationDate: '2026-01-15',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '10345678',
    year: 1999, setName: 'Base Set 1st Edition', rarity: 'Common',
  },
  {
    id: 'pkmn-004', name: '2002 Pokemon Legendary Collection Reverse Holo Charizard #3', category: 'pokemon',
    description: 'CGC 9 Mint, stunning galaxy/fireworks holo pattern',
    purchasePrice: 8200, purchaseDate: '2022-11-05', currentValue: 12500, lastValuationDate: '2026-02-10',
    condition: 'Mint', graded: true, grade: 'CGC 9', gradingCompany: 'CGC', certNumber: '4112345678',
    year: 2002, setName: 'Legendary Collection', rarity: 'Reverse Holo Rare',
  },
  {
    id: 'pkmn-005', name: '1997 Pokemon Illustrator Promo (Japanese)', category: 'pokemon',
    description: 'PSA 7 NM, one of fewer than 40 known copies worldwide',
    purchasePrice: 420000, purchaseDate: '2020-10-01', currentValue: 580000, lastValuationDate: '2026-02-25',
    condition: 'Near Mint', graded: true, grade: 'PSA 7', gradingCompany: 'PSA', certNumber: '10456789',
    year: 1997, setName: 'CoroCoro Promo', rarity: 'Promo',
  },
  // Magic: The Gathering (4)
  {
    id: 'mtg-001', name: 'MTG Alpha Black Lotus', category: 'magic_the_gathering',
    description: 'BGS 8.5 NM-MT+ Alpha Black Lotus, the most iconic TCG card ever printed',
    purchasePrice: 350000, purchaseDate: '2021-05-20', currentValue: 510000, lastValuationDate: '2026-02-22',
    condition: 'NM-MT+', graded: true, grade: 'BGS 8.5', gradingCompany: 'BGS', certNumber: '0056789123',
    year: 1993, setName: 'Alpha', rarity: 'Rare',
  },
  {
    id: 'mtg-002', name: 'MTG Beta Mox Sapphire', category: 'magic_the_gathering',
    description: 'PSA 9 Mint Beta Mox Sapphire, part of the Power Nine',
    purchasePrice: 42000, purchaseDate: '2022-07-15', currentValue: 58000, lastValuationDate: '2026-01-30',
    condition: 'Mint', graded: true, grade: 'PSA 9', gradingCompany: 'PSA', certNumber: '10567890',
    year: 1993, setName: 'Beta', rarity: 'Rare',
  },
  {
    id: 'mtg-003', name: 'MTG Alpha Ancestral Recall', category: 'magic_the_gathering',
    description: 'CGC 7 NM, another member of the Power Nine from the original print run',
    purchasePrice: 65000, purchaseDate: '2023-02-10', currentValue: 82000, lastValuationDate: '2026-02-15',
    condition: 'Near Mint', graded: true, grade: 'CGC 7', gradingCompany: 'CGC', certNumber: '4123456789',
    year: 1993, setName: 'Alpha', rarity: 'Rare',
  },
  {
    id: 'mtg-004', name: 'MTG Unlimited Underground Sea', category: 'magic_the_gathering',
    description: 'PSA 8 NM-MT, key dual land from Unlimited Edition',
    purchasePrice: 4800, purchaseDate: '2023-09-01', currentValue: 5600, lastValuationDate: '2026-02-05',
    condition: 'NM-MT', graded: true, grade: 'PSA 8', gradingCompany: 'PSA', certNumber: '10678901',
    year: 1993, setName: 'Unlimited', rarity: 'Rare',
  },
  // Yu-Gi-Oh! (3)
  {
    id: 'ygo-001', name: 'Yu-Gi-Oh! LOB Blue-Eyes White Dragon 1st Ed #001', category: 'yugioh',
    description: 'PSA 10 Gem Mint, Legend of Blue Eyes White Dragon 1st Edition',
    purchasePrice: 28000, purchaseDate: '2022-04-20', currentValue: 42000, lastValuationDate: '2026-02-12',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '10789012',
    year: 2002, setName: 'Legend of Blue Eyes White Dragon', rarity: 'Ultra Rare',
  },
  {
    id: 'ygo-002', name: 'Yu-Gi-Oh! LOB Dark Magician 1st Ed #005', category: 'yugioh',
    description: 'BGS 9.5 Gem Mint, the signature monster card of Yugi Muto',
    purchasePrice: 8500, purchaseDate: '2023-06-15', currentValue: 12800, lastValuationDate: '2026-01-28',
    condition: 'Gem Mint', graded: true, grade: 'BGS 9.5', gradingCompany: 'BGS', certNumber: '0067890123',
    year: 2002, setName: 'Legend of Blue Eyes White Dragon', rarity: 'Ultra Rare',
  },
  {
    id: 'ygo-003', name: 'Yu-Gi-Oh! Tournament Black Luster Soldier', category: 'yugioh',
    description: 'Ungraded Near Mint, stainless steel prize card from 1999 tournament',
    purchasePrice: 95000, purchaseDate: '2021-12-01', currentValue: 125000, lastValuationDate: '2026-02-20',
    condition: 'Near Mint', graded: false,
    year: 1999, setName: 'Tournament Prize', rarity: 'Promo',
  },
  // Garbage Pail Kids (3)
  {
    id: 'gpk-001', name: 'GPK 1985 Series 1 Adam Bomb #8a', category: 'gpk',
    description: 'PSA 10 Gem Mint, the iconic GPK card from the original series',
    purchasePrice: 12000, purchaseDate: '2022-02-14', currentValue: 18500, lastValuationDate: '2026-02-08',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '10890123',
    year: 1985, setName: 'Series 1', rarity: 'Base',
  },
  {
    id: 'gpk-002', name: 'GPK 1985 Series 1 Nasty Nick #1a', category: 'gpk',
    description: 'PSA 9 Mint, the very first GPK card ever issued',
    purchasePrice: 4200, purchaseDate: '2023-05-10', currentValue: 5800, lastValuationDate: '2026-01-22',
    condition: 'Mint', graded: true, grade: 'PSA 9', gradingCompany: 'PSA', certNumber: '10901234',
    year: 1985, setName: 'Series 1', rarity: 'Base',
  },
  {
    id: 'gpk-003', name: 'GPK 1985 Series 2 Uncut Sheet', category: 'gpk',
    description: 'Full uncut production sheet from Series 2, extremely rare factory artifact',
    purchasePrice: 6500, purchaseDate: '2023-08-20', currentValue: 8200, lastValuationDate: '2026-02-01',
    condition: 'Excellent', graded: false,
    year: 1985, setName: 'Series 2', rarity: 'Uncut Sheet',
  },
  // Marvel (3)
  {
    id: 'mrv-001', name: 'Marvel 1990 Impel Series 1 Spider-Man Hologram MH1', category: 'marvel',
    description: 'PSA 10 Gem Mint, the first Marvel hologram chase card ever produced',
    purchasePrice: 3200, purchaseDate: '2022-09-15', currentValue: 5100, lastValuationDate: '2026-02-14',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '11012345',
    year: 1990, setName: 'Marvel Universe Series 1', rarity: 'Hologram',
  },
  {
    id: 'mrv-002', name: 'Marvel 1992 SkyBox Masterpieces Wolverine #5', category: 'marvel',
    description: 'CGC 9.5 Gem Mint, Joe Jusko painted masterpiece card',
    purchasePrice: 1800, purchaseDate: '2023-04-01', currentValue: 2600, lastValuationDate: '2026-01-18',
    condition: 'Gem Mint', graded: true, grade: 'CGC 9.5', gradingCompany: 'CGC', certNumber: '4134567890',
    year: 1992, setName: 'Marvel Masterpieces', rarity: 'Base',
  },
  {
    id: 'mrv-003', name: 'Marvel 2022 Fleer Ultra X-Men Wolverine Auto /10', category: 'marvel',
    description: 'BGS 9.5 Gem Mint, on-card auto numbered to 10, modern grail',
    purchasePrice: 4500, purchaseDate: '2023-11-20', currentValue: 6200, lastValuationDate: '2026-02-05',
    condition: 'Gem Mint', graded: true, grade: 'BGS 9.5', gradingCompany: 'BGS', certNumber: '0078901234',
    year: 2022, setName: 'Fleer Ultra X-Men', rarity: 'Autograph',
  },
  // Star Wars (3)
  {
    id: 'sw-001', name: 'Star Wars 1977 Topps #1 Luke Skywalker', category: 'star_wars',
    description: 'PSA 10 Gem Mint, the card that launched the Star Wars collectible universe',
    purchasePrice: 15000, purchaseDate: '2021-11-10', currentValue: 22000, lastValuationDate: '2026-02-22',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '11123456',
    year: 1977, setName: 'Topps Star Wars Series 1', rarity: 'Base',
  },
  {
    id: 'sw-002', name: 'Star Wars 1977 Topps #207 C-3PO "Obscene" Error', category: 'star_wars',
    description: 'PSA 8 NM-MT, the legendary censored error card from the original Topps run',
    purchasePrice: 18000, purchaseDate: '2022-06-01', currentValue: 28000, lastValuationDate: '2026-01-25',
    condition: 'NM-MT', graded: true, grade: 'PSA 8', gradingCompany: 'PSA', certNumber: '11234567',
    year: 1977, setName: 'Topps Star Wars Series 3', rarity: 'Error',
  },
  {
    id: 'sw-003', name: 'Star Wars 2015 Topps Chrome Perspectives Kylo Ren Auto', category: 'star_wars',
    description: 'BGS 9.5/10 with a 10 auto grade, Adam Driver autograph, scarce modern key',
    purchasePrice: 2800, purchaseDate: '2023-03-15', currentValue: 3900, lastValuationDate: '2026-02-10',
    condition: 'Gem Mint', graded: true, grade: 'BGS 9.5', gradingCompany: 'BGS', certNumber: '0089012345',
    year: 2015, setName: 'Topps Chrome Perspectives', rarity: 'Autograph',
  },
  // Entertainment (3)
  {
    id: 'ent-001', name: '1984 Topps Ghostbusters Complete Set (Sealed Box)', category: 'entertainment',
    description: 'Factory sealed wax box of 36 packs, one of the last known sealed boxes',
    purchasePrice: 3500, purchaseDate: '2022-10-15', currentValue: 5200, lastValuationDate: '2026-02-18',
    condition: 'Factory Sealed', graded: false,
    year: 1984, setName: 'Topps Ghostbusters', rarity: 'Sealed Product',
  },
  {
    id: 'ent-002', name: '1991 Pro Set The Young Indiana Jones Chronicles Promo', category: 'entertainment',
    description: 'PSA 10 Gem Mint, ultra-rare convention-exclusive promo card',
    purchasePrice: 850, purchaseDate: '2023-07-20', currentValue: 1200, lastValuationDate: '2026-01-30',
    condition: 'Gem Mint', graded: true, grade: 'PSA 10', gradingCompany: 'PSA', certNumber: '11345678',
    year: 1991, setName: 'Pro Set Young Indiana Jones', rarity: 'Promo',
  },
  {
    id: 'ent-003', name: '2023 Topps Chrome Stranger Things Millie Bobby Brown Auto /25', category: 'entertainment',
    description: 'BGS 9.5 Gem Mint with 10 auto, numbered to 25, hottest modern entertainment card',
    purchasePrice: 3200, purchaseDate: '2024-01-10', currentValue: 4800, lastValuationDate: '2026-02-15',
    condition: 'Gem Mint', graded: true, grade: 'BGS 9.5', gradingCompany: 'BGS', certNumber: '0090123456',
    year: 2023, setName: 'Topps Chrome Stranger Things', rarity: 'Autograph',
  },
];

// ---- Mock Category Market Data ----

const MOCK_MARKET_DATA: CategoryMarketData[] = [
  {
    category: 'pokemon', label: 'Pokemon', color: CATEGORY_COLORS.pokemon,
    totalMarketCap: 12_800_000_000, volume24h: 18_500_000, avgPrice: 245, medianPrice: 42,
    priceChange7d: 3.2, priceChange30d: 8.5, priceChange90d: 14.2,
    activeListings: 2_850_000, totalSales30d: 485_000, topItem: 'Illustrator Pikachu PSA 10', topItemValue: 6_000_000,
  },
  {
    category: 'magic_the_gathering', label: 'Magic: The Gathering', color: CATEGORY_COLORS.magic_the_gathering,
    totalMarketCap: 8_200_000_000, volume24h: 12_400_000, avgPrice: 185, medianPrice: 28,
    priceChange7d: 1.8, priceChange30d: 5.2, priceChange90d: 9.8,
    activeListings: 4_200_000, totalSales30d: 620_000, topItem: 'Alpha Black Lotus PSA 10', topItemValue: 3_500_000,
  },
  {
    category: 'yugioh', label: 'Yu-Gi-Oh!', color: CATEGORY_COLORS.yugioh,
    totalMarketCap: 4_500_000_000, volume24h: 8_200_000, avgPrice: 85, medianPrice: 15,
    priceChange7d: 4.1, priceChange30d: 12.3, priceChange90d: 18.5,
    activeListings: 3_100_000, totalSales30d: 520_000, topItem: 'Tournament BLS Stainless Steel', topItemValue: 2_000_000,
  },
  {
    category: 'gpk', label: 'Garbage Pail Kids', color: CATEGORY_COLORS.gpk,
    totalMarketCap: 680_000_000, volume24h: 1_200_000, avgPrice: 65, medianPrice: 12,
    priceChange7d: 2.5, priceChange30d: 6.8, priceChange90d: 11.2,
    activeListings: 420_000, totalSales30d: 85_000, topItem: 'Adam Bomb PSA 10 (Glossy)', topItemValue: 35_000,
  },
  {
    category: 'marvel', label: 'Marvel', color: CATEGORY_COLORS.marvel,
    totalMarketCap: 1_800_000_000, volume24h: 3_500_000, avgPrice: 48, medianPrice: 8,
    priceChange7d: 1.2, priceChange30d: 4.5, priceChange90d: 7.8,
    activeListings: 890_000, totalSales30d: 145_000, topItem: '1990 Impel Hologram Set PSA 10', topItemValue: 12_000,
  },
  {
    category: 'star_wars', label: 'Star Wars', color: CATEGORY_COLORS.star_wars,
    totalMarketCap: 2_400_000_000, volume24h: 4_800_000, avgPrice: 72, medianPrice: 14,
    priceChange7d: 2.8, priceChange30d: 7.2, priceChange90d: 10.5,
    activeListings: 1_100_000, totalSales30d: 195_000, topItem: '1977 Topps #1 PSA 10', topItemValue: 45_000,
  },
  {
    category: 'entertainment', label: 'Entertainment', color: CATEGORY_COLORS.entertainment,
    totalMarketCap: 950_000_000, volume24h: 2_100_000, avgPrice: 35, medianPrice: 6,
    priceChange7d: 1.5, priceChange30d: 3.8, priceChange90d: 6.2,
    activeListings: 680_000, totalSales30d: 110_000, topItem: 'Stranger Things Auto /10 BGS 10', topItemValue: 8_500,
  },
];

// ---- Mock Trend Data (6 months) ----

const MONTHS = ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'];

function generateTrends(): CategoryTrend[] {
  const trends: CategoryTrend[] = [];
  const baseData: Record<CollectibleCategory, { basePrice: number; baseVolume: number; growth: number }> = {
    pokemon: { basePrice: 210, baseVolume: 14_000_000, growth: 1.025 },
    magic_the_gathering: { basePrice: 165, baseVolume: 10_500_000, growth: 1.018 },
    yugioh: { basePrice: 62, baseVolume: 6_200_000, growth: 1.032 },
    gpk: { basePrice: 52, baseVolume: 900_000, growth: 1.020 },
    marvel: { basePrice: 38, baseVolume: 2_800_000, growth: 1.012 },
    star_wars: { basePrice: 58, baseVolume: 3_800_000, growth: 1.022 },
    entertainment: { basePrice: 28, baseVolume: 1_600_000, growth: 1.015 },
  };

  for (const [cat, data] of Object.entries(baseData)) {
    const category = cat as CollectibleCategory;
    MONTHS.forEach((month, idx) => {
      const multiplier = Math.pow(data.growth, idx) * (0.95 + Math.random() * 0.1);
      trends.push({
        category,
        label: CATEGORY_LABELS[category],
        month,
        avgPrice: Math.round(data.basePrice * multiplier * 100) / 100,
        volume: Math.round(data.baseVolume * multiplier),
        salesCount: Math.round((data.baseVolume / data.basePrice) * multiplier * 0.15),
        color: CATEGORY_COLORS[category],
      });
    });
  }
  return trends;
}

const MOCK_TRENDS = generateTrends();

// ---- Helper ----

function generateId(): string {
  return `ns-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Service Functions ----

/**
 * Returns all supported non-sports collectible categories with labels and colors.
 */
export function getCategories(): { category: CollectibleCategory; label: string; color: string }[] {
  return (Object.keys(CATEGORY_LABELS) as CollectibleCategory[]).map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    color: CATEGORY_COLORS[cat],
  }));
}

/**
 * Returns market data for each non-sports collectible category.
 */
export function getCategoryMarketData(): CategoryMarketData[] {
  return [...MOCK_MARKET_DATA];
}

/**
 * Returns all non-sports collectible items, optionally filtered by category.
 */
export function getNonSportsItems(category?: CollectibleCategory): NonSportsItem[] {
  if (category) {
    return MOCK_ITEMS.filter((item) => item.category === category);
  }
  return [...MOCK_ITEMS];
}

/**
 * Returns a unified portfolio view across all non-sports collectible categories.
 */
export function getUnifiedPortfolio(): CrossCategoryPortfolio {
  const items = MOCK_ITEMS;
  const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
  const totalCost = items.reduce((sum, item) => sum + item.purchasePrice, 0);
  const categories = new Set(items.map((item) => item.category));

  return {
    totalValue,
    totalCost,
    totalGainLoss: totalValue - totalCost,
    totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    categoryCount: categories.size,
    itemCount: items.length,
    items,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Returns cross-category correlation analysis with insights.
 */
export function getCrossCategoryAnalysis(): CategoryCorrelation[] {
  const categories: CollectibleCategory[] = ['pokemon', 'magic_the_gathering', 'yugioh', 'gpk', 'marvel', 'star_wars', 'entertainment'];

  const correlationData: Record<string, { corr: number; insight: string }> = {
    'pokemon|magic_the_gathering': { corr: 0.72, insight: 'Both TCGs share collector base overlap and respond similarly to nostalgia trends' },
    'pokemon|yugioh': { corr: 0.68, insight: 'TCG siblings with strong Japanese anime-driven collector overlap' },
    'pokemon|gpk': { corr: 0.25, insight: 'Minimal correlation — different collector demographics and eras' },
    'pokemon|marvel': { corr: 0.42, insight: 'Moderate pop-culture correlation, both benefit from media releases' },
    'pokemon|star_wars': { corr: 0.38, insight: 'Moderate nostalgia factor overlap but distinct collector pools' },
    'pokemon|entertainment': { corr: 0.45, insight: 'Entertainment media cycles influence both categories similarly' },
    'magic_the_gathering|yugioh': { corr: 0.65, insight: 'Strong TCG market correlation with competitive play driving values' },
    'magic_the_gathering|gpk': { corr: 0.18, insight: 'Very low correlation — essentially independent markets' },
    'magic_the_gathering|marvel': { corr: 0.35, insight: 'Some crossover through gaming/geek culture collector base' },
    'magic_the_gathering|star_wars': { corr: 0.30, insight: 'Limited correlation, though geek culture trends can influence both' },
    'magic_the_gathering|entertainment': { corr: 0.32, insight: 'Modest correlation via shared pop-culture collector interest' },
    'yugioh|gpk': { corr: 0.15, insight: 'Nearly uncorrelated — excellent diversification pairing' },
    'yugioh|marvel': { corr: 0.48, insight: 'Moderate correlation through anime/comic crossover audiences' },
    'yugioh|star_wars': { corr: 0.28, insight: 'Low correlation — different era demographics' },
    'yugioh|entertainment': { corr: 0.40, insight: 'Some entertainment media overlap drives modest correlation' },
    'gpk|marvel': { corr: 0.22, insight: 'Low correlation — GPK is a niche nostalgia play vs. mainstream Marvel' },
    'gpk|star_wars': { corr: 0.35, insight: 'Both share 1980s nostalgia wave collector behavior' },
    'gpk|entertainment': { corr: 0.28, insight: 'Limited overlap — GPK driven by vintage rarity, entertainment by media hype' },
    'marvel|star_wars': { corr: 0.62, insight: 'Strong correlation via shared Disney/MCU media cycles and collector overlap' },
    'marvel|entertainment': { corr: 0.70, insight: 'High correlation — both driven by film and TV release schedules' },
    'star_wars|entertainment': { corr: 0.58, insight: 'Solid correlation — franchise media events drive both markets' },
  };

  const results: CategoryCorrelation[] = [];

  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const key = `${categories[i]}|${categories[j]}`;
      const data = correlationData[key];
      if (data) {
        results.push({
          categoryA: categories[i],
          categoryB: categories[j],
          labelA: CATEGORY_LABELS[categories[i]],
          labelB: CATEGORY_LABELS[categories[j]],
          correlation: data.corr,
          samplePeriod: '3Y',
          insight: data.insight,
        });
      }
    }
  }

  return results;
}

/**
 * Returns category-level trend data over 6 months.
 */
export function getCategoryTrends(category?: CollectibleCategory): CategoryTrend[] {
  if (category) {
    return MOCK_TRENDS.filter((t) => t.category === category);
  }
  return [...MOCK_TRENDS];
}

/**
 * Adds a new non-sports collectible item and returns it.
 */
export function addNonSportsItem(data: Omit<NonSportsItem, 'id' | 'lastValuationDate'>): NonSportsItem {
  const newItem: NonSportsItem = {
    ...data,
    id: generateId(),
    lastValuationDate: new Date().toISOString().split('T')[0],
  };
  MOCK_ITEMS.push(newItem);
  return newItem;
}

/**
 * Returns leader boards per category with top items and performance.
 */
export function getCategoryLeaders(): CategoryLeader[] {
  const categories = getCategories();

  return categories.map(({ category, label, color }) => {
    const items = MOCK_ITEMS.filter((i) => i.category === category);
    const sortedByValue = [...items].sort((a, b) => b.currentValue - a.currentValue);

    const topItems = sortedByValue.slice(0, 3).map((item) => ({
      name: item.name,
      value: item.currentValue,
      change30d: item.purchasePrice > 0
        ? ((item.currentValue - item.purchasePrice) / item.purchasePrice) * 100 * (0.08 + Math.random() * 0.04)
        : 0,
    }));

    const totalCost = items.reduce((sum, i) => sum + i.purchasePrice, 0);
    const totalValue = items.reduce((sum, i) => sum + i.currentValue, 0);
    const avgReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    const marketData = MOCK_MARKET_DATA.find((m) => m.category === category);
    const totalVolume = marketData?.volume24h ?? 0;

    return {
      category,
      label,
      topItems,
      avgReturn: Math.round(avgReturn * 10) / 10,
      totalVolume,
      color,
    };
  });
}
