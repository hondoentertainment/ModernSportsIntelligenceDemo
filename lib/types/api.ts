/**
 * Shared API types — generic wrappers for all external API calls.
 */

/** Standard API response envelope */
export interface ApiResponse<T> {
  data: T;
  /** Was the response served from cache? */
  cached: boolean;
  /** ISO timestamp of when data was fetched */
  fetchedAt: string;
  /** Data source identifier */
  source: string;
}

/** Standard API error */
export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  retryable: boolean;
  source: string;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Cache metadata attached to responses */
export interface CacheMeta {
  key: string;
  ttlMs: number;
  storedAt: number;
  expiresAt: number;
}

/** Feature flag configuration for API adapters */
export interface AdapterFeatureFlags {
  /** Use real eBay API instead of mock data */
  USE_REAL_EBAY: boolean;
  /** Use real PSA cert verification */
  USE_REAL_PSA: boolean;
  /** Use real BGS/SGC grading data */
  USE_REAL_BGS: boolean;
  /** Use real ESPN/sports data */
  USE_REAL_SPORTS: boolean;
  /** Use real COMC marketplace data */
  USE_REAL_COMC: boolean;
  /** Use real Gemini AI (already live) */
  USE_REAL_GEMINI: boolean;
}
