import React from 'react';
import { Shield, ChevronRight, Umbrella, TrendingDown, Calculator } from 'lucide-react';
import { getDerivativesStats } from '../lib/trading/derivativesDeskService';

interface DerivativesDeskWidgetProps {
  onOpenModal: () => void;
}

const DerivativesDeskWidget: React.FC<DerivativesDeskWidgetProps> = ({ onOpenModal }) => {
  const stats = getDerivativesStats();
  const isProtected = stats.portfolioCoverage > 0;

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <Shield size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Derivatives Desk</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Umbrella size={12} />
            <span>Portfolio Coverage</span>
          </div>
          <span className="text-sm font-bold text-slate-200">{stats.portfolioCoverage.toFixed(1)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calculator size={12} />
            <span>Insurance Cost</span>
          </div>
          <span className="text-sm font-medium text-slate-300">${stats.totalPremiumsPaid.toFixed(0)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingDown size={12} />
            <span>Saved by Hedging</span>
          </div>
          <span className="text-sm font-medium text-emerald-400">${stats.savedByHedging.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-700/30">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
            isProtected
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          }`}
        >
          <Shield size={9} />
          {isProtected ? 'Protected' : 'Exposed'}
        </span>
      </div>
    </div>
  );
};

export default DerivativesDeskWidget;
