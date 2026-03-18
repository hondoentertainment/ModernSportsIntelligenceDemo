/**
 * Phase 98: Vintage Market Scanner & Historical Intelligence
 * Specialized vintage card (pre-1980) intelligence — condition census tracking,
 * registry set competition, historical significance scoring, and generational
 * wealth preservation metrics. The "Sotheby's intelligence desk" for vintage sports cards.
 */

export interface VintageCard {
  id: string;
  player: string;
  year: number;
  set: string;
  manufacturer: string;
  conditionCensus: {
    population: number;
    rank: number;
    totalGraded: number;
    highestKnown: string;
  };
  historicalSignificance: number; // 0-100
  investmentGrade: 'museum' | 'investment' | 'collector' | 'entry';
  currentValue: number;
  appreciation5yr: number; // %
  appreciation10yr: number; // %
  registrySetCompletion: number; // %
  era: 'pre_war' | 'post_war' | 'golden_age' | 'silver_age' | 'bronze_age';
}

export interface RegistrySet {
  id: string;
  name: string;
  description: string;
  totalCards: number;
  ownedCards: number;
  completion: number; // %
  gpa: number;
  rank: number;
  competitors: number;
  value: number;
}

export interface VintageMarketTrend {
  era: string;
  trend: 'appreciating' | 'stable' | 'softening';
  avgReturn1yr: number;
  avgReturn5yr: number;
  topPerformer: string;
  liquidityScore: number;
}

export interface ConditionCensus {
  cardId: string;
  population: { grade: string; count: number; rank: number }[];
  totalGraded: number;
  keyDates: { date: string; event: string; impact: string }[];
}

export interface VintageStats {
  totalVintageValue: number;
  avgAge: number;
  oldestCard: string;
  highestValueCard: string;
  portfolioAppreciation: number;
  registrySets: number;
}

const STORAGE_KEYS = {
  VINTAGE_CARDS: 'msi_vintage_cards',
  REGISTRY_SETS: 'msi_vintage_registry_sets',
  MARKET_TRENDS: 'msi_vintage_market_trends',
  CONDITION_CENSUS: 'msi_vintage_condition_census',
};

function loadOrInit<T>(key: string, init: () => T): T {
  try {
    const stored = store.get(key, null);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore localStorage errors */ }
  const data = init();
  store.set(key, data);
  return data;
}

function buildVintageCards(): VintageCard[] {
  return [
    {
      id: 'vc-001',
      player: 'Mickey Mantle',
      year: 1952,
      set: 'Topps #311',
      manufacturer: 'Topps',
      conditionCensus: { population: 3, rank: 1, totalGraded: 1842, highestKnown: 'PSA 9' },
      historicalSignificance: 99,
      investmentGrade: 'museum',
      currentValue: 4800000,
      appreciation5yr: 142,
      appreciation10yr: 385,
      registrySetCompletion: 72,
      era: 'golden_age',
    },
    {
      id: 'vc-002',
      player: 'Babe Ruth',
      year: 1933,
      set: 'Goudey #53',
      manufacturer: 'Goudey',
      conditionCensus: { population: 1, rank: 1, totalGraded: 1267, highestKnown: 'PSA 8.5' },
      historicalSignificance: 100,
      investmentGrade: 'museum',
      currentValue: 3200000,
      appreciation5yr: 118,
      appreciation10yr: 320,
      registrySetCompletion: 58,
      era: 'pre_war',
    },
    {
      id: 'vc-003',
      player: 'Roberto Clemente',
      year: 1955,
      set: 'Topps #164',
      manufacturer: 'Topps',
      conditionCensus: { population: 6, rank: 3, totalGraded: 2104, highestKnown: 'PSA 9' },
      historicalSignificance: 92,
      investmentGrade: 'museum',
      currentValue: 475000,
      appreciation5yr: 88,
      appreciation10yr: 210,
      registrySetCompletion: 81,
      era: 'golden_age',
    },
    {
      id: 'vc-004',
      player: 'Reggie Jackson',
      year: 1969,
      set: 'Topps #260',
      manufacturer: 'Topps',
      conditionCensus: { population: 12, rank: 5, totalGraded: 3891, highestKnown: 'PSA 10' },
      historicalSignificance: 78,
      investmentGrade: 'investment',
      currentValue: 125000,
      appreciation5yr: 62,
      appreciation10yr: 155,
      registrySetCompletion: 65,
      era: 'silver_age',
    },
    {
      id: 'vc-005',
      player: 'Willie Mays',
      year: 1952,
      set: 'Topps #261',
      manufacturer: 'Topps',
      conditionCensus: { population: 5, rank: 2, totalGraded: 1654, highestKnown: 'PSA 8.5' },
      historicalSignificance: 95,
      investmentGrade: 'museum',
      currentValue: 318000,
      appreciation5yr: 95,
      appreciation10yr: 245,
      registrySetCompletion: 70,
      era: 'golden_age',
    },
    {
      id: 'vc-006',
      player: 'Hank Aaron',
      year: 1954,
      set: 'Topps #128',
      manufacturer: 'Topps',
      conditionCensus: { population: 8, rank: 4, totalGraded: 2987, highestKnown: 'PSA 9' },
      historicalSignificance: 93,
      investmentGrade: 'investment',
      currentValue: 395000,
      appreciation5yr: 76,
      appreciation10yr: 190,
      registrySetCompletion: 77,
      era: 'golden_age',
    },
    {
      id: 'vc-007',
      player: 'Lou Gehrig',
      year: 1933,
      set: 'Goudey #92',
      manufacturer: 'Goudey',
      conditionCensus: { population: 2, rank: 1, totalGraded: 891, highestKnown: 'PSA 8' },
      historicalSignificance: 96,
      investmentGrade: 'museum',
      currentValue: 1150000,
      appreciation5yr: 105,
      appreciation10yr: 275,
      registrySetCompletion: 45,
      era: 'pre_war',
    },
    {
      id: 'vc-008',
      player: 'Sandy Koufax',
      year: 1955,
      set: 'Topps #123',
      manufacturer: 'Topps',
      conditionCensus: { population: 9, rank: 4, totalGraded: 2543, highestKnown: 'PSA 9' },
      historicalSignificance: 85,
      investmentGrade: 'investment',
      currentValue: 210000,
      appreciation5yr: 68,
      appreciation10yr: 165,
      registrySetCompletion: 83,
      era: 'golden_age',
    },
    {
      id: 'vc-009',
      player: 'Ty Cobb',
      year: 1911,
      set: 'T206',
      manufacturer: 'American Tobacco',
      conditionCensus: { population: 1, rank: 1, totalGraded: 432, highestKnown: 'PSA 7' },
      historicalSignificance: 97,
      investmentGrade: 'museum',
      currentValue: 780000,
      appreciation5yr: 110,
      appreciation10yr: 290,
      registrySetCompletion: 32,
      era: 'pre_war',
    },
    {
      id: 'vc-010',
      player: 'Nolan Ryan',
      year: 1968,
      set: 'Topps #177',
      manufacturer: 'Topps',
      conditionCensus: { population: 18, rank: 8, totalGraded: 5124, highestKnown: 'PSA 10' },
      historicalSignificance: 82,
      investmentGrade: 'investment',
      currentValue: 285000,
      appreciation5yr: 58,
      appreciation10yr: 140,
      registrySetCompletion: 71,
      era: 'silver_age',
    },
    {
      id: 'vc-011',
      player: 'Honus Wagner',
      year: 1909,
      set: 'T206',
      manufacturer: 'American Tobacco',
      conditionCensus: { population: 1, rank: 1, totalGraded: 61, highestKnown: 'PSA 5' },
      historicalSignificance: 100,
      investmentGrade: 'museum',
      currentValue: 7250000,
      appreciation5yr: 165,
      appreciation10yr: 420,
      registrySetCompletion: 28,
      era: 'pre_war',
    },
    {
      id: 'vc-012',
      player: 'Pete Rose',
      year: 1963,
      set: 'Topps #537',
      manufacturer: 'Topps',
      conditionCensus: { population: 14, rank: 6, totalGraded: 4215, highestKnown: 'PSA 10' },
      historicalSignificance: 74,
      investmentGrade: 'collector',
      currentValue: 95000,
      appreciation5yr: 42,
      appreciation10yr: 115,
      registrySetCompletion: 88,
      era: 'silver_age',
    },
  ];
}

function buildRegistrySets(): RegistrySet[] {
  return [
    {
      id: 'rs-001',
      name: '1952 Topps Complete Set',
      description: 'The holy grail of post-war collecting — 407 cards including Mantle and Mays rookies',
      totalCards: 407,
      ownedCards: 293,
      completion: 72,
      gpa: 6.8,
      rank: 14,
      competitors: 187,
      value: 6250000,
    },
    {
      id: 'rs-002',
      name: '1933 Goudey Complete Set',
      description: 'Pre-war masterpiece featuring Ruth, Gehrig, and the legendary #106 Napoleon Lajoie',
      totalCards: 240,
      ownedCards: 139,
      completion: 58,
      gpa: 5.2,
      rank: 22,
      competitors: 98,
      value: 5100000,
    },
    {
      id: 'rs-003',
      name: 'T206 White Border Master Set',
      description: 'The most iconic tobacco card set — 524 subjects with the legendary Wagner',
      totalCards: 524,
      ownedCards: 168,
      completion: 32,
      gpa: 4.1,
      rank: 45,
      competitors: 312,
      value: 9800000,
    },
    {
      id: 'rs-004',
      name: '1955 Topps Baseball Complete',
      description: 'Featuring Clemente and Koufax rookies in a landmark horizontal design',
      totalCards: 206,
      ownedCards: 169,
      completion: 82,
      gpa: 7.3,
      rank: 8,
      competitors: 145,
      value: 1850000,
    },
    {
      id: 'rs-005',
      name: '1969 Topps Baseball Complete',
      description: 'Silver age classic with Reggie Jackson RC and the first "man on the moon" era cards',
      totalCards: 664,
      ownedCards: 432,
      completion: 65,
      gpa: 7.8,
      rank: 11,
      competitors: 234,
      value: 780000,
    },
  ];
}

function buildMarketTrends(): VintageMarketTrend[] {
  return [
    {
      era: 'Pre-War (1900-1941)',
      trend: 'appreciating',
      avgReturn1yr: 18.5,
      avgReturn5yr: 112,
      topPerformer: '1909 T206 Wagner',
      liquidityScore: 62,
    },
    {
      era: 'Post-War (1942-1955)',
      trend: 'appreciating',
      avgReturn1yr: 14.2,
      avgReturn5yr: 95,
      topPerformer: '1952 Topps Mantle',
      liquidityScore: 78,
    },
    {
      era: 'Golden Age (1956-1965)',
      trend: 'stable',
      avgReturn1yr: 8.7,
      avgReturn5yr: 68,
      topPerformer: '1955 Topps Clemente RC',
      liquidityScore: 82,
    },
    {
      era: 'Silver Age (1966-1974)',
      trend: 'stable',
      avgReturn1yr: 6.4,
      avgReturn5yr: 52,
      topPerformer: '1968 Topps Ryan RC',
      liquidityScore: 88,
    },
    {
      era: 'Bronze Age (1975-1980)',
      trend: 'softening',
      avgReturn1yr: 3.1,
      avgReturn5yr: 28,
      topPerformer: '1975 Topps Brett RC',
      liquidityScore: 91,
    },
  ];
}

function buildConditionCensusData(): Record<string, ConditionCensus> {
  return {
    'vc-001': {
      cardId: 'vc-001',
      population: [
        { grade: 'PSA 10', count: 0, rank: 0 },
        { grade: 'PSA 9', count: 3, rank: 1 },
        { grade: 'PSA 8.5', count: 6, rank: 4 },
        { grade: 'PSA 8', count: 22, rank: 10 },
        { grade: 'PSA 7', count: 48, rank: 32 },
        { grade: 'PSA 6', count: 87, rank: 80 },
        { grade: 'PSA 5', count: 134, rank: 167 },
        { grade: 'PSA 4', count: 201, rank: 368 },
        { grade: 'PSA 3', count: 312, rank: 680 },
        { grade: 'PSA 2', count: 428, rank: 992 },
        { grade: 'PSA 1', count: 601, rank: 1420 },
      ],
      totalGraded: 1842,
      keyDates: [
        { date: '2022-08-28', event: 'PSA 9.5 sold at Heritage Auctions', impact: 'Record $12.6M sale' },
        { date: '2021-01-14', event: 'PSA 9 sold privately', impact: 'Established $5.2M floor' },
        { date: '2018-04-20', event: 'SGC 8.5 crossed to PSA 8', impact: 'Population shift noted' },
        { date: '2016-11-30', event: 'New PSA 8 discovered', impact: 'Population +1 at high grade' },
      ],
    },
    'vc-002': {
      cardId: 'vc-002',
      population: [
        { grade: 'PSA 9', count: 0, rank: 0 },
        { grade: 'PSA 8.5', count: 1, rank: 1 },
        { grade: 'PSA 8', count: 4, rank: 2 },
        { grade: 'PSA 7', count: 18, rank: 6 },
        { grade: 'PSA 6', count: 42, rank: 24 },
        { grade: 'PSA 5', count: 98, rank: 66 },
        { grade: 'PSA 4', count: 187, rank: 164 },
        { grade: 'PSA 3', count: 289, rank: 351 },
        { grade: 'PSA 2', count: 341, rank: 640 },
        { grade: 'PSA 1', count: 287, rank: 927 },
      ],
      totalGraded: 1267,
      keyDates: [
        { date: '2023-05-18', event: 'PSA 8 sold at Goldin Auctions', impact: '$4.2M realized price' },
        { date: '2020-12-01', event: 'Ruth market surge', impact: 'All grades up 25%' },
        { date: '2019-06-15', event: 'New PSA 7 discovered', impact: 'Modest population increase' },
      ],
    },
    'vc-011': {
      cardId: 'vc-011',
      population: [
        { grade: 'PSA 5', count: 1, rank: 1 },
        { grade: 'PSA 4', count: 2, rank: 2 },
        { grade: 'PSA 3', count: 5, rank: 4 },
        { grade: 'PSA 2', count: 12, rank: 9 },
        { grade: 'PSA 1', count: 22, rank: 21 },
        { grade: 'Authentic', count: 19, rank: 43 },
      ],
      totalGraded: 61,
      keyDates: [
        { date: '2022-09-10', event: 'SGC 3 sold at Robert Edward Auctions', impact: '$7.25M — record for any card' },
        { date: '2021-08-15', event: 'Private sale of PSA 2', impact: '$3.75M — strong demand' },
        { date: '2016-04-06', event: 'PSA 5 sold at Goldin', impact: '$3.12M at the time' },
      ],
    },
  };
}

export function getVintageCards(): VintageCard[] {
  return loadOrInit(STORAGE_KEYS.VINTAGE_CARDS, buildVintageCards);
}

export function getRegistrySets(): RegistrySet[] {
  return loadOrInit(STORAGE_KEYS.REGISTRY_SETS, buildRegistrySets);
}

export function getVintageMarketTrends(): VintageMarketTrend[] {
  return loadOrInit(STORAGE_KEYS.MARKET_TRENDS, buildMarketTrends);
}

export function getConditionCensus(cardId: string): ConditionCensus | null {
  const allCensus = loadOrInit(STORAGE_KEYS.CONDITION_CENSUS, buildConditionCensusData);
  return allCensus[cardId] ?? null;
}

// ---- Page-compatible types & adapters (used by VintageMarket page) ----

export interface EraIndex {
  id: string;
  era: string;
  indexValue: number;
  change1yr: number;
  change5yr: number;
  totalCards: number;
  avgGrade: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EraPerformancePoint {
  month: string;
  preWar: number;
  postWar: number;
  goldenAge: number;
  silverAge: number;
  bronzeAge: number;
}

export interface EraMarketCap {
  era: string;
  marketCap: number;
  share: number;
  color: string;
}

export interface NotableSet {
  id: string;
  name: string;
  era: string;
  year: number;
  totalCards: number;
  keyCard: string;
  setValue: number;
  trend: string;
}

export interface PopulationEntry {
  grade: string;
  count: number;
  percentage: number;
}

export interface AuctionRecord {
  id: string;
  card: string;
  grade: string;
  price: number;
  date: string;
  house: string;
  era: string;
}

export interface SignificanceRating {
  id: string;
  card: string;
  era: string;
  historicalScore: number;
  culturalScore: number;
  rarityScore: number;
  overallRating: number;
}

export interface VintageMarketSummary {
  totalMarketValue: number;
  totalCards: number;
  avgAppreciation1yr: number;
  avgAppreciation5yr: number;
  topPerformingEra: string;
  mostActiveEra: string;
}

export function getEraIndices(): EraIndex[] {
  const trends = getVintageMarketTrends();
  return trends.map((t, i) => ({
    id: `ei-${i + 1}`,
    era: t.era,
    indexValue: 1000 + t.avgReturn5yr * 10,
    change1yr: t.avgReturn1yr,
    change5yr: t.avgReturn5yr,
    totalCards: 200 + i * 50,
    avgGrade: 5.5 + i * 0.4,
    trend: t.trend === 'appreciating' ? 'up' as const : t.trend === 'softening' ? 'down' as const : 'stable' as const,
  }));
}

export function getEraPerformanceHistory(): EraPerformancePoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    preWar: 1100 + Math.sin(i / 2) * 50 + i * 8,
    postWar: 1000 + Math.cos(i / 3) * 40 + i * 6,
    goldenAge: 900 + Math.sin(i / 4) * 30 + i * 4,
    silverAge: 800 + Math.cos(i / 2) * 25 + i * 3,
    bronzeAge: 700 + Math.sin(i / 3) * 20 + i * 2,
  }));
}

export function getEraMarketCaps(): EraMarketCap[] {
  return [
    { era: 'Pre-War', marketCap: 18500000, share: 35, color: '#f59e0b' },
    { era: 'Post-War', marketCap: 12200000, share: 23, color: '#3b82f6' },
    { era: 'Golden Age', marketCap: 9800000, share: 18, color: '#10b981' },
    { era: 'Silver Age', marketCap: 8100000, share: 15, color: '#8b5cf6' },
    { era: 'Bronze Age', marketCap: 4700000, share: 9, color: '#ef4444' },
  ];
}

export function getNotableSets(): NotableSet[] {
  const sets = getRegistrySets();
  return sets.map(s => ({
    id: s.id,
    name: s.name,
    era: s.name.includes('T206') ? 'Pre-War' : s.name.includes('1933') ? 'Pre-War' : 'Post-War',
    year: parseInt(s.name.match(/\d{4}/)?.[0] || '1952'),
    totalCards: s.totalCards,
    keyCard: s.description.split('—')[0].trim(),
    setValue: s.value,
    trend: 'appreciating',
  }));
}

export function getPopulationData(): PopulationEntry[] {
  const grades = ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6', 'PSA 5', 'PSA 4', 'PSA 3', 'PSA 2', 'PSA 1'];
  const counts = [5, 25, 80, 180, 350, 520, 780, 1100, 1400, 1800];
  const total = counts.reduce((a, b) => a + b, 0);
  return grades.map((grade, i) => ({
    grade,
    count: counts[i],
    percentage: Math.round((counts[i] / total) * 100 * 10) / 10,
  }));
}

export function getAuctionRecords(): AuctionRecord[] {
  const cards = getVintageCards();
  return cards.slice(0, 8).map((c, i) => ({
    id: `ar-${i + 1}`,
    card: `${c.year} ${c.set} ${c.player}`,
    grade: c.conditionCensus.highestKnown,
    price: c.currentValue * (0.8 + Math.random() * 0.4),
    date: `2024-${String(i + 1).padStart(2, '0')}-15`,
    house: ['Heritage', 'Goldin', 'REA', 'PWCC', 'Sotheby\'s'][i % 5],
    era: c.era.replace('_', ' '),
  }));
}

export function getHistoricalSignificanceRatings(): SignificanceRating[] {
  const cards = getVintageCards();
  return cards.map((c, i) => ({
    id: `sr-${i + 1}`,
    card: `${c.year} ${c.set} ${c.player}`,
    era: c.era.replace('_', ' '),
    historicalScore: c.historicalSignificance,
    culturalScore: Math.min(100, c.historicalSignificance + Math.floor(Math.random() * 10) - 5),
    rarityScore: Math.round(100 - (c.conditionCensus.totalGraded / 60)),
    overallRating: Math.round((c.historicalSignificance * 0.4 + (100 - c.conditionCensus.totalGraded / 60) * 0.3 + c.historicalSignificance * 0.3)),
  }));
}

export function getVintageMarketSummary(): VintageMarketSummary {
  const cards = getVintageCards();
  const trends = getVintageMarketTrends();
  const totalValue = cards.reduce((sum, c) => sum + c.currentValue, 0);
  const avg1yr = Math.round(trends.reduce((s, t) => s + t.avgReturn1yr, 0) / trends.length * 10) / 10;
  const avg5yr = Math.round(trends.reduce((s, t) => s + t.avgReturn5yr, 0) / trends.length * 10) / 10;
  return {
    totalMarketValue: totalValue,
    totalCards: cards.length,
    avgAppreciation1yr: avg1yr,
    avgAppreciation5yr: avg5yr,
    topPerformingEra: 'Pre-War (1900-1941)',
    mostActiveEra: 'Silver Age (1966-1974)',
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatConditionGrade(grade: string): string {
  return grade.replace('PSA ', '').trim();
}

// ---- Widget-compatible helpers (first set removed; see Widget adapters below) ----

export function getGrowthMetricsLegacy(): { overallPercent: number; dailyPercent: number; weeklyPercent: number } {
  const trends = getVintageMarketTrends();
  const avgReturn1yr = trends.reduce((s, t) => s + t.avgReturn1yr, 0) / (trends.length || 1);
  return {
    overallPercent: Math.round(avgReturn1yr * 10) / 10,
    dailyPercent: Math.round((avgReturn1yr / 365) * 100) / 100,
    weeklyPercent: Math.round((avgReturn1yr / 52) * 100) / 100,
  };
}

export function getVintageStats(): VintageStats {
  const cards = getVintageCards();
  const sets = getRegistrySets();
  const totalValue = cards.reduce((sum, c) => sum + c.currentValue, 0);
  const currentYear = new Date().getFullYear();
  const avgAge = Math.round(cards.reduce((sum, c) => sum + (currentYear - c.year), 0) / cards.length);
  const oldest = cards.reduce((a, b) => (a.year < b.year ? a : b));
  const highest = cards.reduce((a, b) => (a.currentValue > b.currentValue ? a : b));
  const avgAppreciation = Math.round(cards.reduce((sum, c) => sum + c.appreciation5yr, 0) / cards.length);

  return {
    totalVintageValue: totalValue,
    avgAge,
    oldestCard: `${oldest.year} ${oldest.player}`,
    highestValueCard: `${highest.year} ${highest.player}`,
    portfolioAppreciation: avgAppreciation,
    registrySets: sets.length,
  };
}

// ---- Widget adapters ----

export function getEraBreakdown(): { era: string; totalValue: number; cardCount: number; avgAppreciation: number }[] {
  const cards = getVintageCards();
  const eras: Record<string, { totalValue: number; count: number; appreciation: number }> = {};
  cards.forEach(c => {
    const era = c.year < 1960 ? 'Pre-1960' : c.year < 1970 ? '1960s' : c.year < 1980 ? '1970s' : 'Post-1980';
    if (!eras[era]) eras[era] = { totalValue: 0, count: 0, appreciation: 0 };
    eras[era].totalValue += c.currentValue;
    eras[era].count += 1;
    eras[era].appreciation += c.annualAppreciation;
  });
  return Object.entries(eras).map(([era, d]) => ({
    era,
    totalValue: d.totalValue,
    cardCount: d.count,
    avgAppreciation: d.count > 0 ? Math.round((d.appreciation / d.count) * 10) / 10 : 0,
  }));
}

export function getGrowthMetrics(): { overallGrowth: number; bestEra: string; bestEraGrowth: number; totalMarketCap: number; avgAnnualReturn: number } {
  const eras = getEraBreakdown();
  const best = eras.reduce((b, e) => e.avgAppreciation > b.avgAppreciation ? e : b, eras[0] || { era: 'N/A', avgAppreciation: 0 });
  const totalValue = eras.reduce((s, e) => s + e.totalValue, 0);
  const avgReturn = eras.length > 0 ? eras.reduce((s, e) => s + e.avgAppreciation, 0) / eras.length : 0;
  return { overallGrowth: 12.5, bestEra: best.era, bestEraGrowth: best.avgAppreciation, totalMarketCap: totalValue, avgAnnualReturn: Math.round(avgReturn * 10) / 10 };
}

import { store } from '../dal/syncStore';
export function getMarketCapData(): { era: string; marketCap: number; volume: number; growth: number }[] {
  return getEraBreakdown().map(e => ({ era: e.era, marketCap: e.totalValue, volume: e.cardCount * 150, growth: e.avgAppreciation }));
}
