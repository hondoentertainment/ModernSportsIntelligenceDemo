import React, { useMemo } from 'react';
import { PieChart, ChevronRight, TrendingUp, Award } from 'lucide-react';
import {
  getReturnAttribution,
  getAlphaBeta,
} from '../lib/portfolioAttributionService';

interface PortfolioAttributionWidgetProps {
  onOpenModal?: () => void;
}

export const PortfolioAttributionWidget: React.FC<PortfolioAttributionWidgetProps> = ({ onOpenModal }) => {
  const attribution = useMemo(() => getReturnAttribution('1m'), []);
  const alphaBeta = useMemo(() => getAlphaBeta(), []);

  const topFactor = useMemo(() => {
    const sorted = [...attribution.factors].sort((a, b) => b.contribution - a.contribution);
    return sorted[0];
  }, [attribution]);

  const factorLabel = topFactor.name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const isPositive = attribution.totalReturn >= 0;

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <PieChart size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attribution</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Current Month Return */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{attribution.totalReturn.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">this month</span>
        </div>
      </div>

      {/* Top Factor */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={12} className="text-emerald-400" />
        <span className="text-xs text-slate-400">
          Top driver: <span className="text-white font-medium">{factorLabel}</span>{' '}
          <span className="text-emerald-400">+{topFactor.contribution.toFixed(1)}%</span>
        </span>
      </div>

      {/* Alpha Badge */}
      {alphaBeta.alpha > 0 && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full">
          <Award size={12} className="text-lime-400" />
          <span className="text-xs font-bold text-lime-400">Alpha: +{alphaBeta.alpha.toFixed(1)}%</span>
        </div>
      )}

      {/* Factor mini bar */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden flex bg-slate-800">
        {attribution.factors
          .filter((f) => f.contribution > 0)
          .slice(0, 5)
          .map((f, i) => {
            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-cyan-500'];
            const width = Math.max(5, (f.contribution / attribution.totalReturn) * 100);
            return (
              <div
                key={f.name}
                className={`${colors[i] || 'bg-slate-500'} h-full`}
                style={{ width: `${width}%` }}
              />
            );
          })}
      </div>
    </button>
  );
};

export default PortfolioAttributionWidget;
