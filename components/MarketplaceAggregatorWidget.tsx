import React, { useMemo } from 'react';
import {
  ShoppingCart,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  getBestDeal,
  getRecentListings,
  getPlatformHealth,
  PlatformHealth,
} from '../lib/trading/marketplaceAggregatorService';

interface MarketplaceAggregatorWidgetProps {
  onClick?: () => void;
}

const STATUS_ICON: Record<PlatformHealth['status'], React.ReactNode> = {
  online: <CheckCircle size={10} className="text-emerald-400" />,
  degraded: <AlertTriangle size={10} className="text-amber-400" />,
  offline: <XCircle size={10} className="text-red-400" />,
};

const MarketplaceAggregatorWidget: React.FC<MarketplaceAggregatorWidgetProps> = ({ onClick }) => {
  const bestDeal = useMemo(() => getBestDeal(), []);
  const recentListings = useMemo(() => getRecentListings(5), []);
  const platformHealth = useMemo(() => getPlatformHealth(), []);

  const onlinePlatforms = platformHealth.filter(p => p.status === 'online').length;
  const totalListings = recentListings.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-700/50 rounded-[2.5rem] p-6 hover:border-lime-500/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lime-500/20">
            <ShoppingCart size={20} className="text-lime-400" />
          </div>
          <div>
            <h3 className="font-bebas text-lg text-white tracking-wide">Marketplace Aggregator</h3>
            <p className="text-[10px] text-slate-500 uppercase">Cross-Platform Deals</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Platform status row */}
      <div className="flex items-center gap-2 mb-4">
        {platformHealth.slice(0, 5).map(ph => (
          <div
            key={ph.platform}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800/70 rounded-lg border border-slate-700/40"
          >
            {STATUS_ICON[ph.status]}
            <span className={`text-[10px] font-semibold ${ph.color}`}>
              {ph.label}
            </span>
          </div>
        ))}
        {platformHealth.length > 5 && (
          <span className="text-[10px] text-slate-500">+{platformHealth.length - 5}</span>
        )}
      </div>

      {/* Best deal highlight */}
      {bestDeal && (
        <div className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-lime-400" />
            <span className="text-[10px] font-bold text-lime-400 uppercase">Best Deal Found</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{bestDeal.player}</p>
              <p className="text-[10px] text-slate-400">{bestDeal.cardDescription} &middot; {bestDeal.grade}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-lime-400">${bestDeal.askingPrice.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500">FMV ${bestDeal.fmvEstimate.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bestDeal.dealScore >= 70 ? 'bg-emerald-500' : bestDeal.dealScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${bestDeal.dealScore}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${bestDeal.dealScore >= 70 ? 'text-emerald-400' : bestDeal.dealScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {bestDeal.dealScore} Deal Score
            </span>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Platforms</p>
          <p className="text-sm font-bold text-emerald-400">{onlinePlatforms}/{platformHealth.length}</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Listings</p>
          <p className="text-sm font-bold text-slate-200">{totalListings}+</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 text-center border border-slate-700/40">
          <p className="text-[10px] text-slate-500 uppercase">Avg Score</p>
          <p className="text-sm font-bold text-amber-400">
            {recentListings.length > 0
              ? Math.round(recentListings.reduce((s, l) => s + l.dealScore, 0) / recentListings.length)
              : 0}
          </p>
        </div>
      </div>
    </button>
  );
};

export default MarketplaceAggregatorWidget;
