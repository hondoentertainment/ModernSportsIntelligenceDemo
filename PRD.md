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

### Phase 19: Multi-Agent Intelligence (RECOMMENDED)
- **Objective**: Deploy specialized agents for autonomous portfolio management.
- **Key Features**:
    - Synthetic Analyst Team (Scout, Market, Risk, Negotiator).
    - Multi-agent collaboration on investment thesis.

### Phase 20: Liquidity Intelligence (RECOMMENDED)
- **Objective**: Institutional-grade market depth analysis.
- **Key Features**:
    - MSI Liquidity Score for every asset.
    - Exit strategy planning based on volume.

### Phase 21: Cross-Asset Correlation (RECOMMENDED)
- **Objective**: Hedge strategies across sport ecosystems.

### Phase 22: Fiscal Intelligence (RECOMMENDED)
- **Objective**: Automated tax and cost-basis tracking.

### Phase 23: Visual Audit Simulation (RECOMMENDED)
- **Objective**: AI-powered grading predictions using high-fidelity vision.

### Phase 24: Macro-Sentinel Monitoring (RECOMMENDED)
- **Objective**: Early warning system for global market shifts affecting luxury assets.

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
