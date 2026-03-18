import React, { useMemo } from 'react';
import {
  ArrowRightLeft,
  TrendingUp,
  Gem,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  findCrossoverOpportunities,
  getPortfolioGradeAnalysis,
} from '../lib/analytics/gradePremiumService';

interface GradePremiumWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const GradePremiumWidget: React.FC<GradePremiumWidgetProps> = ({ cards, onClick }) => {
  const opportunities = useMemo(() => findCrossoverOpportunities(cards), [cards]);
  const analysis = useMemo(() => getPortfolioGradeAnalysis(cards), [cards]);

  const top3 = opportunities.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <Gem size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Grade <span className="text-purple-400">Premium</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Crossover & grading analytics
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30">
          <TrendingUp size={14} />
          Avg {analysis.averageGrade.toFixed(1)}
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
          <Gem size={14} />
          {analysis.gemRate.toFixed(0)}% Gem Rate
        </div>
        <div className="ml-auto text-xs text-slate-400">
          <span className="font-mono text-white">{analysis.gradedCards}</span>
          <span className="text-slate-600"> / {analysis.totalCards} graded</span>
        </div>
      </div>

      {/* Top Crossover Opportunities */}
      {top3.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Top Crossover Opportunities
          </p>
          {top3.map((opp) => (
            <div
              key={opp.cardId}
              className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <ArrowRightLeft size={14} className="text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white font-medium truncate block">
                  {opp.player}
                </span>
                <span className="text-[10px] text-slate-500">
                  {opp.currentGrader} {opp.currentGrade} &rarr; {opp.targetGrader} {opp.targetGrade}
                </span>
              </div>
              <span
                className={`text-xs font-bold font-mono ${
                  opp.expectedROI >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {opp.expectedROI >= 0 ? '+' : ''}{opp.expectedROI.toFixed(1)}% ROI
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <ArrowRightLeft size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            No crossover opportunities found. Add graded cards from BGS or SGC to find potential crossovers.
          </span>
        </div>
      )}
    </button>
  );
};

export default GradePremiumWidget;
