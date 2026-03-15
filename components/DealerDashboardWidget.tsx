import React, { useMemo } from 'react';
import { Store, DollarSign, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { getTodaysSales, getActiveConsignmentCount, getDealerProfile } from '../lib/dealerDashboardService';

interface DealerDashboardWidgetProps {
  onClick?: () => void;
}

const DealerDashboardWidget: React.FC<DealerDashboardWidgetProps> = ({ onClick }) => {
  const todaySales = useMemo(() => getTodaysSales(), []);
  const activeConsignments = useMemo(() => getActiveConsignmentCount(), []);
  const profile = useMemo(() => getDealerProfile(), []);

  return (
    <div
      className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 cursor-pointer hover:border-brand-lime/30 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Store size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Dealer <span className="text-brand-lime">Dashboard</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              {profile.storeName} &middot; {profile.tier} tier
            </p>
          </div>
        </div>
        {onClick && (
          <button className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-brand-lime hover:bg-slate-700/50 transition-colors">
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Revenue */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Today&apos;s Revenue
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${todaySales.revenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            {todaySales.transactions} transaction{todaySales.transactions !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Margin */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Margin
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-green-400">
            {todaySales.marginPercent}%
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            ${todaySales.margin.toLocaleString()} profit
          </p>
        </div>

        {/* Active Consignments */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-amber-400" />
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
                Active Consignments
              </span>
            </div>
            <p className="text-xl font-bebas tracking-wider text-amber-400">
              {activeConsignments}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
        <span>Tap to manage inventory, customers &amp; analytics</span>
      </div>
    </div>
  );
};

export default DealerDashboardWidget;
