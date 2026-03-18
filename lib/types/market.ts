/**
 * Market & pricing types for marketplace API adapters.
 */

/** A single marketplace listing */
export interface MarketListing {
  id: string;
  source: 'ebay' | 'comc' | 'goldin' | 'heritage' | 'pwcc' | 'myslabs';
  title: string;
  price: number;
  currency: string;
  condition: string;
  grade?: string;
  gradingCompany?: string;
  imageUrl?: string;
  listingUrl?: string;
  endDate?: string;
  isSold: boolean;
  soldDate?: string;
  sellerName?: string;
  sellerRating?: number;
}

/** Aggregated price data from multiple sources */
export interface PriceAggregate {
  averagePrice: number;
  medianPrice: number;
  lowPrice: number;
  highPrice: number;
  totalListings: number;
  soldListings: number;
  /** Price trend: positive = up, negative = down */
  trendPercent: number;
  /** Period for trend calculation (e.g., '30d', '90d') */
  trendPeriod: string;
  sources: string[];
  lastUpdated: string;
}

/** Historical price point for charts */
export interface PricePoint {
  date: string;
  price: number;
  source: string;
  volume?: number;
}

/** Market price with context */
export interface MarketPrice {
  cardIdentifier: string;
  raw: PriceAggregate;
  graded: Record<string, PriceAggregate>;
  priceHistory: PricePoint[];
  lastUpdated: string;
}

/** Marketplace search parameters */
export interface MarketSearchParams {
  playerName: string;
  year?: string;
  set?: string;
  cardNumber?: string;
  grade?: string;
  gradingCompany?: string;
  soldOnly?: boolean;
  daysBack?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
}
