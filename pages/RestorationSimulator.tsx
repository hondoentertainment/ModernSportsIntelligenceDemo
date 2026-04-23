// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wrench,
  TrendingUp,
  BarChart3,
  Target,
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Shield,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Percent,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getAllCards,
  getCardCondition,
  simulateRestoration,
  getRegradeAnalysis,
  getRestorationTechniques,
  calculateROIScenarios,
  getBatchRestorationPlan,
  getRestorationHistory,
  formatCurrency,
  getSubgradeColor,
  getSubgradeBarColor,
  getRiskBadgeColor,
  type CardCondition,
  type RestorationSimulation,
  type RegradeAnalysis,
  type RestorationTechnique,
  type RestorationROIScenario,
  type BatchPlanItem,
  type RestorationHistoryEntry,
  type BeforeAfterVisualization,
} from '../lib/utils/restorationSimService';

// ── Tab Configuration ─────────────────────────────────────────────────────────

type TabId = 'assessment' | 'preview' | 'roi' | 'regrade' | 'techniques' | 'batch';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'assessment', label: 'Card Assessment', icon: <Target className="w-4 h-4" /> },
  { id: 'preview', label: 'Restoration Preview', icon: <Eye className="w-4 h-4" /> },
  { id: 'roi', label: 'ROI Calculator', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'regrade', label: 'Regrade Probability', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'techniques', label: 'Technique Library', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'batch', label: 'Batch Planner', icon: <Layers className="w-4 h-4" /> },
];

// ── Subgrade Gauge Component ──────────────────────────────────────────────────

const SubgradeGauge: React.FC<{
  label: string;
  score: number;
  maxScore?: number;
  projected?: number;
}> = ({ label, score, maxScore = 10, projected }) => {
  const pct = (score / maxScore) * 100;
  const projPct = projected ? (projected / maxScore) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getSubgradeColor(score)}`}>{score}</span>
          {projected && projected > score && (
            <>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className={`text-sm font-bold ${getSubgradeColor(projected)}`}>{projected}</span>
            </>
          )}
        </div>
      </div>
      <div className="relative h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
        {projected && projected > score && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-500/30 transition-all duration-500"
            style={{ width: `${projPct}%` }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getSubgradeBarColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Grade Slider Component ────────────────────────────────────────────────────

const GradeSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (val: number) => void;
}> = ({ value, min, max, step = 0.5, label, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/30
        [&::-webkit-slider-thumb]:cursor-pointer"
    />
    <div className="flex justify-between text-[10px] text-slate-600">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-slate-700/50 rounded w-1/3" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-32 bg-slate-700/50 rounded" />
      <div className="h-32 bg-slate-700/50 rounded" />
    </div>
    <div className="h-64 bg-slate-700/50 rounded" />
  </div>
);

// ── Chart Colors ──────────────────────────────────────────────────────────────

const CHART_COLORS = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

const SCENARIO_COLORS: Record<string, string> = {
  best: CHART_COLORS.emerald,
  likely: CHART_COLORS.blue,
  worst: CHART_COLORS.red,
};

const PIE_COLORS = [CHART_COLORS.emerald, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.red, CHART_COLORS.purple, CHART_COLORS.cyan];

// ── Tab: Card Assessment ──────────────────────────────────────────────────────

const CardAssessmentTab: React.FC<{ card: CardCondition }> = ({ card }) => {
  const radarData = useMemo(
    () => [
      { attribute: 'Centering', score: card.currentSubgrades.centering, fullMark: 10 },
      { attribute: 'Corners', score: card.currentSubgrades.corners, fullMark: 10 },
      { attribute: 'Edges', score: card.currentSubgrades.edges, fullMark: 10 },
      { attribute: 'Surface', score: card.currentSubgrades.surface, fullMark: 10 },
    ],
    [card]
  );

  const weakest = useMemo(() => {
    const subs = card.currentSubgrades;
    const entries = Object.entries(subs) as [string, number][];
    return entries.sort((a, b) => a[1] - b[1])[0];
  }, [card]);

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">{card.player}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{card.cardName} | {card.year}</p>
            <p className="text-xs text-slate-500 mt-2 max-w-lg leading-relaxed">{card.imageDescription}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-white">{card.currentGrade}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Current Grade</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(card.currentValue)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subgrade Gauges */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Subgrade Breakdown</h4>
          <SubgradeGauge label="Centering" score={card.currentSubgrades.centering} />
          <SubgradeGauge label="Corners" score={card.currentSubgrades.corners} />
          <SubgradeGauge label="Edges" score={card.currentSubgrades.edges} />
          <SubgradeGauge label="Surface" score={card.currentSubgrades.surface} />
          <div className="pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">
                Limiting factor: <span className="text-amber-400 font-semibold capitalize">{weakest[0]}</span> at {weakest[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Condition Profile</h4>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Current"
                dataKey="score"
                stroke={CHART_COLORS.blue}
                fill={CHART_COLORS.blue}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Defect Summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Defect Annotations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Centering', score: card.currentSubgrades.centering, issues: card.currentSubgrades.centering < 8 ? ['Off-center alignment detected'] : ['Within acceptable tolerance'] },
            { label: 'Corners', score: card.currentSubgrades.corners, issues: card.currentSubgrades.corners < 7 ? ['Visible corner wear', 'Tip rounding'] : card.currentSubgrades.corners < 9 ? ['Minor tip softness'] : ['Sharp and defined'] },
            { label: 'Edges', score: card.currentSubgrades.edges, issues: card.currentSubgrades.edges < 7 ? ['Edge whitening', 'Minor chipping'] : card.currentSubgrades.edges < 9 ? ['Light wear visible'] : ['Clean, no whitening'] },
            { label: 'Surface', score: card.currentSubgrades.surface, issues: card.currentSubgrades.surface < 7 ? ['Surface wear/scratching', 'Possible contaminants'] : card.currentSubgrades.surface < 9 ? ['Minor imperfections under magnification'] : ['Clean and glossy'] },
          ].map((defect) => (
            <div key={defect.label} className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-300">{defect.label}</span>
                <span className={`text-xs font-bold ${getSubgradeColor(defect.score)}`}>{defect.score}</span>
              </div>
              {defect.issues.map((issue, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${getSubgradeBarColor(defect.score)}`} />
                  {issue}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Tab: Restoration Preview ──────────────────────────────────────────────────

const RestorationPreviewTab: React.FC<{
  card: CardCondition;
  simulation: RestorationSimulation | null;
  targetGrade: number;
  onTargetChange: (g: number) => void;
}> = ({ card, simulation, targetGrade, onTargetChange }) => {
  const beforeAfter = useMemo<BeforeAfterVisualization[]>(() => {
    if (!simulation) return [];
    const attrs: Array<{ key: keyof CardCondition['currentSubgrades']; label: BeforeAfterVisualization['attribute'] }> = [
      { key: 'centering', label: 'centering' },
      { key: 'corners', label: 'corners' },
      { key: 'edges', label: 'edges' },
      { key: 'surface', label: 'surface' },
    ];
    return attrs.map(({ key, label }) => {
      const before = card.currentSubgrades[key];
      const imp = simulation.improvements.find((i) => i.attribute === label);
      const after = imp ? imp.projectedScore : before;
      const descriptors: Record<string, string> = {
        centering: after > before ? 'Alignment improved through compensation pressing' : 'No change needed',
        corners: after > before ? 'Corner tips tightened via micro-pressing' : 'Corners within tolerance',
        edges: after > before ? 'Edge whitening reduced through burnishing' : 'Edges acceptable',
        surface: after > before ? 'Surface contaminants removed, texture restored' : 'Surface condition maintained',
      };
      return { attribute: label, beforeScore: before, afterScore: after, visualDescriptor: descriptors[label] };
    });
  }, [card, simulation]);

  const comparisonData = useMemo(
    () =>
      beforeAfter.map((ba) => ({
        attribute: ba.attribute.charAt(0).toUpperCase() + ba.attribute.slice(1),
        Before: ba.beforeScore,
        After: ba.afterScore,
      })),
    [beforeAfter]
  );

  return (
    <div className="space-y-6">
      {/* Grade Slider */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <GradeSlider
          value={targetGrade}
          min={card.currentGrade}
          max={10}
          label="Target Grade"
          onChange={onTargetChange}
        />
        {simulation && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-900/40 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500">Probability</div>
              <div className="text-lg font-bold text-blue-400">{Math.round(simulation.probability * 100)}%</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500">Est. Cost</div>
              <div className="text-lg font-bold text-amber-400">{formatCurrency(simulation.estimatedCost)}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500">New Value</div>
              <div className="text-lg font-bold text-emerald-400">{formatCurrency(simulation.estimatedNewValue)}</div>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500">Risk Level</div>
              <div className={`text-lg font-bold capitalize ${
                simulation.riskLevel === 'low' ? 'text-emerald-400' :
                simulation.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {simulation.riskLevel}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before/After Subgrade Comparison */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Subgrade Projection
          </h4>
          {beforeAfter.map((ba) => (
            <div key={ba.attribute}>
              <SubgradeGauge
                label={ba.attribute}
                score={ba.beforeScore}
                projected={ba.afterScore}
              />
              <p className="text-[11px] text-slate-500 mt-0.5 ml-0.5">{ba.visualDescriptor}</p>
            </div>
          ))}
        </div>

        {/* Bar Chart Comparison */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Visual Comparison
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Before" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
              <Bar dataKey="After" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement Techniques */}
      {simulation && simulation.improvements.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Recommended Techniques
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Attribute</th>
                  <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Technique</th>
                  <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Difficulty</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Cost</th>
                  <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {simulation.improvements.map((imp) => (
                  <tr key={imp.attribute} className="border-b border-slate-700/20">
                    <td className="py-2.5 px-3 text-slate-300 capitalize font-medium">{imp.attribute}</td>
                    <td className="py-2.5 px-3 text-slate-400">{imp.technique}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        imp.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        imp.difficulty === 'moderate' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                        imp.difficulty === 'hard' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {imp.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-medium">{formatCurrency(imp.cost)}</td>
                    <td className="py-2.5 px-3 text-right text-blue-400 font-medium">{Math.round(imp.successRate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tab: ROI Calculator ───────────────────────────────────────────────────────

const ROICalculatorTab: React.FC<{
  card: CardCondition;
  scenarios: RestorationROIScenario[] | null;
}> = ({ card, scenarios }) => {
  const barData = useMemo(() => {
    if (!scenarios) return [];
    return scenarios.map((s) => ({
      scenario: s.scenario.charAt(0).toUpperCase() + s.scenario.slice(1),
      'New Value': s.newValue,
      Cost: s.cost,
      'Net Profit': Math.max(0, s.newValue - card.currentValue - s.cost),
      fill: SCENARIO_COLORS[s.scenario],
    }));
  }, [scenarios, card]);

  const roiLineData = useMemo(() => {
    if (!scenarios) return [];
    const grades = [];
    for (let g = card.currentGrade; g <= 10; g += 0.5) {
      const multiplier: Record<number, number> = {
        1: 0.15, 1.5: 0.18, 2: 0.22, 2.5: 0.27, 3: 0.33, 3.5: 0.4,
        4: 0.48, 4.5: 0.57, 5: 0.68, 5.5: 0.78, 6: 0.88, 6.5: 1.0,
        7: 1.2, 7.5: 1.5, 8: 2.0, 8.5: 2.8, 9: 4.5, 9.5: 8.0, 10: 18.0,
      };
      const curMul = multiplier[card.currentGrade] ?? 1;
      const tgtMul = multiplier[g] ?? 1;
      const baseVal = card.currentValue / curMul;
      const newVal = baseVal * tgtMul;
      const estCost = 25 + (g - card.currentGrade) * 40;
      grades.push({
        grade: g.toString(),
        value: Math.round(newVal),
        roi: estCost > 0 ? Math.round(((newVal - card.currentValue - estCost) / estCost) * 100) : 0,
      });
    }
    return grades;
  }, [card]);

  if (!scenarios) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const profit = s.newValue - card.currentValue - s.cost;
          const isPositive = profit > 0;
          return (
            <div
              key={s.scenario}
              className={`bg-slate-800/60 border rounded-xl p-5 ${
                s.scenario === 'best' ? 'border-emerald-500/30' :
                s.scenario === 'likely' ? 'border-blue-500/30' :
                'border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  s.scenario === 'best' ? 'text-emerald-400' :
                  s.scenario === 'likely' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {s.scenario} Case
                </span>
                <span className="text-xs text-slate-500">{Math.round(s.probability * 100)}% likely</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target Grade</span>
                  <span className="text-white font-bold">{s.targetGrade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Restoration Cost</span>
                  <span className="text-amber-400 font-medium">{formatCurrency(s.cost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">New Value</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(s.newValue)}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-2 flex justify-between text-sm">
                  <span className="text-slate-500">Net Profit</span>
                  <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ROI</span>
                  <span className={`font-bold text-lg ${s.netROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.netROI >= 0 ? '+' : ''}{s.netROI}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Scenario Comparison */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Scenario Value Comparison
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="scenario" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="New Value" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cost" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Profit" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Value Curve by Grade */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Value & ROI by Target Grade
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={roiLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="value" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="roi" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="value" type="monotone" dataKey="value" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={{ r: 3 }} name="Value" />
              <Line yAxisId="roi" type="monotone" dataKey="roi" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 3 }} name="ROI %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost/Benefit Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Cost / Benefit Analysis
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Scenario</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Target</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Prob.</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Current Val.</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Cost</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">New Val.</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Net Profit</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => {
                const profit = s.newValue - card.currentValue - s.cost;
                return (
                  <tr key={s.scenario} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="py-2.5 px-3 capitalize font-medium text-slate-300">{s.scenario}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">{s.targetGrade}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{Math.round(s.probability * 100)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{formatCurrency(card.currentValue)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{formatCurrency(s.cost)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(s.newValue)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold text-base px-2 py-0.5 rounded ${
                        s.netROI >= 100 ? 'bg-emerald-500/20 text-emerald-400' :
                        s.netROI >= 0 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {s.netROI >= 0 ? '+' : ''}{s.netROI}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Tab: Regrade Probability ──────────────────────────────────────────────────

const RegradeProbabilityTab: React.FC<{
  card: CardCondition;
  analysis: RegradeAnalysis | null;
}> = ({ card, analysis }) => {
  const areaData = useMemo(() => {
    if (!analysis) return [];
    return analysis.gradeDistribution.map((d) => ({
      grade: d.grade.toString(),
      probability: Math.round(d.probability * 100),
    }));
  }, [analysis]);

  if (!analysis) return <LoadingSkeleton />;

  const recColor =
    analysis.recommendation === 'regrade' ? 'text-emerald-400' :
    analysis.recommendation === 'hold' ? 'text-yellow-400' : 'text-red-400';
  const recIcon =
    analysis.recommendation === 'regrade' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
    analysis.recommendation === 'hold' ? <Shield className="w-5 h-5 text-yellow-400" /> :
    <XCircle className="w-5 h-5 text-red-400" />;

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      <div className={`bg-slate-800/60 border rounded-xl p-5 ${
        analysis.recommendation === 'regrade' ? 'border-emerald-500/30' :
        analysis.recommendation === 'hold' ? 'border-yellow-500/30' : 'border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {recIcon}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">AI Recommendation:</span>
              <span className={`text-lg font-bold uppercase ${recColor}`}>
                {analysis.recommendation === 'sell-as-is' ? 'Sell As-Is' : analysis.recommendation}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {analysis.recommendation === 'regrade'
                ? 'Strong probability of grade improvement. Regrading is expected to increase value significantly.'
                : analysis.recommendation === 'hold'
                ? 'Current grade appears accurate. Grade change probability does not justify regrading fees.'
                : 'Risk of downgrade exceeds upgrade probability. Recommend selling at current grade.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Current Grade</div>
          <div className="text-2xl font-black text-white">{analysis.currentGrade}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Expected Value After Regrade</div>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(analysis.expectedValue)}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">Value Range</div>
          <div className="text-lg font-bold text-blue-400">
            {formatCurrency(analysis.varianceRange[0])} - {formatCurrency(analysis.varianceRange[1])}
          </div>
        </div>
      </div>

      {/* Area Chart: Grade Distribution */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Grade Outcome Probability Distribution
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.4} />
                <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="grade"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Grade', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Probability', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value}%`, 'Probability']}
              labelFormatter={(label) => `Grade ${label}`}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke={CHART_COLORS.blue}
              fill="url(#gradeGradient)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Grade Probability Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {analysis.gradeDistribution.map((d) => {
            const isCurrent = d.grade === card.currentGrade;
            const isUpgrade = d.grade > card.currentGrade;
            return (
              <div
                key={d.grade}
                className={`rounded-lg p-3 text-center border transition-colors ${
                  isCurrent
                    ? 'bg-blue-500/15 border-blue-500/40'
                    : isUpgrade
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-slate-900/40 border-slate-700/30'
                }`}
              >
                <div className={`text-lg font-bold ${
                  isCurrent ? 'text-blue-400' : isUpgrade ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {d.grade}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{Math.round(d.probability * 100)}%</div>
                <div className="h-1 mt-2 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCurrent ? 'bg-blue-500' : isUpgrade ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                    style={{ width: `${d.probability * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Tab: Technique Library ────────────────────────────────────────────────────

const TechniqueLibraryTab: React.FC<{ techniques: RestorationTechnique[] }> = ({ techniques }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(techniques.map((t) => t.category)))],
    [techniques]
  );

  const filtered = useMemo(
    () => categoryFilter === 'all' ? techniques : techniques.filter((t) => t.category === categoryFilter),
    [techniques, categoryFilter]
  );

  const categoryStats = useMemo(() => {
    const cats = ['surface', 'corner', 'edge', 'centering'] as const;
    return cats.map((cat) => {
      const items = techniques.filter((t) => t.category === cat);
      const avgSuccess = items.length > 0 ? items.reduce((s, t) => s + t.avgSuccessRate, 0) / items.length : 0;
      const avgCost = items.length > 0 ? items.reduce((s, t) => s + t.avgCost, 0) / items.length : 0;
      return { category: cat, count: items.length, avgSuccess, avgCost };
    });
  }, [techniques]);

  const pieData = useMemo(
    () => categoryStats.map((cs) => ({ name: cs.category, value: cs.count })),
    [categoryStats]
  );

  return (
    <div className="space-y-6">
      {/* Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categoryStats.map((cs) => (
          <div
            key={cs.category}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-blue-500/30 transition-colors"
            onClick={() => setCategoryFilter(cs.category === categoryFilter ? 'all' : cs.category)}
          >
            <div className="text-xs text-slate-500 uppercase tracking-wider capitalize">{cs.category}</div>
            <div className="text-xl font-bold text-white mt-1">{cs.count}</div>
            <div className="text-xs text-slate-500 mt-1">
              Avg success: <span className="text-emerald-400 font-medium">{Math.round(cs.avgSuccess * 100)}%</span>
            </div>
            <div className="text-xs text-slate-500">
              Avg cost: <span className="text-amber-400 font-medium">${cs.avgCost.toFixed(0)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Pie */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Technique Distribution
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(value: number, name: string) => [`${value} techniques`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Comparison */}
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Success Rate by Technique
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filtered.map((t) => ({ name: t.name.length > 18 ? t.name.slice(0, 18) + '...' : t.name, success: Math.round(t.avgSuccessRate * 100), risk: Math.round(t.riskFactor * 100) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="success" fill={CHART_COLORS.emerald} name="Success %" radius={[0, 4, 4, 0]} />
              <Bar dataKey="risk" fill={CHART_COLORS.red} name="Risk %" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
              categoryFilter === cat
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Technique Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((tech) => (
          <div key={tech.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/60 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h5 className="text-sm font-semibold text-white">{tech.name}</h5>
                <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 inline-block ${
                  tech.category === 'surface' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                  tech.category === 'corner' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  tech.category === 'edge' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                  'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {tech.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">{Math.round(tech.avgSuccessRate * 100)}%</div>
                <div className="text-[10px] text-slate-500">success</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{tech.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Cost: <span className="text-amber-400 font-medium">${tech.avgCost}</span>
              </span>
              <span className="text-slate-400">
                Risk: <span className={`font-medium ${
                  tech.riskFactor < 0.1 ? 'text-emerald-400' : tech.riskFactor < 0.2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(tech.riskFactor * 100)}%
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tech.applicableDefects.map((defect) => (
                <span key={defect} className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">
                  {defect}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Tab: Batch Planner ────────────────────────────────────────────────────────

const BatchPlannerTab: React.FC<{
  allCards: CardCondition[];
  batchPlan: BatchPlanItem[];
  selectedIds: string[];
  onToggleCard: (id: string) => void;
  onGeneratePlan: () => void;
  isLoading: boolean;
  history: RestorationHistoryEntry[];
}> = ({ allCards, batchPlan, selectedIds, onToggleCard, onGeneratePlan, isLoading, history }) => {
  const aggregateROI = useMemo(() => {
    if (batchPlan.length === 0) return { totalCost: 0, totalCurrentValue: 0, totalNewValue: 0, netROI: 0, avgProbability: 0 };
    const totalCost = batchPlan.reduce((s, b) => s + b.simulation.estimatedCost, 0);
    const totalCurrentValue = batchPlan.reduce((s, b) => s + b.card.currentValue, 0);
    const totalNewValue = batchPlan.reduce((s, b) => s + b.simulation.estimatedNewValue, 0);
    const netROI = totalCost > 0 ? Math.round(((totalNewValue - totalCurrentValue - totalCost) / totalCost) * 100) : 0;
    const avgProbability = batchPlan.reduce((s, b) => s + b.simulation.probability, 0) / batchPlan.length;
    return { totalCost, totalCurrentValue, totalNewValue, netROI, avgProbability };
  }, [batchPlan]);

  return (
    <div className="space-y-6">
      {/* Card Selection */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Select Cards for Batch Restoration
          </h4>
          <button
            onClick={onGeneratePlan}
            disabled={selectedIds.length === 0 || isLoading}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Generate Plan ({selectedIds.length})
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {allCards.map((card) => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => onToggleCard(card.id)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/40'
                    : 'bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">{card.player}</div>
                    <div className="text-[10px] text-slate-500 truncate">{card.cardName}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs font-bold text-slate-300">{card.currentGrade}</span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aggregate Stats */}
      {batchPlan.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500">Cards</div>
              <div className="text-xl font-bold text-white">{batchPlan.length}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500">Total Cost</div>
              <div className="text-xl font-bold text-amber-400">{formatCurrency(aggregateROI.totalCost)}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500">Current Value</div>
              <div className="text-xl font-bold text-slate-300">{formatCurrency(aggregateROI.totalCurrentValue)}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500">Projected Value</div>
              <div className="text-xl font-bold text-emerald-400">{formatCurrency(aggregateROI.totalNewValue)}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-500">Net ROI</div>
              <div className={`text-xl font-bold ${aggregateROI.netROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {aggregateROI.netROI >= 0 ? '+' : ''}{aggregateROI.netROI}%
              </div>
            </div>
          </div>

          {/* Batch Plan Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Restoration Queue (Priority Ordered)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">#</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Card</th>
                    <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Grade</th>
                    <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Target</th>
                    <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Cost</th>
                    <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">New Value</th>
                    <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">ROI</th>
                    <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Risk</th>
                    <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {batchPlan.map((item, idx) => (
                    <tr key={item.card.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-xs font-medium text-white">{item.card.player}</div>
                        <div className="text-[10px] text-slate-500">{item.card.cardName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-bold">{item.card.currentGrade}</td>
                      <td className="py-2.5 px-3 text-center text-blue-400 font-bold">{item.simulation.targetGrade}</td>
                      <td className="py-2.5 px-3 text-right text-amber-400">{formatCurrency(item.simulation.estimatedCost)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">{formatCurrency(item.simulation.estimatedNewValue)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${item.simulation.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.simulation.roi >= 0 ? '+' : ''}{item.simulation.roi}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRiskBadgeColor(item.simulation.riskLevel)}`}>
                          {item.simulation.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.simulation.timeframeDays}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Restoration History */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Restoration History
        </h4>
        <div className="space-y-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-3 rounded-lg border ${
                entry.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex-shrink-0">
                {entry.success
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white truncate">{entry.player}</span>
                  <span className="text-[10px] text-slate-500">{entry.cardName}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>{entry.gradeBefore} &rarr; {entry.gradeAfter}</span>
                  <span className="text-slate-700">|</span>
                  <span>{entry.techniques.join(', ')}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-bold ${entry.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.roi >= 0 ? '+' : ''}{entry.roi}% ROI
                </div>
                <div className="text-[10px] text-slate-500">{entry.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const RestorationSimulator: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabId>('assessment');
  const [allCards, setAllCards] = useState<CardCondition[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-001');
  const [targetGrade, setTargetGrade] = useState<number>(8);
  const [simulation, setSimulation] = useState<RestorationSimulation | null>(null);
  const [regradeAnalysis, setRegradeAnalysis] = useState<RegradeAnalysis | null>(null);
  const [techniques, setTechniques] = useState<RestorationTechnique[]>([]);
  const [roiScenarios, setRoiScenarios] = useState<RestorationROIScenario[] | null>(null);
  const [batchPlan, setBatchPlan] = useState<BatchPlanItem[]>([]);
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<RestorationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [cardDropdownOpen, setCardDropdownOpen] = useState(false);

  const selectedCard = useMemo(
    () => allCards.find((c) => c.id === selectedCardId) ?? null,
    [allCards, selectedCardId]
  );

  // Initial data load
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [cards, techs, hist] = await Promise.all([
        getAllCards(),
        getRestorationTechniques(),
        getRestorationHistory(),
      ]);
      if (cancelled) return;
      setAllCards(cards);
      setTechniques(techs);
      setHistory(hist);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Simulation updates when card or target grade changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedCardId) return;
      setSimLoading(true);
      const [sim, regrade, scenarios] = await Promise.all([
        simulateRestoration(selectedCardId, targetGrade),
        getRegradeAnalysis(selectedCardId),
        calculateROIScenarios(selectedCardId),
      ]);
      if (cancelled) return;
      setSimulation(sim);
      setRegradeAnalysis(regrade);
      setRoiScenarios(scenarios);
      setSimLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [selectedCardId, targetGrade]);

  // Reset target grade when card changes
  useEffect(() => {
    if (selectedCard) {
      setTargetGrade(Math.min(10, selectedCard.currentGrade + 1));
    }
  }, [selectedCardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleBatchCard = useCallback((id: string) => {
    setBatchSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleGenerateBatchPlan = useCallback(async () => {
    setBatchLoading(true);
    const plan = await getBatchRestorationPlan(batchSelectedIds);
    setBatchPlan(plan);
    setBatchLoading(false);
  }, [batchSelectedIds]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-blue-400" />
              AI Card Restoration Simulator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Simulate restoration outcomes, estimate ROI, and plan batch improvements
            </p>
          </div>

          {/* Card Selector */}
          <div className="relative">
            <button
              onClick={() => setCardDropdownOpen(!cardDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:border-slate-600/60 transition-colors min-w-[280px]"
            >
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {selectedCard?.player ?? 'Select Card'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {selectedCard?.cardName} | Grade {selectedCard?.currentGrade}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${cardDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {cardDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                {allCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setCardDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-700/50 transition-colors flex items-center justify-between ${
                      card.id === selectedCardId ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{card.player}</div>
                      <div className="text-[10px] text-slate-500 truncate">{card.cardName} ({card.year})</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`text-xs font-bold ${getSubgradeColor(card.currentGrade)}`}>{card.currentGrade}</span>
                      <span className="text-[10px] text-slate-500">{formatCurrency(card.currentValue)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent hover:bg-slate-800/40'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {simLoading && activeTab !== 'techniques' && activeTab !== 'batch' ? (
            <LoadingSkeleton />
          ) : (
            <>
              {activeTab === 'assessment' && selectedCard && (
                <CardAssessmentTab card={selectedCard} />
              )}
              {activeTab === 'preview' && selectedCard && (
                <RestorationPreviewTab
                  card={selectedCard}
                  simulation={simulation}
                  targetGrade={targetGrade}
                  onTargetChange={setTargetGrade}
                />
              )}
              {activeTab === 'roi' && selectedCard && (
                <ROICalculatorTab card={selectedCard} scenarios={roiScenarios} />
              )}
              {activeTab === 'regrade' && selectedCard && (
                <RegradeProbabilityTab card={selectedCard} analysis={regradeAnalysis} />
              )}
              {activeTab === 'techniques' && (
                <TechniqueLibraryTab techniques={techniques} />
              )}
              {activeTab === 'batch' && (
                <BatchPlannerTab
                  allCards={allCards}
                  batchPlan={batchPlan}
                  selectedIds={batchSelectedIds}
                  onToggleCard={handleToggleBatchCard}
                  onGeneratePlan={handleGenerateBatchPlan}
                  isLoading={batchLoading}
                  history={history}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestorationSimulator;
