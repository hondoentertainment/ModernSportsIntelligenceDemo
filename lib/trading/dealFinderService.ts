import { CardInventory, Sport } from '../../types';
import { store } from '../dal/syncStore';
import { isFeatureEnabled } from '../featureFlags';
import { ebayAdapter } from '../integrations/ebayAdapter';
import { logger } from '../logger';

// ---- Types ----

export type Platform = 'eBay' | 'COMC' | 'MySlabs' | 'Goldin' | 'Private';

export interface MarketplaceListing {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  sport: Sport;
  platform: Platform;
  listPrice: number;
  fairValue: number;
  condition: string;
  isGraded: boolean;
  grade?: string;
  sellerRating: number; // 0-100
  listingAge: number; // days
  imageUrl?: string;
  endTime?: string; // for auctions
}

export interface Deal {
  id: string;
  listing: MarketplaceListing;
  dealScore: number; // 0-100
  savingsAmount: number;
  savingsPercent: number;
  afterFees: number;
  platformFee: number;
  recommendation: 'strong_buy' | 'buy' | 'fair' | 'overpriced';
}

export interface ArbitrageOpportunity {
  id: string;
  buyListing: MarketplaceListing;
  sellPlatform: Platform;
  buyPrice: number;
  sellPrice: number;
  buyFee: number;
  sellFee: number;
  netProfit: number;
  profitPercent: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DealAlert {
  id: string;
  listing: MarketplaceListing;
  watchlistItemId: string;
  watchlistPlayer: string;
  targetPrice: number;
  currentPrice: number;
  priceDiff: number;
  priceDiffPercent: number;
  triggeredAt: string;
}

export interface DealHistory {
  id: string;
  dealId: string;
  action: 'purchased' | 'passed' | 'watchlisted' | 'expired';
  listing: MarketplaceListing;
  dealScore: number;
  savingsAmount: number;
  timestamp: string;
}

export interface DealFilter {
  sport?: Sport;
  platform?: Platform;
  minScore?: number;
  maxPrice?: number;
  minSavings?: number;
  sortBy?: 'score' | 'savings' | 'price' | 'recent';
}

// ---- Constants ----

export const PLATFORM_FEES: Record<Platform, number> = {
  eBay: 0.13,
  COMC: 0.05,
  MySlabs: 0.09,
  Goldin: 0.10,
  Private: 0,
};

const PLATFORM_COLORS: Record<Platform, { text: string; bg: string; border: string }> = {
  eBay: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  COMC: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  MySlabs: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  Goldin: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Private: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

export { PLATFORM_COLORS };

const PREFS_KEY = 'msi_deal_finder_prefs';
const HISTORY_KEY = 'msi_deal_history';

const ALL_PLATFORMS: Platform[] = ['eBay', 'COMC', 'MySlabs', 'Goldin', 'Private'];

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// ---- localStorage helpers ----

export function loadPrefs(): DealFilter {
  return store.get<DealFilter>(PREFS_KEY, {});
}

export function savePrefs(prefs: DealFilter): void {
  store.set(PREFS_KEY, prefs);
}

export function getDealHistory(): DealHistory[] {
  return store.get<DealHistory[]>(HISTORY_KEY, []);
}

function saveDealHistory(history: DealHistory[]): void {
  store.set(HISTORY_KEY, history.slice(-100));
}

export function logDealAction(
  dealId: string,
  action: DealHistory['action'],
  listing: MarketplaceListing,
  dealScore: number,
  savingsAmount: number
): void {
  const history = getDealHistory();
  history.push({
    id: `dh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    dealId,
    action,
    listing,
    dealScore,
    savingsAmount,
    timestamp: new Date().toISOString(),
  });
  saveDealHistory(history);
}

// ---- Listing Generation ----

const _SELLER_NAMES = [
  'CardKingPro', 'SlabMaster99', 'VintageFinds', 'GradedGold', 'DiamondCards',
  'TopShelfSports', 'MintCondition', 'AllStarCards', 'PremiumSlabs', 'CardVaultHQ',
  'EliteBreaks', 'ProCardDeals', 'RookieInvestor', 'HallOfFameCards', 'BigLeagueSlabs',
];

export function generateListings(cards: CardInventory[]): MarketplaceListing[] {
  if (cards.length === 0) return [];

  const seed = dateSeed();
  const listings: MarketplaceListing[] = [];
  const targetCount = Math.min(50, Math.max(30, cards.length * 5));

  for (let i = 0; i < targetCount; i++) {
    const cardIdx = Math.floor(seededRange(seed, i * 100, 0, cards.length));
    const card = cards[cardIdx];
    const fairValue = card.currentValue ?? card.purchasePrice;
    if (fairValue <= 0) continue;

    const platform = ALL_PLATFORMS[Math.floor(seededRange(seed, i * 100 + 1, 0, ALL_PLATFORMS.length))];

    // Price varies +-5% to +-25% from fair value
    const priceVariation = seededRange(seed, i * 100 + 2, -0.25, 0.25);
    // Bias: more listings slightly above fair value, fewer great deals
    const biasFactor = seededRange(seed, i * 100 + 3, -0.05, 0.10);
    const listPrice = Math.max(
      1,
      Math.round(fairValue * (1 + priceVariation + biasFactor) * 100) / 100
    );

    const sellerRating = Math.round(seededRange(seed, i * 100 + 4, 70, 100));
    const listingAge = Math.round(seededRange(seed, i * 100 + 5, 0, 30));

    const cardDescription = `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`;

    listings.push({
      id: `listing_${seed}_${i}`,
      cardId: card.id,
      player: card.player,
      cardDescription,
      sport: card.sport,
      platform,
      listPrice,
      fairValue,
      condition: card.condition,
      isGraded: card.isGraded,
      grade: card.grade,
      sellerRating,
      listingAge,
      imageUrl: card.image,
      endTime: platform === 'eBay' && seededRandom(seed, i * 100 + 6) > 0.5
        ? new Date(Date.now() + seededRange(seed, i * 100 + 7, 1, 72) * 3600000).toISOString()
        : undefined,
    });
  }

  return listings;
}

// ---- Deal Scoring ----

export function scoreDeal(listing: MarketplaceListing, fairValue: number): {
  dealScore: number;
  savingsAmount: number;
  savingsPercent: number;
} {
  if (fairValue <= 0) {
    return { dealScore: 0, savingsAmount: 0, savingsPercent: 0 };
  }

  const savingsAmount = Math.round((fairValue - listing.listPrice) * 100) / 100;
  const savingsPercent = Math.round((savingsAmount / fairValue) * 10000) / 100;

  // Base score from savings percentage (0-60 points)
  const savingsScore = Math.max(0, Math.min(60, savingsPercent * 3));

  // Seller quality bonus (0-15 points)
  const sellerScore = (listing.sellerRating / 100) * 15;

  // Freshness bonus: newer listings score higher (0-10 points)
  const freshnessScore = Math.max(0, 10 - listing.listingAge * 0.33);

  // Platform fee penalty: higher fees reduce deal quality (0-15 points)
  const fee = PLATFORM_FEES[listing.platform];
  const feeScore = (1 - fee / 0.15) * 15;

  const rawScore = savingsScore + sellerScore + freshnessScore + feeScore;
  const dealScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return { dealScore, savingsAmount, savingsPercent };
}

// ---- Find Arbitrage ----

export function findArbitrage(listings: MarketplaceListing[]): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  // Group listings by cardId
  const byCard = new Map<string, MarketplaceListing[]>();
  for (const l of listings) {
    const arr = byCard.get(l.cardId) || [];
    arr.push(l);
    byCard.set(l.cardId, arr);
  }

  for (const [, cardListings] of byCard) {
    if (cardListings.length < 2) continue;

    // Sort by list price ascending
    const sorted = [...cardListings].sort((a, b) => a.listPrice - b.listPrice);

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const buyListing = sorted[i];
        const sellListing = sorted[j];

        // Only consider cross-platform arbitrage
        if (buyListing.platform === sellListing.platform) continue;

        const buyFee = Math.round(buyListing.listPrice * PLATFORM_FEES[buyListing.platform] * 100) / 100;
        const sellFee = Math.round(sellListing.listPrice * PLATFORM_FEES[sellListing.platform] * 100) / 100;

        const totalCost = buyListing.listPrice + buyFee;
        const netRevenue = sellListing.listPrice - sellFee;
        const netProfit = Math.round((netRevenue - totalCost) * 100) / 100;

        if (netProfit <= 0) continue;

        const profitPercent = Math.round((netProfit / totalCost) * 10000) / 100;

        // Risk assessment
        let riskLevel: ArbitrageOpportunity['riskLevel'] = 'low';
        if (profitPercent < 5 || buyListing.sellerRating < 85) riskLevel = 'high';
        else if (profitPercent < 10 || buyListing.sellerRating < 92) riskLevel = 'medium';

        opportunities.push({
          id: `arb_${buyListing.id}_${sellListing.id}`,
          buyListing,
          sellPlatform: sellListing.platform,
          buyPrice: buyListing.listPrice,
          sellPrice: sellListing.listPrice,
          buyFee,
          sellFee,
          netProfit,
          profitPercent,
          riskLevel,
        });
      }
    }
  }

  // Sort by net profit descending, keep top 20
  return opportunities.sort((a, b) => b.netProfit - a.netProfit).slice(0, 20);
}

// ---- Find Deals ----

export function findDeals(listings: MarketplaceListing[], filters?: DealFilter): Deal[] {
  let filtered = [...listings];

  if (filters?.sport) {
    filtered = filtered.filter(l => l.sport === filters.sport);
  }
  if (filters?.platform) {
    filtered = filtered.filter(l => l.platform === filters.platform);
  }
  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter(l => l.listPrice <= filters.maxPrice!);
  }

  const deals: Deal[] = filtered.map(listing => {
    const { dealScore, savingsAmount, savingsPercent } = scoreDeal(listing, listing.fairValue);
    const platformFee = Math.round(listing.listPrice * PLATFORM_FEES[listing.platform] * 100) / 100;
    const afterFees = Math.round((listing.listPrice + platformFee) * 100) / 100;

    let recommendation: Deal['recommendation'] = 'overpriced';
    if (dealScore >= 75) recommendation = 'strong_buy';
    else if (dealScore >= 50) recommendation = 'buy';
    else if (dealScore >= 30) recommendation = 'fair';

    return {
      id: `deal_${listing.id}`,
      listing,
      dealScore,
      savingsAmount,
      savingsPercent,
      afterFees,
      platformFee,
      recommendation,
    };
  });

  // Apply minimum score filter
  const minScore = filters?.minScore ?? 0;
  const minSavings = filters?.minSavings ?? -Infinity;
  const scored = deals.filter(d => d.dealScore >= minScore && d.savingsAmount >= minSavings);

  // Sort
  const sortBy = filters?.sortBy ?? 'score';
  scored.sort((a, b) => {
    switch (sortBy) {
      case 'score': return b.dealScore - a.dealScore;
      case 'savings': return b.savingsAmount - a.savingsAmount;
      case 'price': return a.listing.listPrice - b.listing.listPrice;
      case 'recent': return a.listing.listingAge - b.listing.listingAge;
      default: return b.dealScore - a.dealScore;
    }
  });

  return scored;
}

// ---- Deal Alerts ----

interface WatchlistItem {
  id: string;
  player: string;
  targetPrice: number;
  cardDescription?: string;
  sport?: Sport;
}

export function getDealAlerts(
  listings: MarketplaceListing[],
  watchlist: WatchlistItem[]
): DealAlert[] {
  const alerts: DealAlert[] = [];

  for (const item of watchlist) {
    // Match listings to watchlist items by player name (case-insensitive)
    const matched = listings.filter(l =>
      l.player.toLowerCase().includes(item.player.toLowerCase()) &&
      l.listPrice <= item.targetPrice
    );

    for (const listing of matched) {
      const priceDiff = Math.round((item.targetPrice - listing.listPrice) * 100) / 100;
      const priceDiffPercent = item.targetPrice > 0
        ? Math.round((priceDiff / item.targetPrice) * 10000) / 100
        : 0;

      alerts.push({
        id: `alert_${listing.id}_${item.id}`,
        listing,
        watchlistItemId: item.id,
        watchlistPlayer: item.player,
        targetPrice: item.targetPrice,
        currentPrice: listing.listPrice,
        priceDiff,
        priceDiffPercent,
        triggeredAt: new Date().toISOString(),
      });
    }
  }

  // Sort by biggest savings first
  return alerts.sort((a, b) => b.priceDiffPercent - a.priceDiffPercent);
}

// ---- Summary Stats ----

export function getDealSummary(deals: Deal[], arbitrage: ArbitrageOpportunity[]): {
  totalDeals: number;
  topDealScore: number;
  totalSavings: number;
  arbitrageCount: number;
  totalArbitrageProfit: number;
} {
  const goodDeals = deals.filter(d => d.dealScore >= 50);
  return {
    totalDeals: goodDeals.length,
    topDealScore: goodDeals.length > 0 ? goodDeals[0].dealScore : 0,
    totalSavings: Math.round(goodDeals.reduce((s, d) => s + Math.max(0, d.savingsAmount), 0) * 100) / 100,
    arbitrageCount: arbitrage.length,
    totalArbitrageProfit: Math.round(arbitrage.reduce((s, a) => s + a.netProfit, 0) * 100) / 100,
  };
}

function ebayListingToMarketplaceListing(
  card: CardInventory,
  item: { price: number; title: string; itemId: string; condition: string; date?: string },
): MarketplaceListing {
  const fairValue = card.currentValue ?? card.purchasePrice ?? item.price;
  return {
    id: `ebay_${item.itemId}`,
    cardId: card.id,
    player: card.player,
    cardDescription: item.title,
    sport: card.sport,
    platform: 'eBay',
    listPrice: item.price,
    fairValue,
    condition: item.condition,
    isGraded: card.isGraded,
    grade: card.grade,
    sellerRating: 92,
    listingAge: item.date
      ? Math.max(0, Math.floor((Date.now() - new Date(item.date).getTime()) / 86400000))
      : 0,
    imageUrl: card.image,
  };
}

/**
 * Fetch listings: live eBay when USE_REAL_EBAY, else seeded mock listings.
 */
export async function fetchListings(cards: CardInventory[]): Promise<MarketplaceListing[]> {
  const mockListings = generateListings(cards);

  if (!isFeatureEnabled('USE_REAL_EBAY') || cards.length === 0) {
    return mockListings;
  }

  const liveListings: MarketplaceListing[] = [];
  const sample = cards.slice(0, 5);

  for (const card of sample) {
    try {
      const market = await ebayAdapter.getMarketData({
        playerName: card.player,
        cardYear: card.year ? String(card.year) : undefined,
        cardSet: card.set,
        cardNumber: card.cardNumber,
        grade: card.isGraded ? card.grade : undefined,
        soldOnly: false,
        limit: 8,
      });

      for (const sale of market.recentSales.slice(0, 5)) {
        liveListings.push(ebayListingToMarketplaceListing(card, sale));
      }
    } catch (err) {
      logger.warn('[dealFinder] eBay listing fetch failed for card', card.id, err);
    }
  }

  if (liveListings.length === 0) {
    return mockListings;
  }

  const liveIds = new Set(liveListings.map((l) => l.id));
  const filler = mockListings.filter((l) => !liveIds.has(l.id)).slice(0, Math.max(0, 30 - liveListings.length));
  return [...liveListings, ...filler];
}
