// Phase 122: API & Data Licensing Service
// Enterprise-grade API key management, usage metering, webhook orchestration,
// embeddable widget generation, and tiered pricing for sports card data licensing.

// ---- Types ----

export type APITier = 'free' | 'pro' | 'enterprise';

export interface APIKey {
  id: string;
  name: string;
  keyMasked: string;
  tier: APITier;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked' | 'expired';
  requestsToday: number;
  quotaDaily: number;
  quotaMonthly: number;
  requestsThisMonth: number;
  scopes: string[];
  ipWhitelist: string[];
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  category: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  rateLimit: number;
  tierRequired: APITier;
  cacheTTL: number;
  deprecated: boolean;
}

export interface UsageMetrics {
  date: string;
  requests: number;
  errors: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  bandwidthMB: number;
  uniqueEndpoints: number;
  topEndpoints: { path: string; count: number; avgLatency: number }[];
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'paused' | 'failed';
  lastTriggered: string | null;
  failureCount: number;
  retryPolicy: 'none' | 'linear' | 'exponential';
  createdAt: string;
}

export interface EmbedWidget {
  id: string;
  type: 'price-ticker' | 'card-search' | 'portfolio-summary' | 'market-heatmap' | 'auction-feed';
  label: string;
  description: string;
  previewUrl: string;
  embedCode: string;
  customizable: boolean;
  tierRequired: APITier;
}

export interface RateLimitConfig {
  tier: APITier;
  requestsPerMinute: number;
  requestsPerDay: number;
  requestsPerMonth: number;
  burstLimit: number;
  concurrentConnections: number;
}

export interface APIRequest {
  id: string;
  keyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  ip: string;
  userAgent: string;
}

export interface TierPricing {
  tier: APITier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: RateLimitConfig;
  supportLevel: string;
  sla: string;
}

// ---- Webhook Events ----

export const WEBHOOK_EVENTS = [
  'price.alert.triggered',
  'price.threshold.crossed',
  'auction.new_listing',
  'auction.ending_soon',
  'auction.bid_placed',
  'auction.completed',
  'market.index.update',
  'portfolio.value.change',
  'card.grade.update',
  'data.export.ready',
] as const;

// ---- Helpers ----

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateKeyString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'msi_lic_';
  for (let i = 0; i < 32; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function maskKey(key: string): string {
  return key.slice(0, 12) + '••••••••••••••••' + key.slice(-4);
}

// ---- Mock Data ----

const MOCK_API_KEYS: APIKey[] = [
  {
    id: 'key-001',
    name: 'Production Analytics',
    keyMasked: maskKey('msi_lic_Xk9mPqR2sT4vW6yA8bCdEfGhJkLmNpQ'),
    tier: 'enterprise',
    createdAt: '2025-11-02T08:00:00Z',
    lastUsed: '2026-03-13T14:22:08Z',
    status: 'active',
    requestsToday: 12847,
    quotaDaily: 50000,
    quotaMonthly: 1500000,
    requestsThisMonth: 389120,
    scopes: ['cards.read', 'market.read', 'auctions.read', 'portfolio.read', 'analytics.read'],
    ipWhitelist: ['203.0.113.0/24', '198.51.100.42'],
  },
  {
    id: 'key-002',
    name: 'Blog Embed Widget',
    keyMasked: maskKey('msi_lic_Bv3nT8wQm5kRjL2pYxCfHa7dSg9eUzNo'),
    tier: 'pro',
    createdAt: '2026-01-15T12:30:00Z',
    lastUsed: '2026-03-13T11:05:44Z',
    status: 'active',
    requestsToday: 3241,
    quotaDaily: 10000,
    quotaMonthly: 300000,
    requestsThisMonth: 87650,
    scopes: ['cards.read', 'market.read'],
    ipWhitelist: [],
  },
  {
    id: 'key-003',
    name: 'Testing Sandbox',
    keyMasked: maskKey('msi_lic_Za1bCd2eF3gH4iJ5kL6mN7oP8qR9sTuV'),
    tier: 'free',
    createdAt: '2026-02-20T16:45:00Z',
    lastUsed: '2026-03-12T09:18:33Z',
    status: 'active',
    requestsToday: 142,
    quotaDaily: 500,
    quotaMonthly: 10000,
    requestsThisMonth: 4320,
    scopes: ['cards.read'],
    ipWhitelist: [],
  },
];

const MOCK_USAGE_HISTORY: UsageMetrics[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date('2026-03-13');
  d.setDate(d.getDate() - (13 - i));
  const base = 11000 + Math.floor(Math.random() * 6000);
  return {
    date: d.toISOString().slice(0, 10),
    requests: base,
    errors: Math.floor(base * (0.002 + Math.random() * 0.008)),
    avgLatencyMs: 42 + Math.floor(Math.random() * 30),
    p99LatencyMs: 180 + Math.floor(Math.random() * 120),
    bandwidthMB: +(base * 0.0032).toFixed(1),
    uniqueEndpoints: 8 + Math.floor(Math.random() * 7),
    topEndpoints: [
      { path: '/v1/cards/search', count: Math.floor(base * 0.32), avgLatency: 38 },
      { path: '/v1/market/prices', count: Math.floor(base * 0.24), avgLatency: 27 },
      { path: '/v1/auctions/active', count: Math.floor(base * 0.18), avgLatency: 55 },
      { path: '/v1/portfolio/valuation', count: Math.floor(base * 0.12), avgLatency: 82 },
      { path: '/v1/analytics/trends', count: Math.floor(base * 0.08), avgLatency: 120 },
    ],
  };
});

const MOCK_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'ep-01', path: '/v1/cards/search', method: 'GET', category: 'Cards',
    description: 'Search cards by player name, year, set, grade, and other attributes.',
    parameters: [
      { name: 'q', type: 'string', required: true, description: 'Search query' },
      { name: 'year', type: 'number', required: false, description: 'Filter by year' },
      { name: 'grade', type: 'string', required: false, description: 'PSA/BGS grade filter' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (max 100)' },
    ],
    responseExample: '{"data":[{"id":"c1","player":"Patrick Mahomes","year":2017,...}],"total":245}',
    rateLimit: 60, tierRequired: 'free', cacheTTL: 300, deprecated: false,
  },
  {
    id: 'ep-02', path: '/v1/cards/{id}', method: 'GET', category: 'Cards',
    description: 'Get detailed card information including DNA profile and valuation history.',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Card unique identifier' },
    ],
    responseExample: '{"id":"c1","player":"Patrick Mahomes","dna":{...},"valuations":[...]}',
    rateLimit: 120, tierRequired: 'free', cacheTTL: 60, deprecated: false,
  },
  {
    id: 'ep-03', path: '/v1/cards/{id}/comps', method: 'GET', category: 'Cards',
    description: 'Retrieve comparable sales for a given card.',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Card unique identifier' },
      { name: 'days', type: 'number', required: false, description: 'Look-back window in days' },
    ],
    responseExample: '{"comps":[{"saleDate":"2026-03-01","price":1250,...}],"count":18}',
    rateLimit: 30, tierRequired: 'pro', cacheTTL: 600, deprecated: false,
  },
  {
    id: 'ep-04', path: '/v1/market/prices', method: 'GET', category: 'Market',
    description: 'Real-time market prices for tracked cards with bid/ask spreads.',
    parameters: [
      { name: 'ids', type: 'string[]', required: true, description: 'Comma-separated card IDs' },
    ],
    responseExample: '{"prices":[{"id":"c1","bid":1180,"ask":1250,"last":1220}]}',
    rateLimit: 120, tierRequired: 'free', cacheTTL: 30, deprecated: false,
  },
  {
    id: 'ep-05', path: '/v1/market/indices', method: 'GET', category: 'Market',
    description: 'Sports card market indices (MSI-500, Football, Basketball, etc.)',
    parameters: [
      { name: 'index', type: 'string', required: false, description: 'Index name filter' },
      { name: 'period', type: 'string', required: false, description: 'Time period (1d, 1w, 1m, 1y)' },
    ],
    responseExample: '{"indices":[{"name":"MSI-500","value":4821.3,"change":+1.4}]}',
    rateLimit: 60, tierRequired: 'free', cacheTTL: 60, deprecated: false,
  },
  {
    id: 'ep-06', path: '/v1/market/heatmap', method: 'GET', category: 'Market',
    description: 'Market heatmap data showing sector performance by sport and category.',
    parameters: [
      { name: 'granularity', type: 'string', required: false, description: 'hourly | daily | weekly' },
    ],
    responseExample: '{"sectors":[{"sport":"Football","change":+2.1,"volume":85000}]}',
    rateLimit: 30, tierRequired: 'pro', cacheTTL: 120, deprecated: false,
  },
  {
    id: 'ep-07', path: '/v1/auctions/active', method: 'GET', category: 'Auctions',
    description: 'List active auctions across all supported platforms.',
    parameters: [
      { name: 'platform', type: 'string', required: false, description: 'Filter by platform' },
      { name: 'minPrice', type: 'number', required: false, description: 'Minimum current bid' },
      { name: 'sport', type: 'string', required: false, description: 'Sport filter' },
    ],
    responseExample: '{"auctions":[{"id":"a1","title":"2017 Mahomes Prizm PSA 10","currentBid":8500,...}]}',
    rateLimit: 30, tierRequired: 'free', cacheTTL: 15, deprecated: false,
  },
  {
    id: 'ep-08', path: '/v1/auctions/{id}/snipe', method: 'POST', category: 'Auctions',
    description: 'Schedule an automated snipe bid for an auction.',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Auction ID' },
      { name: 'maxBid', type: 'number', required: true, description: 'Maximum bid amount' },
      { name: 'timing', type: 'number', required: false, description: 'Seconds before end to bid' },
    ],
    responseExample: '{"snipeId":"s1","status":"scheduled","maxBid":9000}',
    rateLimit: 10, tierRequired: 'enterprise', cacheTTL: 0, deprecated: false,
  },
  {
    id: 'ep-09', path: '/v1/portfolio/valuation', method: 'GET', category: 'Portfolio',
    description: 'Get current portfolio valuation with P&L breakdown.',
    parameters: [
      { name: 'currency', type: 'string', required: false, description: 'USD, EUR, GBP' },
    ],
    responseExample: '{"totalValue":128500,"costBasis":95200,"unrealizedPL":33300}',
    rateLimit: 30, tierRequired: 'pro', cacheTTL: 60, deprecated: false,
  },
  {
    id: 'ep-10', path: '/v1/portfolio/risk', method: 'GET', category: 'Portfolio',
    description: 'Portfolio risk analysis including VaR, concentration, and correlation metrics.',
    parameters: [],
    responseExample: '{"var95":4200,"sharpe":1.82,"maxDrawdown":-12.3}',
    rateLimit: 15, tierRequired: 'enterprise', cacheTTL: 300, deprecated: false,
  },
  {
    id: 'ep-11', path: '/v1/analytics/trends', method: 'GET', category: 'Analytics',
    description: 'Trend analysis for players, sets, or market segments.',
    parameters: [
      { name: 'subject', type: 'string', required: true, description: 'Player name or set identifier' },
      { name: 'window', type: 'string', required: false, description: 'Analysis window (7d, 30d, 90d, 1y)' },
    ],
    responseExample: '{"trend":"bullish","momentum":0.78,"forecast":{...}}',
    rateLimit: 20, tierRequired: 'pro', cacheTTL: 600, deprecated: false,
  },
  {
    id: 'ep-12', path: '/v1/analytics/sentiment', method: 'GET', category: 'Analytics',
    description: 'Social media and community sentiment analysis for players or sets.',
    parameters: [
      { name: 'player', type: 'string', required: true, description: 'Player name' },
    ],
    responseExample: '{"score":0.72,"label":"bullish","sources":["twitter","reddit","forums"]}',
    rateLimit: 20, tierRequired: 'pro', cacheTTL: 300, deprecated: false,
  },
  {
    id: 'ep-13', path: '/v1/webhooks', method: 'POST', category: 'Webhooks',
    description: 'Create a new webhook subscription for event notifications.',
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'HTTPS callback URL' },
      { name: 'events', type: 'string[]', required: true, description: 'List of event types' },
    ],
    responseExample: '{"id":"wh1","status":"active","secret":"whsec_..."}',
    rateLimit: 5, tierRequired: 'pro', cacheTTL: 0, deprecated: false,
  },
  {
    id: 'ep-14', path: '/v1/data/export', method: 'POST', category: 'Data',
    description: 'Request a bulk data export in CSV, JSON, or Parquet format.',
    parameters: [
      { name: 'format', type: 'string', required: true, description: 'csv | json | parquet' },
      { name: 'dataset', type: 'string', required: true, description: 'Dataset identifier' },
      { name: 'filters', type: 'object', required: false, description: 'Filter criteria' },
    ],
    responseExample: '{"exportId":"exp1","status":"queued","estimatedTime":45}',
    rateLimit: 5, tierRequired: 'enterprise', cacheTTL: 0, deprecated: false,
  },
  {
    id: 'ep-15', path: '/v1/data/historical', method: 'GET', category: 'Data',
    description: 'Historical pricing data for any tracked card (up to 10 years).',
    parameters: [
      { name: 'cardId', type: 'string', required: true, description: 'Card unique identifier' },
      { name: 'from', type: 'string', required: false, description: 'Start date (ISO 8601)' },
      { name: 'to', type: 'string', required: false, description: 'End date (ISO 8601)' },
      { name: 'interval', type: 'string', required: false, description: 'daily | weekly | monthly' },
    ],
    responseExample: '{"prices":[{"date":"2025-01-01","close":1120,"volume":34},...]}',
    rateLimit: 30, tierRequired: 'pro', cacheTTL: 3600, deprecated: false,
  },
  {
    id: 'ep-16', path: '/v1/grading/predict', method: 'POST', category: 'Analytics',
    description: 'AI-powered grade prediction from card images.',
    parameters: [
      { name: 'imageUrl', type: 'string', required: true, description: 'URL to card image' },
    ],
    responseExample: '{"predictedGrade":"PSA 9","confidence":0.87,"details":{...}}',
    rateLimit: 10, tierRequired: 'enterprise', cacheTTL: 0, deprecated: false,
  },
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-001',
    name: 'Price Alert Bot',
    url: 'https://hooks.myapp.com/price-alerts',
    events: ['price.alert.triggered', 'price.threshold.crossed'],
    secret: 'whsec_••••••••••••',
    status: 'active',
    lastTriggered: '2026-03-13T13:45:22Z',
    failureCount: 0,
    retryPolicy: 'exponential',
    createdAt: '2025-12-10T09:00:00Z',
  },
  {
    id: 'wh-002',
    name: 'Auction Sniper Notifier',
    url: 'https://hooks.myapp.com/auctions',
    events: ['auction.new_listing', 'auction.ending_soon', 'auction.completed'],
    secret: 'whsec_••••••••••••',
    status: 'active',
    lastTriggered: '2026-03-13T12:10:05Z',
    failureCount: 0,
    retryPolicy: 'linear',
    createdAt: '2026-01-05T14:30:00Z',
  },
  {
    id: 'wh-003',
    name: 'Slack Portfolio Updates',
    url: 'https://hooks.slack.com/services/T0X/B0Y/abcdef',
    events: ['portfolio.value.change', 'market.index.update'],
    secret: 'whsec_••••••••••••',
    status: 'paused',
    lastTriggered: '2026-03-10T08:22:14Z',
    failureCount: 2,
    retryPolicy: 'none',
    createdAt: '2026-02-18T11:15:00Z',
  },
];

const MOCK_EMBED_WIDGETS: EmbedWidget[] = [
  {
    id: 'emb-01',
    type: 'price-ticker',
    label: 'Live Price Ticker',
    description: 'Real-time scrolling price ticker for top traded cards. Perfect for blogs and content sites.',
    previewUrl: '/embeds/preview/price-ticker',
    embedCode: '<iframe src="https://api.msi-platform.com/embed/price-ticker?key=YOUR_KEY" width="100%" height="48" frameborder="0"></iframe>',
    customizable: true,
    tierRequired: 'pro',
  },
  {
    id: 'emb-02',
    type: 'card-search',
    label: 'Card Search Box',
    description: 'Drop-in card search widget with auto-complete and instant valuation results.',
    previewUrl: '/embeds/preview/card-search',
    embedCode: '<div id="msi-search"></div>\n<script src="https://api.msi-platform.com/embed/search.js?key=YOUR_KEY"></script>',
    customizable: true,
    tierRequired: 'pro',
  },
  {
    id: 'emb-03',
    type: 'portfolio-summary',
    label: 'Portfolio Summary Card',
    description: 'Display your portfolio value and daily P&L. Great for YouTube channel overlays.',
    previewUrl: '/embeds/preview/portfolio-summary',
    embedCode: '<iframe src="https://api.msi-platform.com/embed/portfolio?key=YOUR_KEY" width="320" height="200" frameborder="0"></iframe>',
    customizable: true,
    tierRequired: 'pro',
  },
  {
    id: 'emb-04',
    type: 'market-heatmap',
    label: 'Market Heatmap',
    description: 'Interactive market heatmap showing sector performance across sports.',
    previewUrl: '/embeds/preview/market-heatmap',
    embedCode: '<iframe src="https://api.msi-platform.com/embed/heatmap?key=YOUR_KEY" width="600" height="400" frameborder="0"></iframe>',
    customizable: false,
    tierRequired: 'enterprise',
  },
  {
    id: 'emb-05',
    type: 'auction-feed',
    label: 'Live Auction Feed',
    description: 'Streaming auction feed showing new listings and ending-soon items.',
    previewUrl: '/embeds/preview/auction-feed',
    embedCode: '<iframe src="https://api.msi-platform.com/embed/auction-feed?key=YOUR_KEY" width="100%" height="320" frameborder="0"></iframe>',
    customizable: true,
    tierRequired: 'enterprise',
  },
];

const MOCK_API_REQUESTS: APIRequest[] = Array.from({ length: 20 }, (_, i) => {
  const endpoints = ['/v1/cards/search', '/v1/market/prices', '/v1/auctions/active', '/v1/portfolio/valuation', '/v1/analytics/trends'];
  const methods = ['GET', 'GET', 'GET', 'GET', 'GET'];
  const idx = i % endpoints.length;
  const d = new Date('2026-03-13T14:30:00Z');
  d.setMinutes(d.getMinutes() - i * 3);
  return {
    id: `req-${1000 + i}`,
    keyId: i < 12 ? 'key-001' : i < 17 ? 'key-002' : 'key-003',
    endpoint: endpoints[idx],
    method: methods[idx],
    statusCode: Math.random() > 0.92 ? 429 : Math.random() > 0.95 ? 500 : 200,
    latencyMs: 15 + Math.floor(Math.random() * 150),
    timestamp: d.toISOString(),
    ip: `203.0.113.${10 + Math.floor(Math.random() * 40)}`,
    userAgent: 'MSI-SDK/2.1.0',
  };
});

const TIER_PRICING: TierPricing[] = [
  {
    tier: 'free',
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Basic card search & lookup',
      'Market price quotes',
      'Active auction listings',
      '500 requests/day',
      'Community support',
    ],
    limits: {
      tier: 'free',
      requestsPerMinute: 10,
      requestsPerDay: 500,
      requestsPerMonth: 10000,
      burstLimit: 15,
      concurrentConnections: 2,
    },
    supportLevel: 'Community',
    sla: 'None',
  },
  {
    tier: 'pro',
    name: 'Professional',
    monthlyPrice: 99,
    annualPrice: 948,
    features: [
      'Everything in Starter',
      'Comparable sales data',
      'Historical pricing (5 yr)',
      'Trend & sentiment analysis',
      'Webhook subscriptions',
      'Embeddable widgets',
      '10,000 requests/day',
      'Email support (24hr SLA)',
    ],
    limits: {
      tier: 'pro',
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      requestsPerMonth: 300000,
      burstLimit: 100,
      concurrentConnections: 10,
    },
    supportLevel: 'Email (24hr)',
    sla: '99.5%',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 499,
    annualPrice: 4788,
    features: [
      'Everything in Professional',
      'Auction snipe automation',
      'Portfolio risk analytics',
      'Bulk data exports (Parquet)',
      'AI grade prediction',
      'Historical pricing (10 yr)',
      'IP whitelisting',
      '50,000 requests/day',
      'Dedicated support + Slack',
      '99.9% SLA guarantee',
    ],
    limits: {
      tier: 'enterprise',
      requestsPerMinute: 200,
      requestsPerDay: 50000,
      requestsPerMonth: 1500000,
      burstLimit: 500,
      concurrentConnections: 50,
    },
    supportLevel: 'Dedicated + Slack',
    sla: '99.9%',
  },
];

// ---- Service Functions ----

export function getAPIKeys(): APIKey[] {
  return [...MOCK_API_KEYS];
}

export function createAPIKey(name: string, tier: APITier, scopes: string[]): APIKey {
  const raw = generateKeyString();
  const tierLimits = TIER_PRICING.find(t => t.tier === tier)!.limits;
  const newKey: APIKey = {
    id: generateId(),
    name,
    keyMasked: maskKey(raw),
    tier,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    status: 'active',
    requestsToday: 0,
    quotaDaily: tierLimits.requestsPerDay,
    quotaMonthly: tierLimits.requestsPerMonth,
    requestsThisMonth: 0,
    scopes,
    ipWhitelist: [],
  };
  MOCK_API_KEYS.push(newKey);
  return newKey;
}

export function revokeAPIKey(keyId: string): boolean {
  const key = MOCK_API_KEYS.find(k => k.id === keyId);
  if (key) {
    key.status = 'revoked';
    return true;
  }
  return false;
}

export function rotateAPIKey(keyId: string): APIKey | null {
  const key = MOCK_API_KEYS.find(k => k.id === keyId);
  if (!key || key.status === 'revoked') return null;
  const raw = generateKeyString();
  key.keyMasked = maskKey(raw);
  key.lastUsed = new Date().toISOString();
  return { ...key };
}

export function getUsageMetrics(): UsageMetrics[] {
  return [...MOCK_USAGE_HISTORY];
}

/** Live serverless routes already deployed on Vercel (not mock /v1 stubs). */
const LIVE_PRODUCTION_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'live-health',
    path: '/api/health',
    method: 'GET',
    category: 'Production (live)',
    description: 'Deployment health + serverApiAuth readiness.',
    parameters: [],
    responseExample: '{"ok":true,"service":"msi","config":{"serverApiAuth":true}}',
    rateLimit: 120,
    tierRequired: 'free',
    cacheTTL: 0,
    deprecated: false,
  },
  {
    id: 'live-ebay',
    path: '/api/market/ebay',
    method: 'POST',
    category: 'Production (live)',
    description: 'eBay sold/active comps (requires Bearer JWT + EBAY_* server keys + VITE_FF_REAL_EBAY).',
    parameters: [
      { name: 'playerName', type: 'string', required: false, description: 'Player filter' },
      { name: 'limit', type: 'number', required: false, description: 'Page size' },
    ],
    responseExample: '{"source":"live|mock|stale","items":[...]}',
    rateLimit: 60,
    tierRequired: 'pro',
    cacheTTL: 120,
    deprecated: false,
  },
  {
    id: 'live-consensus',
    path: '/api/market/consensus',
    method: 'POST',
    category: 'Production (live)',
    description: 'Consensus FMV ledger for a card inventory payload (Bearer JWT).',
    parameters: [
      { name: 'cards', type: 'array', required: true, description: 'Card quotes with valuationSource/timestamp' },
    ],
    responseExample: '{"ok":true,"ledger":{"totalFmv":1200,"freshVerifiablePct":40,...}}',
    rateLimit: 60,
    tierRequired: 'pro',
    cacheTTL: 0,
    deprecated: false,
  },
  {
    id: 'live-psa',
    path: '/api/grading/psa/cert',
    method: 'POST',
    category: 'Production (live)',
    description: 'PSA cert lookup (requires Bearer JWT + PSA_API_KEY + VITE_FF_REAL_PSA).',
    parameters: [{ name: 'certNumber', type: 'string', required: true, description: 'PSA cert #' }],
    responseExample: '{"source":"live|mock","cert":{...}}',
    rateLimit: 30,
    tierRequired: 'pro',
    cacheTTL: 300,
    deprecated: false,
  },
  {
    id: 'live-export',
    path: '/api/me/export',
    method: 'GET',
    category: 'Production (live)',
    description: 'GDPR data export for the authenticated user.',
    parameters: [],
    responseExample: '{"schemaVersion":1,"user":{...},"data":{...}}',
    rateLimit: 5,
    tierRequired: 'free',
    cacheTTL: 0,
    deprecated: false,
  },
];

export function getEndpointCatalog(): APIEndpoint[] {
  return [...LIVE_PRODUCTION_ENDPOINTS, ...MOCK_ENDPOINTS];
}

export function getWebhooks(): WebhookConfig[] {
  return [...MOCK_WEBHOOKS];
}

export function createWebhook(name: string, url: string, events: string[]): WebhookConfig {
  const wh: WebhookConfig = {
    id: generateId(),
    name,
    url,
    events,
    secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
    status: 'active',
    lastTriggered: null,
    failureCount: 0,
    retryPolicy: 'exponential',
    createdAt: new Date().toISOString(),
  };
  MOCK_WEBHOOKS.push(wh);
  return wh;
}

export function getEmbedCode(widgetType: EmbedWidget['type']): EmbedWidget | null {
  return MOCK_EMBED_WIDGETS.find(w => w.type === widgetType) ?? null;
}

export function getEmbedWidgets(): EmbedWidget[] {
  return [...MOCK_EMBED_WIDGETS];
}

export function getTierPricing(): TierPricing[] {
  return [...TIER_PRICING];
}

export function getAPIRequests(): APIRequest[] {
  return [...MOCK_API_REQUESTS];
}

export function getRateLimitConfig(tier: APITier): RateLimitConfig {
  return TIER_PRICING.find(t => t.tier === tier)!.limits;
}
