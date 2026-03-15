import React, { useMemo } from 'react';
import {
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
} from 'lucide-react';
import {
  getAllMentions,
  getSocialAlphaSignals,
  platformIcon,
  platformColor,
} from '../lib/influenceGraphService';

interface InfluenceGraphWidgetProps {
  onOpenModal?: () => void;
}

const InfluenceGraphWidget: React.FC<InfluenceGraphWidgetProps> = ({ onOpenModal }) => {
  const trendingMentions = useMemo(() => getAllMentions().slice(0, 3), []);
  const signals = useMemo(() => getSocialAlphaSignals(), []);
  const actionableSignals = signals.filter(s => s.isActionable);

  /* Exposure indicator — count of active mentions across all tracked cards */
  const exposedCards = useMemo(() => {
    const uniqueCards = new Set(trendingMentions.map(m => m.cardId));
    return uniqueCards.size;
  }, [trendingMentions]);

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
            Influence Graph
          </h3>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Trending Mentions */}
      <div className="space-y-3 mb-5">
        {trendingMentions.map((mention) => {
          const impactPct = ((mention.priceNow - mention.priceAtMention) / mention.priceAtMention) * 100;
          const isPositive = impactPct >= 0;

          return (
            <div
              key={mention.id}
              className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${platformColor(mention.platform)}`}>
                    {platformIcon(mention.platform)}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {mention.influencerName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {mention.cardName}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {isPositive ? (
                  <TrendingUp size={10} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={10} className="text-red-400" />
                )}
                <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{impactPct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={10} className="text-sky-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Exposure
            </span>
          </div>
          <span className="text-lg font-black text-slate-100">
            {exposedCards}
            <span className="text-[10px] text-slate-500 ml-1">cards</span>
          </span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={10} className="text-amber-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Signals
            </span>
          </div>
          <span className="text-lg font-black text-brand-lime">
            {actionableSignals.length}
            <span className="text-[10px] text-slate-500 ml-1">active</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfluenceGraphWidget;
