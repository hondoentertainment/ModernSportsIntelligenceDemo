# Product Requirements Document (PRD): Modern Sports Intelligence

## 1. Executive Summary
**Modern Sports Intelligence** is a premium analytics platform designed for sports card collectors, analysts, and fans. It combines real-time sports data with advanced financial tracking and AI-powered market insights to provide a comprehensive view of "sports as an asset class."

## 2. Project Vision & Objectives
### 2.1 Vision
To become the definitive source of truth for sports asset valuation, bridging the gap between on-field performance metrics and off-field market liquidity.

### 2.2 Strategic Objectives
- Provide real-time transparency into collection value.
- leverage Generative AI to automate complex market research.
- Create a "Stock Market for Sports" experience through premium UI/UX.

## 3. Target Audience
- **High-Net-Worth Collectors**: Managing diversified portfolios of sports assets.
- **Data-Driven Prospectors**: Focusing on Minor League (MiLB) trends and early-entry opportunities.
- **Hobby Analysts**: Fans interested in the intersection of performance stats and card scarcity.

## 4. Feature Specifications

### 4.1 Intelligence Dashboard (NAV Central)
- **Net Asset Value (NAV)**: Dynamic calculation of portfolio worth based on market signals.
- **Growth Metrics**: ROI tracking, realized vs. unrealized gains, and monthly valuation trends.
- **Portfolio Intelligence**: AI-powered status messages summarizing current market positions.

### 4.2 Collection Management
- **Detailed Asset Logging**: Support for Year, Manufacturer, Set, Card Number, Serial Number, and Autograph status.
- **Grading Support**: Integrated fields for PSA, BGS, SGC, etc., with automatic valuation adjustments based on grade.
- **Image Archiving**: Cloud-based storage for high-resolution card scans.

### 4.3 Market Intelligence (Market Pulse)
- **Sentiment Analysis**: Tracking "Hype" vs. "Utility" for top-tier cards.
- **Liquidity Monitoring**: Real-time signals on off-season vs. in-season trading volumes.
- **Scarcity Tracking**: PSA 10 population reports and historical supply trends.

### 4.4 AI Discovery Engine (Gemini 1.5 Integration)
- **Automated Valuation**: Analyzing eBay sold listings through natural language processing to determine "Fair Market Value."
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
- **Heirloom Aesthetic**: Minimalist, dark-mode design that feels like a premium financial tool.
- **Micro-Animations**: Subtle page transitions and hover effects to improve engagement.
- **Mobile-First Responsiveness**: Unified experience across all devices.

## 7. User Stories
- *As a fund manager*, I want to see my realized profit from card sales so I can report on annual performance.
- *As a scout*, I want to see which AAA players are trending in search so I can identify potential call-ups.
- *As a user*, I want to compare a raw card vs. a PSA 10 counterpart to determine the "grading premium."

## 8. Roadmap & Future Scope
- **Phase 2**: Real-time integration with MLB PressBox and eBay APIs.
- **Phase 3**: User Authentication and multi-tenant portfolio support.
- **Phase 4**: OCR-based card recognition for instant cataloging.
- **Phase 5**: Marketplace integration for direct buying/selling.
