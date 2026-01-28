# Product Requirements Document (PRD): Modern Sports Intelligence

## 1. Executive Summary
**Modern Sports Intelligence** is a premium analytics platform designed for sports card collectors, analysts, and fans. It combines real-time sports data with advanced financial tracking and AI-powered market insights to provide a comprehensive view of "sports as an asset class."

## 2. Project Vision & Objectives
### 2.1 Vision
To become the definitive source of truth for sports asset valuation, bridging the gap between on-field performance metrics and off-field market liquidity across all major professional ecosystems.

### 2.2 Strategic Objectives
- Provide real-time transparency into multi-league portfolio value.
- leverage Generative AI to automate cross-league market research.
- Create a "Stock Market for Sports" experience through a unified, premium UI/UX.

## 3. Target Audience
- **High-Net-Worth Collectors**: Managing diversified portfolios of sports assets.
- **Data-Driven Prospectors**: Focusing on Minor League (MiLB) trends and early-entry opportunities.
- **Hobby Analysts**: Fans interested in the intersection of performance stats and card scarcity.

## 4. Feature Specifications

### 4.1 League Intelligence Dashboard (NAV Central)
- **Net Asset Value (NAV)**: Dynamic calculation of portfolio worth grouped by professional league (MLB, NBA, NFL, MiLB).
- **League Intelligence HUD**: A specialized analytics interface for switching between major market hubs with league-specific ROI and sentiment tracking.
- **Growth Metrics**: ROI tracking, realized vs. unrealized gains, and monthly valuation trends.

### 4.2 Automated Ingestion & Categorization
- **Intelligent Mapping**: Automated classification of assets into professional leagues based on set, manufacturer, and athlete metadata.
- **Grading Support**: Integrated fields for PSA, BGS, SGC, etc., with automatic valuation adjustments based on grade.
- **Mass Processing**: Support for high-density inventory lists (100+ assets) with instant league-based filtering.

### 4.3 Market Intelligence (Market Pulse)
- **Sentiment Analysis**: Tracking "Hype" vs. "Utility" for top-tier cards.
- **Liquidity Monitoring**: Real-time signals on off-season vs. in-season trading volumes.
- **Scarcity Tracking**: PSA 10 population reports and historical supply trends.

### 4.4 AI Discovery Engine (Gemini 1.5 Integration)
- **Automated Valuation**: Analyzing eBay sold listings through natural language processing to determine "Fair Market Value."
- **Live Market Sync**: A batch-processing engine that updates all portfolio assets with live AI-powered valuations on-demand.
- **Prospect Discovery**: Simulating future trend scores for MiLB players using current performance data and search interest.
- **Contextual Insights**: Generating human-readable summaries of player performance and market impact.

### 4.5 Watchlist & Comparison
- **Target Price Alerts**: Notifications when a watched asset reaches a buy/sell threshold.
- **Comparative Analysis**: Side-by-side performance overlays for two or more players/assets.

## 5. Technical Architecture

### 5.1 Technology Stack
- **Frontend**: React 19, Vite, TypeScript.
- **Styling**: Vanilla CSS with a custom design system (Brand Charcoal, Brand Lime).
- **Intelligence**: Google GenAI (Gemini 1.5 Flash).
- **Data Visualization**: Recharts (Customized with brand gradients).
- **Icons**: Lucide React.
- **Routing**: React Router (HashRouter).

### 5.2 Deployment & Infrastructure
- **Hosting**: Vercel (Production environments).
- **CI/CD**: Automatic deployments on git-push.
- **Environment**: Secure `.env` management for API keys.

## 6. Design & UX Principles
- **Terminal Aesthetic**: High-contrast, dark-mode design using `font-bebas` and a "Deep Slate" palette for a premium financial terminal feel.
- **UI Component Standardization**: Unified button components, typography hierarchy, and entry animations across all 14 platform screens.
- **Spatial HUD Stability**: Zero-overlap layout philosophy ensuring high-density financial data integrity on any viewport.
- **Micro-Animations**: Subtle page transitions and hover-triggered radial glows to improve engagement.

## 7. User Stories
- *As a fund manager*, I want to see my realized profit from card sales so I can report on annual performance.
- *As a scout*, I want to see which AAA players are trending in search so I can identify potential call-ups.
- *As a user*, I want to compare a raw card vs. a PSA 10 counterpart to determine the "grading premium."

## 8. Roadmap & Future Scope
- **Phase 1 (COMPLETE)**: Multi-League Support (NBA, NFL, MLB, MiLB) and Automated Categorization Engine.
- **Phase 2**: Real-time integration with MLB PressBox and eBay APIs.
- **Phase 3**: User Authentication and multi-tenant portfolio support.
- **Phase 4**: OCR-based card recognition for instant cataloging.
- **Phase 5**: Marketplace integration for direct buying/selling.
