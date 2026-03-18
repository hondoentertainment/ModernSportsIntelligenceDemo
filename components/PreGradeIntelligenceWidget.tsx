import React, { useMemo } from 'react';
import {
  ScanLine,
  Camera,
  ChevronRight,
  TrendingUp,
  Award,
  Target,
  DollarSign,
} from 'lucide-react';
import {
  getWidgetStats,
  type GradePrediction,
} from '../lib/core/preGradeIntelligenceService';

interface PreGradeIntelligenceWidgetProps {
  onOpenModal?: () => void;
}

function getVerdictColor(grade: string): string {
  if (grade.includes('10')) return 'text-emerald-400';
  if (grade.includes('9.5')) return 'text-cyan-400';
  if (grade.includes('9')) return 'text-blue-400';
  if (grade.includes('8')) return 'text-amber-400';
  return 'text-red-400';
}

function getROIIndicator(prediction: GradePrediction): { label: string; color: string } {
  const psa10Prob = prediction.distribution.PSA10;
  if (psa10Prob > 0.5) return { label: 'HIGH ROI', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
  if (psa10Prob > 0.2) return { label: 'MODERATE', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
  return { label: 'LOW ROI', color: 'text-red-400 bg-red-500/15 border-red-500/30' };
}

const PreGradeIntelligenceWidget: React.FC<PreGradeIntelligenceWidgetProps> = ({ onOpenModal }) => {
  const stats = useMemo(() => getWidgetStats(), []);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
            <ScanLine size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Pre-Grade <span className="text-orange-400">Intelligence</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              AI-powered grade prediction & ROI
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Accuracy Badge */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30">
          <Target size={14} />
          {stats.modelAccuracy}% accuracy
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <Award size={14} />
          12,450 predictions
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Camera size={12} />
          </div>
          <p className="text-lg font-bold text-white">{stats.totalScanned}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Scanned</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
            <DollarSign size={12} />
          </div>
          <p className="text-lg font-bold text-emerald-400">
            ${stats.totalPredictedROI > 0 ? '+' : ''}{stats.totalPredictedROI.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Predicted ROI</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
            <TrendingUp size={12} />
          </div>
          <p className="text-lg font-bold text-white">{stats.avgGrade}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Grade</p>
        </div>
      </div>

      {/* Recent Predictions */}
      {stats.recentPredictions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Recent Predictions
          </p>
          {stats.recentPredictions.slice(0, 3).map((pred) => {
            const roiIndicator = getROIIndicator(pred);
            return (
              <div
                key={pred.id}
                className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium truncate">{pred.cardName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`font-bold ${getVerdictColor(pred.predictedGrade)}`}>
                      {pred.predictedGrade}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-500">
                      {Math.round(pred.confidence * 100)}% conf
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roiIndicator.color}`}>
                  {roiIndicator.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-3">
            <Camera size={28} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Scan a card to predict its grade</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to start your first scan
          </p>
        </div>
      )}

      {/* Scan CTA */}
      <div className="flex items-center justify-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm font-bold group-hover:bg-orange-500/20 transition-colors">
        <Camera size={16} />
        Scan a Card
      </div>
    </button>
  );
};

export default PreGradeIntelligenceWidget;
