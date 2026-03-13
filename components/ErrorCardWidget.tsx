import React, { useMemo } from 'react';
import { AlertOctagon, ChevronRight, Search, Sparkles } from 'lucide-react';
import {
  getErrorCards,
  getErrorAlerts,
  getErrorCardStats,
  ERROR_TYPE_META,
  RARITY_META,
} from '../lib/errorCardService';

interface ErrorCardWidgetProps {
  onClick?: () => void;
}

export const ErrorCardWidget: React.FC<ErrorCardWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getErrorCardStats(), []);
  const alerts = useMemo(() => getErrorAlerts(), []);
  const cards = useMemo(() => getErrorCards(), []);

  // Find the card with the highest premium multiplier
  const topPremiumCard = useMemo(
    () => cards.reduce((best, c) => (c.premiumMultiplier > best.premiumMultiplier ? c : best), cards[0]),
    [cards]
  );

  // Most recent alert
  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  const criticalAlerts = alerts.filter(a => a.urgency === 'critical' || a.urgency === 'high').length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
            <AlertOctagon size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Error Card <span className="text-red-400">Intel</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              The hidden goldmine
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30">
          <Search size={14} />
          {stats.totalCataloged} cataloged
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
          <AlertOctagon size={14} />
          {criticalAlerts} alert{criticalAlerts !== 1 ? 's' : ''}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-purple-400">
          <Sparkles size={14} />
          {stats.recentDiscoveries} new
        </div>
      </div>

      {/* Top Premium Card */}
      {topPremiumCard && (
        <div className="p-4 bg-gradient-to-r from-amber-500/5 to-red-500/5 border border-amber-500/20 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
            Highest Premium
          </p>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">
                {topPremiumCard.year} {topPremiumCard.set} {topPremiumCard.player}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ERROR_TYPE_META[topPremiumCard.errorType].color} ${ERROR_TYPE_META[topPremiumCard.errorType].bg} border ${ERROR_TYPE_META[topPremiumCard.errorType].border}`}>
                  {ERROR_TYPE_META[topPremiumCard.errorType].label}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${RARITY_META[topPremiumCard.rarity].color} ${RARITY_META[topPremiumCard.rarity].bg} border ${RARITY_META[topPremiumCard.rarity].border}`}>
                  {RARITY_META[topPremiumCard.rarity].label}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-lg font-bebas tracking-wider text-amber-400">
                {topPremiumCard.premiumMultiplier.toLocaleString()}x
              </p>
              <p className="text-[10px] text-slate-500">
                ${topPremiumCard.errorValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Latest Alert */}
      {latestAlert && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-transparent rounded-xl">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
            latestAlert.urgency === 'critical' ? 'bg-red-400 animate-pulse' :
            latestAlert.urgency === 'high' ? 'bg-amber-400' :
            'bg-blue-400'
          }`} />
          <p className="text-xs text-slate-400 truncate flex-1">
            {latestAlert.message}
          </p>
        </div>
      )}
    </button>
  );
};

export default ErrorCardWidget;
