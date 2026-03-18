import React, { useMemo } from 'react';
import {
  Brain,
  ChevronRight,
  TrendingUp,
  Target,
  ListChecks,
  Sparkles,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getWidgetSummary,
  getSubmissionCostTracker,
  GradePredictWidgetSummary,
  SubmissionCostTracker,
} from '../lib/analytics/gradePredictService';

interface GradePredictWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

export const GradePredictWidget: React.FC<GradePredictWidgetProps> = ({ cards, onClick }) => {
  const summary: GradePredictWidgetSummary = useMemo(() => getWidgetSummary(cards), [cards]);
  const tracker: SubmissionCostTracker = useMemo(() => getSubmissionCostTracker(cards), [cards]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Brain size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Grade <span className="text-cyan-400">Predictor</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              AI-powered grading engine
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-green-400 bg-green-500/15 border border-green-500/30">
          <TrendingUp size={14} />
          {summary.averagePredictedROI > 0 ? '+' : ''}{summary.averagePredictedROI.toFixed(1)}% ROI
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          <ListChecks size={14} />
          {summary.queueCount} queued
        </div>
        <div className="ml-auto text-xs text-slate-400">
          <span className="font-mono text-white">{summary.modelAccuracy.toFixed(0)}%</span>
          <span className="text-slate-600"> accuracy</span>
        </div>
      </div>

      {/* Top Recommendations */}
      {summary.topRecommendations.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Next Recommended Submissions
          </p>
          {summary.topRecommendations.map((rec) => (
            <div
              key={rec.cardId}
              className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
            >
              <Target size={14} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white font-medium truncate block">
                  {rec.player}
                </span>
                <span className="text-[10px] text-slate-500">
                  {rec.bestCompany} &middot; Predicted {rec.predictedGrade}
                </span>
              </div>
              <span
                className={`text-xs font-bold font-mono ${
                  rec.expectedROI >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {rec.expectedROI >= 0 ? '+' : ''}{rec.expectedROI.toFixed(1)}% ROI
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
          <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            Add ungraded cards to get AI-powered submission recommendations.
          </span>
        </div>
      )}

      {/* Grading Investment Summary */}
      {tracker.totalCardsSubmitted > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <DollarSign size={12} className="text-slate-500 mb-1" />
            <span className="text-xs font-bold text-white font-mono">
              ${tracker.totalFeesSpent.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">
              Fees Spent
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <BarChart3 size={12} className="text-slate-500 mb-1" />
            <span className="text-xs font-bold text-white font-mono">
              {tracker.averageGradeReceived.toFixed(1)}
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">
              Avg Grade
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <TrendingUp size={12} className="text-slate-500 mb-1" />
            <span className={`text-xs font-bold font-mono ${
              tracker.cumulativeROI >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {tracker.cumulativeROI >= 0 ? '+' : ''}{tracker.cumulativeROI.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">
              Grade ROI
            </span>
          </div>
        </div>
      )}

      {/* CTA - Total Potential Profit */}
      {summary.totalPotentialProfit > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Total potential profit</span>
          </div>
          <span className="text-sm font-bold text-cyan-400 font-mono">
            +${summary.totalPotentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </button>
  );
};

export default GradePredictWidget;
