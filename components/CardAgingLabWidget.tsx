// @ts-nocheck
import React, { useMemo } from 'react';
import {
  FlaskConical,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import {
  simulateAging,
  getPreservationScore,
  type StorageCondition,
} from '../lib/utils/cardAgingSimService';

interface CardAgingLabWidgetProps {
  onClick?: () => void;
}

// Simulate a small collection for the widget
const COLLECTION_SAMPLES: { grade: string; value: number; conditions: StorageCondition }[] = [
  {
    grade: 'PSA 10',
    value: 42500,
    conditions: {
      temperature: 72,
      humidity: 50,
      uvExposure: 'low',
      airQuality: 'moderate',
      storageType: 'graded_case',
      isClimateControlled: false,
    },
  },
  {
    grade: 'BGS 9.5',
    value: 18750,
    conditions: {
      temperature: 74,
      humidity: 55,
      uvExposure: 'moderate',
      airQuality: 'moderate',
      storageType: 'toploader',
      isClimateControlled: false,
    },
  },
  {
    grade: 'PSA 10',
    value: 31200,
    conditions: {
      temperature: 68,
      humidity: 40,
      uvExposure: 'none',
      airQuality: 'clean',
      storageType: 'vault',
      isClimateControlled: true,
    },
  },
  {
    grade: 'PSA 9',
    value: 8500,
    conditions: {
      temperature: 76,
      humidity: 60,
      uvExposure: 'low',
      airQuality: 'moderate',
      storageType: 'penny_sleeve',
      isClimateControlled: false,
    },
  },
  {
    grade: 'PSA 8',
    value: 4200,
    conditions: {
      temperature: 72,
      humidity: 48,
      uvExposure: 'low',
      airQuality: 'moderate',
      storageType: 'one_touch',
      isClimateControlled: false,
    },
  },
];

export const CardAgingLabWidget: React.FC<CardAgingLabWidgetProps> = ({ onClick }) => {
  const analysis = useMemo(() => {
    const sims = COLLECTION_SAMPLES.map((c) => ({
      sim: simulateAging(c.grade, c.conditions),
      value: c.value,
    }));

    const scores = sims.map((s) => s.sim.preservationScore.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const atRisk = sims.filter((s) => s.sim.preservationScore.score < 60).length;

    // Find top recommendation
    const worstCard = sims.reduce(
      (worst, curr) =>
        curr.sim.preservationScore.score < worst.sim.preservationScore.score ? curr : worst,
      sims[0]
    );
    const topRec =
      worstCard.sim.preservationScore.suggestions[0] || 'All cards well-protected';

    return { avgScore, atRisk, topRec, totalCards: sims.length };
  }, []);

  const scoreColor =
    analysis.avgScore >= 85
      ? 'text-emerald-400'
      : analysis.avgScore >= 65
        ? 'text-blue-400'
        : analysis.avgScore >= 45
          ? 'text-amber-400'
          : 'text-red-400';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <FlaskConical size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Aging <span className="text-brand-lime">Lab</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Card Condition Simulator
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Preservation Score Circle */}
      <div className="flex justify-center py-2">
        <div className="relative w-28 h-28">
          <svg width="112" height="112" viewBox="0 0 112 112" className="transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="#334155"
              strokeWidth="8"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke={analysis.avgScore >= 85 ? '#34d399' : analysis.avgScore >= 65 ? '#3b82f6' : analysis.avgScore >= 45 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(analysis.avgScore / 100) * 301.6} 301.6`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${scoreColor}`}>{analysis.avgScore}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Score</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-center">
          <div className="text-lg font-bold text-white">{analysis.totalCards}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cards Monitored</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-center">
          <div className={`text-lg font-bold ${analysis.atRisk > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {analysis.atRisk}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">At Risk</div>
        </div>
      </div>

      {/* Top Recommendation */}
      <div className="p-3 rounded-xl bg-brand-lime/5 border border-brand-lime/20">
        <div className="flex items-start gap-2">
          {analysis.atRisk > 0 ? (
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          )}
          <p className="text-[11px] text-slate-400 leading-relaxed">{analysis.topRec}</p>
        </div>
      </div>
    </button>
  );
};

export default CardAgingLabWidget;
