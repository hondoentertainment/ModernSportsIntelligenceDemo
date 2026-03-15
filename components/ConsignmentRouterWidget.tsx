// Consignment Router Widget — compact dashboard card
import React, { useMemo } from 'react';
import { Route, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';
import { getConsignmentOptions } from '../lib/consignmentRouterService';

interface ConsignmentRouterWidgetProps {
  onOpenModal: () => void;
}

const ConsignmentRouterWidget: React.FC<ConsignmentRouterWidgetProps> = ({ onOpenModal }) => {
  const options = useMemo(() => getConsignmentOptions('Sample Card', 1000), []);
  const best = options[0] ?? null;
  const topFour = options.slice(0, 4);

  // Find max net proceeds for bar scaling
  const maxNet = useMemo(
    () => Math.max(...topFour.map(o => o.netProceeds), 1),
    [topFour],
  );

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-lime-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/20">
            <Route size={16} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Consignment Router</h3>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Best recommendation */}
      {best && (
        <div className="bg-slate-800/50 rounded-xl p-3 mb-3 border border-lime-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Best Platform</span>
            <span className="text-[10px] font-bold text-lime-400 bg-lime-500/20 px-1.5 py-0.5 rounded">
              SCORE {best.recommendationScore}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{best.platform.name}</span>
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                {best.netProceeds.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-slate-500">net</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {(best.sellThroughRate * 100).toFixed(0)}% sell-through &middot; ~{best.avgDaysToSell}d avg
          </p>
        </div>
      )}

      {/* Mini bar comparison */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Net Proceeds Comparison</p>
        {topFour.map((opt, i) => (
          <div key={opt.platform.id} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-14 truncate">{opt.platform.name.split(' ')[0]}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${i === 0 ? 'bg-lime-500' : 'bg-slate-600'}`}
                style={{ width: `${(opt.netProceeds / maxNet) * 100}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono font-bold ${i === 0 ? 'text-lime-400' : 'text-slate-400'}`}>
              ${opt.netProceeds.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{options.length}</p>
          <p className="text-[10px] text-slate-500">Platforms</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" />
            <p className="text-lg font-bold text-emerald-400">
              {best ? `${(best.sellThroughRate * 100).toFixed(0)}%` : '—'}
            </p>
          </div>
          <p className="text-[10px] text-slate-500">Best STR</p>
        </div>
      </div>
    </div>
  );
};

export default ConsignmentRouterWidget;
