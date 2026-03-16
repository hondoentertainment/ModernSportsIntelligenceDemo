import React, { useState, useEffect, useMemo } from 'react';
import {
  Fingerprint,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Eye,
  Users,
  BarChart3,
  Clock,
  MapPin,
  Shield,
  ChevronRight,
  ExternalLink,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getCensusCards,
  getAllKnownExamples,
  getOwnerDistributionSummary,
  searchCensus,
  CensusCard,
  KnownExample,
} from '../lib/conditionCensusService';

type TabId = 'dashboard' | 'examples' | 'predictions' | 'trends' | 'owners';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Census Dashboard' },
  { id: 'examples', label: 'Known Examples' },
  { id: 'predictions', label: 'Surface Predictions' },
  { id: 'trends', label: 'Population Trends' },
  { id: 'owners', label: 'Owner Intelligence' },
];

const PIE_COLORS = ['#84cc16', '#22d3ee', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function getRarityColor(score: number): string {
  if (score >= 90) return 'text-red-400';
  if (score >= 70) return 'text-orange-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-lime-400';
}

function getRarityBg(score: number): string {
  if (score >= 90) return 'bg-red-500';
  if (score >= 70) return 'bg-orange-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-lime-500';
}

function getCategoryBadge(category: string): string {
  switch (category) {
    case 'ultra-rare': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'rare': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'scarce': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'rising': return <TrendingUp className="w-4 h-4 text-lime-400" />;
    case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
    default: return <Minus className="w-4 h-4 text-slate-400" />;
  }
}

function getProbabilityColor(pct: number): string {
  if (pct >= 80) return 'bg-lime-500';
  if (pct >= 50) return 'bg-yellow-500';
  if (pct >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

function getProbabilityTextColor(pct: number): string {
  if (pct >= 80) return 'text-lime-400';
  if (pct >= 50) return 'text-yellow-400';
  if (pct >= 20) return 'text-orange-400';
  return 'text-red-400';
}

// --- Sub-Components ---

function RarityMeter({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">Rarity</span>
        <span className={`text-xs font-bold ${getRarityColor(score)}`}>{score}/100</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getRarityBg(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ProbabilityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${getProbabilityColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-12 text-right ${getProbabilityTextColor(value)}`}>{value}%</span>
    </div>
  );
}

function StatCard({ label, value, icon, accent = false }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <div className={accent ? 'text-lime-400' : 'text-slate-400'}>{icon}</div>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-lime-400' : 'text-slate-100'}`}>{value}</p>
    </div>
  );
}

// --- Census Dashboard Tab ---

function CensusDashboard({ cards, onSelectCard }: { cards: CensusCard[]; onSelectCard: (card: CensusCard) => void }) {
  const totalTracked = cards.length;
  const totalTopGrade = cards.reduce((sum, c) => sum + c.topGradePop, 0);
  const totalValue = cards.reduce((sum, c) => sum + c.lastSalePrice, 0);
  const ultraRare = cards.filter(c => c.category === 'ultra-rare').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cards Tracked" value={totalTracked.toString()} icon={<Fingerprint className="w-5 h-5" />} accent />
        <StatCard label="Total Top Grade Pop" value={formatNumber(totalTopGrade)} icon={<Shield className="w-5 h-5" />} />
        <StatCard label="Aggregate Last Sale" value={formatCurrency(totalValue)} icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard label="Ultra-Rare Entries" value={ultraRare.toString()} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => onSelectCard(card)}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-lime-500/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-100 font-semibold text-sm truncate group-hover:text-lime-400 transition-colors">
                  {card.playerName}
                </h3>
                <p className="text-slate-400 text-xs truncate mt-0.5">{card.cardName}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ml-2 ${getCategoryBadge(card.category)}`}>
                {card.category}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-500">Top Grade</p>
                <p className="text-sm font-bold text-slate-100">{card.topGrade}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pop</p>
                <p className="text-sm font-bold text-lime-400">{formatNumber(card.topGradePop)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Graded</p>
                <p className="text-sm font-bold text-slate-100">{formatNumber(card.totalPop)}</p>
              </div>
            </div>

            <RarityMeter score={card.rarityScore} />

            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Last Sale</p>
                <p className="text-sm font-bold text-slate-100">{formatCurrency(card.lastSalePrice)}</p>
                <p className="text-xs text-slate-500">{card.lastSaleVenue} &middot; {card.lastSaleDate}</p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(card.marketTrend)}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-lime-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Known Examples Tab ---

function KnownExamplesTab({ cards }: { cards: CensusCard[] }) {
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const allExamples = useMemo(() => {
    const result: { card: CensusCard; example: KnownExample }[] = [];
    cards.forEach(card => {
      card.knownExamples.forEach(ex => {
        result.push({ card, example: ex });
      });
    });
    return result.sort((a, b) => b.example.lastSalePrice - a.example.lastSalePrice);
  }, [cards]);

  if (allExamples.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
        <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No tracked examples with provenance data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider font-medium">
          <div className="col-span-3">Card / Player</div>
          <div className="col-span-2">Grade</div>
          <div className="col-span-2">Last Sale</div>
          <div className="col-span-2">Venue</div>
          <div className="col-span-2">Current Owner</div>
          <div className="col-span-1">Confidence</div>
        </div>

        {allExamples.map(({ card, example }) => (
          <div key={example.id}>
            <div
              onClick={() => setExpandedExample(expandedExample === example.id ? null : example.id)}
              className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors items-center"
            >
              <div className="col-span-3">
                <p className="text-sm font-semibold text-slate-100 truncate">{card.playerName}</p>
                <p className="text-xs text-slate-500 truncate">{card.cardName}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-bold text-lime-400">{example.grade}</span>
                <p className="text-xs text-slate-500">{example.serialIdentifier}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-bold text-slate-100">{formatCurrency(example.lastSalePrice)}</p>
                <p className="text-xs text-slate-500">{example.lastSaleDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-300 truncate">{example.lastSaleVenue}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-300 truncate">{example.currentOwner.name}</p>
                <p className="text-xs text-slate-500 capitalize">{example.currentOwner.type.replace('_', ' ')}</p>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className={`text-xs font-bold ${example.currentOwner.confidence >= 80 ? 'text-lime-400' : example.currentOwner.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {example.currentOwner.confidence}%
                  </span>
                </div>
              </div>
            </div>

            {expandedExample === example.id && (
              <div className="px-5 py-4 bg-slate-900/50 border-b border-slate-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-lime-400" />
                      Provenance Chain
                    </h4>
                    <div className="space-y-2">
                      {example.provenanceChain.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${idx === example.provenanceChain.length - 1 ? 'bg-lime-500' : 'bg-slate-600'}`} />
                            {idx < example.provenanceChain.length - 1 && <div className="w-px h-6 bg-slate-700" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-sm text-slate-200">{step.owner}</p>
                            <p className="text-xs text-slate-500">
                              {step.venue} &middot; {step.dateAcquired}
                              {step.price > 0 ? ` \u00b7 ${formatCurrency(step.price)}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 mb-2">Condition Notes</h4>
                      <p className="text-sm text-slate-400">{example.condition}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 mb-2">Intelligence Notes</h4>
                      <p className="text-sm text-slate-400">{example.notes}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Owner Region</p>
                        <p className="text-sm text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {example.currentOwner.region}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Last Verified</p>
                        <p className="text-sm text-slate-300">{example.lastVerified}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Surface Predictions Tab ---

function SurfacePredictionsTab({ cards }: { cards: CensusCard[] }) {
  const predictionData = useMemo(() =>
    cards
      .map(c => ({
        name: c.playerName,
        '6 Months': c.surfaceProbability.sixMonthProbability,
        '12 Months': c.surfaceProbability.twelveMonthProbability,
        '24 Months': c.surfaceProbability.twentyFourMonthProbability,
      }))
      .sort((a, b) => a['6 Months'] - b['6 Months']),
    [cards]
  );

  const timelineData = useMemo(() => {
    const months = ['Apr 2025', 'Jul 2025', 'Oct 2025', 'Jan 2026', 'Apr 2026', 'Jul 2026'];
    return months.map((month, i) => {
      const entry: Record<string, string | number> = { month };
      cards.slice(0, 6).forEach(c => {
        const base = c.surfaceProbability.sixMonthProbability;
        const growth = (c.surfaceProbability.twentyFourMonthProbability - base) / 6;
        entry[c.playerName] = Math.min(100, Math.round(base + growth * (i + 1)));
      });
      return entry;
    });
  }, [cards]);

  const topPlayers = cards.slice(0, 6).map(c => c.playerName);
  const lineColors = ['#84cc16', '#22d3ee', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Surface Probability by Card</h3>
        <p className="text-sm text-slate-400 mb-6">Estimated chance a top-condition example appears at auction within the given timeframe.</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictionData} layout="vertical" margin={{ left: 100, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              <Bar dataKey="6 Months" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="12 Months" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="24 Months" fill="#84cc16" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Surface Probability Timeline</h3>
        <p className="text-sm text-slate-400 mb-6">Projected probability of a top-grade example surfacing over the next 18 months (top 6 cards).</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              {topPlayers.map((player, idx) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={lineColors[idx]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: lineColors[idx] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards
          .sort((a, b) => a.surfaceProbability.sixMonthProbability - b.surfaceProbability.sixMonthProbability)
          .slice(0, 6)
          .map(card => (
            <div key={card.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{card.playerName}</h4>
                  <p className="text-xs text-slate-500">{card.topGrade} &middot; Pop {card.topGradePop}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBadge(card.category)}`}>
                  {card.category}
                </span>
              </div>
              <div className="space-y-2">
                <ProbabilityBar label="6 months" value={card.surfaceProbability.sixMonthProbability} />
                <ProbabilityBar label="12 months" value={card.surfaceProbability.twelveMonthProbability} />
                <ProbabilityBar label="24 months" value={card.surfaceProbability.twentyFourMonthProbability} />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-2">Key Factors</p>
                {card.surfaceProbability.factors.slice(0, 3).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${f.impact === 'positive' ? 'bg-lime-500' : f.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    <span className="text-xs text-slate-400">{f.factor}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Next Likely Venue</p>
                  <p className="text-sm text-slate-300">{card.surfaceProbability.nextLikelyVenue}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Est. Price</p>
                  <p className="text-sm font-bold text-lime-400">{formatCurrency(card.surfaceProbability.estimatedNextPrice)}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// --- Population Trends Tab ---

function PopulationTrendsTab({ cards, selectedCard }: { cards: CensusCard[]; selectedCard: CensusCard | null }) {
  const [activeCard, setActiveCard] = useState<CensusCard | null>(selectedCard || cards[0] || null);

  useEffect(() => {
    if (selectedCard) setActiveCard(selectedCard);
  }, [selectedCard]);

  const popData = useMemo(() => {
    if (!activeCard) return [];
    return activeCard.populationReport.popHistory.map(entry => ({
      year: entry.date.slice(0, 4),
      'PSA 10': entry.psa10,
      'PSA 9': entry.psa9,
      'BGS 10': entry.bgs10,
      'BGS 9.5': entry.bgs95,
      'Total Graded': entry.totalGraded,
    }));
  }, [activeCard]);

  const comparisonData = useMemo(() => {
    return cards.map(c => ({
      name: c.playerName,
      'PSA 10 Pop': c.populationReport.psa10Pop,
      'Total Graded': c.populationReport.totalGraded,
      'Rarity Score': c.rarityScore,
    }));
  }, [cards]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Population Growth Over Time</h3>
            <p className="text-sm text-slate-400">Track how grading populations have changed year over year.</p>
          </div>
          <select
            value={activeCard?.id || ''}
            onChange={(e) => setActiveCard(cards.find(c => c.id === e.target.value) || null)}
            className="bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-lime-500 focus:outline-none"
          >
            {cards.map(c => (
              <option key={c.id} value={c.id}>{c.playerName} — {c.year} {c.manufacturer}</option>
            ))}
          </select>
        </div>

        {activeCard && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">PSA 10</p>
                <p className="text-lg font-bold text-lime-400">{formatNumber(activeCard.populationReport.psa10Pop)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">PSA 9</p>
                <p className="text-lg font-bold text-slate-100">{formatNumber(activeCard.populationReport.psa9Pop)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">BGS 10</p>
                <p className="text-lg font-bold text-cyan-400">{formatNumber(activeCard.populationReport.bgs10Pop)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">BGS 9.5</p>
                <p className="text-lg font-bold text-slate-100">{formatNumber(activeCard.populationReport.bgs95Pop)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Total Graded</p>
                <p className="text-lg font-bold text-slate-100">{formatNumber(activeCard.populationReport.totalGraded)}</p>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={popData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="PSA 10" stroke="#84cc16" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="PSA 9" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="BGS 9.5" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Total Graded" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Population Comparison</h3>
        <p className="text-sm text-slate-400 mb-6">PSA 10 population across all tracked cards.</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="PSA 10 Pop" fill="#84cc16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- Owner Intelligence Tab ---

function OwnerIntelligenceTab({ cards }: { cards: CensusCard[] }) {
  const [ownerSummary, setOwnerSummary] = useState<{ type: string; totalCount: number; percentage: number }[]>([]);

  useEffect(() => {
    getOwnerDistributionSummary().then(setOwnerSummary);
  }, []);

  const pieData = useMemo(() =>
    ownerSummary.map(o => ({ name: o.type, value: o.totalCount })),
    [ownerSummary]
  );

  const cardOwnerData = useMemo(() =>
    cards.map(c => ({
      name: c.playerName,
      ...Object.fromEntries(c.ownerDistribution.map(od => [od.type, od.count])),
    })),
    [cards]
  );

  const ownerTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach(c => c.ownerDistribution.forEach(od => types.add(od.type)));
    return Array.from(types);
  }, [cards]);

  const ownerBarColors: Record<string, string> = {
    Collectors: '#84cc16',
    Dealers: '#22d3ee',
    Institutions: '#f59e0b',
    'Auction Houses': '#8b5cf6',
    Unknown: '#64748b',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Global Owner Distribution</h3>
          <p className="text-sm text-slate-400 mb-6">Aggregate owner type distribution across all tracked top-grade examples.</p>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Owner Summary</h3>
          <p className="text-sm text-slate-400 mb-6">Total known or estimated holders by category.</p>
          <div className="space-y-4">
            {ownerSummary.map((owner, idx) => (
              <div key={owner.type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-sm text-slate-200">{owner.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-100">{formatNumber(owner.totalCount)}</span>
                    <span className="text-xs text-slate-500 w-10 text-right">{owner.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${owner.percentage}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Owner Distribution by Card</h3>
        <p className="text-sm text-slate-400 mb-6">How ownership breaks down for each tracked card.</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cardOwnerData} margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
              />
              <Legend />
              {ownerTypes.map((type) => (
                <Bar key={type} dataKey={type} stackId="a" fill={ownerBarColors[type] || '#64748b'} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Likely Owner Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards
            .filter(c => c.knownExamples.length > 0)
            .flatMap(c => c.knownExamples.map(ex => ({ card: c, example: ex })))
            .sort((a, b) => b.example.currentOwner.confidence - a.example.currentOwner.confidence)
            .slice(0, 6)
            .map(({ card, example }) => (
              <div key={example.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{card.playerName}</p>
                    <p className="text-xs text-slate-500">{example.grade} &middot; {example.serialIdentifier}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    example.currentOwner.confidence >= 80 ? 'bg-lime-500/20 text-lime-400' :
                    example.currentOwner.confidence >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {example.currentOwner.confidence}% conf
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm text-slate-300">{example.currentOwner.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-sm text-slate-400">{example.currentOwner.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 capitalize px-1.5 py-0.5 bg-slate-800 rounded">
                      {example.currentOwner.type.replace('_', ' ')}
                    </span>
                    {example.currentOwner.estimatedNetWorth && (
                      <span className="text-xs text-slate-500">Est. {example.currentOwner.estimatedNetWorth}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Last Acquisition</p>
                    <p className="text-xs text-slate-400">{example.currentOwner.acquisitionVenue}</p>
                  </div>
                  <p className="text-sm font-bold text-lime-400">{formatCurrency(example.lastSalePrice)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function ConditionCensus() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [cards, setCards] = useState<CensusCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CensusCard | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rarity');

  useEffect(() => {
    getCensusCards().then(data => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const filteredCards = useMemo(() => {
    let result = [...cards];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.playerName.toLowerCase().includes(q) ||
        c.cardName.toLowerCase().includes(q) ||
        c.sport.toLowerCase().includes(q)
      );
    }

    if (sportFilter !== 'all') {
      result = result.filter(c => c.sport === sportFilter);
    }

    switch (sortBy) {
      case 'rarity':
        result.sort((a, b) => b.rarityScore - a.rarityScore);
        break;
      case 'price':
        result.sort((a, b) => b.lastSalePrice - a.lastSalePrice);
        break;
      case 'pop':
        result.sort((a, b) => a.topGradePop - b.topGradePop);
        break;
      case 'name':
        result.sort((a, b) => a.playerName.localeCompare(b.playerName));
        break;
    }

    return result;
  }, [cards, searchQuery, sportFilter, sortBy]);

  const sports = useMemo(() => {
    const unique = new Set(cards.map(c => c.sport));
    return Array.from(unique).sort();
  }, [cards]);

  const handleSelectCard = (card: CensusCard) => {
    setSelectedCard(card);
    setActiveTab('trends');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Fingerprint className="w-12 h-12 text-lime-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading condition census data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-lime-500/20 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Condition Census Tracker</h1>
              <p className="text-sm text-slate-400">
                Intelligence network tracking known populations of top-condition examples across grading services
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cards, players, or sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-700 focus:border-lime-500 focus:outline-none placeholder-slate-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="bg-slate-800 text-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm border border-slate-700 focus:border-lime-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Sports</option>
                {sports.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 text-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm border border-slate-700 focus:border-lime-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="rarity">Sort: Rarity</option>
                <option value="price">Sort: Price</option>
                <option value="pop">Sort: Population (Low)</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-lime-400 border-b-2 border-lime-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <CensusDashboard cards={filteredCards} onSelectCard={handleSelectCard} />
        )}
        {activeTab === 'examples' && (
          <KnownExamplesTab cards={filteredCards} />
        )}
        {activeTab === 'predictions' && (
          <SurfacePredictionsTab cards={filteredCards} />
        )}
        {activeTab === 'trends' && (
          <PopulationTrendsTab cards={filteredCards} selectedCard={selectedCard} />
        )}
        {activeTab === 'owners' && (
          <OwnerIntelligenceTab cards={filteredCards} />
        )}
      </div>
    </div>
  );
}
