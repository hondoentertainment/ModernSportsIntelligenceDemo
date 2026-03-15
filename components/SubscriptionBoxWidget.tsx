import React, { useMemo } from 'react';
import {
  Box,
  ChevronRight,
  TrendingUp,
  Star,
  DollarSign,
} from 'lucide-react';
import {
  getMonthlyTrendData,
  compareProviders,
  getHitHistory,
  getBoxOpenings,
} from '../lib/subscriptionBoxService';

interface SubscriptionBoxWidgetProps {
  onClick?: () => void;
}

export const SubscriptionBoxWidget: React.FC<SubscriptionBoxWidgetProps> = ({ onClick }) => {
  const trendData = useMemo(() => getMonthlyTrendData(), []);
  const providers = useMemo(() => compareProviders(), []);
  const recentHits = useMemo(() => getHitHistory().slice(0, 3), []);
  const openings = useMemo(() => getBoxOpenings(), []);

  // Current month summary
  const currentMonth = useMemo(() => {
    if (trendData.length === 0) return null;
    return trendData[trendData.length - 1];
  }, [trendData]);

  // Best provider
  const bestProvider = useMemo(() => {
    return providers.length > 0 ? providers[0] : null;
  }, [providers]);

  // Overall stats
  const overallROI = useMemo(() => {
    const totalSpent = openings.reduce((s, o) => s + o.cost, 0);
    const totalValue = openings.reduce((s, o) => s + o.totalValue, 0);
    return totalSpent > 0 ? ((totalValue - totalSpent) / totalSpent) * 100 : 0;
  }, [openings]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Box size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Subscription Box <span className="text-brand-lime">Intelligence</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Hobby box subscription ROI tracker
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Current Month ROI */}
      {currentMonth && (
        <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex-1">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Current Month ROI
            </p>
            <p className="text-sm font-medium text-white">{currentMonth.month}</p>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1">
              <DollarSign size={12} className={currentMonth.profit >= 0 ? 'text-brand-lime' : 'text-red-400'} />
              <span className={`text-2xl font-bebas tracking-wider ${currentMonth.profit >= 0 ? 'text-brand-lime' : 'text-red-400'}`}>
                {currentMonth.roi >= 0 ? '+' : ''}{currentMonth.roi.toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              ${currentMonth.value.toLocaleString()} / ${currentMonth.spent.toLocaleString()} spent
            </p>
          </div>
        </div>
      )}

      {/* Best Provider + Overall ROI */}
      <div className="grid grid-cols-2 gap-3">
        {bestProvider && (
          <div className="p-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Top Provider
            </p>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-brand-lime flex-shrink-0" />
              <p className="text-xs text-white font-medium truncate">{bestProvider.displayName}</p>
            </div>
          </div>
        )}
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Overall ROI
          </p>
          <p className={`text-xl font-bebas tracking-wider ${overallROI >= 0 ? 'text-brand-lime' : 'text-red-400'}`}>
            {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Recent Notable Hits */}
      {recentHits.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Recent Notable Hits
          </p>
          {recentHits.map(hit => (
            <div key={hit.id} className="flex items-center gap-3 px-4 py-2.5 bg-green-500/5 border border-green-500/15 rounded-xl">
              <TrendingUp size={14} className="text-green-400 flex-shrink-0" />
              <span className="text-xs text-white font-medium truncate">
                {hit.player} - {hit.cardDescription}
              </span>
              <span className="ml-auto text-xs font-bold text-green-400 flex-shrink-0">
                ${hit.estimatedValue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
};

export default SubscriptionBoxWidget;
