import React, { useMemo } from 'react';
import { Eye, TrendingUp, Award } from 'lucide-react';
import { CardInventory } from '../types';
import { analysePortfolioGradingOpportunities } from '../lib/gradingPredictionService';

interface GradeAuditWidgetProps {
  inventory: CardInventory[];
  onCardClick: (_card: CardInventory) => void;
}

const GradeAuditWidget: React.FC<GradeAuditWidgetProps> = ({ inventory, onCardClick }) => {
  const analysis = useMemo(() => analysePortfolioGradingOpportunities(inventory), [inventory]);

  // Top 5 candidates sorted by ROI potential
  const topCandidates = analysis.candidates.slice(0, 5);

  if (analysis.ungradedCount === 0) return null;

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/5 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-2xl">
            <Eye size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-wide text-white">Visual Audit Simulation</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">AI Grading Predictions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-charcoal border border-slate-800 rounded-full">
          <div className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{analysis.ungradedCount} Ungraded</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Grade Now Candidates</p>
          <p className="text-2xl font-mono font-black text-brand-green">{analysis.gradeNowCount}</p>
        </div>
        <div className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Expected Uplift</p>
          <p className="text-2xl font-mono font-black text-brand-lime">
            +${analysis.totalExpectedUplift.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Ungraded Assets</p>
          <p className="text-2xl font-mono font-black text-white">{analysis.ungradedCount}</p>
        </div>
      </div>

      {/* Top 5 Candidates */}
      {topCandidates.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Top Grading Candidates</p>
          <div className="space-y-3">
            {topCandidates.map((candidate) => {
              const recColor = candidate.recommendation === 'Grade Now'
                ? 'text-brand-green'
                : candidate.recommendation === 'Hold - Not Worth Grading'
                  ? 'text-brand-orange'
                  : 'text-brand-red';

              return (
                <button
                  key={candidate.cardId}
                  onClick={() => onCardClick(candidate.card)}
                  className="w-full flex items-center gap-4 p-4 bg-brand-charcoal/30 border border-slate-800/30 rounded-2xl hover:bg-brand-charcoal/60 hover:border-slate-700 transition-all text-left group/row"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-charcoal border border-slate-800 flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-brand-lime" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover/row:text-brand-lime transition-colors">
                      {candidate.card.player}
                    </p>
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">
                      {candidate.card.year} {candidate.card.manufacturer} — {candidate.predictedGrade}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-mono font-black ${candidate.expectedValueGain >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {candidate.expectedValueGain >= 0 ? '+' : ''}${candidate.expectedValueGain.toLocaleString()}
                    </p>
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${recColor}`}>
                      {candidate.recommendation === 'Grade Now' ? 'Grade Now' : candidate.recommendation === 'Hold - Not Worth Grading' ? 'Hold' : 'Re-examine'}
                    </p>
                  </div>
                  <TrendingUp size={14} className="text-brand-muted group-hover/row:text-brand-lime transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(GradeAuditWidget);
