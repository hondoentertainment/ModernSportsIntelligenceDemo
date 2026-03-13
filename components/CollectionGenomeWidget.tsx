import React, { useMemo } from 'react';
import { Dna, ChevronRight, Brain, Target } from 'lucide-react';
import {
  analyzeGenome,
  getGenomeStats,
  getTypeLabel,
  getTraitLabel,
} from '../lib/collectionGenomeService';

interface CollectionGenomeWidgetProps {
  onClick?: () => void;
}

export const CollectionGenomeWidget: React.FC<CollectionGenomeWidgetProps> = ({ onClick }) => {
  const genome = useMemo(() => analyzeGenome(), []);
  const stats = useMemo(() => getGenomeStats(), []);

  const topTrait = genome.traits.reduce((a, b) => (a.score > b.score ? a : b));

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-600 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Dna size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Collection Genome</h3>
            <p className="text-[11px] text-slate-500 font-medium">Your collector DNA profile</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-lime transition-colors" />
      </div>

      {/* Collector Type Badge */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <Brain size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {getTypeLabel(genome.collectorType)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{genome.confidence}% confidence</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            Hybrid: Value Investor + Prospect Speculator
          </p>
        </div>
      </div>

      {/* Top Trait */}
      <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Trait</span>
          </div>
          <span className="text-sm font-bold text-brand-lime">{topTrait.score}/100</span>
        </div>
        <p className="text-sm font-semibold text-white">{getTraitLabel(topTrait.name)}</p>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-lime rounded-full transition-all"
            style={{ width: `${topTrait.score}%` }}
          />
        </div>
      </div>

      {/* Blind Spot Preview */}
      <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Biggest Blind Spot</p>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{genome.blindSpots[0]}</p>
      </div>

      {/* Risk Profile */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Risk Profile</span>
        <span className={`font-bold capitalize ${
          stats.riskProfile === 'aggressive' ? 'text-red-400' :
          stats.riskProfile === 'moderate' ? 'text-amber-400' : 'text-green-400'
        }`}>
          {stats.riskProfile}
        </span>
      </div>
    </button>
  );
};

export default CollectionGenomeWidget;
