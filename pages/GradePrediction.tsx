import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Award,
  Target,
  DollarSign,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Eye,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getGradePredictions,
  getGradingCosts,
  getPopulationData,
  getGradingROI,
  getSubmissionTracker,
  getPredictionStats,
  predictGrade,
  getCompanyColor,
  getGradeColor,
  getStatusLabel,
  formatCurrency,
  getSubgradeLabel,
  getRecommendationColor,
  type GradePrediction as GradePredictionType,
  type GradingCompany,
  type SubgradeCategory,
} from '../lib/analytics/gradePredictionService.ts';

// ---- Tab type ----
type TabId = 'predictions' | 'costs' | 'population' | 'roi' | 'tracker' | 'upload';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'predictions', label: 'Grade Predictions', icon: <Award className="w-4 h-4" /> },
  { id: 'costs', label: 'Grading Costs', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'population', label: 'Population Report', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'roi', label: 'ROI Calculator', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'tracker', label: 'Submission Tracker', icon: <Clock className="w-4 h-4" /> },
  { id: 'upload', label: 'Predict Grade', icon: <Upload className="w-4 h-4" /> },
];

const STATUS_STEPS = ['submitted', 'received', 'grading', 'shipped', 'complete'] as const;

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500',
  received: 'bg-amber-500',
  grading: 'bg-purple-500',
  shipped: 'bg-cyan-500',
  complete: 'bg-emerald-500',
};

// ---- Stats Row ----
function StatsRow() {
  const stats = useMemo(() => getPredictionStats(), []);
  const items = [
    { label: 'Total Predictions', value: stats.totalPredictions.toLocaleString(), icon: <Target className="w-5 h-5 text-blue-400" /> },
    { label: 'Accuracy Rate', value: `${stats.accuracyRate}%`, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
    { label: 'Exact Match', value: `${stats.exactMatch}%`, icon: <Award className="w-5 h-5 text-amber-400" /> },
    { label: 'Avg ROI', value: `${stats.avgROIOnSubmissions}%`, icon: <TrendingUp className="w-5 h-5 text-purple-400" /> },
    { label: 'Total Savings', value: formatCurrency(stats.totalSavings), icon: <DollarSign className="w-5 h-5 text-green-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {items.map(item => (
        <div key={item.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700/50">{item.icon}</div>
          <div>
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="text-lg font-bold text-white">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Prediction Card ----
function PredictionCard({ prediction }: { prediction: GradePredictionType }) {
  const [expanded, setExpanded] = useState(false);
  const bestPred = prediction.predictions[0];
  const subgradeData = (['centering', 'corners', 'edges', 'surface'] as SubgradeCategory[]).map(cat => ({
    subject: getSubgradeLabel(cat),
    value: bestPred.subgrades[cat],
    fullMark: 10,
  }));

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">{prediction.player}</h3>
          <p className="text-slate-400 text-xs">{prediction.cardName} ({prediction.year})</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-slate-700/50 text-slate-300">{prediction.sport}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: getGradeColor(bestPred.predictedGrade) }}>
            {bestPred.predictedGrade}
          </div>
          <div className="text-xs text-slate-400">Predicted</div>
        </div>
      </div>

      {/* Confidence meter */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Confidence</span>
          <span className="text-white font-medium">{prediction.overallConfidence}%</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${prediction.overallConfidence}%`,
              backgroundColor: prediction.overallConfidence >= 85 ? '#10b981' : prediction.overallConfidence >= 70 ? '#fbbf24' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Value delta */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-700/30 rounded-lg p-2">
          <div className="text-xs text-slate-400">Raw</div>
          <div className="text-sm font-semibold text-white">{formatCurrency(prediction.valueDelta.raw)}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-2">
          <div className="text-xs text-slate-400">Graded</div>
          <div className="text-sm font-semibold text-emerald-400">{formatCurrency(prediction.valueDelta.graded)}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-2">
          <div className="text-xs text-slate-400">Uplift</div>
          <div className="text-sm font-semibold text-amber-400">+{prediction.valueDelta.upliftPercent}%</div>
        </div>
      </div>

      {/* Company comparison row */}
      <div className="flex gap-1 mb-3">
        {prediction.predictions.map(p => (
          <div
            key={p.company}
            className="flex-1 text-center rounded-lg p-1.5"
            style={{ backgroundColor: `${getCompanyColor(p.company)}15`, border: `1px solid ${getCompanyColor(p.company)}30` }}
          >
            <div className="text-xs font-medium" style={{ color: getCompanyColor(p.company) }}>{p.company}</div>
            <div className="text-sm font-bold text-white">{p.predictedGrade}</div>
            <div className="text-xs text-slate-400">{p.confidence}%</div>
          </div>
        ))}
      </div>

      {/* Recommendation badge */}
      <div className={`rounded-lg p-3 mb-3 ${prediction.submissionRecommendation.recommended ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
        <div className="flex items-center gap-2 mb-1">
          {prediction.submissionRecommendation.recommended ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs font-semibold ${prediction.submissionRecommendation.recommended ? 'text-emerald-400' : 'text-red-400'}`}>
            {prediction.submissionRecommendation.recommended ? 'SUBMIT' : 'HOLD'}
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            {prediction.submissionRecommendation.bestCompany} {prediction.submissionRecommendation.bestTier.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{prediction.submissionRecommendation.reasoning}</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 py-1"
      >
        <Eye className="w-3 h-3" />
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Subgrade radar */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Subgrade Analysis ({bestPred.company})</h4>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={subgradeData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[6, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="value" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            {/* Subgrade bars */}
            {(['centering', 'corners', 'edges', 'surface'] as SubgradeCategory[]).map(cat => (
              <div key={cat} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-slate-400 w-20">{getSubgradeLabel(cat)}</span>
                <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(bestPred.subgrades[cat] / 10) * 100}%`,
                      backgroundColor: getGradeColor(bestPred.subgrades[cat]),
                    }}
                  />
                </div>
                <span className="text-xs text-white font-medium w-8 text-right">{bestPred.subgrades[cat].toFixed(1)}</span>
              </div>
            ))}
          </div>

          {/* Grade distribution chart */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Grade Distribution</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={bestPred.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="probability" fill="#60a5fa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Condition notes */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Condition Notes</h4>
            <ul className="space-y-1">
              {prediction.conditionNotes.map((note, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Grading Cost Table ----
function GradingCostTable() {
  const costs = useMemo(() => getGradingCosts(), []);
  const tiers: { key: string; label: string }[] = [
    { key: 'value', label: 'Value' },
    { key: 'regular', label: 'Regular' },
    { key: 'express', label: 'Express' },
    { key: 'super_express', label: 'Super Express' },
    { key: 'walk_through', label: 'Walk-Through' },
  ];

  return (
    <div className="space-y-4">
      {/* Pricing table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Grading Cost Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 text-xs font-medium p-3">Tier</th>
                {costs.map(c => (
                  <th key={c.company} className="text-center text-xs font-medium p-3" style={{ color: getCompanyColor(c.company) }}>
                    {c.company}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map(tier => (
                <tr key={tier.key} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 text-xs font-medium">{tier.label}</td>
                  {costs.map(c => {
                    const t = c.tiers.find(tt => tt.tier === tier.key);
                    return (
                      <td key={c.company} className="p-3 text-center">
                        {t && t.available ? (
                          <div>
                            <div className="text-white font-semibold text-sm">{formatCurrency(t.cost)}</div>
                            <div className="text-slate-500 text-xs">{t.turnaround}</div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk discounts & membership */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {costs.map(c => (
          <div key={c.company} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: getCompanyColor(c.company) }}>
              <Shield className="w-4 h-4" />
              {c.company} Details
            </h4>
            <div className="space-y-2 mb-3">
              <div className="text-xs text-slate-400">Bulk Discounts</div>
              {c.bulkDiscount.map(bd => (
                <div key={bd.minCards} className="flex justify-between text-xs">
                  <span className="text-slate-300">{bd.minCards}+ cards</span>
                  <span className="text-emerald-400 font-medium">{bd.discount}% off</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700/50 pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Membership</span>
                <span className="text-white font-medium">{c.membershipCost > 0 ? formatCurrency(c.membershipCost) + '/yr' : 'Free'}</span>
              </div>
              <ul className="space-y-0.5">
                {c.membershipBenefits.map((b, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Population Report ----
function PopulationReport() {
  const popData = useMemo(() => getPopulationData(), []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = popData[selectedIdx];

  const pieColors = ['#10b981', '#34d399', '#fbbf24', '#f97316', '#ef4444', '#dc2626', '#9333ea'];

  return (
    <div className="space-y-4">
      {/* Card selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Population Report
        </h3>
        <div className="flex flex-wrap gap-2">
          {popData.map((pd, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === selectedIdx ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700/30 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {pd.player}
            </button>
          ))}
        </div>
      </div>

      {selected && selected.populations.map((pop, pi) => (
        <div key={pi} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold" style={{ color: getCompanyColor(pop.company) }}>{pop.company} Population</h4>
              <p className="text-xs text-slate-400">{selected.cardName} - {selected.player}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{pop.totalGraded.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Total Graded</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar visualization */}
            <div className="space-y-2">
              {pop.grades.map((g, gi) => (
                <div key={g.grade} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8 text-right">{g.grade}</span>
                  <div className="flex-1 h-5 bg-slate-700/50 rounded overflow-hidden relative">
                    <div
                      className="h-full rounded"
                      style={{ width: `${g.percentOfTotal}%`, backgroundColor: pieColors[gi % pieColors.length] }}
                    />
                    <span className="absolute right-2 top-0 h-full flex items-center text-xs text-white font-medium">
                      {g.count.toLocaleString()} ({g.percentOfTotal}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie chart */}
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pop.grades}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ grade, percentOfTotal }) => `${grade}: ${percentOfTotal}%`}
                  >
                    {pop.grades.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <span className="text-xs text-slate-400">Gem Rate: </span>
                <span className="text-sm font-bold text-emerald-400">{pop.gem_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- ROI Calculator ----
function ROICalculator() {
  const [cardValue, setCardValue] = useState(200);
  const roiData = useMemo(() => getGradingROI(cardValue), [cardValue]);

  const chartData = roiData.map(r => ({
    grade: r.grade,
    'Graded Value': r.gradedValue,
    'Net ROI': r.netROI,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Grading ROI Calculator
        </h3>
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">Raw Card Value</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={cardValue}
              onChange={e => setCardValue(parseInt(e.target.value, 10))}
              className="flex-1 accent-purple-500"
            />
            <span className="text-white font-bold text-lg w-24 text-right">{formatCurrency(cardValue)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-1">Break-even Grade: <span className="text-white font-semibold">{roiData[0]?.breakEvenGrade}</span></div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="Graded Value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Net ROI" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROI table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left text-slate-400 text-xs font-medium p-3">Grade</th>
              <th className="text-right text-slate-400 text-xs font-medium p-3">Graded Value</th>
              <th className="text-right text-slate-400 text-xs font-medium p-3">Cost</th>
              <th className="text-right text-slate-400 text-xs font-medium p-3">Net ROI</th>
              <th className="text-right text-slate-400 text-xs font-medium p-3">ROI %</th>
              <th className="text-center text-slate-400 text-xs font-medium p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {roiData.map(r => (
              <tr key={r.grade} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="p-3 text-white font-semibold">{r.grade}</td>
                <td className="p-3 text-right text-slate-300">{formatCurrency(r.gradedValue)}</td>
                <td className="p-3 text-right text-slate-400">{formatCurrency(r.gradingCost)}</td>
                <td className="p-3 text-right font-medium" style={{ color: r.netROI >= 0 ? '#10b981' : '#ef4444' }}>
                  {r.netROI >= 0 ? '+' : ''}{formatCurrency(r.netROI)}
                </td>
                <td className="p-3 text-right font-medium" style={{ color: r.roiPercent >= 0 ? '#10b981' : '#ef4444' }}>
                  {r.roiPercent >= 0 ? '+' : ''}{r.roiPercent}%
                </td>
                <td className="p-3 text-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      color: getRecommendationColor(r.recommendation),
                      backgroundColor: `${getRecommendationColor(r.recommendation)}15`,
                    }}
                  >
                    {r.recommendation.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Submission Tracker ----
function SubmissionTrackerView() {
  const submissions = useMemo(() => getSubmissionTracker(), []);
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, [submissions]);

  return (
    <div className="space-y-4">
      {/* Pipeline overview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Submission Pipeline
        </h3>
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex-1 text-center">
                <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${statusColors[step]}`}>
                  {statusCounts[step] || 0}
                </div>
                <div className="text-xs text-slate-400 mt-1">{getStatusLabel(step)}</div>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Submission cards */}
      <div className="space-y-2">
        {submissions.map(sub => {
          const stepIdx = STATUS_STEPS.indexOf(sub.status as typeof STATUS_STEPS[number]);
          return (
            <div key={sub.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white text-sm font-semibold">{sub.player}</h4>
                  <p className="text-xs text-slate-400">{sub.cardName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: getCompanyColor(sub.company), backgroundColor: `${getCompanyColor(sub.company)}15` }}>
                    {sub.company}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${statusColors[sub.status]}`}>
                    {getStatusLabel(sub.status)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1 mb-2">
                {STATUS_STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full ${i <= stepIdx ? statusColors[sub.status] : 'bg-slate-700'}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex gap-4">
                  <span>Submitted: {sub.submittedDate}</span>
                  <span>Est. Return: {sub.estimatedReturn}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Predicted: <span className="text-white font-medium">{sub.predictedGrade}</span></span>
                  {sub.actualGrade !== null && (
                    <span>Actual: <span className="font-medium" style={{ color: getGradeColor(sub.actualGrade) }}>{sub.actualGrade}</span></span>
                  )}
                  <span>Cost: <span className="text-white font-medium">{formatCurrency(sub.cost)}</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Upload Zone ----
function UploadZone() {
  const [prediction, setPrediction] = useState<GradePredictionType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePredict = useCallback(() => {
    setIsAnalyzing(true);
    setPrediction(null);
    setTimeout(() => {
      const result = predictGrade();
      setPrediction(result);
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" />
          AI Grade Prediction
        </h3>

        <div
          className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-slate-500 transition-colors cursor-pointer"
          onClick={handlePredict}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-400 text-sm font-medium">Analyzing card condition...</p>
              <p className="text-slate-500 text-xs">AI is examining centering, corners, edges, and surface</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-white text-sm font-medium">Click to Analyze a Card</p>
              <p className="text-slate-500 text-xs">Simulated AI analysis will predict grade, subgrades, and ROI</p>
            </div>
          )}
        </div>
      </div>

      {prediction && (
        <div className="animate-in fade-in">
          <PredictionCard prediction={prediction} />
        </div>
      )}
    </div>
  );
}

// ---- Main Page Component ----
const GradePrediction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('predictions');
  const predictions = useMemo(() => getGradePredictions(), []);
  const [sportFilter, setSportFilter] = useState<string>('All');

  const sports = useMemo(() => {
    const s = new Set(predictions.map(p => p.sport));
    return ['All', ...Array.from(s).sort()];
  }, [predictions]);

  const filteredPredictions = useMemo(
    () => sportFilter === 'All' ? predictions : predictions.filter(p => p.sport === sportFilter),
    [predictions, sportFilter]
  );

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          Grade Prediction with Confidence Score
        </h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered grade predictions, ROI analysis, and submission tracking</p>
      </div>

      {/* Stats row */}
      <StatsRow />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700/50 pb-3">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'predictions' && (
        <div>
          {/* Sport filter */}
          <div className="flex gap-2 mb-4">
            {sports.map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sportFilter === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700/30 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPredictions.map(p => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'costs' && <GradingCostTable />}
      {activeTab === 'population' && <PopulationReport />}
      {activeTab === 'roi' && <ROICalculator />}
      {activeTab === 'tracker' && <SubmissionTrackerView />}
      {activeTab === 'upload' && <UploadZone />}
    </div>
  );
};

export default GradePrediction;
