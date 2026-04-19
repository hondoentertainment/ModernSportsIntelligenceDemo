# Modern Sports Intelligence Platform — Product Requirements Document (PRD)

**Version:** 4.3
**Last Updated:** March 20, 2026
**Status:** Active Development — v4.0 delivered; v5.0/v5.1 roadmap defined; **UI and ops hardening in progress** (see note below)
**Platform:** Web (React SPA), PWA-enabled

### Production readiness (single definition)

Use this distinction when planning releases:

| Layer | Meaning |
|--------|---------|
| **Demo / feature surface** | Routes, components, and services exist; many flows use **localStorage**, mocks, or AI estimates. Suitable for demos and internal QA. |
| **Production for subscribers** | User data is **durable** (Supabase + DAL), **RLS and auth** protect tenant data, **money paths** are tested, and **monitoring** (health, errors) is configured. |

Engineering checklist and phased work: **[PRODUCTION_READINESS.md](PRODUCTION_READINESS.md)**. Product backlog: **§14 Roadmap** below and **[lib/featureCatalog.ts](lib/featureCatalog.ts)** (`beta` = not yet production-grade). Beta exit criteria: **[docs/BETA_FEATURE_EXIT_CRITERIA.md](docs/BETA_FEATURE_EXIT_CRITERIA.md)**.

---

## 1. Executive Summary

Modern Sports Intelligence is the world's most comprehensive sports card portfolio management and analytics platform. Designed for collectors, traders, dealers, and institutions managing high-value sports card portfolios, it combines real-time market data, AI-powered analytics, multi-agent intelligence, and social trading into a single Bloomberg Terminal-style experience for the $50B+ sports collectibles market.

**Key Differentiators:**
- 180+ feature modules (industry largest)
- AI/ML grading, pricing, and portfolio management
- Multi-agent autonomous trading system
- 35+ industry-first features not found on any competing platform (v4–v5.1 roadmap)
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

### 4.8 Multi-Sport & Infrastructure (v4.0 — Delivered)

| # | Feature | Route | Status | Lines | Description |
|---|---------|-------|--------|-------|-------------|
| 113 | NFL League Hub | `/nfl-hub` | In Progress | — | NFL division standings, draft class tracker, stat leaders, card market correlation |
| 114 | NBA League Hub | `/nba-hub` | In Progress | — | NBA conference standings, draft lottery tracker, rookie card price tracker |
| 115 | NHL League Hub | `/nhl-hub` | In Progress | — | NHL division standings, Stanley Cup bracket, young stars tracker |
| 116 | Soccer Hub | `/soccer-hub` | In Progress | — | Multi-league (PL, La Liga, Serie A, Bundesliga, MLS), transfer window tracker |
| 117 | AI Grading Vision Engine | `/grading-vision-engine` | **Delivered** | 2,396 | Camera workflow: upload → AI analysis → subgrade radar chart → PSA/BGS/SGC predictions → defect detection → ROI calculator → grading company recommendation. Service: 735 lines, Page: 1,137 lines, Widget: 159 lines, Modal: 365 lines |
| 118 | Notification Center | `/notification-center` | **Delivered** | 2,161 | Real-time WebSocket pipeline with 8 channels (price, auction, grading, trade, market, portfolio, social, system), rules builder, quiet hours, digests. Service: 647 lines, Hook: 201 lines, Page: 896 lines, Widget: 181 lines, Modal: 236 lines |
| 119 | Custom Dashboard Builder | `/dashboard-builder` | **Delivered** | 2,394 | Drag-and-drop @dnd-kit widget system with 16+ widget types, grid snapping, resize, presets (Trader/Collector/Analyst/Minimal), localStorage persistence. Service: 552 lines, Page: 986 lines, Renderer: 496 lines, Widget: 123 lines, Modal: 237 lines |
| 120 | Marketplace Integrations | `/marketplace-integrations` | **Delivered** | 1,890 | OAuth to eBay/COMC/MySlabs/SportLots/PWCC/Goldin/Whatnot, auto-import purchases, cross-platform pricing, fee comparison, sell-through analytics. Service: 584 lines, Page: 920 lines, Widget: 156 lines, Modal: 230 lines |
| 121 | Insurance & Appraisal | `/insurance-appraisal` | **Delivered** | 2,106 | Appraisal reports with comps and certification (IRS/Insurance/USPAP), 4-provider policy management, claims workflow with timeline, coverage gap analysis. Service: 782 lines, Page: 939 lines, Widget: 122 lines, Modal: 263 lines |
| 122 | Offline Manager | `/offline-manager` | **Delivered** | 1,958 | Full offline-first PWA: cached portfolios, queued transactions, conflict resolution, storage management, service worker lifecycle, data export/import. Service: 516 lines, Hook: 118 lines, SW: 98 lines, Page: 741 lines, Indicator: 122 lines, Widget: 143 lines, Modal: 220 lines |

### 4.9 Industry-First Features — Round 2 (v4.0 — Delivered)

These features do not exist on ANY competing platform in the sports collectibles industry. All 10 are fully implemented and production-ready.

| # | Feature | Route | Lines | Description |
|---|---------|-------|-------|-------------|
| 123 | **Provenance DNA Fingerprinting** | `/provenance-dna` | 2,409 | AI image hashing creates unique 64-char fingerprints from micro-surface patterns (print dots, centering offset, edge wear). 12 mock fingerprints, 6 ownership chains, counterfeit detection. Service: 845, Page: 1,005, Widget: 93, Modal: 466 |
| 124 | **Emotional Portfolio Thermometer** | `/emotional-thermometer` | 1,737 | Behavioral finance layer with 8 emotional states, 7 bias types, 30-day history. Giant thermometer CSS visualization, trade blocking during tilt, cooldown timer, emotional journal. Service: 466, Page: 833, Widget: 140, Modal: 298 |
| 125 | **Card Weather System™** | `/card-weather` | 1,697 | 43 signals across 7 categories combined into weather metaphors. Animated CSS weather icons, 7-day forecast, radar sweep visualization, 5 sport regions, 6 card category regions. Service: 384, Page: 885, Widget: 162, Modal: 266 |
| 126 | **Dead Money Detector** | `/dead-money-detector` | 2,113 | 17 mock dead money cards, 11 swap recommendations, 7 catalyst events. SVG health gauge, capital efficiency charts, asset velocity scatter plot, swap simulator. Service: 922, Page: 827, Widget: 93, Modal: 271 |
| 127 | **Micro-Arbitrage Swarm Network** | `/micro-arbitrage-swarm` | 1,702 | 24 mock sightings across US cities, 10 swarm nodes. Live feed with 8s simulated updates, geographic heat map, reputation system, verification workflow. Service: 480, Page: 894, Widget: 106, Modal: 222 |
| 128 | **Generational Wealth Planner** | `/generational-wealth` | 2,811 | 4 beneficiaries, 3 trust types, 16 states with real tax data, 30-year projections. 8-tab layout with allocation sliders, step-up basis calculator, document generator, charitable giving planner. Service: 962, Page: 1,374, Widget: 103, Modal: 372 |
| 129 | **Card Aging Simulation Lab** | `/card-aging-lab` | 2,717 | 4 material profiles, 8 storage tiers with realistic degradation curves. Animated aging card visual, multi-scenario comparison charts, material science breakdown, storage ROI calculator. Service: 999, Page: 1,232, Widget: 202, Modal: 284 |
| 130 | **Sentiment Velocity Engine** | `/sentiment-velocity` | 1,675 | 17 players across 5 leagues with 48-hour histories, 7 inflection points. Dual-axis sentiment+velocity chart, inflection countdown timers, divergence alerts, 8s real-time updates. Service: 392, Page: 817, Widget: 125, Modal: 341 |
| 131 | **Phantom Portfolio Backtester** | `/phantom-backtester` | 2,483 | 22 players with 60-month price histories, 4 benchmark indices, 5 preset strategies. Equity curve vs benchmark, drawdown plot, monthly returns heatmap, what-if modifier. Service: 759, Page: 1,188, Widget: 116, Modal: 420 |
| 132 | **Collector Compatibility Matchmaker** | `/collector-matchmaker` | 2,236 | 9 collector profiles, 8 match results, 4 trade proposals. Swipe-style discovery, radar chart compatibility, Nash equilibrium panel, trade equity meter, proposal inbox. Service: 857, Page: 1,030, Widget: 102, Modal: 247 |

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

### 4.11 Next Set of Features Not Present in the Industry (v5.1+ — Frontier)

The following features do not exist on any competing platform in sports collectibles or adjacent markets. They extend the agentic moat (outcome memory, market truth, counterparty identity) and introduce institutional-grade and regulatory-first capabilities.

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 143 | **Agent Outcome Memory Dashboard** | `/agent-outcome-memory` | Closed-loop view: what the AI recommended vs what you did vs what actually happened (fill price, hold return). Surfaces recommendation → intent → outcome linkage; no competitor has persistent agent feedback. |
| 144 | **Market Truth Ledger** | `/market-truth-ledger` | Single source of truth for "what actually sold" (eBay sold, auction results) with provenance. Normalized, queryable "last N real sales" per card; validates AI and powers comp-backed confidence. |
| 145 | **Counterparty Passport** | `/counterparty-passport` | Portable reputation: trust score, dispute history, deal velocity that follows the counterparty across venues. Skeleton in place; full passport with cross-platform identity resolution. |
| 146 | **Thesis Backtester** | `/thesis-backtester` | "If you had bought every card the agents recommended in the last 12 months, here is your hypothetical P&L." Proves or disproves agent value with real outcome data. |
| 147 | **Liquidity Horizon Curve** | `/liquidity-horizon` | Per card or portfolio: probability of exit at X% of FMV within 1d / 7d / 30d / 90d from real depth and velocity. Institutional-style liquidity risk, not just a score. |
| 148 | **Fair Value Confidence Interval** | `/fv-confidence` | FMV as interval, not point: e.g. "$500 (70% confidence: $380–$620)" from model + market truth. Transparent uncertainty on every valuation. |
| 149 | **Regulatory Change Alerts** | `/regulatory-alerts` | Proactive alerts when state/federal rules change: sales tax nexus, collectibles-as-securities, 1099-K thresholds. No hobby tool offers regulatory monitoring. |
| 150 | **Agent Delegation Audit** | `/agent-delegation-audit` | Full log of "agent requested X → human approved/rejected → outcome Z" with export for compliance. Critical for institutional and regulated use. |
| 151 | **Capital Flow Radar** | `/capital-flow-radar` | Where is money moving? (Players, grades, venues.) Institutional-style flow analytics for the hobby. |
| 152 | **Synthetic Index Builder** | `/synthetic-index-builder` | User-defined custom index (e.g. "PSA 10 Rookie QBs 2018–2022") with daily index value and attribution. No platform offers user-defined collectible indices with live valuation. |
| 153 | **Catastrophe Liquidation Simulator** | `/catastrophe-liquidation` | "If you had to raise $X in 48 hours, optimal sequence and expected haircut." Stress-test for emergency cash needs; extends bankruptcy-shield concept. |
| 154 | **Portfolio Immunization** | `/portfolio-immunization` | Bond-style duration: "Your portfolio's duration to a hobby recession is X months; rebalancing to Y shortens it." Duration/convexity for collectibles. |
| 155 | **Cross-Venue Identity Graph** | `/identity-graph` | Link same seller/buyer across eBay, COMC, PWCC, etc. for true counterparty history and concentration risk. No one unifies identity across venues. |
| 156 | **Narrative Lifecycle Tracker** | `/narrative-lifecycle` | Track a narrative (e.g. "rookie breakout") from first mention → social spike → price move → exhaustion. Helps time entries and exits. |
| 157 | **Agent Personality Cloning** | `/agent-personality` | User trains a "mini-me" agent (risk tolerance, league preference, max position) that screens and ranks opportunities; human still approves. Personalization at scale. |

### 4.12 Next 10 Industry-Absent Features (v5.2 — Frontier)

| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 158 | **Bid-Ask Spread Predictor** | `/bid-ask-spread-predictor` | Predict short-term bid-ask spread by venue and card. No hobby tool offers spread prediction. |
| 159 | **Wash-Sale Horizon Calendar** | `/wash-sale-horizon` | Calendar of tax wash-sale windows per lot; avoid triggering wash-sale rules. Industry-absent. |
| 160 | **Seller Urgency Score** | `/seller-urgency-score` | Listing age, price drops, views → urgency score for negotiation timing. Novel. |
| 161 | **Portfolio Beta to Index** | `/portfolio-beta-index` | Beta/correlation of portfolio to a custom or standard card index. Institutional-grade. |
| 162 | **Grading Queue Estimator** | `/grading-queue-estimator` | Est. position in PSA/BGS queue and ETA. Not offered elsewhere. |
| 163 | **Reputation Decay Tracker** | `/reputation-decay-tracker` | How counterparty reputation decays after disputes or inactivity. Novel. |
| 164 | **Event Impact Attribution** | `/event-impact-attribution` | Attribute price move to specific event (trade, injury, award). Not standard. |
| 165 | **Liquidity Reserve Calculator** | `/liquidity-reserve-calculator` | Recommend % of portfolio to hold in liquid cards for emergencies. Novel. |
| 166 | **Cross-Sport Momentum** | `/cross-sport-momentum` | When one sport's cards run hot, lagged effect on others. Novel. |
| 167 | **Agent Confidence History** | `/agent-confidence-history` | Time-series of agent recommendation accuracy (rolling). Uses outcome memory. |

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
| Industry-First Features | 35+ |

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

### 📋 Next (v5.1+ — Frontier, Not in Industry)
- **Agent moat:** Agent Outcome Memory Dashboard, Thesis Backtester, Agent Delegation Audit, Agent Personality Cloning
- **Market truth:** Market Truth Ledger, Fair Value Confidence Interval, Liquidity Horizon Curve, Capital Flow Radar
- **Identity & trust:** Counterparty Passport (full), Cross-Venue Identity Graph
- **Risk & institutional:** Catastrophe Liquidation Simulator, Portfolio Immunization, Synthetic Index Builder
- **Regulatory & narrative:** Regulatory Change Alerts, Narrative Lifecycle Tracker

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

*This PRD is a living document updated with each feature release. Version 4.3 (March 2026) documents **demo/ops hardening** (logging, retries, error reporting, health checks, security headers). **Production for subscribers** additionally requires durable data (DAL/Supabase migration), RLS/auth breadth, and monitoring — see [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) and the PRD “Production readiness (single definition)” callout. Version 4.2 added the v5.1+ Frontier industry-absent features.*

---

## Phase 69-73: Production-Grade Infrastructure Wave

### Phase 69: Dashboard Integration Hub 🏗️ PRODUCTION
- **Objective**: Wire ALL phase 44-68 widgets and modals into the main Dashboard with proper state management, lazy loading, and modal rendering — fixing the critical “orphaned widget/modal” gap where clicking widgets opens nothing.
- **Key Features**:
    - Lazy-load all 25 phase widgets (SetCompletionWidget, TimeMachineWidget, TradingRulesWidget, TechnicalWidget, DataImportWidget, SocialWidget, WaxInvestWidget, AuthIntelWidget, PlayerIndexWidget, DisplayCaseWidget, GradePremiumWidget, DealFinderWidget, InsurancePolicyWidget, PopGrowthWidget, EventWidget, SeasonalWidget, CurrencyWidget, ProspectWidget, GoalWidget, NotificationWidget, StressTestWidget, GradePredictWidget, TaxHarvestWidget, CorrelationWidget, LiquidityWidget).
    - Render corresponding modals at Dashboard bottom with proper isOpen/onClose state management.
    - Widget visibility toggles: user can show/hide widgets, persisted to localStorage.
    - Responsive 2-column grid layout for widget section.
    - Section header “Intelligence Hub” with collapse/expand toggle.
    - Performance: each widget wrapped in LazyErrorBoundary + Suspense with WidgetLoadingFallback.

### Phase 70: App Shell Hardening 🏗️ PRODUCTION
- **Objective**: Harden the application shell with granular error boundaries, 404 page, mobile navigation, scroll-to-top, and resilience patterns.
- **Key Features**:
    - NotFoundPage component for unmatched routes with “Return to Dashboard” link.
    - Catch-all Route path=”*” in App.tsx routing.
    - MobileNav integration into AppLayout (currently referenced but never rendered).
    - ScrollToTop component that scrolls to top on route change.
    - Widget-level error boundaries with “Retry” button and graceful fallback UI.
    - WidgetErrorFallback component: shows widget name, “Something went wrong”, retry/dismiss buttons.
    - Loading skeleton components for widget placeholder states.
    - Keyboard shortcut legend accessible from header (? key).

### Phase 71: Enhanced Command Center & Discovery 🏗️ PRODUCTION
- **Objective**: Make all 68 phases and 100+ features discoverable through an enhanced command palette, feature cards, and keyboard-driven navigation.
- **Key Features**:
    - Enhanced CommandPalette with all phase 44-68 features indexed (name, description, icon, route/action).
    - “Press ⌘K to search” hint text visible in header search bar.
    - Feature categories: Analytics, Trading, Social, Risk, Tax, International, Grading, Events.
    - Recent commands history (last 10 actions, persisted to localStorage).
    - Quick actions: “Run Stress Test”, “Check Tax Harvests”, “View Liquidity”, “Open Grading Queue”.
    - Keyboard shortcuts for top features (displayed in palette results).
    - FeatureSpotlight component: rotating feature discovery cards on dashboard.
    - Feature of the Day: highlight one underused feature with description and CTA.

### Phase 72: Interactive Onboarding Suite 🏗️ PRODUCTION
- **Objective**: Replace the basic 7-step tour with a comprehensive onboarding experience including setup wizard, progress checklist, and contextual help.
- **Key Features**:
    - SetupWizard: 5-step first-time wizard (Welcome → Add Cards → Set Budget → Choose Sports → Tour Dashboard).
    - OnboardingChecklist: persistent sidebar checklist tracking 8 milestones (add first card, sync prices, set alert, run analysis, check tax, view social, stress test portfolio, export report).
    - Progress tracking with animated completion percentage.
    - Contextual tooltips: hover-triggered help bubbles on complex UI elements (VaR, beta, Sharpe ratio, wash-sale).
    - GlossaryPanel: searchable glossary of 50+ sports card and financial terms.
    - First-time feature hints: one-time tooltip shown when user first visits a new feature page.
    - Celebration animations on milestone completion (confetti burst).
    - All state persisted to localStorage with msi_onboarding_ prefix.

### Phase 73: Unified Export & Report Engine 🏗️ PRODUCTION
- **Objective**: Wire real service data from all phases into a comprehensive reporting and export system with PDF generation, CSV export, and performance attribution.
- **Key Features**:
    - PortfolioReportService: aggregates data from all 25+ services into unified report structure.
    - Report types: Portfolio Summary, Tax Report, Insurance Valuation, Performance Attribution, Grading ROI, Liquidity Analysis, Stress Test Results.
    - PDF generation using jsPDF with branded dark-theme styling, charts rendered as images.
    - CSV export for all data tables (holdings, transactions, tax lots, grades, deals).
    - Scheduled report preferences: daily/weekly/monthly email digest mockup.
    - Report history with preview and re-download.
    - One-click “Export All” for complete data backup as JSON.
    - ReportDashboardWidget: quick access to generate/download recent reports.
    - Enhanced ReportModal with live data preview, format selector, and delivery preferences.
