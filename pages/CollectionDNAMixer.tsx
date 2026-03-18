import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Dna,
  FlaskConical,
  GalleryHorizontalEnd,
  Grid3X3,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
  BarChart3,
  Loader2,
  ChevronRight,
  Zap,
  Crown,
  Target,
  Shield,
  Activity,
} from 'lucide-react';
import type {
  CollectionDNA,
  BreedingResult,
  HybridPortfolio,
  CompatibilityScore,
  GenerationHistory,
  BreedingLeaderboardEntry,
} from '../lib/core/collectionDNAService';
import {
  getAllCollectionDNAs,
  breedCollections,
  getCompatibilityScore,
  getFullCompatibilityMatrix,
  getGenerationHistory,
  getOptimalMate,
  getBreedingLeaderboard,
} from '../lib/core/collectionDNAService';

// ────────────────────────────── Tab Definitions ──────────────────────────────

type TabKey =
  | 'dna-profiles'
  | 'breeding-lab'
  | 'offspring-gallery'
  | 'compatibility-matrix'
  | 'evolution-tracker'
  | 'optimal-mates';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: 'dna-profiles', label: 'DNA Profiles', icon: <Dna size={16} /> },
  { key: 'breeding-lab', label: 'Breeding Lab', icon: <FlaskConical size={16} /> },
  { key: 'offspring-gallery', label: 'Offspring Gallery', icon: <GalleryHorizontalEnd size={16} /> },
  { key: 'compatibility-matrix', label: 'Compatibility Matrix', icon: <Grid3X3 size={16} /> },
  { key: 'evolution-tracker', label: 'Evolution Tracker', icon: <TrendingUp size={16} /> },
  { key: 'optimal-mates', label: 'Optimal Mates', icon: <Heart size={16} /> },
];

// ────────────────────────────── Helpers ──────────────────────────────

const GENE_CATEGORY_COLORS: Record<string, string> = {
  growth: '#22c55e',
  stability: '#3b82f6',
  diversification: '#a855f7',
  liquidity: '#06b6d4',
  rarity: '#f59e0b',
  vintage: '#d97706',
  modern: '#ef4444',
  'sport-mix': '#ec4899',
};

function fitnessColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

// ────────────────────────────── Fitness Gauge ──────────────────────────────

const FitnessGauge: React.FC<{ score: number; size?: number; label?: string }> = ({
  score,
  size = 120,
  label,
}) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = fitnessColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Fitness</span>
      </div>
      {label && <span className="text-xs text-slate-400 mt-1">{label}</span>}
    </div>
  );
};

// ────────────────────────────── DNA Helix Visualization ──────────────────────────────

const DNAHelix: React.FC<{ genes1: CollectionDNA['genes']; genes2: CollectionDNA['genes']; color1: string; color2: string }> = ({
  genes1,
  genes2,
  color1,
  color2,
}) => (
  <div className="flex flex-col gap-1 w-full max-w-md mx-auto">
    {genes1.map((g, i) => {
      const g2 = genes2[i];
      const maxExpr = Math.max(g.expression, g2.expression);
      return (
        <div key={g.trait} className="flex items-center gap-2 text-xs">
          <span className="w-32 text-right text-slate-400 truncate">{g.trait}</span>
          <div className="flex-1 flex items-center gap-0.5 h-5">
            <div
              className="h-full rounded-l-sm transition-all duration-500"
              style={{
                width: `${(g.expression / maxExpr) * 50}%`,
                backgroundColor: color1,
                opacity: 0.8,
              }}
            />
            <div className="w-px h-full bg-slate-600" />
            <div
              className="h-full rounded-r-sm transition-all duration-500"
              style={{
                width: `${(g2.expression / maxExpr) * 50}%`,
                backgroundColor: color2,
                opacity: 0.8,
              }}
            />
          </div>
          <span className="w-8 text-slate-500 text-right">{g.expression}</span>
          <span className="text-slate-600">/</span>
          <span className="w-8 text-slate-500">{g2.expression}</span>
        </div>
      );
    })}
  </div>
);

// ────────────────────────────── Crossover Flow ──────────────────────────────

const CrossoverFlow: React.FC<{ result: BreedingResult; selectedOffspring: HybridPortfolio }> = ({
  result,
  selectedOffspring,
}) => {
  const cards = selectedOffspring.cards;
  const p1Cards = cards.filter((c) => c.source === 'parent1');
  const p2Cards = cards.filter((c) => c.source === 'parent2');
  const mutCards = cards.filter((c) => c.source === 'mutation');

  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      {/* Parent 1 column */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result.parent1.color }} />
          <span className="font-semibold text-slate-200">{result.parent1.ownerName}</span>
        </div>
        {p1Cards.map((c) => (
          <div
            key={c.cardId}
            className="p-2 rounded-lg border text-xs"
            style={{ borderColor: result.parent1.color + '40', backgroundColor: result.parent1.color + '10' }}
          >
            <div className="font-medium text-slate-200 truncate">{c.player}</div>
            <div className="text-slate-400 truncate">{c.cardName}</div>
            <div className="text-slate-500 mt-1">{(c.weight * 100).toFixed(0)}% weight</div>
          </div>
        ))}
      </div>

      {/* Center: offspring / mutations */}
      <div className="space-y-2 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-amber-400" />
          <span className="font-semibold text-amber-300">Offspring</span>
        </div>
        {mutCards.length > 0 && (
          <div className="w-full space-y-2">
            {mutCards.map((c) => (
              <div
                key={c.cardId}
                className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs"
              >
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="font-medium text-amber-200">MUTATION</span>
                </div>
                <div className="font-medium text-slate-200 truncate mt-1">{c.player}</div>
                <div className="text-slate-400 truncate">{c.cardName}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 flex items-center">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Crossover Points</div>
            {result.crossoverPoints.map((cp) => (
              <div key={cp} className="text-xs text-purple-400 bg-purple-500/10 rounded px-2 py-0.5 mb-1">
                {cp}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parent 2 column */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result.parent2.color }} />
          <span className="font-semibold text-slate-200">{result.parent2.ownerName}</span>
        </div>
        {p2Cards.map((c) => (
          <div
            key={c.cardId}
            className="p-2 rounded-lg border text-xs"
            style={{ borderColor: result.parent2.color + '40', backgroundColor: result.parent2.color + '10' }}
          >
            <div className="font-medium text-slate-200 truncate">{c.player}</div>
            <div className="text-slate-400 truncate">{c.cardName}</div>
            <div className="text-slate-500 mt-1">{(c.weight * 100).toFixed(0)}% weight</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ────────────────────────────── Main Component ──────────────────────────────

const CollectionDNAMixer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dna-profiles');
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionDNA[]>([]);
  const [compatMatrix, setCompatMatrix] = useState<CompatibilityScore[]>([]);
  const [leaderboard, setLeaderboard] = useState<BreedingLeaderboardEntry[]>([]);

  // Breeding Lab state
  const [selectedP1, setSelectedP1] = useState<string>('');
  const [selectedP2, setSelectedP2] = useState<string>('');
  const [breedingResult, setBreedingResult] = useState<BreedingResult | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [selectedOffspringIdx, setSelectedOffspringIdx] = useState(0);

  // Evolution Tracker state
  const [selectedBreedingId, setSelectedBreedingId] = useState('breed-001');
  const [genHistory, setGenHistory] = useState<GenerationHistory | null>(null);

  // Optimal Mates state
  const [mateForCollection, setMateForCollection] = useState<string>('');
  const [optimalMates, setOptimalMates] = useState<
    { mate: CollectionDNA; compatibility: CompatibilityScore }[]
  >([]);

  // ── Initial data load ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [dnas, matrix, board] = await Promise.all([
        getAllCollectionDNAs(),
        getFullCompatibilityMatrix(),
        getBreedingLeaderboard(),
      ]);
      if (cancelled) return;
      setCollections(dnas);
      setCompatMatrix(matrix);
      setLeaderboard(board);
      if (dnas.length > 0) {
        setSelectedP1(dnas[0].id);
        setSelectedP2(dnas.length > 3 ? dnas[3].id : dnas[1].id);
        setMateForCollection(dnas[0].id);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Breed handler ──
  const handleBreed = useCallback(async () => {
    if (!selectedP1 || !selectedP2 || selectedP1 === selectedP2) return;
    setIsBreeding(true);
    setBreedingResult(null);
    setSelectedOffspringIdx(0);
    const res = await breedCollections(selectedP1, selectedP2);
    setBreedingResult(res);
    setIsBreeding(false);
  }, [selectedP1, selectedP2]);

  // ── Load generation history when breeding id changes ──
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = await getGenerationHistory(selectedBreedingId);
      if (!cancelled) setGenHistory(hist);
    }
    load();
    return () => { cancelled = true; };
  }, [selectedBreedingId]);

  // ── Load optimal mates when selection changes ──
  useEffect(() => {
    if (!mateForCollection) return;
    let cancelled = false;
    async function load() {
      const mates = await getOptimalMate(mateForCollection);
      if (!cancelled) setOptimalMates(mates);
    }
    load();
    return () => { cancelled = true; };
  }, [mateForCollection]);

  // ── Memoized lookups ──
  const collectionsById = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections],
  );

  const compatLookup = useMemo(() => {
    const map = new Map<string, CompatibilityScore>();
    compatMatrix.forEach((c) => {
      map.set(`${c.collection1}|${c.collection2}`, c);
      map.set(`${c.collection2}|${c.collection1}`, c);
    });
    return map;
  }, [compatMatrix]);

  const selectedP1Data = useMemo(() => collectionsById.get(selectedP1), [collectionsById, selectedP1]);
  const selectedP2Data = useMemo(() => collectionsById.get(selectedP2), [collectionsById, selectedP2]);

  const currentCompatibility = useMemo(() => {
    if (!selectedP1 || !selectedP2 || selectedP1 === selectedP2) return null;
    return compatLookup.get(`${selectedP1}|${selectedP2}`) ?? null;
  }, [selectedP1, selectedP2, compatLookup]);

  const radarDataForDNA = useCallback(
    (dna: CollectionDNA) =>
      dna.genes.map((g) => ({
        trait: g.trait.replace(/\s+/g, '\n').substring(0, 18),
        value: g.expression,
        fullTrait: g.trait,
        category: g.category,
      })),
    [],
  );

  // ────────────────────────────── RENDER ──────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-purple-400" />
        <span className="ml-3 text-slate-400">Loading Collection DNA Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/20">
          <Dna size={26} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collection DNA Mixer</h1>
          <p className="text-sm text-slate-400">
            Breed two collecting strategies to discover optimal hybrid portfolios using genetic algorithm principles
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ TAB: DNA Profiles ═══════════════════════ */}
      {activeTab === 'dna-profiles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {collections.map((dna) => {
            const radar = radarDataForDNA(dna);
            return (
              <div
                key={dna.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dna.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{dna.ownerName}</h3>
                      <span
                        className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          color: dna.color,
                          backgroundColor: dna.color + '20',
                          border: `1px solid ${dna.color}40`,
                        }}
                      >
                        {dna.archetype.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <FitnessGauge score={dna.fitnessScore} size={80} />
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">{dna.strategy}</p>

                <div className="flex gap-6 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">Value</span>
                    <div className="text-slate-200 font-semibold">{formatCurrency(dna.totalValue)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cards</span>
                    <div className="text-slate-200 font-semibold">{dna.cardCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Avg / Card</span>
                    <div className="text-slate-200 font-semibold">
                      {formatCurrency(Math.round(dna.totalValue / dna.cardCount))}
                    </div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="h-52 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radar} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="fullTrait"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#475569', fontSize: 9 }}
                      />
                      <Radar
                        name={dna.ownerName}
                        dataKey="value"
                        stroke={dna.color}
                        fill={dna.color}
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Strengths / Weaknesses */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Strengths</div>
                    {dna.strengths.map((s) => (
                      <div key={s} className="text-xs text-slate-400 flex items-start gap-1 mb-0.5">
                        <ChevronRight size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">Weaknesses</div>
                    {dna.weaknesses.map((w) => (
                      <div key={w} className="text-xs text-slate-400 flex items-start gap-1 mb-0.5">
                        <ChevronRight size={10} className="text-red-500 mt-0.5 shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════ TAB: Breeding Lab ═══════════════════════ */}
      {activeTab === 'breeding-lab' && (
        <div className="space-y-6">
          {/* Parent Selection */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Parent Collection 1
              </label>
              <select
                value={selectedP1}
                onChange={(e) => { setSelectedP1(e.target.value); setBreedingResult(null); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.ownerName} — {c.archetype.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              <Dna size={20} className="text-purple-400" />
              <button
                onClick={handleBreed}
                disabled={isBreeding || selectedP1 === selectedP2}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                {isBreeding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Breeding...
                  </>
                ) : (
                  <>
                    <FlaskConical size={14} /> Breed
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Parent Collection 2
              </label>
              <select
                value={selectedP2}
                onChange={(e) => { setSelectedP2(e.target.value); setBreedingResult(null); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.ownerName} — {c.archetype.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compatibility indicator */}
          {currentCompatibility && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-pink-400" />
                <span className="text-sm text-slate-300 font-medium">Breeding Potential</span>
              </div>
              <div className="flex-1 bg-slate-800 rounded-full h-3 min-w-[120px]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${currentCompatibility.breedingPotential}%`,
                    backgroundColor:
                      currentCompatibility.breedingPotential >= 70
                        ? '#22c55e'
                        : currentCompatibility.breedingPotential >= 45
                          ? '#f59e0b'
                          : '#ef4444',
                  }}
                />
              </div>
              <span className="text-lg font-black text-slate-200">
                {currentCompatibility.breedingPotential}%
              </span>
              <div className="text-xs text-slate-500">
                Genetic Distance: {currentCompatibility.geneticDistance}
              </div>
            </div>
          )}

          {/* DNA Helix comparison */}
          {selectedP1Data && selectedP2Data && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                Gene Expression Comparison
              </h3>
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedP1Data.color }} />
                  <span className="text-slate-400">{selectedP1Data.ownerName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedP2Data.color }} />
                  <span className="text-slate-400">{selectedP2Data.ownerName}</span>
                </div>
              </div>
              <DNAHelix
                genes1={selectedP1Data.genes}
                genes2={selectedP2Data.genes}
                color1={selectedP1Data.color}
                color2={selectedP2Data.color}
              />
            </div>
          )}

          {/* Breeding Result */}
          {breedingResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Offspring — Generation {breedingResult.generationNumber}
                </h3>
                <span className="text-xs text-slate-500 ml-2">
                  Mutation Rate: {(breedingResult.mutationRate * 100).toFixed(0)}%
                </span>
              </div>

              {/* Offspring selector */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {breedingResult.offspring.map((off, idx) => (
                  <button
                    key={off.id}
                    onClick={() => setSelectedOffspringIdx(idx)}
                    className={`flex-shrink-0 p-3 rounded-xl border text-left transition-all ${
                      idx === selectedOffspringIdx
                        ? 'border-purple-500/60 bg-purple-500/10'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-200">{off.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-emerald-400">+{off.projectedReturn.toFixed(1)}% ret</span>
                      <span className="text-amber-400">{off.projectedRisk.toFixed(1)}% risk</span>
                      <span style={{ color: fitnessColor(off.fitnessScore) }}>
                        Fit: {off.fitnessScore}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected offspring detail */}
              {breedingResult.offspring[selectedOffspringIdx] && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-100">
                        {breedingResult.offspring[selectedOffspringIdx].name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>
                          Inherited: {breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent1Percent}% P1 / {breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent2Percent}% P2
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <FitnessGauge
                        score={breedingResult.offspring[selectedOffspringIdx].fitnessScore}
                        size={90}
                        label={`Gen ${breedingResult.generationNumber}`}
                      />
                    </div>
                  </div>

                  {/* Mutations */}
                  {breedingResult.offspring[selectedOffspringIdx].mutations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {breedingResult.offspring[selectedOffspringIdx].mutations.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300"
                        >
                          <Sparkles size={10} className="text-amber-400" />
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Crossover flow */}
                  <CrossoverFlow
                    result={breedingResult}
                    selectedOffspring={breedingResult.offspring[selectedOffspringIdx]}
                  />

                  {/* Inheritance bar */}
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Inheritance Breakdown</div>
                    <div className="flex h-4 rounded-full overflow-hidden">
                      <div
                        className="transition-all duration-500"
                        style={{
                          width: `${breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent1Percent}%`,
                          backgroundColor: breedingResult.parent1.color,
                        }}
                      />
                      <div
                        className="transition-all duration-500"
                        style={{
                          width: `${breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent2Percent}%`,
                          backgroundColor: breedingResult.parent2.color,
                        }}
                      />
                      <div
                        className="transition-all duration-500 bg-amber-500"
                        style={{
                          width: `${100 - breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent1Percent - breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent2Percent}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span style={{ color: breedingResult.parent1.color }}>
                        {breedingResult.parent1.ownerName} ({breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent1Percent}%)
                      </span>
                      <span className="text-amber-400">
                        Mutations ({100 - breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent1Percent - breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent2Percent}%)
                      </span>
                      <span style={{ color: breedingResult.parent2.color }}>
                        {breedingResult.parent2.ownerName} ({breedingResult.offspring[selectedOffspringIdx].inheritedFrom.parent2Percent}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════ TAB: Offspring Gallery ═══════════════════════ */}
      {activeTab === 'offspring-gallery' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">Breeding Leaderboard</h3>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Offspring</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parents</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fitness</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Return</th>
                  <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gen</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr
                    key={`${entry.breedingId}-${entry.bestOffspringName}`}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <span className={`text-sm font-black ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-200">{entry.bestOffspringName}</td>
                    <td className="p-4">
                      <div className="text-xs text-slate-400">{entry.parent1Name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <ArrowRight size={8} /> {entry.parent2Name}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className="text-sm font-black"
                        style={{ color: fitnessColor(entry.fitnessScore) }}
                      >
                        {entry.fitnessScore}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-emerald-400">
                      +{entry.projectedReturn.toFixed(1)}%
                    </td>
                    <td className="p-4 text-sm text-slate-400">Gen {entry.generation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fitness distribution scatter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Risk vs. Return — All Offspring
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="risk"
                    name="Projected Risk"
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Projected Risk (%)', position: 'bottom', fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="ret"
                    name="Projected Return"
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    label={{ value: 'Projected Return (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  />
                  <Scatter
                    name="Offspring"
                    data={leaderboard.map((e) => ({
                      risk: Number((e.projectedReturn * 0.65 + Math.random() * 5).toFixed(1)),
                      ret: e.projectedReturn,
                      fitness: e.fitnessScore,
                      name: e.bestOffspringName,
                    }))}
                  >
                    {leaderboard.map((e, i) => (
                      <Cell key={i} fill={fitnessColor(e.fitnessScore)} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Compatibility Matrix ═══════════════════════ */}
      {activeTab === 'compatibility-matrix' && (
        <div className="space-y-6">
          <p className="text-sm text-slate-400">
            Heat map showing breeding potential between each pair of collection archetypes. Higher values (green) indicate more complementary strategies.
          </p>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] text-slate-500" />
                  {collections.map((c) => (
                    <th key={c.id} className="p-2 text-[10px] text-slate-400 font-semibold truncate max-w-[80px]" title={c.ownerName}>
                      <span className="mr-1">{c.icon}</span>
                      {c.archetype.split('-')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collections.map((row) => (
                  <tr key={row.id}>
                    <td className="p-2 text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                      <span className="mr-1">{row.icon}</span>
                      {row.archetype.replace(/-/g, ' ')}
                    </td>
                    {collections.map((col) => {
                      if (row.id === col.id) {
                        return (
                          <td key={col.id} className="p-1">
                            <div className="w-full h-10 rounded bg-slate-800/50 flex items-center justify-center text-slate-600 text-[10px]">
                              --
                            </div>
                          </td>
                        );
                      }
                      const compat = compatLookup.get(`${row.id}|${col.id}`);
                      const pot = compat?.breedingPotential ?? 0;
                      const bg =
                        pot >= 70
                          ? `rgba(34, 197, 94, ${pot / 150})`
                          : pot >= 45
                            ? `rgba(245, 158, 11, ${pot / 150})`
                            : `rgba(239, 68, 68, ${pot / 200})`;
                      return (
                        <td key={col.id} className="p-1">
                          <div
                            className="w-full h-10 rounded flex items-center justify-center text-xs font-bold text-white/90 cursor-default transition-transform hover:scale-110"
                            style={{ backgroundColor: bg }}
                            title={`${row.ownerName} x ${col.ownerName}: ${pot}% potential`}
                          >
                            {pot}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top pairings list */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Top 5 Breeding Pairs by Potential
            </h3>
            <div className="space-y-3">
              {[...compatMatrix]
                .sort((a, b) => b.breedingPotential - a.breedingPotential)
                .slice(0, 5)
                .map((c, idx) => {
                  const c1 = collectionsById.get(c.collection1);
                  const c2 = collectionsById.get(c.collection2);
                  if (!c1 || !c2) return null;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30">
                      <span className="text-sm font-black text-slate-500 w-6">#{idx + 1}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span>{c1.icon}</span>
                        <span className="text-sm text-slate-200 truncate">{c1.ownerName}</span>
                        <Zap size={12} className="text-purple-400 shrink-0" />
                        <span>{c2.icon}</span>
                        <span className="text-sm text-slate-200 truncate">{c2.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-800 rounded-full h-2.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.breedingPotential}%`,
                              backgroundColor: fitnessColor(c.breedingPotential),
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-200 w-10 text-right">
                          {c.breedingPotential}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Compatibility bar chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Breeding Potential Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...compatMatrix]
                    .sort((a, b) => b.breedingPotential - a.breedingPotential)
                    .slice(0, 12)
                    .map((c) => {
                      const c1 = collectionsById.get(c.collection1);
                      const c2 = collectionsById.get(c.collection2);
                      return {
                        pair: `${c1?.icon ?? ''} x ${c2?.icon ?? ''}`,
                        potential: c.breedingPotential,
                        distance: c.geneticDistance,
                      };
                    })}
                  margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                >
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis dataKey="pair" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="potential" name="Breeding Potential" radius={[4, 4, 0, 0]}>
                    {[...compatMatrix]
                      .sort((a, b) => b.breedingPotential - a.breedingPotential)
                      .slice(0, 12)
                      .map((c, i) => (
                        <Cell key={i} fill={fitnessColor(c.breedingPotential)} fillOpacity={0.8} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: Evolution Tracker ═══════════════════════ */}
      {activeTab === 'evolution-tracker' && (
        <div className="space-y-6">
          {/* Breeding pair selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Breeding Pair
            </label>
            <select
              value={selectedBreedingId}
              onChange={(e) => setSelectedBreedingId(e.target.value)}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="breed-001">Blue Chipper x Modern Speculator</option>
              <option value="breed-002">Vintage Purist x Prospect Farmer</option>
              <option value="breed-003">Diversifier x Grail Hunter</option>
              <option value="breed-004">Niche Expert x Volume Trader</option>
            </select>
          </div>

          {genHistory && (
            <>
              {/* Fitness Line Chart */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Fitness Over Generations
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={genHistory.generations} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                      <defs>
                        <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" />
                      <XAxis
                        dataKey="number"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'Generation', position: 'bottom', fill: '#64748b', fontSize: 11, dy: 5 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        label={{ value: 'Fitness Score', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#e2e8f0' }}
                        labelFormatter={(v) => `Generation ${v}`}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="bestFitness"
                        name="Best Fitness"
                        stroke="#a855f7"
                        strokeWidth={3}
                        fill="url(#bestGrad)"
                        dot={{ fill: '#a855f7', r: 4 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgFitness"
                        name="Avg Fitness"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#avgGrad)"
                        dot={{ fill: '#06b6d4', r: 3 }}
                        strokeDasharray="5 3"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Generation timeline cards */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Generation Timeline
                </h3>
                <div className="space-y-3">
                  {genHistory.generations.map((gen, idx) => {
                    const isLast = idx === genHistory.generations.length - 1;
                    const improvement =
                      idx > 0
                        ? gen.bestFitness - genHistory.generations[idx - 1].bestFitness
                        : 0;
                    return (
                      <div
                        key={gen.number}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                          isLast
                            ? 'border-purple-500/40 bg-purple-500/10'
                            : 'border-slate-800 bg-slate-800/20'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                            isLast ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {gen.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200 truncate">
                            {gen.topOffspring}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Best: <span style={{ color: fitnessColor(gen.bestFitness) }}>{gen.bestFitness}</span></span>
                            <span>Avg: {gen.avgFitness}</span>
                            {improvement > 0 && (
                              <span className="text-emerald-400">+{improvement} improvement</span>
                            )}
                          </div>
                        </div>
                        <div className="w-20 bg-slate-800 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${gen.bestFitness}%`,
                              backgroundColor: fitnessColor(gen.bestFitness),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement rate chart */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Per-Generation Improvement
                </h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={genHistory.generations.map((g, i) => ({
                        gen: `Gen ${g.number}`,
                        improvement:
                          i > 0 ? g.bestFitness - genHistory.generations[i - 1].bestFitness : 0,
                        gap: g.bestFitness - g.avgFitness,
                      }))}
                      margin={{ top: 10, right: 20, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid stroke="#1e293b" />
                      <XAxis dataKey="gen" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 8 }} />
                      <Line
                        type="monotone"
                        dataKey="improvement"
                        name="Fitness Improvement"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gap"
                        name="Best-Avg Gap"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', r: 3 }}
                        strokeDasharray="4 2"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════ TAB: Optimal Mates ═══════════════════════ */}
      {activeTab === 'optimal-mates' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Find Best Mates For
            </label>
            <select
              value={mateForCollection}
              onChange={(e) => setMateForCollection(e.target.value)}
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.ownerName} — {c.archetype.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Selected collection summary */}
          {mateForCollection && collectionsById.get(mateForCollection) && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              {(() => {
                const sel = collectionsById.get(mateForCollection)!;
                return (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{sel.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-100">{sel.ownerName}</h3>
                      <p className="text-sm text-slate-400">{sel.strategy}</p>
                    </div>
                    <div className="relative">
                      <FitnessGauge score={sel.fitnessScore} size={80} />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Ranked mate list */}
          <div className="space-y-3">
            {optimalMates.map((entry, idx) => (
              <div
                key={entry.mate.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                      idx === 0
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  <span className="text-2xl">{entry.mate.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">{entry.mate.ownerName}</span>
                      <span
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          color: entry.mate.color,
                          backgroundColor: entry.mate.color + '20',
                        }}
                      >
                        {entry.mate.archetype.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{entry.mate.strategy}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black" style={{ color: fitnessColor(entry.compatibility.breedingPotential) }}>
                      {entry.compatibility.breedingPotential}%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">Potential</div>
                  </div>
                </div>

                {/* Compatibility bar */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 rounded-full h-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${entry.compatibility.breedingPotential}%`,
                        backgroundColor: fitnessColor(entry.compatibility.breedingPotential),
                      }}
                    />
                  </div>
                </div>

                {/* Traits */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {entry.compatibility.complementaryTraits.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
                        Complementary
                      </div>
                      {entry.compatibility.complementaryTraits.map((t) => (
                        <div key={t} className="text-xs text-slate-400 flex items-start gap-1 mb-0.5">
                          <Target size={9} className="text-emerald-500 mt-0.5 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.compatibility.conflictingTraits.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">
                        Conflicts
                      </div>
                      {entry.compatibility.conflictingTraits.map((t) => (
                        <div key={t} className="text-xs text-slate-400 flex items-start gap-1 mb-0.5">
                          <Shield size={9} className="text-red-500 mt-0.5 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Radar overlay of selected + top mate */}
          {optimalMates.length > 0 && mateForCollection && collectionsById.get(mateForCollection) && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                Gene Profile Overlay — You vs. Best Mate
              </h3>
              <div className="h-72">
                {(() => {
                  const sel = collectionsById.get(mateForCollection)!;
                  const mate = optimalMates[0].mate;
                  const data = sel.genes.map((g, i) => ({
                    trait: g.trait,
                    selected: g.expression,
                    mate: mate.genes[i].expression,
                  }));
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="trait" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                        <Radar
                          name={sel.ownerName}
                          dataKey="selected"
                          stroke={sel.color}
                          fill={sel.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Radar
                          name={mate.ownerName}
                          dataKey="mate"
                          stroke={mate.color}
                          fill={mate.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                          labelStyle={{ color: '#e2e8f0' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionDNAMixer;
