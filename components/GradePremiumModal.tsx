import React, { useMemo, useState } from 'react';
import {
  X,
  Gem,
  ArrowRightLeft,
  BarChart3,
  PieChart,
  TrendingUp,
  ChevronDown,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CardInventory } from '../types';
import {
  getGradePremiumTable,
  getCrossGraderComparison,
  findCrossoverOpportunities,
  getGradeDistribution,
  getPortfolioGradeAnalysis,
  GradePremium,
  CrossGraderComparison,
  CrossoverOpportunity,
  GradeDistribution,
  loadGradePremiumPrefs,
  saveGradePremiumPrefs,
} from '../lib/gradePremiumService';

interface GradePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'premium' | 'crossover' | 'portfolio';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'premium', label: 'Premium Table', icon: <BarChart3 size={16} /> },
  { id: 'crossover', label: 'Crossover', icon: <ArrowRightLeft size={16} /> },
  { id: 'portfolio', label: 'Portfolio', icon: <PieChart size={16} /> },
];

// ---- Premium Table Tab ----

const PremiumTableTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id ?? '');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? cards[0],
    [cards, selectedCardId]
  );

  const premiumTable = useMemo<GradePremium[]>(
    () => (selectedCard ? getGradePremiumTable(selectedCard) : []),
    [selectedCard]
  );

  const crossGrader = useMemo<CrossGraderComparison[]>(
    () => (selectedCard ? getCrossGraderComparison(selectedCard) : []),
    [selectedCard]
  );

  const distribution = useMemo<GradeDistribution[]>(
    () => (selectedCard ? getGradeDistribution(selectedCard) : []),
    [selectedCard]
  );

  const chartData = useMemo(
    () =>
      premiumTable.map((p) => ({
        grade: p.grade,
        value: p.estimatedValue,
        multiplier: p.multiplier,
      })),
    [premiumTable]
  );

  const popChartData = useMemo(
    () =>
      distribution.map((d) => ({
        grade: d.grade,
        population: d.population,
        percentage: d.percentage,
      })),
    [distribution]
  );

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No cards in your inventory to analyze.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
        >
          <span className="truncate">
            {selectedCard
              ? `${selectedCard.player} - ${selectedCard.year} ${selectedCard.manufacturer} #${selectedCard.cardNumber}`
              : 'Select a card'}
          </span>
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        </button>
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setShowDropdown(false);
                  saveGradePremiumPrefs({ selectedCardId: card.id });
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                  card.id === selectedCardId
                    ? 'text-brand-lime bg-slate-700/50'
                    : 'text-white'
                }`}
              >
                <span className="truncate">
                  {card.player} - {card.year} {card.manufacturer} #{card.cardNumber}
                </span>
                {card.isGraded && (
                  <span className="flex-shrink-0 text-[10px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded">
                    {card.gradingCompany} {card.grade}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grade Premium Price Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Estimated Value by Grade
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="grade"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => [
                  name === 'value'
                    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : `${value}x`,
                  name === 'value' ? 'Est. Value' : 'Multiplier',
                ]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.grade.includes('10')
                        ? '#a855f7'
                        : entry.grade.includes('9')
                          ? '#3b82f6'
                          : '#64748b'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade-by-Grade Price Table */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Grade Premium Breakdown
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Grade</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Multiplier</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Est. Value</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Premium</th>
              </tr>
            </thead>
            <tbody>
              {premiumTable.map((row) => (
                <tr
                  key={row.grade}
                  className={`border-b border-slate-700/50 ${
                    selectedCard?.isGraded &&
                    row.grade === `${selectedCard.gradingCompany} ${selectedCard.grade}`
                      ? 'bg-purple-500/10'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-white font-medium">{row.grade}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{row.multiplier}x</td>
                  <td className="py-2.5 px-3 text-right text-white font-mono">
                    ${row.estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      row.premiumOverRaw > 0 ? 'text-green-400' : 'text-slate-500'
                    }`}
                  >
                    {row.premiumOverRaw > 0 ? '+' : ''}{row.premiumOverRaw.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Grader Comparison */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Cross-Grader Value Comparison
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Grade</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">PSA</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">BGS</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">SGC</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Best</th>
              </tr>
            </thead>
            <tbody>
              {crossGrader.map((row) => (
                <tr key={row.grade} className="border-b border-slate-700/50">
                  <td className="py-2.5 px-3 text-white font-medium">{row.grade}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono ${
                      row.bestGrader === 'PSA' ? 'text-green-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    ${row.psaValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono ${
                      row.bestGrader === 'BGS' ? 'text-green-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    ${row.bgsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono ${
                      row.bestGrader === 'SGC' ? 'text-green-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    ${row.sgcValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded">
                      {row.bestGrader}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Population Distribution Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Simulated Population Distribution
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="grade"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => [
                  name === 'population'
                    ? value.toLocaleString()
                    : `${value}%`,
                  name === 'population' ? 'Population' : 'Percentage',
                ]}
              />
              <Bar dataKey="population" radius={[4, 4, 0, 0]}>
                {popChartData.map((entry, index) => (
                  <Cell
                    key={`pop-${index}`}
                    fill={
                      parseFloat(entry.grade) >= 10
                        ? '#a855f7'
                        : parseFloat(entry.grade) >= 9
                          ? '#3b82f6'
                          : '#475569'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Crossover Tab ----

const CrossoverTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const opportunities = useMemo<CrossoverOpportunity[]>(
    () => findCrossoverOpportunities(cards),
    [cards]
  );

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <ArrowRightLeft size={40} className="mx-auto text-slate-600" />
        <p className="text-slate-400 text-sm">No crossover opportunities found.</p>
        <p className="text-slate-600 text-xs">
          Add graded cards from BGS or SGC to discover profitable PSA crossover opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Crossover Opportunities ({opportunities.length})
        </p>
        <span className="text-xs text-slate-400">
          Sorted by expected ROI
        </span>
      </div>

      {opportunities.map((opp) => (
        <div
          key={`${opp.cardId}-${opp.targetGrader}-${opp.targetGrade}`}
          className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{opp.player}</p>
              <p className="text-[11px] text-slate-400">{opp.cardDescription}</p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                opp.expectedROI >= 20
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : opp.expectedROI >= 0
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              <TrendingUp size={14} />
              {opp.expectedROI >= 0 ? '+' : ''}{opp.expectedROI.toFixed(1)}% ROI
            </div>
          </div>

          {/* Crossover Flow */}
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current</p>
              <p className="text-sm font-bold text-white">
                {opp.currentGrader} {opp.currentGrade}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                ${opp.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <ArrowRightLeft size={18} className="text-purple-400 flex-shrink-0" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target</p>
              <p className="text-sm font-bold text-purple-400">
                {opp.targetGrader} {opp.targetGrade}
              </p>
              <p className="text-xs text-green-400 font-mono">
                ${opp.targetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <DollarSign size={10} />
                <span className="text-[10px] uppercase tracking-wider">Fee</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">${opp.crossoverFee}</p>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Percent size={10} />
                <span className="text-[10px] uppercase tracking-wider">Success</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">
                {(opp.successRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <TrendingUp size={10} />
                <span className="text-[10px] uppercase tracking-wider">Exp. Profit</span>
              </div>
              <p
                className={`text-sm font-bold font-mono ${
                  opp.expectedProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {opp.expectedProfit >= 0 ? '+' : ''}${opp.expectedProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {opp.successRate >= 0.75 ? (
              <CheckCircle2 size={12} className="text-green-400" />
            ) : (
              <AlertTriangle size={12} className="text-amber-400" />
            )}
            <span className={opp.successRate >= 0.75 ? 'text-green-400' : 'text-amber-400'}>
              {opp.successRate >= 0.75 ? 'High confidence' : 'Moderate confidence'} crossover
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Portfolio Tab ----

const PortfolioTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const analysis = useMemo(() => getPortfolioGradeAnalysis(cards), [cards]);

  const gradeChartData = useMemo(
    () =>
      analysis.gradeDistribution.map((d) => ({
        grade: d.grade,
        count: d.count,
      })),
    [analysis]
  );

  const graderChartData = useMemo(
    () =>
      analysis.graderDistribution.map((d) => ({
        grader: d.grader,
        count: d.count,
      })),
    [analysis]
  );

  const GRADER_COLORS: Record<string, string> = {
    PSA: '#3b82f6',
    BGS: '#a855f7',
    SGC: '#10b981',
    CSG: '#f59e0b',
    HGA: '#ef4444',
    Other: '#64748b',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg Grade
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {analysis.averageGrade.toFixed(1)}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Gem Rate
          </p>
          <p className="text-2xl font-bebas tracking-wider text-purple-400">
            {analysis.gemRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Graded
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {analysis.gradedCards}
            <span className="text-base text-slate-500"> / {analysis.totalCards}</span>
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Crossover Opps
          </p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">
            {analysis.totalCrossoverOpportunities}
          </p>
        </div>
      </div>

      {/* Upgrade Value Potential */}
      {analysis.upgradeValuePotential > 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <TrendingUp size={18} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">Upgrade Value Potential</p>
            <p className="text-xs text-slate-400">
              Estimated gains from crossover opportunities
            </p>
          </div>
          <span className="ml-auto text-xl font-bebas tracking-wider text-green-400">
            +${analysis.upgradeValuePotential.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Grade Distribution Chart */}
      {gradeChartData.length > 0 && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Your Grade Distribution
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="grade"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [value, 'Cards']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gradeChartData.map((entry, index) => (
                    <Cell
                      key={`grade-${index}`}
                      fill={
                        parseFloat(entry.grade) >= 9.5
                          ? '#a855f7'
                          : parseFloat(entry.grade) >= 9
                            ? '#3b82f6'
                            : '#475569'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grader Distribution */}
      {graderChartData.length > 0 && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Grader Distribution
          </p>
          <div className="space-y-2">
            {graderChartData.map((entry) => {
              const maxCount = Math.max(1, ...graderChartData.map((d) => d.count));
              const barWidth = Math.round((entry.count / maxCount) * 100);
              const color = GRADER_COLORS[entry.grader] ?? '#64748b';
              return (
                <div key={entry.grader} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-right text-slate-400 font-bold flex-shrink-0">
                    {entry.grader}
                  </span>
                  <div className="flex-1 h-5 bg-slate-700/50 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${barWidth}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-white">{entry.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Crossover Opportunities Preview */}
      {analysis.topCrossoverOpportunities.length > 0 && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Top Crossover Opportunities
          </p>
          <div className="space-y-2">
            {analysis.topCrossoverOpportunities.map((opp) => (
              <div
                key={`${opp.cardId}-${opp.targetGrader}`}
                className="flex items-center gap-3 px-4 py-3 bg-slate-900/30 rounded-xl"
              >
                <ArrowRightLeft size={14} className="text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{opp.player}</p>
                  <p className="text-[10px] text-slate-500">
                    {opp.currentGrader} {opp.currentGrade} &rarr; {opp.targetGrader}{' '}
                    {opp.targetGrade}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold font-mono ${
                    opp.expectedROI >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {opp.expectedROI >= 0 ? '+' : ''}{opp.expectedROI.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {analysis.gradedCards === 0 && (
        <div className="text-center py-8 space-y-3">
          <Gem size={40} className="mx-auto text-slate-600" />
          <p className="text-slate-400 text-sm">No graded cards in your portfolio.</p>
          <p className="text-slate-600 text-xs">
            Add graded cards to see grade distribution and crossover analysis.
          </p>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const GradePremiumModal: React.FC<GradePremiumModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const prefs = useMemo(() => loadGradePremiumPrefs(), []);
  const [activeTab, setActiveTab] = useState<TabId>(
    (prefs.defaultTab as TabId) ?? 'premium'
  );

  const analysis = useMemo(() => getPortfolioGradeAnalysis(cards), [cards]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/30">
              <Gem size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <BarChart3 size={10} />
                  {analysis.gradedCards} graded cards
                </span>
                {analysis.totalCrossoverOpportunities > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                    <ArrowRightLeft size={10} />
                    {analysis.totalCrossoverOpportunities} crossovers
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Grade <span className="text-purple-400">Premium</span> Analytics
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                saveGradePremiumPrefs({ defaultTab: tab.id });
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-purple-400 bg-purple-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'premium' && <PremiumTableTab cards={cards} />}
          {activeTab === 'crossover' && <CrossoverTab cards={cards} />}
          {activeTab === 'portfolio' && <PortfolioTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default GradePremiumModal;
