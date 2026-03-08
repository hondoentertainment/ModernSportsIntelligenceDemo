import React, { useMemo } from 'react';
import { X, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { CardInventory } from '../types';
import { predictGrade } from '../lib/gradingPredictionService';

interface GradingPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
}

const RECOMMENDATION_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'Grade Now': { bg: 'bg-brand-green/10', border: 'border-brand-green/30', text: 'text-brand-green' },
  'Hold - Not Worth Grading': { bg: 'bg-brand-orange/10', border: 'border-brand-orange/30', text: 'text-brand-orange' },
  'Re-examine Condition': { bg: 'bg-brand-red/10', border: 'border-brand-red/30', text: 'text-brand-red' },
};

const GradingPredictionModal: React.FC<GradingPredictionModalProps> = ({ isOpen, onClose, card }) => {
  const prediction = useMemo(() => predictGrade(card), [card]);

  if (!isOpen) return null;

  const recStyle = RECOMMENDATION_STYLES[prediction.recommendation] || RECOMMENDATION_STYLES['Re-examine Condition'];

  // Show top 4 grades for probability bars (PSA 10 through PSA 7)
  const topGrades = prediction.distribution.slice(0, 4);
  const maxProb = Math.max(...topGrades.map(d => d.probability), 1);

  const subGradeEntries: { label: string; value: number }[] = [
    { label: 'Surface', value: prediction.subGrades.surface },
    { label: 'Centering', value: prediction.subGrades.centering },
    { label: 'Corners', value: prediction.subGrades.corners },
    { label: 'Edges', value: prediction.subGrades.edges },
  ];

  const rawValue = card.currentValue || card.purchasePrice || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-2xl">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">Grade Prediction</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                {card.player} — {card.year} {card.manufacturer}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">

          {/* Predicted Grade + Confidence */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-brand-charcoal border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-3xl font-bebas text-brand-lime leading-none">{prediction.predictedGrade.replace('PSA ', '')}</span>
              <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">PSA</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Grade Confidence</span>
                <span className="text-sm font-mono font-black text-white">{prediction.gradeConfidence}%</span>
              </div>
              <div className="h-2 w-full bg-brand-charcoal rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-brand-lime to-brand-teal rounded-full transition-all duration-700"
                  style={{ width: `${prediction.gradeConfidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sub-grade Analysis Bars */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Sub-Grade Analysis</p>
            <div className="grid grid-cols-2 gap-4">
              {subGradeEntries.map((sg) => (
                <div key={sg.label} className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">{sg.label}</span>
                    <span className="text-sm font-mono font-black text-white">{sg.value}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-charcoal rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sg.value >= 8 ? 'bg-brand-green' : sg.value >= 6 ? 'bg-brand-lime' : sg.value >= 4 ? 'bg-brand-orange' : 'bg-brand-red'
                      }`}
                      style={{ width: `${(sg.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Probability Distribution (PSA 10 through PSA 7) */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Grade Probability Distribution</p>
            <div className="space-y-3">
              {topGrades.map((d) => (
                <div key={d.grade} className="flex items-center gap-4">
                  <span className="w-14 text-xs font-black text-white flex-shrink-0">{d.grade}</span>
                  <div className="flex-1 h-6 bg-brand-charcoal/50 rounded-lg overflow-hidden border border-slate-800/30 relative">
                    <div
                      className="h-full bg-gradient-to-r from-brand-lime/80 to-brand-teal/80 rounded-lg transition-all duration-700"
                      style={{ width: `${(d.probability / maxProb) * 100}%` }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-white/80">
                      {d.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Value at Each Grade */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Expected Value by Grade</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topGrades.map((d) => (
                <div key={d.grade} className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">{d.grade}</p>
                  <p className="text-lg font-mono font-black text-white">${d.expectedValue.toLocaleString()}</p>
                  <p className={`text-[9px] font-black mt-1 ${d.netGain >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                    {d.netGain >= 0 ? '+' : ''}${d.netGain.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grade ROI Section */}
          <div className="p-6 bg-brand-charcoal/30 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-lime" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Grade ROI Analysis</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Current Raw Value</p>
                <p className="text-lg font-mono font-black text-slate-200">${Math.round(rawValue).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Grading Cost</p>
                <p className="text-lg font-mono font-black text-brand-orange">${prediction.gradingCost}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Expected Gain</p>
                <p className={`text-lg font-mono font-black flex items-center gap-1 ${prediction.expectedValueGain >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {prediction.expectedValueGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {prediction.expectedValueGain >= 0 ? '+' : ''}${prediction.expectedValueGain.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation Badge */}
          <div className={`p-6 rounded-2xl border ${recStyle.bg} ${recStyle.border}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${recStyle.text} ${recStyle.bg} border ${recStyle.border}`}>
                {prediction.recommendation}
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {prediction.recommendationReason}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GradingPredictionModal;
