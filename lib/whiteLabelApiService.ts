/**
 * White-Label & API Access Service
 * Enterprise API management with key provisioning, rate limiting, webhooks, and usage analytics.
 */

export type ApiPlan = 'starter' | 'professional' | 'enterprise' | 'unlimited';
export type EndpointCategory = 'portfolio' | 'market-data' | 'analytics' | 'trading' | 'grading' | 'social' | 'ai';
export type WebhookEvent = 'price-alert' | 'trade-executed' | 'grade-returned' | 'portfolio-update' | 'anomaly-detected';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  lastUsed: string;
  status: 'active' | 'revoked' | 'expired';
  permissions: EndpointCategory[];
  rateLimit: number;
  requestsToday: number;
  requestsThisMonth: number;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: EndpointCategory;
  description: string;
  rateLimit: number;
  avgLatency: number;
  callsToday: number;
  status: 'operational' | 'degraded' | 'down';
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'paused' | 'failing';
  successRate: number;
  lastTriggered: string;
  totalDeliveries: number;
  failedDeliveries: number;
}

export interface WhiteLabelConfig {
  id: string;
  brandName: string;
  domain: string;
  logoUrl: string;
  primaryColor: string;
  status: 'active' | 'setup' | 'suspended';
  monthlyActiveUsers: number;
  apiCallsThisMonth: number;
  plan: ApiPlan;
}

export interface ApiUsageMetric {
  date: string;
  calls: number;
  errors: number;
  avgLatency: number;
  uniqueKeys: number;
}

export interface ApiStats {
  totalApiKeys: number;
  activeKeys: number;
  totalCallsToday: number;
  totalCallsThisMonth: number;
  avgLatency: number;
  errorRate: number;
  webhooksActive: number;
  whiteLabelInstances: number;
  plan: ApiPlan;
  monthlyLimit: number;
  usagePercent: number;
}

function getApiKeys(): ApiKey[] {
  return [
    {
      id: 'ak-1', name: 'Production — Main App', keyPrefix: 'msi_live_a3f2...', createdDate: '2025-06-01',
      lastUsed: '2m ago', status: 'active', permissions: ['portfolio', 'market-data', 'analytics', 'trading'],
      rateLimit: 1000, requestsToday: 4521, requestsThisMonth: 142800,
    },
    {
      id: 'ak-2', name: 'Analytics Dashboard', keyPrefix: 'msi_live_b7e1...', createdDate: '2025-08-15',
      lastUsed: '15m ago', status: 'active', permissions: ['market-data', 'analytics'],
      rateLimit: 500, requestsToday: 1230, requestsThisMonth: 38400,
    },
    {
      id: 'ak-3', name: 'Mobile App', keyPrefix: 'msi_live_c9d4...', createdDate: '2025-10-01',
      lastUsed: '5m ago', status: 'active', permissions: ['portfolio', 'market-data', 'trading', 'grading'],
      rateLimit: 750, requestsToday: 2890, requestsThisMonth: 95200,
    },
    {
      id: 'ak-4', name: 'Test Environment', keyPrefix: 'msi_test_x1y2...', createdDate: '2025-06-01',
      lastUsed: '2d ago', status: 'active', permissions: ['portfolio', 'market-data', 'analytics', 'trading', 'grading', 'social', 'ai'],
      rateLimit: 100, requestsToday: 45, requestsThisMonth: 890,
    },
    {
      id: 'ak-5', name: 'Legacy Integration', keyPrefix: 'msi_live_d5f8...', createdDate: '2025-03-01',
      lastUsed: '30d ago', status: 'revoked', permissions: ['portfolio'],
      rateLimit: 200, requestsToday: 0, requestsThisMonth: 0,
    },
  ];
}

function getApiEndpoints(): ApiEndpoint[] {
  return [
    { method: 'GET', path: '/api/v1/portfolio', category: 'portfolio', description: 'Retrieve portfolio holdings with current valuations', rateLimit: 100, avgLatency: 45, callsToday: 1850, status: 'operational' },
    { method: 'GET', path: '/api/v1/portfolio/nav', category: 'portfolio', description: 'Get current NAV and P/L breakdown', rateLimit: 200, avgLatency: 28, callsToday: 3200, status: 'operational' },
    { method: 'GET', path: '/api/v1/market/prices', category: 'market-data', description: 'Real-time card pricing across platforms', rateLimit: 500, avgLatency: 120, callsToday: 8900, status: 'operational' },
    { method: 'GET', path: '/api/v1/market/comps', category: 'market-data', description: 'Recent comparable sales data', rateLimit: 300, avgLatency: 85, callsToday: 2100, status: 'operational' },
    { method: 'POST', path: '/api/v1/analytics/valuation', category: 'analytics', description: 'AI-powered card valuation estimate', rateLimit: 50, avgLatency: 350, callsToday: 420, status: 'operational' },
    { method: 'GET', path: '/api/v1/analytics/trends', category: 'analytics', description: 'Market trend analysis and signals', rateLimit: 100, avgLatency: 180, callsToday: 780, status: 'operational' },
    { method: 'POST', path: '/api/v1/trading/order', category: 'trading', description: 'Submit buy/sell order', rateLimit: 20, avgLatency: 95, callsToday: 45, status: 'operational' },
    { method: 'GET', path: '/api/v1/grading/lookup', category: 'grading', description: 'Cert number lookup and verification', rateLimit: 200, avgLatency: 65, callsToday: 1200, status: 'operational' },
    { method: 'POST', path: '/api/v1/ai/predict-grade', category: 'ai', description: 'AI grade prediction from image', rateLimit: 30, avgLatency: 800, callsToday: 85, status: 'degraded' },
  ];
}

function getWebhooks(): WebhookConfig[] {
  return [
    { id: 'wh-1', url: 'https://app.firm.com/webhooks/msi', events: ['price-alert', 'trade-executed', 'anomaly-detected'], status: 'active', successRate: 99.2, lastTriggered: '5m ago', totalDeliveries: 4520, failedDeliveries: 36 },
    { id: 'wh-2', url: 'https://slack.com/api/webhooks/T0X...', events: ['price-alert', 'anomaly-detected'], status: 'active', successRate: 98.8, lastTriggered: '20m ago', totalDeliveries: 1890, failedDeliveries: 23 },
    { id: 'wh-3', url: 'https://legacy.firm.com/hooks/grade', events: ['grade-returned'], status: 'failing', successRate: 45.0, lastTriggered: '2d ago', totalDeliveries: 120, failedDeliveries: 66 },
  ];
}

function getWhiteLabelInstances(): WhiteLabelConfig[] {
  return [
    { id: 'wl-1', brandName: 'Elite Cards Pro', domain: 'app.elitecardspro.com', logoUrl: '/logos/ecp.svg', primaryColor: '#3b82f6', status: 'active', monthlyActiveUsers: 2400, apiCallsThisMonth: 185000, plan: 'enterprise' },
    { id: 'wl-2', brandName: 'Collector Central', domain: 'platform.collectorcentral.io', logoUrl: '/logos/cc.svg', primaryColor: '#10b981', status: 'active', monthlyActiveUsers: 890, apiCallsThisMonth: 62000, plan: 'professional' },
    { id: 'wl-3', brandName: 'Draft Kings Cards', domain: 'cards.dkpartner.com', logoUrl: '/logos/dk.svg', primaryColor: '#f59e0b', status: 'setup', monthlyActiveUsers: 0, apiCallsThisMonth: 450, plan: 'enterprise' },
  ];
}

function getUsageHistory(): ApiUsageMetric[] {
  return [
    { date: '2026-03-11', calls: 28500, errors: 142, avgLatency: 95, uniqueKeys: 4 },
    { date: '2026-03-12', calls: 31200, errors: 98, avgLatency: 88, uniqueKeys: 4 },
    { date: '2026-03-13', calls: 29800, errors: 125, avgLatency: 102, uniqueKeys: 3 },
    { date: '2026-03-14', calls: 35400, errors: 210, avgLatency: 115, uniqueKeys: 4 },
    { date: '2026-03-15', calls: 22100, errors: 65, avgLatency: 78, uniqueKeys: 3 },
    { date: '2026-03-16', calls: 18900, errors: 48, avgLatency: 72, uniqueKeys: 2 },
    { date: '2026-03-17', calls: 8641, errors: 32, avgLatency: 92, uniqueKeys: 4 },
  ];
}

function getApiStats(): ApiStats {
  return {
    totalApiKeys: 5,
    activeKeys: 4,
    totalCallsToday: 8641,
    totalCallsThisMonth: 277290,
    avgLatency: 92,
    errorRate: 0.4,
    webhooksActive: 2,
    whiteLabelInstances: 3,
    plan: 'enterprise',
    monthlyLimit: 500000,
    usagePercent: 55,
  };
}

function getPlanColor(plan: ApiPlan): string {
  const colors: Record<ApiPlan, string> = {
    starter: 'text-slate-400 bg-slate-500/10',
    professional: 'text-blue-400 bg-blue-500/10',
    enterprise: 'text-amber-400 bg-amber-500/10',
    unlimited: 'text-emerald-400 bg-emerald-500/10',
  };
  return colors[plan];
}

export {
  getApiKeys,
  getApiEndpoints,
  getWebhooks,
  getWhiteLabelInstances,
  getUsageHistory,
  getApiStats,
  getPlanColor,
};
