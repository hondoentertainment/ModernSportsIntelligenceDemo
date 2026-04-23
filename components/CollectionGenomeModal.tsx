// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Dna,
  Brain,
  Target,
  ShieldAlert,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Lightbulb,
  Users,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  analyzeGenome,
  getBehavioralBiases,
  getCollectorComparison,
  getTraitLabel,
  getCategoryColor,
  getSeverityColor,
  getGenomeDNAInsights,
  CollectorGenome,
  BehavioralBias,
  CollectorComparison,
  GenomeDNAInsights,
} from '../lib/core/collectionGenomeService';

interface CollectionGenomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'genome' | 'traits' | 'biases' | 'compare';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'genome', label: 'Your Genome', icon: <Dna size={16} /> },
  { id: 'traits', label: 'Traits', icon: <Brain size={16} /> },
  { id: 'biases', label: 'Biases', icon: <Eye size={16} /> },
  { id: 'compare', label: 'Compare', icon: <Users size={16} /> },
];

const CollectionGenomeModal: React.FC<CollectionGenomeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('genome');

  const handleTabChange = useCallback((id: TabId) => setActiveTab(id), []);

  const genome = useMemo(() => analyzeGenome(), []);
  const biases = useMemo(() => getBehavioralBiases(), []);
  const comparison = useMemo(() => getCollectorComparison(), []);
  const dnaInsights = useMemo(() => getGenomeDNAInsights(), []);

  if (!isOpen) return null;

  // Radar data for genome tab
  const radarData = genome.traits.map(t => ({
    trait: getTraitLabel(t.name),
    score: t.score,
  }));

  // Comparison radar data
  const comparisonRadarData = Object.keys(comparison.yourGenome).map(key => ({
    trait: getTraitLabel(key),
    you: comparison.yourGenome[key],
    average: comparison.avgCollector[key],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
              <Dna size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Collection Genome</h2>
              <p className="text-xs text-slate-500">23andMe for your card collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800/60 text-brand-lime border-b-2 border-brand-lime'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'genome' && <GenomeTab genome={genome} radarData={radarData} dnaInsights={dnaInsights} />}
          {activeTab === 'traits' && <TraitsTab genome={genome} />}
          {activeTab === 'biases' && <BiasesTab biases={biases} />}
          {activeTab === 'compare' && <CompareTab comparison={comparison} comparisonRadarData={comparisonRadarData} />}
        </div>
      </div>
    </div>
  );
};

// ---- Your Genome Tab ----

function GenomeTab({ genome, radarData, dnaInsights }: { genome: CollectorGenome; radarData: { trait: string; score: number }[]; dnaInsights: GenomeDNAInsights }) {
  return (
    <div className="space-y-6">
      {/* Card DNA Authentication Insights (Phase 83 Cross-reference) */}
      {dnaInsights.counterfeitAlerts.length > 0 && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-purple-400" />
            <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Card DNA Insights</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/40 rounded-xl p-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Auth Rate</p>
              <p className={`text-xl font-bebas ${dnaInsights.authenticationRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {dnaInsights.authenticationRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Confidence</p>
              <p className="text-xl font-bebas text-blue-400">{dnaInsights.avgConfidence.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Risk Adj</p>
              <p className={`text-xl font-bebas ${dnaInsights.riskAdjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {dnaInsights.riskAdjustment > 0 ? '+' : ''}{dnaInsights.riskAdjustment}
              </p>
            </div>
          </div>
          <ul className="space-y-1">
            {dnaInsights.genomeImpact.map((impact, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-purple-400 mt-0.5">{'>'}</span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collector Type Card */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl shrink-0">
            <Brain size={28} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-white">Value Investor / Prospect Speculator</h3>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                {genome.confidence}% match
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{genome.typeDescription}</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Target size={16} className="text-brand-lime" />
          Trait Radar
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
            <Radar
              name="Your Genome"
              dataKey="score"
              stroke="#84cc16"
              fill="#84cc16"
              fillOpacity={0.2}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths & Blind Spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            Strengths
          </h3>
          <div className="space-y-3">
            {genome.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <ArrowUpRight size={14} className="text-green-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Blind Spots */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400" />
            Blind Spots
          </h3>
          <div className="space-y-3">
            {genome.blindSpots.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-400" />
          Personalized Recommendations
        </h3>
        <div className="space-y-3">
          {genome.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
              <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-brand-lime/10 rounded-lg text-[10px] font-black text-brand-lime">
                {i + 1}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Traits Tab ----

function TraitsTab({ genome }: { genome: CollectorGenome }) {
  const categories = ['risk', 'strategy', 'preference', 'behavior'] as const;

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const catTraits = genome.traits.filter(t => t.category === category);
        const colors = getCategoryColor(category);
        return (
          <div key={category} className="space-y-3">
            <h3 className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>
              {category} Traits
            </h3>
            <div className="space-y-2">
              {catTraits.map(trait => (
                <div
                  key={trait.name}
                  className={`p-4 bg-slate-800/30 border ${colors.border} rounded-2xl space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 ${colors.bg} rounded-md text-[10px] font-black ${colors.text} uppercase tracking-widest`}>
                        {category}
                      </span>
                      <span className="text-sm font-bold text-white">{getTraitLabel(trait.name)}</span>
                    </div>
                    <span className={`text-lg font-black ${trait.score >= 70 ? 'text-brand-lime' : trait.score >= 40 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {trait.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{trait.description}</p>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        trait.score >= 70 ? 'bg-brand-lime' : trait.score >= 40 ? 'bg-amber-400' : 'bg-slate-500'
                      }`}
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Biases Tab ----

function BiasesTab({ biases }: { biases: BehavioralBias[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
        <p className="text-xs text-amber-400 font-semibold flex items-center gap-2">
          <Zap size={14} />
          We detected {biases.length} behavioral biases in your collecting patterns. Awareness is the first step to better decisions.
        </p>
      </div>

      {biases.map((bias, i) => {
        const colors = getSeverityColor(bias.severity);
        return (
          <div
            key={i}
            className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${colors.bg} rounded-lg`}>
                  <AlertTriangle size={18} className={colors.text} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{bias.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{bias.description}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 ${colors.bg} border ${colors.border} rounded-full text-[10px] font-black ${colors.text} uppercase tracking-widest`}>
                {bias.severity}
              </span>
            </div>

            {/* Example */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/30 rounded-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Evidence</p>
              <p className="text-xs text-slate-300 leading-relaxed">{bias.example}</p>
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-brand-lime/5 border border-brand-lime/10 rounded-xl">
              <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">Corrective Action</p>
              <p className="text-xs text-slate-400 leading-relaxed">{bias.recommendation}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Compare Tab ----

function CompareTab({
  comparison,
  comparisonRadarData,
}: {
  comparison: CollectorComparison;
  comparisonRadarData: { trait: string; you: number; average: number }[];
}) {
  return (
    <div className="space-y-6">
      {/* Comparison Radar */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-brand-lime" />
          Your Genome vs. Average Collector
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={comparisonRadarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
            <Radar
              name="You"
              dataKey="you"
              stroke="#84cc16"
              fill="#84cc16"
              fillOpacity={0.2}
            />
            <Radar
              name="Avg Collector"
              dataKey="average"
              stroke="#60a5fa"
              fill="#60a5fa"
              fillOpacity={0.1}
            />
            <Legend />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Percentile Breakdown */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Target size={16} className="text-purple-400" />
          Percentile Rankings
        </h3>
        <p className="text-xs text-slate-500">How you compare to all collectors on the platform</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(comparison.percentiles).map(([key, pct]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl"
            >
              <span className="text-xs font-semibold text-slate-300">{getTraitLabel(key)}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct >= 75 ? 'bg-brand-lime' : pct >= 50 ? 'bg-blue-400' : pct >= 25 ? 'bg-amber-400' : 'bg-slate-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs font-black w-10 text-right ${
                  pct >= 75 ? 'text-brand-lime' : pct >= 50 ? 'text-blue-400' : pct >= 25 ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  {pct}th
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          Notable Differences
        </h3>
        <div className="space-y-3">
          {Object.entries(comparison.yourGenome)
            .map(([key, val]) => ({
              key,
              diff: val - comparison.avgCollector[key],
              yours: val,
              avg: comparison.avgCollector[key],
            }))
            .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
            .slice(0, 5)
            .map(({ key, diff, yours, avg }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                <span className="text-xs font-semibold text-slate-300">{getTraitLabel(key)}</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-brand-lime font-bold">You: {yours}</span>
                  <span className="text-slate-500">Avg: {avg}</span>
                  <span className={`font-black ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default CollectionGenomeModal;
