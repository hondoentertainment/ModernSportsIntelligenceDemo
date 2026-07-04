import { serverApiRequestAuthenticated } from '../serverApi';

// eBay API Integration for Sports Card Pricing
export interface EbayConfig {
  sandbox?: boolean;
}

export interface EbayPrice {
  value: string;
  currency: string;
}

export interface EbayItemSummary {
  itemId?: string;
  title?: string;
  price?: EbayPrice;
  condition?: string;
  itemCreationDate?: string;
}

export interface EbaySearchResponse {
  itemSummaries?: EbayItemSummary[];
  total?: number;
  href?: string;
  next?: string;
}

export const ebayApi = {
  config: { sandbox: false } as EbayConfig,

  initialize(config: EbayConfig) {
    this.config = { ...this.config, ...config };
  },

  isAvailable() {
    return true;
  },

  /** Server-side OAuth only — confirms EBAY_CLIENT_ID / EBAY_CLIENT_SECRET; does not return a token. */
  async verifyCredentials(): Promise<void> {
    const data = await serverApiRequestAuthenticated<{ ok?: boolean }>('/api/market/ebay', {
      method: 'POST',
      body: JSON.stringify({ action: 'verify', sandbox: !!this.config.sandbox }),
    });
    if (!data?.ok) {
      throw new Error('eBay credential verify failed');
    }
  },

  async searchSportsCards(params: {
    playerName: string;
    cardYear?: string;
    cardSet?: string;
    cardNumber?: string;
    grading?: string;
    condition?: string;
    maxPrice?: number;
    limit?: number;
    /** Browse API offset for pagination (see eBay item_summary/search). */
    offset?: number;
    sort?: string;
    soldOnly?: boolean;
  }): Promise<EbaySearchResponse> {
    const { soldOnly: _legacy, ...apiParams } = params;
    return serverApiRequestAuthenticated<EbaySearchResponse>('/api/market/ebay', {
      method: 'POST',
      body: JSON.stringify({
        action: 'search',
        sandbox: !!this.config.sandbox,
        params: apiParams,
      }),
    });
  },

  // Get market value estimate from eBay sold listings
  async getMarketValue(params: {
    playerName: string;
    cardYear?: string;
    cardSet?: string;
    cardNumber?: string;
    grading?: string;
    daysBack?: number;
    /** Pages of 100 to aggregate (Browse API offset pagination). Default 3. */
    maxPages?: number;
  }): Promise<{
    averagePrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    totalListings: number;
    recentSales: Array<{
      price: number;
      date: string;
      condition: string;
      title: string;
      itemId: string;
    }>;
  }> {
    // Browse API returns active listings; `soldOnly` is reserved for future sold-comp feeds.
    const PAGE_SIZE = 100;
    const maxPages = Math.max(1, params.maxPages ?? 3);
    const { maxPages: _mp, ...searchParams } = params;

    const itemSummaries: EbayItemSummary[] = [];
    for (let page = 0; page < maxPages; page++) {
      let results: EbaySearchResponse;
      try {
        results = await this.searchSportsCards({
          ...searchParams,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          sort: 'price',
        });
      } catch (err) {
        // First page failing means no data at all — let the caller's
        // degraded-fallback handle it. A later page failing should not
        // discard the comps already collected; aggregate what we have.
        if (page === 0) throw err;
        break;
      }
      const pageItems = results.itemSummaries ?? [];
      itemSummaries.push(...pageItems);
      // Stop when the API is exhausted: a short page always means the end;
      // the reported total only gates when the API actually sent one —
      // otherwise a full page keeps the walk going up to maxPages.
      if (pageItems.length < PAGE_SIZE) break;
      if (results.total != null && itemSummaries.length >= results.total) break;
    }

    if (itemSummaries.length === 0) {
      return {
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        recentSales: []
      };
    }

    // Extract pricing data
    const prices: number[] = [];
    const sales: Array<{ price: number; date: string; condition: string; title: string; itemId: string }> = [];

    itemSummaries.forEach((item: EbayItemSummary) => {
      if (item.price && item.price.value) {
        const price = parseFloat(item.price.value);
        prices.push(price);

        sales.push({
          price,
          date: item.itemCreationDate || new Date().toISOString(),
          condition: item.condition || 'Unknown',
          title: item.title || '',
          itemId: item.itemId || ''
        });
      }
    });

    if (prices.length === 0) {
      return {
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        recentSales: []
      };
    }

    // Calculate statistics
    prices.sort((a, b) => a - b);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];
    const priceRange = {
      min: prices[0],
      max: prices[prices.length - 1]
    };

    // Sort sales by date (newest first)
    sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      averagePrice: Math.round(averagePrice * 100) / 100,
      medianPrice,
      priceRange,
      totalListings: prices.length,
      recentSales: sales.slice(0, 10) // Return top 10 recent sales
    };
  },

  async getItemDetails(itemId: string): Promise<EbayItemSummary> {
    return serverApiRequestAuthenticated<EbayItemSummary>('/api/market/ebay', {
      method: 'POST',
      body: JSON.stringify({
        action: 'item',
        sandbox: !!this.config.sandbox,
        itemId,
      }),
    });
  },

  async testConnection(): Promise<string> {
    try {
      await this.verifyCredentials();
      return 'eBay API connection successful';
    } catch (error) {
      return `eBay API connection failed: ${error}`;
    }
  }
};