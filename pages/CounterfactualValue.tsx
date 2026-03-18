import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  BarChart3,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  getCounterfactualScenarios,
  getCounterfactualStats,
  getTopUpsideScenarios,
  getAlternateTimeline,
} from '../lib/analytics/counterfactualValueService';

const CounterfactualValue: React.FC = () => {
  const scenarios = useMemo(() => getCounterfactualScenarios(), []);
  const stats = useMemo(() => getCounterfactualStats(), []);
  const topUpside = useMemo(() => getTopUpsideScenarios(), []);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
          <GitBranch size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Counterfactual Value Engine</h1>
          <p className="text-sm text-slate-400">
            Alternate timeline card valuations — explore what could have been
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<GitBranch size={16} className="text-violet-400" />}
          label="Scenarios"
          value={stats.totalScenarios.toString()}
        />
        <StatCard
          icon={<BarChart3 size={16} className="text-violet-400" />}
          label="Avg Delta"
          value={`${stats.avgValueDelta > 0 ? '+' : ''}${stats.avgValueDelta}%`}
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-emerald-400" />}
          label="Biggest Upside"
          value={`+${stats.biggestUpside.delta}%`}
        />
        <StatCard
          icon={<TrendingDown size={16} className="text-red-400" />}
          label="Biggest Downside"
          value={`${stats.biggestDownside.delta}%`}
        />
        <StatCard
          icon={<Shield size={16} className="text-violet-400" />}
          label="Most Explored"
          value={stats.mostExplored}
        />
      </div>

      {/* Top Upside Scenarios */}
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Top Upside Scenarios
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topUpside.map((s) => (
            <div
              key={s.id}
              className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-violet-500/30 transition-all cursor-pointer"
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
            >
              <p className="text-xs text-slate-400">{s.playerName}</p>
              <p className="text-sm font-bold text-white mt-1">{s.scenarioTitle}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-white">
                  ${s.actualValue.toLocaleString()}
                </span>
                <ArrowRight size={12} className="text-violet-400" />
                <span className="text-sm font-bold text-violet-400">
                  ${s.counterfactualValue.toLocaleString()}
                </span>
                <span className="ml-auto text-xs font-bold text-emerald-400">
                  +{s.valueDeltaPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Scenarios */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-violet-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            All Scenarios
          </span>
        </div>

        {scenarios.map((scenario) => {
          const isUpside = scenario.valueDelta > 0;
          const isExpanded = expandedId === scenario.id;
          const timeline = isExpanded ? getAlternateTimeline(scenario.id) : undefined;

          return (
            <div
              key={scenario.id}
              className="bg-slate-800/40 border border-slate-700 rounded-2xl hover:border-violet-500/20 transition-all overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                className="w-full text-left p-5 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{scenario.playerName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold uppercase">
                      {scenario.category}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{scenario.scenarioTitle}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    ${scenario.actualValue.toLocaleString()}
                  </span>
                  <ArrowRight size={14} className="text-violet-400" />
                  <span className="text-sm font-bold text-violet-400">
                    ${scenario.counterfactualValue.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${
                      isUpside ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isUpside ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isUpside ? '+' : ''}
                    {scenario.valueDeltaPercent}%
                  </span>
                  <ChevronRight
                    size={16}
                    className={`text-slate-600 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-700/50 pt-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {scenario.scenarioDescription}
                  </p>

                  {/* Mini Timeline */}
                  {timeline && (
                    <div className="space-y-1 pt-2">
                      {timeline.timelineEvents.slice(0, 5).map((event, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-violet-400 w-8">
                            {event.year}
                          </span>
                          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{
                                width: `${
                                  (event.cardValue /
                                    Math.max(
                                      ...timeline.timelineEvents.map((e) => e.cardValue),
                                      1
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 w-16 text-right">
                            ${event.cardValue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Shield size={10} className="text-slate-500" />
                    <span className="text-[10px] text-slate-500">
                      Confidence: {Math.round(scenario.confidenceScore * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-600 mx-1">|</span>
                    <span className="text-[10px] text-slate-500">{scenario.methodology}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-lg font-bebas tracking-wider text-white">{value}</p>
    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
  </div>
);

export default CounterfactualValue;
