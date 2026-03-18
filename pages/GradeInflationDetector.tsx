import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, ShieldCheck, Repeat2, ArrowUpDown, Info } from 'lucide-react';
import {
  getCardCategoryInflation,
  getArbitrageOpportunities,
  getPopGrowthAlerts,
  getInflationSummary,
  getAllDriftByYear,
  type GraderStandardsDrift,
  type CardCategoryInflation,
  type GradeArbitrageOpportunity,
  type PopGrowthAlert,
  type InflationSummary,
} from '../lib/gradeInflationDetectorService.ts';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];

const riskBadge = (level: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  };
  return map[level] ?? 'bg-slate-500/20 text-slate-400';
};

const alertBadge = (level: string) => {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  };
  return map[level] ?? 'bg-slate-500/20 text-slate-400';
};

const opportunityBadge = (type: string) => {
  const map: Record<string, string> = {
    crossover: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    resubmit: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    hold: 'bg-slate-500/20 text-slate-400 border border-slate-600/30',
  };
  return map[type] ?? 'bg-slate-500/20 text-slate-400';
};

const GradeInflationDetector: React.FC = () => {
  const [categories, setCategories] = useState<CardCategoryInflation[]>([]);
  const [arbitrage, setArbitrage] = useState<GradeArbitrageOpportunity[]>([]);
  const [popAlerts, setPopAlerts] = useState<PopGrowthAlert[]>([]);
  const [summary, setSummary] = useState<InflationSummary | null>(null);
  const [driftByYear, setDriftByYear] = useState<{ year: number; PSA: number; BGS: number; SGC: number }[]>([]);
  const [activeGrader, setActiveGrader] = useState<'PSA' | 'BGS' | 'SGC'>('PSA');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCategories(getCardCategoryInflation());
      setArbitrage(getArbitrageOpportunities());
      setPopAlerts(getPopGrowthAlerts());
      setSummary(getInflationSummary());
      setDriftByYear(getAllDriftByYear());
      setLoading(false);
    } catch {
      setError('Failed to load Grade Inflation Detector data');
      setLoading(false);
    }
  }, []);

  const categoryChartData = useMemo(
    () =>
      categories.map(c => ({
        name: c.category.length > 28 ? c.category.slice(0, 28) + '…' : c.category,
        fullName: c.category,
        change: c.psa10RateChange,
        risk: c.riskLevel,
      })),
    [categories],
  );

  const driftChartData = useMemo(
    () =>
      driftByYear.map(d => ({
        year: String(d.year),
        PSA: d.PSA,
        BGS: d.BGS,
        SGC: d.SGC,
      })),
    [driftByYear],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Grade Inflation Detector...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <TrendingUp size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Grade Inflation Detector</h1>
            <p className="text-sm text-slate-400">
              Independent standards drift index for PSA, BGS &amp; SGC &mdash; 2015 to 2024
            </p>
          </div>
        </div>
        {summary && (
          <span className="px-3 py-1.5 text-sm font-bold bg-amber-500/20 text-amber-300 rounded-full">
            Drift Index: {summary.overallDriftIndex} / 100 baseline
          </span>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Overall Drift Index</p>
            <p className="text-4xl font-bold text-amber-400">{summary.overallDriftIndex}</p>
            <p className="text-xs text-slate-500 mt-1">Baseline 100 = 2015 standards</p>
          </div>
          <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Most Inflated Category</p>
            <p className="text-lg font-bold text-red-400">{summary.mostInflatedCategory}</p>
            <p className="text-xs text-slate-500 mt-1">Highest risk to existing holders</p>
          </div>
          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Safest Category</p>
            <p className="text-lg font-bold text-emerald-400">{summary.safestCategory}</p>
            <p className="text-xs text-slate-500 mt-1">Standards tightening or stable</p>
          </div>
        </div>
      )}

      {/* Drift Over Time + Grader Tabs */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-400" />
            Gem Rate Drift Over Time (2015–2024)
          </h2>
          <div className="flex gap-2">
            {(['PSA', 'BGS', 'SGC'] as const).map(g => (
              <button
                key={g}
                onClick={() => setActiveGrader(g)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeGrader === g
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={driftChartData}>
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `${v}%`} domain={[0, 50]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`${val.toFixed(1)}%`, 'Gem Rate']}
              />
              {activeGrader === 'PSA' && (
                <Line type="monotone" dataKey="PSA" name="PSA Gem Rate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              )}
              {activeGrader === 'BGS' && (
                <Line type="monotone" dataKey="BGS" name="BGS Pristine Rate" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
              )}
              {activeGrader === 'SGC' && (
                <Line type="monotone" dataKey="SGC" name="SGC Gem Rate" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 flex-wrap text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-emerald-400 inline-block" /> PSA: 28.2% → 42.3%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-blue-400 inline-block" /> BGS: 12.1% → 16.0%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-red-400 inline-block" /> SGC: 22.5% → 31.4%
          </span>
        </div>
      </div>

      {/* Grade Inflation Risk by Category */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-red-400" />
          Grade Inflation Risk by Category
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                width={170}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`+${val.toFixed(1)}% vs 5yr avg`, 'PSA 10 Rate Change']}
                labelFormatter={(label: string) => label}
              />
              <Bar
                dataKey="change"
                name="PSA 10 Rate Change"
                radius={[0, 4, 4, 0]}
                fill="#f87171"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.slice(0, 4).map((cat, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 ${riskBadge(cat.riskLevel)}`}>
                {cat.riskLevel.toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-200">{cat.category}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{cat.implication}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arbitrage Opportunities Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ArrowUpDown size={18} className="text-blue-400" />
          Grade Arbitrage Opportunities
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Card</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Current Grade</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Opportunity</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-3">Expected Gain</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {arbitrage.map((a, idx) => (
                <tr key={idx} className="border-b border-slate-700/20">
                  <td className="py-3 pr-3">
                    <p className="text-sm font-bold text-white">{a.cardName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs">{a.reasoning}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="text-xs font-bold text-slate-300">{a.currentGrade}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${opportunityBadge(a.opportunityType)}`}>
                      {a.opportunityType.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <span className={`text-sm font-bold ${a.expectedGain > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {a.expectedGain > 0 ? `+$${a.expectedGain.toLocaleString()}` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-bold ${a.confidence >= 75 ? 'text-emerald-400' : a.confidence >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {a.confidence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop Growth Alerts */}
      <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-400" />
          Population Growth Alerts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                alert.alertLevel === 'critical'
                  ? 'bg-red-500/10 border-red-500/30'
                  : alert.alertLevel === 'high'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : alert.alertLevel === 'medium'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-white">{alert.cardSetName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${alertBadge(alert.alertLevel)}`}>
                  {alert.alertLevel.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-slate-500">Grader</p>
                  <p className="text-xs font-bold text-slate-300">{alert.grader}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Pop Growth</p>
                  <p className={`text-xs font-bold ${alert.popGrowthRate > 30 ? 'text-red-400' : alert.popGrowthRate > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    +{alert.popGrowthRate}% / yr
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Price Impact</p>
                  <p className={`text-xs font-bold ${alert.priceImpact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {alert.priceImpact > 0 ? '+' : ''}{alert.priceImpact}%
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Current pop: {alert.currentPop.toLocaleString()} &middot; {alert.sport}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Box */}
      {summary && (
        <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-400" />
            What This Means for Your Collection
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              The overall standards drift index has reached{' '}
              <span className="text-amber-400 font-bold">{summary.overallDriftIndex}</span> — up 47 points from the
              2015 baseline. This means that today's PSA 10 on a modern card is statistically easier to achieve
              than it was 9 years ago. As more 10s exist in the market, the traditional scarcity premium that
              justified high prices is eroding.
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-bold text-amber-400 mb-1">Recommended Action</p>
              <p className="text-sm text-slate-300">{summary.recommendedAction}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-400" />
                  <p className="text-xs font-bold text-red-400">Inflation Risk</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Modern football and baseball rookies have the highest grade inflation. PSA 10 scarcity is declining
                  fastest in these categories. Crossover or exit strategies should be evaluated now.
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-400">Safe Zones</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-war vintage, BGS Black Label (10.0), and authenticated raw cards tied to proven HOFers remain
                  the most inflation-resistant positions. Standards here have been essentially flat since 2015.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-4">Last updated: {summary.lastUpdated}</p>
        </div>
      )}
    </div>
  );
};

export default GradeInflationDetector;
