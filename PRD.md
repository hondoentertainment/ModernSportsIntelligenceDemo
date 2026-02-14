# Product Requirements Document (PRD): Modern Sports Intelligence

## 1. Executive Summary
**Modern Sports Intelligence** is a premium analytics platform designed for sports card collectors, analysts, and fans. It combines real-time sports data with advanced financial tracking and AI-powered market insights to provide a comprehensive view of "sports as an asset class." The platform now features a professional-grade Investment Tracking engine with realized P/L analysis and an "Alpha Correlation" discovery system.

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

## 5. Technical Architecture
### 5.1 Technology Stack
- **Frontend**: React 19, Vite, TypeScript.
- **Styling**: Vanilla CSS with "Legacy of the Void" design system.
- **Intelligence**: Google GenAI (Gemini 1.5 Flash).
- **Data Visualization**: Recharts (Customized with brand gradients).
- **Icons**: Lucide React.

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

### Completed Phases (1-12)
- **Foundation**: Multi-League Support, Automated Classification.
- **Core Features**: Auth System, Data Migration, Automated Sync Scheduler.
- **Advanced Analytics**: Investment Tracking, Realized P/L, Sold Vault.
- **Discovery**: Alpha Scanner (Vision), Alpha Correlation (Stats vs Price).

### Phase 13: Scarcity Intelligence (Next Priority)
- **Objective**: Integrate population reports to refine scarcity metrics.
- **Key Features**:
    - PSA/BGS Population Report integration (or simulated data).
    - "Pop 1" and low-pop alerts.
    - Scarcity-weighted Alpha Score adjustments.

### Phase 14: Social & Community
- **Objective**: Enable social sharing and competitive analytics.
- **Key Features**:
    - Public Portfolio Links (Read-only view).
    - "Alpha Leaderboards" comparing user ROI.
    - Community "Buy/Sell" voting on trending prospects.

### Phase 15: Mobile Native Experience
- **Objective**: Optimize for on-the-go scouting.
- **Key Features**:
    - PWA Manifest and Service Workers for offline access.
    - Native Push Notifications for price alerts.
    - Mobile-optimized camera flow for the Alpha Scanner.

### Phase 16: Agentic Negotiation
- **Objective**: AI agents that can negotiate deals on behalf of the user.
- **Key Features**:
    - "Buy It Now" automation (simulated).
    - Trade proposal generation based on portfolio gaps.
