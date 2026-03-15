# Modern Sports Intelligence Platform — Product Requirements Document (PRD)

**Version:** 4.0
**Last Updated:** March 15, 2026
**Status:** Active Development
**Platform:** Web (React SPA), PWA-enabled

---

## 1. Executive Summary

Modern Sports Intelligence is the world's most comprehensive sports card portfolio management and analytics platform. Designed for collectors, traders, dealers, and institutions managing high-value sports card portfolios, it combines real-time market data, AI-powered analytics, multi-agent intelligence, and social trading into a single Bloomberg Terminal-style experience for the $50B+ sports collectibles market.

**Key Differentiators:**
- 180+ feature modules (industry largest)
- AI/ML grading, pricing, and portfolio management
- Multi-agent autonomous trading system
- 20 industry-first features not found on any competing platform
- Full offline-first PWA support
- Enterprise-grade estate planning and insurance tools

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19.0.0, React Router DOM 7.x (HashRouter) |
| Language | TypeScript 5.8 (strict mode) |
| Build Tool | Vite 6.2 (code splitting, lazy loading) |
| Styling | Tailwind CSS (dark theme) |
| Icons | Lucide React 0.474 |
| Charts | Recharts 2.15 |
| PDF Generation | jsPDF 4.1 |
| Database | Supabase (PostgreSQL, Auth, Real-time) |
| AI/ML | Google Gemini 1.37 |
| Payments | Stripe 20.3 |
| Marketplace API | eBay API, COMC, MySlabs, SportLots, PWCC, Goldin, Whatnot |
| Drag & Drop | @dnd-kit |
| Virtualization | @tanstack/react-virtual 3.13 |
| Unit Testing | Vitest 4.0 + jsdom + @testing-library/react |
| E2E Testing | Playwright 1.58 |
| Linting | ESLint 9.39 + Prettier 3.8 |
| CI/CD | GitHub Actions |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React SPA (Vite)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Pages   │ │Components│ │ Services │ │    Contexts       │   │
│  │  (180+)  │ │  (290+)  │ │  (250+)  │ │ Auth/Toast/Migr. │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │
│       │             │            │                 │             │
│  ┌────┴─────────────┴────────────┴─────────────────┴──────┐     │
│  │              React Router (HashRouter)                  │     │
│  │         Code-split with lazy() + Suspense              │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                     │
│  ┌────────────────────────┴───────────────────────────────┐     │
│  │            State Management (Hooks + Context)           │     │
│  └────────────────────────┬───────────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────┴────┐       ┌─────┴─────┐      ┌─────┴─────┐
   │Supabase │       │  Gemini   │      │  eBay +   │
   │(DB/Auth)│       │  (AI/ML)  │      │ 6 Mkts   │
   └─────────┘       └───────────┘      └───────────┘
```

### Layout Structure
```
AppLayout
├── Sidebar (desktop, collapsible)
├── Header (top navigation with controls)
├── MarketTicker (real-time market data)
├── MigrationBanner (version notices)
├── InstitutionalWallHUD (optional overlay)
├── GrailShowcase (premium asset modal)
├── OfflineIndicator (offline status banner)
├── <main> (page content via Routes)
├── MobileNav (mobile bottom nav)
└── GuidedTour (onboarding overlay)
```

---

## 4. Complete Feature Inventory (180+ Features)

### 4.1 Core Platform (Phases 1-50)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 1 | Dashboard | `/` | Main hub with portfolio analytics, market sentiment, strategic signals |
| 2 | Collection Manager | `/collection` | Card inventory with grading, valuations, drag-and-drop sorting |
| 3 | Watchlist | `/favorites` | Price target tracking, alerts, priority management |
| 4 | Deep Intelligence | `/deep-search` | AI-powered advanced card search and analysis |
| 5 | Portfolio Audit | `/audit` | Portfolio performance analysis with AI insights |
| 6 | PressBox Hub | `/mlb-stats` | MLB statistics, standings, and card correlation |
| 7 | Prospect Trends | `/prospects` | Minor league prospect tracking and breakout prediction |
| 8 | Player Directory | `/players` | Player search, stats, and card market analysis |
| 9 | Player Detail | `/players/:id` | Individual player deep-dive analytics |
| 10 | Teams | `/teams` | Team information, form, and momentum tracking |
| 11 | Games | `/games` | Game schedule, results, and card impact |
| 12 | Trends | `/trends` | Market trend analysis and momentum indicators |
| 13 | Compare | `/compare` | Side-by-side card comparison tool |
| 14 | Portfolio Builder | `/builder` | Drag-and-drop portfolio construction with grouping |
| 15 | Alerts | `/alerts` | Multi-type alert management (price, trend, momentum) |
| 16 | Analyst War Room | `/war-room` | Advanced trading terminal with multi-agent AI |
| 17 | Leaderboard | `/leaderboard` | Alpha score rankings and competitive tracking |
| 18 | Guild Dashboard | `/guilds` | Community guild management with governance |
| 19 | Billing | `/billing` | Stripe subscription management (Basic/Pro/Alpha) |
| 20 | Settings | `/settings` | User profile, preferences, and tax configuration |
| 21 | Feature Directory | `/features` | Feature discovery and catalog with search |
| 22 | Public Portfolio | `/p/:username` | Shareable public portfolio view |
| 23 | Collector Audit Dossier | `/audit-dossier` | Comprehensive collector analysis report |

### 4.2 Advanced Trading & Analysis (Phases 104-113)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 24 | Game Impact Engine | `/live-game-impact-engine` | Real-time game impact on card values with live scoring |
| 25 | Asset Correlation | `/cross-asset-correlation` | Multi-asset class correlation matrix (cards, watches, art, wine) |
| 26 | Pre-Grade AI | `/pre-grade-intelligence` | AI-powered grading prediction with subgrade analysis |
| 27 | Copy Trading | `/copy-trading` | Follow and replicate successful trader strategies |
| 28 | Predictive Market Maker | `/predictive-market-maker` | AI market maker predictions and spread analysis |
| 29 | Liquidity Twin | `/liquidity-twin` | Real-time liquidity analysis with exit time estimation |
| 30 | Influence Graph | `/influence-graph` | Social influence mapping and impact scoring |
| 31 | Trust Graph | `/counterparty-trust-graph` | Counterparty reliability scoring with transaction history |
| 32 | Cross-Hobby Portfolio | `/cross-hobby-portfolio` | Multi-hobby asset management (cards, comics, coins, etc.) |
| 33 | Scenario Theater | `/portfolio-scenario-theater` | What-if portfolio scenario modeling and simulation |
| 34 | AI Acquisition | `/autonomous-acquisition` | AI-driven purchasing with risk collars and policy gates |
| 35 | Private Deal Room | `/private-deal-room-agent` | Encrypted transaction facilitation with AI mediation |
| 36 | Catalyst Market | `/catalyst-market` | Event catalyst tracking (injuries, trades, milestones) |
| 37 | Heritage Story | `/collection-narrative` | AI-generated collection storytelling and provenance |

### 4.3 Next-Gen Features (Phases 114-128)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 38 | AI Copilot | `/portfolio-copilot` | Conversational AI portfolio advisor |
| 39 | Marketplace Aggregator | `/marketplace-aggregator` | Cross-marketplace search and price comparison |
| 40 | Sub Box Intel | `/subscription-box` | Subscription box value analysis and ROI tracking |
| 41 | Collector DNA | `/collector-dna` | Collector personality profiling and style analysis |
| 42 | Auction War Room | `/auction-war-room` | Auction bidding strategy with max-bid optimization |
| 43 | Grading Tracker | `/grading-tracker` | Grading submission tracking across PSA/BGS/SGC |
| 44 | Dealer Dashboard | `/dealer-dashboard` | Dealer operations: POS, consignment, wholesale |
| 45 | Fund Manager | `/fund-manager` | Card fund management with LP reporting |
| 46 | API & Licensing | `/api-licensing` | API access control and usage monitoring |
| 47 | Card Show Mode | `/card-show-mode` | Card show inventory mode with quick pricing |
| 48 | AR Scanner | `/ar-scanner` | Augmented reality card scanning and identification |
| 49 | Hype Radar | `/hype-radar` | Social sentiment tracking across Twitter/Reddit/YouTube |
| 50 | Non-Sports | `/non-sports` | Non-sports collectibles (Pokemon, MTG, entertainment) |
| 51 | Injury Intel | `/injury-intel` | Player injury tracking with card value impact modeling |
| 52 | Carbon Score | `/carbon-score` | Environmental sustainability scoring for collecting |

### 4.4 Competitive Differentiators (Phases 129-138)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 53 | Vault Arbitrage | `/vault-arbitrage` | Cross-vault arbitrage opportunity detection |
| 54 | Pressing ROI | `/pressing-roi` | Card pressing cost/benefit analysis |
| 55 | Behavioral Finance | `/behavioral-finance` | Trading psychology analytics and bias detection |
| 56 | Comp Forensics | `/comp-forensics` | Comparable sales forensic analysis |
| 57 | Tournament Arena | `/tournament-arena` | Fantasy card value competitions |
| 58 | Influencer Impact | `/influencer-impact` | Influencer sentiment impact on card prices |
| 59 | Condition Aging | `/condition-aging` | Condition deterioration modeling over time |
| 60 | Auth Academy | `/auth-training` | Authentication education and counterfeit detection |
| 61 | Inventory Sync | `/inventory-sync` | Multi-platform inventory synchronization |
| 62 | Rookie Class Index | `/rookie-class-index` | Rookie class performance index and tracking |

### 4.5 Production-Grade Expansion (Phases 139-148)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 63 | Pack Simulator | `/vending-machine` | Pack breaking simulation with EV analysis |
| 64 | Women's Sports Index | `/womens-sports-index` | Women's sports collectibles tracking |
| 65 | Grading Auditor | `/grading-auditor` | Grading company accuracy auditing |
| 66 | Smart Storage | `/smart-storage` | Climate-optimized storage recommendations |
| 67 | Print Run Intel | `/print-run-intelligence` | Print run analysis and scarcity scoring |
| 68 | Youth Onboarding | `/youth-onboarding` | New collector education and guided setup |
| 69 | Live Break Hub | `/live-break-hub` | Live pack breaking with real-time pricing |
| 70 | Price Prediction | `/price-prediction` | AI/ML price prediction models |
| 71 | International Arbitrage | `/international-arbitrage` | Cross-border arbitrage opportunities |
| 72 | Blockchain Provenance | `/blockchain-provenance` | On-chain provenance tracking |

### 4.6 Advanced Platform (Phases 149-168)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 73 | Trade Deadline | `/trade-deadline` | Sports trade deadline tracking with card impact |
| 74 | Collection Appraiser | `/collection-appraiser` | Professional collection valuation tool |
| 75 | Set Registry | `/set-registry` | Complete set tracking and registry |
| 76 | Vintage Market | `/vintage-market` | Vintage collectibles trading hub |
| 77 | Social Trading | `/social-trading` | Social trading feed with follow/copy |
| 78 | Listing Optimizer | `/listing-optimizer` | eBay listing optimization with AI titles |
| 79 | Tax Calculator | `/tax-calculator` | Capital gains tax calculator |
| 80 | Sealed Product | `/sealed-product` | Sealed product pricing and EV analysis |
| 81 | Error Cards | `/error-card` | Error card identification and premium analysis |
| 82 | Auction Sniper | `/auction-sniper` | Last-second auction bidding automation |
| 83 | Real-Time Price Engine | `/real-time-price-engine` | Live market pricing engine |
| 84 | AI Card Scanner | `/ai-card-scanner` | AI-powered card recognition from photos |
| 85 | Cross-Platform Arbitrage | `/cross-platform-arbitrage` | Multi-platform price differential alerts |
| 86 | Predictive Price Engine | `/predictive-price-engine` | ML-powered price forecasting |
| 87 | Tax Report | `/tax-report` | Comprehensive tax reporting with Schedule D |
| 88 | Grade Prediction | `/grade-prediction` | ML grade prediction from card images |
| 89 | Smart Notifications | `/smart-notifications` | AI-prioritized notification system |
| 90 | Consensus Pricing | `/consensus-pricing` | Multi-source consensus price aggregation |
| 91 | Live Break ROI | `/live-break-roi` | Live break return analysis |
| 92 | Portfolio Benchmark | `/portfolio-benchmark` | Portfolio benchmarking against indices |

### 4.7 Next-Gen Platform (Phases 169-188)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 93 | Advanced Watchlist | `/watchlist` | Enhanced watchlist with technical indicators |
| 94 | Insurance Vault | `/insurance-vault` | Insurance partnership management |
| 95 | Break-Even Calculator | `/break-even-calculator` | Multi-factor break-even analysis |
| 96 | Community Trading | `/community-trading` | Peer-to-peer community trading |
| 97 | Set Completion | `/set-completion` | Set completion tracking with gap analysis |
| 98 | Portfolio Narrator | `/portfolio-narrator` | AI-generated portfolio narrative |
| 99 | Vintage Allocation | `/vintage-allocation` | Vintage asset allocation optimization |
| 100 | Grading Turnaround | `/grading-turnaround` | Grading turnaround time tracking |
| 101 | Market Replay | `/market-replay` | Historical market replay tool |
| 102 | Scan to Value | `/scan-to-value` | Camera-to-instant-valuation |
| 103 | Hobby Income | `/hobby-income` | Hobby income tracking and reporting |
| 104 | Card Show Planner | `/card-show-planner` | Card show event planning tool |
| 105 | Rip & Flip Sim | `/rip-flip-sim` | Pack ripping P&L simulation |
| 106 | Social Feed | `/social-feed` | Social media activity feed |
| 107 | Slab Verification | `/slab-verification` | Graded slab authentication tool |
| 108 | Portfolio Stress Test | `/portfolio-stress-test` | Monte Carlo portfolio stress testing |
| 109 | Consignment Market | `/consignment-market` | Consignment marketplace and routing |
| 110 | Grading Prep | `/grading-prep` | Pre-submission grading preparation |
| 111 | Parallel Universe | `/parallel-universe` | Hypothetical portfolio scenarios |
| 112 | Achievement System | `/achievement-system` | Gamification with XP, badges, seasons |

### 4.8 Multi-Sport & Infrastructure (v4.0 — New)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 113 | NFL League Hub | `/nfl-hub` | NFL division standings, draft class tracker, stat leaders (passing/rushing/receiving), card market correlation, injury impact analysis |
| 114 | NBA League Hub | `/nba-hub` | NBA conference standings, draft lottery tracker, season schedule, stat leaders (PPG/RPG/APG), rookie card price tracker, efficiency-to-value correlation |
| 115 | NHL League Hub | `/nhl-hub` | NHL division standings, Stanley Cup bracket visualization, draft prospects, stat leaders (goals/assists/points), young stars card tracker |
| 116 | Soccer Hub | `/soccer-hub` | Multi-league (Premier League, La Liga, Serie A, Bundesliga, MLS), league tables, transfer window tracker with card value impact, top scorers |
| 117 | AI Grading Vision Engine | `/grading-vision-engine` | Camera workflow: upload → AI analysis → subgrade radar chart → PSA/BGS/SGC predictions → defect detection → ROI calculator → grading company recommendation |
| 118 | Notification Center | `/notification-center` | Real-time WebSocket pipeline with 8 channels (price, auction, grading, trade, market, portfolio, social, system), rules builder, quiet hours, digests |
| 119 | Custom Dashboard Builder | `/dashboard-builder` | Drag-and-drop @dnd-kit widget system with 16+ widget types, grid snapping, resize, presets (Trader/Collector/Analyst/Minimal), localStorage persistence |
| 120 | Marketplace Integrations | `/marketplace-integrations` | OAuth to eBay/COMC/MySlabs/SportLots/PWCC/Goldin/Whatnot, auto-import purchases, cross-platform pricing, fee comparison, sell-through analytics |
| 121 | Insurance & Appraisal | `/insurance-appraisal` | Appraisal reports with comps and certification, policy management (4 providers), claims workflow, coverage gap analysis, premium estimation |
| 122 | Offline Manager | `/offline-manager` | Full offline-first PWA: cached portfolios, queued transactions, conflict resolution, storage management, service worker lifecycle, data export/import |

### 4.9 Industry-First Features — Round 2 (v4.0 — New)

These features do not exist on ANY competing platform in the sports collectibles industry.

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 123 | **Provenance DNA Fingerprinting** | `/provenance-dna` | AI image hashing creates unique 64-char fingerprints from micro-surface patterns (print dots, centering offset, edge wear). Tracks ownership chain without blockchain. Detects the same card resurfacing years later. Counterfeit detection. |
| 124 | **Emotional Portfolio Thermometer** | `/emotional-thermometer` | Behavioral finance layer analyzing trading patterns. Detects panic sells, FOMO buys, revenge trades. Real-time emotional temperature (0-100). Bias detection (recency, anchoring, loss aversion, endowment, confirmation, sunk cost, herd). Trade blocking during tilt. |
| 125 | **Card Weather System™** | `/card-weather` | Proprietary visual weather metaphor for markets. 40+ signals combined into intuitive forecast. Temperature (market heat), humidity (liquidity), wind (volatility), pressure (buying), visibility (clarity), UV (hype). 7-day forecast. Storm alerts. |
| 126 | **Dead Money Detector** | `/dead-money-detector` | Portfolio scanner identifying stagnant capital — cards with no appreciation, declining liquidity, and no upcoming catalyst. Suggests swap trades: "Your flat Luka → catalyzed Skenes." Opportunity cost calculator. Redeployment strategies. |
| 127 | **Micro-Arbitrage Swarm Network** | `/micro-arbitrage-swarm` | Crowdsourced real-world price sightings from card shows, LCS visits, flea markets, garage sales. Reputation system for verified sightings. Geographic heat map. Real-world vs online price comparison. Arbitrage alerts. |
| 128 | **Generational Wealth Planner** | `/generational-wealth` | Estate planning for collectibles. Inheritance tax modeling (federal + state). Trust structuring (revocable, irrevocable, dynasty, charitable). Per-card beneficiary assignment. Step-up basis calculation. 30-year wealth projection. Legal document generation. |
| 129 | **Card Aging Simulation Lab** | `/card-aging-lab` | Material science models simulating condition degradation. Inputs: temperature, humidity, UV, storage type. Outputs: grade decay at 1/5/10/25/50 years. "PSA 10 in shoebox = 23% chance of PSA 9 in 10 years." Storage upgrade ROI. Batch simulation. |
| 130 | **Sentiment Velocity Engine** | `/sentiment-velocity` | Tracks second derivative of sentiment — the rate of change, not just direction. Catches inflection points 24-48 hours before price moves. "Mahomes sentiment still positive but decelerating at -12%/day → 15% correction in 2 weeks." |
| 131 | **Phantom Portfolio Backtester** | `/phantom-backtester` | Historical what-if portfolios. "What if I bought $10K of 2018 NFL rookies?" Runs through actual pricing with transaction costs, grading fees, holding costs. Sharpe ratio, max drawdown, alpha vs benchmarks. Preset strategies. Community leaderboard. |
| 132 | **Collector Compatibility Matchmaker** | `/collector-matchmaker` | Nash equilibrium-optimized trade matching. Analyzes collection gaps and surpluses to find mutually beneficial swaps. Compatibility scoring. Trade equity meter. Proposal inbox. Rating system. "Trading partner dating app." |

### 4.10 Industry-First Features — Round 3 (v5.0 — Planned)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 133 | **Draft Night War Room Simulator** | `/draft-war-room` | Real-time draft night portfolio repricing. Pre-loaded mock draft scenarios: "If Bronny goes #5 to OKC, LeBron Prizms +12%." Pick-by-pick impact analysis. Trade rumor integration. |
| 134 | **Card Liquidity Options Desk** | `/options-desk` | Simulated options-style trading on cards. Paper calls/puts without trading physical cards. Premium pricing models. Greeks (delta, theta). Options chain visualization. Novel financial instrument for collectibles. |
| 135 | **Condition Census Tracker** | `/condition-census` | Intelligence network tracking known population of top-condition examples. "47 known PSA 10 1986 Fleer Jordan #57 — last surfaced at Heritage Auctions 2024." Likely owner analysis. Surface probability estimation. |
| 136 | **Break-Even Velocity Calculator** | `/break-even-velocity` | Break-even TIME, not just price. "At current appreciation, break-even in 4.2 months. With storage upgrade: 3.1 months." Factors holding costs, opportunity cost, insurance, storage per day. |
| 137 | **Hobby Income Tax Autopilot** | `/tax-autopilot` | Auto-categorizes hobby vs investment income. Tracks 1099-K thresholds. Schedule C vs Schedule D recommendations. Flags dealer vs collector IRS status. Quarterly estimated tax calculations. |
| 138 | **Card Show GPS Navigator** | `/card-show-gps` | Booth-level card show intelligence. Dealer inventory pre-scouting. Optimal walking routes. Real-time price sightings from other users. Deal alerts when booths drop prices. "Waze meets card shows." |
| 139 | **Rookie Contract Correlation Engine** | `/contract-correlation` | Maps contract extensions/options to card value movements. "When NFL rookies get 5th-year option: Prizm RC +18% avg within 30 days." Predictive models for upcoming contract decisions. |
| 140 | **Collection Bankruptcy Shield** | `/bankruptcy-shield` | Worst-case liquidation planner. Fire-sale values at 24hr/7d/30d timelines. Optimal liquidation order (sell liquid first). Recovery maximization. Emergency cash-out plan generation. |
| 141 | **AI Negotiation Coach** | `/negotiation-coach` | Real-time negotiation advisor. Detects seller urgency from listing age, message patterns. Suggests counter-offers with optimal timing. "Seller listed 47 days ago — high urgency. Open at 62% of asking." |
| 142 | **Multi-Gen Player Comparison** | `/multi-gen-compare` | Cross-era comparison with time-normalized metrics. "1986 Jordan vs 2003 LeBron vs 2018 Luka: career overlay, card value curves, holding period analysis." Inflation-adjusted returns. |

---

## 5. Data Model

### 5.1 Core Entities

```typescript
CardInventory {
  id, player, year, manufacturer, cardNumber, set, sport, league,
  isAutographed, condition, isGraded, gradingCompany, grade,
  purchasePrice, purchaseDate, currentValue, lastValuationDate,
  valuationConfidence, pricingRationale, notes, image, searchUrl,
  realizedGainLoss, taxCategory, overheadCost, taxBasis,
  gradingFees, shippingFees, insuranceFees, salePrice, saleDate, status,
  group, groupOrder,
  popCount, popHigher, scarcityIndex, popReport, gradingRoi,
  liquidityScore, exitPlan, exitPlanId,
  opportunityScore, arbitrageDelta,
  isVaulted, vaultProvider, vaultAssetId, vaultInstantLiquidityPrice
}

UserProfile {
  id, username, displayName, bio, avatarUrl, isPublic,
  twitterHandle, instagramHandle, joinedAt, alphaScore,
  portfolioValue, roi, tier, estimatedTaxRate, isTaxResident
}

Alert { id, type, title, description, timestamp, isRead, priority, actionUrl, relatedId, metadata }
TargetWatchlist { id, player, cardDescription, priority, targetPrice, currentMarketPrice, notes, sport, league, status, image }
```

### 5.2 Trading & Market Entities

```typescript
CounterpartyProfile    // Trust graph node with reputation scoring
CounterpartyEdge       // Trust relationship between counterparties
TrustEvent             // Trust-modifying events (sales, disputes, referrals)
MarketplaceListingRecord  // Cross-marketplace listing tracking
ListingOfferRecord     // Offer/counter-offer management
DealRoomRecord         // Encrypted private deal rooms
DealRoomParticipantRecord // Deal room participant management
DealRoomMessageRecord  // Deal room messaging with offer types
LiquidityTwinSnapshot  // Real-time liquidity analysis snapshots
CatalystMarketEvent    // Market-moving event tracking
ScenarioSnapshot       // Portfolio scenario inputs
ScenarioRunRecord      // Scenario simulation results
ExecutionIntentRecord  // Trade execution intents with approval gates
ExecutionApprovalRecord // Multi-sig approval for executions
ExecutionFillRecord    // Fill confirmation and reconciliation
NegotiationSession     // AI-assisted negotiation tracking
NegotiationMessage     // Negotiation message history
```

### 5.3 AI/Agent Entities

```typescript
AgentInsight           // Individual agent analysis
CollaborativeThesis    // Multi-agent consensus with risk assessment
RiskCollar             // Autonomous trading risk parameters
AutoPilotConfig        // Autonomous trading configuration
AutonomousAction       // AI-initiated trades with policy gates
SwarmInsight           // Intelligence swarm findings
IntelligenceSwarm      // Swarm network configuration
```

### 5.4 Guild/Social Entities

```typescript
GuildMember            // Guild membership with roles
GuildGovernance        // Governance rules (quorum, approvals)
JointAcquisitionProposal  // Crowdfunded acquisition proposals
ProposalVote           // Governance voting records
ContributionLedgerEntry   // Financial contribution tracking
```

### 5.5 New Feature Entities (v4.0)

```typescript
// Provenance DNA
CardFingerprint        // 64-char hex fingerprint with micro-features
OwnershipChainEntry    // Provenance chain with venue tracking
FingerprintMatch       // Cross-reference match with confidence

// Emotional Thermometer
ThermometerReading     // Temperature 0-100 with emotional state
TradingBehavior        // Pattern detection (FOMO, panic, revenge)
BiasDetection          // Cognitive bias identification

// Card Weather
MarketWeather          // Weather condition with meteorological metrics
WeatherForecast        // 7-day market forecast
WeatherSignal          // Individual signal (40+ signals)

// Dead Money
DeadMoneyAsset         // Stagnant asset with opportunity cost
SwapRecommendation     // Asset swap with projected gain

// Swarm Network
PriceSighting          // Crowdsourced price report with verification
SwarmNode              // Network participant with reputation

// Generational Wealth
EstatePlan             // Estate plan with beneficiaries and trusts
InheritanceTaxProjection  // Federal + state tax modeling
StepUpBasis            // Step-up basis calculation at transfer

// Card Aging
AgingSimulation        // Grade decay projection under conditions
GradeDecayProjection   // Grade at future timepoints with confidence

// Sentiment Velocity
SentimentVelocity      // Rate of change of sentiment
InflectionPoint        // Predicted direction change

// Phantom Backtester
BacktestConfig         // Historical portfolio configuration
BacktestResult         // Backtest output with metrics

// Collector Matchmaker
MatchResult            // Compatibility match with trade proposals
TradeProposal          // Asset swap proposal with equity analysis

// Marketplace Integration
MarketplaceConnection  // OAuth connection state per platform
ImportBatch            // Batch import record

// Insurance
AppraisalReport        // Professional appraisal with comps
InsurancePolicy        // Coverage policy with renewal tracking

// Notification
RealtimeNotification   // Multi-channel notification with priority
NotificationRule       // User-defined notification rules

// Dashboard Builder
DashboardLayout        // Widget positions and configuration
DashboardWidget        // Individual widget state

// Offline
SyncQueueItem          // Queued offline transaction
ConflictResolution     // Offline/online data conflict
```

---

## 6. Authentication & Security

| Component | Implementation |
|-----------|---------------|
| Auth Provider | Supabase Auth (email/password + Google OAuth) |
| Session Management | JWT with 4-minute proactive refresh intervals |
| Route Protection | ProtectedRoute HOC wrapping all app routes |
| Demo Mode | Graceful fallback when Supabase is not configured |
| Token Handling | Auto-refresh with expiry detection |
| Encryption | Deal room encryption for private transactions |
| Policy Gates | Multi-sig approval for autonomous actions |
| Audit Log | Full audit trail for portfolio and agent actions |

---

## 7. API Integrations

| API | Purpose | Auth Method |
|-----|---------|-------------|
| Supabase | Database, Auth, Real-time subscriptions | API key + JWT |
| Google Gemini | AI valuations, portfolio analysis, vision grading | API key |
| eBay | Marketplace pricing, listings, purchase history | OAuth 2.0 |
| COMC | Marketplace integration | OAuth 2.0 |
| MySlabs | Marketplace integration | OAuth 2.0 |
| SportLots | Marketplace integration | OAuth 2.0 |
| PWCC | Vault + marketplace integration | OAuth 2.0 |
| Goldin | Auction house integration | OAuth 2.0 |
| Whatnot | Live break marketplace | OAuth 2.0 |
| Stripe | Subscription billing | Client SDK + webhook |

---

## 8. Build & Deployment

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server (Vite HMR) |
| `npm run build` | Production build with code splitting |
| `npm run preview` | Production build preview |
| `npm run test` | Unit/integration tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run lint` | ESLint code analysis |
| `npm run format` | Prettier code formatting |
| `npm run joe` | Feature orchestration script |
| `npm run joe:batch` | Batch feature building |
| `npm run joe:validate` | Feature validation |
| `npm run joe:health` | Codebase health check |
| `npm run joe:bundle` | Bundle size analysis |

**Build Optimizations:**
- Code splitting by vendor chunk (react-vendor, supabase-vendor)
- Lazy loading for ALL 180+ pages via `React.lazy()`
- Suspense boundaries with PageLoadingFallback
- Error boundaries (LazyErrorBoundary) per route
- Chunk size warning: 1000KB limit
- TypeScript strict mode for type safety

**Environment Variables:**
```env
VITE_SUPABASE_URL              # Database endpoint
VITE_SUPABASE_ANON_KEY         # Auth token
GEMINI_API_KEY                 # AI valuations
VITE_STRIPE_PUBLISHABLE_KEY    # Billing
VITE_STRIPE_BASIC_PRICE_ID     # Basic tier
VITE_STRIPE_PRO_PRICE_ID       # Pro tier
VITE_STRIPE_ALPHA_PRICE_ID     # Alpha tier
VITE_EBAY_CLIENT_ID            # eBay marketplace
```

---

## 9. Testing Strategy

| Layer | Tool | Scope | Target |
|-------|------|-------|--------|
| Unit | Vitest + jsdom | Services, utilities | 20%+ coverage |
| Component | @testing-library/react | UI components | Critical paths |
| E2E | Playwright | Full user flows | Auth, dashboard, smoke |
| Integration | Vitest | Service interactions | Data pipeline |

```
tests/
├── lib/           # 76+ service unit tests
├── components/    # 12+ component tests
├── e2e/           # 20+ Playwright E2E tests
└── integration/   # Service integration tests
```

---

## 10. Accessibility & UX

| Feature | Implementation |
|---------|---------------|
| Keyboard Navigation | Custom `useKeyboardShortcuts` hook |
| Focus Management | `useFocusTrap` for modals and dialogs |
| Error Recovery | Error boundaries per route and globally |
| Loading States | Skeleton loaders and Suspense fallbacks |
| Notifications | Toast system via ToastContext |
| Onboarding | GuidedTour with step-by-step walkthrough |
| Mobile | Responsive design, swipe gestures, mobile nav |
| Quick Navigation | Command palette with search |
| PWA | installable, offline-capable, push-ready |
| Offline | OfflineIndicator banner with sync queue display |

---

## 11. Monetization

| Tier | Price | Key Features |
|------|-------|-------------|
| **Basic** | Free | Core portfolio (50 cards), basic alerts, manual valuations |
| **Pro** | $9.99/mo | Unlimited cards, AI valuations, grading tracker, marketplace sync |
| **Alpha** | $29.99/mo | All features, API access, multi-agent AI, institutional tools, offline mode |

**Revenue Streams:**
1. Stripe subscription billing (3 tiers)
2. API licensing for institutional users
3. Affiliate commissions on marketplace transactions
4. Premium marketplace features (deal rooms, auction tools)
5. White-label dealer platform licensing

---

## 12. Platform Statistics

| Metric | Count |
|--------|-------|
| Total Feature Pages | 180+ |
| Total Components | 290+ |
| Total Services | 250+ |
| Total Routes | 142+ |
| Lazy-loaded Modules | 180+ |
| Mock Data Entities | 1,200+ |
| TypeScript Interfaces | 250+ |
| Custom React Hooks | 18+ |
| Context Providers | 3 |
| API Integrations | 10 |
| Industry-First Features | 20 |

---

## 13. Competitive Analysis

| Feature Category | MSI | CardLadder | Market Movers | PSA | ALT |
|-----------------|-----|-----------|---------------|-----|-----|
| Portfolio Management | ✅ Full | ✅ Basic | ✅ Basic | ❌ | ✅ Basic |
| AI Valuations | ✅ Gemini | ❌ | ❌ | ❌ | ❌ |
| Multi-Agent AI | ✅ | ❌ | ❌ | ❌ | ❌ |
| Autonomous Trading | ✅ | ❌ | ❌ | ❌ | ❌ |
| Camera Grading | ✅ | ❌ | ❌ | ❌ | ❌ |
| Emotional Trading Analysis | ✅ | ❌ | ❌ | ❌ | ❌ |
| Card Weather Forecast | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dead Money Detection | ✅ | ❌ | ❌ | ❌ | ❌ |
| Estate Planning | ✅ | ❌ | ❌ | ❌ | ❌ |
| Card Aging Simulation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Provenance DNA | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sentiment Velocity | ✅ | ❌ | ❌ | ❌ | ❌ |
| Portfolio Backtesting | ✅ | ❌ | ❌ | ❌ | ❌ |
| Collector Matchmaker | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crowdsourced Pricing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Offline PWA | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-Sport Hubs | ✅ 4 | Partial | Partial | ❌ | ❌ |
| Custom Dashboards | ✅ | ❌ | ❌ | ❌ | ❌ |
| Insurance Pipeline | ✅ | ❌ | ❌ | ❌ | ❌ |
| 7-Platform Marketplace | ✅ | ❌ | ❌ | ❌ | ❌ |
| Real-Time Notifications | ✅ | ❌ | ❌ | ❌ | ❌ |
| Guild Governance | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tax Optimization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pack Simulation | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 14. Roadmap

### ✅ Completed (v1.0 - v3.0)
- Core portfolio management (50+ features)
- AI/ML valuations and predictions
- Multi-agent autonomous trading system
- Social trading and community features
- Advanced analytics suite (110 production pages)
- Gamification and achievement system

### 🔄 In Progress (v4.0)
- Multi-Sport League Hubs (NFL/NBA/NHL/Soccer)
- AI Grading Vision Engine
- WebSocket Notification Pipeline
- Custom Dashboard Builder
- Live Marketplace Integrations (7 platforms)
- Insurance & Appraisal Pipeline
- Offline-First PWA Hardening
- 10 Industry-First Features (Provenance DNA through Collector Matchmaker)

### 📋 Planned (v5.0)
- Draft Night War Room Simulator
- Card Liquidity Options Desk
- Condition Census Tracker
- Break-Even Velocity Calculator
- Hobby Income Tax Autopilot
- Card Show GPS Navigator
- Rookie Contract Correlation Engine
- Collection Bankruptcy Shield
- AI Negotiation Coach
- Multi-Gen Player Comparison Engine

---

## 15. File Structure

```
ModernSportsIntelligenceDemo/
├── pages/                        # 180+ page components (lazy-loaded)
├── components/                   # 290+ UI components
├── lib/                          # 250+ services, hooks, utilities
├── api/                          # Backend route handlers
│   ├── ai/generate.ts            # Gemini AI endpoint
│   └── market/ebay.ts            # eBay marketplace endpoint
├── contexts/                     # React contexts
│   ├── AuthContext.tsx            # Authentication state
│   ├── ToastContext.tsx           # Toast notifications
│   └── MigrationContext.tsx       # Version migration
├── tests/                        # Test suites
│   ├── lib/                      # Service unit tests
│   ├── components/               # Component tests
│   ├── e2e/                      # Playwright E2E
│   └── integration/              # Integration tests
├── scripts/                      # Build & orchestration scripts
├── public/                       # Static assets
├── types.ts                      # Global TypeScript types
├── constants.tsx                 # Navigation & app constants
├── prepopulatedCards.ts          # Demo data
├── App.tsx                       # Main routing setup
├── index.tsx                     # Application entry point
├── PRD.md                        # This document
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── playwright.config.ts          # E2E test configuration
└── package.json                  # Dependencies & scripts
```

---

*This PRD is a living document updated with each feature release. Version 4.0 reflects the addition of 17 new feature modules including 10 industry-first innovations.*
