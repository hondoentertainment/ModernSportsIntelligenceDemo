import React, { useMemo } from 'react';
import {
  Award,
  TrendingUp,
  ArrowRightLeft,
  ChevronRight,
  Gem,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getPortfolioGradeAnalysis,
  getTopCrossoverOpportunities,
} from '../lib/gradePremiumService';

interface GradePremiumWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const GradePremiumWidget: React.FC<GradePremiumWidgetProps> = ({ cards, onClick }) => {
  const analysis = useMemo(() => getPortfolioGradeAnalysis(cards), [cards]);
  const topOpportunities = useMemo(() => getTopCrossoverOpportunities(cards, 3), [cards]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Award size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Grade <span className="text-blue-400">Premium</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Cross-grader value analytics
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-blue-400" />
          <span className="text-sm font-bold text-white">
            {analysis.averageGrade > 0 ? analysis.averageGrade.toFixed(1) : '--'}
          </span>
          <span className="text-xs text-slate-400">avg grade</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <Gem size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">{analysis.gemRate}%</span>
          <span className="text-xs text-slate-400">gem rate</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={14} className="text-amber-400" />
          <span className="text-sm font-bold text-white">{analysis.upgradeOpportunityCount}</span>
          <span className="text-xs text-slate-400">crossovers</span>
        </div>
      </div>

      {/* Top Crossover Opportunities */}
      {topOpportunities.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Top Crossover Opportunities
          </p>
          <div className="space-y-1.5">
            {topOpportunities.map(opp => (
              <div
                key={opp.cardId + opp.toCompany}
                className="flex items-center justify-between px-3 py-2 bg-slate-800/30 border border-slate-700/50 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ArrowRightLeft size={12} className="text-blue-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{opp.player}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {opp.fromCompany} {opp.fromGrade} &rarr; {opp.toCompany} {opp.toGrade}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <TrendingUp size={12} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">+{opp.roi}% ROI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Breakdown */}
      {analysis.totalGraded > 0 && analysis.companyBreakdown.length > 0 && (
        <div className="flex gap-2">
          {analysis.companyBreakdown.slice(0, 3).map(cb => (
            <div
              key={cb.company}
              className="flex-1 px-3 py-2 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center"
            >
              <div className="text-[10px] text-slate-500">{cb.company}</div>
              <div className="text-sm font-bold text-white">{cb.count}</div>
              <div className="text-[10px] text-blue-400">avg {cb.avgGrade}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {analysis.totalGraded === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <Award size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            Add graded cards to see premium analytics and crossover opportunities
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold">
        <Award size={14} />
        Analyze Grade Premiums
      </div>
    </button>
  );
};

export default GradePremiumWidget;
