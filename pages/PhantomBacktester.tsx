import React, { useState, useMemo, useCallback } from 'react';
import {
  Ghost,
  Play,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  DollarSign,
  Target,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Download,
  Layers,
  Search,
  BookOpen,
  Trophy,
  ArrowRightLeft,
  Loader2,
  Star,
  Crown,
  Rocket,
  X,
  Settings,
  Calendar,
  Wallet,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  runBacktest,
  getPresetStrategies,
  getSavedPortfolios,
  savePortfolio,
  deletePortfolio,
  runWhatIf,
  getPopularBacktests,
  getAvailablePlayers,
  getAvailableBenchmarks,
  comparePortfolios,
  type BacktestConfig,
  type BacktestResult,
  type PhantomPortfolio,
  type PhantomPosition,
  type PhantomStrategy,
  type WhatIfResult,
  type BenchmarkComparison,
} from '../lib/phantomBacktesterService';

// ---- Tab type ----
type TabId = 'builder' | 'presets' | 'results' | 'library' | 'leaderboard';

// ---- Metric Card Component ----
const MetricCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  positive?: boolean;
}> = ({ label, value, subValue, icon, positive }) => (
  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <div className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400">{icon}</div>
    </div>
    <p className={`text-2xl font-bebas tracking-wider ${positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {value}
    </p>
    {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
  </div>
);

// ---- Monthly Returns Heatmap ----
const MonthlyReturnsHeatmap: React.FC<{ monthlyReturns: { month: string; return: number }[] }> = ({ monthlyReturns }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Group by year
  const yearMap: Record<string, { month: number; ret: number }[]> = {};
  monthlyReturns.forEach((mr) => {
    const [y, m] = mr.month.split('-');
    if (!yearMap[y]) yearMap[y] = [];
    yearMap[y].push({ month: parseInt(m, 10) - 1, ret: mr.return });
  });

  const getColor = (ret: number): string => {
    if (ret > 8) return 'bg-emerald-500';
    if (ret > 4) return 'bg-emerald-600/80';
    if (ret > 1) return 'bg-emerald-700/60';
    if (ret > -1) return 'bg-slate-700/50';
    if (ret > -4) return 'bg-red-700/60';
    if (ret > -8) return 'bg-red-600/80';
    return 'bg-red-500';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-13 gap-1 mb-1">
          <div className="text-[10px] font-bold text-slate-500 text-center">Year</div>
          {monthNames.map((m) => (
            <div key={m} className="text-[10px] font-bold text-slate-500 text-center">{m}</div>
          ))}
        </div>

        {/* Rows */}
        {Object.entries(yearMap).map(([year, months]) => (
          <div key={year} className="grid grid-cols-13 gap-1 mb-1">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-center">{year}</div>
            {monthNames.map((_, i) => {
              const entry = months.find((m) => m.month === i);
              return (
                <div
                  key={i}
                  className={`h-8 rounded-md flex items-center justify-center text-[10px] font-bold ${entry ? getColor(entry.ret) : 'bg-slate-800/30'} ${entry ? 'text-white' : 'text-slate-600'}`}
                  title={entry ? `${entry.ret.toFixed(1)}%` : 'N/A'}
                >
                  {entry ? `${entry.ret > 0 ? '+' : ''}${entry.ret.toFixed(1)}` : '-'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Main Page ----
const PhantomBacktester: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('builder');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResult, setCurrentResult] = useState<BacktestResult | null>(null);
  const [savedList, setSavedList] = useState<PhantomPortfolio[]>(() => getSavedPortfolios());
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);
  const [whatIfMonths, setWhatIfMonths] = useState(3);
  const [showTradeLog, setShowTradeLog] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<BenchmarkComparison | null>(null);
  const [playerSearch, setPlayerSearch] = useState('');

  const presets = useMemo(() => getPresetStrategies(), []);
  const players = useMemo(() => getAvailablePlayers(), []);
  const benchmarks = useMemo(() => getAvailableBenchmarks(), []);
  const popular = useMemo(() => getPopularBacktests(), []);

  // Config state
  const [config, setConfig] = useState<BacktestConfig>({
    startDate: '2020-01-01',
    endDate: '2024-12-01',
    initialCapital: 25000,
    positions: [],
    rebalanceFrequency: 'quarterly',
    transactionCostPct: 2.5,
    gradingFees: 100,
    holdingCosts: 30,
    benchmark: 'sp500',
  });

  const filteredPlayers = useMemo(
    () => players.filter((p) => p.toLowerCase().includes(playerSearch.toLowerCase())),
    [players, playerSearch],
  );

  const addPosition = useCallback((player: string) => {
    setConfig((prev) => {
      if (prev.positions.find((p) => p.player === player)) return prev;
      return {
        ...prev,
        positions: [...prev.positions, { player, year: 2020, set: 'Panini Prizm', quantity: 1, grade: 'PSA 10' }],
      };
    });
    setPlayerSearch('');
  }, []);

  const removePosition = useCallback((player: string) => {
    setConfig((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.player !== player),
    }));
  }, []);

  const updatePosition = useCallback((player: string, updates: Partial<PhantomPosition>) => {
    setConfig((prev) => ({
      ...prev,
      positions: prev.positions.map((p) => (p.player === player ? { ...p, ...updates } : p)),
    }));
  }, []);

  const handleRunBacktest = useCallback(async () => {
    if (config.positions.length === 0) return;
    setIsRunning(true);
    setProgress(0);
    setCurrentResult(null);
    setActiveTab('results');

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 92));
    }, 200);

    try {
      const result = await runBacktest(config);
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentResult(result);

      const portfolio: PhantomPortfolio = {
        id: 'pb-' + Math.random().toString(36).slice(2, 11),
        name: `Backtest ${new Date().toLocaleDateString()}`,
        config,
        result,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
      savePortfolio(portfolio);
      setSavedList(getSavedPortfolios());
    } catch {
      clearInterval(progressInterval);
    } finally {
      setIsRunning(false);
    }
  }, [config]);

  const handleLoadPreset = useCallback((strategy: PhantomStrategy) => {
    setConfig(strategy.config);
    setActiveTab('builder');
  }, []);

  const handleDeletePortfolio = useCallback((id: string) => {
    deletePortfolio(id);
    setSavedList(getSavedPortfolios());
  }, []);

  const handleWhatIf = useCallback(async (portfolioId: string) => {
    const result = await runWhatIf(portfolioId, { sellMonthsEarlier: whatIfMonths });
    setWhatIfResult(result);
  }, [whatIfMonths]);

  const handleCompare = useCallback(() => {
    if (comparisonIds.length >= 2) {
      const data = comparePortfolios(comparisonIds);
      setComparisonData(data);
    }
  }, [comparisonIds]);

  const toggleComparison = useCallback((id: string) => {
    setComparisonIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  }, []);

  // ---- Drawdown data from timeline ----
  const drawdownData = useMemo(() => {
    if (!currentResult) return [];
    let peak = currentResult.timeline[0]?.value || 0;
    return currentResult.timeline.map((point) => {
      if (point.value > peak) peak = point.value;
      const drawdown = peak > 0 ? -((peak - point.value) / peak) * 100 : 0;
      return { date: point.date, drawdown: Math.round(drawdown * 100) / 100 };
    });
  }, [currentResult]);

  // ---- Tabs ----
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'builder', label: 'Builder', icon: <Settings size={16} /> },
    { id: 'presets', label: 'Strategies', icon: <BookOpen size={16} /> },
    { id: 'results', label: 'Results', icon: <BarChart3 size={16} /> },
    { id: 'library', label: 'Library', icon: <Layers size={16} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
  ];

  const iconForCategory = (cat: string) => {
    switch (cat) {
      case 'nfl': return <Zap size={18} className="text-orange-400" />;
      case 'nba': return <Target size={18} className="text-blue-400" />;
      case 'mlb': return <Star size={18} className="text-yellow-400" />;
      case 'vintage': return <Crown size={18} className="text-amber-400" />;
      case 'modern': return <Rocket size={18} className="text-purple-400" />;
      default: return <Ghost size={18} className="text-brand-lime" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
            <Ghost size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                <Ghost size={10} />
                Industry First
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bebas tracking-widest text-white leading-tight">
              Phantom <span className="text-brand-lime">Backtester</span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Build hypothetical portfolios from any point in history</p>
          </div>
        </div>

        {currentResult && (
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${currentResult.totalReturn >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {currentResult.totalReturn >= 0 ? '+' : ''}{currentResult.totalReturn.toFixed(1)}% Total Return
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- BUILDER TAB ---- */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Capital */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                <Calendar size={18} className="text-brand-lime" />
                Backtest Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Initial Capital</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      value={config.initialCapital}
                      onChange={(e) => setConfig((prev) => ({ ...prev, initialCapital: Number(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Benchmark</label>
                  <select
                    value={config.benchmark}
                    onChange={(e) => setConfig((prev) => ({ ...prev, benchmark: e.target.value as BacktestConfig['benchmark'] }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  >
                    {benchmarks.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Rebalance</label>
                  <select
                    value={config.rebalanceFrequency}
                    onChange={(e) => setConfig((prev) => ({ ...prev, rebalanceFrequency: e.target.value as BacktestConfig['rebalanceFrequency'] }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Transaction Cost %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.transactionCostPct}
                    onChange={(e) => setConfig((prev) => ({ ...prev, transactionCostPct: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Grading Fees ($)</label>
                  <input
                    type="number"
                    value={config.gradingFees}
                    onChange={(e) => setConfig((prev) => ({ ...prev, gradingFees: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Positions */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                <Layers size={18} className="text-brand-lime" />
                Portfolio Positions
                <span className="text-xs text-slate-500 font-sans font-normal ml-2">({config.positions.length} cards)</span>
              </h3>

              {/* Player Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search players to add..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                />
                {playerSearch && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-slate-900 border border-slate-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {filteredPlayers.map((p) => (
                      <button
                        key={p}
                        onClick={() => addPosition(p)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-brand-lime transition-colors flex items-center gap-2"
                      >
                        <Plus size={14} />
                        {p}
                      </button>
                    ))}
                    {filteredPlayers.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">No players found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Position List */}
              {config.positions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Ghost size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No positions yet</p>
                  <p className="text-xs mt-1">Search for players above or load a preset strategy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.positions.map((pos) => (
                    <div
                      key={pos.player}
                      className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{pos.player}</p>
                        <p className="text-xs text-slate-500">{pos.year} {pos.set}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div>
                          <label className="text-[8px] uppercase tracking-widest text-slate-500 block">Qty</label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={pos.quantity}
                            onChange={(e) => updatePosition(pos.player, { quantity: Number(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:border-brand-lime focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-widest text-slate-500 block">Grade</label>
                          <select
                            value={pos.grade}
                            onChange={(e) => updatePosition(pos.player, { grade: e.target.value })}
                            className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:border-brand-lime focus:outline-none"
                          >
                            <option>PSA 10</option>
                            <option>PSA 9</option>
                            <option>BGS 9.5</option>
                            <option>BGS 10</option>
                            <option>SGC 10</option>
                            <option>Raw</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-widest text-slate-500 block">Year</label>
                          <input
                            type="number"
                            min={1980}
                            max={2025}
                            value={pos.year}
                            onChange={(e) => updatePosition(pos.player, { year: Number(e.target.value) })}
                            className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:border-brand-lime focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => removePosition(pos.player)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all mt-3 sm:mt-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary & Run */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                <Wallet size={18} className="text-brand-lime" />
                Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Capital</span>
                  <span className="text-white font-bold">${config.initialCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Positions</span>
                  <span className="text-white font-bold">{config.positions.length} cards</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Qty</span>
                  <span className="text-white font-bold">{config.positions.reduce((s, p) => s + p.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Period</span>
                  <span className="text-white font-bold">{config.startDate.slice(0, 4)}-{config.endDate.slice(0, 4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Est. Fees</span>
                  <span className="text-white font-bold">${config.gradingFees + config.holdingCosts}</span>
                </div>

                <div className="border-t border-slate-700/50 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Benchmark</span>
                    <span className="text-brand-lime font-bold">
                      {benchmarks.find((b) => b.id === config.benchmark)?.name || config.benchmark}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRunBacktest}
                disabled={isRunning || config.positions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-brand-lime text-slate-900 hover:bg-brand-lime/90"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Running Backtest...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Phantom Backtest
                  </>
                )}
              </button>

              {isRunning && (
                <div className="space-y-1">
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-lime rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">{Math.round(progress)}% - Simulating trades...</p>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                <Zap size={18} className="text-brand-lime" />
                Quick Load
              </h3>
              <div className="space-y-2">
                {presets.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleLoadPreset(s)}
                    className="w-full text-left bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 hover:border-brand-lime/30 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      {iconForCategory(s.category)}
                      <span className="text-sm font-bold text-white group-hover:text-brand-lime transition-colors">{s.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- PRESETS TAB ---- */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4 hover:border-brand-lime/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-700/50 rounded-xl">
                    {iconForCategory(strategy.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-lime transition-colors">{strategy.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{strategy.category}</p>
                  </div>
                </div>
                {strategy.expectedReturn && (
                  <div className="text-right">
                    <p className="text-lg font-bebas tracking-wider text-emerald-400">+{strategy.expectedReturn}%</p>
                    <p className="text-[10px] text-slate-500">Expected</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">{strategy.description}</p>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Capital</span>
                  <span className="text-white font-bold">${strategy.config.initialCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Period</span>
                  <span className="text-white font-bold">{strategy.config.startDate.slice(0, 4)}-{strategy.config.endDate.slice(0, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Positions</span>
                  <span className="text-white font-bold">{strategy.config.positions.length} cards</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {strategy.config.positions.map((pos) => (
                  <span key={pos.player} className="px-2 py-0.5 bg-slate-700/50 rounded-full text-[10px] font-bold text-slate-300">
                    {pos.player}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleLoadPreset(strategy)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-brand-lime/10 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/20 transition-all"
              >
                <Play size={14} />
                Load Strategy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---- RESULTS TAB ---- */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {isRunning && !currentResult && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center space-y-4">
              <div className="relative inline-flex">
                <Ghost size={48} className="text-brand-lime animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-lime rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-bebas tracking-widest text-white">Running Phantom Backtest</h3>
              <p className="text-sm text-slate-400">Simulating historical trades with real pricing data...</p>
              <div className="max-w-sm mx-auto">
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-lime to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
            </div>
          )}

          {!currentResult && !isRunning && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center space-y-4">
              <Ghost size={48} className="mx-auto text-slate-600" />
              <h3 className="text-xl font-bebas tracking-widest text-white">No Results Yet</h3>
              <p className="text-sm text-slate-400">Build a portfolio and run a backtest to see results here.</p>
              <button
                onClick={() => setActiveTab('builder')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-lime/10 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/20 transition-all"
              >
                <Plus size={16} />
                Go to Builder
              </button>
            </div>
          )}

          {currentResult && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Return"
                  value={`${currentResult.totalReturn >= 0 ? '+' : ''}${currentResult.totalReturn.toFixed(1)}%`}
                  subValue={`$${currentResult.config.initialCapital.toLocaleString()} -> $${Math.round(currentResult.finalValue).toLocaleString()}`}
                  icon={<TrendingUp size={16} />}
                  positive={currentResult.totalReturn >= 0}
                />
                <MetricCard
                  label="Sharpe Ratio"
                  value={currentResult.sharpeRatio.toFixed(2)}
                  subValue="Risk-adjusted return"
                  icon={<Shield size={16} />}
                  positive={currentResult.sharpeRatio > 1}
                />
                <MetricCard
                  label="Max Drawdown"
                  value={`-${currentResult.maxDrawdown.toFixed(1)}%`}
                  subValue="Peak to trough"
                  icon={<TrendingDown size={16} />}
                  positive={currentResult.maxDrawdown < 15}
                />
                <MetricCard
                  label="Alpha"
                  value={`${currentResult.alpha >= 0 ? '+' : ''}${currentResult.alpha.toFixed(1)}%`}
                  subValue={`vs ${currentResult.config.benchmark}`}
                  icon={<Target size={16} />}
                  positive={currentResult.alpha > 0}
                />
              </div>

              {/* Equity Curve */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                    <Activity size={18} className="text-brand-lime" />
                    Equity Curve vs Benchmark
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-lime rounded" /> Portfolio</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-500 rounded" /> Benchmark</span>
                  </div>
                </div>
                <div className="h-72 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentResult.timeline}>
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#a3e635" strokeWidth={2} fill="url(#portfolioGrad)" name="Portfolio" />
                      <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Benchmark" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Drawdown Chart */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                  <TrendingDown size={18} className="text-red-400" />
                  Underwater Plot (Drawdown)
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={drawdownData}>
                      <defs>
                        <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                      />
                      <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#drawdownGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Returns Heatmap */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                  <Calendar size={18} className="text-brand-lime" />
                  Monthly Returns Heatmap
                </h3>
                <MonthlyReturnsHeatmap monthlyReturns={currentResult.monthlyReturns} />
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <MetricCard
                  label="Annualized"
                  value={`${currentResult.annualizedReturn.toFixed(1)}%`}
                  icon={<BarChart3 size={14} />}
                  positive={currentResult.annualizedReturn > 0}
                />
                <MetricCard
                  label="Volatility"
                  value={`${currentResult.volatility.toFixed(1)}%`}
                  icon={<Activity size={14} />}
                />
                <MetricCard
                  label="Win Rate"
                  value={`${currentResult.winRate.toFixed(0)}%`}
                  icon={<Target size={14} />}
                  positive={currentResult.winRate > 50}
                />
                <MetricCard
                  label="Beta"
                  value={currentResult.beta.toFixed(2)}
                  icon={<ArrowRightLeft size={14} />}
                />
                <MetricCard
                  label="Hold Period"
                  value={`${currentResult.avgHoldPeriod}mo`}
                  icon={<Clock size={14} />}
                />
                <MetricCard
                  label="Benchmark"
                  value={`${currentResult.benchmarkReturn.toFixed(1)}%`}
                  icon={<BarChart3 size={14} />}
                  positive={currentResult.totalReturn > currentResult.benchmarkReturn}
                />
              </div>

              {/* Trade Log */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <button
                  onClick={() => setShowTradeLog(!showTradeLog)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-lime" />
                    Trade Log ({currentResult.trades.length} trades)
                  </h3>
                  {showTradeLog ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {showTradeLog && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-700/50">
                          <th className="text-left py-2 pr-4">Date</th>
                          <th className="text-left py-2 pr-4">Player</th>
                          <th className="text-left py-2 pr-4">Action</th>
                          <th className="text-right py-2 pr-4">Qty</th>
                          <th className="text-right py-2 pr-4">Price</th>
                          <th className="text-right py-2 pr-4">Fees</th>
                          <th className="text-right py-2">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResult.trades.map((trade) => (
                          <tr key={trade.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                            <td className="py-2.5 pr-4 text-slate-400">{trade.date}</td>
                            <td className="py-2.5 pr-4 text-white font-medium">{trade.player}</td>
                            <td className="py-2.5 pr-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${trade.action === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : trade.action === 'sell' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {trade.action}
                              </span>
                            </td>
                            <td className="py-2.5 pr-4 text-right text-white">{trade.quantity}</td>
                            <td className="py-2.5 pr-4 text-right text-white">${trade.price.toLocaleString()}</td>
                            <td className="py-2.5 pr-4 text-right text-slate-400">${trade.fees.toFixed(0)}</td>
                            <td className={`py-2.5 text-right font-bold ${trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                              {trade.pnl !== 0 ? `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* What-If Modifier */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                  <Ghost size={18} className="text-purple-400" />
                  What-If Modifier
                </h3>
                <p className="text-sm text-slate-400">What if you had sold earlier?</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-slate-300">Sell</span>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={whatIfMonths}
                    onChange={(e) => setWhatIfMonths(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white text-center focus:border-brand-lime focus:outline-none"
                  />
                  <span className="text-sm text-slate-300">months earlier</span>
                  <button
                    onClick={() => {
                      const latest = savedList.find((p) => p.status === 'completed' && p.result);
                      if (latest) handleWhatIf(latest.id);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                  >
                    Run What-If
                  </button>
                </div>

                {whatIfResult && (
                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 space-y-2 mt-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Original:</span>{' '}
                        <span className="text-white font-bold">{whatIfResult.originalReturn.toFixed(1)}%</span>
                      </div>
                      <ArrowRightLeft size={16} className="text-slate-600" />
                      <div>
                        <span className="text-slate-500">Modified:</span>{' '}
                        <span className={`font-bold ${whatIfResult.modifiedReturn > whatIfResult.originalReturn ? 'text-emerald-400' : 'text-red-400'}`}>
                          {whatIfResult.modifiedReturn.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className={`text-sm font-bold ${whatIfResult.difference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({whatIfResult.difference > 0 ? '+' : ''}{whatIfResult.difference.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{whatIfResult.explanation}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- LIBRARY TAB ---- */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Comparison Tool */}
          {comparisonIds.length >= 2 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCompare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-brand-lime/10 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/20 transition-all"
              >
                <ArrowRightLeft size={16} />
                Compare {comparisonIds.length} Portfolios
              </button>
              <button
                onClick={() => { setComparisonIds([]); setComparisonData(null); }}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Comparison Chart */}
          {comparisonData && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-brand-lime" />
                  Portfolio Comparison
                </h3>
                <button onClick={() => setComparisonData(null)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {comparisonData.portfolioNames.map((name, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-3 space-y-1">
                    <p className="text-xs text-slate-500 truncate">{name}</p>
                    <p className={`text-lg font-bebas tracking-wider ${comparisonData.returns[i] >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {comparisonData.returns[i] >= 0 ? '+' : ''}{comparisonData.returns[i].toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Portfolios */}
          {savedList.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center space-y-4">
              <Layers size={48} className="mx-auto text-slate-600" />
              <h3 className="text-xl font-bebas tracking-widest text-white">No Saved Portfolios</h3>
              <p className="text-sm text-slate-400">Run a backtest to save it to your library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedList.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className={`bg-slate-800/60 border rounded-2xl p-5 space-y-3 transition-all ${comparisonIds.includes(portfolio.id) ? 'border-brand-lime/50' : 'border-slate-700/50 hover:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{portfolio.name}</h4>
                      <p className="text-[10px] text-slate-500">{new Date(portfolio.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleComparison(portfolio.id)}
                        className={`p-1.5 rounded-lg transition-all ${comparisonIds.includes(portfolio.id) ? 'bg-brand-lime/20 text-brand-lime' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                        title="Toggle comparison"
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {portfolio.config.positions.slice(0, 3).map((pos) => (
                      <span key={pos.player} className="px-2 py-0.5 bg-slate-700/50 rounded-full text-[10px] font-bold text-slate-300">
                        {pos.player}
                      </span>
                    ))}
                    {portfolio.config.positions.length > 3 && (
                      <span className="text-[10px] text-slate-500">+{portfolio.config.positions.length - 3} more</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">${portfolio.config.initialCapital.toLocaleString()} capital</span>
                    <span className={`font-bold ${portfolio.status === 'completed' ? 'text-emerald-400' : portfolio.status === 'running' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {portfolio.status === 'completed' ? 'Completed' : portfolio.status === 'running' ? 'Running...' : 'Failed'}
                    </span>
                  </div>

                  {portfolio.result && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/30">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500">Return</p>
                        <p className={`text-sm font-bold ${portfolio.result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {portfolio.result.totalReturn >= 0 ? '+' : ''}{portfolio.result.totalReturn.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500">Sharpe</p>
                        <p className="text-sm font-bold text-white">{portfolio.result.sharpeRatio.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- LEADERBOARD TAB ---- */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Community Phantom Backtests
            </h3>
            <p className="text-sm text-slate-400">Top performing hypothetical portfolios from the community.</p>

            <div className="space-y-3">
              {[
                { rank: 1, name: 'Wemby All-In YOLO', player: 'Victor Wembanyama', return: 2315, sharpe: 3.82, user: 'CardShark_Mike', badge: 'gold' },
                { rank: 2, name: 'Edwards Early Bird', player: 'Anthony Edwards', return: 1455, sharpe: 2.95, user: 'SportsGuru_22', badge: 'silver' },
                { rank: 3, name: 'Ohtani Unicorn', player: 'Shohei Ohtani', return: 978, sharpe: 2.68, user: 'BaseballBets', badge: 'bronze' },
                { rank: 4, name: 'Mahomes Dynasty', player: 'Patrick Mahomes', return: 405, sharpe: 2.12, user: 'GridironKing', badge: '' },
                { rank: 5, name: 'Burrow Bounce', player: 'Joe Burrow', return: 378, sharpe: 1.95, user: 'CincyCollector', badge: '' },
                { rank: 6, name: 'NBA 2020 Basket', player: 'LaMelo Ball', return: 325, sharpe: 1.82, user: 'HoopsInvestor', badge: '' },
                { rank: 7, name: 'Soto Slugger', player: 'Juan Soto', return: 272, sharpe: 1.68, user: 'DiamondDealer', badge: '' },
                { rank: 8, name: 'Vintage MJ Play', player: 'Michael Jordan', return: 148, sharpe: 1.45, user: 'RetroCards90', badge: '' },
              ].map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${entry.rank <= 3 ? 'bg-slate-900/70 border border-slate-700/50' : 'bg-slate-800/30'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${entry.badge === 'gold' ? 'bg-yellow-500/20 text-yellow-400' : entry.badge === 'silver' ? 'bg-slate-400/20 text-slate-300' : entry.badge === 'bronze' ? 'bg-amber-600/20 text-amber-500' : 'bg-slate-700/50 text-slate-500'}`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{entry.name}</p>
                    <p className="text-xs text-slate-500">by {entry.user} - {entry.player}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bebas tracking-wider text-emerald-400">+{entry.return.toLocaleString()}%</p>
                    <p className="text-[10px] text-slate-500">Sharpe {entry.sharpe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Presets */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bebas tracking-widest text-white flex items-center gap-2">
              <Star size={18} className="text-brand-lime" />
              Popular Starting Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {popular.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setConfig(p.config); setActiveTab('builder'); }}
                  className="text-left bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-brand-lime/30 transition-all"
                >
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.config.positions.length} positions - ${p.config.initialCapital.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhantomBacktester;
