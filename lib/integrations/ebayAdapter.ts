/**
 * eBay Adapter — Enhanced marketplace integration.
 *
 * Wraps the existing ebayApi module with:
 * - Feature flag support (USE_REAL_EBAY)
 * - Response caching with TTL
 * - Completed/sold item filtering
 * - Multi-page result aggregation
 * - Mock data fallback for development
 */

import { ebayApi } from '../utils/ebayApi';
import { isFeatureEnabled } from '../featureFlags';
import { apiCache, CACHE_TTL } from '../apiCache';
import { store } from '../dal/syncStore';
import { logger } from '../logger';

export interface EbayMarketData {
  averagePrice: number;
  medianPrice: number;
  lowPrice: number;
  highPrice: number;
  totalListings: number;
  soldListings: number;
  trendPercent: number;
  recentSales: Array<{
    price: number;
    date: string;
    condition: string;
    title: string;
    itemId: string;
    isSold: boolean;
  }>;
  lastUpdated: string;
  /**
   * Where the numbers came from. Mock data must never be presented as live
   * comps; `stale` is a real comp set from an earlier successful live call,
   * served because the live API is currently failing.
   */
  source: 'live' | 'mock' | 'stale';
  /** Set when the live API was requested but failed and a fallback was substituted. */
  degradedReason?: string;
}

export interface EbaySearchParams {
  playerName: string;
  cardYear?: string;
  cardSet?: string;
  cardNumber?: string;
  grade?: string;
  soldOnly?: boolean;
  daysBack?: number;
  maxPrice?: number;
  limit?: number;
}

/**
 * Price trend from sale history: percent change between the average of the
 * older half and the newer half of sales, sorted by date. Returns 0 when
 * there are fewer than 4 sales (not enough signal to split).
 */
export function computeTrendPercent(sales: Array<{ price: number; date: string }>): number {
  if (sales.length < 4) return 0;
  const sorted = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const mid = Math.floor(sorted.length / 2);
  const avg = (xs: Array<{ price: number }>) => xs.reduce((s, x) => s + x.price, 0) / xs.length;
  const older = avg(sorted.slice(0, mid));
  const newer = avg(sorted.slice(mid));
  if (older <= 0) return 0;
  return Math.round(((newer - older) / older) * 100 * 100) / 100;
}

// ─── Last-known-good comps ────────────────────────────────────────
//
// Every successful live comp set is persisted per
// (player, year, set, cardNumber, grade, soldOnly) via the DAL. When a later
// live call fails, the degraded fallback serves the last-known-good set
// labeled `source: 'stale'` instead of jumping straight to mock numbers.

const LKG_KEY_BASE = 'msi_ebay_lkg_comps_v1';

function lkgKey(params: EbaySearchParams): string {
  return `${LKG_KEY_BASE}:${[
    params.playerName,
    params.cardYear ?? '',
    params.cardSet ?? '',
    params.cardNumber ?? '',
    params.grade ?? '',
    String(params.soldOnly ?? true),
  ]
    .join('|')
    .toLowerCase()}`;
}

function saveLastKnownGood(params: EbaySearchParams, data: EbayMarketData): void {
  try {
    store.set(lkgKey(params), data);
  } catch (err) {
    logger.warn('[eBay] failed to persist last-known-good comps', err);
  }
}

function getLastKnownGood(params: EbaySearchParams): EbayMarketData | null {
  const cached = store.get<EbayMarketData | null>(lkgKey(params), null);
  return cached && cached.source === 'live' ? cached : null;
}

// ─── Mock Data ────────────────────────────────────────────────────

function generateMockMarketData(params: EbaySearchParams, degradedReason?: string): EbayMarketData {
  // Generate realistic mock data based on input
  const hash = (params.playerName + (params.cardYear || '')).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = 10 + (hash % 500);
  const variance = basePrice * 0.3;

  const sales = Array.from({ length: 10 }, (_, i) => ({
    price: Math.round((basePrice + (Math.random() - 0.5) * variance) * 100) / 100,
    date: new Date(Date.now() - i * 86400000 * (1 + Math.random() * 3)).toISOString(),
    condition: params.grade || ['PSA 10', 'PSA 9', 'BGS 9.5', 'Raw NM'][i % 4],
    title: `${params.cardYear || '2023'} ${params.cardSet || 'Topps Chrome'} ${params.playerName} #${params.cardNumber || (hash % 300 + 1)}`,
    itemId: `v1|${200000000000 + hash + i}|0`,
    isSold: params.soldOnly !== false,
  }));

  const prices = sales.map(s => s.price).sort((a, b) => a - b);

  return {
    averagePrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length * 100) / 100,
    medianPrice: prices[Math.floor(prices.length / 2)],
    lowPrice: prices[0],
    highPrice: prices[prices.length - 1],
    totalListings: 15 + (hash % 50),
    soldListings: sales.length,
    trendPercent: Math.round((Math.random() - 0.4) * 20 * 100) / 100,
    recentSales: sales,
    lastUpdated: new Date().toISOString(),
    source: 'mock',
    ...(degradedReason ? { degradedReason } : {}),
  };
}

// ─── Public API ───────────────────────────────────────────────────

export const ebayAdapter = {
  /** Get market data with caching and feature flag support */
  async getMarketData(params: EbaySearchParams): Promise<EbayMarketData> {
    const cacheKey = `ebay:market:${params.playerName}:${params.cardYear || ''}:${params.grade || ''}:${params.soldOnly ?? true}`;

    return apiCache.getOrFetch(cacheKey, async () => {
      if (isFeatureEnabled('USE_REAL_EBAY')) {
        try {
          const result = await ebayApi.getMarketValue({
            playerName: params.playerName,
            cardYear: params.cardYear,
            cardSet: params.cardSet,
            cardNumber: params.cardNumber,
            grading: params.grade,
            daysBack: params.daysBack,
          });

          const recentSales = result.recentSales.map(s => ({
            ...s,
            isSold: true,
          }));
          const liveData: EbayMarketData = {
            averagePrice: result.averagePrice,
            medianPrice: result.medianPrice,
            lowPrice: result.priceRange.min,
            highPrice: result.priceRange.max,
            totalListings: result.totalListings,
            soldListings: recentSales.length,
            trendPercent: computeTrendPercent(recentSales),
            recentSales,
            lastUpdated: new Date().toISOString(),
            source: 'live' as const,
          };
          saveLastKnownGood(params, liveData);
          return liveData;
        } catch (err) {
          const degradedReason = `Live eBay request failed: ${err instanceof Error ? err.message : String(err)}`;
          const lastKnownGood = getLastKnownGood(params);
          if (lastKnownGood) {
            logger.warn('[eBay] Real API failed, serving last-known-good comps', err);
            return { ...lastKnownGood, source: 'stale' as const, degradedReason };
          }
          logger.warn('[eBay] Real API failed, falling back to mock', err);
          return generateMockMarketData(params, degradedReason);
        }
      }

      return generateMockMarketData(params);
    }, CACHE_TTL.MARKET_SEARCH);
  },

  /** Search for active or sold listings */
  async searchListings(params: EbaySearchParams) {
    const cacheKey = `ebay:search:${JSON.stringify(params)}`;

    return apiCache.getOrFetch(cacheKey, async () => {
      if (isFeatureEnabled('USE_REAL_EBAY')) {
        try {
          return await ebayApi.searchSportsCards({
            playerName: params.playerName,
            cardYear: params.cardYear,
            cardSet: params.cardSet,
            cardNumber: params.cardNumber,
            grading: params.grade,
            maxPrice: params.maxPrice,
            limit: params.limit,
            soldOnly: params.soldOnly,
          });
        } catch (err) {
          logger.warn('[eBay] Search API failed, returning empty', err);
          return { itemSummaries: [], total: 0 };
        }
      }

      // Mock search results
      return { itemSummaries: [], total: 0 };
    }, CACHE_TTL.MARKET_SEARCH);
  },

  /** Check connection and adapter status */
  async getStatus(): Promise<{ live: boolean; message: string }> {
    if (!isFeatureEnabled('USE_REAL_EBAY')) {
      return { live: false, message: 'Using mock data (USE_REAL_EBAY=false)' };
    }
    try {
      const result = await ebayApi.testConnection();
      return { live: !result.includes('failed'), message: result };
    } catch (err) {
      return { live: false, message: `Connection failed: ${err}` };
    }
  },

  isLive(): boolean {
    return isFeatureEnabled('USE_REAL_EBAY');
  },
};
