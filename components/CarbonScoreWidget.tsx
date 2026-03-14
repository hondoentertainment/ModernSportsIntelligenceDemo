import React, { useMemo } from 'react';
import { Leaf, ChevronRight, TrendingDown, TrendingUp, Minus, Award } from 'lucide-react';
import {
  getSustainabilityScore,
  getCarbonFootprint,
  getGreenBadges,
  BADGE_TIER_COLORS,
  BADGE_TIER_LABELS,
  BadgeTier,
} from '../lib/carbonScoreService';

interface CarbonScoreWidgetProps {
  onClick?: () => void;
}

function tierForScore(score: number): BadgeTier {
  if (score >= 90) return 'rainforest';
  if (score >= 75) return 'forest';
  if (score >= 55) return 'tree';
  if (score >= 35) return 'sapling';
  return 'seedling';
}

const CarbonScoreWidget: React.FC<CarbonScoreWidgetProps> = ({ onClick }) => {
  const score = useMemo(() => getSustainabilityScore(), []);
  const footprint = useMemo(() => getCarbonFootprint(), []);
  const badges = useMemo(() => getGreenBadges(), []);

  const earnedCount = badges.filter(b => b.isEarned).length;
  const currentTier = tierForScore(score.overallScore);
  const tierColor = BADGE_TIER_COLORS[currentTier];

  const gaugePercent = (score.overallScore / score.maxScore) * 100;
  const gaugeAngle = (gaugePercent / 100) * 180;

  return (
    <div
      className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 cursor-pointer hover:border-slate-700 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Leaf size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Carbon & <span className="text-brand-lime">Sustainability</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Environmental Impact Score
            </p>
          </div>
        </div>
        {onClick && (
          <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Score Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-28 overflow-hidden">
          {/* Gauge background arc */}
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <path
              d="M 15 100 A 85 85 0 0 1 185 100"
              fill="none"
              stroke="#334155"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 15 100 A 85 85 0 0 1 185 100"
              fill="none"
              stroke={tierColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${gaugeAngle * 2.98} 1000`}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Center score */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-4xl font-bebas tracking-wider text-white">{score.overallScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tierColor }}>
              {score.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Footprint */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">CO2 / Month</p>
          <p className="text-lg font-bebas tracking-wider text-white">{footprint.monthlyAvgKg} kg</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            {footprint.comparisonToAvg < 0 ? (
              <TrendingDown size={12} className="text-brand-lime" />
            ) : (
              <TrendingUp size={12} className="text-red-400" />
            )}
            <span className={`text-[10px] font-bold ${footprint.comparisonToAvg < 0 ? 'text-brand-lime' : 'text-red-400'}`}>
              {Math.abs(footprint.comparisonToAvg)}% vs avg
            </span>
          </div>
        </div>

        {/* Badge Tier */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">Badge Tier</p>
          <p className="text-lg font-bebas tracking-wider" style={{ color: tierColor }}>
            {BADGE_TIER_LABELS[currentTier]}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Award size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">{earnedCount} earned</span>
          </div>
        </div>

        {/* Percentile */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-center">
          <p className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-1">Percentile</p>
          <p className="text-lg font-bebas tracking-wider text-white">Top {100 - score.percentile}%</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Minus size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">of collectors</span>
          </div>
        </div>
      </div>

      {/* Top Factors */}
      <div className="space-y-2">
        {score.factors.slice(0, 3).map((factor) => (
          <div key={factor.name} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300">{factor.name}</span>
                <span className="text-xs font-bold text-brand-lime">{factor.score}/{factor.maxScore}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(factor.score / factor.maxScore) * 100}%`,
                    background: `linear-gradient(90deg, ${tierColor}, ${tierColor}88)`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarbonScoreWidget;
