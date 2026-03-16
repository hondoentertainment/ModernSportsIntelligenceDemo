import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  GitBranch,
  Loader2,
  Shield,
  TrendingDown,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  CorrelationStressResult,
  HistoricalDrawdown,
  MonteCarloResult,
  PortfolioPosition,
  SensitivityAnalysis,
  StressScenario,
  TailRiskMetric,
  ValueAtRisk,
} from '../lib/stressTestService';
import {
  applyStressScenario,
  calculateVaR,
  getCorrelationStress,
  getDefaultPortfolio,
  getHistoricalDrawdowns,
  getSensitivityAnalysis,
  getStressScenarios,
  getTailRiskMetrics,
  runMonteCarloSimulation,
} from '../lib/stressTestService';

/* ================================================================= UTILS */

const fmt = (n: number): string =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

function riskColor(level: string): string {
  switch (level) {
    case 'low':      return 'text-emerald-400';
    case 'moderate': return 'text-yellow-400';
    case 'high':     return 'text-red-400';
    case 'extreme':  return 'text-purple-400';
    default:         return 'text-slate-400';
  }
}

function riskBg(level: string): string {
  switch (level) {
    case 'low':      return 'bg-emerald-500/10 border-emerald-500/30';
    case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30';
    case 'high':     return 'bg-red-500/10 border-red-500/30';
    case 'extreme':  return 'bg-purple-500/10 border-purple-500/30';
    default:         return 'bg-slate-500/10 border-slate-500/30';
  }
}

function impactRiskLevel(impact: number): string {
  const abs = Math.abs(impact);
  if (abs >= 0.40) return 'extreme';
  if (abs >= 0.25) return 'high';
  if (abs >= 0.12) return 'moderate';
  return 'low';
}

/* ================================================================== TABS */

type Tab = 'monte-carlo' | 'stress' | 'var' | 'sensitivity' | 'tail' | 'drawdown';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'monte-carlo', label: 'Monte Carlo',      icon: <Activity size={14} /> },
  { id: 'stress',      label: 'Stress Scenarios',  icon: <Zap size={14} /> },
  { id: 'var',         label: 'Value at Risk',     icon: <Shield size={14} /> },
  { id: 'sensitivity', label: 'Sensitivity',       icon: <BarChart3 size={14} /> },
  { id: 'tail',        label: 'Tail Risk',         icon: <AlertTriangle size={14} /> },
  { id: 'drawdown',    label: 'Drawdown Analysis', icon: <TrendingDown size={14} /> },
];

const SIM_COUNTS = [1000, 5000, 10000] as const;
const HORIZONS   = ['1Y', '3Y', '5Y'] as const;

/* ====================================================== MAIN COMPONENT */

const PortfolioStressTester: React.FC = () => {
  /* ---- state ---- */
  const [activeTab, setActiveTab]       = useState<Tab>('monte-carlo');
  const [simCount, setSimCount]         = useState<number>(5000);
  const [horizon, setHorizon]           = useState<string>('3Y');
  const [loading, setLoading]           = useState(true);
  const [mcResult, setMcResult]         = useState<MonteCarloResult | null>(null);
  const [scenarios, setScenarios]       = useState<StressScenario[]>([]);
  const [appliedScenario, setAppliedScenario] = useState<string | null>(null);
  const [stressResult, setStressResult] = useState<{ before: number; after: number; scenario: StressScenario } | null>(null);
  const [varResult, setVarResult]       = useState<ValueAtRisk | null>(null);
  const [sensitivity, setSensitivity]   = useState<SensitivityAnalysis>([]);
  const [tailRisk, setTailRisk]         = useState<TailRiskMetric | null>(null);
  const [drawdowns, setDrawdowns]       = useState<HistoricalDrawdown[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationStressResult[]>([]);

  const portfolio: PortfolioPosition[] = useMemo(() => getDefaultPortfolio(), []);

  const totalValue = useMemo(
    () => portfolio.reduce((s, p) => s + p.currentValue * p.quantity, 0),
    [portfolio],
  );

  const totalCost = useMemo(
    () => portfolio.reduce((s, p) => s + p.avgCost * p.quantity, 0),
    [portfolio],
  );

  const weightedBeta = useMemo(() => {
    const sportBeta: Record<string, number> = {
      baseball: 0.85, basketball: 1.15, football: 1.10, hockey: 0.70, soccer: 0.95,
    };
    return portfolio.reduce((s, p) => s + p.weight * (sportBeta[p.sport] ?? 1), 0);
  }, [portfolio]);

  const diversificationScore = useMemo(() => {
    const sports = new Set(portfolio.map((p) => p.sport));
    const hhi = portfolio.reduce((s, p) => s + p.weight ** 2, 0);
    return Math.round(Math.min(100, (1 - hhi) * 100 * (sports.size / 5) * 1.2));
  }, [portfolio]);

  /* ---- data loader ---- */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mc, sc, vr, sens, tail, dd, corr] = await Promise.all([
        runMonteCarloSimulation(portfolio, simCount, horizon),
        Promise.resolve(getStressScenarios(portfolio)),
        Promise.resolve(calculateVaR(portfolio, 0.95, '1M')),
        Promise.resolve(getSensitivityAnalysis(portfolio)),
        Promise.resolve(getTailRiskMetrics(portfolio)),
        Promise.resolve(getHistoricalDrawdowns(portfolio)),
        Promise.resolve(getCorrelationStress(portfolio)),
      ]);
      setMcResult(mc);
      setScenarios(sc);
      setVarResult(vr);
      setSensitivity(sens);
      setTailRisk(tail);
      setDrawdowns(dd);
      setCorrelations(corr);
    } finally {
      setLoading(false);
    }
  }, [portfolio, simCount, horizon]);

  useEffect(() => { void loadData(); }, [loadData]);

  /* ---- apply stress scenario ---- */
  const handleApplyScenario = useCallback(
    (scenarioId: string) => {
      if (appliedScenario === scenarioId) {
        setAppliedScenario(null);
        setStressResult(null);
        return;
      }
      const result = applyStressScenario(portfolio, scenarioId);
      setAppliedScenario(scenarioId);
      setStressResult(result);
    },
    [portfolio, appliedScenario],
  );

  /* ============================================================ CHARTS */

  /* ---- Monte Carlo fan chart data ---- */
  const fanChartData = useMemo(() => {
    if (!mcResult) return [];
    const steps = mcResult.pathData[0]?.length ?? 0;
    const rows: Record<string, number>[] = [];
    for (let t = 0; t < steps; t++) {
      const values = mcResult.pathData.map((p) => p[t]).sort((a, b) => a - b);
      const pick = (p: number) => values[Math.floor(p * values.length)] ?? 0;
      rows.push({
        month: t,
        p5:  Math.round(pick(0.05)),
        p25: Math.round(pick(0.25)),
        p50: Math.round(pick(0.50)),
        p75: Math.round(pick(0.75)),
        p95: Math.round(pick(0.95)),
      });
    }
    return rows;
  }, [mcResult]);

  /* ---- VaR histogram data ---- */
  const varHistogramData = useMemo(() => {
    if (!mcResult) return [];
    const finalVals = mcResult.pathData.map((p) => p[p.length - 1]);
    const min = Math.min(...finalVals);
    const max = Math.max(...finalVals);
    const bucketCount = 40;
    const bucketSize = (max - min) / bucketCount;
    const buckets: { range: string; count: number; midpoint: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const lo = min + i * bucketSize;
      const hi = lo + bucketSize;
      const count = finalVals.filter((v) => v >= lo && v < hi).length;
      buckets.push({ range: fmt(Math.round(lo)), count, midpoint: Math.round((lo + hi) / 2) });
    }
    return buckets;
  }, [mcResult]);

  /* ---- Sensitivity tornado data ---- */
  const tornadoData = useMemo(() => {
    return sensitivity
      .map((s) => ({
        factor: s.factor,
        negative: Math.round(s.impactAtMinus20 * 10000) / 100,
        positive: Math.round(s.impactAtPlus20 * 10000) / 100,
        range: Math.abs(s.impactAtPlus20 - s.impactAtMinus20),
      }))
      .sort((a, b) => b.range - a.range);
  }, [sensitivity]);

  /* ---- Tail-risk distribution data ---- */
  const tailDistData = useMemo(() => {
    if (!tailRisk) return [];
    const points: { x: number; y: number; isTail: boolean }[] = [];
    for (let z = -4; z <= 4; z += 0.1) {
      // Standard normal density
      const normalY = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
      // Fat-tailed density (student-t approximation with kurtosis)
      const k = tailRisk.kurtosis;
      const fatY = normalY * (1 + (k - 3) * ((z ** 4 - 6 * z ** 2 + 3) / 24));
      points.push({
        x: Math.round(z * 100) / 100,
        y: Math.round(Math.max(0, fatY) * 10000) / 10000,
        isTail: z < -2 || z > 2,
      });
    }
    return points;
  }, [tailRisk]);

  /* ---- Drawdown underwater chart data ---- */
  const drawdownChartData = useMemo(() => {
    return drawdowns.map((d, i) => ({
      label: d.trigger.length > 25 ? d.trigger.slice(0, 25) + '...' : d.trigger,
      depth: Math.round(d.depth * 100),
      recovery: d.recoveryDays,
      startDate: d.startDate,
      index: i,
    }));
  }, [drawdowns]);

  /* ========================================================== RENDER */

  if (loading && !mcResult) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">
            Running {simCount.toLocaleString()} Monte Carlo simulations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
          <GitBranch size={12} />
          Portfolio Stress Tester
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">
          Institutional-Grade Risk Analytics
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Monte Carlo simulation, historical stress scenarios, value-at-risk, sensitivity analysis,
          tail-risk metrics, and drawdown analysis across a {portfolio.length}-card multi-sport portfolio.
        </p>
      </div>

      {/* ── Portfolio Summary Header ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Value" value={fmt(totalValue)} sub={`Cost basis ${fmt(totalCost)}`} color="cyan" />
        <SummaryCard
          label="Weighted Beta"
          value={weightedBeta.toFixed(2)}
          sub={weightedBeta > 1 ? 'Above-market risk' : 'Below-market risk'}
          color={weightedBeta > 1.1 ? 'red' : weightedBeta > 0.9 ? 'yellow' : 'emerald'}
        />
        <SummaryCard
          label="Diversification"
          value={`${diversificationScore}/100`}
          sub={diversificationScore >= 70 ? 'Well diversified' : diversificationScore >= 40 ? 'Moderate' : 'Concentrated'}
          color={diversificationScore >= 70 ? 'emerald' : diversificationScore >= 40 ? 'yellow' : 'red'}
        />
        <SummaryCard
          label="Positions"
          value={String(portfolio.length)}
          sub={`${new Set(portfolio.map((p) => p.sport)).size} sports`}
          color="slate"
        />
      </div>

      {/* ── Controls Row ── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Simulation count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Simulations</span>
          <div className="flex rounded-lg border border-slate-700/60 bg-slate-900/60">
            {SIM_COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setSimCount(c)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  simCount === c
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Time horizon */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Horizon</span>
          <div className="flex rounded-lg border border-slate-700/60 bg-slate-900/60">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  horizon === h
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {loading && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[500px]">
        {activeTab === 'monte-carlo' && mcResult && (
          <MonteCarloTab data={fanChartData} result={mcResult} totalValue={totalValue} />
        )}
        {activeTab === 'stress' && (
          <StressScenariosTab
            scenarios={scenarios}
            appliedId={appliedScenario}
            stressResult={stressResult}
            totalValue={totalValue}
            onApply={handleApplyScenario}
          />
        )}
        {activeTab === 'var' && varResult && (
          <VaRTab varResult={varResult} histogram={varHistogramData} totalValue={totalValue} />
        )}
        {activeTab === 'sensitivity' && (
          <SensitivityTab data={tornadoData} analysis={sensitivity} />
        )}
        {activeTab === 'tail' && tailRisk && (
          <TailRiskTab tailRisk={tailRisk} distData={tailDistData} />
        )}
        {activeTab === 'drawdown' && (
          <DrawdownTab drawdowns={drawdowns} chartData={drawdownChartData} correlations={correlations} />
        )}
      </div>
    </div>
  );
};

export default PortfolioStressTester;

/* ============================================================ SUB-CMPNTS */

/* ---- Summary Card ---- */
function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const borderCls = `border-${color}-500/30`;
  const bgCls     = `bg-${color}-500/5`;
  const valueCls  = `text-${color}-300`;
  return (
    <div className={`rounded-2xl border ${borderCls} ${bgCls} p-4`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueCls}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

/* ================================================================
   TAB 1 — Monte Carlo Fan Chart
   ================================================================ */
function MonteCarloTab({
  data,
  result,
  totalValue,
}: {
  data: Record<string, number>[];
  result: MonteCarloResult;
  totalValue: number;
}) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <MiniStat label="Expected Return" value={pct(result.expectedReturn)} positive={result.expectedReturn >= 0} />
        <MiniStat label="Std Deviation" value={pct(result.standardDeviation)} />
        <MiniStat label="Max Drawdown" value={pct(result.maxDrawdown)} negative />
        <MiniStat label="P5 (Worst Case)" value={fmt(result.percentiles.p5)} negative />
        <MiniStat label="P95 (Best Case)" value={fmt(result.percentiles.p95)} positive />
      </div>

      {/* Fan chart */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Simulation Fan Chart ({result.simulations.toLocaleString()} paths, {result.timeHorizon} horizon)
        </h3>
        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Month', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v: number) => fmt(v)}
              width={70}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v: number, name: string) => [fmt(v), name]}
              labelFormatter={(l: number) => `Month ${l}`}
            />
            {/* P5-P95 band */}
            <Area type="monotone" dataKey="p95" stackId="outer" stroke="none" fill="url(#fanOuter)" name="P95" />
            <Area type="monotone" dataKey="p5"  stackId="outer" stroke="none" fill="transparent" name="P5" />
            {/* P25-P75 band */}
            <Area type="monotone" dataKey="p75" stackId="inner" stroke="none" fill="url(#fanInner)" name="P75" />
            <Area type="monotone" dataKey="p25" stackId="inner" stroke="none" fill="transparent" name="P25" />
            {/* Median */}
            <Area type="monotone" dataKey="p50" stroke="#06b6d4" strokeWidth={2} fill="none" name="Median" />
            <ReferenceLine y={totalValue} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'Current', fill: '#f59e0b', fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Percentile table */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Terminal Value Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-500">
                <th className="pb-2 text-left">Percentile</th>
                <th className="pb-2 text-right">Value</th>
                <th className="pb-2 text-right">Change</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {(['p5', 'p25', 'p50', 'p75', 'p95'] as const).map((k) => {
                const val = result.percentiles[k];
                const chg = (val - totalValue) / totalValue;
                return (
                  <tr key={k} className="border-b border-slate-800/50">
                    <td className="py-2 font-medium uppercase text-slate-400">{k.toUpperCase()}</td>
                    <td className="py-2 text-right font-mono">{fmt(val)}</td>
                    <td className={`py-2 text-right font-mono ${chg >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {chg >= 0 ? '+' : ''}{(chg * 100).toFixed(1)}%
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
}

/* ================================================================
   TAB 2 — Stress Scenarios
   ================================================================ */
function StressScenariosTab({
  scenarios,
  appliedId,
  stressResult,
  totalValue,
  onApply,
}: {
  scenarios: StressScenario[];
  appliedId: string | null;
  stressResult: { before: number; after: number; scenario: StressScenario } | null;
  totalValue: number;
  onApply: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Applied result banner */}
      {stressResult && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <h3 className="text-sm font-semibold text-red-300">
            Scenario Applied: {stressResult.scenario.name}
          </h3>
          <div className="mt-3 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500">Before:</span>{' '}
              <span className="font-mono text-white">{fmt(stressResult.before)}</span>
            </div>
            <div>
              <span className="text-slate-500">After:</span>{' '}
              <span className="font-mono text-red-400">{fmt(stressResult.after)}</span>
            </div>
            <div>
              <span className="text-slate-500">Loss:</span>{' '}
              <span className="font-mono text-red-400">
                -{fmt(stressResult.before - stressResult.after)} (
                {pct((stressResult.before - stressResult.after) / stressResult.before)})
              </span>
            </div>
          </div>

          {/* Top 5 most-impacted cards */}
          <div className="mt-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Most Impacted Cards</p>
            <div className="space-y-1">
              {[...stressResult.scenario.cardImpacts]
                .sort((a, b) => a.impact - b.impact)
                .slice(0, 5)
                .map((ci) => (
                  <div key={ci.cardId} className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[60%]">{ci.cardName}</span>
                    <span className={ci.impact < 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {ci.impact >= 0 ? '+' : ''}{(ci.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Scenario grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((sc) => {
          const level = impactRiskLevel(sc.portfolioImpact);
          const isApplied = appliedId === sc.id;
          return (
            <div
              key={sc.id}
              className={`rounded-2xl border p-4 transition-all ${
                isApplied
                  ? 'border-cyan-500/50 bg-cyan-500/5 ring-1 ring-cyan-500/30'
                  : 'border-slate-700/50 bg-slate-900/60 hover:border-slate-600/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${riskBg(level)} ${riskColor(level)}`}
                >
                  {sc.type}
                </span>
                <span className={`text-lg font-bold ${riskColor(level)}`}>
                  {sc.portfolioImpact >= 0 ? '+' : ''}{(sc.portfolioImpact * 100).toFixed(1)}%
                </span>
              </div>

              <h4 className="mt-2 text-sm font-semibold text-white">{sc.name}</h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{sc.description}</p>

              {/* Factor pills */}
              <div className="mt-3 flex flex-wrap gap-1">
                {sc.factors.slice(0, 3).map((f) => (
                  <span
                    key={f.name}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      f.change < 0
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {f.name} {f.change >= 0 ? '+' : ''}{(f.change * 100).toFixed(0)}%
                  </span>
                ))}
              </div>

              {/* Dollar impact */}
              <p className="mt-2 text-xs text-slate-500">
                Portfolio impact:{' '}
                <span className={sc.portfolioImpact < 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {sc.portfolioImpact >= 0 ? '+' : ''}{fmt(Math.round(totalValue * sc.portfolioImpact))}
                </span>
              </p>

              <button
                onClick={() => onApply(sc.id)}
                className={`mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  isApplied
                    ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isApplied ? 'Applied (click to reset)' : 'Apply Scenario'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   TAB 3 — Value at Risk
   ================================================================ */
function VaRTab({
  varResult,
  histogram,
  totalValue,
}: {
  varResult: ValueAtRisk;
  histogram: { range: string; count: number; midpoint: number }[];
  totalValue: number;
}) {
  const var95Line = totalValue - varResult.confidence95;
  const var99Line = totalValue - varResult.confidence99;

  return (
    <div className="space-y-6">
      {/* VaR stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">95% VaR ({varResult.holdingPeriod})</p>
          <p className="mt-1 text-2xl font-bold text-yellow-300">{fmt(varResult.confidence95)}</p>
          <p className="text-xs text-slate-500">{pct(varResult.confidence95 / totalValue)} of portfolio</p>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">99% VaR ({varResult.holdingPeriod})</p>
          <p className="mt-1 text-2xl font-bold text-red-300">{fmt(varResult.confidence99)}</p>
          <p className="text-xs text-slate-500">{pct(varResult.confidence99 / totalValue)} of portfolio</p>
        </div>
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Expected Shortfall</p>
          <p className="mt-1 text-2xl font-bold text-purple-300">{fmt(varResult.expectedShortfall)}</p>
          <p className="text-xs text-slate-500">Avg loss beyond VaR</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Method</p>
          <p className="mt-1 text-2xl font-bold text-slate-200 capitalize">{varResult.method}</p>
          <p className="text-xs text-slate-500">{varResult.holdingPeriod} holding period</p>
        </div>
      </div>

      {/* Histogram */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Terminal Value Distribution with VaR Lines</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={histogram} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="midpoint"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v: number) => fmt(v)}
              label={{ value: 'Portfolio Value', position: 'insideBottomRight', offset: -10, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [name === 'count' ? `${v} sims` : fmt(v), name === 'count' ? 'Frequency' : name]}
              labelFormatter={(l: number) => `Value: ${fmt(l)}`}
            />
            <Bar dataKey="count" fill="#0e7490" radius={[2, 2, 0, 0]} name="count">
              {histogram.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.midpoint < var99Line
                      ? '#dc2626'
                      : entry.midpoint < var95Line
                        ? '#f59e0b'
                        : '#0e7490'
                  }
                />
              ))}
            </Bar>
            <ReferenceLine
              x={var95Line}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{ value: '95% VaR', fill: '#f59e0b', fontSize: 11, position: 'top' }}
            />
            <ReferenceLine
              x={var99Line}
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{ value: '99% VaR', fill: '#dc2626', fontSize: 11, position: 'top' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 4 — Sensitivity (Tornado Chart)
   ================================================================ */
function SensitivityTab({
  data,
  analysis,
}: {
  data: { factor: string; negative: number; positive: number; range: number }[];
  analysis: SensitivityAnalysis;
}) {
  return (
    <div className="space-y-6">
      {/* Tornado chart */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">
          Portfolio Sensitivity to +/-20% Factor Shocks
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 140, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="category"
              dataKey="factor"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={130}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, name === 'negative' ? 'Downside' : 'Upside']}
            />
            <ReferenceLine x={0} stroke="#475569" />
            <Bar dataKey="negative" fill="#ef4444" radius={[4, 0, 0, 4]} name="negative" />
            <Bar dataKey="positive" fill="#10b981" radius={[0, 4, 4, 0]} name="positive" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most sensitive cards per factor */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Most Sensitive Cards by Factor</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {analysis.slice(0, 4).map((a) => (
            <div key={a.factor} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
              <p className="text-xs font-semibold text-cyan-400 mb-2">{a.factor}</p>
              {a.mostSensitiveCards.slice(0, 3).map((c) => (
                <div key={c.cardId} className="flex justify-between text-[11px] py-0.5">
                  <span className="text-slate-400 truncate max-w-[70%]">{c.cardName.split(' ').slice(0, 4).join(' ')}</span>
                  <span className="text-slate-300 font-mono">{(c.sensitivity * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 5 — Tail Risk
   ================================================================ */
function TailRiskTab({
  tailRisk,
  distData,
}: {
  tailRisk: TailRiskMetric;
  distData: { x: number; y: number; isTail: boolean }[];
}) {
  const kurtosisLevel = tailRisk.kurtosis > 5 ? 'extreme' : tailRisk.kurtosis > 4 ? 'high' : tailRisk.kurtosis > 3.5 ? 'moderate' : 'low';
  const swanLevel = tailRisk.blackSwanProbability > 0.02 ? 'extreme' : tailRisk.blackSwanProbability > 0.01 ? 'high' : tailRisk.blackSwanProbability > 0.005 ? 'moderate' : 'low';

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={`rounded-2xl border p-4 ${riskBg(kurtosisLevel)}`}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Kurtosis</p>
          <p className={`mt-1 text-2xl font-bold ${riskColor(kurtosisLevel)}`}>{tailRisk.kurtosis.toFixed(2)}</p>
          <p className="text-xs text-slate-500">{tailRisk.kurtosis > 3 ? 'Fat tails (leptokurtic)' : 'Normal tails'}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Skewness</p>
          <p className={`mt-1 text-2xl font-bold ${tailRisk.skewness < -0.3 ? 'text-red-400' : tailRisk.skewness > 0.3 ? 'text-emerald-400' : 'text-slate-200'}`}>
            {tailRisk.skewness.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">{tailRisk.skewness < -0.3 ? 'Negative skew (crash-prone)' : 'Near-symmetric'}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Tail Index</p>
          <p className="mt-1 text-2xl font-bold text-cyan-300">{tailRisk.tailIndex.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Hill estimator (lower = fatter)</p>
        </div>
        <div className={`rounded-2xl border p-4 ${riskBg(swanLevel)}`}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Black Swan Prob</p>
          <p className={`mt-1 text-2xl font-bold ${riskColor(swanLevel)}`}>
            {(tailRisk.blackSwanProbability * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500">Monthly &gt;3-sigma event</p>
        </div>
      </div>

      {/* Distribution chart with tail highlighting */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Return Distribution (Fat Tails Highlighted)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={distData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="tailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="x"
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Standard Deviations', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [v.toFixed(4), 'Density']}
              labelFormatter={(l: number) => `${l.toFixed(1)} sigma`}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#bodyGrad)"
              name="Density"
            />
            {/* Overlay tail regions */}
            <ReferenceLine x={-2} stroke="#a855f7" strokeDasharray="4 4" label={{ value: '-2 sigma', fill: '#a855f7', fontSize: 10 }} />
            <ReferenceLine x={2} stroke="#a855f7" strokeDasharray="4 4" label={{ value: '+2 sigma', fill: '#a855f7', fontSize: 10 }} />
            <ReferenceLine x={-3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '-3 sigma', fill: '#ef4444', fontSize: 10 }} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-slate-500">
          Purple region indicates tail-risk zones (&gt;2 sigma). A normal distribution has kurtosis = 3.00.
          Your portfolio shows kurtosis of {tailRisk.kurtosis.toFixed(2)}, indicating
          {tailRisk.kurtosis > 3 ? ' fatter-than-normal tails with higher probability of extreme events.' : ' roughly normal tail behavior.'}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   TAB 6 — Drawdown Analysis
   ================================================================ */
function DrawdownTab({
  drawdowns,
  chartData,
  correlations,
}: {
  drawdowns: HistoricalDrawdown[];
  chartData: { label: string; depth: number; recovery: number; startDate: string; index: number }[];
  correlations: CorrelationStressResult[];
}) {
  return (
    <div className="space-y-6">
      {/* Underwater chart */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Historical Drawdown Episodes</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10, angle: -30, textAnchor: 'end' }}
              height={70}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={['dataMin', 0]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [
                name === 'depth' ? `${v.toFixed(1)}%` : `${v} days`,
                name === 'depth' ? 'Max Drawdown' : 'Recovery',
              ]}
            />
            <Bar dataKey="depth" name="depth" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.depth <= -40
                      ? '#a855f7'
                      : entry.depth <= -25
                        ? '#ef4444'
                        : entry.depth <= -15
                          ? '#f59e0b'
                          : '#10b981'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown detail table */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Drawdown Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-500">
                <th className="pb-2 text-left">Period</th>
                <th className="pb-2 text-left">Trigger</th>
                <th className="pb-2 text-right">Depth</th>
                <th className="pb-2 text-right">Recovery</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {drawdowns.map((d, i) => {
                const level = d.depth <= -0.40 ? 'extreme' : d.depth <= -0.25 ? 'high' : d.depth <= -0.15 ? 'moderate' : 'low';
                return (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-2 font-mono text-slate-400">
                      {d.startDate} to {d.endDate}
                    </td>
                    <td className="py-2">{d.trigger}</td>
                    <td className={`py-2 text-right font-mono font-semibold ${riskColor(level)}`}>
                      {(d.depth * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 text-right font-mono">
                      {d.recoveryDays}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Stress */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Correlation Under Stress</h3>
        <p className="mb-4 text-xs text-slate-500">
          Diversification benefits evaporate during crises as correlations spike. Higher stress
          correlation means less protection when you need it most.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="normalCorrelation"
              name="Normal"
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 1]}
              label={{ value: 'Normal Correlation', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="stressCorrelation"
              name="Stress"
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 1]}
              label={{ value: 'Stress Correlation', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [v.toFixed(2), name]}
            />
            {/* 45-degree line */}
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
              stroke="#475569"
              strokeDasharray="6 3"
            />
            <Scatter data={correlations} name="Correlation Pairs">
              {correlations.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.contagionRisk === 'extreme'
                      ? '#a855f7'
                      : entry.contagionRisk === 'high'
                        ? '#ef4444'
                        : entry.contagionRisk === 'moderate'
                          ? '#f59e0b'
                          : '#10b981'
                  }
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          {correlations.map((c) => (
            <div key={c.pairLabel} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                c.contagionRisk === 'extreme' ? 'bg-purple-500' : c.contagionRisk === 'high' ? 'bg-red-500' : c.contagionRisk === 'moderate' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} />
              <span className="text-slate-400">{c.pairLabel}</span>
              <span className={`font-mono ${riskColor(c.contagionRisk)}`}>
                {c.normalCorrelation.toFixed(2)} &rarr; {c.stressCorrelation.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Mini stat helper ---- */
function MiniStat({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const cls = positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-slate-200';
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold font-mono ${cls}`}>{value}</p>
    </div>
  );
}
