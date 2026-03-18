import React, { useState, useEffect, useMemo } from 'react';
import {
  Skull,
  AlertTriangle,
  ArrowRightLeft,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Clock,
  Shield,
  Zap,
  Filter,
  ChevronDown,
  ChevronRight,
  Target,
  AlertCircle,
  RefreshCw,
  Layers,
  Crosshair,
  ArrowRight,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  scanPortfolio,
  getDeadMoneyScore,
  getSwapRecommendations,
  getCapitalEfficiency,
  getOpportunityCost,
  getRedeploymentStrategies,
  getPortfolioVelocity,
  getDeadMoneyTrend,
  getDeadMoneyAlerts,
  getHealthScore,
  simulateSwap,
  getCatalystOutlooks,
  getStagnationMetrics,
  formatCurrency,
  formatPercent,
  type DeadMoneyAsset,
  type SwapRecommendation,
  type CapitalEfficiency,
  type OpportunityCost,
  type RedeploymentStrategy,
  type AssetVelocity,
  type DeadMoneyTrend,
  type DeadMoneyAlert,
  type PortfolioHealthScore,
  type CatalystOutlook,
  type StagnationMetrics,
  type Sport,
} from '../lib/analytics/deadMoneyDetectorService';

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399', '#22d3ee', '#fb923c'];
const QUADRANT_COLORS: Record<string, string> = { star: '#10b981', sleeper: '#60a5fa', fading: '#fbbf24', dead: '#f87171' };

const SPORT_OPTIONS: { value: Sport | 'all'; label: string }[] = [
  { value: 'all', label: 'All Sports' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'soccer', label: 'Soccer' },
];

const HOLD_OPTIONS = [
  { value: 0, label: 'Any Hold Period' },
  { value: 180, label: '180+ days' },
  { value: 365, label: '365+ days' },
  { value: 730, label: '730+ days' },
];

const SCORE_OPTIONS = [
  { value: 0, label: 'Any Score' },
  { value: 40, label: '40+' },
  { value: 60, label: '60+' },
  { value: 80, label: '80+' },
];

// ── Health Score Gauge ──────────────────────────────────────────────────────────

const HealthGauge: React.FC<{ score: number; grade: string }> = ({ score, grade }) => {
  const radius = 70;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degrees
  const filled = arc * (score / 100);
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="160" viewBox="0 0 180 170">
        <circle
          cx="90" cy="95" r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135 90 95)"
        />
        <circle
          cx="90" cy="95" r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135 90 95)"
          className="transition-all duration-1000 ease-out"
        />
        <text x="90" y="88" textAnchor="middle" className="fill-white text-4xl font-bold" style={{ fontSize: 36 }}>{score}</text>
        <text x="90" y="112" textAnchor="middle" className="fill-slate-400 text-sm" style={{ fontSize: 14 }}>/ 100</text>
        <text x="90" y="140" textAnchor="middle" fill={color} style={{ fontSize: 18, fontWeight: 700 }}>{grade}</text>
      </svg>
    </div>
  );
};

// ── Swap Card ────────────────────────────────────────────────────────────────────

const SwapCard: React.FC<{ swap: SwapRecommendation; onSimulate: () => void }> = ({ swap, onSimulate }) => {
  const riskColors: Record<string, string> = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' };
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 hover:border-emerald-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Swap #{swap.id.split('-')[1]}</span>
        <span className={`text-xs font-semibold ${riskColors[swap.riskLevel]}`}>{swap.riskLevel} risk</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-3">
        {/* From */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Sell</p>
          <p className="text-xs text-white font-medium truncate">{swap.fromAsset.player}</p>
          <p className="text-[10px] text-slate-500 truncate">{swap.fromAsset.cardName.substring(0, 35)}...</p>
          <p className="text-sm font-bold text-red-400 mt-1">{formatCurrency(swap.fromAsset.currentValue)}</p>
          <p className="text-[10px] text-slate-500">Score: {swap.fromAsset.deadMoneyScore}</p>
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <ArrowRightLeft size={18} className="text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-bold">+{formatCurrency(swap.expectedGain)}</span>
        </div>
        {/* To */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Buy</p>
          <p className="text-xs text-white font-medium truncate">{swap.toAsset.player}</p>
          <p className="text-[10px] text-slate-500 truncate">{swap.toAsset.name.substring(0, 35)}...</p>
          <p className="text-sm font-bold text-emerald-400 mt-1">{formatCurrency(swap.toAsset.currentValue)}</p>
          <p className="text-[10px] text-slate-500">+{(swap.toAsset.projectedGrowth * 100).toFixed(0)}% projected</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{swap.rationale}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">Confidence: <span className="text-white font-bold">{swap.confidence}%</span></span>
          <span className="text-[10px] text-slate-500">Timeframe: <span className="text-white font-bold">{swap.timeframe}</span></span>
        </div>
        <button onClick={onSimulate} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors">
          Simulate
        </button>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────────

const DeadMoneyDetector: React.FC = () => {
  const [assets, setAssets] = useState<DeadMoneyAsset[]>([]);
  const [healthScore, setHealthScore] = useState<PortfolioHealthScore | null>(null);
  const [swaps, setSwaps] = useState<SwapRecommendation[]>([]);
  const [efficiency, setEfficiency] = useState<CapitalEfficiency | null>(null);
  const [oppCost, setOppCost] = useState<OpportunityCost | null>(null);
  const [strategies, setStrategies] = useState<RedeploymentStrategy[]>([]);
  const [velocity, setVelocity] = useState<AssetVelocity[]>([]);
  const [trend, setTrend] = useState<DeadMoneyTrend[]>([]);
  const [alerts, setAlerts] = useState<DeadMoneyAlert[]>([]);
  const [catalysts, setCatalysts] = useState<CatalystOutlook[]>([]);
  const [metrics, setMetrics] = useState<StagnationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [holdFilter, setHoldFilter] = useState(0);
  const [scoreFilter, setScoreFilter] = useState(0);

  // Swap simulator
  const [simResult, setSimResult] = useState<{ projectedGain: number; riskScore: number; timeline: { month: string; fromValue: number; toValue: number }[] } | null>(null);
  const [simSwap, setSimSwap] = useState<SwapRecommendation | null>(null);

  // Opportunity cost period
  const [costDays, setCostDays] = useState(365);

  useEffect(() => {
    try {
      setAssets(scanPortfolio());
      setHealthScore(getHealthScore());
      setSwaps(getSwapRecommendations());
      setEfficiency(getCapitalEfficiency());
      setOppCost(getOpportunityCost(365));
      setStrategies(getRedeploymentStrategies());
      setVelocity(getPortfolioVelocity());
      setTrend(getDeadMoneyTrend(180));
      setAlerts(getDeadMoneyAlerts());
      setCatalysts(getCatalystOutlooks());
      setMetrics(getStagnationMetrics());
      setLoading(false);
    } catch {
      setError('Failed to load Dead Money Detector data');
      setLoading(false);
    }
  }, []);

  // Update opp cost when days change
  useEffect(() => {
    if (!loading) setOppCost(getOpportunityCost(costDays));
  }, [costDays, loading]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (sportFilter !== 'all' && a.sport !== sportFilter) return false;
      if (holdFilter > 0 && a.holdDays < holdFilter) return false;
      if (scoreFilter > 0 && a.deadMoneyScore < scoreFilter) return false;
      return true;
    });
  }, [assets, sportFilter, holdFilter, scoreFilter]);

  const deadMoneyPctScore = useMemo(() => getDeadMoneyScore(), []);

  const scatterData = useMemo(() => {
    return velocity.map(v => ({
      x: v.liquidityScore,
      y: v.appreciationRate,
      z: v.deadMoneyScore,
      name: v.player,
      quadrant: v.quadrant,
    }));
  }, [velocity]);

  const handleSimulate = (swap: SwapRecommendation) => {
    setSimSwap(swap);
    const result = simulateSwap(swap.fromAsset.cardId, swap.toAsset.name);
    setSimResult(result);
  };

  const unreadAlerts = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Scanning portfolio for dead money...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-xl">
              <Skull size={24} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dead Money Detector</h1>
              <p className="text-sm text-slate-400">Identify stagnant capital and redeploy for growth</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadAlerts > 0 && (
            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
              {unreadAlerts} new alerts
            </span>
          )}
          <button className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5">
            <RefreshCw size={12} /> Rescan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
        <Filter size={14} className="text-slate-500" />
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value as Sport | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={holdFilter}
          onChange={e => setHoldFilter(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          {HOLD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={scoreFilter}
          onChange={e => setScoreFilter(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          {SCORE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-[10px] text-slate-500 ml-auto">{filteredAssets.length} assets shown</span>
      </div>

      {/* Top Row — Health + Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Health Gauge */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-700 p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Portfolio Health</p>
          {healthScore && <HealthGauge score={healthScore.score} grade={healthScore.grade} />}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Dead Money</p>
              <p className="text-sm font-bold text-red-400">{healthScore?.deadMoneyPercentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Liquidity</p>
              <p className="text-sm font-bold text-amber-400">{healthScore?.liquidityScore}/100</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Catalyst Coverage</p>
              <p className="text-sm font-bold text-blue-400">{healthScore?.catalystCoverage}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500">Avg Velocity</p>
              <p className="text-sm font-bold text-red-400">{healthScore?.avgVelocity}%</p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skull size={14} className="text-red-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Dead Cards</span>
            </div>
            <p className="text-2xl font-bold text-white">{filteredAssets.filter(a => a.deadMoneyScore >= 60).length}</p>
            <p className="text-[10px] text-slate-500">of {filteredAssets.length} total holdings</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-red-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Dead Capital</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{efficiency ? formatCurrency(efficiency.deadCapital) : '--'}</p>
            <p className="text-[10px] text-slate-500">{efficiency ? `${100 - efficiency.efficiencyRatio}% of portfolio` : ''}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-amber-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Opp Cost</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{oppCost ? formatCurrency(oppCost.totalCost) : '--'}</p>
            <p className="text-[10px] text-slate-500">{oppCost ? `${formatCurrency(oppCost.dailyAverage)}/day avg` : ''}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-blue-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Avg Stagnation</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics?.avgStagnationDays ?? '--'}</p>
            <p className="text-[10px] text-slate-500">days without movement</p>
          </div>
          {/* Second row of metrics */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Efficiency</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{efficiency?.efficiencyRatio ?? '--'}%</p>
            <p className="text-[10px] text-slate-500">productive capital ratio</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft size={14} className="text-violet-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Swap Opps</span>
            </div>
            <p className="text-2xl font-bold text-violet-400">{swaps.length}</p>
            <p className="text-[10px] text-slate-500">recommended swaps</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-cyan-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Catalysts</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{catalysts.length}</p>
            <p className="text-[10px] text-slate-500">upcoming events tracked</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-red-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Portfolio Drag</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{metrics?.portfolioDrag ?? '--'}%</p>
            <p className="text-[10px] text-slate-500">annual impact from dead money</p>
          </div>
        </div>
      </div>

      {/* Capital Efficiency + Dead Money Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capital Efficiency Over Time */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Capital Efficiency Over Time</h3>
          </div>
          {efficiency && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={efficiency.productiveHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v: number, name: string) => [formatCurrency(v), name === 'productive' ? 'Productive' : 'Dead']}
                />
                <Area type="monotone" dataKey="productive" stackId="1" fill="#10b981" stroke="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="dead" stackId="1" fill="#f87171" stroke="#f87171" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dead Money Trend */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-white">Dead Money Trend (180 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="deadMoneyCount" stroke="#f87171" strokeWidth={2} name="Dead Cards" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="portfolioPercentage" stroke="#fbbf24" strokeWidth={2} name="% of Portfolio" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opportunity Cost Calculator */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Opportunity Cost Calculator</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Period:</span>
            {[90, 180, 365, 730].map(d => (
              <button
                key={d}
                onClick={() => setCostDays(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${costDays === d ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {oppCost && (
          <>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-amber-400/70">Your dead money has cost you an estimated</p>
              <p className="text-3xl font-bold text-amber-400 my-1">{formatCurrency(oppCost.totalCost)}</p>
              <p className="text-xs text-slate-500">in missed gains over the last {oppCost.period} days ({formatCurrency(oppCost.dailyAverage)}/day)</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {oppCost.costByAsset.slice(0, 6).map((a, i) => (
                <div key={i} className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-slate-400 truncate">{a.cardName}</p>
                  <p className="text-sm font-bold text-red-400">{formatCurrency(a.cost)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dead Money Leaderboard */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Skull size={16} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">Dead Money Leaderboard</h3>
          <span className="text-[10px] text-slate-500 ml-auto">Ranked by stagnation score</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3">#</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3">Card</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3 hidden sm:table-cell">Sport</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3">Bought</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3">Now</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3 hidden md:table-cell">Change</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3 hidden md:table-cell">Stag Days</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3">Score</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-widest py-2 pr-3 hidden sm:table-cell">Liquidity</th>
                <th className="text-center text-[10px] text-slate-500 uppercase tracking-widest py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a, i) => {
                const change = ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100;
                const scoreColor = a.deadMoneyScore >= 80 ? 'text-red-400' : a.deadMoneyScore >= 60 ? 'text-amber-400' : a.deadMoneyScore >= 40 ? 'text-yellow-400' : 'text-emerald-400';
                const liqColor = a.liquidityTrend === 'declining' ? 'text-red-400' : a.liquidityTrend === 'flat' ? 'text-amber-400' : 'text-emerald-400';
                const actionColors: Record<string, string> = { sell: 'bg-red-500/10 text-red-400 border-red-500/30', swap: 'bg-violet-500/10 text-violet-400 border-violet-500/30', reduce: 'bg-amber-500/10 text-amber-400 border-amber-500/30', hold: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
                return (
                  <tr key={a.cardId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-3 text-xs text-slate-500">{i + 1}</td>
                    <td className="py-2.5 pr-3">
                      <p className="text-xs text-white font-medium">{a.player}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{a.cardName}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-slate-400 capitalize hidden sm:table-cell">{a.sport}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-300 text-right">{formatCurrency(a.purchasePrice)}</td>
                    <td className="py-2.5 pr-3 text-xs text-white font-medium text-right">{formatCurrency(a.currentValue)}</td>
                    <td className={`py-2.5 pr-3 text-xs font-medium text-right hidden md:table-cell ${change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{change.toFixed(1)}%</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-400 text-right hidden md:table-cell">{a.stagnationDays}d</td>
                    <td className={`py-2.5 pr-3 text-center text-sm font-bold ${scoreColor}`}>{a.deadMoneyScore}</td>
                    <td className={`py-2.5 pr-3 text-center text-xs font-medium capitalize hidden sm:table-cell ${liqColor}`}>{a.liquidityTrend}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${actionColors[a.suggestedAction]}`}>
                        {a.suggestedAction}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swap Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft size={16} className="text-violet-400" />
          <h3 className="text-sm font-bold text-white">Swap Recommendations</h3>
          <span className="text-[10px] text-slate-500 ml-2">Ranked by confidence</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {swaps.slice(0, 6).map(swap => (
            <SwapCard key={swap.id} swap={swap} onSimulate={() => handleSimulate(swap)} />
          ))}
        </div>
      </div>

      {/* Swap Simulator Modal */}
      {simResult && simSwap && (
        <div className="bg-slate-900 rounded-xl border border-emerald-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crosshair size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Swap Simulator: {simSwap.fromAsset.player} → {simSwap.toAsset.player}</h3>
            </div>
            <button onClick={() => { setSimResult(null); setSimSwap(null); }} className="text-slate-500 hover:text-slate-300 transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Projected Gain</p>
              <p className="text-xl font-bold text-emerald-400">+{formatCurrency(simResult.projectedGain)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Risk Score</p>
              <p className={`text-xl font-bold ${simResult.riskScore < 40 ? 'text-emerald-400' : simResult.riskScore < 65 ? 'text-amber-400' : 'text-red-400'}`}>{simResult.riskScore}/100</p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
              <p className="text-xl font-bold text-blue-400">{simSwap.confidence}%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={simResult.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [formatCurrency(v), name === 'fromValue' ? 'Current Asset' : 'Swap Target']}
              />
              <Line type="monotone" dataKey="fromValue" stroke="#f87171" strokeWidth={2} strokeDasharray="5 5" name="fromValue" dot={false} />
              <Line type="monotone" dataKey="toValue" stroke="#10b981" strokeWidth={2} name="toValue" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Asset Velocity Scatter + Catalyst Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scatter Plot */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white">Asset Velocity Map</h3>
          </div>
          <div className="flex items-center gap-3 mb-3">
            {Object.entries(QUADRANT_COLORS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-[10px] text-slate-500 capitalize">{k}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="x" name="Liquidity" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Liquidity Score', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 10 } }} />
              <YAxis type="number" dataKey="y" name="Appreciation" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Appreciation %', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [name === 'Appreciation' ? `${v.toFixed(1)}%` : v, name]}
                labelFormatter={() => ''}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine x={40} stroke="#475569" strokeDasharray="3 3" />
              <Scatter data={scatterData} name="Assets">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={QUADRANT_COLORS[entry.quadrant]} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Catalyst Timeline */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Catalyst Outlook Timeline</h3>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {catalysts.map(c => {
              const daysOut = Math.max(0, Math.round((new Date(c.catalystDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              return (
                <div key={c.id} className="flex items-start gap-3 bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <span className="text-lg font-bold text-cyan-400">{daysOut}</span>
                    <span className="text-[9px] text-slate-500 uppercase">days</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-white font-medium">{c.player}</p>
                      <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] text-cyan-400">{c.catalystType}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-1">{c.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">Impact: <span className="text-emerald-400 font-bold">+{c.expectedImpact}%</span></span>
                      <span className="text-[10px] text-slate-500">Likelihood: <span className="text-white font-bold">{c.likelihood}%</span></span>
                      <span className="text-[10px] text-slate-500">{new Date(c.catalystDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-red-400" />
          <h3 className="text-sm font-bold text-white">Dead Money Alerts</h3>
          {unreadAlerts > 0 && (
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] text-red-400 font-bold">{unreadAlerts} new</span>
          )}
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {alerts.map(a => {
            const severityStyles: Record<string, string> = {
              critical: 'border-red-500/30 bg-red-500/5',
              warning: 'border-amber-500/30 bg-amber-500/5',
              info: 'border-blue-500/30 bg-blue-500/5',
            };
            const severityIcon: Record<string, React.ReactNode> = {
              critical: <AlertTriangle size={14} className="text-red-400" />,
              warning: <AlertCircle size={14} className="text-amber-400" />,
              info: <Shield size={14} className="text-blue-400" />,
            };
            return (
              <div key={a.id} className={`flex items-start gap-3 rounded-lg p-3 border ${severityStyles[a.severity]} ${!a.read ? 'ring-1 ring-red-500/20' : ''}`}>
                <div className="flex-shrink-0 mt-0.5">{severityIcon[a.severity]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-white font-medium">{a.player}</p>
                    {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{a.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-slate-500">{a.daysStagnant} days stagnant</span>
                    <span className="text-[9px] text-slate-500">Opp cost: {formatCurrency(a.opportunityCost)}</span>
                    <span className="text-[9px] text-slate-500">{new Date(a.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeployment Strategies */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Redeployment Strategies</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {strategies.map(s => {
            const riskColors: Record<string, string> = { low: 'border-emerald-500/30 bg-emerald-500/5', medium: 'border-amber-500/30 bg-amber-500/5', high: 'border-red-500/30 bg-red-500/5' };
            const riskText: Record<string, string> = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' };
            return (
              <div key={s.id} className={`rounded-xl border p-5 ${riskColors[s.risk]}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <span className={`text-[10px] font-bold uppercase ${riskText[s.risk]}`}>{s.risk} risk</span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{s.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-slate-500">Expected Return</p>
                    <p className="text-sm font-bold text-emerald-400">+{s.expectedReturn}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Capital Freed</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(s.capitalFreed)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Timeframe</p>
                    <p className="text-xs font-medium text-slate-300">{s.timeframe}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Assets to Sell</p>
                    <p className="text-xs font-medium text-slate-300">{s.assetsToSell.length} cards</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Target Allocations</p>
                  {s.targetAllocations.map((ta, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700/50 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${ta.percentage}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400">{ta.percentage}% {ta.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {healthScore && (
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Action Items</h3>
          </div>
          <div className="space-y-2">
            {healthScore.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadMoneyDetector;
