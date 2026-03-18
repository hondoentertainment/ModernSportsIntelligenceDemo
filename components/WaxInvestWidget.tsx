import React, { useMemo } from 'react';
import {
  Package,
  TrendingUp,
  ChevronRight,
  Calendar,
  Award,
} from 'lucide-react';
import {
  getWaxPortfolio,
  getReleaseCalendar,
  getWaxROILeaderboard,
  WaxPortfolioEntryWithValue,
} from '../lib/utils/waxInvestService';

interface WaxInvestWidgetProps {
  onClick?: () => void;
}

export const WaxInvestWidget: React.FC<WaxInvestWidgetProps> = ({ onClick }) => {
  const portfolio = useMemo(() => getWaxPortfolio(), []);
  const leaderboard = useMemo(() => getWaxROILeaderboard(portfolio), [portfolio]);
  const calendar = useMemo(() => getReleaseCalendar(), []);

  const totalValue = useMemo(
    () => portfolio.reduce((sum, e) => sum + e.currentTotalValue, 0),
    [portfolio]
  );
  const totalCost = useMemo(
    () => portfolio.reduce((sum, e) => sum + e.totalCost, 0),
    [portfolio]
  );
  const totalROI = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  const topPerformer: WaxPortfolioEntryWithValue | null = leaderboard.length > 0 ? leaderboard[0] : null;
  const nextRelease = calendar.length > 0 ? calendar[0] : null;

  const nextReleaseDays = nextRelease
    ? Math.ceil((new Date(nextRelease.releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Package size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Sealed Wax <span className="text-blue-400">Tracker</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Investment portfolio & analysis
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Portfolio Value + ROI */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Portfolio Value
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {portfolio.length > 0
              ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : '$0'}
          </p>
        </div>
        <div className="h-10 w-px bg-slate-700" />
        <div className="flex-1 text-right">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Total ROI
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${totalROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
          <Award size={14} className="text-brand-lime flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Top:</span>
          <span className="text-xs text-white font-medium truncate">
            {topPerformer.product.name}
          </span>
          <span className={`ml-auto text-xs font-bold flex-shrink-0 ${
            topPerformer.roi >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {topPerformer.roi >= 0 ? '+' : ''}{topPerformer.roi.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Next Release */}
      {nextRelease && (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <Calendar size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Next:</span>
          <span className="text-xs text-white font-medium truncate">
            {nextRelease.name}
          </span>
          {nextReleaseDays !== null && (
            <span className="ml-auto text-xs font-bold text-purple-400 flex-shrink-0">
              {nextReleaseDays}d
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {portfolio.length === 0 && !nextRelease && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl">
          <TrendingUp size={14} className="text-slate-500" />
          <span className="text-xs text-slate-500">
            Track sealed wax investments and analyze hold vs. rip decisions
          </span>
        </div>
      )}
    </button>
  );
};

export default WaxInvestWidget;
