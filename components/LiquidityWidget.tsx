import React, { useMemo } from 'react';
import {
  Droplets,
  ChevronRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getPortfolioLiquidityReport,
  computeAllLiquidityScores,
  detectIlliquidityOpportunities,
  LiquidityScore,
  PortfolioLiquidityReport,
} from '../lib/liquidityService';

interface LiquidityWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-green-400';
  if (score >= 50) return 'text-blue-400';
  if (score >= 30) return 'text-amber-400';
  return 'text-red-400';
}

function scoreGlow(score: number): string {
  if (score >= 75) return 'bg-green-500/10 border-green-500/30';
  if (score >= 50) return 'bg-blue-500/10 border-blue-500/30';
  if (score >= 30) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function tierLabel(score: number): string {
  if (score >= 85) return 'Ultra-Liquid';
  if (score >= 65) return 'Liquid';
  if (score >= 45) return 'Moderate';
  if (score >= 25) return 'Illiquid';
  return 'Frozen';
}

export const LiquidityWidget: React.FC<LiquidityWidgetProps> = ({ cards, onClick }) => {
  const report = useMemo<PortfolioLiquidityReport>(
    () => getPortfolioLiquidityReport(cards),
    [cards],
  );

  const scores = useMemo(() => computeAllLiquidityScores(cards), [cards]);

  const illiquidOpps = useMemo(
    () => detectIlliquidityOpportunities(cards),
    [cards],
  );

  const activeCards = cards.filter(c => c.status !== 'sold');
  const hasCards = activeCards.length > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Droplets size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Liquidity <span className="text-cyan-400">Intelligence</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Exit velocity & market depth
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {hasCards ? (
        <>
          {/* Portfolio Liquidity Score */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Portfolio Liquidity
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${scoreGlow(report.overallScore)} ${scoreColor(report.overallScore)}`}>
                {tierLabel(report.overallScore)}
              </span>
            </div>

            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bebas tracking-wider ${scoreColor(report.overallScore)}`}>
                {report.overallScore}
              </span>
              <span className="text-sm text-slate-500 pb-1">/100</span>
            </div>

            {/* Liquidity bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  report.overallScore >= 75 ? 'bg-green-500' :
                  report.overallScore >= 50 ? 'bg-blue-500' :
                  report.overallScore >= 30 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
              <Clock size={14} className="mx-auto text-blue-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{report.avgDaysToSell}d</p>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                Avg Sell
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
              <TrendingUp size={14} className="mx-auto text-green-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{report.liquidWithin7Days.percent}%</p>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                7-Day Liquid
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
              <BarChart3 size={14} className="mx-auto text-cyan-400 mb-1" />
              <p className="text-lg font-bebas tracking-wider text-white">{report.liquidWithin30Days.percent}%</p>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                30-Day Liquid
              </p>
            </div>
          </div>

          {/* Illiquidity Alert */}
          {report.illiquidCards > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-400 font-bold">
                  {report.illiquidCards} illiquid card{report.illiquidCards !== 1 ? 's' : ''}
                </p>
                <p className="text-[10px] text-slate-400">
                  ${report.illiquidValue.toLocaleString()} locked in low-liquidity assets
                </p>
              </div>
              {illiquidOpps.length > 0 && (
                <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                  <Zap size={10} />
                  {illiquidOpps.length} opportunity{illiquidOpps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Liquidation Timeline */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">7d:</span>
              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-md">
                ${report.liquidWithin7Days.value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">30d:</span>
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-md">
                ${report.liquidWithin30Days.value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">90d:</span>
              <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 text-slate-300 font-bold rounded-md">
                ${report.liquidWithin90Days.value.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Droplets size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No cards in portfolio</p>
          <p className="text-xs text-slate-600 mt-1">Add cards to analyze liquidity</p>
        </div>
      )}
    </button>
  );
};

export default LiquidityWidget;
