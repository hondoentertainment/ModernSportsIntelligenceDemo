import React, { useMemo } from 'react';
import { KeyRound, ChevronRight, Activity, Webhook, Gauge } from 'lucide-react';
import { getAPIKeys, getWebhooks, getUsageMetrics } from '../lib/utils/apiLicensingService';

interface ApiLicensingWidgetProps {
  onClick?: () => void;
}

export const ApiLicensingWidget: React.FC<ApiLicensingWidgetProps> = ({ onClick }) => {
  const keys = useMemo(() => getAPIKeys(), []);
  const webhooks = useMemo(() => getWebhooks(), []);
  const usage = useMemo(() => getUsageMetrics(), []);

  const activeKeys = keys.filter(k => k.status === 'active');
  const todayRequests = activeKeys.reduce((sum, k) => sum + k.requestsToday, 0);
  const todayQuota = activeKeys.reduce((sum, k) => sum + k.quotaDaily, 0);
  const quotaPct = todayQuota > 0 ? Math.round((todayRequests / todayQuota) * 100) : 0;
  const activeWebhooks = webhooks.filter(w => w.status === 'active').length;
  const latestUsage = usage.length > 0 ? usage[usage.length - 1] : null;
  const avgLatency = latestUsage ? latestUsage.avgLatencyMs : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-400">
            <KeyRound size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              API & Data <span className="text-lime-400">Licensing</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Keys, quotas & webhook management
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Activity size={14} className="mx-auto text-lime-400 mb-1" />
          <p className="text-lg font-bold text-white">{todayRequests.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Calls Today</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Webhook size={14} className="mx-auto text-cyan-400 mb-1" />
          <p className="text-lg font-bold text-white">{activeWebhooks}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Webhooks</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Gauge size={14} className="mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-bold text-white">{avgLatency}ms</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Latency</p>
        </div>
      </div>

      {/* Quota Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Daily Quota Usage</span>
          <span className="text-white font-semibold">{quotaPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              quotaPct > 85 ? 'bg-red-500' : quotaPct > 60 ? 'bg-amber-500' : 'bg-lime-500'
            }`}
            style={{ width: `${Math.min(quotaPct, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-600">
          {todayRequests.toLocaleString()} / {todayQuota.toLocaleString()} requests
        </p>
      </div>
    </button>
  );
};

export default ApiLicensingWidget;
