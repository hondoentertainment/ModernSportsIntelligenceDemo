
import { FEATURED_FEATURE_IDS, SEARCHABLE_FEATURE_IDS } from './productSurface';

/**
 * Feature Catalog — master registry of platform features
 * organized by tier and category. Used by FeatureSearch, FeatureDirectory,
 * and GuidedTour components.
 */

export type FeatureTier =
  | 'Core'
  | 'Differentiated'
  | 'Industry-First'
  | 'Competitive Moat'
  | 'Bloomberg-Grade'
  | 'Advanced Intelligence';

export type FeatureStatus = 'live' | 'beta' | 'coming-soon';

export interface Feature {
  id: string;
  name: string;
  description: string;
  tier: FeatureTier;
  category: string;
  status: FeatureStatus;
  /** Route path if navigable, or null for modal-only features */
  path: string | null;
  /** Related modal component name (for reference) */
  modalId?: string;
  /** Lucide icon name */
  icon: string;
  /** Phase number from roadmap */
  phase: number;
  /** Keywords for search matching */
  keywords: string[];
}

export const FEATURE_CATALOG: Feature[] = [
  // ─── Core (Phases 1-14) ─────────────────────────────────
  { id: 'dashboard', name: 'League Intelligence Dashboard', description: 'Dynamic NAV calculation, financial intelligence, and league HUD with P/L tracking.', tier: 'Core', category: 'Portfolio', status: 'live', path: '/', icon: 'LayoutDashboard', phase: 1, keywords: ['nav', 'portfolio', 'home', 'overview'] },
  { id: 'collection', name: 'Collection & Inventory', description: 'Automated ingestion, inventory management, sold vault, and grading support.', tier: 'Core', category: 'Portfolio', status: 'live', path: '/collection', icon: 'Layers', phase: 2, keywords: ['cards', 'inventory', 'vault'] },
  { id: 'market-pulse', name: 'Market Pulse Intelligence', description: 'Sentiment analysis, alpha correlation, and lagging alpha alerts.', tier: 'Core', category: 'Analytics', status: 'live', path: '/', icon: 'Activity', phase: 3, keywords: ['sentiment', 'alpha', 'market'] },
  { id: 'ai-discovery', name: 'AI Discovery Engine', description: 'Automated valuation, live market sync, and prospect discovery via Gemini.', tier: 'Core', category: 'AI', status: 'live', path: '/', icon: 'Sparkles', phase: 4, keywords: ['gemini', 'ai', 'valuation', 'sync'] },
  { id: 'watchlist', name: 'Watchlist & Comparison', description: 'Target price alerts and side-by-side comparative analysis.', tier: 'Core', category: 'Trading', status: 'live', path: '/favorites', icon: 'Star', phase: 5, keywords: ['targets', 'watch', 'compare'] },
  { id: 'negotiation-arena', name: 'AI Negotiation Arena', description: 'Real-time chat negotiation with AI sellers using Gemini, with sentiment tracking.', tier: 'Core', category: 'Trading', status: 'live', path: '/', icon: 'Gavel', phase: 6, keywords: ['negotiate', 'buy', 'deal', 'chat'] },
  { id: 'deep-search', name: 'Deep Search Intelligence', description: 'Semantic AI search by vibe, era, trajectory, or card similarity.', tier: 'Core', category: 'AI', status: 'live', path: '/deep-search', icon: 'Search', phase: 7, keywords: ['search', 'semantic', 'find', 'similar'] },
  { id: 'image-lightbox', name: 'Image Lightbox', description: 'Full-screen professional image viewing with keyboard navigation.', tier: 'Core', category: 'UX', status: 'live', path: null, icon: 'Image', phase: 8, keywords: ['image', 'zoom', 'lightbox', 'photo'] },
  { id: 'auth-system', name: 'Authentication System', description: 'Supabase auth with login, signup, password reset, and demo mode.', tier: 'Core', category: 'System', status: 'live', path: '/login', icon: 'Shield', phase: 9, keywords: ['login', 'auth', 'account'] },
  { id: 'billing', name: 'Stripe Billing', description: 'Multi-tier subscription system with usage-based pricing.', tier: 'Core', category: 'System', status: 'live', path: '/billing', icon: 'CreditCard', phase: 10, keywords: ['billing', 'subscription', 'stripe', 'payment'] },
  { id: 'mlb-stats', name: 'PressBox Hub', description: 'MLB API integration for live stats, player lookup, and performance data.', tier: 'Core', category: 'Data', status: 'live', path: '/mlb-stats', icon: 'Trophy', phase: 11, keywords: ['mlb', 'stats', 'baseball', 'pressbox'] },
  { id: 'players', name: 'Player Directory', description: 'Browse and search players across leagues with breakout scores.', tier: 'Core', category: 'Data', status: 'live', path: '/players', icon: 'Users', phase: 12, keywords: ['players', 'athletes', 'roster'] },
  { id: 'scarcity-intel', name: 'Scarcity Intelligence', description: 'Population reporting, pop badges, and Pop 1 alerts.', tier: 'Core', category: 'Analytics', status: 'live', path: null, icon: 'Gem', phase: 13, keywords: ['scarcity', 'pop', 'population', 'rare'] },
  { id: 'social-alpha', name: 'Social Alpha Elite', description: 'Live hype feed and institutional collector tiers.', tier: 'Core', category: 'Social', status: 'live', path: '/', icon: 'Flame', phase: 14, keywords: ['social', 'hype', 'feed', 'tiers'] },

  // ─── Competitive Moat (Phases 15-38) ────────────────────
  { id: 'mobile-native', name: 'Mobile Native PWA', description: 'Service worker caching, background sync, haptic feedback, and swipeable cards.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: null, icon: 'Smartphone', phase: 15, keywords: ['mobile', 'pwa', 'offline', 'swipe'] },
  { id: 'agentic-negotiation', name: 'Agentic Negotiation', description: 'Prototype negotiation automation with analytics and configurable strategy scaffolding.', tier: 'Competitive Moat', category: 'Trading', status: 'beta', path: null, icon: 'Bot', phase: 16, keywords: ['agent', 'playbook', 'auto-negotiate'] },
  { id: 'liquidity-pool', name: 'Institutional Liquidity Pool', description: 'MSI House instant-liquidity concept and payout logic, currently staged as a beta workflow.', tier: 'Competitive Moat', category: 'Trading', status: 'beta', path: null, icon: 'Droplets', phase: 17, keywords: ['instant', 'sell', 'liquidity', 'house'] },
  { id: 'predictive-alpha', name: 'Predictive Alpha Engine', description: 'Catalyst and trajectory prototype that still needs live data validation before full release.', tier: 'Competitive Moat', category: 'Analytics', status: 'beta', path: null, icon: 'TrendingUp', phase: 18, keywords: ['predict', 'forecast', 'breakout', 'alpha'] },
  { id: 'multi-agent', name: 'Multi-Agent Intelligence', description: 'Multi-agent analysis workspace with consensus scaffolding and explainability patterns.', tier: 'Competitive Moat', category: 'AI', status: 'beta', path: null, icon: 'Brain', phase: 19, keywords: ['agent', 'atlas', 'apex', 'sentinel', 'viper'] },
  { id: 'liquidity-intel', name: 'Liquidity Intelligence', description: 'Order book simulation, market impact, volume velocity, and liquidity heatmap.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'BarChart3', phase: 20, keywords: ['liquidity', 'order book', 'depth', 'velocity'] },
  { id: 'cross-correlation', name: 'Cross-Asset Correlation', description: 'Cross-asset and diversification modeling with simulated market inputs pending live data wiring.', tier: 'Competitive Moat', category: 'Analytics', status: 'beta', path: null, icon: 'GitBranch', phase: 21, keywords: ['correlation', 'hedge', 'diversification'] },
  { id: 'fiscal-intel', name: 'Fiscal Intelligence', description: 'Tax-lot analysis, Schedule D-style exports, and holding-period tracking from recorded transactions.', tier: 'Competitive Moat', category: 'Finance', status: 'live', path: null, icon: 'Calculator', phase: 22, keywords: ['tax', 'cost basis', 'schedule d', 'fiscal'] },
  { id: 'visual-audit', name: 'Visual Audit Simulation', description: 'Vision-grading prototype with ROI overlays and simulated pre-grade scoring.', tier: 'Competitive Moat', category: 'AI', status: 'beta', path: null, icon: 'ScanEye', phase: 23, keywords: ['grade', 'predict', 'audit', 'sub-grade'] },
  { id: 'macro-sentinel', name: 'Macro-Sentinel Monitoring', description: 'Early warning system for global market shifts affecting luxury assets.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'Radar', phase: 24, keywords: ['macro', 'sentinel', 'economy', 'warning'] },
  { id: 'break-even', name: 'Break-Even Calculator', description: 'Minimum sale price needed after all marketplace fees.', tier: 'Competitive Moat', category: 'Finance', status: 'live', path: null, icon: 'Scale', phase: 25, keywords: ['break even', 'fees', 'profit', 'calculator'] },
  { id: 'insurance-report', name: 'Insurance Valuation Report', description: 'Insurance-ready valuation exports with itemized inventory and heuristic replacement-cost estimates.', tier: 'Competitive Moat', category: 'Finance', status: 'live', path: null, icon: 'FileCheck', phase: 26, keywords: ['insurance', 'valuation', 'report'] },
  { id: 'collector-audit-dossier', name: 'Collector Audit Dossier', description: 'Unified collector operating record combining tax posture, insurance readiness, and exit routing in one exportable workflow.', tier: 'Competitive Moat', category: 'Finance', status: 'live', path: '/audit-dossier', icon: 'BriefcaseBusiness', phase: 27, keywords: ['audit', 'dossier', 'tax', 'insurance', 'exit'] },
  { id: 'what-if', name: 'What-If Simulator', description: 'Trade-scenario planning workspace for NAV and diversification changes.', tier: 'Competitive Moat', category: 'Analytics', status: 'coming-soon', path: null, icon: 'FlaskConical', phase: 27, keywords: ['simulate', 'what if', 'trade', 'test'] },
  { id: 'grading-planner', name: 'Grading Batch Planner', description: 'Batch grading planner for expected ROI and submission tiers.', tier: 'Competitive Moat', category: 'Tools', status: 'coming-soon', path: null, icon: 'ClipboardList', phase: 28, keywords: ['grading', 'batch', 'submission', 'roi'] },
  { id: 'ebay-listing', name: 'eBay Listing Generator', description: 'SEO-oriented listing draft generation for sale preparation workflows.', tier: 'Competitive Moat', category: 'Trading', status: 'coming-soon', path: null, icon: 'ShoppingBag', phase: 29, keywords: ['ebay', 'listing', 'sell', 'seo'] },
  { id: 'collection-share', name: 'Collection Sharing', description: 'Shareable collection snapshots with embeddable HTML widgets.', tier: 'Competitive Moat', category: 'Social', status: 'live', path: null, icon: 'Share2', phase: 30, keywords: ['share', 'embed', 'widget', 'public'] },
  { id: 'wax-break-roi', name: 'Wax Break ROI Tracker', description: 'Break ROI logging workflow for sealed wax participants.', tier: 'Competitive Moat', category: 'Tools', status: 'coming-soon', path: null, icon: 'Package', phase: 31, keywords: ['wax', 'break', 'box', 'roi'] },
  { id: 'usability', name: 'Usability & Accessibility', description: 'Keyboard shortcuts, command palette, undo toasts, skeleton loaders, and ARIA.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: null, icon: 'Accessibility', phase: 32, keywords: ['keyboard', 'accessibility', 'ux', 'shortcuts'] },
  { id: 'rebalance-alerts', name: 'Rebalancing Alerts', description: 'Automated alerts when portfolio drift exceeds configurable thresholds.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'RefreshCw', phase: 33, keywords: ['rebalance', 'drift', 'allocation'] },
  { id: 'auction-sniper', name: 'Auction Sniper', description: 'Auction monitoring and bid-timing concept pending marketplace integration.', tier: 'Competitive Moat', category: 'Trading', status: 'coming-soon', path: null, icon: 'Crosshair', phase: 34, keywords: ['auction', 'snipe', 'bid', 'timer'] },
  { id: 'consignment', name: 'Consignment Tracker', description: 'Consignment tracking with fee reconciliation and route comparison, currently local-first.', tier: 'Competitive Moat', category: 'Trading', status: 'beta', path: null, icon: 'Truck', phase: 35, keywords: ['consignment', 'pwcc', 'goldin', 'heritage'] },
  { id: 'price-history', name: 'Price History Charts', description: 'Interactive time-series charts with SMA, Bollinger Bands, and statistics.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'LineChart', phase: 36, keywords: ['price', 'chart', 'history', 'technical'] },
  { id: 'achievements', name: 'Collection Achievements', description: 'Gamification with 30+ badges across 5 tiers and level progression.', tier: 'Competitive Moat', category: 'Social', status: 'live', path: null, icon: 'Award', phase: 37, keywords: ['achievement', 'badge', 'level', 'gamification'] },
  { id: 'anomaly-detection', name: 'Market Anomaly Detection', description: 'Anomaly and arbitrage detection prototype awaiting live signal inputs.', tier: 'Competitive Moat', category: 'Analytics', status: 'beta', path: null, icon: 'AlertTriangle', phase: 38, keywords: ['anomaly', 'spike', 'crash', 'arbitrage'] },

  // ─── Advanced Intelligence (Phases 39-63) ───────────────
  { id: 'trade-block', name: 'Trade Block & Offers', description: 'Organize cards for trade, evaluate offers, and manage multi-card package deals.', tier: 'Advanced Intelligence', category: 'Trading', status: 'live', path: null, icon: 'ArrowLeftRight', phase: 39, keywords: ['trade', 'offer', 'block', 'swap'] },
  { id: 'market-watchlist', name: 'Market Watchlists & Alerts', description: 'Track unowned cards with configurable price alert rules.', tier: 'Advanced Intelligence', category: 'Trading', status: 'live', path: null, icon: 'Eye', phase: 40, keywords: ['watchlist', 'alert', 'price target'] },
  { id: 'analytics-reports', name: 'Analytics Reports & Export', description: 'Generate PDF-style portfolio, tax, insurance, and performance reports.', tier: 'Advanced Intelligence', category: 'Finance', status: 'live', path: null, icon: 'FileSpreadsheet', phase: 41, keywords: ['report', 'export', 'pdf', 'csv'] },
  { id: 'benchmarking', name: 'Community Benchmarking', description: 'Compare performance against community and compete on leaderboards.', tier: 'Advanced Intelligence', category: 'Social', status: 'live', path: '/leaderboard', icon: 'Trophy', phase: 42, keywords: ['benchmark', 'leaderboard', 'rank', 'community'] },
  { id: 'smart-advisor', name: 'Smart Collection Advisor', description: 'AI-driven buy/sell recommendations with gap analysis and strategy profiles.', tier: 'Advanced Intelligence', category: 'AI', status: 'live', path: null, icon: 'Lightbulb', phase: 43, keywords: ['advisor', 'recommend', 'strategy', 'gap'] },
  { id: 'set-registry', name: 'Set Completion Registry', description: 'Track progress toward completing card sets with missing card finder.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'CheckSquare', phase: 44, keywords: ['set', 'complete', 'checklist', 'registry'] },
  { id: 'time-machine', name: 'Portfolio Time Machine', description: 'View portfolio at any historical date with period comparison and decision journal.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'Clock', phase: 45, keywords: ['time machine', 'history', 'snapshot', 'compare'] },
  { id: 'rules-engine', name: 'Automated Trading Rules', description: 'Conditional rules with backtesting that auto-trigger portfolio actions.', tier: 'Advanced Intelligence', category: 'Trading', status: 'live', path: null, icon: 'Workflow', phase: 46, keywords: ['rules', 'automate', 'backtest', 'trigger'] },
  { id: 'technical-analysis', name: 'Technical Analysis Suite', description: 'RSI, MACD, Fibonacci, volume profile, and candlestick pattern detection.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'CandlestickChart', phase: 47, keywords: ['rsi', 'macd', 'fibonacci', 'technical'] },
  { id: 'data-import', name: 'Data Import Hub', description: 'Bulk import from CSV, eBay, PSA/BGS cert lookup, and external sync.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'Upload', phase: 48, keywords: ['import', 'csv', 'ebay', 'sync', 'bulk'] },
  { id: 'social-network', name: 'Social Network & Messaging', description: 'Follow collectors, direct messages, trade matching, and activity feeds.', tier: 'Advanced Intelligence', category: 'Social', status: 'live', path: null, icon: 'MessageSquare', phase: 49, keywords: ['social', 'message', 'follow', 'chat'] },
  { id: 'wax-invest', name: 'Sealed Wax Tracker', description: 'Track sealed box investments with hold-vs-rip analysis.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'Box', phase: 50, keywords: ['sealed', 'wax', 'box', 'hold', 'rip'] },
  { id: 'counterfeit-intel', name: 'Counterfeit Detection', description: 'AI authentication scoring, cert verification, and seller risk analysis.', tier: 'Advanced Intelligence', category: 'AI', status: 'live', path: null, icon: 'ShieldAlert', phase: 51, keywords: ['counterfeit', 'auth', 'fake', 'verify'] },
  { id: 'player-index', name: 'Player Market Index', description: 'Player-level market indexes, career arc modeling, and hot/cold lists.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'BarChart', phase: 52, keywords: ['player index', 'career', 'hot', 'cold'] },
  { id: 'showcase', name: 'Digital Display Case', description: 'Build visual showcases with themed backgrounds and shareable URLs.', tier: 'Advanced Intelligence', category: 'Social', status: 'live', path: null, icon: 'Monitor', phase: 53, keywords: ['showcase', 'display', 'gallery', 'share'] },
  { id: 'grade-premium', name: 'Grade Premium Analytics', description: 'Grade-over-grade price multipliers and crossover ROI calculator.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'Gem', phase: 54, keywords: ['grade', 'premium', 'crossover', 'psa', 'bgs'] },
  { id: 'deal-finder', name: 'Deal Finder & Arbitrage', description: 'Surface underpriced cards across platforms with deal scoring.', tier: 'Advanced Intelligence', category: 'Trading', status: 'live', path: null, icon: 'Percent', phase: 55, keywords: ['deal', 'arbitrage', 'underpriced', 'savings'] },
  { id: 'insurance-manager', name: 'Insurance Policy Manager', description: 'Track policies, premiums, coverage gaps, and renewal reminders.', tier: 'Advanced Intelligence', category: 'Finance', status: 'live', path: null, icon: 'Shield', phase: 56, keywords: ['insurance', 'policy', 'coverage', 'premium'] },
  { id: 'pop-growth', name: 'Pop Report Growth Tracker', description: 'Population report changes over time with supply/demand indicators.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'TrendingUp', phase: 57, keywords: ['pop', 'growth', 'supply', 'demand'] },
  { id: 'event-planner', name: 'Card Show & Event Planner', description: 'Prepare for card shows with inventory planning and deal tracking.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'Calendar', phase: 58, keywords: ['show', 'event', 'national', 'travel'] },
  { id: 'seasonal-engine', name: 'Seasonal Strategy Engine', description: 'Buy/sell timing automation based on sport-specific seasonal patterns.', tier: 'Advanced Intelligence', category: 'Analytics', status: 'live', path: null, icon: 'Sun', phase: 59, keywords: ['seasonal', 'timing', 'buy window', 'sell window'] },
  { id: 'multi-currency', name: 'Multi-Currency & International', description: 'Currency conversion, cross-border price comparison, and duty calculator.', tier: 'Advanced Intelligence', category: 'Finance', status: 'live', path: null, icon: 'Globe', phase: 60, keywords: ['currency', 'international', 'exchange', 'duty'] },
  { id: 'prospect-pipeline', name: 'Prospect Pipeline & Draft', description: 'Deep prospect tracking from minor leagues through draft to rookie year.', tier: 'Advanced Intelligence', category: 'Data', status: 'live', path: '/prospects', icon: 'GitPullRequest', phase: 61, keywords: ['prospect', 'draft', 'pipeline', 'stash'] },
  { id: 'goal-planner', name: 'Collection Goal Planner', description: 'Financial and collection targets with progress tracking and AI planning.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'Target', phase: 62, keywords: ['goal', 'target', 'plan', 'milestone'] },
  { id: 'notification-center', name: 'Notification Command Center', description: 'Unified notification hub with smart grouping, priority scoring, and digests.', tier: 'Advanced Intelligence', category: 'System', status: 'live', path: '/alerts', icon: 'Bell', phase: 63, keywords: ['notification', 'alert', 'inbox', 'digest'] },

  // ─── Differentiated (Phases 64-68) ──────────────────────
  { id: 'stress-test', name: 'Monte Carlo Stress Testing', description: 'Financial-grade 1000+ simulation paths with VaR, drawdown, and scenario analysis.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: null, icon: 'Activity', phase: 64, keywords: ['monte carlo', 'stress', 'var', 'risk', 'simulation'] },
  { id: 'grade-predict', name: 'AI Predictive Grading', description: 'Pre-submission grade prediction with bulk optimizer and ROI calculator.', tier: 'Differentiated', category: 'AI', status: 'live', path: null, icon: 'Cpu', phase: 65, keywords: ['predict', 'grade', 'submission', 'roi'] },
  { id: 'tax-harvest', name: 'Tax-Loss Harvesting', description: 'Strategic loss selling with wash-sale awareness and tax bracket optimization.', tier: 'Differentiated', category: 'Finance', status: 'live', path: null, icon: 'Scissors', phase: 66, keywords: ['tax', 'harvest', 'loss', 'wash sale'] },
  { id: 'cross-asset-corr', name: 'Cross-Asset Correlation', description: 'Correlate cards with S&P 500, crypto, bonds, and sports metrics.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: null, icon: 'GitMerge', phase: 67, keywords: ['correlation', 'sp500', 'crypto', 'beta'] },
  { id: 'exit-velocity', name: 'Liquidity & Exit Velocity', description: 'Liquidity scoring, market depth, exit velocity, and emergency liquidation planning.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: null, icon: 'Zap', phase: 68, keywords: ['liquidity', 'exit', 'velocity', 'sell speed'] },
  { id: 'liquidity-twin', name: 'Liquidity Twin', description: 'Venue-aware exit planning with synthetic spreads, time-to-exit, and order-book twins.', tier: 'Competitive Moat', category: 'Trading', status: 'live', path: '/liquidity-twin', icon: 'Zap', phase: 143, keywords: ['liquidity twin', 'exit', 'slippage', 'venue'] },
  { id: 'private-deal-room-agent', name: 'Private Deal Room Agent', description: 'Escalate sensitive listings into encrypted private negotiation rooms with agent support.', tier: 'Competitive Moat', category: 'Trading', status: 'live', path: '/private-deal-room-agent', icon: 'Lock', phase: 144, keywords: ['deal room', 'private', 'negotiation', 'agent'] },
  { id: 'counterparty-trust-graph', name: 'Counterparty Trust Graph', description: 'Persistent seller and broker trust scoring built from deals, referrals, and disputes.', tier: 'Competitive Moat', category: 'Security', status: 'live', path: '/counterparty-trust-graph', icon: 'Share2', phase: 145, keywords: ['trust graph', 'counterparty', 'reputation', 'risk'] },
  { id: 'catalyst-market', name: 'Catalyst Market', description: 'Trade and monitor event-driven opportunities tied to promotions, scarcity, and sentiment shocks.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: '/catalyst-market', icon: 'Flame', phase: 146, keywords: ['catalyst', 'event', 'market', 'opportunity'] },
  { id: 'portfolio-scenario-theater', name: 'Portfolio Scenario Theater', description: 'Persisted Monte Carlo scenario snapshots with projected NAV and hedging guidance.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: '/portfolio-scenario-theater', icon: 'Activity', phase: 147, keywords: ['scenario theater', 'stress test', 'simulation', 'nav'] },

  // ─── Industry-First (Phases 69-73) ──────────────────────
  { id: 'live-impact', name: 'Live Game Impact Engine', description: 'Play-by-play market-impact prototype with simulated game event scoring.', tier: 'Industry-First', category: 'Analytics', status: 'beta', path: '/live-impact', icon: 'Radio', phase: 69, keywords: ['live', 'game', 'impact', 'real-time'] },
  { id: 'vision-grading', name: 'AI Vision Grading Lab', description: 'Computer-vision grading lab concept with mock defect mapping and probability outputs.', tier: 'Industry-First', category: 'AI', status: 'beta', path: null, icon: 'ScanEye', phase: 70, keywords: ['vision', 'grading', 'scan', 'camera', 'defect'] },
  { id: 'fractional-vault', name: 'Fractional Vault & Copy-Trading', description: 'Fractional ownership and copy-trading showcase pending live execution rails.', tier: 'Industry-First', category: 'Trading', status: 'beta', path: '/fractional-vault', icon: 'Landmark', phase: 71, keywords: ['fractional', 'vault', 'shares', 'copy trading'] },
  { id: 'provenance-chain', name: 'Provenance Chain & Digital Twin', description: 'Provenance registry prototype for verification workflows and future digital-twin support.', tier: 'Industry-First', category: 'Security', status: 'beta', path: '/provenance', icon: 'Link2', phase: 72, keywords: ['provenance', 'blockchain', 'nft', 'twin', 'verify'] },
  { id: 'live-breaks', name: 'Live Break Room & Auction AI', description: 'Live-break and auction workflow concept staged for future marketplace integrations.', tier: 'Industry-First', category: 'Trading', status: 'coming-soon', path: '/live-breaks', icon: 'Tv', phase: 73, keywords: ['break', 'live', 'auction', 'snipe', 'ev'] },

  // ─── Bloomberg-Grade (cross-cutting capabilities) ───────
  { id: 'portfolio-audit', name: 'Portfolio Audit Engine', description: 'Comprehensive portfolio analysis with ROI, diversification, and risk metrics.', tier: 'Bloomberg-Grade', category: 'Analytics', status: 'live', path: '/audit', icon: 'FileSearch', phase: 12, keywords: ['audit', 'portfolio', 'analysis', 'risk'] },
  { id: 'teams', name: 'Team Analytics', description: 'Team-level performance tracking with offense, defense, and form indicators.', tier: 'Bloomberg-Grade', category: 'Data', status: 'live', path: '/teams', icon: 'Target', phase: 12, keywords: ['team', 'analytics', 'offense', 'defense'] },
  { id: 'games', name: 'Game Intelligence', description: 'Live game tracking with impact scoring, key matchups, and swing factors.', tier: 'Bloomberg-Grade', category: 'Data', status: 'live', path: '/games', icon: 'Activity', phase: 12, keywords: ['game', 'live', 'matchup', 'score'] },
  { id: 'trends', name: 'Market Trends', description: 'Multi-dimensional trend analysis across sports, eras, and card categories.', tier: 'Bloomberg-Grade', category: 'Analytics', status: 'live', path: '/trends', icon: 'TrendingUp', phase: 12, keywords: ['trend', 'market', 'movement'] },
  { id: 'compare', name: 'Comparative Analysis', description: 'Side-by-side card and player comparison with performance overlays.', tier: 'Bloomberg-Grade', category: 'Analytics', status: 'live', path: '/compare', icon: 'GitCompare', phase: 12, keywords: ['compare', 'side by side', 'overlay'] },
  { id: 'war-room', name: 'Analyst War Room', description: 'Professional-grade analysis workspace with multi-panel layouts.', tier: 'Bloomberg-Grade', category: 'Analytics', status: 'live', path: '/war-room', icon: 'MonitorDot', phase: 19, keywords: ['war room', 'analyst', 'terminal', 'workspace'] },
  { id: 'portfolio-builder', name: 'Portfolio Builder', description: 'Visual portfolio construction with drag-and-drop grouping and allocation.', tier: 'Bloomberg-Grade', category: 'Portfolio', status: 'live', path: '/builder', icon: 'Kanban', phase: 12, keywords: ['builder', 'construct', 'allocate', 'group'] },
  { id: 'market-ticker', name: 'Market Ticker', description: 'Real-time scrolling market data ticker in the header.', tier: 'Bloomberg-Grade', category: 'UX', status: 'live', path: null, icon: 'Activity', phase: 12, keywords: ['ticker', 'scroll', 'real-time', 'header'] },
  { id: 'prospect-trends', name: 'Prospect Trends', description: 'MiLB prospect trend scoring with breakout probability and 7-day history.', tier: 'Bloomberg-Grade', category: 'Data', status: 'live', path: '/prospects', icon: 'TrendingUp', phase: 12, keywords: ['prospect', 'milb', 'trend', 'breakout'] },
  { id: 'public-portfolio', name: 'Public Portfolio', description: 'Shareable public portfolio pages with customizable display.', tier: 'Bloomberg-Grade', category: 'Social', status: 'live', path: null, icon: 'Globe', phase: 30, keywords: ['public', 'portfolio', 'share', 'profile'] },
  { id: 'leaderboard', name: 'Collector Leaderboard', description: 'Competitive rankings by ROI, portfolio value, and alpha score.', tier: 'Bloomberg-Grade', category: 'Social', status: 'live', path: '/leaderboard', icon: 'Medal', phase: 42, keywords: ['leaderboard', 'rank', 'top', 'score'] },
  { id: 'morning-briefing', name: 'Morning Briefing', description: 'AI-generated daily portfolio briefing with key alerts and recommendations.', tier: 'Bloomberg-Grade', category: 'AI', status: 'live', path: null, icon: 'Newspaper', phase: 63, keywords: ['morning', 'briefing', 'daily', 'summary'] },
  { id: 'ocr-ingestion', name: 'OCR Card Scanner', description: 'Camera-based card scanning with OCR for automatic card identification.', tier: 'Bloomberg-Grade', category: 'AI', status: 'live', path: null, icon: 'Camera', phase: 48, keywords: ['ocr', 'scan', 'camera', 'identify'] },

  // ─── Additional distinct sub-features ───────────────────
  { id: 'sold-vault', name: 'Sold Vault', description: 'Track historical performance of exited positions with realized P/L.', tier: 'Core', category: 'Portfolio', status: 'live', path: '/collection', icon: 'Archive', phase: 2, keywords: ['sold', 'vault', 'history', 'exit'] },
  { id: 'alpha-scanner', name: 'Alpha Scanner', description: 'Vision-based alpha detection overlaying performance stats with price action.', tier: 'Core', category: 'Analytics', status: 'live', path: '/', icon: 'Eye', phase: 12, keywords: ['alpha', 'scanner', 'vision', 'divergence'] },
  { id: 'data-migration', name: 'Data Migration Engine', description: 'Seamless migration from localStorage to Supabase cloud storage.', tier: 'Core', category: 'System', status: 'live', path: null, icon: 'Database', phase: 9, keywords: ['migration', 'cloud', 'supabase', 'sync'] },
  { id: 'sync-scheduler', name: 'Automated Sync Scheduler', description: 'Background portfolio value sync with configurable intervals.', tier: 'Core', category: 'System', status: 'live', path: null, icon: 'RefreshCw', phase: 10, keywords: ['sync', 'schedule', 'auto', 'background'] },
  { id: 'investment-tracking', name: 'Investment Tracking Engine', description: 'Professional P/L tracking with realized/unrealized gains across leagues.', tier: 'Bloomberg-Grade', category: 'Finance', status: 'live', path: '/', icon: 'DollarSign', phase: 11, keywords: ['investment', 'pl', 'profit', 'loss', 'tracking'] },
  { id: 'hedge-simulation', name: 'Hedge Simulation Engine', description: 'Full rebalancing simulation with virtual hedge nodes and deployment tracking.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'Shield', phase: 21, keywords: ['hedge', 'simulation', 'rebalance', 'node'] },
  { id: 'ebay-listing-gen', name: 'eBay Listing Generator', description: 'Auto-generate SEO-optimized listing titles and HTML descriptions.', tier: 'Competitive Moat', category: 'Trading', status: 'live', path: null, icon: 'FileEdit', phase: 29, keywords: ['ebay', 'listing', 'title', 'seo', 'html'] },
  { id: 'bulk-operations', name: 'Bulk Collection Operations', description: 'Select-all, bulk delete with undo, JSON export, and sort by 6 fields.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: '/collection', icon: 'CheckSquare', phase: 32, keywords: ['bulk', 'select', 'delete', 'export'] },
  { id: 'command-palette', name: 'Command Palette', description: 'Ctrl+K searchable command launcher with arrow key navigation and ARIA support.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: null, icon: 'Terminal', phase: 32, keywords: ['command', 'palette', 'launcher', 'ctrl k'] },
  { id: 'swipeable-cards', name: 'Swipeable Card Triage', description: 'Touch gesture support for mobile card triage with haptic feedback.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: null, icon: 'Hand', phase: 32, keywords: ['swipe', 'mobile', 'gesture', 'haptic'] },
  { id: 'skeleton-loaders', name: 'Skeleton Loading States', description: 'Professional skeleton loaders for cards, stats, charts, and dashboard views.', tier: 'Competitive Moat', category: 'UX', status: 'live', path: null, icon: 'Loader', phase: 32, keywords: ['skeleton', 'loading', 'placeholder'] },
  { id: 'playbook-templates', name: 'Negotiation Playbooks', description: 'Pre-built and custom negotiation strategies with configurable parameters.', tier: 'Competitive Moat', category: 'Trading', status: 'live', path: null, icon: 'BookOpen', phase: 16, keywords: ['playbook', 'strategy', 'negotiate', 'template'] },
  { id: 'speed-bonus', name: 'Speed Bonus System', description: 'Earn +2% payout on instant sells accepted within 5 minutes.', tier: 'Competitive Moat', category: 'Trading', status: 'live', path: null, icon: 'Timer', phase: 17, keywords: ['speed', 'bonus', 'instant', 'quick'] },
  { id: 'catalyst-detection', name: 'Catalyst Detection', description: 'Automated identification of price catalysts: scarcity, grade premium, timing.', tier: 'Competitive Moat', category: 'Analytics', status: 'live', path: null, icon: 'Flame', phase: 18, keywords: ['catalyst', 'trigger', 'driver', 'signal'] },
  { id: 'agent-thesis', name: 'Agent Investment Thesis', description: '4-agent consensus analysis with dissent detection and confidence scoring.', tier: 'Competitive Moat', category: 'AI', status: 'live', path: null, icon: 'Brain', phase: 19, keywords: ['thesis', 'consensus', 'agent', 'dissent'] },
  { id: 'monthly-challenges', name: 'Monthly Challenges', description: 'Time-limited community objectives with bonus achievement points.', tier: 'Advanced Intelligence', category: 'Social', status: 'live', path: '/leaderboard', icon: 'Flag', phase: 42, keywords: ['challenge', 'monthly', 'objective', 'bonus'] },
  { id: 'decision-journal', name: 'Decision Journal', description: 'Attach notes to portfolio snapshots and review decisions with actual outcomes.', tier: 'Advanced Intelligence', category: 'Tools', status: 'live', path: null, icon: 'NotebookPen', phase: 45, keywords: ['journal', 'decision', 'notes', 'review'] },
  { id: 'frontier-lab', name: 'Frontier Lab', description: 'Production roadmap for ten differentiated features the market does not currently offer.', tier: 'Competitive Moat', category: 'Strategy', status: 'live', path: '/frontier-lab', icon: 'Sparkles', phase: 148, keywords: ['frontier', 'moat', 'roadmap', 'innovation'] },
  { id: 'restoration-risk-ledger', name: 'Restoration Risk Ledger', description: 'Underwrite trimming, recoloring, cleaning, and restoration risk with evidence-backed discount curves.', tier: 'Competitive Moat', category: 'Risk', status: 'live', path: '/frontier-lab?feature=restoration-risk-ledger', icon: 'ShieldAlert', phase: 149, keywords: ['restoration', 'altered', 'risk', 'forensics'] },
  { id: 'claims-recovery-studio', name: 'Claims Recovery Studio', description: 'Generate insurer-ready incident and recovery packets from valuation, policy, and provenance data.', tier: 'Competitive Moat', category: 'Operations', status: 'live', path: '/frontier-lab?feature=claims-recovery-studio', icon: 'FileCheck', phase: 150, keywords: ['claims', 'insurance', 'recovery', 'incident'] },
  { id: 'venue-failure-drill', name: 'Venue Failure Drill', description: 'Stress test marketplace, vault, and consignment outages as operational portfolio risk.', tier: 'Industry-First', category: 'Risk', status: 'live', path: '/frontier-lab?feature=venue-failure-drill', icon: 'Siren', phase: 151, keywords: ['venue', 'failure', 'drill', 'outage'] },
  { id: 'opportunity-crowding-index', name: 'Opportunity Crowding Index', description: 'Measure whether a collectible thesis is already too crowded to still be alpha.', tier: 'Competitive Moat', category: 'Strategy', status: 'live', path: '/frontier-lab?feature=opportunity-crowding-index', icon: 'Users', phase: 152, keywords: ['crowding', 'consensus', 'alpha', 'hype'] },
  { id: 'provenance-gap-heatmap', name: 'Provenance Gap Heatmap', description: 'Score missing custody windows and prioritize which evidence gaps matter most to value.', tier: 'Industry-First', category: 'Trust', status: 'live', path: '/frontier-lab?feature=provenance-gap-heatmap', icon: 'Map', phase: 153, keywords: ['provenance', 'gap', 'timeline', 'evidence'] },
  { id: 'museum-loan-desk', name: 'Museum Loan Desk', description: 'Operationalize exhibition-grade loans with custody controls, loan fees, and condition tracking.', tier: 'Industry-First', category: 'Operations', status: 'live', path: '/frontier-lab?feature=museum-loan-desk', icon: 'Landmark', phase: 154, keywords: ['museum', 'loan', 'exhibit', 'custody'] },
  { id: 'counterfeit-cluster-radar', name: 'Counterfeit Cluster Radar', description: 'Detect organized fake-card networks by linking listings, serials, imagery, and dispute history.', tier: 'Competitive Moat', category: 'Trust', status: 'live', path: '/frontier-lab?feature=counterfeit-cluster-radar', icon: 'Radar', phase: 155, keywords: ['counterfeit', 'cluster', 'fraud', 'graph'] },
  { id: 'capital-stack-optimizer', name: 'Capital Stack Optimizer', description: 'Compare full sales, partial exits, consignments, and advances against liquidity and tax friction.', tier: 'Competitive Moat', category: 'Finance', status: 'live', path: '/frontier-lab?feature=capital-stack-optimizer', icon: 'Scale', phase: 156, keywords: ['capital stack', 'advance', 'consignment', 'liquidity'] },
  { id: 'prestige-spillover-engine', name: 'Prestige Spillover Engine', description: 'Track how luxury and cultural attention spills into card demand before comps fully move.', tier: 'Industry-First', category: 'Market Structure', status: 'live', path: '/frontier-lab?feature=prestige-spillover-engine', icon: 'Globe', phase: 157, keywords: ['spillover', 'prestige', 'culture', 'cross hobby'] },
  { id: 'reacquisition-radar', name: 'Reacquisition Radar', description: 'Surface disciplined buy-back opportunities for assets you already sold.', tier: 'Competitive Moat', category: 'Strategy', status: 'live', path: '/frontier-lab?feature=reacquisition-radar', icon: 'RotateCcw', phase: 158, keywords: ['reacquisition', 'buyback', 'sold vault', 're-entry'] },

  // ─── v5.0: Next-Gen Investment Intelligence (Phases 159-178) ───
  { id: 'card-genome-sequencer', name: 'Card Genome Sequencer', description: 'DNA-level card fingerprinting with 18 gene categories across Physical, Visual, Chemical, and Rarity dimensions.', tier: 'Industry-First', category: 'Analytics', status: 'live', path: '/card-genome-sequencer', icon: 'Dna', phase: 159, keywords: ['genome', 'dna', 'fingerprint', 'gene', 'physical', 'visual', 'chemical', 'rarity'] },
  { id: 'injury-oracle', name: 'Injury Oracle', description: 'AI-powered player injury forecasting with card value impact modeling across 30+ players.', tier: 'Industry-First', category: 'AI', status: 'live', path: '/injury-oracle', icon: 'HeartPulse', phase: 160, keywords: ['injury', 'oracle', 'forecast', 'health', 'impact', 'player'] },
  { id: 'cross-asset-correlation-v2', name: 'Cross-Asset Correlation', description: 'Correlates card values with S&P 500, Bitcoin, gold, real estate, and treasuries.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: '/cross-asset-correlation', icon: 'GitMerge', phase: 161, keywords: ['cross asset', 'correlation', 'sp500', 'bitcoin', 'gold', 'real estate', 'treasuries'] },
  { id: 'collector-social-graph', name: 'Collector Social Graph', description: 'Network analysis mapping collector influence, herd behavior, and trend adoption.', tier: 'Industry-First', category: 'Social', status: 'live', path: '/collector-social-graph', icon: 'Network', phase: 162, keywords: ['social graph', 'network', 'influence', 'herd', 'trend', 'collector'] },
  { id: 'restoration-simulator', name: 'Restoration Simulator', description: 'AI card restoration/regrading simulation with ROI analysis.', tier: 'Differentiated', category: 'Tools', status: 'live', path: '/restoration-simulator', icon: 'Wrench', phase: 163, keywords: ['restoration', 'regrade', 'simulation', 'roi', 'condition'] },
  { id: 'market-maker-arena', name: 'Market Maker Arena', description: 'Competing AI trading bot strategies with live P&L and order books.', tier: 'Industry-First', category: 'Trading', status: 'live', path: '/market-maker-arena', icon: 'Swords', phase: 164, keywords: ['market maker', 'bot', 'trading', 'pnl', 'order book', 'arena'] },
  { id: 'fractional-vault-v2', name: 'Fractional Vault', description: 'Tokenized fractional ownership of high-value cards with governance.', tier: 'Industry-First', category: 'Trading', status: 'live', path: '/fractional-vault', icon: 'Landmark', phase: 165, keywords: ['fractional', 'vault', 'tokenized', 'ownership', 'governance', 'shares'] },
  { id: 'portfolio-stress-tester', name: 'Portfolio Stress Tester', description: 'Monte Carlo simulation and VaR analysis for card portfolios.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: '/portfolio-stress-tester', icon: 'FlaskConical', phase: 166, keywords: ['stress test', 'monte carlo', 'var', 'simulation', 'risk'] },
  { id: 'rookie-pipeline-scanner', name: 'Rookie Pipeline Scanner', description: 'Pre-draft prospect scouting with projected card values.', tier: 'Advanced Intelligence', category: 'Data', status: 'live', path: '/rookie-pipeline-scanner', icon: 'Binoculars', phase: 167, keywords: ['rookie', 'pipeline', 'prospect', 'draft', 'scouting', 'projected'] },
  { id: 'forensics-lab', name: 'Forensics Lab', description: '10-layer forensic authentication and counterfeit detection.', tier: 'Industry-First', category: 'Security', status: 'live', path: '/forensics-lab', icon: 'Microscope', phase: 168, keywords: ['forensics', 'authentication', 'counterfeit', 'detection', 'layers'] },
  { id: 'card-decay-predictor', name: 'Card Decay Predictor', description: 'Physics-based condition degradation modeling with half-life predictions.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: '/card-decay-predictor', icon: 'Hourglass', phase: 169, keywords: ['decay', 'degradation', 'condition', 'half-life', 'physics', 'aging'] },
  { id: 'narrative-arc-engine', name: 'Narrative Arc Engine', description: 'Player career story-driven card valuation and premium quantification.', tier: 'Industry-First', category: 'Analytics', status: 'live', path: '/narrative-arc-engine', icon: 'BookOpen', phase: 170, keywords: ['narrative', 'arc', 'career', 'story', 'valuation', 'premium'] },
  { id: 'liquidity-depth-scanner', name: 'Liquidity Depth Scanner', description: 'Market depth analysis with exit strategy planning.', tier: 'Differentiated', category: 'Analytics', status: 'live', path: '/liquidity-depth-scanner', icon: 'Layers', phase: 171, keywords: ['liquidity', 'depth', 'market', 'exit', 'strategy'] },
  { id: 'contagion-mapper', name: 'Contagion Mapper', description: 'Systemic risk propagation modeling across card portfolios.', tier: 'Industry-First', category: 'Risk', status: 'live', path: '/contagion-mapper', icon: 'GitFork', phase: 172, keywords: ['contagion', 'systemic', 'risk', 'propagation', 'cascade'] },
  { id: 'grail-index-constructor', name: 'Grail Index Constructor', description: 'Build custom investable card indices with rebalancing.', tier: 'Differentiated', category: 'Portfolio', status: 'live', path: '/grail-index-constructor', icon: 'Crown', phase: 173, keywords: ['grail', 'index', 'custom', 'investable', 'rebalancing'] },
  { id: 'print-run-decoder', name: 'Print Run Decoder', description: 'Reverse-engineer hidden print runs from population data.', tier: 'Industry-First', category: 'Data', status: 'live', path: '/print-run-decoder', icon: 'Binary', phase: 174, keywords: ['print run', 'decode', 'population', 'reverse engineer', 'hidden'] },
  { id: 'temporal-arbitrage-radar', name: 'Temporal Arbitrage Radar', description: 'Time-based pricing anomaly detection across events and seasons.', tier: 'Differentiated', category: 'Trading', status: 'live', path: '/temporal-arbitrage-radar', icon: 'Clock', phase: 175, keywords: ['temporal', 'arbitrage', 'pricing', 'anomaly', 'seasonal', 'events'] },
  { id: 'collection-dna-mixer', name: 'Collection DNA Mixer', description: 'Genetic algorithm collection breeding for optimal hybrid portfolios.', tier: 'Industry-First', category: 'AI', status: 'live', path: '/collection-dna-mixer', icon: 'Combine', phase: 176, keywords: ['dna', 'mixer', 'genetic', 'algorithm', 'breeding', 'hybrid', 'portfolio'] },
  { id: 'card-yield-farming', name: 'Card Yield Farming', description: 'Passive income from card lending, licensing, staking, and insurance.', tier: 'Industry-First', category: 'Finance', status: 'live', path: '/card-yield-farming', icon: 'Sprout', phase: 177, keywords: ['yield', 'farming', 'lending', 'licensing', 'staking', 'passive income'] },
  { id: 'chaos-theory-simulator', name: 'Chaos Theory Simulator', description: 'Butterfly effect modeling for card market cascades.', tier: 'Industry-First', category: 'Analytics', status: 'live', path: '/chaos-theory-simulator', icon: 'Orbit', phase: 178, keywords: ['chaos', 'butterfly', 'cascade', 'theory', 'simulation', 'market'] },
];

/** Tier display order and color configuration */
export const TIER_CONFIG: Record<FeatureTier, { order: number; color: string; bgColor: string; borderColor: string; label: string }> = {
  'Core': { order: 1, color: 'text-slate-300', bgColor: 'bg-slate-700/50', borderColor: 'border-slate-600', label: 'Core Platform' },
  'Competitive Moat': { order: 2, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', label: 'Competitive Moat' },
  'Bloomberg-Grade': { order: 3, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', label: 'Bloomberg-Grade' },
  'Advanced Intelligence': { order: 4, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', label: 'Advanced Intelligence' },
  'Differentiated': { order: 5, color: 'text-brand-lime', bgColor: 'bg-brand-lime/10', borderColor: 'border-brand-lime/30', label: 'Differentiated' },
  'Industry-First': { order: 6, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', label: 'Industry-First' },
};

const searchableFeatureIds = new Set<string>(SEARCHABLE_FEATURE_IDS);
const featuredFeatureIds = new Set<string>(FEATURED_FEATURE_IDS);

export const DISCOVERABLE_FEATURE_CATALOG: Feature[] = FEATURE_CATALOG.filter(feature =>
  searchableFeatureIds.has(feature.id)
);

export const FEATURED_FEATURE_CATALOG: Feature[] = FEATURE_CATALOG.filter(feature =>
  featuredFeatureIds.has(feature.id)
);

/** Get all unique categories */
export function getCategories(features: Feature[] = DISCOVERABLE_FEATURE_CATALOG): string[] {
  const cats = new Set(features.map(f => f.category));
  return Array.from(cats).sort();
}

/** Search features by query string */
export function searchFeatures(query: string, features: Feature[] = DISCOVERABLE_FEATURE_CATALOG): Feature[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return features.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.keywords.some(kw => kw.includes(q)) ||
    f.category.toLowerCase().includes(q) ||
    f.tier.toLowerCase().includes(q)
  );
}

/** Group features by tier, sorted by tier order */
export function groupByTier(features: Feature[]): [FeatureTier, Feature[]][] {
  const groups = new Map<FeatureTier, Feature[]>();
  features.forEach(f => {
    const list = groups.get(f.tier) || [];
    list.push(f);
    groups.set(f.tier, list);
  });
  return Array.from(groups.entries()).sort((a, b) =>
    TIER_CONFIG[a[0]].order - TIER_CONFIG[b[0]].order
  );
}
