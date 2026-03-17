import React, { useState, useMemo } from 'react';
import {
  Code, Key, Globe, Webhook, Activity, Zap, BarChart3,
  Clock, AlertTriangle, CheckCircle, Shield, TrendingUp,
} from 'lucide-react';
import {
  getApiKeys,
  getApiEndpoints,
  getWebhooks,
  getWhiteLabelInstances,
  getUsageHistory,
  getApiStats,
  getPlanColor,
} from '../lib/whiteLabelApiService';

const WhiteLabelApi: React.FC = () => {
  const keys = useMemo(() => getApiKeys(), []);
  const endpoints = useMemo(() => getApiEndpoints(), []);
  const webhooks = useMemo(() => getWebhooks(), []);
  const whiteLabels = useMemo(() => getWhiteLabelInstances(), []);
  const usage = useMemo(() => getUsageHistory(), []);
  const stats = useMemo(() => getApiStats(), []);
  const [activeTab, setActiveTab] = useState<'keys' | 'endpoints' | 'webhooks' | 'whitelabel'>('keys');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Code size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">White-Label & API Access</h1>
              <p className="text-slate-400 text-sm">
                Enterprise API management with key provisioning, rate limiting, webhooks, and usage analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Key, color: 'text-cyan-400', label: 'Active Keys', value: stats.activeKeys },
            { icon: Activity, color: 'text-green-400', label: 'Calls Today', value: stats.totalCallsToday.toLocaleString() },
            { icon: Clock, color: 'text-blue-400', label: 'Avg Latency', value: `${stats.avgLatency}ms` },
            { icon: AlertTriangle, color: 'text-red-400', label: 'Error Rate', value: `${stats.errorRate}%` },
            { icon: Globe, color: 'text-purple-400', label: 'White Labels', value: stats.whiteLabelInstances },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Usage Bar */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase">Monthly Usage: {stats.totalCallsThisMonth.toLocaleString()} / {stats.monthlyLimit.toLocaleString()}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPlanColor(stats.plan)}`}>{stats.plan}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${stats.usagePercent > 80 ? 'bg-red-500' : stats.usagePercent > 60 ? 'bg-amber-500' : 'bg-cyan-500'}`}
              style={{ width: `${stats.usagePercent}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-1">{stats.usagePercent}% of monthly limit</p>
        </div>

        {/* Usage Sparkline */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">7-Day API Usage</h3>
          <div className="flex items-end gap-2 h-20">
            {usage.map((u, i) => {
              const max = Math.max(...usage.map(x => x.calls));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-cyan-500/30 rounded-t" style={{ height: `${(u.calls / max) * 100}%` }} />
                  <span className="text-slate-500 text-[9px]">{u.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['keys', 'endpoints', 'webhooks', 'whitelabel'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'keys' ? 'API Keys' : tab === 'endpoints' ? 'Endpoints' : tab === 'webhooks' ? 'Webhooks' : 'White-Label'}</button>
          ))}
        </div>

        {activeTab === 'keys' && (
          <div className="space-y-3">
            {keys.map(k => (
              <div key={k.id} className={`bg-slate-900 rounded-xl border p-5 ${k.status === 'revoked' ? 'border-red-500/30 opacity-60' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Key size={16} className={k.status === 'active' ? 'text-cyan-400' : 'text-red-400'} />
                    <span className="text-white font-semibold text-sm">{k.name}</span>
                    <code className="text-slate-500 text-xs font-mono">{k.keyPrefix}</code>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{k.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Rate: {k.rateLimit}/min</span>
                  <span>Today: {k.requestsToday.toLocaleString()}</span>
                  <span>Month: {k.requestsThisMonth.toLocaleString()}</span>
                  <span>Last used: {k.lastUsed}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {k.permissions.map(p => (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] capitalize">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-2">
            {endpoints.map((ep, i) => (
              <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    ep.method === 'GET' ? 'bg-green-500/10 text-green-400' :
                    ep.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                    ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{ep.method}</span>
                  <div>
                    <code className="text-white text-xs font-mono">{ep.path}</code>
                    <p className="text-slate-500 text-[10px]">{ep.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{ep.avgLatency}ms</span>
                  <span>{ep.callsToday.toLocaleString()}/day</span>
                  <span className={`w-2 h-2 rounded-full ${ep.status === 'operational' ? 'bg-green-400' : ep.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className={`bg-slate-900 rounded-xl border p-5 ${wh.status === 'failing' ? 'border-red-500/30' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Webhook size={16} className={wh.status === 'active' ? 'text-cyan-400' : wh.status === 'failing' ? 'text-red-400' : 'text-slate-400'} />
                    <code className="text-white text-xs font-mono">{wh.url}</code>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    wh.status === 'active' ? 'bg-green-500/10 text-green-400' : wh.status === 'failing' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>{wh.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Success: {wh.successRate}%</span>
                  <span>{wh.totalDeliveries} delivered ({wh.failedDeliveries} failed)</span>
                  <span>Last: {wh.lastTriggered}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {wh.events.map(e => <span key={e} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">{e}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'whitelabel' && (
          <div className="space-y-4">
            {whiteLabels.map(wl => (
              <div key={wl.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center" style={{ backgroundColor: wl.primaryColor + '20' }}>
                      <Globe size={16} style={{ color: wl.primaryColor }} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{wl.brandName}</h4>
                      <code className="text-slate-500 text-xs">{wl.domain}</code>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    wl.status === 'active' ? 'bg-green-500/10 text-green-400' : wl.status === 'setup' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  }`}>{wl.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{wl.monthlyActiveUsers.toLocaleString()} MAU</span>
                  <span>{wl.apiCallsThisMonth.toLocaleString()} API calls/mo</span>
                  <span className={`font-bold ${getPlanColor(wl.plan)}`}>{wl.plan}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteLabelApi;
