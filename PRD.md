# Product Requirements Document (PRD): Modern Sports Intelligence

## 1. Executive Summary
**Modern Sports Intelligence** is a premium analytics platform designed for sports card collectors, analysts, and fans. It combines real-time sports data with advanced financial tracking and AI-powered market insights to provide a comprehensive view of "sports as an asset class." The platform now features a professional-grade Investment Tracking engine with realized P/L analysis, an "Alpha Correlation" discovery system, AI-powered negotiation capabilities, and a comprehensive subscription billing system.

## 1.1 Key Recent Additions
- **AI-Powered Negotiation Arena**: Real-time negotiating with AI sellers using Gemini-powered responses
- **Deep Search Intelligence**: Semantic search engine for finding cards by "vibe" and trajectory
- **Image Lightbox Component**: Professional image viewing experience with ESC key support
- **Stripe Billing Integration**: Multi-tier subscription system with usage-based pricing
- **NegotiationService**: Complete negotiation logic with sentiment analysis and fallback systems
- **Phase 13: Scarcity Intelligence**: Integrated population reporting and "Pop 1" alerts
- **Phase 14: Social Alpha Elite**: Live Hype Feed and institutional collector tiers
- **Phases 39-43**: Trade Block & Offers, Market Watchlists & Price Alerts, Analytics Reports & Export, Community Benchmarking & Leaderboards, Smart Collection Advisor
- **Phases 44-48**: Set Completion Registry, Portfolio Time Machine, Automated Trading Rules Engine, Advanced Technical Analysis Suite, Data Import Hub & External Sync
- **Phases 49-53**: Social Network & Collector Messaging, Sealed Wax Investment Tracker, Counterfeit & Authentication Intelligence, Player Market Index, Digital Display Case

## 2. Project Vision & Objectives
### 2.1 Vision
To become the definitive source of truth for sports asset valuation, bridging the gap between on-field performance metrics and off-field market liquidity across all major professional ecosystems.

### 2.2 Strategic Objectives
- Provide real-time transparency into multi-league portfolio value (Realized + Unrealized).
- Leverage Generative AI to automate cross-league market research and identify "Alpha Divergence."
- Create a "Stock Market for Sports" experience through a unified, premium UI/UX.

## 3. Target Audience
- **High-Net-Worth Collectors**: Managing diversified portfolios of sports assets.
- **Data-Driven Prospectors**: Focusing on Minor League (MiLB) trends and early-entry opportunities.
- **Hobby Analysts**: Fans interested in the intersection of performance stats and card scarcity.

## 4. Feature Specifications

### 4.1 League Intelligence Dashboard (NAV Central)
- **Net Asset Value (NAV)**: Dynamic calculation of portfolio worth grouped by professional league.
- **Financial Intelligence**: Realized P/L, Total Portfolio Gain, and ROI tracking for active and sold assets.
- **League Intelligence HUD**: A specialized analytics interface for switching between major market hubs.

### 4.2 Automated Ingestion & Inventory Management
- **Intelligent Mapping**: Automated classification of assets into professional leagues.
- **Sold Vault**: Targeted view for tracking historical performance of exited positions.
- **Grading Support**: Integrated fields for PSA, BGS, SGC, with automatic valuation adjustments.

### 4.3 Market Intelligence (Market Pulse)
- **Sentiment Analysis**: Tracking "Hype" vs. "Utility" for top-tier cards.
- **Alpha Correlation**: Overlaying on-field performance stats (OPS, ERA) with market price trends to identify undervalued assets.
- **Lagging Alpha Alerts**: Automated signals when performance outpaces price action.

### 4.4 AI Discovery Engine (Gemini 1.5 Integration)
- **Automated Valuation**: Analyzing eBay sold listings via NLP to determine "Fair Market Value."
- **Live Market Sync**: Batch-processing engine for on-demand portfolio updates.
- **Prospect Discovery**: Simulating trend scores for MiLB players using performance data.

### 4.5 Watchlist & Comparison
- **Target Price Alerts**: Notifications when a watched asset reaches a buy/sell threshold.
- **comparative Analysis**: Side-by-side performance overlays.

### 4.6 AI Negotiation Arena (NEW)
- **Real-time Negotiation**: Live chat-based negotiation with AI sellers using Gemini 1.5 Flash.
- **Sentiment Analysis**: Seller sentiment tracking (positive, neutral, negative, aggressive).
- **Auto-Negotiation**: Automated negotiation agent that negotiates on behalf of users.
- **Negotiation Configuration**: Users set maximum willing price and walk-away parameters.
- **Deal Securing**: Complete transaction flow with portfolio integration.

### 4.7 Deep Search Intelligence (NEW)
- **Semantic Search**: AI-powered search by "vibe", era, trajectory, or specific card similarity.
- **Similarity Scoring**: Percentage-based matching system with institutional-grade results.
- **Natural Language Queries**: Search using conversational language and investment thesis.
- **Alpha Rationale**: AI-generated explanations for why cards are similar or recommended.
- **Smart Suggestions**: Pre-built search queries for common scouting scenarios.

### 4.8 Image Viewing Experience (NEW)
- **Professional Lightbox**: Full-screen image viewing with ESC key support and background blur.
- **Responsive Design**: Mobile-optimized viewing up to 90vw/90vh constraints.
- **Accessibility Support**: ARIA labels, keyboard navigation, and focus management.
- **Caption Display**: Contextual information overlays with player and card details.

## 5. Technical Architecture
### 5.1 Technology Stack
- **Frontend**: React 19, Vite, TypeScript.
- **Styling**: Vanilla CSS with "Legacy of the Void" design system.
- **Intelligence**: Google GenAI (Gemini 1.5 Flash).
- **Data Visualization**: Recharts (Customized with brand gradients).
- **Icons**: Lucide React.
- **Billing**: Stripe integration with Supabase Edge Functions.
- **State Management**: React hooks with custom context providers.

### 5.2 Deployment
- **Hosting**: Vercel (Production environments).
- **Environment**: Secure `.env` management.

## 6. Design & UX Principles
- **Terminal Aesthetic**: High-contrast, dark-mode design using `font-bebas` and a "Deep Slate" palette.
- **UI Component Standardization**: Unified button components and typography.
- **Spatial HUD Stability**: Zero-overlap layout philosophy.

## 7. User Stories
- *As a fund manager*, I want to see my realized profit from card sales so I can report on annual performance.
- *As a scout*, I want to see which AAA players have high performance stats but low market trend scores ("Lagging Alpha").
- *As a user*, I want to compare a raw card vs. a PSA 10 counterpart to determine the "grading premium."

## 8. Roadmap & Future Scope

### Completed Phases (1-14)
- **Foundation**: Multi-League Support, Automated Classification.
- **Core Features**: Auth System, Data Migration, Automated Sync Scheduler.
- **Advanced Analytics**: Investment Tracking, Realized P/L, Sold Vault.
- **Discovery**: Alpha Scanner (Vision), Alpha Correlation (Stats vs Price).
- **Intelligence (Phase 13)**: Scarcity Intelligence with badge logic and Pop 1 alerts.
- **Social (Phase 14)**: Social Alpha Elite with Hype Feed & Investor Tiers.

### Phase 15: Mobile Native Experience (COMPLETE)
- **Objective**: Optimize for on-the-go scouting.
- **Key Features**:
    - Enhanced Service Worker with multi-strategy caching (static, API, dynamic).
    - Background sync and cache eviction with stale-while-revalidate.
    - PWA install prompt handling (`usePWAInstall` hook) with MobileNav install button.
    - Haptic feedback (Vibration API) on price alerts and swipe actions.
    - SwipeableCard: swipe-right for watchlist, swipe-left to mark for sale.
    - SW lifecycle management with auto-update detection and client claim.

### Phase 16: Agentic Negotiation (COMPLETE)
- **Objective**: AI agents that can negotiate deals on behalf of the user.
- **Key Features**:
    - Negotiation Playbook Templates (Lowball & Walk, Fair Market Anchor, Bundle Discount, Quick Close).
    - Custom playbook creation with configurable firmness, increment rate, and walk-away thresholds.
    - Playbook-driven auto-negotiation with `getPlaybookOffer()`.
    - Negotiation Analytics: win rate, avg discount, total saved, rounds, time-to-close, per-playbook stats.

### Phase 17: Institutional Liquidity Pool (COMPLETE)
- **Objective**: Create an internal marketplace where users can sell assets instantly to the "MSI House" at a slight discount.
- **Key Features**:
    - AI-driven "Instant Buy" valuations based on liquidity score discount tiers (8%-35%).
    - 5-tier discount system: Premium Liquid, Standard, Moderate, Low Liquidity, Illiquid.
    - 15-minute quote expiration with real-time countdown timer.
    - Speed Bonus: +2% payout if accepted within 5 minutes.
    - 2% MSI platform processing fee.
    - Side-by-side comparison vs eBay net proceeds (including time-to-sell estimate).
    - Liquidity Pool Dashboard widget on main dashboard showing top instant offers.
    - "Instant Sell to MSI House" button on every card in the collection.
    - Transaction history with localStorage persistence.
    - Portfolio-wide batch quote generation sorted by best value.

### Phase 18: Predictive Alpha Engine (COMPLETE)
- **Objective**: Move from tracking to forecasting with multi-factor predictive models.
- **Key Features**:
    - Price Trajectory Forecasting: 30/90/180/365-day projections using weighted momentum, scarcity multipliers, grade premiums, and volatility adjustments.
    - Breakout Probability Scoring: 5-factor weighted analysis (Prospect Status, Scarcity, Momentum, Grade, Value Position) producing 0-100 breakout score.
    - Breakout Tiers: Elite Breakout, High Potential, Moderate, Low, Unlikely with recommendations (Strong Buy → Sell).
    - Catalyst Detection: Automated identification of price catalysts (scarcity, grade premium, league timing, autograph, liquidity, ROI).
    - Portfolio-Wide Predictions: Aggregate forecasted NAV, overall sentiment, top breakout candidates, at-risk positions.
    - BreakoutRadar Dashboard Widget: Portfolio prediction overview with sentiment, projected NAV, breakout list, risk alerts.
    - PredictiveAlphaModal: Per-card deep-dive with trajectory, recommendation, projections, factor analysis, catalysts.
    - "Price Trajectory" button on every card in the collection grid.

### Phase 19: Multi-Agent Intelligence (COMPLETE)
- **Objective**: Deploy specialized agents for autonomous portfolio management.
- **Key Features**:
    - Synthetic Analyst Team with 4 named agents: Atlas (Scout), Apex (Market), Sentinel (Risk), Viper (Negotiator).
    - Each agent has distinct personality, specialty, analysis logic, and data points.
    - Per-card Investment Thesis: All 4 agents analyze independently, then produce a weighted consensus verdict (Strong Buy → Sell) with confidence score.
    - Dissent detection: Highlights when agents disagree, noting which agents hold contrary views.
    - Portfolio Briefing: Aggregate health score (0-100), per-agent reports with action items, top picks, and risk alerts.
    - Scout Agent: Breakout detection, prospect evaluation, autograph premium analysis.
    - Market Agent: Price trajectory, liquidity assessment, ROI analysis, 30-day projections.
    - Risk Agent: Concentration risk, volatility assessment, exit risk, grade risk, cost basis analysis.
    - Negotiator Agent: Entry/exit timing, fair value range, negotiation leverage assessment.
    - AgentInsightsPanel: Dashboard widget with expandable agent reports, health indicator, top picks, and risk alerts.
    - AgentThesisModal: Per-card 4-agent deep-dive with consensus banner, individual analyses, data points, and key points.
    - "Agent Thesis" button on every card in the collection grid.

### Phase 20: Liquidity Intelligence (COMPLETE)
- **Objective**: Institutional-grade market depth analysis and portfolio liquidity visualization.
- **Key Features**:
    - Simulated Order Book: Bid/ask levels with cumulative volumes, spread calculation, buy pressure percentage.
    - Market Impact Analysis: Slippage estimates for selling 1/3/5/10 units based on order book depth.
    - Volume Velocity Metrics: Daily/weekly/monthly volume, velocity classification (very fast → very slow), avg days to sell, sell-through rate.
    - Recent Comparable Sales: Price consensus scoring from simulated market data.
    - Portfolio Liquidity Report: Liquid/moderate/illiquid value breakdown, avg liquidity score, estimated days to liquidate.
    - Liquidity Heatmap Widget: Color-coded distribution bar with 5 liquidity buckets, stuck inventory warnings, illiquid concentration risk alerts.
    - MarketDepthModal: Per-card deep-dive with spread, buy pressure, velocity, order book visualization, market impact grid, and comparable sales.
    - "Market Depth" button on every card in the collection grid.
    - Dashboard integration with LiquidityHeatmap widget and MarketDepthModal click-through.

### Phase 21: Cross-Asset Correlation (COMPLETE)
- **Objective**: Hedge strategies across sport ecosystems.
- **Key Features**:
    - Enhanced Correlation Engine: Pearson correlation from price history data with heuristic fallback for 10 sport pairings.
    - Diversification Score (0-100) using Herfindahl-Hirschman Index for portfolio concentration measurement.
    - Correlation Heatmap Matrix: Visual sport-to-sport correlation grid with color-coded cells.
    - Risk Exposure Breakdown: Per-sport allocation bars with percentage tracking.
    - Hedge Advisor: Strategic risk mitigation with High/Medium/Low impact recommendations (Concentration, Seasonal, Diversification).
    - Hedge Simulation Engine: Full rebalancing simulation with proposed hedge nodes.
    - Virtual Hedge Nodes: 4 node types (Rotate, Trim, Hedge, Rebalance) with deploy tracking and localStorage persistence.
    - Portfolio Concentration Breakdown: Visual weight bars with risk classification per sport.
    - Seasonal Outlook: Month-aware market timing insights for all 12 months.
    - Correlation Insights: Auto-generated intelligence on high/low correlation pairs and diversification opportunities.
    - Deploy All: Batch deployment of all proposed hedge nodes with projected diversification score improvement.
    - 30-day node expiration with deployment history tracking.

### Phase 22: Fiscal Intelligence (COMPLETE)
- **Objective**: Automated tax and cost-basis tracking.
- **Key Features**:
    - Tax-Lot Accounting: Per-card cost basis calculation including purchase price, grading fees, and shipping fees.
    - Cost-Basis Methods: FIFO, LIFO, Specific Identification, and Average Cost with one-click switching.
    - Schedule D Generation: IRS-compatible entries with description, dates acquired/sold, proceeds, cost basis, and gain/loss.
    - Holding Period Classification: Automatic Short-Term vs Long-Term determination with days held tracking.
    - Tax Liability Estimation: Estimated tax at 32% (short-term) and 15% (long-term) capital gains rates.
    - Method Comparison: Side-by-side comparison of tax liability across all 4 cost-basis methods with "Optimal" badge.
    - Tax-Loss Harvesting: Automated identification of unrealized losses with estimated tax savings per position.
    - TaxReportModal: Per-card deep-dive with cost basis breakdown, holding period timeline, tax impact, and harvesting alerts.
    - TaxSummaryWidget: Dashboard widget with YTD gains/losses, short-term vs long-term split, effective tax rate, and harvest candidates.
    - Short-term holding threshold alert: Shows days remaining to qualify for long-term rate with potential savings.
    - "Tax Lot Analysis" button on every card in the collection grid.

### Phase 23: Visual Audit Simulation (COMPLETE)
- **Objective**: AI-powered grading predictions using high-fidelity vision.
- **Key Features**:
    - Grade Prediction Engine: Simulated sub-grade analysis (Surface, Centering, Corners, Edges) on 1-10 scale.
    - Grade Probability Distribution: PSA 10 through PSA 7 probability percentages based on condition, age, manufacturer, and autograph status.
    - Grade Value Projections: Expected market value at each grade level using current value as baseline.
    - Grade ROI Analysis: Grading cost vs expected value uplift with net ROI calculation.
    - Grading Recommendations: "Grade Now", "Hold", or "Re-examine" based on ROI threshold analysis.
    - Grade Confidence Score: 0-100 confidence in predicted grade outcome.
    - GradingPredictionModal: Per-card deep-dive with sub-grade bars, probability distribution, value projections, and ROI analysis.
    - GradeAuditWidget: Dashboard widget showing ungraded card count, total value uplift potential, and top 5 "Grade Now" candidates.
    - "Grade Prediction" button on ungraded cards in the collection grid.

### Phase 24: Macro-Sentinel Monitoring (COMPLETE)
- **Objective**: Early warning system for global market shifts affecting luxury assets.
- **Key Features**:
    - 8 Macro Indicators across 4 categories (Economic, Market, Hobby, Seasonal): Consumer Confidence, S&P 500 Trend, eBay GMV, Hobby Search Volume, Auction House Premium Index, Card Show Attendance, New Collector Entry Rate, Seasonal Demand Cycle.
    - Market Regime Detection: Risk-On, Risk-Off, Transition, or Neutral classification based on aggregate bullish/bearish indicator counts.
    - Portfolio Exposure Assessment: Well-Positioned, Moderately Exposed, At Risk, or Critical Exposure ratings with per-sport sensitivity analysis.
    - Macro Alerts: Severity-ranked alerts (Critical/Warning/Info) when indicators cross thresholds with actionable recommendations.
    - MacroAlertModal: Detailed alert view with indicator sparkline, impact analysis, and related indicators.
    - MacroSentinelWidget: Dashboard widget with regime badge, exposure assessment, indicator grid with trend arrows, and active alerts.
    - Deterministic date-seeded simulation for consistent indicator values.

### Phase 25: Break-Even Calculator (COMPLETE)
- **Objective**: Show collectors the minimum sale price needed to profit after all fees.
- **Key Features**:
    - Marketplace fee schedules (eBay 13.12%, COMC 5%, MySlabs 9%, PWCC 9.5%, Private 0%).
    - Break-even price formula accounting for percentage + fixed platform fees.
    - Profit scenarios at -20%, current, +20%, +50%, and 2x price points.
    - Additional costs input for insurance, holders, etc.
    - Integrated into CardGridItem and Collection page via BreakEvenModal.

### Phase 26: Collection Insurance Valuation Report (COMPLETE)
- **Objective**: Generate insurance-ready valuation documents.
- **Key Features**:
    - Timestamped FMV per card with grading details.
    - Replacement cost estimate (115% of FMV).
    - Itemized inventory sorted by value with page breaks.
    - Policyholder information and unique report ID.
    - Professional PDF with disclaimers.

### Phase 27: What-If Portfolio Simulator (COMPLETE)
- **Objective**: Test trades before executing.
- **Key Features**:
    - Simulate buy/sell trades and see NAV, ROI, diversification, and liquidity impact.
    - League exposure comparison (current vs. simulated).
    - Concentration risk warnings when single league exceeds 60%.
    - Diversification regression alerts.

### Phase 28: Grading Submission Batch Planner (COMPLETE)
- **Objective**: Optimize grading submissions for maximum ROI.
- **Key Features**:
    - Identifies raw cards with highest grading ROI potential.
    - Grade probability expectations by condition (Mint, Near Mint, Excellent).
    - Groups candidates into optimal service tiers by value bracket.
    - High-value ($200+) → PSA Regular, Mid ($50-200) → PSA Economy, Low (<$50) → SGC Economy.
    - Total fees, expected gain, and best company recommendation.

### Phase 29: eBay Listing Draft Generator (COMPLETE)
- **Objective**: Auto-generate SEO-optimized eBay listings from card metadata.
- **Key Features**:
    - Title format: Year → Brand → Player → Set → Card# → Grade → Features (max 80 chars).
    - HTML description template with card details table.
    - Starting bid (75% FMV) and Buy It Now (110% FMV) pricing.
    - Keyword extraction for eBay search visibility.
    - Copy-to-clipboard for quick paste into eBay.

### Phase 30: Collection Sharing & Embed Widget (COMPLETE)
- **Objective**: Let collectors showcase collections on forums and social profiles.
- **Key Features**:
    - Shareable collection snapshots with stats (total value, card count, top league).
    - Self-contained HTML embed widget with brand styling.
    - Select specific cards or share entire collection.
    - Local persistence for managing multiple shared collections.

### Phase 31: Wax Break ROI Tracker (COMPLETE)
- **Objective**: Track cost vs. return of hobby/wax box breaks.
- **Key Features**:
    - Create breaks with product name and cost.
    - Log individual card pulls with estimated values and "hit" flags.
    - Automatic ROI and profit calculation per break.
    - Aggregate stats: total spent, win rate, avg ROI, best/worst break, total hits.

### Phase 32: Usability & Accessibility Overhaul (COMPLETE)
- **Objective**: Enhance UX by 50%+ through comprehensive usability improvements across the platform.
- **Key Features**:
    - **Keyboard Shortcuts System**: Global shortcuts (`/` focus search, `Ctrl+K` command palette, `n` new card, `Esc` clear) via reusable `useKeyboardShortcuts` hook.
    - **Command Palette**: Searchable command launcher (Ctrl+K) with arrow key navigation, 10 navigation routes, and contextual actions. Uses focus trap and full ARIA support.
    - **Confirm Dialog**: Replaced browser `confirm()` with branded modal dialogs (danger/warning/info variants) with focus trap and ARIA attributes.
    - **Undo-capable Toasts**: Toast notifications with undo button support (auto-extends to 8s), escape key dismiss, deduplication.
    - **Collection Sort**: Full sort functionality with 6 fields (value, price, player, year, sport, league) and direction toggle.
    - **Bulk Operations**: Select mode with select-all, bulk delete (with undo), and JSON export.
    - **Search Enhancements**: Result count display, clear button, ref-based focus, empty state with filter clear action.
    - **Price Update Feedback**: Shows old→new value delta toast with error handling on market price updates.
    - **Skeleton Loaders**: `CardSkeleton`, `StatSkeleton`, `ChartSkeleton`, `DashboardSkeleton` components integrated into loading states.
    - **Focus Trap Hook**: Reusable `useFocusTrap` for modal accessibility (Tab wrapping, focus restore).
    - **ARIA Accessibility**: Added `aria-label`, `aria-haspopup`, `aria-expanded`, `aria-current`, `aria-modal`, `role="dialog"`, `role="menu"` across Header, Sidebar, AddAssetModal, CommandPalette, and ConfirmDialog.
    - **Swipeable Cards**: Touch gesture support for mobile card triage (right=watchlist, left=mark for sale) with haptic feedback.

### Phase 33: Portfolio Rebalancing Alerts (COMPLETE)
- **Objective**: Automated notifications when portfolio drift exceeds thresholds.
- **Key Features**:
    - Portfolio target allocation per sport (Baseball 25%, Basketball 25%, Football 25%, Hockey 15%, Soccer 10%) with configurable tolerance bands.
    - Drift detection engine: calculates actual vs target allocation, flags overweight/underweight positions.
    - Three-tier severity system: Critical (>15% drift), Warning (>10%), Info (>5%).
    - Alert types: drift, concentration, performance, and seasonal alerts.
    - Seasonal opportunity detection: month-aware alerts for sport-specific demand cycles.
    - Rebalance suggestions: specific buy/sell recommendations with dollar amounts to return to target.
    - Transaction cost estimation for rebalancing (8% estimated platform fees).
    - Portfolio Health Score (0-100) based on average drift from targets.
    - RebalanceAlertModal: per-alert deep-dive with current vs target allocation bars, drift direction, card suggestions, and cost estimate.
    - RebalanceWidget: dashboard widget with health score badge, allocation bars, and top 3 urgent alerts.
    - localStorage persistence for alert acknowledgment history.

### Phase 34: Auction Sniper Intelligence (COMPLETE)
- **Objective**: Real-time auction monitoring with bid timing optimization.
- **Key Features**:
    - Simulated live auction feed: 8-12 deterministic mock auctions related to user's collection.
    - Sniper analysis engine: optimal bid strategy per listing (snipe, early_bid, watch, skip).
    - Competition level assessment: low/medium/high/fierce based on watcher and bid counts.
    - Optimal bid timing: 3-30 seconds before end based on competition analysis.
    - Fair value comparison: listing price vs estimated market value with confidence scoring.
    - Expected savings calculation per snipe opportunity.
    - Auction alerts: ending soon (<1hr), below value (<70% FMV), price drops, new listings.
    - AuctionSniperModal: per-listing deep-dive with strategy badge, countdown timer, competition analysis, and bid recommendation.
    - AuctionSniperWidget: dashboard widget with active auctions, ending soon count, top 5 snipe opportunities.
    - Color-coded urgency: red (<1hr), amber (<6hr), green (>6hr).

### Phase 35: Consignment Tracker (COMPLETE)
- **Objective**: Track cards sent to consignment houses with fee reconciliation.
- **Key Features**:
    - 5 pre-defined consignment houses: PWCC (8%), Goldin (10%), MySlabs (6%), Heritage (15%), Probstein123 (8.9%).
    - Full consignment lifecycle: shipped → received → listed → sold/returned with status tracking.
    - Net proceeds calculation: sale price minus commission, fixed fees, shipping, and insurance.
    - House comparison engine: compare net proceeds across all houses for any card value.
    - Optimal house recommendation based on sport specialty, value bracket, and historical performance.
    - ConsignmentModal: per-card consignment management with house selector, comparison table, and active consignment timeline.
    - ConsignmentWidget: dashboard widget with total consigned, pending sales, net proceeds, and per-house performance.
    - "Consignment" button on active cards in the collection grid.
    - localStorage persistence for consignment entries.

### Phase 36: Price History Charts (COMPLETE)
- **Objective**: Interactive time-series charts for individual card price trends.
- **Key Features**:
    - Deterministic price history generation: realistic simulated data anchored to purchase price and current value.
    - 6 time range views: 1W, 1M, 3M, 6M, 1Y, ALL.
    - Interactive Recharts AreaChart with gradient fills and dark theming.
    - Technical indicators: 20-day Simple Moving Average (SMA), Bollinger Bands with upper/lower bands.
    - Statistical analysis: ATH, ATL, avg price, volatility (std dev), Sharpe ratio, max drawdown.
    - Support and resistance level detection from price data.
    - Linear regression trendline calculation.
    - Chart annotations: purchase date, sale date, grading events as visual markers.
    - PriceHistoryModal: per-card deep-dive with time range selector, chart overlays, and statistics grid.
    - PriceHistoryWidget: dashboard widget with portfolio value mini-chart, top 5 movers, and top 5 losers.
    - "Price History" button on every card in the collection grid.

### Phase 37: Collection Milestone Achievements (COMPLETE)
- **Objective**: Gamification with badges for collection milestones.
- **Key Features**:
    - 30+ achievements across 5 categories: Collection, Trading, Grading, Diversification, Value.
    - 5-tier badge system: Bronze (10pts), Silver (25pts), Gold (50pts), Platinum (100pts), Diamond (250pts).
    - Level system: Level 1-50 based on total achievement points with XP progress tracking.
    - Collection achievements: First Card, Starter Pack (10), Serious Collector (50), Centurion (100), Vault Master (500).
    - Trading achievements: First Sale, Profit Machine (10 profitable), Day Trader (sell within 7 days), Diamond Hands (hold 1yr+).
    - Grading achievements: Grade Getter, Perfect 10 (PSA 10), Multi-Grader (PSA+BGS+SGC), Gem Mint Collection.
    - Diversification achievements: Multi-Sport (3+), League Leader (all leagues), Full Roster (all 5 sports).
    - Value achievements: Thousand Dollar Club ($1K), Five Figure Club ($10K), Six Figure Club ($100K), Big Spender (>$500 card).
    - AchievementModal: full achievement gallery with category tabs, tier badges, progress bars, and recently unlocked section.
    - AchievementWidget: dashboard widget with level badge, completion stats, recent unlocks, and next-to-unlock.
    - localStorage persistence for seen/unseen achievement tracking.

### Phase 38: Market Anomaly Detection (COMPLETE)
- **Objective**: Flag unusual price movements and potential arbitrage opportunities.
- **Key Features**:
    - 6 anomaly types: spike, crash, mispricing, volume surge, stale price, arbitrage.
    - 4-tier severity: critical, high, medium, low based on deviation percentage and confidence.
    - Spike detection: currentValue > 1.5x purchasePrice within 90 days.
    - Crash detection: currentValue < 0.6x purchasePrice.
    - Mispricing detection: >30% deviation from sport-average price ratios.
    - Stale price flagging: valuations older than 30 days.
    - Arbitrage opportunity engine: simulated cross-marketplace spreads (eBay, COMC, MySlabs, PWCC, Private Sale) with 3-12% spreads.
    - Z-score statistical analysis for anomaly confidence scoring.
    - Anomaly trend tracking: increasing/decreasing/stable anomaly rates over time.
    - AnomalyDetailModal: per-anomaly deep-dive with price comparison bars, deviation metrics, arbitrage details, and action recommendations.
    - AnomalyWidget: dashboard widget with severity breakdown, top 5 anomalies, and arbitrage opportunities.
    - "Anomaly Check" button on every card in the collection grid.
    - localStorage persistence for anomaly acknowledgment history.

### Phase 39: Trade Block & Offer Management (COMPLETE)
- **Objective**: Enable users to organize cards for trade, receive and evaluate incoming offers, and track negotiation threads.
- **Key Features**:
    - Trade Block board: drag-and-drop card grid where users flag cards as "available for trade" with ask price, minimum acceptable value, and trade preferences.
    - Offer inbox: incoming offers list with offer amount, offerer reputation score, and counter-offer workflow.
    - Offer evaluation engine: compares offered value against current market value, scarcity index, and historical trend to produce an "accept/counter/decline" recommendation with confidence score.
    - Multi-card package deals: bundle multiple cards into a single trade proposal with combined valuation and fairness score.
    - Trade history log: full record of completed, declined, and expired trades with ROI per trade.
    - TradeBlockWidget: dashboard widget showing active listings count, pending offers, and recent trade activity.
    - TradeBlockModal: full-screen trade management with card search, drag-to-add, and real-time valuation.
    - Notification badges on Dashboard when new offers arrive.
    - localStorage persistence for trade block state and offer history.

### Phase 40: Market Watchlists & Price Alerts (COMPLETE)
- **Objective**: Let users track cards they don't own and receive alerts when prices hit target thresholds.
- **Key Features**:
    - Watchlist management: add any card (owned or unowned) to named watchlists with custom categories (e.g., "Buy Targets", "Rookies to Watch", "Grail List").
    - Price alert rules: per-card configurable triggers — alert when price drops below X, rises above Y, changes by Z% in N days, or hits all-time low.
    - Alert evaluation engine: runs against simulated market data on each session load, produces triggered alerts with severity and recommended action.
    - Market scanner: surface cards across the simulated marketplace matching user-defined criteria (sport, price range, grade, manufacturer, year range).
    - Watchlist analytics: track watchlist performance over time — which watched cards appreciated most, best entry points missed, and optimal buy timing.
    - WatchlistWidget: dashboard widget with watchlist counts, recently triggered alerts, and top movers on watched cards.
    - WatchlistModal: full watchlist editor with card search, alert rule configuration, and price history sparklines.
    - Bulk alert management: acknowledge, snooze, or dismiss alerts; export watchlist as CSV.
    - localStorage persistence for watchlists, alert rules, and triggered alert history.

### Phase 41: Collection Analytics Reports & Export (COMPLETE)
- **Objective**: Generate comprehensive PDF-style analytics reports for insurance, tax, or personal review purposes.
- **Key Features**:
    - Report generator: produce on-demand portfolio summary reports covering total valuation, cost basis, realized/unrealized P&L, allocation breakdown, and top performers.
    - Tax report module: capital gains/losses summary grouped by short-term vs long-term holdings, with per-card cost basis and proceeds.
    - Insurance valuation report: itemized card list with current market values, grading details, purchase receipts, and replacement cost estimates.
    - Performance report: time-weighted return, risk-adjusted metrics (Sharpe ratio, max drawdown), benchmark comparison against S&P 500 and hobby index.
    - Report customization: select date range, include/exclude sold cards, filter by sport or collection group, choose sections to include.
    - Export formats: render reports as printable HTML with @media print styles; CSV export for spreadsheet import; JSON export for API integration.
    - Report history: store generated reports with timestamps for year-over-year comparison.
    - ReportWidget: dashboard widget with quick-generate buttons for common reports and recent report history.
    - ReportModal: full report builder with section toggles, date pickers, and live preview.
    - localStorage persistence for report templates and generation history.

### Phase 42: Community Benchmarking & Leaderboards (COMPLETE)
- **Objective**: Allow users to compare portfolio performance against anonymized community benchmarks and compete on leaderboards.
- **Key Features**:
    - Portfolio benchmarking: compare user's total return, Sharpe ratio, diversification score, and collection size against simulated community percentiles (25th, 50th, 75th, 90th, 99th).
    - Leaderboard categories: Top ROI (%), Largest Portfolio Value, Most Diversified, Best Grading Score, Most Active Trader, Achievement Points Leader.
    - Simulated community data: deterministic seeded generation of 500 anonymous collector profiles with realistic portfolio distributions based on Pareto curves.
    - Percentile ranking: user sees their rank and percentile for each metric with trend arrows (up/down/stable vs last period).
    - Sport-specific leaderboards: separate rankings for Baseball, Basketball, Football, Hockey, Soccer specialists.
    - Monthly challenges: time-limited objectives (e.g., "Sell 3 cards at >20% profit this month") with bonus achievement points.
    - BenchmarkWidget: dashboard widget showing user's percentile badges, rank changes, and active challenges.
    - BenchmarkModal: full leaderboard browser with category tabs, percentile distribution charts, and historical rank progression.
    - Challenge tracker: progress bars for active monthly challenges with days remaining.
    - localStorage persistence for leaderboard snapshots and challenge progress.

### Phase 43: Smart Collection Advisor (COMPLETE)
- **Objective**: Provide AI-driven personalized recommendations for portfolio optimization, identifying buy/sell opportunities and collection gaps.
- **Key Features**:
    - Portfolio gap analysis: identify missing cards that would improve diversification score — suggest specific sports, decades, manufacturers, or grades to target.
    - Buy recommendations: surface simulated marketplace listings that match user's collection strategy, price range, and risk tolerance with a "fit score" (0-100).
    - Sell timing advisor: flag cards approaching peak value based on trend analysis, seasonal patterns, and holding period — recommend optimal exit windows.
    - Collection strategy profiles: predefined strategies (Conservative Growth, Aggressive Flipping, Long-Term Value, Completion Focused) with tailored advice per profile.
    - Risk assessment: evaluate portfolio concentration risk, liquidity risk, and market exposure with a composite risk score and mitigation suggestions.
    - Weekly digest: auto-generated summary of top 3 buy opportunities, top 3 sell candidates, and 1 collection gap to fill, based on current inventory.
    - AdvisorWidget: dashboard widget showing today's top recommendation, portfolio risk gauge, and strategy alignment score.
    - AdvisorModal: full advisor interface with strategy selector, recommendation feed with rationale, and "apply suggestion" quick actions.
    - Recommendation feedback: thumbs up/down on suggestions to refine future recommendations.
    - localStorage persistence for strategy selection, recommendation history, and feedback.

### Phase 44: Set Completion Registry & Checklist (COMPLETE)
- **Objective**: Let collectors track progress toward completing card sets and identify missing cards.
- **Key Features**:
    - Set database: pre-built checklists for popular sets (e.g., 2024 Topps Series 1, 2023 Panini Prizm) with total card count, base/parallel/insert breakdowns.
    - Set enrollment: link owned cards to sets with automatic matching by year, manufacturer, set name, and card number.
    - Completion dashboard: per-set progress bars, completion percentage, estimated cost to complete based on market data.
    - Missing card finder: identify gaps in enrolled sets with estimated acquisition cost per missing card, sorted by cheapest-first or rarest-first.
    - Parallel tracker: track base, refractor, auto, numbered parallels separately with independent completion percentages.
    - Set value analysis: total set value vs sum-of-parts, set premium/discount calculation, historical completed set sale prices.
    - Master set scoring: weighted completion score (base = 1x, insert = 2x, auto = 5x, 1/1 = 50x) for bragging rights.
    - SetRegistryWidget: dashboard widget with top 3 active sets, nearest-to-complete, and recently added cards.
    - SetRegistryModal: full set browser with enrollment, checklist view, missing card marketplace links, and completion timeline projection.
    - localStorage persistence for set enrollments and checklist state.

### Phase 45: Portfolio Time Machine & Historical Snapshots (COMPLETE)
- **Objective**: Enable users to view portfolio state at any historical date and compare performance across time periods.
- **Key Features**:
    - Automatic daily snapshots: capture portfolio NAV, card count, allocation, top holdings, and key metrics at end of each session (stored in localStorage with date keys).
    - Time machine slider: scrub to any past date and see the portfolio as it existed — cards owned, values, allocation, total NAV.
    - Period comparison: side-by-side diff of any two dates showing cards added/removed, value changes per card, allocation drift, and net P&L.
    - NAV timeline chart: interactive portfolio value chart with milestone markers (big purchases, sales, grading events).
    - "What if I held?" analysis: for sold cards, show what the portfolio would be worth today if those positions were still held.
    - Decision journal: optional notes attached to snapshots explaining buy/sell rationale, reviewable in hindsight with actual outcome.
    - Yearly review generator: auto-generated year-in-review comparing Jan 1 vs Dec 31 with best/worst decisions, total return, and benchmark comparison.
    - TimelineWidget: dashboard widget with NAV sparkline, YTD return, and "this day last year" comparison.
    - TimeMachineModal: full time machine with date picker, snapshot diff view, decision journal, and yearly review.
    - localStorage persistence for snapshots, journal entries, and comparison bookmarks.

### Phase 46: Automated Trading Rules Engine (COMPLETE)
- **Objective**: Let users define conditional rules that auto-trigger actions when market conditions are met.
- **Key Features**:
    - Rule builder: visual condition → action rule creator with AND/OR logic.
    - Condition types: price crosses threshold (above/below), percentage change in N days, Sharpe drops below X, anomaly detected, breakout score exceeds Y, agent consensus reaches "Strong Buy/Sell".
    - Action types: move to trade block, generate eBay listing draft, create watchlist alert, add to consignment queue, send notification, log to decision journal, trigger advisor re-evaluation.
    - Rule templates: pre-built strategies (Stop-Loss at -20%, Take-Profit at +50%, DCA Weekly, Rebalance Monthly, Harvest Tax Losses in December).
    - Backtesting engine: run rules against historical price data to show how many times they would have triggered and simulated P&L impact.
    - Rule priority and conflict resolution: when multiple rules fire simultaneously, execute by priority with conflict warnings.
    - Dry-run mode: rules evaluate but only log what they would do, no actual execution — for testing before going live.
    - Rate limiting: max triggers per rule per day to prevent cascading actions.
    - RulesEngineWidget: dashboard widget with active rules count, recent triggers, and rules pending review.
    - RulesEngineModal: full rule builder with condition/action dropdowns, template library, backtest results, and trigger history.
    - localStorage persistence for rules, trigger history, and backtest results.

### Phase 47: Advanced Technical Analysis Suite (COMPLETE)
- **Objective**: Full-featured charting toolkit for card price technical analysis, extending Phase 36.
- **Key Features**:
    - RSI (Relative Strength Index): 14-period RSI with overbought (>70) / oversold (<30) zones and divergence detection.
    - MACD (Moving Average Convergence Divergence): 12/26/9 MACD line, signal line, and histogram with crossover alerts.
    - Volume Profile: simulated volume distribution by price level, showing value area high/low and point of control.
    - Fibonacci Retracement: auto-drawn from recent swing high/low with 23.6%, 38.2%, 50%, 61.8%, 78.6% levels.
    - Candlestick patterns: detect doji, hammer, engulfing, morning star from daily price data with pattern labels on chart.
    - Multi-timeframe analysis: daily, weekly, monthly aggregation with synchronized crosshairs across timeframes.
    - Chart annotations: user-drawable trendlines, horizontal levels, and text notes saved per card.
    - Indicator overlay manager: toggle any combination of indicators on/off with customizable parameters.
    - Comparative overlay: plot two cards' price histories on the same chart for relative performance analysis.
    - TechnicalAnalysisModal: per-card deep-dive replacing/extending PriceHistoryModal with full indicator toolkit and drawing tools.
    - TAWidget: dashboard widget with cards at RSI extremes, recent MACD crossovers, and Fibonacci bounce candidates.
    - localStorage persistence for chart settings, annotations, and indicator preferences.

### Phase 48: Data Import Hub & External Sync (COMPLETE)
- **Objective**: Eliminate onboarding friction by enabling bulk card import from multiple sources and formats.
- **Key Features**:
    - CSV import: upload CSV/TSV files with flexible column mapping UI — auto-detect player, year, value, sport, grade columns with preview and correction before import.
    - eBay purchase history parser: paste eBay "Purchase History" export or HTML, extract card details, prices, and dates automatically.
    - PSA/BGS cert lookup: enter certification number, pull card details (player, year, set, grade) from simulated registry to auto-populate fields.
    - Collection manager import: import from popular apps (CardLadder, CollX, Ludex) via their CSV export formats with pre-mapped column profiles.
    - Duplicate detection: fuzzy matching on player + year + set + card number to flag potential duplicates before import with merge/skip/replace options.
    - Batch edit post-import: select imported cards and bulk-update sport, league, condition, or group assignment.
    - Import history: log of all imports with card counts, source, timestamp, and undo capability (remove all cards from a specific import).
    - Export hub: full collection export as CSV, JSON, or printable HTML with configurable column selection.
    - Scheduled backup: auto-export collection to JSON on configurable interval (weekly/monthly) with localStorage download history.
    - ImportWidget: dashboard widget showing last import date, total imported count, and quick-import button.
    - ImportModal: full import wizard with source selector, file upload, column mapper, preview table, duplicate checker, and confirmation.
    - localStorage persistence for column mapping profiles, import history, and backup schedule.

### Phase 49: Social Network & Collector Messaging
- **Objective**: Enable direct collector interaction with follow/message/trade-match functionality, closing the critical social gap vs CollX and Mantel.
- **Key Features**:
    - Collector profiles: simulated user profiles with display name, avatar, bio, public portfolio stats (total value, card count, top sport, collector tier), trade reputation score (0-5 stars).
    - Follow system: follow/unfollow collectors with follower/following counts, activity feed showing followed collectors' actions (listings, trades, achievements).
    - Direct messaging: 1-on-1 chat threads with text messages, card attachments (link any owned card into a message), and offer integration (inline trade proposals).
    - Trade matching engine: auto-surface collectors who have cards on your watchlist and want cards you've listed on your trade block, with match score and "Propose Trade" quick action.
    - Activity feed: global and following-only feeds showing recent listings, completed trades, achievement unlocks, and milestone events.
    - Collector search: find collectors by username, sport specialty, collection size, or trade reputation.
    - Block/mute/report: safety controls for blocking users, muting conversations, and flagging inappropriate behavior.
    - SocialWidget: dashboard widget with new follower count, unread messages badge, top trade matches, and recent activity feed snippet.
    - SocialModal: full social hub with tabs for Feed, Messages, Trade Matches, and Discover Collectors.
    - localStorage persistence for profiles, follows, messages, and activity feed.

### Phase 50: Sealed Wax Investment Tracker
- **Objective**: Track sealed hobby boxes, blasters, and retail products as investable assets with price history and hold-vs-rip analysis.
- **Key Features**:
    - Sealed product database: 20+ pre-built products across all 5 sports — hobby boxes, blasters, mega boxes, retail packs with MSRP, release date, and key rookie content.
    - Sealed portfolio: add purchased boxes with cost basis, track current market value, and calculate ROI per product and aggregate.
    - Price history charts: simulated price trajectories for sealed products using same TA indicators (SMA, RSI, MACD) as card charts.
    - Hold-vs-rip calculator: expected value of ripping (based on checklist key cards × pull rates × current values) vs holding sealed (based on price trend and historical sealed appreciation).
    - Release calendar: upcoming product releases with estimated release date, MSRP, and pre-order price tracking.
    - Sealed product alerts: price drops below cost basis, new releases matching preferred sports, and trending boxes.
    - Sealed ROI leaderboard: rank owned sealed products by ROI performance.
    - WaxInvestWidget: dashboard widget with sealed portfolio value, top performer, upcoming releases, and hold-vs-rip recommendation.
    - WaxInvestModal: full sealed product browser with portfolio tab, price charts, hold-vs-rip analysis, and release calendar.
    - localStorage persistence for sealed portfolio, alerts, and calendar preferences.

### Phase 51: Counterfeit & Authentication Intelligence
- **Objective**: AI-powered authentication scoring and counterfeit detection to protect collectors from fraud — an emerging competitive moat.
- **Key Features**:
    - Authentication score (0-100): per-card composite score based on cert verification, grade consistency, price anomaly analysis, and metadata cross-referencing.
    - Cert verification engine: validate certification numbers against simulated PSA/BGS/SGC registries — check holder type, label style, grade, and expected population.
    - Trimming/alteration detection: flag cards where grade + age + condition metadata don't align (e.g., PSA 10 on a 1952 card, grade upgrades without re-submission).
    - Counterfeit risk factors: identify high-risk categories (high-value rookies, vintage, autographs) with elevated scrutiny thresholds.
    - Counterfeit alert feed: surface known problematic cert ranges, common fake patterns, and marketplace red flags.
    - Authentication checklist: step-by-step verification guide per grading company with visual reference for label styles, font, hologram placement.
    - Seller risk scoring: evaluate seller patterns from simulated marketplace data — new accounts, bulk listings of high-value items, price-too-good-to-be-true flags.
    - AuthWidget: dashboard widget with collection auth score, flagged cards count, and recent alerts.
    - AuthModal: per-card deep-dive with auth score breakdown, cert verification result, risk factors, and verification checklist.
    - localStorage persistence for verification history and acknowledged alerts.

### Phase 52: Player Market Index & Performance Tracker
- **Objective**: Aggregate card-level data into player-level market indexes for portfolio-wide player exposure analysis — matching CardLadder and Market Movers.
- **Key Features**:
    - Player index: aggregate market value of all cards for a specific player across grades/sets, tracked over time with simulated historical data.
    - Player comparison charts: overlay two or more players' market performance on the same Recharts chart with normalized or absolute scaling.
    - Rookie class indexes: track entire draft classes (e.g., "2024 NFL Rookies") as market cohorts with aggregate value and top/bottom performers.
    - Career arc modeling: simulate player career trajectory (rookie → breakout → prime → decline) and correlate with card value curves.
    - Injury impact simulator: model price impact when a player is injured (immediate drop) vs returns (recovery bounce), with historical pattern analysis.
    - Team-level indexes: aggregate card market by team (e.g., "Dallas Cowboys Index") with roster turnover impact.
    - Sport market indexes: broad market health indicators per sport (e.g., "Baseball Market Index") tracking aggregate volume and value trends.
    - Hot/cold lists: daily movers — players whose aggregate card values changed most in the last 24hr/7d/30d.
    - PlayerIndexWidget: dashboard widget with top 5 hot players, portfolio player exposure breakdown, and sport index sparklines.
    - PlayerIndexModal: full player explorer with search, comparison charts, rookie class browser, career arc visualizer, and injury impact simulator.
    - localStorage persistence for followed players, comparison bookmarks, and index preferences.

### Phase 53: Digital Display Case & Showcase Builder
- **Objective**: Let collectors build visual showcases of their best cards for sharing and social proof — inspired by Mantel's core differentiator.
- **Key Features**:
    - Display case builder: drag-and-drop card placement into customizable grid layouts (2x2, 3x3, 4x4, freeform) with themed backgrounds.
    - Showcase themes: 6+ pre-built themes — "Trophy Room" (dark wood), "Vault" (steel), "Neon" (cyberpunk), "Classic" (felt green), "Ice" (frosted glass), "Fire" (gradient red).
    - Card spotlight: click any card in the case to expand with player name, grade, value, and custom caption.
    - Public showcase URL: generate shareable link with unique ID (extends Phase 30's collection sharing).
    - Showcase reactions: simulated visitor reactions (fire, thumbs up, heart, mind-blown) with reaction counts per card.
    - Featured card: pin one card as the showcase centerpiece with enlarged display and story text.
    - Showcase analytics: simulated view count, reaction count, most-viewed card, and share count.
    - Multiple showcases: create and manage multiple themed display cases (e.g., "Grail Wall", "Investment Picks", "Rookie Class").
    - Print-ready export: generate high-res HTML rendering of showcase for screenshots and social sharing.
    - ShowcaseWidget: dashboard widget with showcase count, total reactions, and featured showcase preview.
    - ShowcaseModal: full showcase builder with theme selector, card picker, drag-and-drop layout, caption editor, and sharing controls.
    - localStorage persistence for showcases, reactions, and analytics.
