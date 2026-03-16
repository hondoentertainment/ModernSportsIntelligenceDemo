import React, { useMemo } from 'react';
import { GitBranch, ChevronRight, TrendingUp, ArrowRight } from 'lucide-react';
import {
  getCounterfactualScenarios,
  getCounterfactualStats,
} from '../lib/counterfactualValueService';

interface CounterfactualValueWidgetProps {
  onClick?: () => void;
}

export const CounterfactualValueWidget: React.FC<CounterfactualValueWidgetProps> = ({ onClick }) => {
  const scenarios = useMemo(() => getCounterfactualScenarios(), []);
  const stats = useMemo(() => getCounterfactualStats(), []);

  const featured = scenarios.find((s) => s.valueDeltaPercent > 0) ?? scenarios[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400">
            <GitBranch size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Counter<span className="text-violet-400">factual</span>
            </h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Alternate Timeline Valuations
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* 3-col Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-lg font-bebas tracking-wider text-white">{stats.totalScenarios}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Scenarios</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-lg font-bebas tracking-wider text-violet-400">
            {stats.avgValueDelta > 0 ? '+' : ''}
            {stats.avgValueDelta}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Delta</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-lg font-bebas tracking-wider text-emerald-400">
            +{stats.biggestUpside.delta}%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Top Upside</p>
        </div>
      </div>

      {/* Featured "What If" Card */}
      {featured && (
        <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <GitBranch size={12} className="text-violet-400" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
              Featured What-If
            </span>
          </div>

          <p className="text-sm font-bold text-white leading-snug">
            {featured.scenarioTitle}
          </p>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase">Actual</p>
              <p className="text-sm font-bold text-white">
                ${featured.actualValue.toLocaleString()}
              </p>
            </div>
            <ArrowRight size={14} className="text-violet-400" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase">Alt. Value</p>
              <p className="text-sm font-bold text-violet-400">
                ${featured.counterfactualValue.toLocaleString()}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                +{featured.valueDeltaPercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-xl text-xs font-bold">
        <GitBranch size={14} />
        Explore Alternate Timelines
      </div>
    </button>
  );
};

export default CounterfactualValueWidget;
