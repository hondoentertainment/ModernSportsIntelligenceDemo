import React, { useState, useEffect, useMemo } from 'react';
import { KeyRound, Activity, Webhook, Gauge, AlertTriangle, Code, Shield } from 'lucide-react';
import {
  getAPIKeys,
  getUsageMetrics,
  getEndpointCatalog,
  getWebhooks,
  getEmbedWidgets,
  getTierPricing,
  getAPIRequests,
  type APIKey,
  type UsageMetrics,
  type APIEndpoint,
  type WebhookConfig,
  type EmbedWidget,
  type TierPricing,
  type APIRequest,
} from '../lib/apiLicensingService.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ApiLicensing: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<UsageMetrics[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [widgets, setWidgets] = useState<EmbedWidget[]>([]);
  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    try {
      setApiKeys(getAPIKeys());
      setUsage(getUsageMetrics());
      setEndpoints(getEndpointCatalog());
      setWebhooks(getWebhooks());
      setWidgets(getEmbedWidgets());
      setPricing(getTierPricing());
      setRequests(getAPIRequests());
      setLoading(false);
    } catch {
      setError('Failed to load API licensing data');
      setLoading(false);
    }
  }, []);

  const totalRequestsToday = useMemo(
    () => apiKeys.reduce((sum, k) => sum + k.requestsToday, 0),
    [apiKeys]
  );
  const totalRequestsMonth = useMemo(
    () => apiKeys.reduce((sum, k) => sum + k.requestsThisMonth, 0),
    [apiKeys]
  );
  const avgLatency = useMemo(() => {
    if (usage.length === 0) return 0;
    return Math.round(usage.reduce((sum, u) => sum + u.avgLatencyMs, 0) / usage.length);
  }, [usage]);
  const errorRate = useMemo(() => {
    if (usage.length === 0) return 0;
    const totalReq = usage.reduce((s, u) => s + u.requests, 0);
    const totalErr = usage.reduce((s, u) => s + u.errors, 0);
    return totalReq > 0 ? ((totalErr / totalReq) * 100).toFixed(2) : '0.00';
  }, [usage]);

  const categories = useMemo(
    () => Array.from(new Set(endpoints.map((e) => e.category))),
    [endpoints]
  );
  const filteredEndpoints = useMemo(
    () => (selectedCategory ? endpoints.filter((e) => e.category === selectedCategory) : endpoints),
    [selectedCategory, endpoints]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading API &amp; Data Licensing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <KeyRound size={24} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">API &amp; Data Licensing</h1>
          <p className="text-sm text-slate-400">
            Key management, usage metering, webhooks &amp; embeddable widgets &mdash; Phase 122
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Requests Today</p>
          <p className="text-3xl font-bold text-cyan-400">{totalRequestsToday.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-1">{apiKeys.length} active keys</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Monthly Requests</p>
          <p className="text-3xl font-bold text-blue-400">{(totalRequestsMonth / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-600 mt-1">across all keys</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Latency</p>
          <p className="text-3xl font-bold text-emerald-400">{avgLatency}ms</p>
          <p className="text-xs text-slate-600 mt-1">14-day average</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Error Rate</p>
          <p className="text-3xl font-bold text-amber-400">{errorRate}%</p>
          <p className="text-xs text-slate-600 mt-1">14-day average</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Webhooks</p>
          <p className="text-3xl font-bold text-purple-400">{webhooks.length}</p>
          <p className="text-xs text-slate-600 mt-1">{webhooks.filter((w) => w.status === 'active').length} active</p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          14-Day Usage Metrics
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usage}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="requests" stroke="#22d3ee" strokeWidth={2} fill="url(#usageGrad)" name="Requests" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* API Keys & Webhooks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Keys */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <KeyRound size={18} className="text-cyan-400" />
            API Keys
          </h2>
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{key.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      key.tier === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                      key.tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{key.tier}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    key.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>{key.status}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mb-2">{key.keyMasked}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Today: {key.requestsToday.toLocaleString()} / {key.quotaDaily.toLocaleString()}</span>
                  <span>Month: {key.requestsThisMonth.toLocaleString()} / {key.quotaMonthly.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2">
                  <div
                    className={`h-full rounded-full ${
                      key.requestsToday / key.quotaDaily > 0.8 ? 'bg-red-500' :
                      key.requestsToday / key.quotaDaily > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (key.requestsToday / key.quotaDaily) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Webhook size={18} className="text-purple-400" />
            Webhook Orchestration
          </h2>
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                wh.status === 'active' ? 'border-emerald-500/30' :
                wh.status === 'failed' ? 'border-red-500/30' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-white">{wh.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    wh.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    wh.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{wh.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate mb-1">{wh.url}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {wh.events.map((ev) => (
                    <span key={ev} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">{ev}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600">
                  Retry: {wh.retryPolicy} &bull; Failures: {wh.failureCount}
                  {wh.lastTriggered && ` \u2022 Last: ${new Date(wh.lastTriggered).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Endpoint Catalog */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Gauge size={18} className="text-brand-lime" />
          API Endpoint Catalog
        </h2>
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              !selectedCategory ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >All</button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedCategory === cat ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredEndpoints.map((ep) => (
            <div key={ep.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  ep.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                  ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                  ep.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>{ep.method}</span>
                <span className="text-xs font-mono text-white">{ep.path}</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${
                  ep.tierRequired === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                  ep.tierRequired === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{ep.tierRequired}</span>
              </div>
              <p className="text-[10px] text-slate-400">{ep.description}</p>
              <p className="text-[10px] text-slate-600 mt-1">Rate: {ep.rateLimit}/min &bull; Cache: {ep.cacheTTL}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Pricing & Embeddable Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Pricing */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-amber-400" />
            Tier Pricing
          </h2>
          <div className="space-y-4">
            {pricing.map((tier) => (
              <div key={tier.tier} className={`bg-slate-900/50 border rounded-xl p-4 ${
                tier.tier === 'enterprise' ? 'border-amber-500/30' :
                tier.tier === 'pro' ? 'border-blue-500/20' : 'border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{tier.name}</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {tier.monthlyPrice === 0 ? 'Free' : `$${tier.monthlyPrice}/mo`}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">
                  {tier.limits.requestsPerDay.toLocaleString()} req/day &bull; {tier.supportLevel} support &bull; SLA: {tier.sla}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tier.features.slice(0, 4).map((f) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">{f}</span>
                  ))}
                  {tier.features.length > 4 && (
                    <span className="text-[10px] text-slate-600">+{tier.features.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embeddable Widgets */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Code size={18} className="text-blue-400" />
            Embeddable Widgets
          </h2>
          <div className="space-y-3">
            {widgets.map((w) => (
              <div key={w.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{w.label}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    w.tierRequired === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{w.tierRequired}+</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{w.description}</p>
                <div className="bg-slate-800 rounded-lg p-2">
                  <code className="text-[10px] text-cyan-400 break-all">{w.embedCode.slice(0, 80)}...</code>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                  <span>{w.customizable ? 'Customizable' : 'Fixed layout'}</span>
                  <span>&bull;</span>
                  <span>{w.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiLicensing;
