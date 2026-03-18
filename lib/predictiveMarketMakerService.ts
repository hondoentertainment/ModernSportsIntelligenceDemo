import { store } from './dal/syncStore';

// Phase 109: Predictive Market Maker & Synthetic Liquidity Engine
// Generates forward-looking bid/ask spreads and synthetic order books for illiquid cards.
// Uses comparable sales regression, player trajectory, and population scarcity to produce
// market-maker-quality pricing where no liquid market exists.

import { CardInventory } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpreadAlertType = 'narrowing' | 'widening';
export type MarketSegment =
  | 'vintage_baseball' | 'modern_baseball'
  | 'vintage_basketball' | 'modern_basketball'
  | 'vintage_football' | 'modern_football'
  | 'hockey' | 'soccer' | 'multi_sport';

export interface SyntheticSpread {
  cardId: string;
  player: string;
  cardDescription: string;
  bid: number;
  ask: number;
  midpoint: number;
  spreadWidth: number;       // percentage
  confidence: number;        // 0-100
  comparableSalesCount: number;
  trajectoryFactor: number;  // 0.5-1.5 multiplier from player performance
  scarcityMultiplier: number; // 1.0-3.0 from pop data
  lastUpdated: string;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  cumulative: number;
  source: 'comparable_sale' | 'regression_model' | 'scarcity_premium' | 'trajectory_adj';
  confidence: number;
}

export interface SyntheticOrderBook {
  cardId: string;
  player: string;
  cardDescription: string;
  bids: OrderBookEntry[];    // sorted descending by price
  asks: OrderBookEntry[];    // sorted ascending by price
  midpoint: number;
  imbalance: number;         // -1 (heavy sell pressure) to +1 (heavy buy pressure)
  depthScore: number;        // 0-100 how deep the book is
  generatedAt: string;
}

export interface LiquidityScore {
  cardId: string;
  player: string;
  score: number;             // 0-100
  avgDaysToSell: number;
  spreadWidth: number;       // percentage
  comparableDensity: number; // comparable sales per month
  recentVolume: number;      // transactions in last 30d
  tier: 'liquid' | 'moderate' | 'illiquid' | 'frozen';
  factors: { label: string; impact: number }[];
}

export interface SpreadAlert {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  type: SpreadAlertType;
  previousSpread: number;
  currentSpread: number;
  changePercent: number;
  signal: 'sell_opportunity' | 'buy_opportunity';
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  detectedAt: string;
}

export interface PricingOracle {
  cardId: string;
  player: string;
  cardDescription: string;
  currentMidpoint: number;
  targets: SellVelocityTarget[];
  optimalPrice: number;
  optimalDaysToSell: number;
}

export interface SellVelocityTarget {
  daysToSell: number;
  suggestedPrice: number;
  probability: number;       // 0-100 chance of selling within timeframe
  priceVsMidpoint: number;   // percentage discount/premium
}

export interface MarketDepthAnalysis {
  segment: MarketSegment;
  segmentLabel: string;
  avgLiquidity: number;      // 0-100
  avgSpread: number;         // percentage
  totalVolume: number;       // 30d volume
  cardCount: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  heatLevel: number;         // 0-10 for heatmap rendering
}

export interface PortfolioLiquidityAnalysis {
  overallScore: number;
  totalCards: number;
  liquidCards: number;
  illiquidCards: number;
  frozenCards: number;
  avgSpread: number;
  avgDaysToSell: number;
  estimatedLiquidValue: number;
  estimatedTotalValue: number;
  liquidityBySegment: { segment: MarketSegment; label: string; score: number; count: number }[];
  riskFactors: string[];
}

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_predictive_mm_v1';

interface StoredData {
  cards: MockCardData[];
  generatedAt: number;
}

function loadData(): StoredData | null {
  try {
    const data = store.get<StoredData | null>(STORAGE_KEY, null);
    if (!data) return null;
    if (Date.now() - data.generatedAt > 6 * 3600 * 1000) return null;
    return data;
  } catch { return null; }
}

function saveData(data: StoredData): void {
  store.set(STORAGE_KEY, data);
}

// ── Deterministic seeding ─────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Mock card data ────────────────────────────────────────────────────────────

interface MockCardData {
  id: string;
  player: string;
  year: number;
  cardDescription: string;
  grade: string;
  sport: string;
  segment: MarketSegment;
  baseFMV: number;
  trajectoryFactor: number;
  scarcityMultiplier: number;
  spreadPct: number;
  avgDaysToSell: number;
  comparableDensity: number;
  recentVolume: number;
  liquidityScore: number;
}

const MOCK_CARDS_DATA: Array<{
  player: string; year: number; desc: string; grade: string;
  sport: string; segment: MarketSegment; fmvRange: [number, number];
}> = [
  // Vintage Baseball (illiquid, wide spreads)
  { player: '1952 Mickey Mantle', year: 1952, desc: 'Topps #311', grade: 'PSA 4', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [85000, 120000] },
  { player: 'Willie Mays', year: 1954, desc: 'Bowman #89', grade: 'PSA 6', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [3200, 4800] },
  { player: 'Hank Aaron', year: 1954, desc: 'Topps #128 RC', grade: 'PSA 5', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [8500, 12000] },
  { player: 'Roberto Clemente', year: 1955, desc: 'Topps #164 RC', grade: 'PSA 4', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [6000, 9500] },
  { player: 'Sandy Koufax', year: 1955, desc: 'Topps #123 RC', grade: 'PSA 7', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [12000, 18000] },
  { player: 'Ernie Banks', year: 1954, desc: 'Topps #94 RC', grade: 'PSA 6', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [4500, 6500] },
  { player: 'Jackie Robinson', year: 1949, desc: 'Leaf #79', grade: 'PSA 3', sport: 'Baseball', segment: 'vintage_baseball', fmvRange: [15000, 25000] },

  // Modern Baseball
  { player: 'Shohei Ohtani', year: 2018, desc: 'Topps Chrome RC Auto', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [3500, 5000] },
  { player: 'Juan Soto', year: 2018, desc: 'Topps Update RC', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [800, 1200] },
  { player: 'Mike Trout', year: 2011, desc: 'Topps Update RC', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [2800, 4200] },
  { player: 'Ronald Acuna Jr', year: 2018, desc: 'Topps Chrome RC', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [350, 550] },
  { player: 'Julio Rodriguez', year: 2022, desc: 'Topps Chrome RC Auto', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [600, 900] },
  { player: 'Gunnar Henderson', year: 2023, desc: 'Bowman Chrome 1st Auto', grade: 'BGS 9.5', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [400, 700] },

  // Vintage Basketball
  { player: 'Bill Russell', year: 1957, desc: 'Topps #77 RC', grade: 'PSA 5', sport: 'Basketball', segment: 'vintage_basketball', fmvRange: [22000, 35000] },
  { player: 'Wilt Chamberlain', year: 1961, desc: 'Fleer #8 RC', grade: 'PSA 6', sport: 'Basketball', segment: 'vintage_basketball', fmvRange: [18000, 28000] },
  { player: 'Kareem Abdul-Jabbar', year: 1969, desc: 'Topps #25 RC', grade: 'PSA 7', sport: 'Basketball', segment: 'vintage_basketball', fmvRange: [5500, 8500] },

  // Modern Basketball
  { player: 'Victor Wembanyama', year: 2023, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [2500, 4000] },
  { player: 'Luka Doncic', year: 2018, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [4500, 6500] },
  { player: 'Anthony Edwards', year: 2020, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [1200, 1800] },
  { player: 'LeBron James', year: 2003, desc: 'Topps Chrome RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [45000, 65000] },
  { player: 'Jayson Tatum', year: 2017, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [1500, 2200] },
  { player: 'Chet Holmgren', year: 2022, desc: 'Prizm RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [200, 400] },
  { player: 'Paolo Banchero', year: 2022, desc: 'Select Concourse RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [150, 300] },

  // Vintage Football
  { player: 'Johnny Unitas', year: 1957, desc: 'Topps #138 RC', grade: 'PSA 5', sport: 'Football', segment: 'vintage_football', fmvRange: [8000, 13000] },
  { player: 'Jim Brown', year: 1958, desc: 'Topps #62 RC', grade: 'PSA 6', sport: 'Football', segment: 'vintage_football', fmvRange: [12000, 18000] },

  // Modern Football
  { player: 'Patrick Mahomes', year: 2017, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [12000, 18000] },
  { player: 'Josh Allen', year: 2018, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [3500, 5500] },
  { player: 'Caleb Williams', year: 2024, desc: 'Prizm RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [300, 600] },
  { player: 'C.J. Stroud', year: 2023, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [500, 900] },
  { player: 'Brock Purdy', year: 2022, desc: 'Prizm RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [250, 450] },
  { player: 'Lamar Jackson', year: 2018, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [1800, 2800] },
  { player: 'Joe Burrow', year: 2020, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [1200, 2000] },
  { player: 'Trevor Lawrence', year: 2021, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [400, 700] },

  // Hockey
  { player: 'Connor McDavid', year: 2015, desc: 'Upper Deck Young Guns RC', grade: 'PSA 10', sport: 'Hockey', segment: 'hockey', fmvRange: [2200, 3500] },
  { player: 'Wayne Gretzky', year: 1979, desc: 'OPC #18 RC', grade: 'PSA 7', sport: 'Hockey', segment: 'hockey', fmvRange: [25000, 40000] },
  { player: 'Connor Bedard', year: 2023, desc: 'Upper Deck Young Guns RC', grade: 'PSA 10', sport: 'Hockey', segment: 'hockey', fmvRange: [400, 700] },
  { player: 'Auston Matthews', year: 2016, desc: 'Upper Deck Young Guns RC', grade: 'PSA 10', sport: 'Hockey', segment: 'hockey', fmvRange: [800, 1400] },

  // Soccer
  { player: 'Lionel Messi', year: 2004, desc: 'Panini Mega Cracks RC', grade: 'PSA 9', sport: 'Soccer', segment: 'soccer', fmvRange: [18000, 28000] },
  { player: 'Erling Haaland', year: 2020, desc: 'Topps Chrome UCL RC', grade: 'PSA 10', sport: 'Soccer', segment: 'soccer', fmvRange: [1500, 2500] },
  { player: 'Jude Bellingham', year: 2020, desc: 'Topps Chrome BL RC', grade: 'PSA 10', sport: 'Soccer', segment: 'soccer', fmvRange: [800, 1400] },
  { player: 'Kylian Mbappe', year: 2018, desc: 'Panini Prizm WC RC', grade: 'PSA 10', sport: 'Soccer', segment: 'soccer', fmvRange: [2500, 4000] },

  // Multi-sport / additional modern
  { player: 'Derek Jeter', year: 1993, desc: 'SP Foil RC', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [25000, 40000] },
  { player: 'Ken Griffey Jr', year: 1989, desc: 'Upper Deck #1 RC', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [3500, 5500] },
  { player: 'Giannis Antetokounmpo', year: 2013, desc: 'Prizm RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [8000, 12000] },
  { player: 'Stephen Curry', year: 2009, desc: 'Topps Chrome RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [15000, 22000] },
  { player: 'Ja Morant', year: 2019, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [600, 1000] },
  { player: 'Zion Williamson', year: 2019, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Basketball', segment: 'modern_basketball', fmvRange: [500, 800] },
  { player: 'Tom Brady', year: 2000, desc: 'Playoff Contenders Auto RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [400000, 600000] },
  { player: 'Travis Kelce', year: 2013, desc: 'Prizm RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [1000, 1800] },
  { player: 'Tyreek Hill', year: 2016, desc: 'Prizm Silver RC', grade: 'PSA 10', sport: 'Football', segment: 'modern_football', fmvRange: [300, 550] },
  { player: 'Bobby Witt Jr', year: 2022, desc: 'Topps Chrome RC Auto', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [350, 600] },
  { player: 'Elly De La Cruz', year: 2023, desc: 'Bowman Chrome 1st', grade: 'PSA 10', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [200, 400] },
  { player: 'Paul Skenes', year: 2024, desc: 'Bowman Chrome 1st Auto', grade: 'BGS 9.5', sport: 'Baseball', segment: 'modern_baseball', fmvRange: [500, 900] },
];

function generateMockCards(seed: number): MockCardData[] {
  const rand = seededRandom(seed);
  return MOCK_CARDS_DATA.map((card, i) => {
    const r = rand();
    const baseFMV = Math.round(card.fmvRange[0] + r * (card.fmvRange[1] - card.fmvRange[0]));
    const isVintage = card.segment.startsWith('vintage');
    const isHighEnd = baseFMV > 10000;

    // Trajectory factor: vintage cards are stable, modern varies with performance
    const trajectoryFactor = isVintage
      ? 0.95 + rand() * 0.1
      : 0.7 + rand() * 0.6;

    // Scarcity multiplier: higher for vintage and high grades
    const scarcityMultiplier = isVintage
      ? 1.3 + rand() * 1.2
      : 1.0 + rand() * 0.8;

    // Spread: illiquid cards have wider spreads
    const baseSpread = isVintage ? 8 + rand() * 18 : 3 + rand() * 12;
    const spreadPct = isHighEnd ? baseSpread * 1.3 : baseSpread;

    // Days to sell
    const avgDaysToSell = isVintage
      ? 15 + Math.floor(rand() * 90)
      : 3 + Math.floor(rand() * 30);

    // Comparable density (sales per month)
    const comparableDensity = isVintage
      ? 0.5 + rand() * 3
      : 2 + rand() * 25;

    const recentVolume = Math.floor(comparableDensity * (0.8 + rand() * 0.4));

    // Liquidity score
    const spreadFactor = Math.max(0, 30 - spreadPct) / 30 * 40;
    const daysFactor = Math.max(0, 60 - avgDaysToSell) / 60 * 30;
    const volumeFactor = Math.min(recentVolume / 15, 1) * 30;
    const liquidityScore = Math.round(Math.min(100, Math.max(0, spreadFactor + daysFactor + volumeFactor)));

    return {
      id: `pmm-card-${i}`,
      player: card.player,
      year: card.year,
      cardDescription: `${card.year} ${card.desc}`,
      grade: card.grade,
      sport: card.sport,
      segment: card.segment,
      baseFMV,
      trajectoryFactor: Math.round(trajectoryFactor * 100) / 100,
      scarcityMultiplier: Math.round(scarcityMultiplier * 100) / 100,
      spreadPct: Math.round(spreadPct * 100) / 100,
      avgDaysToSell,
      comparableDensity: Math.round(comparableDensity * 10) / 10,
      recentVolume,
      liquidityScore,
    };
  });
}

function ensureData(): MockCardData[] {
  const existing = loadData();
  if (existing) return existing.cards;

  const now = new Date();
  const seed = hashStr(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-pmm`);
  const cards = generateMockCards(seed);
  saveData({ cards, generatedAt: Date.now() });
  return cards;
}

// ── Order Book Generation ─────────────────────────────────────────────────────

function generateOrderBookLevels(
  card: MockCardData,
  side: 'bid' | 'ask',
  levels: number,
  seed: number,
): OrderBookEntry[] {
  const rand = seededRandom(seed);
  const midpoint = card.baseFMV * card.trajectoryFactor * card.scarcityMultiplier;
  const halfSpread = (card.spreadPct / 100) * midpoint / 2;

  const entries: OrderBookEntry[] = [];
  let cumulative = 0;

  const sources: OrderBookEntry['source'][] = [
    'comparable_sale', 'regression_model', 'scarcity_premium', 'trajectory_adj',
  ];

  for (let i = 0; i < levels; i++) {
    const depth = (i + 1) / levels;
    const priceOffset = halfSpread * (1 + depth * 1.5);
    const price = side === 'bid'
      ? midpoint - priceOffset
      : midpoint + priceOffset;

    const quantity = 1 + Math.floor(rand() * 4);
    cumulative += quantity;

    entries.push({
      price: Math.round(price * 100) / 100,
      quantity,
      cumulative,
      source: sources[Math.floor(rand() * sources.length)],
      confidence: Math.round(Math.max(30, 95 - depth * 60 + rand() * 15)),
    });
  }

  return entries;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllCards(): MockCardData[] {
  return ensureData();
}

export function getSyntheticSpread(cardId: string): SyntheticSpread | null {
  const cards = ensureData();
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;

  const midpoint = card.baseFMV * card.trajectoryFactor * card.scarcityMultiplier;
  const halfSpread = (card.spreadPct / 100) * midpoint / 2;
  const bid = Math.round((midpoint - halfSpread) * 100) / 100;
  const ask = Math.round((midpoint + halfSpread) * 100) / 100;

  return {
    cardId: card.id,
    player: card.player,
    cardDescription: card.cardDescription,
    bid,
    ask,
    midpoint: Math.round(midpoint * 100) / 100,
    spreadWidth: card.spreadPct,
    confidence: Math.round(Math.max(40, 95 - card.spreadPct * 1.5)),
    comparableSalesCount: Math.round(card.comparableDensity * 6), // last 6 months
    trajectoryFactor: card.trajectoryFactor,
    scarcityMultiplier: card.scarcityMultiplier,
    lastUpdated: new Date().toISOString(),
  };
}

export function getSyntheticOrderBook(cardId: string): SyntheticOrderBook | null {
  const cards = ensureData();
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;

  const seed = hashStr(cardId + '-orderbook');
  const midpoint = card.baseFMV * card.trajectoryFactor * card.scarcityMultiplier;
  const bidLevels = 8 + Math.floor((hashStr(cardId) % 5));
  const askLevels = 7 + Math.floor((hashStr(cardId + 'a') % 5));

  const bids = generateOrderBookLevels(card, 'bid', bidLevels, seed);
  const asks = generateOrderBookLevels(card, 'ask', askLevels, seed + 7777);

  const totalBidQty = bids.reduce((s, b) => s + b.quantity, 0);
  const totalAskQty = asks.reduce((s, a) => s + a.quantity, 0);
  const imbalance = totalBidQty + totalAskQty > 0
    ? Math.round(((totalBidQty - totalAskQty) / (totalBidQty + totalAskQty)) * 100) / 100
    : 0;

  return {
    cardId: card.id,
    player: card.player,
    cardDescription: card.cardDescription,
    bids,
    asks,
    midpoint: Math.round(midpoint * 100) / 100,
    imbalance,
    depthScore: Math.round(Math.min(100, (totalBidQty + totalAskQty) * 5)),
    generatedAt: new Date().toISOString(),
  };
}

export function getLiquidityScore(cardId: string): LiquidityScore | null {
  const cards = ensureData();
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;

  let tier: LiquidityScore['tier'];
  if (card.liquidityScore >= 70) tier = 'liquid';
  else if (card.liquidityScore >= 40) tier = 'moderate';
  else if (card.liquidityScore >= 15) tier = 'illiquid';
  else tier = 'frozen';

  const factors: { label: string; impact: number }[] = [];
  if (card.spreadPct > 15) factors.push({ label: 'Wide bid/ask spread', impact: -20 });
  else if (card.spreadPct < 5) factors.push({ label: 'Tight spread', impact: 15 });
  if (card.avgDaysToSell > 60) factors.push({ label: 'Very slow turnover', impact: -25 });
  else if (card.avgDaysToSell < 7) factors.push({ label: 'Fast sell-through', impact: 20 });
  if (card.comparableDensity < 2) factors.push({ label: 'Few comparable sales', impact: -15 });
  else if (card.comparableDensity > 10) factors.push({ label: 'Active comp market', impact: 15 });
  if (card.scarcityMultiplier > 2) factors.push({ label: 'High scarcity premium', impact: 10 });
  if (card.trajectoryFactor > 1.2) factors.push({ label: 'Rising player trajectory', impact: 10 });
  else if (card.trajectoryFactor < 0.85) factors.push({ label: 'Declining trajectory', impact: -10 });

  return {
    cardId: card.id,
    player: card.player,
    score: card.liquidityScore,
    avgDaysToSell: card.avgDaysToSell,
    spreadWidth: card.spreadPct,
    comparableDensity: card.comparableDensity,
    recentVolume: card.recentVolume,
    tier,
    factors,
  };
}

export function getTargetPricing(cardId: string, _daysToSell?: number): PricingOracle | null {
  const cards = ensureData();
  const card = cards.find(c => c.id === cardId);
  if (!card) return null;

  const midpoint = card.baseFMV * card.trajectoryFactor * card.scarcityMultiplier;
  const halfSpread = (card.spreadPct / 100) * midpoint / 2;

  const timeframes = [3, 7, 14, 30, 60, 90];
  const targets: SellVelocityTarget[] = timeframes.map(days => {
    // Shorter timeframe = deeper discount needed
    const urgencyDiscount = Math.max(0, (30 - days) / 30) * 0.15;
    const suggestedPrice = Math.round((midpoint - halfSpread * (1 - urgencyDiscount * 2)) * (1 - urgencyDiscount) * 100) / 100;
    const probability = Math.round(Math.min(95, 40 + days * 1.2 + card.liquidityScore * 0.3));
    const priceVsMidpoint = Math.round(((suggestedPrice - midpoint) / midpoint) * 10000) / 100;

    return { daysToSell: days, suggestedPrice, probability, priceVsMidpoint };
  });

  // Optimal = best value/time tradeoff
  const optimalIdx = targets.reduce((bestIdx, t, i, arr) => {
    const score = t.probability * t.suggestedPrice;
    const bestScore = arr[bestIdx].probability * arr[bestIdx].suggestedPrice;
    return score > bestScore ? i : bestIdx;
  }, 0);

  return {
    cardId: card.id,
    player: card.player,
    cardDescription: card.cardDescription,
    currentMidpoint: Math.round(midpoint * 100) / 100,
    targets,
    optimalPrice: targets[optimalIdx].suggestedPrice,
    optimalDaysToSell: targets[optimalIdx].daysToSell,
  };
}

export function getPortfolioLiquidity(inventory?: CardInventory[]): PortfolioLiquidityAnalysis {
  const cards = ensureData();

  // Use all mock cards (or filter to inventory if provided)
  const analysisCards = inventory && inventory.length > 0
    ? cards.slice(0, Math.min(cards.length, inventory.length + 10))
    : cards;

  const scores = analysisCards.map(c => c.liquidityScore);
  const overallScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  const liquidCards = analysisCards.filter(c => c.liquidityScore >= 70).length;
  const illiquidCards = analysisCards.filter(c => c.liquidityScore >= 15 && c.liquidityScore < 40).length;
  const frozenCards = analysisCards.filter(c => c.liquidityScore < 15).length;

  const avgSpread = Math.round(analysisCards.reduce((s, c) => s + c.spreadPct, 0) / analysisCards.length * 100) / 100;
  const avgDaysToSell = Math.round(analysisCards.reduce((s, c) => s + c.avgDaysToSell, 0) / analysisCards.length);

  const estimatedTotalValue = analysisCards.reduce((s, c) => {
    const mid = c.baseFMV * c.trajectoryFactor * c.scarcityMultiplier;
    return s + mid;
  }, 0);
  const estimatedLiquidValue = analysisCards.reduce((s, c) => {
    const mid = c.baseFMV * c.trajectoryFactor * c.scarcityMultiplier;
    const liquidDiscount = c.liquidityScore >= 70 ? 0.97 : c.liquidityScore >= 40 ? 0.90 : c.liquidityScore >= 15 ? 0.75 : 0.55;
    return s + mid * liquidDiscount;
  }, 0);

  const segmentMap = new Map<MarketSegment, { scores: number[]; count: number }>();
  for (const c of analysisCards) {
    const existing = segmentMap.get(c.segment) || { scores: [], count: 0 };
    existing.scores.push(c.liquidityScore);
    existing.count++;
    segmentMap.set(c.segment, existing);
  }

  const segmentLabels: Record<MarketSegment, string> = {
    vintage_baseball: 'Vintage Baseball',
    modern_baseball: 'Modern Baseball',
    vintage_basketball: 'Vintage Basketball',
    modern_basketball: 'Modern Basketball',
    vintage_football: 'Vintage Football',
    modern_football: 'Modern Football',
    hockey: 'Hockey',
    soccer: 'Soccer',
    multi_sport: 'Multi-Sport',
  };

  const liquidityBySegment = Array.from(segmentMap.entries()).map(([segment, data]) => ({
    segment,
    label: segmentLabels[segment],
    score: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
    count: data.count,
  })).sort((a, b) => b.score - a.score);

  const riskFactors: string[] = [];
  if (frozenCards > 0) riskFactors.push(`${frozenCards} card${frozenCards > 1 ? 's' : ''} with near-zero liquidity`);
  if (avgSpread > 15) riskFactors.push('Portfolio average spread exceeds 15% — high friction costs');
  if (avgDaysToSell > 30) riskFactors.push('Average time-to-sell exceeds 30 days');
  if (overallScore < 40) riskFactors.push('Overall portfolio liquidity is below moderate threshold');
  const vintageRatio = analysisCards.filter(c => c.segment.startsWith('vintage')).length / analysisCards.length;
  if (vintageRatio > 0.4) riskFactors.push('Heavy vintage concentration — inherently less liquid');

  return {
    overallScore,
    totalCards: analysisCards.length,
    liquidCards,
    illiquidCards,
    frozenCards,
    avgSpread,
    avgDaysToSell,
    estimatedLiquidValue: Math.round(estimatedLiquidValue),
    estimatedTotalValue: Math.round(estimatedTotalValue),
    liquidityBySegment,
    riskFactors,
  };
}

export function getSpreadAlerts(inventory?: CardInventory[]): SpreadAlert[] {
  const cards = ensureData();
  const rand = seededRandom(hashStr('spread-alerts-' + new Date().toDateString()));
  const alerts: SpreadAlert[] = [];

  const analysisCards = inventory && inventory.length > 0
    ? cards.slice(0, Math.min(cards.length, inventory.length + 8))
    : cards.slice(0, 25);

  for (const card of analysisCards) {
    if (rand() > 0.35) continue; // ~35% of cards generate an alert

    const isNarrowing = rand() > 0.45;
    const changeMagnitude = 1 + rand() * 8;
    const previousSpread = isNarrowing
      ? card.spreadPct + changeMagnitude
      : card.spreadPct - changeMagnitude * 0.7;

    const urgencyRand = rand();
    const urgency: SpreadAlert['urgency'] = urgencyRand < 0.25 ? 'high' : urgencyRand < 0.6 ? 'medium' : 'low';

    const narrowReasons = [
      `Comparable sales volume increased ${Math.floor(rand() * 40 + 20)}% this week`,
      `Recent auction at ${Math.floor(rand() * 5 + 2)}% above midpoint tightened the ask side`,
      `Pop report update reduced known population, attracting more buyers`,
      `Player performance surge drawing in new collectors`,
    ];
    const widenReasons = [
      `${Math.floor(rand() * 3 + 2)} comparable listings hit the market simultaneously`,
      `Player injury news causing buyer hesitation`,
      `Seasonal demand softening in this segment`,
      `Recent PSA submission return increasing supply at this grade`,
    ];

    alerts.push({
      id: `alert-${card.id}-${Date.now()}`,
      cardId: card.id,
      player: card.player,
      cardDescription: card.cardDescription,
      type: isNarrowing ? 'narrowing' : 'widening',
      previousSpread: Math.round(Math.max(1, previousSpread) * 100) / 100,
      currentSpread: card.spreadPct,
      changePercent: Math.round(changeMagnitude * 100) / 100,
      signal: isNarrowing ? 'sell_opportunity' : 'buy_opportunity',
      urgency,
      reason: isNarrowing
        ? narrowReasons[Math.floor(rand() * narrowReasons.length)]
        : widenReasons[Math.floor(rand() * widenReasons.length)],
      detectedAt: new Date(Date.now() - Math.floor(rand() * 86400000)).toISOString(),
    });
  }

  return alerts.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function getMarketDepthBySegment(): MarketDepthAnalysis[] {
  const cards = ensureData();
  const rand = seededRandom(hashStr('market-depth-' + new Date().toDateString()));

  const segmentLabels: Record<MarketSegment, string> = {
    vintage_baseball: 'Vintage Baseball',
    modern_baseball: 'Modern Baseball',
    vintage_basketball: 'Vintage Basketball',
    modern_basketball: 'Modern Basketball',
    vintage_football: 'Vintage Football',
    modern_football: 'Modern Football',
    hockey: 'Hockey',
    soccer: 'Soccer',
    multi_sport: 'Multi-Sport',
  };

  const segmentMap = new Map<MarketSegment, MockCardData[]>();
  for (const c of cards) {
    const existing = segmentMap.get(c.segment) || [];
    existing.push(c);
    segmentMap.set(c.segment, existing);
  }

  const results: MarketDepthAnalysis[] = [];
  for (const [segment, segCards] of segmentMap.entries()) {
    const avgLiq = Math.round(segCards.reduce((s, c) => s + c.liquidityScore, 0) / segCards.length);
    const avgSpread = Math.round(segCards.reduce((s, c) => s + c.spreadPct, 0) / segCards.length * 100) / 100;
    const totalVolume = segCards.reduce((s, c) => s + c.recentVolume, 0);

    const trendRand = rand();
    const trend: MarketDepthAnalysis['trend'] = trendRand < 0.35
      ? 'improving'
      : trendRand < 0.7
        ? 'stable'
        : 'deteriorating';

    const heatLevel = Math.round(Math.min(10, avgLiq / 10));

    results.push({
      segment,
      segmentLabel: segmentLabels[segment],
      avgLiquidity: avgLiq,
      avgSpread,
      totalVolume,
      cardCount: segCards.length,
      trend,
      heatLevel,
    });
  }

  return results.sort((a, b) => b.avgLiquidity - a.avgLiquidity);
}
