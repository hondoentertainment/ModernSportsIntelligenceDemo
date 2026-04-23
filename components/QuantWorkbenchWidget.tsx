// @ts-nocheck
import React, { useMemo } from 'react';
import { Code, ChevronRight, Play, FlaskConical } from 'lucide-react';
import { getSavedStrategies } from '../lib/utils/quantWorkbenchService';

interface QuantWorkbenchWidgetProps {
  onOpenModal: () => void;
}

const QuantWorkbenchWidget: React.FC<QuantWorkbenchWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => {
    const strategies = getSavedStrategies();
    const lastResult = strategies
      .filter(s => s.lastResult)
      .sort((a, b) => (b.lastRun || '').localeCompare(a.lastRun || ''))[0];

    let lastReturn: string | null = null;
    if (lastResult?.lastResult?.resultType === 'chart' && Array.isArray(lastResult.lastResult.output)) {
      const curve = lastResult.lastResult.output;
      if (curve.length >= 2) {
        const first = curve[0].value;
        const last = curve[curve.length - 1].value;
        lastReturn = ((last - first) / first * 100).toFixed(1);
      }
    }

    return {
      savedCount: strategies.length,
      lastReturn,
      lastStrategy: lastResult?.name || null,
    };
  }, []);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 hover:border-brand-lime/30 hover:bg-slate-900/80 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Code size={16} className="text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">Quant Workbench</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-lime transition-colors" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Saved Strategies</span>
          <span className="text-white font-mono font-bold">{stats.savedCount}</span>
        </div>

        {stats.lastReturn !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Last Backtest</span>
            <span className={`font-mono font-bold ${parseFloat(stats.lastReturn) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {parseFloat(stats.lastReturn) >= 0 ? '+' : ''}{stats.lastReturn}%
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-bold uppercase tracking-wider justify-center hover:bg-cyan-500/20 transition-colors">
            <Play size={10} />
            Run Strategy
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/60 border border-slate-600/40 rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <FlaskConical size={10} />
            {stats.savedCount > 0 ? stats.savedCount : '8'} Templates
          </div>
        </div>
      </div>
    </button>
  );
};

export default QuantWorkbenchWidget;
