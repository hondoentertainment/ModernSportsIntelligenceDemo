// @ts-nocheck
// Phase 91: MSI API & Data Export Platform Service
// Bloomberg API/Data License equivalent for sports card analytics

import { store } from '../dal/syncStore';

const STORAGE_KEYS = {
  apiKeys: 'msi_api_keys',
  webhooks: 'msi_webhooks',
  exports: 'msi_export_history',
  usage: 'msi_api_usage',
};

// ---- Interfaces ----

export interface APIKey {
  id: string;
  name: string;
  key: string; // masked
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  lastUsed: string;
  requestsToday: number;
  requestsLimit: number;
  status: 'active' | 'suspended' | 'revoked';
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST';
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  rateLimit: number;
  tier: 'free' | 'pro' | 'enterprise';
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
}

export interface APIUsage {
  date: string;
  requests: number;
  errors: number;
  avgLatency: number;
  topEndpoints: { path: string; count: number }[];
}

export interface ExportJob {
  id: string;
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  dataType: 'portfolio' | 'transactions' | 'analytics' | 'tax_report';
  status: 'queued' | 'processing' | 'complete' | 'failed';
  createdAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
  fileSize: number | null;
}

export interface APIPlatformStats {
  totalKeys: number;
  totalRequests: number;
  avgLatency: number;
  uptime: number;
  webhooksConfigured: number;
  exportsGenerated: number;
}

// ---- Helpers ----

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateAPIKeyString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let raw = 'msi_';
  for (let i = 0; i < 32; i++) raw += chars[Math.floor(Math.random() * chars.length)];
  return raw;
}

function maskKey(key: string): string {
  if (key.length <= 8) return key;
  return key.slice(0, 7) + '••••••••••••••••' + key.slice(-4);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(key, data);
}

// ---- Seed Data ----

function seedAPIKeys(): APIKey[] {
  return [
    {
      id: generateId(),
      name: 'Production App',
      key: maskKey(generateAPIKeyString()),
      tier: 'enterprise',
      createdAt: '2025-11-14T08:00:00Z',
      lastUsed: '2026-03-12T14:22:00Z',
      requestsToday: 4_821,
      requestsLimit: 50_000,
      status: 'active',
    },
    {
      id: generateId(),
      name: 'Mobile Client',
      key: maskKey(generateAPIKeyString()),
      tier: 'pro',
      createdAt: '2026-01-03T10:15:00Z',
      lastUsed: '2026-03-12T13:58:00Z',
      requestsToday: 1_247,
      requestsLimit: 10_000,
      status: 'active',
    },
    {
      id: generateId(),
      name: 'Test Environment',
      key: maskKey(generateAPIKeyString()),
      tier: 'free',
      createdAt: '2026-02-20T15:30:00Z',
      lastUsed: '2026-03-11T09:12:00Z',
      requestsToday: 42,
      requestsLimit: 500,
      status: 'active',
    },
  ];
}

function seedWebhooks(): WebhookConfig[] {
  return [
    {
      id: generateId(),
      name: 'Price Alert Relay',
      url: 'https://hooks.myapp.com/msi/prices',
      events: ['price.change', 'price.spike', 'price.drop'],
      secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
      status: 'active',
      lastTriggered: '2026-03-12T14:05:00Z',
      failureCount: 0,
    },
    {
      id: generateId(),
      name: 'Portfolio Sync',
      url: 'https://api.portfolio-tracker.io/webhook',
      events: ['portfolio.update', 'card.added', 'card.removed'],
      secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
      status: 'active',
      lastTriggered: '2026-03-12T12:30:00Z',
      failureCount: 0,
    },
    {
      id: generateId(),
      name: 'Market Digest',
      url: 'https://slack.com/api/hooks/T0394XZ/msi-feed',
      events: ['market.index.update', 'market.movers'],
      secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
      status: 'paused',
      lastTriggered: '2026-03-10T08:00:00Z',
      failureCount: 0,
    },
    {
      id: generateId(),
      name: 'Legacy CRM',
      url: 'https://crm.oldsite.com/ingest',
      events: ['card.sold', 'card.graded'],
      secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
      status: 'failed',
      lastTriggered: '2026-03-08T17:44:00Z',
      failureCount: 12,
    },
  ];
}

function seedExportHistory(): ExportJob[] {
  return [
    {
      id: generateId(),
      format: 'xlsx',
      dataType: 'portfolio',
      status: 'complete',
      createdAt: '2026-03-12T10:00:00Z',
      completedAt: '2026-03-12T10:00:14Z',
      downloadUrl: '/exports/portfolio_20260312.xlsx',
      fileSize: 284_500,
    },
    {
      id: generateId(),
      format: 'csv',
      dataType: 'transactions',
      status: 'complete',
      createdAt: '2026-03-11T16:30:00Z',
      completedAt: '2026-03-11T16:30:08Z',
      downloadUrl: '/exports/transactions_20260311.csv',
      fileSize: 152_300,
    },
    {
      id: generateId(),
      format: 'pdf',
      dataType: 'tax_report',
      status: 'complete',
      createdAt: '2026-03-10T09:15:00Z',
      completedAt: '2026-03-10T09:15:22Z',
      downloadUrl: '/exports/tax_report_2025.pdf',
      fileSize: 1_048_576,
    },
    {
      id: generateId(),
      format: 'json',
      dataType: 'analytics',
      status: 'complete',
      createdAt: '2026-03-09T14:00:00Z',
      completedAt: '2026-03-09T14:00:05Z',
      downloadUrl: '/exports/analytics_20260309.json',
      fileSize: 98_200,
    },
  ];
}

function generateUsageData(days: number): APIUsage[] {
  const data: APIUsage[] = [];
  const now = new Date('2026-03-12T00:00:00Z');
  const topEndpointPool = [
    '/api/v1/cards/:id/price',
    '/api/v1/portfolio',
    '/api/v1/market/indices',
    '/api/v1/market/movers',
    '/api/v1/player/:name/trajectory',
    '/api/v1/analytics/attribution',
    '/api/v1/screener/run',
    '/api/v1/alerts',
  ];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseRequests = isWeekend ? 3_200 : 6_400;
    const jitter = Math.floor(Math.random() * 2000) - 1000;
    const requests = baseRequests + jitter;
    const errors = Math.floor(requests * (0.005 + Math.random() * 0.01));
    const avgLatency = 42 + Math.floor(Math.random() * 30);

    // Pick top 5 endpoints for the day
    const shuffled = [...topEndpointPool].sort(() => Math.random() - 0.5);
    const topEndpoints = shuffled.slice(0, 5).map((path, idx) => ({
      path,
      count: Math.floor(requests * (0.3 - idx * 0.05) * (0.8 + Math.random() * 0.4)),
    }));

    data.push({
      date: date.toISOString().split('T')[0],
      requests,
      errors,
      avgLatency,
      topEndpoints,
    });
  }
  return data;
}

// ---- Endpoint Documentation ----

const ENDPOINT_DOCS: APIEndpoint[] = [
  {
    path: '/api/v1/portfolio',
    method: 'GET',
    description: 'Retrieve all holdings in the authenticated user\'s portfolio with current valuations.',
    parameters: [
      { name: 'include_sold', type: 'boolean', required: false, description: 'Include sold cards in response' },
      { name: 'sort', type: 'string', required: false, description: 'Sort field: value, name, date_added' },
    ],
    responseExample: JSON.stringify({
      data: [
        { id: 'c_001', player: 'Shohei Ohtani', year: 2018, set: 'Topps Chrome', grade: 'PSA 10', value: 4250.00, change_24h: 2.3 },
        { id: 'c_002', player: 'Victor Wembanyama', year: 2023, set: 'Prizm Silver', grade: 'BGS 9.5', value: 1875.00, change_24h: -1.1 },
      ],
      total_value: 48750.00,
      count: 24,
    }, null, 2),
    rateLimit: 60,
    tier: 'free',
  },
  {
    path: '/api/v1/cards/:id/price',
    method: 'GET',
    description: 'Get real-time pricing data for a specific card including recent sales and price history.',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Card identifier' },
      { name: 'period', type: 'string', required: false, description: 'History period: 7d, 30d, 90d, 1y' },
    ],
    responseExample: JSON.stringify({
      card_id: 'c_001',
      current_price: 4250.00,
      price_24h_ago: 4152.00,
      change_pct: 2.36,
      last_sale: { price: 4200.00, date: '2026-03-11', platform: 'eBay' },
      volume_30d: 18,
    }, null, 2),
    rateLimit: 120,
    tier: 'free',
  },
  {
    path: '/api/v1/market/indices',
    method: 'GET',
    description: 'Get MSI market indices — composite, basketball, baseball, football, hockey.',
    parameters: [
      { name: 'symbols', type: 'string', required: false, description: 'Comma-separated index symbols (e.g. MSI500,MSIBBALL)' },
    ],
    responseExample: JSON.stringify({
      indices: [
        { symbol: 'MSI500', name: 'MSI 500 Composite', value: 12847.32, change: 1.42 },
        { symbol: 'MSIBBALL', name: 'MSI Basketball', value: 9234.10, change: -0.38 },
        { symbol: 'MSIBASE', name: 'MSI Baseball', value: 7612.45, change: 2.17 },
      ],
      timestamp: '2026-03-12T14:30:00Z',
    }, null, 2),
    rateLimit: 30,
    tier: 'free',
  },
  {
    path: '/api/v1/market/movers',
    method: 'GET',
    description: 'Get top price movers — gainers and losers across the sports card market.',
    parameters: [
      { name: 'direction', type: 'string', required: false, description: 'Filter: gainers, losers, or both' },
      { name: 'limit', type: 'number', required: false, description: 'Number of results (max 50)' },
      { name: 'sport', type: 'string', required: false, description: 'Filter by sport' },
    ],
    responseExample: JSON.stringify({
      gainers: [
        { player: 'Caitlin Clark', card: '2024 Prizm Silver', change_pct: 18.4, price: 892.00 },
      ],
      losers: [
        { player: 'Zion Williamson', card: '2019 Prizm Base', change_pct: -7.2, price: 215.00 },
      ],
    }, null, 2),
    rateLimit: 30,
    tier: 'free',
  },
  {
    path: '/api/v1/player/:name/trajectory',
    method: 'GET',
    description: 'Get AI-powered price trajectory prediction for a player\'s card values.',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Player name (URL-encoded)' },
      { name: 'horizon', type: 'string', required: false, description: 'Prediction horizon: 30d, 90d, 1y' },
      { name: 'confidence', type: 'boolean', required: false, description: 'Include confidence intervals' },
    ],
    responseExample: JSON.stringify({
      player: 'Shohei Ohtani',
      current_index: 142.5,
      predictions: [
        { date: '2026-04-12', index: 148.2, confidence_low: 138.1, confidence_high: 158.3 },
        { date: '2026-06-12', index: 161.7, confidence_low: 142.9, confidence_high: 180.5 },
      ],
      factors: ['Spring training performance', 'Contract milestone', 'Population growth slowdown'],
    }, null, 2),
    rateLimit: 20,
    tier: 'pro',
  },
  {
    path: '/api/v1/analytics/attribution',
    method: 'GET',
    description: 'Portfolio performance attribution analysis — returns by sport, era, grade, and factor.',
    parameters: [
      { name: 'period', type: 'string', required: false, description: 'Analysis period: mtd, qtd, ytd, 1y' },
      { name: 'benchmark', type: 'string', required: false, description: 'Benchmark index for comparison' },
    ],
    responseExample: JSON.stringify({
      total_return: 12.4,
      benchmark_return: 8.7,
      alpha: 3.7,
      attribution: {
        by_sport: { basketball: 5.2, baseball: 4.8, football: 2.4 },
        by_era: { modern: 8.1, vintage: 3.2, ultra_modern: 1.1 },
        by_grade: { psa10: 7.8, psa9: 3.1, raw: 1.5 },
      },
    }, null, 2),
    rateLimit: 10,
    tier: 'pro',
  },
  {
    path: '/api/v1/screener/run',
    method: 'POST',
    description: 'Run a custom card screener with filters for sport, price, grade, momentum, and more.',
    parameters: [
      { name: 'filters', type: 'object', required: true, description: 'Filter criteria object' },
      { name: 'sort_by', type: 'string', required: false, description: 'Sort field for results' },
      { name: 'limit', type: 'number', required: false, description: 'Max results to return' },
    ],
    responseExample: JSON.stringify({
      results: [
        { player: 'Anthony Edwards', card: '2020 Prizm Silver', price: 1340.00, momentum: 0.87, grade: 'PSA 10' },
        { player: 'Jasson Dominguez', card: '2024 Bowman Chrome', price: 425.00, momentum: 0.92, grade: 'BGS 9.5' },
      ],
      total_matches: 47,
      filters_applied: 3,
    }, null, 2),
    rateLimit: 15,
    tier: 'pro',
  },
  {
    path: '/api/v1/alerts',
    method: 'GET',
    description: 'Retrieve all active price alerts and their trigger status.',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filter: active, triggered, expired' },
    ],
    responseExample: JSON.stringify({
      alerts: [
        { id: 'a_001', player: 'Luka Doncic', condition: 'price_above', threshold: 3000, current: 2847, status: 'active' },
        { id: 'a_002', player: 'Mike Trout', condition: 'price_below', threshold: 500, current: 520, status: 'active' },
      ],
      total: 8,
    }, null, 2),
    rateLimit: 30,
    tier: 'free',
  },
  {
    path: '/api/v1/webhooks',
    method: 'POST',
    description: 'Create a new webhook subscription for real-time event notifications.',
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'HTTPS endpoint URL for webhook delivery' },
      { name: 'events', type: 'string[]', required: true, description: 'List of event types to subscribe to' },
      { name: 'secret', type: 'string', required: false, description: 'Shared secret for HMAC signature verification' },
    ],
    responseExample: JSON.stringify({
      id: 'wh_abc123',
      url: 'https://example.com/webhook',
      events: ['price.change', 'portfolio.update'],
      secret: 'whsec_xxxxxx',
      status: 'active',
      created_at: '2026-03-12T15:00:00Z',
    }, null, 2),
    rateLimit: 5,
    tier: 'pro',
  },
  {
    path: '/api/v1/export/:type',
    method: 'GET',
    description: 'Export data in the specified format. Supports portfolio, transactions, analytics, and tax reports.',
    parameters: [
      { name: 'type', type: 'string', required: true, description: 'Export type: portfolio, transactions, analytics, tax_report' },
      { name: 'format', type: 'string', required: false, description: 'File format: csv, json, pdf, xlsx (default: csv)' },
      { name: 'date_from', type: 'string', required: false, description: 'Start date filter (ISO 8601)' },
      { name: 'date_to', type: 'string', required: false, description: 'End date filter (ISO 8601)' },
    ],
    responseExample: JSON.stringify({
      job_id: 'exp_xyz789',
      status: 'queued',
      estimated_seconds: 12,
      poll_url: '/api/v1/export/status/exp_xyz789',
    }, null, 2),
    rateLimit: 5,
    tier: 'pro',
  },
  {
    path: '/api/v1/population/:card_id',
    method: 'GET',
    description: 'Get population report data for a specific card across grading companies.',
    parameters: [
      { name: 'card_id', type: 'string', required: true, description: 'Card identifier' },
      { name: 'grader', type: 'string', required: false, description: 'Filter by grading company: PSA, BGS, SGC' },
    ],
    responseExample: JSON.stringify({
      card_id: 'c_001',
      total_graded: 12847,
      breakdown: {
        PSA: { '10': 342, '9': 1847, '8': 2103 },
        BGS: { '9.5': 189, '9': 722 },
      },
      pop_trend: 'increasing',
      scarcity_score: 7.4,
    }, null, 2),
    rateLimit: 30,
    tier: 'free',
  },
  {
    path: '/api/v1/comps/:card_id',
    method: 'GET',
    description: 'Retrieve comparable recent sales for a card to inform pricing decisions.',
    parameters: [
      { name: 'card_id', type: 'string', required: true, description: 'Card identifier' },
      { name: 'days', type: 'number', required: false, description: 'Lookback window in days (default 90)' },
      { name: 'platform', type: 'string', required: false, description: 'Filter by platform: ebay, pwcc, goldin' },
    ],
    responseExample: JSON.stringify({
      card_id: 'c_001',
      comps: [
        { date: '2026-03-10', price: 4200, platform: 'eBay', condition_notes: 'Well-centered' },
        { date: '2026-03-05', price: 4100, platform: 'PWCC', condition_notes: null },
        { date: '2026-02-28', price: 4350, platform: 'Goldin', condition_notes: 'Part of lot' },
      ],
      avg_price: 4216.67,
      median_price: 4200,
    }, null, 2),
    rateLimit: 30,
    tier: 'free',
  },
  {
    path: '/api/v1/ws/stream',
    method: 'GET',
    description: 'WebSocket endpoint for real-time market data streaming. Upgrade connection to WSS.',
    parameters: [
      { name: 'channels', type: 'string', required: true, description: 'Comma-separated channels: prices, indices, alerts, trades' },
      { name: 'symbols', type: 'string', required: false, description: 'Card IDs or index symbols to subscribe' },
    ],
    responseExample: JSON.stringify({
      type: 'price_update',
      channel: 'prices',
      data: { card_id: 'c_001', price: 4260.00, timestamp: '2026-03-12T14:30:01.234Z' },
    }, null, 2),
    rateLimit: 1,
    tier: 'enterprise',
  },
  {
    path: '/api/v1/batch/valuations',
    method: 'POST',
    description: 'Submit a batch of cards for AI-powered valuation. Returns job ID for async polling.',
    parameters: [
      { name: 'cards', type: 'object[]', required: true, description: 'Array of card descriptors {player, year, set, grade}' },
      { name: 'include_comps', type: 'boolean', required: false, description: 'Include comparable sales in response' },
    ],
    responseExample: JSON.stringify({
      job_id: 'batch_val_001',
      cards_submitted: 25,
      estimated_seconds: 30,
      poll_url: '/api/v1/batch/valuations/batch_val_001',
    }, null, 2),
    rateLimit: 5,
    tier: 'enterprise',
  },
];

// ---- Available Webhook Events ----

export const WEBHOOK_EVENTS = [
  'price.change',
  'price.spike',
  'price.drop',
  'portfolio.update',
  'card.added',
  'card.removed',
  'card.sold',
  'card.graded',
  'market.index.update',
  'market.movers',
  'alert.triggered',
  'export.complete',
];

// ---- Public API ----

export function getAPIKeys(): APIKey[] {
  const stored = loadFromStorage<APIKey[] | null>(STORAGE_KEYS.apiKeys, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seedAPIKeys();
  saveToStorage(STORAGE_KEYS.apiKeys, seeded);
  return seeded;
}

export function createAPIKey(name: string, tier: APIKey['tier']): APIKey {
  const keys = getAPIKeys();
  const rawKey = generateAPIKeyString();
  const newKey: APIKey = {
    id: generateId(),
    name,
    key: maskKey(rawKey),
    tier,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    requestsToday: 0,
    requestsLimit: tier === 'enterprise' ? 50_000 : tier === 'pro' ? 10_000 : 500,
    status: 'active',
  };
  keys.push(newKey);
  saveToStorage(STORAGE_KEYS.apiKeys, keys);
  return newKey;
}

export function revokeAPIKey(keyId: string): APIKey[] {
  const keys = getAPIKeys().map(k =>
    k.id === keyId ? { ...k, status: 'revoked' as const } : k
  );
  saveToStorage(STORAGE_KEYS.apiKeys, keys);
  return keys;
}

export function getEndpointDocs(): APIEndpoint[] {
  return ENDPOINT_DOCS;
}

export function getWebhooks(): WebhookConfig[] {
  const stored = loadFromStorage<WebhookConfig[] | null>(STORAGE_KEYS.webhooks, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seedWebhooks();
  saveToStorage(STORAGE_KEYS.webhooks, seeded);
  return seeded;
}

export function createWebhook(config: { name: string; url: string; events: string[] }): WebhookConfig {
  const webhooks = getWebhooks();
  const newHook: WebhookConfig = {
    id: generateId(),
    name: config.name,
    url: config.url,
    events: config.events,
    secret: 'whsec_' + Math.random().toString(36).slice(2, 18),
    status: 'active',
    lastTriggered: null,
    failureCount: 0,
  };
  webhooks.push(newHook);
  saveToStorage(STORAGE_KEYS.webhooks, webhooks);
  return newHook;
}

export function updateWebhookStatus(webhookId: string, status: WebhookConfig['status']): WebhookConfig[] {
  const webhooks = getWebhooks().map(w =>
    w.id === webhookId ? { ...w, status } : w
  );
  saveToStorage(STORAGE_KEYS.webhooks, webhooks);
  return webhooks;
}

export function deleteWebhook(webhookId: string): WebhookConfig[] {
  const webhooks = getWebhooks().filter(w => w.id !== webhookId);
  saveToStorage(STORAGE_KEYS.webhooks, webhooks);
  return webhooks;
}

export function testWebhook(_webhookId: string): { success: boolean; statusCode: number; latency: number } {
  // Simulated test
  const success = Math.random() > 0.15;
  return {
    success,
    statusCode: success ? 200 : 500,
    latency: Math.floor(80 + Math.random() * 200),
  };
}

export function getAPIUsage(days: number = 30): APIUsage[] {
  const cacheKey = STORAGE_KEYS.usage + '_' + days;
  const stored = loadFromStorage<APIUsage[] | null>(cacheKey, null);
  if (stored && stored.length === days) return stored;
  const data = generateUsageData(days);
  saveToStorage(cacheKey, data);
  return data;
}

export function createExportJob(format: ExportJob['format'], dataType: ExportJob['dataType']): ExportJob {
  const history = getExportHistory();
  const job: ExportJob = {
    id: generateId(),
    format,
    dataType,
    status: 'processing',
    createdAt: new Date().toISOString(),
    completedAt: null,
    downloadUrl: null,
    fileSize: null,
  };
  history.unshift(job);
  saveToStorage(STORAGE_KEYS.exports, history);

  // Simulate async completion
  setTimeout(() => {
    const updated = loadFromStorage<ExportJob[]>(STORAGE_KEYS.exports, []);
    const idx = updated.findIndex(e => e.id === job.id);
    if (idx >= 0) {
      updated[idx].status = 'complete';
      updated[idx].completedAt = new Date().toISOString();
      updated[idx].downloadUrl = `/exports/${dataType}_${Date.now()}.${format}`;
      updated[idx].fileSize = Math.floor(50_000 + Math.random() * 500_000);
      saveToStorage(STORAGE_KEYS.exports, updated);
    }
  }, 2000 + Math.random() * 3000);

  return job;
}

export function getExportHistory(): ExportJob[] {
  const stored = loadFromStorage<ExportJob[] | null>(STORAGE_KEYS.exports, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seedExportHistory();
  saveToStorage(STORAGE_KEYS.exports, seeded);
  return seeded;
}

export function getAPIPlatformStats(): APIPlatformStats {
  const keys = getAPIKeys();
  const usage = getAPIUsage(30);
  const webhooks = getWebhooks();
  const exports = getExportHistory();

  const totalRequests = usage.reduce((sum, d) => sum + d.requests, 0);
  const avgLatency = usage.length > 0
    ? Math.round(usage.reduce((sum, d) => sum + d.avgLatency, 0) / usage.length)
    : 0;

  return {
    totalKeys: keys.filter(k => k.status === 'active').length,
    totalRequests,
    avgLatency,
    uptime: 99.97,
    webhooksConfigured: webhooks.filter(w => w.status === 'active').length,
    exportsGenerated: exports.filter(e => e.status === 'complete').length,
  };
}
