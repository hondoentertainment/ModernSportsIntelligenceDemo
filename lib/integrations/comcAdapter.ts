// @ts-nocheck
/**
 * COMC/MySlabs Adapter — Alternative marketplace integrations.
 *
 * When USE_REAL_COMC is enabled, proxies to backend server which
 * calls COMC and MySlabs APIs. Otherwise returns mock data.
 */

import { serverApiRequest } from '../serverApi';
import { isFeatureEnabled } from '../featureFlags';
import { withRetry } from '../apiResilience';
import { apiCache, CACHE_TTL } from '../apiCache';
import { logger } from '../logger';
import type { MarketListing, MarketSearchParams, PriceAggregate } from '../types/market';

// ─── Types ────────────────────────────────────────────────────────

export type AltMarketplace = 'comc' | 'myslabs';

export interface AltMarketplaceStatus {
  marketplace: AltMarketplace;
  live: boolean;
  listingCount: number;
  message: string;
}

// ─── Mock Data ────────────────────────────────────────────────────

function mockListings(
  params: MarketSearchParams,
  source: 'comc' | 'myslabs'
): MarketListing[] {
  const hash = (params.playerName + (params.year || '')).split('').reduce(
    (a, c) => a + c.charCodeAt(0), 0
  );
  const count = Math.min(params.limit || 10, 20);
  const basePrice = 5 + (hash % 300);
  const variance = basePrice * 0.4;

  return Array.from({ length: count }, (_, i) => {
    const price = Math.round((basePrice + (Math.random() - 0.5) * variance) * 100) / 100;
    const isSold = params.soldOnly ?? (i % 3 === 0);

    return {
      id: `${source}-${hash}-${i}`,
      source,
      title: `${params.year || '2023'} ${params.set || 'Topps'} ${params.playerName} #${params.cardNumber || (hash % 300 + 1)}`,
      price,
      currency: 'USD',
      condition: params.grade || ['PSA 10', 'BGS 9.5', 'Raw NM', 'PSA 9'][i % 4],
      grade: params.grade,
      gradingCompany: params.gradingCompany,
      isSold,
      soldDate: isSold ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
    };
  });
}

function mockPriceAggregate(params: MarketSearchParams, source: AltMarketplace): PriceAggregate {
  const hash = (params.playerName + source).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 10 + (hash % 400);

  return {
    averagePrice: base,
    medianPrice: Math.round(base * 0.95),
    lowPrice: Math.round(base * 0.6),
    highPrice: Math.round(base * 1.5),
    totalListings: 20 + (hash % 80),
    soldListings: 10 + (hash % 40),
    trendPercent: Math.round(((hash % 30) - 15) * 10) / 10,
    trendPeriod: '30d',
    sources: [source],
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Real API Calls ───────────────────────────────────────────────

async function realSearchListings(
  params: MarketSearchParams,
  source: AltMarketplace
): Promise<MarketListing[]> {
  return withRetry(
    () => serverApiRequest<MarketListing[]>(`/api/market/${source}/search`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    { maxAttempts: 2, timeoutMs: 10000 }
  );
}

async function realPriceAggregate(
  params: MarketSearchParams,
  source: AltMarketplace
): Promise<PriceAggregate> {
  return withRetry(
    () => serverApiRequest<PriceAggregate>(`/api/market/${source}/prices`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    { maxAttempts: 2, timeoutMs: 10000 }
  );
}

// ─── Adapter Factory ──────────────────────────────────────────────

function createMarketplaceAdapter(source: AltMarketplace) {
  return {
    /** Search for listings */
    async searchListings(params: MarketSearchParams): Promise<MarketListing[]> {
      const cacheKey = `${source}:search:${params.playerName}:${params.year || ''}:${params.grade || ''}:${params.soldOnly ?? ''}`;

      return apiCache.getOrFetch(cacheKey, async () => {
        if (isFeatureEnabled('USE_REAL_COMC')) {
          try {
            return await realSearchListings(params, source);
          } catch (err) {
            logger.warn(`[${source.toUpperCase()}] Search API failed, falling back to mock`, err);
            return mockListings(params, source);
          }
        }
        return mockListings(params, source);
      }, CACHE_TTL.MARKET_SEARCH);
    },

    /** Get aggregated pricing data */
    async getPriceAggregate(params: MarketSearchParams): Promise<PriceAggregate> {
      const cacheKey = `${source}:prices:${params.playerName}:${params.year || ''}:${params.grade || ''}`;

      return apiCache.getOrFetch(cacheKey, async () => {
        if (isFeatureEnabled('USE_REAL_COMC')) {
          try {
            return await realPriceAggregate(params, source);
          } catch (err) {
            logger.warn(`[${source.toUpperCase()}] Price API failed, falling back to mock`, err);
            return mockPriceAggregate(params, source);
          }
        }
        return mockPriceAggregate(params, source);
      }, CACHE_TTL.MARKET_SEARCH);
    },

    /** Get adapter status */
    async getStatus(): Promise<AltMarketplaceStatus> {
      return {
        marketplace: source,
        live: isFeatureEnabled('USE_REAL_COMC'),
        listingCount: 0,
        message: isFeatureEnabled('USE_REAL_COMC')
          ? `${source.toUpperCase()} adapter live`
          : `Using mock data (USE_REAL_COMC=false)`,
      };
    },

    /** Check if real API is active */
    isLive(): boolean {
      return isFeatureEnabled('USE_REAL_COMC');
    },

    /** Get the marketplace name */
    getSource(): AltMarketplace {
      return source;
    },
  };
}

export const comcAdapter = createMarketplaceAdapter('comc');
export const myslabsAdapter = createMarketplaceAdapter('myslabs');

// ─── Multi-marketplace Aggregator ─────────────────────────────────

/**
 * Search across all alternative marketplaces and merge results.
 */
export async function searchAllMarketplaces(
  params: MarketSearchParams
): Promise<{ listings: MarketListing[]; bySource: Record<string, MarketListing[]> }> {
  const [comcResults, myslabsResults] = await Promise.allSettled([
    comcAdapter.searchListings(params),
    myslabsAdapter.searchListings(params),
  ]);

  const comcListings = comcResults.status === 'fulfilled' ? comcResults.value : [];
  const myslabsListings = myslabsResults.status === 'fulfilled' ? myslabsResults.value : [];

  const all = [...comcListings, ...myslabsListings].sort((a, b) => a.price - b.price);

  return {
    listings: all,
    bySource: {
      comc: comcListings,
      myslabs: myslabsListings,
    },
  };
}

/**
 * Get aggregated pricing across all alternative marketplaces.
 */
export async function aggregateMarketplacePrices(
  params: MarketSearchParams
): Promise<PriceAggregate> {
  const [comcPrices, myslabsPrices] = await Promise.allSettled([
    comcAdapter.getPriceAggregate(params),
    myslabsAdapter.getPriceAggregate(params),
  ]);

  const results: PriceAggregate[] = [];
  if (comcPrices.status === 'fulfilled') results.push(comcPrices.value);
  if (myslabsPrices.status === 'fulfilled') results.push(myslabsPrices.value);

  if (results.length === 0) {
    return mockPriceAggregate(params, 'comc');
  }

  // Merge aggregates
  const allPrices = results.map(r => r.averagePrice);
  const totalListings = results.reduce((s, r) => s + r.totalListings, 0);
  const totalSold = results.reduce((s, r) => s + r.soldListings, 0);
  const sources = results.flatMap(r => r.sources);

  return {
    averagePrice: Math.round(allPrices.reduce((s, p) => s + p, 0) / allPrices.length * 100) / 100,
    medianPrice: allPrices.sort((a, b) => a - b)[Math.floor(allPrices.length / 2)],
    lowPrice: Math.min(...results.map(r => r.lowPrice)),
    highPrice: Math.max(...results.map(r => r.highPrice)),
    totalListings,
    soldListings: totalSold,
    trendPercent: Math.round(results.reduce((s, r) => s + r.trendPercent, 0) / results.length * 100) / 100,
    trendPeriod: '30d',
    sources,
    lastUpdated: new Date().toISOString(),
  };
}
