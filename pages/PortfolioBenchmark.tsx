// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Award,
  Users,
  Activity,
  Calendar,
  DollarSign,
  Percent,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  getBenchmarks,
  getPortfolioPerformance,
  getPerformanceTimeSeries,
  getAssetAllocation,
  getRiskMetrics,
  getPeerComparison,
  getDrawdownPeriods,
  getMonthlyReturns,
  getCorrelationMatrix,
  getRiskColor,
  formatCurrency,
  formatPercent,
  formatDate,
  type BenchmarkData,
  type PortfolioPerformance,
  type PerformanceTimeSeries,
  type AssetAllocation,
  type RiskMetrics,
  type PeerComparison,
  type DrawdownPeriod,
  type MonthlyReturn,
  type TimeFrame,
} from '../lib/analytics/portfolioBenchmarkService';

// ---- Helpers ----

const TIMEFRAMES: { key: TimeFrame; label: string }[] = [
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'ALL' },
];

function returnColor(v: number): string {
  if (v >= 10) return 'text-emerald-400';
  if (v > 0) return 'text-green-400';
  if (v === 0) return 'text-slate-400';
  if (v > -10) return 'text-red-400';
  return 'text-red-500';
}

function returnBg(v: number): string {
  if (v >= 5) return 'bg-emerald-500/20';
  if (v > 0) return 'bg-green-500/10';
  if (v === 0) return 'bg-slate-500/10';
  if (v > -5) return 'bg-red-500/10';
  return 'bg-red-500/20';
}

function corrColor(v: number): string {
  if (v >= 0.7) return 'bg-red-500/40 text-red-200';
  if (v >= 0.4) return 'bg-orange-500/30 text-orange-200';
  if (v >= 0.1) return 'bg-yellow-500/20 text-yellow-200';
  if (v > -0.1) return 'bg-slate-600/30 text-slate-300';
  if (v > -0.4) return 'bg-cyan-500/20 text-cyan-200';
  return 'bg-blue-500/30 text-blue-200';
}

// ---- Section wrapper ----

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ---- Custom Tooltip ----

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ---- Main Component ----

const PortfolioBenchmark: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1y');
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [timeSeries, setTimeSeries] = useState<PerformanceTimeSeries[]>([]);
  const [allocation, setAllocation] = useState<AssetAllocation[]>([]);
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [peers, setPeers] = useState<PeerComparison | null>(null);
  const [drawdowns, setDrawdowns] = useState<DrawdownPeriod[]>([]);
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<{ asset1: string; asset2: string; correlation: number }[]>([]);

  useEffect(() => {
    setBenchmarks(getBenchmarks());
    setPerformance(getPortfolioPerformance());
    setTimeSeries(getPerformanceTimeSeries(timeframe));
    setAllocation(getAssetAllocation());
    setRisk(getRiskMetrics());
    setPeers(getPeerComparison());
    setDrawdowns(getDrawdownPeriods());
    setMonthlyReturns(getMonthlyReturns());
    setCorrelationMatrix(getCorrelationMatrix());
  }, []);

  useEffect(() => {
    setTimeSeries(getPerformanceTimeSeries(timeframe));
  }, [timeframe]);

  // Correlation matrix unique assets
  const correlationAssets = useMemo(() => {
    const set = new Set<string>();
    correlationMatrix.forEach((c) => { set.add(c.asset1); set.add(c.asset2); });
    return Array.from(set);
  }, [correlationMatrix]);

  const correlationLookup = useMemo(() => {
    const map = new Map<string, number>();
    correlationMatrix.forEach((c) => {
      map.set(`${c.asset1}|${c.asset2}`, c.correlation);
    });
    return map;
  }, [correlationMatrix]);

  // Monthly returns grouped by year
  const returnsByYear = useMemo(() => {
    const years = Array.from(new Set(monthlyReturns.map((r) => r.year))).sort();
    return years.map((year) => ({
      year,
      months: monthlyReturns.filter((r) => r.year === year),
    }));
  }, [monthlyReturns]);

  // Drawdown chart data
  const drawdownChartData = useMemo(() => {
    return drawdowns.map((d, i) => ({
      name: `DD${i + 1}`,
      drawdown: d.drawdown,
      peak: d.peak,
      trough: d.trough,
      startDate: d.startDate,
      duration: d.duration,
    }));
  }, [drawdowns]);

  if (!performance || !risk || !peers) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
            <BarChart3 size={12} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Portfolio Benchmarking
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Performance <span className="text-blue-400">Benchmarks</span>
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium">
            Compare your portfolio against major indices, analyze risk metrics, and track your competitive standing.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 bg-slate-800/80 border border-slate-700/50 rounded-xl p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === tf.key
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Return', value: formatCurrency(performance.totalReturn), sub: formatPercent(performance.totalReturnPercent), icon: <DollarSign size={14} />, positive: performance.totalReturn >= 0 },
          { label: 'Annualized', value: formatPercent(performance.annualizedReturn), sub: `Vol: ${performance.volatility.toFixed(1)}%`, icon: <TrendingUp size={14} />, positive: performance.annualizedReturn >= 0 },
          { label: 'Sharpe Ratio', value: performance.sharpeRatio.toFixed(2), sub: `Sortino: ${performance.sortino.toFixed(2)}`, icon: <Target size={14} />, positive: performance.sharpeRatio > 0.5 },
          { label: 'Alpha', value: formatPercent(performance.alpha), sub: `Beta: ${performance.beta.toFixed(2)}`, icon: <Award size={14} />, positive: performance.alpha > 0 },
          { label: 'Max Drawdown', value: formatPercent(performance.maxDrawdown), sub: formatDate(performance.maxDrawdownDate), icon: <TrendingDown size={14} />, positive: false },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
              {card.icon}
              <span>{card.label}</span>
            </div>
            <div className={`text-xl font-bold ${card.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Benchmark Comparison Table */}
      <Section title="Benchmark Comparison" icon={<BarChart3 size={16} className="text-blue-400" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 font-medium pb-3 pr-4">Index</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">1M</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">3M</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">6M</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">YTD</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">1Y</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">3Y</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">5Y</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">Vol</th>
                <th className="text-right text-slate-400 font-medium pb-3 px-2">Sharpe</th>
                <th className="text-right text-slate-400 font-medium pb-3 pl-2">Corr</th>
              </tr>
            </thead>
            <tbody>
              {/* Portfolio row */}
              <tr className="border-b border-blue-500/20 bg-blue-500/5">
                <td className="py-2.5 pr-4 font-bold text-blue-400">Your Portfolio</td>
                {(['1m', '3m', '6m', 'ytd', '1y'] as const).map((tf) => {
                  const tsData = getPerformanceTimeSeries(tf);
                  const lastReturn = tsData.length > 0 ? tsData[tsData.length - 1].portfolioReturn : 0;
                  return (
                    <td key={tf} className={`text-right px-2 py-2.5 font-mono font-bold ${returnColor(lastReturn)}`}>
                      {formatPercent(lastReturn)}
                    </td>
                  );
                })}
                <td className={`text-right px-2 py-2.5 font-mono font-bold ${returnColor(performance.totalReturnPercent)}`}>
                  {formatPercent(performance.totalReturnPercent)}
                </td>
                <td className="text-right px-2 py-2.5 font-mono font-bold text-blue-400">--</td>
                <td className="text-right px-2 py-2.5 font-mono text-slate-300">{performance.volatility.toFixed(1)}%</td>
                <td className="text-right px-2 py-2.5 font-mono text-slate-300">{performance.sharpeRatio.toFixed(2)}</td>
                <td className="text-right pl-2 py-2.5 font-mono text-slate-300">1.00</td>
              </tr>
              {benchmarks.map((b) => (
                <tr key={b.index} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-slate-200 font-medium">{b.label}</span>
                    </div>
                  </td>
                  {(['1m', '3m', '6m', 'ytd', '1y', '3y', '5y'] as const).map((tf) => (
                    <td key={tf} className={`text-right px-2 py-2.5 font-mono ${returnColor(b.returns[tf])}`}>
                      {formatPercent(b.returns[tf])}
                    </td>
                  ))}
                  <td className="text-right px-2 py-2.5 font-mono text-slate-300">{b.volatility.toFixed(1)}%</td>
                  <td className="text-right px-2 py-2.5 font-mono text-slate-300">{b.sharpeRatio.toFixed(2)}</td>
                  <td className="text-right pl-2 py-2.5 font-mono text-slate-300">{b.correlation.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Performance Chart */}
      <Section title="Performance Over Time" icon={<Activity size={16} className="text-blue-400" />}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(v) => {
                  const d = new Date(v + 'T00:00:00');
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                interval={Math.floor(timeSeries.length / 8)}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="portfolioReturn" name="Portfolio" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="sp500Return" name="S&P 500" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="cardMarketReturn" name="Card Market" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="bitcoinReturn" name="Bitcoin" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          {[
            { label: 'Portfolio', color: '#3b82f6' },
            { label: 'S&P 500', color: '#10b981' },
            { label: 'Card Market', color: '#06b6d4' },
            { label: 'Bitcoin', color: '#f59e0b' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </Section>

      {/* Monthly Returns Heatmap + Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Returns */}
        <div className="lg:col-span-2">
          <Section title="Monthly Returns Heatmap" icon={<Calendar size={16} className="text-blue-400" />}>
            <div className="space-y-3">
              {returnsByYear.map(({ year, months }) => (
                <div key={year}>
                  <div className="text-xs text-slate-500 font-bold mb-1">{year}</div>
                  <div className="grid grid-cols-12 gap-1">
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = months.find((mo) => mo.month === i + 1);
                      if (!m) {
                        return (
                          <div key={i} className="h-10 rounded bg-slate-800/40 flex items-center justify-center">
                            <span className="text-[9px] text-slate-600">
                              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className={`h-10 rounded flex flex-col items-center justify-center ${returnBg(m.return_)}`}
                          title={`${m.monthLabel} ${year}: ${formatPercent(m.return_)}`}
                        >
                          <span className="text-[9px] text-slate-400">{m.monthLabel}</span>
                          <span className={`text-[10px] font-bold ${returnColor(m.return_)}`}>
                            {m.return_ > 0 ? '+' : ''}{m.return_.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Asset Allocation Pie */}
        <Section title="Asset Allocation" icon={<Percent size={16} className="text-blue-400" />}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="percentage"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {allocation.map((a, i) => (
                    <Cell key={i} fill={a.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {allocation.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: a.color }} />
                  <span className="text-slate-300">{a.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{a.percentage.toFixed(1)}%</span>
                  <span className={`font-mono font-bold ${returnColor(a.return_)}`}>
                    {formatPercent(a.return_)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Risk Dashboard + Peer Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Dashboard */}
        <Section title="Risk Dashboard" icon={<Shield size={16} className="text-blue-400" />}>
          <div className="space-y-4">
            {/* Risk Profile Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-slate-400">Risk Profile:</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                style={{ backgroundColor: getRiskColor(risk.profile) + '20', color: getRiskColor(risk.profile) }}
              >
                {risk.profile}
              </span>
            </div>

            {/* Risk Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'VaR (95%)', value: formatCurrency(risk.valueAtRisk95), desc: 'Daily loss threshold' },
                { label: 'VaR (99%)', value: formatCurrency(risk.valueAtRisk99), desc: 'Extreme loss threshold' },
                { label: 'Expected Shortfall', value: formatCurrency(risk.expectedShortfall), desc: 'Avg loss beyond VaR' },
                { label: 'Diversification', value: `${risk.diversificationScore}/100`, desc: 'Portfolio spread score' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">{m.label}</div>
                  <div className="text-sm font-bold text-white mt-1">{m.value}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Risk Bars */}
            <div className="space-y-2">
              {[
                { label: 'Concentration Risk', value: risk.concentrationRisk },
                { label: 'Liquidity Risk', value: risk.liquidityRisk },
              ].map((bar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{bar.label}</span>
                    <span className="text-slate-300 font-mono">{(bar.value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${bar.value * 100}%`,
                        backgroundColor: bar.value > 0.5 ? '#ef4444' : bar.value > 0.3 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stress Tests */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <AlertTriangle size={12} />
                <span className="font-medium">Stress Test Scenarios</span>
              </div>
              <div className="space-y-1.5">
                {risk.stressTest.map((st, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-xs text-slate-300">{st.scenario}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs">{st.description}</div>
                    </div>
                    <div className="text-sm font-bold text-red-400 ml-3 whitespace-nowrap">
                      {formatCurrency(st.impact)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Peer Ranking */}
        <Section title="Peer Ranking" icon={<Users size={16} className="text-blue-400" />}>
          <div className="space-y-5">
            {/* Percentile Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-20 overflow-hidden">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  <path
                    d="M 10 95 A 90 90 0 0 1 190 95"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 95 A 90 90 0 0 1 190 95"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${(peers.percentile / 100) * 283} 283`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{peers.percentile}th</div>
                    <div className="text-[10px] text-slate-400">percentile</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Rank #{peers.rankByReturn.toLocaleString()} of {peers.totalUsers.toLocaleString()} collectors
              </div>
            </div>

            {/* Peer Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Your Return', value: formatPercent(peers.yourReturn), color: 'text-blue-400' },
                { label: 'Avg Return', value: formatPercent(peers.avgReturn), color: 'text-slate-300' },
                { label: 'Median Return', value: formatPercent(peers.medianReturn), color: 'text-slate-300' },
                { label: 'Top 10% Return', value: formatPercent(peers.topDecileReturn), color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</div>
                  <div className={`text-sm font-bold mt-1 ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Category Ranks */}
            <div>
              <div className="text-xs text-slate-400 font-medium mb-2">Category Rankings</div>
              <div className="space-y-2">
                {peers.categoryRanks.map((cr, i) => {
                  const pct = ((cr.total - cr.rank) / cr.total) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{cr.category}</span>
                        <span className="text-slate-400">
                          #{cr.rank.toLocaleString()} / {cr.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-slate-500">
                Risk-Adjusted Rank: <span className="text-blue-400 font-bold">#{peers.rankByRiskAdjusted.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Drawdown Analysis */}
      <Section title="Drawdown Analysis" icon={<TrendingDown size={16} className="text-blue-400" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawdownChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="drawdown" name="Drawdown" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {drawdowns.map((d, i) => (
              <div key={i} className="bg-slate-900/40 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300 font-medium">
                    {formatDate(d.startDate)} - {formatDate(d.endDate)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Duration: {d.duration} | Recovery: {d.recoveryDate ? formatDate(d.recoveryDate) : 'Ongoing'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-400">{formatPercent(d.drawdown)}</div>
                  <div className="text-[10px] text-slate-500">
                    {formatCurrency(d.peak)} &rarr; {formatCurrency(d.trough)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Correlation Matrix */}
      <Section title="Correlation Matrix" icon={<Target size={16} className="text-blue-400" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr>
                <th className="text-left text-slate-500 font-medium p-1" />
                {correlationAssets.map((a) => (
                  <th key={a} className="text-center text-slate-500 font-medium p-1 min-w-[60px]">
                    <div className="truncate max-w-[60px]" title={a}>{a.replace(' Index', '').replace(' Composite', '')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationAssets.map((row) => (
                <tr key={row}>
                  <td className="text-slate-400 font-medium p-1 whitespace-nowrap pr-2">
                    {row.replace(' Index', '').replace(' Composite', '')}
                  </td>
                  {correlationAssets.map((col) => {
                    const val = correlationLookup.get(`${row}|${col}`) ?? 0;
                    return (
                      <td key={col} className={`text-center p-1 rounded ${corrColor(val)}`}>
                        <span className="font-mono font-bold">{val.toFixed(2)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px]">
          {[
            { label: 'Strong +', cls: 'bg-red-500/40' },
            { label: 'Moderate +', cls: 'bg-orange-500/30' },
            { label: 'Weak', cls: 'bg-slate-600/30' },
            { label: 'Moderate -', cls: 'bg-cyan-500/20' },
            { label: 'Strong -', cls: 'bg-blue-500/30' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded ${l.cls}`} />
              <span className="text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Win/Loss Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Win Rate', value: `${performance.winRate.toFixed(1)}%`, icon: <Award size={14} /> },
          { label: 'Avg Win', value: formatPercent(performance.avgWin), icon: <TrendingUp size={14} /> },
          { label: 'Avg Loss', value: formatPercent(performance.avgLoss), icon: <TrendingDown size={14} /> },
          { label: 'Info Ratio', value: performance.informationRatio.toFixed(2), icon: <Activity size={14} /> },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1">
              {stat.icon}
              <span>{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioBenchmark;
