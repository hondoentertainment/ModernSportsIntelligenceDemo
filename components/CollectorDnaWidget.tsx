// @ts-nocheck
import React, { useMemo } from 'react';
import { Dna, ChevronRight, Users, Sparkles } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  getMyDNA,
  getArchetypeBreakdown,
  findMatches,
  getArchetypeLabel,
  getArchetypeColor,
} from '../lib/core/collectorDnaService';

interface CollectorDnaWidgetProps {
  onOpenModal?: () => void;
}

const CollectorDnaWidget: React.FC<CollectorDnaWidgetProps> = ({ onOpenModal }) => {
  const myProfile = useMemo(() => getMyDNA(), []);
  const breakdown = useMemo(() => getArchetypeBreakdown(), []);
  const matches = useMemo(() => findMatches(), []);

  const primaryColor = getArchetypeColor(myProfile.primaryArchetype);
  const highMatches = matches.filter(m => m.matchScore.overall >= 70).length;

  const radarData = breakdown.map(b => ({
    trait: b.label.split(' ')[0],
    value: b.value,
    fullMark: 60,
  }));

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-lime-400" />
          <h3 className="text-base font-bold text-white">Collector DNA</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Archetype</p>
          <p className={`text-sm font-bold ${primaryColor.text}`}>
            {getArchetypeLabel(myProfile.primaryArchetype).split(' ')[0]}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Matches</p>
          <p className="text-lg font-bold text-lime-400">{highMatches}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Rep Score</p>
          <p className="text-lg font-bold text-emerald-400">{myProfile.reputationScore}</p>
        </div>
      </div>

      {/* Mini Radar Chart */}
      <div className="px-4 pt-2 pb-0">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Radar
                name="DNA"
                dataKey="value"
                stroke="#84cc16"
                fill="#84cc16"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Primary Archetype Badge */}
      <div className="px-4 pb-3">
        <button
          onClick={onOpenModal}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${primaryColor.bg} ${primaryColor.border} hover:bg-slate-800`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${primaryColor.text}`} />
            <div className="text-left">
              <p className={`text-xs font-bold ${primaryColor.text}`}>
                {getArchetypeLabel(myProfile.primaryArchetype)}
              </p>
              <p className="text-[10px] text-slate-400">Primary Archetype</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{highMatches} matches</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CollectorDnaWidget;
