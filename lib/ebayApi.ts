// eBay API Integration for Sports Card Pricing
export interface EbayConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
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
  // Initialize eBay API configuration
  config: null as EbayConfig | null,
  
  // Set API configuration
  initialize(config: EbayConfig) {
    this.config = config;
  },
  
  // Get base URL for API calls
  getBaseUrl() {
    if (!this.config) {
      throw new Error('eBay API not initialized');
    }
    return this.config.sandbox 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
  },

  // Get OAuth token
  async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('eBay API not initialized');
    }

    const baseUrl = this.getBaseUrl();
    const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    
    const response = await fetch(`${baseUrl}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    if (!response.ok) {
      throw new Error(`Failed to get eBay access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  },

  // Search for sports cards
  async searchSportsCards(params: {
    playerName: string;
    cardYear?: string;
    cardSet?: string;
    cardNumber?: string;
    grading?: string;
    condition?: string;
    maxPrice?: number;
    limit?: number;
  }): Promise<EbaySearchResponse> {
    const token = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();
    
    // Build search query
    let query = `${params.playerName} card`;
    if (params.cardYear) query += ` ${params.cardYear}`;
    if (params.cardSet) query += ` ${params.cardSet}`;
    if (params.cardNumber) query += ` ${params.cardNumber}`;
    
    // Build filters
    const filters = [];
    if (params.maxPrice) {
      filters.push(`price:[0..${params.maxPrice}]`);
    }
    if (params.condition) {
      filters.push(`condition:${params.condition}`);
    }
    
    // Sports cards category IDs
    const sportsCategories = [213, 50132, 2737, 175690, 3034]; // Baseball, Basketball, Football, Hockey, Trading Cards
    
    const searchParams = new URLSearchParams({
      q: query,
      category_ids: sportsCategories.join(','),
      limit: (params.limit || 50).toString(),
      sort: 'price',
      filter: filters.join(','),
      fieldgroups: 'EXTENDED'
    });

    const response = await fetch(
      `${baseUrl}/buy/browse/v1/item_summary/search?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'Accept-Language': 'en-US'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`eBay API search failed: ${response.statusText}`);
    }

    return await response.json();
  },

  // Get market value estimate from eBay sold listings
  async getMarketValue(params: {
    playerName: string;
    cardYear?: string;
    cardSet?: string;
    cardNumber?: string;
    grading?: string;
    daysBack?: number;
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
    // Search for sold items
    const searchResults = await this.searchSportsCards({
      ...params,
      limit: 100
    });

    if (!searchResults.itemSummaries || searchResults.itemSummaries.length === 0) {
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
    const sales = [];

    searchResults.itemSummaries.forEach((item: EbayItemSummary) => {
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

  // Get item details by item ID
  async getItemDetails(itemId: string): Promise<EbayItemSummary> {
    const token = await this.getAccessToken();
    const baseUrl = this.getBaseUrl();
    
    const response = await fetch(
      `${baseUrl}/buy/browse/v1/item/${itemId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get item details: ${response.statusText}`);
    }

    return await response.json();
  },

  // Test connection
  async testConnection(): Promise<string> {
    try {
      await this.getAccessToken();
      return 'eBay API connection successful';
    } catch (error) {
      return `eBay API connection failed: ${error}`;
    }
  }
};