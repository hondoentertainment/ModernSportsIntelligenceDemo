import React, { useMemo } from 'react';
import { Briefcase, ChevronRight, TrendingUp, Shield } from 'lucide-react';
import {
  getUnifiedPortfolio,
  getCategoryAllocation,
  getDiversificationReport,
  getCategoryPerformance,
  getMockAlternativeAssets,
} from '../lib/utils/crossHobbyPortfolioService';

interface CrossHobbyPortfolioWidgetProps {
  onOpenModal?: () => void;
}

export const CrossHobbyPortfolioWidget: React.FC<CrossHobbyPortfolioWidgetProps> = ({ onOpenModal }) => {
  const portfolio = useMemo(() => getUnifiedPortfolio([], getMockAlternativeAssets()), []);
  const allocations = useMemo(() => getCategoryAllocation(portfolio), [portfolio]);
  const diversification = useMemo(() => getDiversificationReport(portfolio), [portfolio]);
  const performance = useMemo(() => getCategoryPerformance('1y'), []);

  const topPerformer = useMemo(() => {
    const sorted = [...performance].sort((a, b) => b.return1y - a.return1y);
    return sorted[0];
  }, [performance]);

  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  // Mini pie chart SVG
  const pieSlices = useMemo(() => {
    let cumulative = 0;
    return allocations.slice(0, 6).map((alloc) => {
      const startAngle = cumulative * 3.6; // 360 / 100
      cumulative += alloc.percentage;
      const endAngle = cumulative * 3.6;
      return { ...alloc, startAngle, endAngle };
    });
  }, [allocations]);

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number): string => {
    const startRad = ((startDeg - 90) * Math.PI) / 180;
    const endRad = ((endDeg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Diversification gauge
  const gaugeAngle = (diversification.score / 100) * 180;

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-lime-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-lime-500/10 rounded-lg">
            <Briefcase size={16} className="text-lime-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Cross-Hobby Portfolio</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Total AUM */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total AUM</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</span>
          <span className={`text-sm font-bold ${portfolio.totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {portfolio.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.totalGainLossPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Mini Allocation Pie */}
      <div className="flex items-center gap-4 mb-4">
        <svg viewBox="0 0 48 48" className="w-12 h-12 flex-shrink-0">
          {pieSlices.map((slice) => (
            <path
              key={slice.category}
              d={describeArc(24, 24, 22, slice.startAngle, slice.endAngle)}
              fill={slice.color}
              opacity={0.85}
            />
          ))}
          <circle cx="24" cy="24" r="10" fill="#0f172a" />
        </svg>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {allocations.slice(0, 4).map((alloc) => (
            <div key={alloc.category} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alloc.color }} />
              <span className="text-[10px] text-slate-400">{alloc.label}</span>
              <span className="text-[10px] font-bold text-slate-300">{alloc.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Diversification Score Gauge */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-8 flex-shrink-0">
          <svg viewBox="0 0 60 35" className="w-full h-full">
            <path
              d="M 5 30 A 25 25 0 0 1 55 30"
              fill="none"
              stroke="#334155"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 5 30 A 25 25 0 0 1 55 30"
              fill="none"
              stroke={diversification.score >= 70 ? '#84cc16' : diversification.score >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${(gaugeAngle / 180) * 78.5} 78.5`}
            />
            <text x="30" y="30" textAnchor="middle" className="fill-white text-[10px] font-bold">
              {diversification.score}
            </text>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-lime-400" />
            <span className="text-xs text-slate-400">Diversification</span>
          </div>
          <span className={`text-xs font-bold ${
            diversification.score >= 70 ? 'text-lime-400' :
            diversification.score >= 40 ? 'text-amber-400' : 'text-red-400'
          }`}>
            Grade {diversification.grade} — {diversification.effectiveCategories.toFixed(1)} effective categories
          </span>
        </div>
      </div>

      {/* Top Performing Category */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <TrendingUp size={12} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400">
          Top: {topPerformer.label} +{topPerformer.return1y.toFixed(1)}% (1Y)
        </span>
      </div>
    </button>
  );
};

export default CrossHobbyPortfolioWidget;
