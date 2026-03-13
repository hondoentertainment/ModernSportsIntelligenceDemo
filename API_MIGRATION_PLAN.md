# API Migration Plan: Mock Data to Production APIs

> **Status**: Planning Phase
> **Last Updated**: 2026-03-13
> **Scope**: 82 service files across 103 features, all currently using deterministic seeded random or hardcoded mock data

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Data Source Mapping](#2-data-source-mapping)
3. [API Integration Priority Tiers](#3-api-integration-priority-tiers)
4. [Shared Data Models](#4-shared-data-models)
5. [Backend Architecture](#5-backend-architecture)
6. [Migration Strategy](#6-migration-strategy)
7. [Service-by-Service Migration Reference](#7-service-by-service-migration-reference)

---

## 1. Current State Assessment

### How Mock Data Works Today

Every service file generates data client-side using one of these patterns:

| Pattern | Services Using It | Example |
|---------|-------------------|---------|
| Seeded PRNG (mulberry32/sin-based) | ~60 services | `priceChartService.ts`, `auctionSniperService.ts` |
| Hardcoded static objects/arrays | ~15 services | `playerTrajectoryService.ts`, `marketIndicesService.ts` |
| Derived from `CardInventory` fields | ~20 services | `liquidityService.ts`, `breakEvenService.ts` |
| `localStorage` caching of generated data | ~25 services | `auctionSniperService.ts`, `marketIndicesService.ts` |
| Real API calls (MLB Stats API only) | 1 service | `statsService.ts` via `mlbApi.ts` |

### Key Observations

- **No backend exists.** All data lives in `localStorage` and client-side state.
- **`CardInventory` is the universal anchor type** -- nearly every service imports it from `types.ts`.
- **Seeded randomness provides consistency** -- the same card ID always produces the same mock data within a session/day. Migration must preserve this determinism as a fallback.
- **`statsService.ts` already calls the MLB Stats API** -- this is the only real external integration today and serves as a pattern to follow.
- **Platform fee constants are real** -- `breakEvenService.ts` and `dealFinderService.ts` contain accurate eBay (13.12%), COMC (5%), MySlabs (9%), Goldin (10%) fee structures.

---

## 2. Data Source Mapping

### 2A. Market & Pricing Data (25 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `priceChartService.ts` | Price history, OHLCV, support/resistance | **eBay Completed Sales API** + **130point.com/Market Movers** | Core dependency -- most analytics derive from this |
| `marketDepthService.ts` | Order book, bid/ask spread, volume | **eBay Active Listings API** + **COMC API** | Aggregate listings across platforms for depth |
| `marketIndicesService.ts` | MSI500, sport indices, components | **Custom backend aggregation** | Build proprietary indices from completed sales data |
| `dealFinderService.ts` | Marketplace listings, deal scores, arbitrage | **eBay Browse API** + **COMC API** + **Goldin API** | Cross-platform price comparison |
| `auctionSniperService.ts` | Active auctions, bid history, shill detection | **eBay Finding API** + **Goldin API** + **Heritage Auctions API** + **PWCC API** | Multi-platform auction aggregation |
| `liquidityService.ts` | Liquidity scores, exit velocity, market depth | **eBay Completed Sales velocity** | Derived from sales frequency and listing counts |
| `technicalAnalysisService.ts` | RSI, MACD, Bollinger Bands, Fibonacci | Derived from **real price history** | No new API needed -- consumes priceChartService output |
| `transactionWireService.ts` | Real-time transaction feed | **eBay Completed Sales (polling)** + **WebSocket feed** | Needs near-real-time data pipeline |
| `vintageMarketService.ts` | Pre-1980 card market data | **Heritage Auctions API** + **PSA cert verification** | Specialized vintage pricing |
| `dataConsolidationService.ts` | Unified cross-platform pricing | **All marketplace APIs** | Aggregation layer for normalized pricing |
| `instantBuyService.ts` | Instant buy offers, liquidity-based pricing | **Custom backend** + eBay comps | Needs real-time pricing engine |
| `priceHistory.ts` (shared) | Historical price snapshots | **eBay Completed Sales** | Foundation for all historical analytics |
| `anomalyDetectionService.ts` | Price anomalies, pump detection | Derived from **real price feeds** | ML model on backend |
| `seasonalStrategyService.ts` | Monthly price indices per sport | **Historical completed sales aggregation** | Requires 2+ years of data |
| `timeMachineService.ts` | Historical portfolio snapshots | **Custom backend** (user portfolio history) | Backend stores snapshots on write |
| `crossAssetCorrelationService.ts` | Correlation with S&P, BTC, gold | **Yahoo Finance API** / **Alpha Vantage** + card price data | Cross-asset comparison |
| `macroSentinelService.ts` | Economic indicators, market regime | **FRED API** (Federal Reserve) + **Yahoo Finance** | CPI, interest rates, consumer confidence |
| `stressTestService.ts` | Monte Carlo simulations, VaR | Derived from **real price volatility data** | Computation on backend |
| `benchmarkService.ts` | Portfolio vs benchmark comparison | Derived from **market indices** | No new API needed |
| `CorrelationService.ts` | Card-to-card price correlation | Derived from **price history** | No new API needed |
| `portfolioAttributionService.ts` | Factor attribution, alpha/beta | Derived from **price + index data** | No new API needed |
| `derivativesDeskService.ts` | Simulated options/puts pricing | **Custom backend** | Synthetic derivatives -- novel feature |
| `quantWorkbenchService.ts` | Backtesting, strategy execution | **Custom backend** | Needs historical data warehouse |
| `currencyService.ts` | Multi-currency conversion | **ExchangeRate-API** / **Open Exchange Rates** | Simple REST integration |
| `breakEvenService.ts` | Break-even calculator with real fee structures | **No API needed** -- fee constants are already accurate | Pure computation |

### 2B. Grading & Authentication Data (8 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `scarcityService.ts` | Pop reports (population at grade) | **PSA Cert Verification API** + **BGS Database** | Critical for valuation |
| `popGrowthService.ts` | Pop growth over time, gem rates | **PSA Pop Report** (periodic scraping or API) | Track submission volume trends |
| `gradePremiumService.ts` | Grade multipliers, crossover values | **eBay Completed Sales** (by grade) + **PSA/BGS price guides** | Compare prices across grades |
| `gradingPredictionService.ts` | Predicted grade, sub-grades, ROI | **Custom ML model** trained on grading results | AI/ML backend service |
| `gradePredictService.ts` | Grade probability distribution, bulk submission | **PSA/BGS turnaround data** + **Custom ML** | Overlaps with above -- consolidate |
| `visionGradingService.ts` | AI vision-based centering/corner analysis | **Custom CV model** (TensorFlow/PyTorch) | On-device or cloud inference |
| `gradingArbitrageService.ts` | Cross-grade opportunities, grade translation | **PSA/BGS/SGC price differentials** from completed sales | Derived from sales data |
| `authenticationService.ts` | Authenticity scores, cert validation | **PSA Cert Lookup API** + **BGS Verify** | Certificate verification |

### 2C. Player & Sports Data (8 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `statsService.ts` | Player stats (already calls MLB API) | **MLB Stats API** (existing) + **ESPN API** + **NBA API** + **NHL API** | Expand to all sports |
| `playerIndexService.ts` | Player value indices, career arcs, injury impact | **ESPN API** + **Sports Reference** + card sales data | Composite player valuation |
| `playerTrajectoryService.ts` | Career projections, comparables | **Baseball Reference** / **Basketball Reference** + ML model | Historical comp analysis |
| `prospectPipelineService.ts` | Prospect rankings, call-up alerts | **MLB Pipeline** + **ESPN draft rankings** + **MiLB Stats** | Multi-sport prospect data |
| `liveGameImpactService.ts` | Real-time game events, card value impact | **ESPN Live Scores API** / **Sportradar** + WebSocket | Real-time event stream |
| `draftWarRoomService.ts` | Draft prospects, landing spot analysis | **ESPN Draft API** + **NFL/NBA/MLB Draft data** | Seasonal -- peaks around draft |
| `hofTrackerService.ts` | Hall of Fame probability, vote tracking | **Baseball Reference HOF tracker** + **Sports Reference** | Custom probability model |
| `weatherImpactService.ts` | Weather conditions, game impact | **OpenWeatherMap API** / **Weather.gov API** | Outdoor sports venues |

### 2D. Social & Community Features (8 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `socialService.ts` | Collector profiles, follows, DMs, leaderboard | **Custom backend** (Supabase/PostgreSQL) | Full social graph |
| `p2pMarketplaceService.ts` | Listings, offers, seller profiles | **Custom backend** | Transactional marketplace |
| `sentimentRadarService.ts` | Social sentiment from Twitter/Reddit/forums | **Twitter/X API** + **Reddit API** + **Custom NLP** | Sentiment analysis pipeline |
| `showcaseService.ts` | Public showcase/gallery themes | **Custom backend** | User-generated content |
| `tradeBlockService.ts` | Trade listings, offers, package deals | **Custom backend** | P2P trading |
| `negotiationService.ts` | AI negotiation (uses Gemini) | **Google Gemini API** (already integrated) | Enhance with market data context |
| `liveBreakRoomService.ts` | Live break rooms, real-time bidding | **Custom backend** + **WebSocket** | Real-time multiplayer |
| `achievementService.ts` | Gamification badges, streaks | **Custom backend** | Computed from user activity |

### 2E. Portfolio & Financial Tools (14 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `aggregationService.ts` | Portfolio metrics, risk analytics | Derived from **other services** | Aggregation layer |
| `taxHarvestService.ts` | Tax loss harvesting, wash sale detection | **Custom backend** + user transaction data | IRS wash sale rules |
| `taxLotService.ts` | Tax lot tracking, FIFO/LIFO/SpecID | **Custom backend** | Accounting system |
| `goalPlannerService.ts` | Collection goals, milestones | **Custom backend** | User preference storage |
| `rebalancingAlertService.ts` | Portfolio rebalancing alerts | Derived from **allocation targets** | Pure computation |
| `portfolioRebalancerService.ts` | Rebalance recommendations | Derived from **portfolio data** | Pure computation |
| `reportService.ts` | PDF/export reports | **Custom backend** | Report generation |
| `insurancePolicyService.ts` | Insurance policies, coverage gaps | **Custom backend** + insurance partner API | Partner integration |
| `consignmentService.ts` | Consignment tracking | **Custom backend** | Transaction tracking |
| `consignmentRouterService.ts` | Platform recommendation engine | **Platform fee APIs** + completed sales data | Static + dynamic data |
| `estatePlanningService.ts` | Estate planning, beneficiaries | **Custom backend** | Sensitive user data |
| `complianceCenterService.ts` | Tax events, regulatory compliance | **Custom backend** + tax rules engine | Jurisdiction-aware |
| `billingService.ts` | Stripe subscriptions (already real) | **Stripe API** (already integrated) | Production-ready |
| `importService.ts` | CSV/Excel import mapping | **No API needed** -- client-side parsing | Already functional |

### 2F. Specialty & Advanced Features (19 services)

| Service | Mock Data Generated | Real API Source | Notes |
|---------|-------------------|----------------|-------|
| `waxInvestService.ts` | Sealed product values, hold vs rip | **eBay Completed Sales** (sealed products) + **Card Ladder** | Sealed wax pricing |
| `waxIntelligenceService.ts` | Sealed wax market intelligence | **eBay** + **StockX** (sealed products) | Market analytics for wax |
| `errorCardService.ts` | Error/variation cards, premiums | **Custom database** + community submissions | Niche reference data |
| `setRegistryService.ts` | Set completion tracking | **PSA Set Registry API** + **Beckett checklist data** | Set composition data |
| `cardDNAService.ts` | Card fingerprinting, uniqueness | **Custom CV model** | Image analysis |
| `arShowcaseService.ts` | AR card display | **Custom 3D rendering** | Client-side AR |
| `cardShowService.ts` | Card show deals, events | **Custom backend** + event APIs | Community-sourced data |
| `collectionGenomeService.ts` | Collector DNA profiling | Derived from **portfolio data** | Pure computation |
| `provenanceChainService.ts` | Blockchain provenance, digital twins | **Ethereum/Polygon RPC** + **Custom smart contracts** | Blockchain integration |
| `fractionalVaultService.ts` | Fractional ownership, share trading | **Custom backend** + **smart contracts** | Securities implications |
| `vaultSecurityService.ts` | Storage units, environmental monitoring | **Custom backend** + **IoT sensor APIs** | Hardware integration |
| `advisorService.ts` | Collection gap analysis, recommendations | Derived from **portfolio + market data** | AI-powered recommendations |
| `rulesEngineService.ts` | Automated trading rules | **Custom backend** | Event-driven automation |
| `notificationCenterService.ts` | Unified notifications | **Custom backend** + **push notification service** | Firebase/OneSignal |
| `researchReportsService.ts` | Research reports, analyst notes | **Custom backend** | Editorial content |
| `MultiAgentService.ts` | Multi-agent AI analysis | **Google Gemini API** (already integrated) | Multi-model orchestration |
| `msiTerminalService.ts` | Bloomberg-style terminal commands | Aggregates from **all other services** | Command router |
| `apiPlatformService.ts` | Public API platform, data licensing | **Custom backend** | API gateway for external consumers |
| `dealRoomService.ts` | Private deal rooms | **Custom backend** + **WebSocket** | Real-time negotiation |
| `imageSourceService.ts` | Card image resolution | **PSA/eBay image URLs** + **Custom CDN** | Image pipeline |

---

## 3. API Integration Priority Tiers

### P0 -- Core Pricing & Market Data (Sprint 1-3)

**Business justification**: Every valuation, recommendation, and analytics feature depends on accurate pricing. Without this, nothing else works.

| Integration | Services Unblocked | Effort | External Dependency |
|-------------|-------------------|--------|---------------------|
| eBay Completed Sales API | 25+ services | Large | eBay Developer Program (Production keys) |
| eBay Browse/Finding API | 10+ services | Medium | Same eBay account |
| Custom price aggregation backend | All pricing services | Large | Self-hosted |
| Historical price data warehouse | 15+ services | Large | PostgreSQL + time-series extension |

**Deliverables**:
- Price history API endpoint returning OHLCV data per card
- Active listings aggregation endpoint
- Completed sales search endpoint
- Market index computation pipeline (MSI500, sport indices)

### P1 -- Grading & Authentication Data (Sprint 4-5)

**Business justification**: Grade-aware pricing is a core differentiator. Pop reports directly affect scarcity calculations and valuation.

| Integration | Services Unblocked | Effort | External Dependency |
|-------------|-------------------|--------|---------------------|
| PSA Cert Verification API | 5 services | Medium | PSA API partnership |
| BGS Database access | 3 services | Medium | Beckett partnership |
| Grade-aware pricing queries | 4 services | Medium | Built on P0 data |

**Deliverables**:
- Pop report lookup endpoint (by cert number, by card)
- Grade premium calculator backed by real comps
- Cert verification endpoint
- Pop growth tracking (periodic snapshots)

### P2 -- Player Stats & Sports Data (Sprint 6-7)

**Business justification**: Player performance drives card values. Real-time game data enables the live impact engine.

| Integration | Services Unblocked | Effort | External Dependency |
|-------------|-------------------|--------|---------------------|
| Expand MLB Stats API usage | Already partially done | Small | Free public API |
| ESPN API / Sportradar | 6 services | Medium | API key / licensing |
| NBA/NFL/NHL stats APIs | 4 services | Medium | Multiple API providers |
| Live scores WebSocket | 1 service (high value) | Medium | Sportradar or ESPN |
| Weather API | 1 service | Small | OpenWeatherMap (free tier) |

**Deliverables**:
- Unified player stats endpoint (all sports)
- Live game event stream
- Prospect rankings aggregation
- HOF probability model inputs

### P3 -- Social & Community Features (Sprint 8-10)

**Business justification**: User retention and network effects. These features require a custom backend with user accounts.

| Integration | Services Unblocked | Effort | External Dependency |
|-------------|-------------------|--------|---------------------|
| Supabase user/social backend | 8 services | Large | Supabase (already in project) |
| Twitter/X API for sentiment | 1 service | Medium | Twitter API v2 |
| Reddit API for sentiment | 1 service | Small | Reddit API |
| WebSocket for real-time features | 3 services | Medium | Supabase Realtime / custom |
| Push notifications | 1 service | Small | Firebase FCM |

**Deliverables**:
- User profile CRUD
- Social graph (follow/unfollow)
- P2P marketplace with escrow
- Sentiment analysis pipeline
- Real-time notifications

### P4 -- Advanced Analytics & Specialty (Sprint 11-14)

**Business justification**: Differentiating features that can initially work with derived data from P0-P2.

| Integration | Services Unblocked | Effort | External Dependency |
|-------------|-------------------|--------|---------------------|
| Yahoo Finance / Alpha Vantage | 2 services | Small | API key |
| FRED API (economic data) | 1 service | Small | Free public API |
| Custom ML models | 3 services | Large | ML infrastructure |
| Blockchain/smart contracts | 2 services | Large | Ethereum/Polygon |
| IoT sensor APIs | 1 service | Medium | Hardware partners |
| ExchangeRate API | 1 service | Small | Free tier available |

**Deliverables**:
- Cross-asset correlation engine
- Macro economic indicator dashboard
- AI grading prediction model
- Computer vision card analysis
- Provenance blockchain integration

---

## 4. Shared Data Models

### Core Types (already defined in `types.ts`)

These types are already well-defined and should remain the canonical source:

```typescript
// types.ts -- already exists, keep as-is
CardInventory        // Universal card record -- 25+ fields
PopReport            // PSA/BGS population data
ExitPlan             // Exit strategy per card
PricingAnalysis      // Valuation estimate with confidence
Sport                // 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer'
League               // 'MLB' | 'MiLB' | 'NBA' | 'NFL' | 'Other'
UserProfile          // User account data
TargetWatchlist      // Watchlist items
NegotiationSession   // AI negotiation state
```

### New Shared Types to Create

```typescript
// lib/types/market.ts -- NEW
interface MarketPrice {
  cardId: string;
  source: 'ebay' | 'comc' | 'goldin' | 'heritage' | 'pwcc' | 'myslabs';
  price: number;
  saleDate: string;
  condition: string;
  grade?: string;
  gradingCompany?: string;
  auctionType: 'auction' | 'buy_it_now' | 'best_offer';
  url?: string;
}

interface PriceAggregate {
  cardKey: string;            // normalized card identifier
  period: '1d' | '7d' | '30d' | '90d' | '1y';
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  avgPrice: number;
  medianPrice: number;
  salesCount: number;
  sources: Record<string, number>;  // source -> count
}

interface MarketListing {
  id: string;
  source: string;
  cardKey: string;
  price: number;
  listingType: 'auction' | 'fixed' | 'best_offer';
  timeRemaining?: number;
  bidCount?: number;
  sellerRating?: number;
  url: string;
}
```

```typescript
// lib/types/grading.ts -- NEW
interface GradePopulation {
  cardKey: string;
  gradingCompany: 'PSA' | 'BGS' | 'SGC' | 'CSG';
  gradeDistribution: Record<string, number>;  // grade -> count
  totalPopulation: number;
  lastUpdated: string;
}

interface CertVerificationResult {
  certNumber: string;
  company: string;
  isValid: boolean;
  grade: string;
  cardDescription: string;
  year: number;
  verifiedAt: string;
}
```

```typescript
// lib/types/player.ts -- NEW
interface PlayerProfile {
  id: string;
  name: string;
  sport: Sport;
  team: string;
  position: string;
  age: number;
  status: 'active' | 'injured' | 'retired' | 'prospect';
  careerStats: Record<string, number | string>;
  imageUrl?: string;
}

interface GameEvent {
  id: string;
  gameId: string;
  playerId: string;
  eventType: string;
  description: string;
  timestamp: string;
  sport: string;
}
```

```typescript
// lib/types/api.ts -- NEW
interface APIResponse<T> {
  data: T;
  meta: {
    source: string;
    cachedAt?: string;
    expiresAt?: string;
    requestId: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

interface APIError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}
```

### Type Dependency Graph

```
CardInventory (root)
  |
  +-- PopReport (scarcity)
  +-- ExitPlan (liquidity)
  +-- PricingAnalysis (valuation)
  |
  +-- MarketPrice (NEW - sales data)
  |     +-- PriceAggregate (NEW - OHLCV)
  |     +-- MarketListing (NEW - active listings)
  |
  +-- GradePopulation (NEW - pop data)
  |     +-- CertVerificationResult (NEW)
  |
  +-- PlayerProfile (NEW - player data)
        +-- GameEvent (NEW - live events)
```

---

## 5. Backend Architecture

### 5A. API Gateway Pattern

```
Client (React App)
    |
    v
[API Gateway] -- /api/v1/*
    |
    +-- Auth middleware (Supabase JWT validation)
    +-- Rate limiting (per-user, per-tier)
    +-- Request logging
    +-- Response caching (Redis)
    |
    +-- /api/v1/market/*     --> Market Data Service
    +-- /api/v1/grading/*    --> Grading Data Service
    +-- /api/v1/players/*    --> Player Data Service
    +-- /api/v1/portfolio/*  --> Portfolio Service
    +-- /api/v1/social/*     --> Social Service
    +-- /api/v1/live/*       --> WebSocket Gateway
```

**Recommended stack**:
- **API Gateway**: Node.js (Express/Fastify) or Supabase Edge Functions
- **Database**: Supabase PostgreSQL (already in project)
- **Cache**: Redis (Upstash for serverless)
- **Queue**: BullMQ or Supabase pg_cron for background jobs
- **Real-time**: Supabase Realtime (already available)

### 5B. Caching Strategy

| Data Type | Cache Layer | TTL | Invalidation |
|-----------|-------------|-----|-------------|
| Completed sales (historical) | PostgreSQL + Redis | Permanent (immutable) | Never -- historical data doesn't change |
| Active listings | Redis | 5 minutes | On poll refresh |
| Pop reports | Redis + PostgreSQL | 24 hours | On PSA data refresh |
| Player stats (season) | Redis | 1 hour during season, 24h off-season | On game completion |
| Live game events | No cache (WebSocket) | N/A | Real-time stream |
| Market indices | Redis | 15 minutes | On computation cycle |
| Currency rates | Redis | 1 hour | On rate refresh |
| User portfolio data | PostgreSQL | N/A (source of truth) | On write |
| Sentiment scores | Redis | 30 minutes | On NLP pipeline completion |
| Weather data | Redis | 30 minutes | On API poll |

**Cache key pattern**: `msi:{service}:{entity_type}:{identifier}:{params_hash}`

Example: `msi:market:completed_sales:mickey-mantle-1952-topps-311:psa10:90d`

### 5C. Rate Limiting

| API Source | Rate Limit | Our Strategy |
|-----------|-----------|-------------|
| eBay Browse API | 5,000/day (production) | Batch queries, aggressive caching, prioritize by user activity |
| eBay Finding API | 5,000/day | Pre-compute popular cards, on-demand for others |
| PSA Cert API | Unknown (partnership dependent) | Cache all lookups permanently, batch daily |
| ESPN API | 1,000/hour | Cache aggressively, only refresh live games |
| MLB Stats API | No hard limit (public) | Reasonable polling, 1 req/sec max |
| OpenWeatherMap | 1,000/day (free), 60/min | Cache 30 min per venue, pre-fetch game-day venues |
| Twitter/X API | 300 reads/15min (Basic) | Batch sentiment analysis, pre-compute for tracked players |
| Reddit API | 100 req/min | Hourly sentiment snapshots |
| Yahoo Finance | 2,000/hour | Cache 1 hour, only fetch tracked assets |
| FRED | 120 req/min | Cache 24 hours, only ~20 indicators |

**User-facing rate limits** (our API):

| Tier | Requests/min | WebSocket connections | Data refresh |
|------|-------------|----------------------|-------------|
| Free | 30 | 1 | 15 min |
| Pro | 120 | 5 | 5 min |
| Institutional | 600 | 20 | Real-time |

### 5D. Data Refresh Intervals

| Data Category | Refresh Frequency | Method |
|--------------|-------------------|--------|
| eBay completed sales | Every 15 minutes (top 500 cards), hourly (long tail) | Background job polling |
| Active listings | Every 5 minutes | Background job polling |
| Pop reports | Daily at 2 AM ET | Batch job |
| Player stats | Hourly during game days, daily otherwise | Scheduled job |
| Live game events | Real-time via WebSocket | Persistent connection |
| Market indices | Every 15 minutes during market hours | Computation job |
| Sentiment analysis | Every 30 minutes | NLP pipeline |
| Currency rates | Hourly | API poll |
| Weather | Every 30 minutes (game-day venues only) | API poll |
| Macro indicators | Daily | FRED API poll |

---

## 6. Migration Strategy

### Phase 1: Shared API Client & Types (Weeks 1-2)

**Goal**: Create the foundation without changing any existing functionality.

#### Tasks:
1. **Create `lib/api/client.ts`** -- Unified API client
   - Base URL configuration (dev/staging/prod)
   - Auth token injection (Supabase JWT)
   - Automatic retry with exponential backoff
   - Request/response interceptors for logging
   - TypeScript generics for type-safe responses

2. **Create `lib/api/cache.ts`** -- Client-side cache layer
   - In-memory LRU cache with TTL
   - `localStorage` persistence for offline support
   - Cache key generation from request params
   - Stale-while-revalidate pattern

3. **Create shared type files**:
   - `lib/types/market.ts`
   - `lib/types/grading.ts`
   - `lib/types/player.ts`
   - `lib/types/api.ts`

4. **Create `lib/api/endpoints.ts`** -- Centralized endpoint registry
   - All API paths in one place
   - Version prefixing
   - Environment-aware base URLs

5. **Create feature flags** (`lib/api/featureFlags.ts`):
   - `USE_REAL_PRICING: boolean`
   - `USE_REAL_GRADING: boolean`
   - `USE_REAL_PLAYER_STATS: boolean`
   - `USE_REAL_SOCIAL: boolean`
   - Each service checks its flag and falls back to mock data if false

#### Deliverable:
```typescript
// Usage pattern every service will adopt:
import { apiClient } from '../api/client';
import { featureFlags } from '../api/featureFlags';

export async function getPriceHistory(cardId: string): Promise<PriceDataPoint[]> {
  if (!featureFlags.USE_REAL_PRICING) {
    return generateMockPriceHistory(cardId); // existing mock logic
  }
  return apiClient.get<PriceDataPoint[]>(`/market/price-history/${cardId}`);
}
```

### Phase 2: Data Adapters Per Source (Weeks 3-6)

**Goal**: Build adapter layer that normalizes external API responses into our shared types.

#### Adapters to build:

```
lib/api/adapters/
  ebay/
    completedSalesAdapter.ts    // eBay sold items -> MarketPrice[]
    activeListingsAdapter.ts    // eBay active -> MarketListing[]
    auctionAdapter.ts           // eBay auction details -> AuctionListing
  psa/
    certLookupAdapter.ts        // PSA cert -> CertVerificationResult
    popReportAdapter.ts         // PSA pop -> GradePopulation
  sports/
    mlbAdapter.ts               // MLB API -> PlayerProfile (already exists partially)
    espnAdapter.ts              // ESPN API -> PlayerProfile, GameEvent
    nbaAdapter.ts               // NBA API -> PlayerProfile
  financial/
    yahooFinanceAdapter.ts      // Yahoo -> AssetTimeSeries
    fredAdapter.ts              // FRED -> MacroIndicator
    exchangeRateAdapter.ts      // ExchangeRate API -> CurrencyRate
  weather/
    openWeatherAdapter.ts       // OpenWeatherMap -> WeatherCondition
  social/
    twitterAdapter.ts           // Twitter -> SentimentData
    redditAdapter.ts            // Reddit -> SentimentData
```

Each adapter:
- Handles authentication with the external API
- Normalizes response data into shared types
- Handles pagination
- Implements retry logic specific to that API
- Logs errors with context

### Phase 3: Replace Mock Data Service by Service (Weeks 7-16)

**Goal**: Swap mock implementations for real data, one service at a time, behind feature flags.

#### Migration order (follows P0-P4 priority):

**Sprint 1-3 (P0 -- Pricing)**:
| Week | Service | Adapter Used | Flag |
|------|---------|-------------|------|
| 7 | `priceChartService.ts` | ebay/completedSalesAdapter | `USE_REAL_PRICING` |
| 7 | `priceHistory.ts` | ebay/completedSalesAdapter | `USE_REAL_PRICING` |
| 8 | `dealFinderService.ts` | ebay/activeListingsAdapter | `USE_REAL_PRICING` |
| 8 | `marketDepthService.ts` | ebay/activeListingsAdapter | `USE_REAL_PRICING` |
| 9 | `auctionSniperService.ts` | ebay/auctionAdapter + goldin + heritage | `USE_REAL_PRICING` |
| 9 | `liquidityService.ts` | Derived from real sales data | `USE_REAL_PRICING` |
| 10 | `marketIndicesService.ts` | Custom aggregation pipeline | `USE_REAL_PRICING` |
| 10 | `transactionWireService.ts` | ebay/completedSalesAdapter (polling) | `USE_REAL_PRICING` |
| 11 | `anomalyDetectionService.ts` | Derived from real prices | `USE_REAL_PRICING` |
| 11 | `technicalAnalysisService.ts` | No change needed (consumes priceChart) | Auto |
| 11 | `dataConsolidationService.ts` | All marketplace adapters | `USE_REAL_PRICING` |

**Sprint 4-5 (P1 -- Grading)**:
| Week | Service | Adapter Used | Flag |
|------|---------|-------------|------|
| 12 | `scarcityService.ts` | psa/popReportAdapter | `USE_REAL_GRADING` |
| 12 | `popGrowthService.ts` | psa/popReportAdapter (historical) | `USE_REAL_GRADING` |
| 13 | `authenticationService.ts` | psa/certLookupAdapter | `USE_REAL_GRADING` |
| 13 | `gradePremiumService.ts` | Derived from grade-specific sales | `USE_REAL_GRADING` |
| 13 | `gradingArbitrageService.ts` | Cross-grade sales comparison | `USE_REAL_GRADING` |

**Sprint 6-7 (P2 -- Players)**:
| Week | Service | Adapter Used | Flag |
|------|---------|-------------|------|
| 14 | `playerIndexService.ts` | sports/* adapters + sales data | `USE_REAL_PLAYER_STATS` |
| 14 | `prospectPipelineService.ts` | espnAdapter + mlbAdapter | `USE_REAL_PLAYER_STATS` |
| 15 | `liveGameImpactService.ts` | ESPN WebSocket + espnAdapter | `USE_REAL_PLAYER_STATS` |
| 15 | `draftWarRoomService.ts` | ESPN draft data | `USE_REAL_PLAYER_STATS` |
| 15 | `weatherImpactService.ts` | openWeatherAdapter | `USE_REAL_PLAYER_STATS` |
| 15 | `hofTrackerService.ts` | Sports Reference + custom model | `USE_REAL_PLAYER_STATS` |

**Sprint 8-10 (P3 -- Social)**:
| Week | Service | Adapter Used | Flag |
|------|---------|-------------|------|
| 16 | `socialService.ts` | Supabase backend | `USE_REAL_SOCIAL` |
| 16 | `p2pMarketplaceService.ts` | Supabase backend | `USE_REAL_SOCIAL` |
| 16 | `sentimentRadarService.ts` | twitterAdapter + redditAdapter | `USE_REAL_SOCIAL` |

**Sprint 11-14 (P4 -- Advanced)**: Remaining services migrated as real data becomes available.

### Phase 4: Real-Time Data Subscriptions (Weeks 17-20)

**Goal**: Replace polling with real-time data where appropriate.

#### WebSocket Channels:

```typescript
// Supabase Realtime channels
const channels = {
  // Market data (derived from background polling jobs)
  'market:prices': {
    description: 'Real-time price updates for tracked cards',
    payload: 'PriceUpdate { cardKey, price, source, timestamp }',
    frequency: 'As events arrive (~every 30s for active cards)',
  },

  // Live game events
  'games:live': {
    description: 'Live game events with card impact calculations',
    payload: 'LiveGameEvent',
    frequency: 'Real-time during games',
  },

  // Portfolio alerts
  'portfolio:alerts': {
    description: 'Rebalancing alerts, price targets hit, anomalies',
    payload: 'PortfolioAlert',
    frequency: 'As triggered',
  },

  // Social feed
  'social:feed': {
    description: 'Social activity feed for followed collectors',
    payload: 'ActivityFeedItem',
    frequency: 'As events occur',
  },

  // Auction updates
  'auctions:tracked': {
    description: 'Bid updates on tracked auctions',
    payload: 'AuctionUpdate { auctionId, currentBid, bidCount, timeRemaining }',
    frequency: 'As bids arrive',
  },

  // Transaction wire
  'market:transactions': {
    description: 'Bloomberg-style transaction ticker',
    payload: 'TransactionWireItem',
    frequency: 'As sales complete (~every 5-15s)',
  },
};
```

#### Server-Sent Events (SSE) fallback:
For environments where WebSocket is unreliable, implement SSE endpoints:
- `GET /api/v1/live/prices/stream`
- `GET /api/v1/live/games/stream`
- `GET /api/v1/live/transactions/stream`

---

## 7. Service-by-Service Migration Reference

### Quick reference: what each service needs and its migration complexity

| # | Service | Real Data Source | Complexity | Priority | Dependencies |
|---|---------|-----------------|-----------|----------|-------------|
| 1 | `priceChartService.ts` | eBay Completed Sales | High | P0 | None |
| 2 | `priceHistory.ts` | eBay Completed Sales | High | P0 | None |
| 3 | `dealFinderService.ts` | eBay + COMC + Goldin listings | High | P0 | None |
| 4 | `marketDepthService.ts` | eBay active listings aggregation | Medium | P0 | #1 |
| 5 | `auctionSniperService.ts` | eBay + Goldin + Heritage + PWCC | High | P0 | None |
| 6 | `liquidityService.ts` | Derived from sales velocity | Medium | P0 | #1, #2 |
| 7 | `marketIndicesService.ts` | Custom aggregation of #1 | High | P0 | #1, #2 |
| 8 | `technicalAnalysisService.ts` | Consumes #1 output | Low | P0 | #1 |
| 9 | `transactionWireService.ts` | eBay completed sales (polling) | Medium | P0 | #1 |
| 10 | `dataConsolidationService.ts` | All marketplace APIs | High | P0 | #1, #3, #5 |
| 11 | `anomalyDetectionService.ts` | Derived from #1 + ML model | Medium | P0 | #1 |
| 12 | `instantBuyService.ts` | Custom backend + #1 | Medium | P0 | #1, #6 |
| 13 | `vintageMarketService.ts` | Heritage Auctions + PSA | Medium | P0 | #1 |
| 14 | `currencyService.ts` | ExchangeRate API | Low | P0 | None |
| 15 | `breakEvenService.ts` | No migration needed (constants) | None | -- | -- |
| 16 | `scarcityService.ts` | PSA Cert API | Medium | P1 | None |
| 17 | `popGrowthService.ts` | PSA Pop Report (periodic) | Medium | P1 | #16 |
| 18 | `gradePremiumService.ts` | Grade-specific eBay sales | Medium | P1 | #1, #16 |
| 19 | `gradingPredictionService.ts` | Custom ML model | High | P1 | #16 |
| 20 | `gradePredictService.ts` | Custom ML model (consolidate with #19) | High | P1 | #16 |
| 21 | `visionGradingService.ts` | Custom CV model | High | P4 | None |
| 22 | `gradingArbitrageService.ts` | Cross-grade sales data | Medium | P1 | #1, #16 |
| 23 | `authenticationService.ts` | PSA Cert Lookup | Medium | P1 | #16 |
| 24 | `statsService.ts` | MLB API (already real) + ESPN | Low | P2 | None |
| 25 | `playerIndexService.ts` | ESPN + sales data | Medium | P2 | #1, #24 |
| 26 | `playerTrajectoryService.ts` | Sports Reference + ML | High | P2 | #24 |
| 27 | `prospectPipelineService.ts` | MLB Pipeline + ESPN | Medium | P2 | #24 |
| 28 | `liveGameImpactService.ts` | ESPN Live / Sportradar | High | P2 | #24 |
| 29 | `draftWarRoomService.ts` | ESPN Draft data | Medium | P2 | #24 |
| 30 | `hofTrackerService.ts` | Sports Reference | Medium | P2 | #24 |
| 31 | `weatherImpactService.ts` | OpenWeatherMap | Low | P2 | None |
| 32 | `sentimentRadarService.ts` | Twitter + Reddit APIs | High | P3 | None |
| 33 | `socialService.ts` | Supabase backend | High | P3 | Supabase schema |
| 34 | `p2pMarketplaceService.ts` | Supabase backend | High | P3 | #33 |
| 35 | `tradeBlockService.ts` | Supabase backend | Medium | P3 | #33 |
| 36 | `showcaseService.ts` | Supabase backend | Low | P3 | #33 |
| 37 | `liveBreakRoomService.ts` | Supabase Realtime + backend | High | P3 | #33 |
| 38 | `achievementService.ts` | Supabase backend | Low | P3 | #33 |
| 39 | `negotiationService.ts` | Gemini (already real) | Low | -- | -- |
| 40 | `MultiAgentService.ts` | Gemini (already real) | Low | -- | -- |
| 41 | `aggregationService.ts` | Derived from other services | Low | P0 | #1-#12 |
| 42 | `taxHarvestService.ts` | Custom backend | Medium | P4 | User data |
| 43 | `taxLotService.ts` | Custom backend | Medium | P4 | User data |
| 44 | `complianceCenterService.ts` | Custom backend | Medium | P4 | User data |
| 45 | `estatePlanningService.ts` | Custom backend | Medium | P4 | User data |
| 46 | `goalPlannerService.ts` | Supabase backend | Low | P3 | #33 |
| 47 | `rebalancingAlertService.ts` | Derived from portfolio | Low | P0 | #1, #41 |
| 48 | `portfolioRebalancerService.ts` | Derived from portfolio | Low | P0 | #1, #41 |
| 49 | `portfolioAttributionService.ts` | Derived from #1, #7 | Low | P0 | #1, #7 |
| 50 | `reportService.ts` | Custom backend | Medium | P3 | Multiple |
| 51 | `insurancePolicyService.ts` | Custom backend | Medium | P4 | User data |
| 52 | `consignmentService.ts` | Custom backend | Medium | P3 | User data |
| 53 | `consignmentRouterService.ts` | Platform APIs + sales data | Medium | P1 | #1 |
| 54 | `waxInvestService.ts` | eBay sealed product sales | Medium | P2 | #1 |
| 55 | `waxIntelligenceService.ts` | eBay + StockX sealed data | Medium | P2 | #1 |
| 56 | `errorCardService.ts` | Custom database | Medium | P4 | Community data |
| 57 | `setRegistryService.ts` | PSA Set Registry + Beckett | Medium | P2 | #16 |
| 58 | `cardDNAService.ts` | Custom CV model | High | P4 | None |
| 59 | `arShowcaseService.ts` | Client-side (no API needed) | Low | -- | -- |
| 60 | `cardShowService.ts` | Custom backend + events | Medium | P3 | #33 |
| 61 | `collectionGenomeService.ts` | Derived from portfolio | Low | P0 | #41 |
| 62 | `provenanceChainService.ts` | Blockchain RPC | High | P4 | Smart contracts |
| 63 | `fractionalVaultService.ts` | Custom backend + blockchain | High | P4 | Legal review |
| 64 | `vaultSecurityService.ts` | Custom backend + IoT | High | P4 | Hardware |
| 65 | `advisorService.ts` | Derived from #1, #16, #24 | Low | P0 | Multiple |
| 66 | `rulesEngineService.ts` | Custom backend | Medium | P3 | Multiple |
| 67 | `notificationCenterService.ts` | Firebase/OneSignal | Medium | P3 | #33 |
| 68 | `researchReportsService.ts` | Custom backend (editorial) | Medium | P4 | None |
| 69 | `crossAssetCorrelationService.ts` | Yahoo Finance + Alpha Vantage | Medium | P4 | #1 |
| 70 | `macroSentinelService.ts` | FRED API | Low | P4 | None |
| 71 | `stressTestService.ts` | Derived from real volatility | Medium | P0 | #1 |
| 72 | `benchmarkService.ts` | Derived from #7 | Low | P0 | #7 |
| 73 | `CorrelationService.ts` | Derived from #1 | Low | P0 | #1 |
| 74 | `seasonalStrategyService.ts` | Historical sales aggregation | Medium | P2 | #1 |
| 75 | `timeMachineService.ts` | Custom backend (snapshots) | Medium | P3 | User data |
| 76 | `billingService.ts` | Stripe (already real) | None | -- | -- |
| 77 | `importService.ts` | No API needed (client-side) | None | -- | -- |
| 78 | `imageSourceService.ts` | PSA/eBay images + CDN | Low | P1 | None |
| 79 | `derivativesDeskService.ts` | Custom backend | High | P4 | #1 |
| 80 | `quantWorkbenchService.ts` | Custom backend | High | P4 | #1 |
| 81 | `msiTerminalService.ts` | Aggregates all services | Low | -- | All |
| 82 | `apiPlatformService.ts` | Custom backend (meta-API) | High | P4 | All |

### Summary Statistics

- **No migration needed**: 6 services (already real or pure computation)
- **Low complexity**: 20 services (derived data, simple API calls)
- **Medium complexity**: 35 services (standard API integrations)
- **High complexity**: 21 services (ML models, blockchain, real-time systems)

### Estimated Timeline

| Phase | Duration | Team Size | Output |
|-------|----------|-----------|--------|
| Phase 1: Foundation | 2 weeks | 2 engineers | API client, types, feature flags |
| Phase 2: Adapters | 4 weeks | 3 engineers | 12 external API adapters |
| Phase 3: Migration | 10 weeks | 4 engineers | 70+ services migrated |
| Phase 4: Real-time | 4 weeks | 2 engineers | WebSocket channels, SSE |
| **Total** | **20 weeks** | **3-4 engineers** | **Full production data** |

### Risk Mitigation

1. **Feature flags are non-negotiable** -- Every service must support graceful fallback to mock data. If an API is down, the app still works.

2. **eBay API is the critical path** -- 25+ services depend on eBay data. Secure Production-level API keys early. Have a fallback scraping strategy (legal review required).

3. **PSA partnership is a prerequisite for P1** -- Without PSA API access, grading features remain mock. Begin partnership discussions in Phase 1.

4. **Rate limits will be hit** -- Design the background job system first. Never make external API calls from user-facing request handlers. Always serve from cache.

5. **Data quality will vary** -- eBay completed sales include bad data (shill bids, returns, wrong items). Build a data cleaning pipeline with outlier detection before any sales data enters the system.

6. **Legal review for blockchain/fractional features** -- Securities law implications for fractional ownership. Legal counsel must approve before `fractionalVaultService.ts` goes live.
