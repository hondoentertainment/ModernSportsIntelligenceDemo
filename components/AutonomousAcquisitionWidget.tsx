// Phase 112: AI Deal Negotiation Agent — Dashboard Widget
import React, { useMemo } from 'react';
import {
  Bot, Target, DollarSign, MessageSquare,
  ChevronRight, Zap, Play,
} from 'lucide-react';
import {
  getActiveCampaigns,
  getAgentActivityFeed,
  getAcquisitionAnalytics,
  CampaignStatus,
} from '../lib/autonomousAcquisitionService';

interface AutonomousAcquisitionWidgetProps {
  onOpenModal?: () => void;
}

const STATUS_DOT: Record<CampaignStatus, string> = {
  active: 'bg-emerald-400 animate-pulse',
  paused: 'bg-amber-400',
  completed: 'bg-blue-400',
  failed: 'bg-red-400',
  pending_review: 'bg-purple-400 animate-pulse',
};

const ACTION_ICON_CLS: Record<string, string> = {
  scan: 'text-blue-400',
  found: 'text-emerald-400',
  analyze: 'text-purple-400',
  offer: 'text-amber-400',
  counter_received: 'text-orange-400',
  counter_sent: 'text-lime-400',
  accepted: 'text-emerald-400',
  rejected: 'text-red-400',
  escrow: 'text-cyan-400',
  completed: 'text-emerald-400',
  alert: 'text-red-400',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const AutonomousAcquisitionWidget: React.FC<AutonomousAcquisitionWidgetProps> = ({ onOpenModal }) => {
  const campaigns = useMemo(() => getActiveCampaigns(), []);
  const activity = useMemo(() => getAgentActivityFeed().slice(0, 2), []);
  const analytics = useMemo(() => getAcquisitionAnalytics(), []);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const negotiating = campaigns.reduce((sum, c) => sum + c.negotiationsActive, 0);

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Acquisition <span className="text-violet-400">Agent</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Autonomous deal negotiation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeCampaigns.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
              <Play size={10} />
              {activeCampaigns.length} active
            </div>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Target size={12} className="text-violet-400" />
          <span className="text-slate-400 font-medium">Campaigns:</span>
          <span className="font-bebas text-lg text-white tracking-wider">{campaigns.length}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <MessageSquare size={12} className="text-amber-400" />
          <span className="text-slate-400 font-medium">Negotiating:</span>
          <span className="font-bebas text-lg text-amber-400 tracking-wider">{negotiating}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <DollarSign size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Saved:</span>
          <span className="font-mono text-emerald-400">${analytics.totalSaved.toLocaleString()}</span>
        </div>
      </div>

      {/* Campaign Status Indicators */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
          <Target size={10} className="text-violet-400" />
          Active Campaigns
        </p>
        <div className="space-y-1.5">
          {activeCampaigns.slice(0, 3).map(c => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT[c.status]}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate block">{c.name}</span>
                <span className="text-[10px] text-slate-500">
                  {c.listingsFound} found &middot; {c.negotiationsActive} negotiating &middot; {c.acquisitions} acquired
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${c.progressPct}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">{c.progressPct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Activity */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-1.5">
          <Zap size={10} className="text-violet-400" />
          Latest Agent Activity
        </p>
        <div className="space-y-1.5">
          {activity.map(a => (
            <div
              key={a.id}
              className="flex items-start gap-2.5 p-2.5 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <Bot size={14} className={ACTION_ICON_CLS[a.actionType] || 'text-slate-400'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{a.campaignName} &middot; {timeAgo(a.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Savings Badge */}
      <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Savings Achieved</p>
          <p className="text-2xl font-bebas tracking-wider text-emerald-400">${analytics.totalSaved.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">Avg Discount</p>
          <p className="text-lg font-bold text-emerald-400">{analytics.avgDiscountPct}%</p>
        </div>
      </div>

      {/* New Campaign CTA */}
      <button
        onClick={onOpenModal}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        <Bot size={16} />
        New Campaign
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default AutonomousAcquisitionWidget;
