// ── Phase 88: Unified Market Data Consolidation Engine ──────────────────────

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type Platform = 'eBay' | 'PWCC' | 'Goldin' | 'Heritage' | 'MySlabs' | 'COMC';

export interface PlatformPrice {
  platform: Platform;
  lastSalePrice: number;
  lastSaleDate: string;
  currentListing: number | null;
  avgPrice30d: number;
  volume30d: number;
  dataQuality: number; // 0-100
  lastUpdated: string;
}

export interface ConsolidatedPrice {
  player: string;
  cardDescription: string;
  grade: string;
  nbbo: {
    bestBid: { platform: Platform; price: number };
    bestAsk: { platform: Platform; price: number };
    spread: number;
    spreadPercent: number;
  };
  platformPrices: PlatformPrice[];
  consensusPrice: number;
  priceConfidence: number; // 0-100
  lastUpdated: string;
}

export interface ArbitrageOpportunity {
  id: string;
  player: string;
  cardDescription: string;
  buyPlatform: Platform;
  buyPrice: number;
  sellPlatform: Platform;
  sellPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  netProfit: number;
  confidence: number;
  expiresAt: string;
}

export interface TransactionRecord {
  id: string;
  platform: Platform;
  player: string;
  cardDescription: string;
  grade: string;
  price: number;
  date: string;
  type: 'sale' | 'listing' | 'bid';
  verified: boolean;
}

export interface DataQualityReport {
  platform: Platform;
  totalRecords: number;
  verifiedPercent: number;
  suspiciousTransactions: number;
  avgLatency: number;
  dataFreshness: number; // minutes since last update
  overallScore: number; // 0-100
}

export interface ConsolidationStats {
  totalPlatforms: number;
  totalTransactionsTracked: number;
  activeArbitrageOps: number;
  avgSpread: number;
  dataPointsToday: number;
  lastSync: string;
}

// ── Constants ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_data_consolidation';

/** Seller-side fee rates for net profit calculation */
export const PLATFORM_FEES: Record<Platform, { sellerFee: number; buyerPremium: number; label: string }> = {
  eBay:     { sellerFee: 0.1325, buyerPremium: 0,    label: '13.25% seller' },
  PWCC:     { sellerFee: 0.08,   buyerPremium: 0,    label: '8% seller' },
  Goldin:   { sellerFee: 0,      buyerPremium: 0.20, label: '20% buyer premium' },
  Heritage: { sellerFee: 0.10,   buyerPremium: 0.20, label: '20% buyer + 10% seller' },
  MySlabs:  { sellerFee: 0.15,   buyerPremium: 0,    label: '5% + 10% seller' },
  COMC:     { sellerFee: 0.05,   buyerPremium: 0,    label: '5% seller' },
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  eBay: '#3B82F6',
  PWCC: '#22C55E',
  Goldin: '#EAB308',
  Heritage: '#A855F7',
  MySlabs: '#F97316',
  COMC: '#06B6D4',
};

const ALL_PLATFORMS: Platform[] = ['eBay', 'PWCC', 'Goldin', 'Heritage', 'MySlabs', 'COMC'];

// ── Seed data ───────────────────────────────────────────────────────────────────

interface CardSeed {
  player: string;
  cardDescription: string;
  grade: string;
  basePrice: number;
}

const CARD_SEEDS: CardSeed[] = [
  { player: 'Shohei Ohtani', cardDescription: '2018 Topps Update #US1 RC', grade: 'PSA 10', basePrice: 285 },
  { player: 'Luka Doncic', cardDescription: '2018 Panini Prizm #280 RC', grade: 'PSA 10', basePrice: 1750 },
  { player: 'Mike Trout', cardDescription: '2011 Topps Update #US175 RC', grade: 'PSA 10', basePrice: 3200 },
  { player: 'Patrick Mahomes', cardDescription: '2017 Panini Prizm #269 RC', grade: 'PSA 10', basePrice: 4500 },
  { player: 'Victor Wembanyama', cardDescription: '2023 Panini Prizm #275 RC', grade: 'PSA 10', basePrice: 680 },
  { player: 'Connor McDavid', cardDescription: '2015 Upper Deck Young Guns #201 RC', grade: 'PSA 10', basePrice: 950 },
  { player: 'Jayson Tatum', cardDescription: '2017 Panini Prizm #16 RC', grade: 'PSA 10', basePrice: 520 },
  { player: 'Juan Soto', cardDescription: '2018 Topps Update #US300 RC', grade: 'PSA 10', basePrice: 310 },
  { player: 'Ja Morant', cardDescription: '2019 Panini Prizm #249 RC', grade: 'PSA 10', basePrice: 410 },
  { player: 'Trevor Lawrence', cardDescription: '2021 Panini Prizm #331 RC', grade: 'PSA 10', basePrice: 190 },
  { player: 'Anthony Edwards', cardDescription: '2020 Panini Prizm #258 RC', grade: 'PSA 10', basePrice: 370 },
  { player: 'Ken Griffey Jr.', cardDescription: '1989 Upper Deck #1 RC', grade: 'PSA 10', basePrice: 5200 },
  { player: 'Derek Jeter', cardDescription: '1993 SP #279 RC', grade: 'PSA 10', basePrice: 42000 },
  { player: 'LeBron James', cardDescription: '2003 Topps Chrome #111 RC', grade: 'PSA 10', basePrice: 72000 },
];

// ── Deterministic helpers ───────────────────────────────────────────────────────

function simpleHash(str: string): number {
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
    return s / 2147483647;
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursFromNow(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
}

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

// ── Data generation ─────────────────────────────────────────────────────────────

function generatePlatformPrice(card: CardSeed, platform: Platform, rng: () => number): PlatformPrice {
  // Each platform deviates ±5-20% from base price
  const deviation = 1 + (rng() * 0.30 - 0.15); // -15% to +15%
  const lastSalePrice = Math.round(card.basePrice * deviation);
  const listingDeviation = 1 + (rng() * 0.20 - 0.05); // slightly higher for listings
  const currentListing = rng() > 0.2 ? Math.round(card.basePrice * listingDeviation) : null;
  const avgDeviation = 1 + (rng() * 0.10 - 0.05);
  const avgPrice30d = Math.round(card.basePrice * avgDeviation);
  const volume = Math.floor(rng() * 30) + 1;
  const quality = Math.floor(rng() * 25) + 75; // 75-100
  const freshness = Math.floor(rng() * 120); // minutes ago

  return {
    platform,
    lastSalePrice,
    lastSaleDate: daysAgo(Math.floor(rng() * 14)),
    currentListing,
    avgPrice30d,
    volume30d: volume,
    dataQuality: quality,
    lastUpdated: minutesAgo(freshness),
  };
}

function buildConsolidatedPrice(card: CardSeed): ConsolidatedPrice {
  const rng = seededRandom(simpleHash(card.player + card.cardDescription + card.grade));
  const platformPrices = ALL_PLATFORMS.map(p => generatePlatformPrice(card, p, rng));

  // Find best bid (highest current listing = best sell price) and best ask (lowest listing = best buy price)
  const withListings = platformPrices.filter(p => p.currentListing !== null);
  const withSales = platformPrices.filter(p => p.lastSalePrice > 0);

  let bestBid = { platform: 'eBay' as Platform, price: card.basePrice * 0.90 };
  let bestAsk = { platform: 'COMC' as Platform, price: card.basePrice * 1.05 };

  if (withSales.length > 0) {
    const sorted = [...withSales].sort((a, b) => b.lastSalePrice - a.lastSalePrice);
    bestBid = { platform: sorted[0].platform, price: sorted[0].lastSalePrice };
  }
  if (withListings.length > 0) {
    const sorted = [...withListings].sort((a, b) => (a.currentListing ?? 0) - (b.currentListing ?? 0));
    bestAsk = { platform: sorted[0].platform, price: sorted[0].currentListing! };
  }

  const spread = bestAsk.price - bestBid.price;
  const midPrice = (bestBid.price + bestAsk.price) / 2;
  const spreadPercent = midPrice > 0 ? (Math.abs(spread) / midPrice) * 100 : 0;

  // Consensus price = volume-weighted average
  const totalVol = platformPrices.reduce((s, p) => s + p.volume30d, 0);
  const consensusPrice = totalVol > 0
    ? Math.round(platformPrices.reduce((s, p) => s + p.avgPrice30d * p.volume30d, 0) / totalVol)
    : card.basePrice;

  const avgQuality = platformPrices.reduce((s, p) => s + p.dataQuality, 0) / platformPrices.length;
  const priceConfidence = Math.round(Math.min(100, avgQuality * (withListings.length / ALL_PLATFORMS.length + 0.5)));

  return {
    player: card.player,
    cardDescription: card.cardDescription,
    grade: card.grade,
    nbbo: { bestBid, bestAsk, spread: Math.abs(spread), spreadPercent: Math.round(spreadPercent * 100) / 100 },
    platformPrices,
    consensusPrice,
    priceConfidence,
    lastUpdated: new Date().toISOString(),
  };
}

// ── Arbitrage calculation ───────────────────────────────────────────────────────

function calculateNetProfit(buyPrice: number, sellPrice: number, sellPlatform: Platform): number {
  const fee = PLATFORM_FEES[sellPlatform];
  const sellerProceeds = sellPrice * (1 - fee.sellerFee);
  return Math.round((sellerProceeds - buyPrice) * 100) / 100;
}

function findArbitrage(): ArbitrageOpportunity[] {
  const opps: ArbitrageOpportunity[] = [];
  const rng = seededRandom(simpleHash('arb-' + new Date().toDateString()));

  for (const card of CARD_SEEDS) {
    const consolidated = buildConsolidatedPrice(card);
    const prices = consolidated.platformPrices;

    // Check each pair of platforms
    for (let i = 0; i < prices.length; i++) {
      for (let j = 0; j < prices.length; j++) {
        if (i === j) continue;
        const buyPlatform = prices[i];
        const sellPlatform = prices[j];
        const buyPrice = buyPlatform.currentListing ?? buyPlatform.lastSalePrice;
        const sellPrice = sellPlatform.lastSalePrice;

        if (sellPrice <= buyPrice) continue;

        const netProfit = calculateNetProfit(buyPrice, sellPrice, sellPlatform.platform);
        if (netProfit <= 0) continue;

        const spreadAmount = sellPrice - buyPrice;
        const spreadPercent = (spreadAmount / buyPrice) * 100;

        opps.push({
          id: `arb-${card.player.replace(/\s/g, '-')}-${buyPlatform.platform}-${sellPlatform.platform}`.toLowerCase(),
          player: card.player,
          cardDescription: card.cardDescription,
          buyPlatform: buyPlatform.platform,
          buyPrice,
          sellPlatform: sellPlatform.platform,
          sellPrice,
          spreadAmount,
          spreadPercent: Math.round(spreadPercent * 100) / 100,
          netProfit,
          confidence: Math.floor(rng() * 30) + 65,
          expiresAt: hoursFromNow(Math.floor(rng() * 12) + 1),
        });
      }
    }
  }

  // Sort by net profit descending, return top 8
  opps.sort((a, b) => b.netProfit - a.netProfit);
  return opps.slice(0, 8);
}

// ── Transaction feed ────────────────────────────────────────────────────────────

function generateTransactions(filters?: { platform?: Platform; player?: string }): TransactionRecord[] {
  const rng = seededRandom(simpleHash('txn-' + new Date().toDateString()));
  const txns: TransactionRecord[] = [];
  const types: TransactionRecord['type'][] = ['sale', 'listing', 'bid'];

  for (let i = 0; i < 40; i++) {
    const card = CARD_SEEDS[Math.floor(rng() * CARD_SEEDS.length)];
    const platform = ALL_PLATFORMS[Math.floor(rng() * ALL_PLATFORMS.length)];
    const deviation = 1 + (rng() * 0.20 - 0.10);
    const price = Math.round(card.basePrice * deviation);
    const type = types[Math.floor(rng() * types.length)];

    txns.push({
      id: `txn-${i}-${simpleHash(card.player + platform + i)}`,
      platform,
      player: card.player,
      cardDescription: card.cardDescription,
      grade: card.grade,
      price,
      date: minutesAgo(Math.floor(rng() * 1440)), // within last 24h
      type,
      verified: rng() > 0.15,
    });
  }

  let filtered = txns;
  if (filters?.platform) filtered = filtered.filter(t => t.platform === filters.platform);
  if (filters?.player) filtered = filtered.filter(t => t.player.toLowerCase().includes(filters.player!.toLowerCase()));

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return filtered.slice(0, 20);
}

// ── Data quality reports ────────────────────────────────────────────────────────

function buildQualityReports(): DataQualityReport[] {
  const rng = seededRandom(simpleHash('quality-' + new Date().toDateString()));

  const baseScores: Record<Platform, { records: number; verified: number; suspicious: number; latency: number; freshness: number }> = {
    eBay:     { records: 128540, verified: 92, suspicious: 342, latency: 1.2, freshness: 3 },
    PWCC:     { records: 34200,  verified: 97, suspicious: 28,  latency: 2.8, freshness: 15 },
    Goldin:   { records: 18900,  verified: 95, suspicious: 45,  latency: 4.5, freshness: 30 },
    Heritage: { records: 22100,  verified: 98, suspicious: 12,  latency: 6.2, freshness: 60 },
    MySlabs:  { records: 8400,   verified: 88, suspicious: 89,  latency: 3.1, freshness: 8 },
    COMC:     { records: 45600,  verified: 94, suspicious: 67,  latency: 1.8, freshness: 5 },
  };

  return ALL_PLATFORMS.map(platform => {
    const base = baseScores[platform];
    const jitter = rng() * 4 - 2;
    const overallScore = Math.round(
      Math.min(100, Math.max(50,
        base.verified * 0.35 +
        (100 - Math.min(100, base.suspicious / (base.records / 1000) * 10)) * 0.25 +
        (100 - Math.min(100, base.latency * 8)) * 0.2 +
        (100 - Math.min(100, base.freshness * 0.8)) * 0.2 +
        jitter
      ))
    );

    return {
      platform,
      totalRecords: base.records,
      verifiedPercent: base.verified,
      suspiciousTransactions: base.suspicious,
      avgLatency: base.latency,
      dataFreshness: base.freshness,
      overallScore,
    };
  });
}

// ── localStorage persistence ────────────────────────────────────────────────────

function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch { /* quota exceeded, ignore */ }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getConsolidatedPrice(player: string, cardDesc: string, grade: string): ConsolidatedPrice {
  const cacheKey = `price_${simpleHash(player + cardDesc + grade)}`;
  const cached = loadFromStorage<ConsolidatedPrice>(cacheKey);
  if (cached) {
    const age = Date.now() - new Date(cached.lastUpdated).getTime();
    if (age < 5 * 60 * 1000) return cached; // 5min cache
  }

  const seed = CARD_SEEDS.find(
    c => c.player.toLowerCase().includes(player.toLowerCase()) ||
         player.toLowerCase().includes(c.player.toLowerCase())
  );

  const card = seed ?? { player, cardDescription: cardDesc, grade, basePrice: 200 + simpleHash(player + cardDesc) % 5000 };
  const result = buildConsolidatedPrice(card);
  saveToStorage(cacheKey, result);
  return result;
}

export function getArbitrageOpportunities(): ArbitrageOpportunity[] {
  const cached = loadFromStorage<{ data: ArbitrageOpportunity[]; ts: number }>('arbitrage');
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;

  const data = findArbitrage();
  saveToStorage('arbitrage', { data, ts: Date.now() });
  return data;
}

export function getTransactionFeed(filters?: { platform?: Platform; player?: string }): TransactionRecord[] {
  return generateTransactions(filters);
}

export function getDataQualityReports(): DataQualityReport[] {
  const cached = loadFromStorage<{ data: DataQualityReport[]; ts: number }>('quality');
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.data;

  const data = buildQualityReports();
  saveToStorage('quality', { data, ts: Date.now() });
  return data;
}

export function getConsolidationStats(): ConsolidationStats {
  const arbs = getArbitrageOpportunities();
  const reports = getDataQualityReports();

  const totalRecords = reports.reduce((s, r) => s + r.totalRecords, 0);
  const avgSpread = arbs.length > 0
    ? Math.round(arbs.reduce((s, a) => s + a.spreadPercent, 0) / arbs.length * 100) / 100
    : 0;

  return {
    totalPlatforms: ALL_PLATFORMS.length,
    totalTransactionsTracked: totalRecords,
    activeArbitrageOps: arbs.length,
    avgSpread,
    dataPointsToday: Math.floor(totalRecords * 0.02),
    lastSync: new Date().toISOString(),
  };
}

export function getPlatformComparison(player: string, cardDesc: string): PlatformPrice[] {
  const consolidated = getConsolidatedPrice(player, cardDesc, 'PSA 10');
  return consolidated.platformPrices;
}

export { ALL_PLATFORMS, CARD_SEEDS };

// ── Cross-reference: Multiple Data Sources ────────────────────────────────────
// Bridge functions to integrate data from Market Indices (Phase 86),
// Liquidity Intelligence (Phase 68), and Consignment Router (Phase 79)

import { getIndices, type MarketIndex } from './marketIndicesService';
import { getPlatformComparison as getConsignmentComparison, type PlatformComparison as ConsignmentComparison } from './consignmentRouterService';

export interface EnrichedConsolidatedView {
  consolidatedPrice: ConsolidatedPrice;
  marketIndicesContext: {
    relevantIndex: string;
    indexValue: number;
    indexChange: number;
    correlation: string;
  } | null;
  consignmentContext: {
    bestPlatform: string;
    bestNetProceeds: number;
    worstPlatform: string;
    pricingAdvantage: number;
  } | null;
}

/**
 * Creates an enriched consolidated view by combining price data with
 * market index context and consignment platform comparison.
 */
export function getEnrichedConsolidatedView(
  player: string,
  cardDesc: string,
  grade: string,
): EnrichedConsolidatedView {
  const consolidatedPrice = getConsolidatedPrice(player, cardDesc, grade);

  // Market Indices context
  let marketIndicesContext: EnrichedConsolidatedView['marketIndicesContext'] = null;
  try {
    const indices = getIndices();
    // Find the most relevant index (sport-specific if possible)
    const sportKeywords: Record<string, string> = {
      baseball: 'MSIMLB',
      basketball: 'MSINBA',
      football: 'MSINFL',
      hockey: 'MSINHL',
    };
    const playerLower = player.toLowerCase();
    let relevantTicker = 'MSI500';
    for (const [keyword, ticker] of Object.entries(sportKeywords)) {
      // Basic sport detection from player name context
      if (cardDesc.toLowerCase().includes(keyword)) {
        relevantTicker = ticker;
        break;
      }
    }
    const idx = indices.find(i => i.ticker === relevantTicker) || indices[0];
    if (idx) {
      marketIndicesContext = {
        relevantIndex: idx.name,
        indexValue: idx.currentValue,
        indexChange: idx.changePercent,
        correlation: idx.changePercent > 0 ? 'Positive market tailwind' : 'Market headwind — prices may face pressure',
      };
    }
  } catch {
    // Market indices service unavailable
  }

  // Consignment context
  let consignmentContext: EnrichedConsolidatedView['consignmentContext'] = null;
  try {
    const consignmentData = getConsignmentComparison();
    if (consignmentData.length > 0) {
      const priceCol = consolidatedPrice.consensusPrice >= 5000
        ? 'netProceedsAt5000' as const
        : consolidatedPrice.consensusPrice >= 1000
          ? 'netProceedsAt1000' as const
          : 'netProceedsAt500' as const;
      const sorted = [...consignmentData].sort((a, b) => b[priceCol] - a[priceCol]);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      consignmentContext = {
        bestPlatform: best.platformName,
        bestNetProceeds: best[priceCol],
        worstPlatform: worst.platformName,
        pricingAdvantage: Math.round(((best[priceCol] - worst[priceCol]) / worst[priceCol]) * 100 * 10) / 10,
      };
    }
  } catch {
    // Consignment router service unavailable
  }

  return {
    consolidatedPrice,
    marketIndicesContext,
    consignmentContext,
  };
}
