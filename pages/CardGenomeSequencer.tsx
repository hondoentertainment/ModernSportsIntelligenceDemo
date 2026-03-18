import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ScatterChart, Scatter, AreaChart, Area,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import {
  Dna, FlaskConical, Search, RefreshCw, TrendingUp, TrendingDown, Minus,
  Award, AlertTriangle, Users, GitCompare, BarChart3, Activity, Beaker,
  ChevronDown, Info, Zap, Shield, Eye, Layers,
} from 'lucide-react';
import type {
  GenomeProfile, GenomePairMatch, PopulationGenomics, GenomeEvolution,
  GradePrediction, CardGene, GeneCategory,
} from '../lib/core/cardGenomeService.ts';
import {
  getAllGenomes, getCardGenome, compareGenomes, getPopulationGenomics,
  findGeneticTwins, getGenomeEvolution, predictGradeFromGenome,
  getGeneDistribution, GENE_DEFINITIONS,
} from '../lib/core/cardGenomeService.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Genome Profile', icon: Dna },
  { id: 'comparison', label: 'Gene Comparison', icon: GitCompare },
  { id: 'population', label: 'Population Genomics', icon: Users },
  { id: 'twins', label: 'Genetic Twins', icon: Layers },
  { id: 'evolution', label: 'Genome Evolution', icon: Activity },
  { id: 'predictor', label: 'Grade Predictor', icon: Award },
] as const;

type TabId = typeof TABS[number]['id'];

const CATEGORY_COLORS: Record<GeneCategory, string> = {
  Physical: '#22d3ee',
  Visual: '#a78bfa',
  Chemical: '#fbbf24',
  Rarity: '#f472b6',
};

const CATEGORY_ICONS: Record<GeneCategory, React.ElementType> = {
  Physical: Shield,
  Visual: Eye,
  Chemical: Beaker,
  Rarity: Zap,
};

const DNA_BASE_COLORS: Record<string, string> = {
  A: '#22c55e',
  T: '#ef4444',
  G: '#3b82f6',
  C: '#eab308',
};

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary
// ─────────────────────────────────────────────────────────────────────────────

interface GenomeEBProps {
  children: React.ReactNode;
}

interface GenomeEBState {
  hasError: boolean;
  error: Error | null;
}

class GenomeErrorBoundary extends React.Component<GenomeEBProps, GenomeEBState> {
  state: GenomeEBState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): GenomeEBState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 rounded-xl border border-red-500/30 p-8">
          <AlertTriangle size={48} className="text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Genome Sequencer Error</h2>
          <p className="text-slate-400 text-sm text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred during genome analysis.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
          >
            Reset Sequencer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner({ message = 'Sequencing genome...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20" role="status" aria-label={message}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
        <Dna size={24} className="absolute inset-0 m-auto text-cyan-400" />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

function CardSelector({
  cards,
  selectedId,
  onChange,
  label,
}: {
  cards: GenomeProfile[];
  selectedId: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="relative">
      <label className="block text-xs text-slate-500 mb-1 font-medium">{label}</label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          aria-label={label}
        >
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.player} — {c.year} {c.set}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

/** DNA helix visualization: maps gene scores to colored base-pair blocks */
function DNAStrandVisualization({ genes }: { genes: CardGene[] }) {
  const basePairs = useMemo(() => {
    const pairs: Array<{ left: string; right: string; gene: string; score: number }> = [];
    genes.forEach((gene) => {
      const score = gene.score;
      // Map score ranges to base letters
      const leftBase = score >= 75 ? 'A' : score >= 50 ? 'G' : score >= 25 ? 'C' : 'T';
      const complement: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
      pairs.push({ left: leftBase, right: complement[leftBase], gene: gene.name, score });
    });
    return pairs;
  }, [genes]);

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        DNA Fingerprint Strand
      </h4>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-2" role="img" aria-label="DNA strand visualization showing gene scores as colored base pairs">
        {basePairs.map((bp, i) => (
          <div key={`${bp.gene}-${i}`} className="flex flex-col items-center gap-0.5 group relative">
            <div
              className="w-5 h-7 rounded-sm transition-all duration-200 group-hover:scale-y-110"
              style={{ backgroundColor: DNA_BASE_COLORS[bp.left], opacity: 0.7 + (bp.score / 333) }}
              title={`${bp.gene}: ${bp.left} (${bp.score})`}
            />
            <div className="w-px h-2 bg-slate-600" />
            <div
              className="w-5 h-7 rounded-sm transition-all duration-200 group-hover:scale-y-110"
              style={{ backgroundColor: DNA_BASE_COLORS[bp.right], opacity: 0.7 + (bp.score / 333) }}
            />
            <span className="absolute -bottom-6 text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {bp.gene.slice(0, 8)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 pt-2 border-t border-slate-700/50">
        {Object.entries(DNA_BASE_COLORS).map(([base, color]) => (
          <div key={base} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-500">
              {base} = {base === 'A' ? '75-100' : base === 'G' ? '50-74' : base === 'C' ? '25-49' : '0-24'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenomeScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'text-emerald-400 bg-emerald-500/15' :
    score >= 70 ? 'text-cyan-400 bg-cyan-500/15' :
    score >= 50 ? 'text-amber-400 bg-amber-500/15' :
    'text-red-400 bg-red-500/15';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

function MutationBadge({ flag }: { flag: string }) {
  const isPositive = ['GEM_MINT_CANDIDATE', 'FACTORY_PERFECT_CENTERING', 'PRISMATIC_ANOMALY', 'DESIRABLE_ERROR_VARIANT'].includes(flag);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
      {isPositive ? <Zap size={10} /> : <AlertTriangle size={10} />}
      {flag.replace(/_/g, ' ')}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Genome Profile
// ─────────────────────────────────────────────────────────────────────────────

function GenomeProfileTab({ profile }: { profile: GenomeProfile }) {
  const radarData = useMemo(() =>
    profile.genes.map((g) => ({
      gene: g.name.length > 12 ? g.name.slice(0, 11) + '.' : g.name,
      fullName: g.name,
      score: g.score,
      percentile: g.percentile,
    })),
    [profile]
  );

  const genesByCategory = useMemo(() => {
    const map: Record<GeneCategory, CardGene[]> = { Physical: [], Visual: [], Chemical: [], Rarity: [] };
    profile.genes.forEach((g) => map[g.category].push(g));
    return map;
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Overall Genome</p>
          <p className="text-2xl font-bold text-cyan-400">{profile.overallGenomeScore.toFixed(1)}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rarity DNA</p>
          <p className="text-lg font-mono font-bold text-fuchsia-400">#{profile.rarityDNA}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pop Similarity</p>
          <p className="text-2xl font-bold text-amber-400">{profile.genomeSimilarity}%</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
          <p className="text-2xl font-bold text-emerald-400">{profile.confidence}%</p>
        </div>
      </div>

      {/* Mutations */}
      {profile.mutationFlags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.mutationFlags.map((f) => <span key={f}><MutationBadge flag={f} /></span>)}
        </div>
      )}

      {/* Radar Chart + DNA Strand */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Gene Radar</h3>
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="gene" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Percentile" dataKey="percentile" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <DNAStrandVisualization genes={profile.genes} />
      </div>

      {/* Gene Categories Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(genesByCategory) as [GeneCategory, CardGene[]][]).map(([category, genes]) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <div key={category} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} style={{ color: CATEGORY_COLORS[category] }} />
                <h4 className="text-sm font-semibold" style={{ color: CATEGORY_COLORS[category] }}>{category} Genes</h4>
              </div>
              <div className="space-y-2">
                {genes.map((gene) => (
                  <div key={gene.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-32 flex-shrink-0 truncate" title={gene.name}>{gene.name}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${gene.score}%`,
                          backgroundColor: CATEGORY_COLORS[category],
                          opacity: 0.5 + gene.score / 200,
                        }}
                      />
                    </div>
                    <GenomeScoreBadge score={gene.score} />
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      gene.dominance === 'dominant' ? 'bg-emerald-500/10 text-emerald-400' :
                      gene.dominance === 'recessive' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {gene.dominance[0].toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heritage Lineage */}
      {profile.heritageLineage.length > 0 && (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Heritage Lineage</h4>
          <div className="flex flex-wrap gap-2">
            {profile.heritageLineage.map((h) => (
              <span key={h} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300">
                <Dna size={10} className="text-cyan-500" />
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Gene Comparison
// ─────────────────────────────────────────────────────────────────────────────

function GeneComparisonTab({
  allCards,
  primaryId,
}: {
  allCards: GenomeProfile[];
  primaryId: string;
}) {
  const [compareId, setCompareId] = useState(() => {
    const other = allCards.find((c) => c.id !== primaryId);
    return other?.id ?? primaryId;
  });
  const [match, setMatch] = useState<GenomePairMatch | null>(null);
  const [loading, setLoading] = useState(false);

  const runComparison = useCallback(async () => {
    setLoading(true);
    try {
      const result = await compareGenomes(primaryId, compareId);
      setMatch(result);
    } finally {
      setLoading(false);
    }
  }, [primaryId, compareId]);

  useEffect(() => {
    if (primaryId !== compareId) runComparison();
  }, [primaryId, compareId, runComparison]);

  const comparisonData = useMemo(() => {
    if (!match) return [];
    return match.card1.genes.map((g1) => {
      const g2 = match.card2.genes.find((g) => g.name === g1.name);
      return {
        gene: g1.name.length > 14 ? g1.name.slice(0, 13) + '.' : g1.name,
        card1: g1.score,
        card2: g2?.score ?? 0,
        diff: Math.abs(g1.score - (g2?.score ?? 0)),
      };
    });
  }, [match]);

  if (loading) return <LoadingSpinner message="Computing genetic distance..." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardSelector cards={allCards} selectedId={primaryId} onChange={() => {}} label="Card A (Primary)" />
        <CardSelector cards={allCards} selectedId={compareId} onChange={setCompareId} label="Card B (Compare)" />
      </div>

      {match && (
        <>
          {/* Distance metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Genetic Distance</p>
              <p className={`text-2xl font-bold ${match.geneticDistance < 10 ? 'text-emerald-400' : match.geneticDistance < 20 ? 'text-amber-400' : 'text-red-400'}`}>
                {match.geneticDistance}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Compatibility</p>
              <p className="text-2xl font-bold text-cyan-400">{match.compatibilityScore}%</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Shared Traits</p>
              <p className="text-2xl font-bold text-violet-400">{match.sharedTraits.length}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Divergent Traits</p>
              <p className="text-2xl font-bold text-rose-400">{match.divergentTraits.length}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-cyan-200">{match.recommendation}</p>
            </div>
          </div>

          {/* Side-by-side bar chart */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Gene-by-Gene Comparison</h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 100, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="gene" tick={{ fill: '#94a3b8', fontSize: 10 }} width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="card1" name={match.card1.player} fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="card2" name={match.card2.player} fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={8} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Shared / Divergent trait lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-emerald-500/20">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                Shared Traits (within 8 pts)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {match.sharedTraits.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px] font-medium">{t}</span>
                ))}
                {match.sharedTraits.length === 0 && <span className="text-xs text-slate-500">None</span>}
              </div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-rose-500/20">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                Divergent Traits (20+ pts apart)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {match.divergentTraits.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded text-[10px] font-medium">{t}</span>
                ))}
                {match.divergentTraits.length === 0 && <span className="text-xs text-slate-500">None</span>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Population Genomics
// ─────────────────────────────────────────────────────────────────────────────

function PopulationGenomicsTab() {
  const [sport, setSport] = useState('All');
  const [data, setData] = useState<PopulationGenomics | null>(null);
  const [selectedGene, setSelectedGene] = useState('Centering');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPopulationGenomics(sport).then((d) => { setData(d); setLoading(false); });
  }, [sport]);

  const distributionData = useMemo(() => {
    if (!data) return [];
    return data.geneDistributions[selectedGene] ?? [];
  }, [data, selectedGene]);

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.clusterGroups.flatMap((cl) =>
      cl.cards.map((_, i) => ({
        x: cl.centroidX + (Math.random() - 0.5) * 20,
        y: cl.centroidY + (Math.random() - 0.5) * 20,
        cluster: cl.label,
        fill: cl.label === 'Gem Mint Tier' ? '#22d3ee' : cl.label === 'High Grade' ? '#a78bfa' : cl.label === 'Vintage Character' ? '#fbbf24' : '#64748b',
      }))
    );
  }, [data]);

  if (loading) return <LoadingSpinner message="Analyzing population genomics..." />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Sport filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500 font-medium">Sport:</label>
        {['All', 'Basketball', 'Baseball', 'Football'].map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sport === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Population stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Total Cards</p>
          <p className="text-xl font-bold text-slate-200">{data.totalCards}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Avg Genome</p>
          <p className="text-xl font-bold text-cyan-400">{data.avgGenomeScore}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Median</p>
          <p className="text-xl font-bold text-violet-400">{data.medianGenomeScore}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Std Dev</p>
          <p className="text-xl font-bold text-amber-400">{data.stdDeviation}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Top % Threshold</p>
          <p className="text-xl font-bold text-emerald-400">{data.topPercentileThreshold}</p>
        </div>
      </div>

      {/* Gene Distribution Histogram */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Gene Distribution</h3>
          <div className="relative">
            <select
              value={selectedGene}
              onChange={(e) => setSelectedGene(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-1.5 text-xs appearance-none pr-7 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              aria-label="Select gene for distribution"
            >
              {GENE_DEFINITIONS.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: number, name: string) => [name === 'count' ? `${value} cards` : `${value}%`, name === 'count' ? 'Count' : 'Percentage']}
            />
            <Bar dataKey="count" name="Cards" radius={[6, 6, 0, 0]}>
              {distributionData.map((entry, i) => (
                <Cell key={i} fill={['#ef4444', '#f97316', '#eab308', '#22d3ee', '#22c55e'][i] ?? '#64748b'} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster Scatter */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Population Cluster Map</h3>
        <div className="text-[10px] text-slate-500 mb-2">X-axis: Physical gene avg | Y-axis: Rarity gene avg</div>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" dataKey="x" name="Physical" domain={[10, 100]} tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Physical', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 10 } }} />
            <YAxis type="number" dataKey="y" name="Rarity" domain={[10, 100]} tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Rarity', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              formatter={(value: number) => [value.toFixed(1)]}
            />
            <Scatter data={scatterData} shape="circle">
              {scatterData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.7} r={6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 mt-3">
          {data.clusterGroups.map((cl) => (
            <div key={cl.id} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{
                backgroundColor: cl.label === 'Gem Mint Tier' ? '#22d3ee' : cl.label === 'High Grade' ? '#a78bfa' : cl.label === 'Vintage Character' ? '#fbbf24' : '#64748b',
              }} />
              {cl.label} ({cl.cardCount})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Genetic Twins
// ─────────────────────────────────────────────────────────────────────────────

function GeneticTwinsTab({ primaryId, allCards }: { primaryId: string; allCards: GenomeProfile[] }) {
  const [twins, setTwins] = useState<GenomePairMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(60);

  useEffect(() => {
    setLoading(true);
    findGeneticTwins(primaryId, threshold).then((t) => { setTwins(t); setLoading(false); });
  }, [primaryId, threshold]);

  if (loading) return <LoadingSpinner message="Searching for genetic twins..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-xs text-slate-500 font-medium">Min Compatibility:</label>
        <input
          type="range"
          min={40}
          max={99}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="flex-1 max-w-xs accent-cyan-500"
          aria-label="Minimum compatibility threshold"
        />
        <span className="text-sm font-bold text-cyan-400 w-12">{threshold}%</span>
      </div>

      {twins.length === 0 ? (
        <div className="text-center py-16">
          <Search size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No genetic twins found at {threshold}% threshold.</p>
          <p className="text-slate-500 text-xs mt-1">Try lowering the compatibility threshold.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {twins.map((tw) => {
            const other = tw.card1.id === primaryId ? tw.card2 : tw.card1;
            return (
              <div key={other.id} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">{other.cardName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{other.player} | {other.year} {other.set}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500">Compatibility</p>
                      <p className={`text-lg font-bold ${tw.compatibilityScore >= 90 ? 'text-emerald-400' : tw.compatibilityScore >= 70 ? 'text-cyan-400' : 'text-amber-400'}`}>
                        {tw.compatibilityScore}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500">Distance</p>
                      <p className="text-lg font-bold text-violet-400">{tw.geneticDistance}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500">Genome</p>
                      <GenomeScoreBadge score={other.overallGenomeScore} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tw.sharedTraits.slice(0, 8).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px] font-medium">{t}</span>
                  ))}
                  {tw.divergentTraits.slice(0, 4).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 rounded text-[10px] font-medium">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">{tw.recommendation}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Genome Evolution
// ─────────────────────────────────────────────────────────────────────────────

function GenomeEvolutionTab({ primaryId }: { primaryId: string }) {
  const [evolution, setEvolution] = useState<GenomeEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGenes, setSelectedGenes] = useState<string[]>(['Centering', 'Corner Integrity', 'Surface Quality', 'Color Saturation']);

  useEffect(() => {
    setLoading(true);
    getGenomeEvolution(primaryId).then((e) => { setEvolution(e); setLoading(false); });
  }, [primaryId]);

  const lineData = useMemo(() => {
    if (!evolution) return [];
    return evolution.snapshots.map((snap) => ({
      date: snap.date,
      trigger: snap.trigger,
      overall: snap.overallScore,
      ...snap.genes,
    }));
  }, [evolution]);

  const overallAreaData = useMemo(() => {
    if (!evolution) return [];
    return evolution.snapshots.map((snap) => ({
      date: snap.date,
      score: snap.overallScore,
    }));
  }, [evolution]);

  if (loading) return <LoadingSpinner message="Mapping genome evolution..." />;
  if (!evolution) return null;

  const TrendIcon = evolution.trend === 'improving' ? TrendingUp : evolution.trend === 'degrading' ? TrendingDown : Minus;
  const trendColor = evolution.trend === 'improving' ? 'text-emerald-400' : evolution.trend === 'degrading' ? 'text-red-400' : 'text-slate-400';

  const LINE_COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#22c55e', '#fb923c'];

  return (
    <div className="space-y-6">
      {/* Evolution Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Trend</p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendIcon size={18} className={trendColor} />
            <span className={`text-sm font-bold capitalize ${trendColor}`}>{evolution.trend}</span>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Total Drift</p>
          <p className="text-xl font-bold text-amber-400">{evolution.totalDrift > 0 ? '+' : ''}{evolution.totalDrift}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Most Volatile</p>
          <p className="text-sm font-semibold text-rose-400 truncate">{evolution.mostVolatileGene}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase">Most Stable</p>
          <p className="text-sm font-semibold text-emerald-400 truncate">{evolution.mostStableGene}</p>
        </div>
      </div>

      {/* Gene toggles */}
      <div className="flex flex-wrap gap-2">
        {GENE_DEFINITIONS.map((def, i) => {
          const isActive = selectedGenes.includes(def.name);
          return (
            <button
              key={def.name}
              onClick={() => {
                setSelectedGenes((prev) =>
                  isActive ? prev.filter((g) => g !== def.name) : [...prev, def.name]
                );
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                isActive
                  ? 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10'
                  : 'border-slate-700 text-slate-500 bg-slate-800 hover:border-slate-600'
              }`}
            >
              {def.name}
            </button>
          );
        })}
      </div>

      {/* Overall score area chart */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Overall Genome Score Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={overallAreaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gene drift line chart */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Individual Gene Drift</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {selectedGenes.map((gene, i) => (
              <Line
                key={gene}
                type="monotone"
                dataKey={gene}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Snapshot timeline */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sequencing Timeline</h3>
        <div className="space-y-3">
          {evolution.snapshots.map((snap, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 w-24 flex-shrink-0">{snap.date}</span>
              <span className="text-xs text-slate-300">{snap.trigger}</span>
              <GenomeScoreBadge score={snap.overallScore} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab: Grade Predictor
// ─────────────────────────────────────────────────────────────────────────────

function GradePredictorTab({ profile }: { profile: GenomeProfile }) {
  const [prediction, setPrediction] = useState<GradePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    predictGradeFromGenome(profile.genes).then((p) => { setPrediction(p); setLoading(false); });
  }, [profile]);

  const subgradeData = useMemo(() => {
    if (!prediction) return [];
    return [
      { name: 'Centering', score: prediction.subgrades.centering, max: 10 },
      { name: 'Corners', score: prediction.subgrades.corners, max: 10 },
      { name: 'Edges', score: prediction.subgrades.edges, max: 10 },
      { name: 'Surface', score: prediction.subgrades.surface, max: 10 },
    ];
  }, [prediction]);

  if (loading) return <LoadingSpinner message="Predicting grades from genome..." />;
  if (!prediction) return null;

  return (
    <div className="space-y-6">
      {/* Grade predictions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { company: 'PSA', grade: prediction.predictedPSA, confidence: prediction.psaConfidence, color: 'text-red-400', border: 'border-red-500/20' },
          { company: 'BGS', grade: prediction.predictedBGS, confidence: prediction.bgsConfidence, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { company: 'SGC', grade: prediction.predictedSGC, confidence: prediction.sgcConfidence, color: 'text-amber-400', border: 'border-amber-500/20' },
        ].map((item) => (
          <div key={item.company} className={`bg-slate-800/60 rounded-xl p-5 border ${item.border} text-center`}>
            <p className="text-xs text-slate-500 font-medium mb-2">{item.company} Predicted Grade</p>
            <p className={`text-4xl font-extrabold ${item.color}`}>{item.grade}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Confidence</span>
                <span>{item.confidence}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.confidence}%`,
                    backgroundColor: item.confidence >= 85 ? '#22c55e' : item.confidence >= 70 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Limiting Factor */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-200">
            Limiting factor: <strong>{prediction.limitingFactor}</strong> — this gene is most likely to constrain the final grade.
          </span>
        </div>
      </div>

      {/* BGS Subgrades */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Predicted BGS Subgrades</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={subgradeData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={75} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <ReferenceLine x={9.5} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Gem', fill: '#22c55e', fontSize: 9 }} />
            <Bar dataKey="score" name="Subgrade" radius={[0, 6, 6, 0]} barSize={20}>
              {subgradeData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.score >= 9.5 ? '#22c55e' : entry.score >= 9 ? '#22d3ee' : entry.score >= 8 ? '#a78bfa' : '#f97316'}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Value Estimate */}
      <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Grading Value Analysis</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Raw Value Index</p>
            <p className="text-2xl font-bold text-slate-300">{prediction.estimatedValue.raw}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Graded Value Index</p>
            <p className="text-2xl font-bold text-emerald-400">{prediction.estimatedValue.graded}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Grading Premium</p>
            <p className="text-2xl font-bold text-cyan-400">+{prediction.estimatedValue.premium}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-3 text-center">
          Values are relative indices (base 100) showing the multiplier effect of grading on card value.
        </p>
      </div>

      {/* Full gene contribution to grade */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Gene Contribution to Grade</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={profile.genes.map((g) => ({
            gene: g.name.length > 10 ? g.name.slice(0, 9) + '.' : g.name,
            score: g.score,
            weight: g.weight * 1000,
          }))}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="gene" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
            <Radar name="Gene Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} strokeWidth={2} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

const CardGenomeSequencer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [allCards, setAllCards] = useState<GenomeProfile[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<GenomeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all genomes on mount
  useEffect(() => {
    getAllGenomes().then((cards) => {
      setAllCards(cards);
      if (cards.length > 0) {
        setSelectedCardId(cards[0].id);
        setSelectedProfile(cards[0]);
      }
      setLoading(false);
    });
  }, []);

  // Load selected card genome
  useEffect(() => {
    if (!selectedCardId) return;
    const cached = allCards.find((c) => c.id === selectedCardId);
    if (cached) {
      setSelectedProfile(cached);
    } else {
      getCardGenome(selectedCardId).then((p) => {
        if (p) setSelectedProfile(p);
      });
    }
  }, [selectedCardId, allCards]);

  const tabContent = useMemo(() => {
    if (!selectedProfile) return null;
    switch (activeTab) {
      case 'profile':
        return <GenomeProfileTab profile={selectedProfile} />;
      case 'comparison':
        return <GeneComparisonTab allCards={allCards} primaryId={selectedCardId} />;
      case 'population':
        return <PopulationGenomicsTab />;
      case 'twins':
        return <GeneticTwinsTab primaryId={selectedCardId} allCards={allCards} />;
      case 'evolution':
        return <GenomeEvolutionTab primaryId={selectedCardId} />;
      case 'predictor':
        return <GradePredictorTab profile={selectedProfile} />;
      default:
        return null;
    }
  }, [activeTab, selectedProfile, allCards, selectedCardId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Dna size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Card Genome Sequencer</h1>
            <p className="text-sm text-slate-400">Loading genome database...</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <GenomeErrorBoundary>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20">
              <Dna size={26} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Card Genome Sequencer</h1>
              <p className="text-sm text-slate-400">
                The 23andMe of trading cards — every card's unique genetic fingerprint
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <CardSelector
              cards={allCards}
              selectedId={selectedCardId}
              onChange={setSelectedCardId}
              label="Select Card"
            />
          </div>
        </div>

        {/* Selected card banner */}
        {selectedProfile && (
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center flex-shrink-0">
                <FlaskConical size={20} className="text-cyan-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-200 truncate">{selectedProfile.cardName}</h2>
                <p className="text-xs text-slate-500">{selectedProfile.player} | {selectedProfile.year} {selectedProfile.set} | #{selectedProfile.cardNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">Genome</p>
                <GenomeScoreBadge score={selectedProfile.overallGenomeScore} />
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">DNA</p>
                <span className="text-xs font-mono font-bold text-fuchsia-400">#{selectedProfile.rarityDNA}</span>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase">Mutations</p>
                <span className="text-xs font-bold text-amber-400">{selectedProfile.mutationFlags.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Genome Sequencer Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={activeTab}
          className="min-h-[500px]"
        >
          {tabContent}
        </div>
      </div>
    </GenomeErrorBoundary>
  );
};

export default CardGenomeSequencer;
