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

### Phase 15: Mobile Native Experience (IN PROGRESS)
- **Objective**: Optimize for on-the-go scouting.
- **Key Features**:
    - PWA Manifest and Service Workers for offline access.
    - Native Push Notifications for price alerts.
    - Mobile-optimized camera flow for the Alpha Scanner.

### Phase 16: Agentic Negotiation (PLANNED)
- **Objective**: AI agents that can negotiate deals on behalf of the user.
- **Key Features**:
    - Gemin-driven sentiment analysis for firmness detection.
    - Trade proposal generation based on portfolio gaps.

### Phase 17: Institutional Liquidity Pool (PLANNED)
- **Objective**: Create an internal marketplace where users can sell assets instantly to the "MSI House" at a slight discount.
- **Key Features**:
    - AI-driven "Instant Buy" valuations.
    - Liquidity score for every asset in the portfolio.

### Phase 18: Predictive Alpha Engine (PLANNED)
- **Objective**: Move from tracking to forecasting.
- **Key Features**:
    - Gemini-powered "Price Trajectory" based on MiLB stats.
    - "Breakout Probability" score for prospect cards.

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
