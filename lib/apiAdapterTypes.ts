/**
 * @module apiAdapterTypes
 * @description Shared type definitions for the API adapter layer.
 *
 * This module defines all interfaces, enums, and type aliases consumed by
 * the adapter implementations in `apiAdapterLayer.ts`.  Every external
 * data-source contract is specified here so that live and mock adapters
 * share the exact same shape, enabling seamless hot-swapping at runtime.
 */

// ────────────────────────────────────────────────────────────────────────────
// 1. Configuration
// ────────────────────────────────────────────────────────────────────────────

/** API keys and feature flags read from environment variables. */
export interface ApiConfig {
  /** eBay Browse / Finding API key (VITE_EBAY_API_KEY) */
  ebayApiKey?: string;
  /** PSA Cert Verification / Pop Report API key */
  psaApiKey?: string;
  /** Yahoo Finance or Alpha Vantage API key */
  yahooFinanceKey?: string;
  /** SportRadar API key */
  sportRadarKey?: string;
  /** CoinGecko Pro API key */
  coingeckoKey?: string;
  /** Twitter / X API bearer token */
  twitterBearerToken?: string;
  /** Reddit API client id + secret (colon-separated) */
  redditClientCredentials?: string;
  /** Master switch: when false, all adapters return mock data regardless of keys */
  enabled: boolean;
}

/** Status of a single adapter at runtime. */
export type AdapterStatus = 'live' | 'mock' | 'error';

/** Map of adapter name to its current status. */
export type AdapterStatusMap = Record<string, AdapterStatus>;

// ────────────────────────────────────────────────────────────────────────────
// 2. Error classification
// ────────────────────────────────────────────────────────────────────────────

/** Broad categories for API failures used by the retry / circuit-breaker logic. */
export type ApiErrorCategory = 'network' | 'auth' | 'rate-limit' | 'data' | 'timeout' | 'unknown';

/** Structured error returned from every adapter method on failure. */
export interface ApiAdapterError {
  /** Machine-readable category for branching retry logic. */
  category: ApiErrorCategory;
  /** HTTP status code, if applicable. */
  statusCode?: number;
  /** Human-readable message (safe to log, never contains secrets). */
  message: string;
  /** The adapter that produced the error. */
  adapterName: string;
  /** Whether the caller should retry. */
  retryable: boolean;
  /** Suggested wait (ms) before next attempt (from Retry-After or backoff). */
  retryAfterMs?: number;
  /** Upstream error, if available. */
  cause?: unknown;
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Rate limiting & caching
// ────────────────────────────────────────────────────────────────────────────

/** Priority levels for the request queue. */
export type RequestPriority = 'realtime' | 'high' | 'normal' | 'batch';

/** Configuration for the token-bucket rate limiter. */
export interface RateLimitConfig {
  /** Max tokens (requests) the bucket can hold. */
  maxTokens: number;
  /** Tokens added per second. */
  refillRate: number;
  /** Initial fill (defaults to maxTokens). */
  initialTokens?: number;
}

/** Configuration for the in-memory TTL cache. */
export interface CacheConfig {
  /** Default TTL in milliseconds. */
  defaultTtlMs: number;
  /** Per-data-type TTL overrides (key = arbitrary label). */
  ttlOverrides?: Record<string, number>;
  /** Maximum number of entries before LRU eviction. */
  maxEntries: number;
}

/** Options attached to a single queued request. */
export interface RequestOptions {
  /** Queue priority (higher = dequeued sooner). */
  priority?: RequestPriority;
  /** AbortSignal for cooperative cancellation. */
  signal?: AbortSignal;
  /** Optional cache key; when provided, the layer checks the cache first. */
  cacheKey?: string;
  /** Override the default TTL for this specific request. */
  cacheTtlMs?: number;
  /** Maximum number of retry attempts (default: 3). */
  maxRetries?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Marketplace adapter types
// ────────────────────────────────────────────────────────────────────────────

/** Supported marketplace platforms. */
export type MarketplacePlatform = 'ebay' | 'comc' | 'myslabs' | 'starstock' | 'alt' | 'pwcc' | 'goldin';

/** A single marketplace listing in normalised form. */
export interface MarketplaceListing {
  id: string;
  platform: MarketplacePlatform;
  title: string;
  player: string;
  year: number;
  set: string;
  cardNumber: string;
  grade?: string;
  gradingCompany?: string;
  price: number;
  currency: string;
  shippingCost: number;
  condition: 'raw' | 'graded';
  sellerName: string;
  sellerRating: number;
  imageUrl: string;
  listingUrl: string;
  listedDate: string;
  endDate?: string;
  bestOfferEnabled: boolean;
  watchers: number;
}

/** Historical sale record. */
export interface SaleRecord {
  id: string;
  platform: MarketplacePlatform;
  title: string;
  player: string;
  year: number;
  set: string;
  cardNumber: string;
  grade?: string;
  gradingCompany?: string;
  salePrice: number;
  currency: string;
  saleDate: string;
  listingType: 'auction' | 'buy_it_now' | 'best_offer';
}

/** Search parameters accepted by the marketplace adapter. */
export interface MarketplaceSearchParams {
  query: string;
  player?: string;
  year?: number;
  set?: string;
  cardNumber?: string;
  grade?: string;
  gradingCompany?: string;
  platforms?: MarketplacePlatform[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'relevance';
  limit?: number;
  offset?: number;
}

/** Paginated search results from the marketplace adapter. */
export interface MarketplaceSearchResult {
  listings: MarketplaceListing[];
  totalResults: number;
  hasMore: boolean;
  nextOffset: number;
}

/** Historical sales query parameters. */
export interface SalesHistoryParams {
  player: string;
  year?: number;
  set?: string;
  cardNumber?: string;
  grade?: string;
  gradingCompany?: string;
  daysBack?: number;
  limit?: number;
}

/** Historical sales response. */
export interface SalesHistoryResult {
  sales: SaleRecord[];
  averagePrice: number;
  medianPrice: number;
  priceRange: { min: number; max: number };
  totalSales: number;
  trendDirection: 'up' | 'down' | 'stable';
}

/**
 * Adapter contract for marketplace data (eBay, COMC, MySlabs, etc.).
 *
 * Provides unified search across platforms, sale-history lookups,
 * and active-listing queries.
 */
export interface MarketplaceAdapter {
  /** Search listings across one or more platforms. */
  searchListings(params: MarketplaceSearchParams, opts?: RequestOptions): Promise<MarketplaceSearchResult>;
  /** Fetch completed-sale history for a card. */
  getSalesHistory(params: SalesHistoryParams, opts?: RequestOptions): Promise<SalesHistoryResult>;
  /** Fetch currently active listings for a specific card. */
  getActiveListings(params: SalesHistoryParams, opts?: RequestOptions): Promise<MarketplaceSearchResult>;
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Grading adapter types
// ────────────────────────────────────────────────────────────────────────────

/** Supported grading companies. */
export type GradingCompany = 'psa' | 'bgs' | 'sgc' | 'csg' | 'hga';

/** Submission tracking status. */
export type SubmissionStatus =
  | 'preparing'
  | 'shipped'
  | 'received'
  | 'grading'
  | 'graded'
  | 'shipped_back'
  | 'delivered';

/** A single entry in a population report. */
export interface PopulationReportEntry {
  grade: number;
  qualifier?: string;
  population: number;
  populationHigher: number;
  totalPopulation: number;
}

/** Full population report for a card. */
export interface PopulationReport {
  cardName: string;
  year: string;
  set: string;
  cardNumber: string;
  company: GradingCompany;
  entries: PopulationReportEntry[];
  lastUpdated: string;
  totalGraded: number;
}

/** Pop report query parameters. */
export interface PopReportParams {
  cardName: string;
  year?: string;
  set?: string;
  cardNumber?: string;
  company?: GradingCompany;
}

/** Submission tracking record. */
export interface SubmissionTrackingRecord {
  submissionId: string;
  company: GradingCompany;
  status: SubmissionStatus;
  cardCount: number;
  submittedDate: string;
  estimatedReturnDate: string;
  actualReturnDate?: string;
  certNumbers?: string[];
  trackingOutbound?: string;
  trackingReturn?: string;
}

/**
 * Adapter contract for grading-company data (PSA, BGS, SGC).
 *
 * Provides population reports and submission tracking.
 */
export interface GradingAdapter {
  /** Fetch population report for a specific card. */
  getPopulationReport(params: PopReportParams, opts?: RequestOptions): Promise<PopulationReport>;
  /** Look up the status of a grading submission by ID. */
  getSubmissionStatus(submissionId: string, company: GradingCompany, opts?: RequestOptions): Promise<SubmissionTrackingRecord>;
  /** List all tracked submissions for the current user. */
  listSubmissions(company?: GradingCompany, opts?: RequestOptions): Promise<SubmissionTrackingRecord[]>;
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Financial data adapter types
// ────────────────────────────────────────────────────────────────────────────

/** Supported financial asset symbols. */
export type FinancialAsset = 'sp500' | 'bitcoin' | 'gold' | 'treasuries' | 'realestate' | 'ethereum';

/** A single price data point. */
export interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Current quote for a financial asset. */
export interface AssetQuote {
  asset: FinancialAsset;
  label: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  timestamp: string;
}

/** Historical price series query parameters. */
export interface PriceHistoryParams {
  asset: FinancialAsset;
  /** Number of days of history (default: 90). */
  days?: number;
  /** Interval: 'daily' | 'weekly' | 'monthly' (default: 'daily'). */
  interval?: 'daily' | 'weekly' | 'monthly';
}

/** Historical price series result. */
export interface PriceHistoryResult {
  asset: FinancialAsset;
  dataPoints: PriceDataPoint[];
  periodReturn: number;
  periodHigh: number;
  periodLow: number;
}

/**
 * Adapter contract for financial / macro data.
 *
 * Powers the Cross-Asset Correlation Engine by providing S&P 500,
 * crypto, gold, and real-estate index prices.
 */
export interface FinancialDataAdapter {
  /** Get current quotes for one or more assets. */
  getQuotes(assets: FinancialAsset[], opts?: RequestOptions): Promise<AssetQuote[]>;
  /** Get historical price series for an asset. */
  getPriceHistory(params: PriceHistoryParams, opts?: RequestOptions): Promise<PriceHistoryResult>;
  /** Get correlation matrix between card portfolio returns and financial assets over N days. */
  getCorrelationMatrix(portfolioReturns: number[], assets: FinancialAsset[], days: number, opts?: RequestOptions): Promise<Record<FinancialAsset, number>>;
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Sports data adapter types
// ────────────────────────────────────────────────────────────────────────────

/** Supported sports for data feeds. */
export type SportsDataSport = 'mlb' | 'nba' | 'nfl' | 'nhl' | 'soccer';

/** Player bio / profile. */
export interface PlayerProfile {
  id: string;
  name: string;
  sport: SportsDataSport;
  team: string;
  position: string;
  age: number;
  height: string;
  weight: string;
  jerseyNumber?: string;
  imageUrl?: string;
  status: 'active' | 'injured' | 'suspended' | 'retired';
}

/** Stat line (generic key-value for flexibility across sports). */
export interface PlayerStatLine {
  playerId: string;
  season: string;
  sport: SportsDataSport;
  gamesPlayed: number;
  stats: Record<string, number | string>;
}

/** Injury report entry. */
export interface InjuryReport {
  playerId: string;
  playerName: string;
  team: string;
  sport: SportsDataSport;
  injuryType: string;
  bodyPart: string;
  status: 'out' | 'doubtful' | 'questionable' | 'probable' | 'day-to-day';
  reportDate: string;
  estimatedReturnDate?: string;
  details: string;
}

/** Scheduled game. */
export interface GameScheduleEntry {
  id: string;
  sport: SportsDataSport;
  homeTeam: string;
  awayTeam: string;
  scheduledDate: string;
  venue: string;
  broadcastNetwork?: string;
  status: 'scheduled' | 'in_progress' | 'final' | 'postponed';
  homeScore?: number;
  awayScore?: number;
}

/**
 * Adapter contract for sports data (SportRadar / ESPN).
 *
 * Powers the Injury Oracle, League Hubs, and live game impact features.
 */
export interface SportsDataAdapter {
  /** Get player profile by name or ID. */
  getPlayerProfile(playerIdOrName: string, sport: SportsDataSport, opts?: RequestOptions): Promise<PlayerProfile | null>;
  /** Get season stats for a player. */
  getPlayerStats(playerId: string, sport: SportsDataSport, season?: string, opts?: RequestOptions): Promise<PlayerStatLine | null>;
  /** Get current injury reports, optionally filtered by team or sport. */
  getInjuryReports(sport: SportsDataSport, team?: string, opts?: RequestOptions): Promise<InjuryReport[]>;
  /** Get upcoming schedule entries. */
  getSchedule(sport: SportsDataSport, daysAhead?: number, team?: string, opts?: RequestOptions): Promise<GameScheduleEntry[]>;
}

// ────────────────────────────────────────────────────────────────────────────
// 8. Social data adapter types
// ────────────────────────────────────────────────────────────────────────────

/** Supported social platforms. */
export type SocialPlatform = 'twitter' | 'reddit' | 'instagram' | 'youtube' | 'forums';

/** Sentiment classification. */
export type SentimentLevel = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

/** Aggregated sentiment for a topic / player. */
export interface SocialSentiment {
  topic: string;
  platform: SocialPlatform;
  sentimentScore: number; // -100 to 100
  volume: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  sentimentLevel: SentimentLevel;
  samplePosts: SocialPost[];
  keywords: string[];
  timestamp: string;
}

/** A single social media post. */
export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  authorFollowerCount: number;
  content: string;
  sentiment: number;
  engagementScore: number;
  timestamp: string;
  url: string;
}

/** Influencer tracking record. */
export interface InfluencerActivity {
  influencerId: string;
  username: string;
  platform: SocialPlatform;
  followerCount: number;
  action: 'mentioned' | 'bought' | 'sold' | 'graded' | 'listed' | 'reviewed';
  cardReference: string;
  timestamp: string;
  estimatedMarketImpact: number; // percentage
  reachEstimate: number;
}

/** Social sentiment query parameters. */
export interface SocialSentimentParams {
  topic: string;
  platforms?: SocialPlatform[];
  /** Number of hours of history to include (default: 24). */
  hoursBack?: number;
  limit?: number;
}

/**
 * Adapter contract for social media data.
 *
 * Powers the Collector Social Graph, Sentiment Radar, and
 * Influencer Impact features.
 */
export interface SocialDataAdapter {
  /** Get aggregated sentiment for a topic across platforms. */
  getSentiment(params: SocialSentimentParams, opts?: RequestOptions): Promise<SocialSentiment[]>;
  /** Get recent influencer activity related to sports cards. */
  getInfluencerActivity(opts?: RequestOptions): Promise<InfluencerActivity[]>;
  /** Get trending topics across social platforms. */
  getTrendingTopics(platforms?: SocialPlatform[], limit?: number, opts?: RequestOptions): Promise<{ topic: string; volume: number; sentiment: number }[]>;
}

// ────────────────────────────────────────────────────────────────────────────
// 9. Adapter registry types
// ────────────────────────────────────────────────────────────────────────────

/** Names of all registered adapters. */
export type AdapterName =
  | 'marketplace'
  | 'grading'
  | 'financial'
  | 'sports'
  | 'social';

/** Map from adapter name to its interface type (used by getAdapter<T>). */
export interface AdapterTypeMap {
  marketplace: MarketplaceAdapter;
  grading: GradingAdapter;
  financial: FinancialDataAdapter;
  sports: SportsDataAdapter;
  social: SocialDataAdapter;
}
