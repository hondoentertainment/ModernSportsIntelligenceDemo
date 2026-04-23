// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Users,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  getTrendingMentions,
  getPumpDumpAlerts,
  getTopInfluencers,
  getContentEvents,
  formatFollowers,
} from '../lib/analytics/influencerImpactService';

interface InfluencerImpactWidgetProps {
  onOpenModal?: () => void;
}

const InfluencerImpactWidget: React.FC<InfluencerImpactWidgetProps> = ({ onOpenModal }) => {
  const trending = useMemo(() => getTrendingMentions(), []);
  const alerts = useMemo(() => getPumpDumpAlerts(), []);
  const influencers = useMemo(() => getTopInfluencers(), []);
  const _recentEvents = useMemo(() => getContentEvents({ limit: 5 }), []);

  const topMover = trending.length > 0
    ? trending.reduce((best, t) => t.price_change_pct > best.price_change_pct ? t : best, trending[0])
    : null;
  const mostReliable = influencers.length > 0
    ? influencers.reduce((best, i) => i.reliability_score > best.reliability_score ? i : best, influencers[0])
    : null;
  const activeAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div
      onClick={onOpenModal}
      className="bg-brand-slate rounded-[2.5rem] p-8 hover:border-brand-lime/30 border border-slate-700/50 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-lime/10">
            <Users size={18} className="text-brand-lime" />
          </div>
          <h3 className="font-bebas text-lg tracking-wider text-slate-100 uppercase">
            Influencer Impact
          </h3>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Trending Mentions */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={10} className="text-brand-lime" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Trending Today
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {trending.length} cards trending from influencer activity.
          {topMover && ` Top mover: ${topMover.card_name.split(' ').slice(-2).join(' ')} +${topMover.price_change_pct.toFixed(1)}%.`}
        </p>
      </div>

      {/* Most Reliable Influencer */}
      {mostReliable && (
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 mb-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={10} className="text-amber-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Most Reliable
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 mb-0.5">{mostReliable.name}</p>
          <p className="text-[10px] text-slate-500 truncate">
            {formatFollowers(mostReliable.followers)} followers &middot; {mostReliable.reliability_score}% reliability
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={10} className="text-emerald-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Mentions
            </span>
          </div>
          <span className="text-lg font-black text-brand-lime">
            {trending.reduce((sum, t) => sum + t.mention_count_24h, 0)}
          </span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Alerts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-red-400">
              {activeAlerts.length}
            </span>
            {activeAlerts.length > 0 && (
              <span className="text-[9px] font-black text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full border border-red-500/40">
                pump alerts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerImpactWidget;
